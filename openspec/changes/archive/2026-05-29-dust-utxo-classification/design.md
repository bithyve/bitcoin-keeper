## Context

Keeper already stores UTXOs as embedded objects in `WalletSpecs.confirmedUTXOs` / `unconfirmedUTXOs` (same schema shared by `VaultSpecs`). Labels/tags live in a separate top-level `Tags` Realm schema (BIP329). Wallet sync runs via `WalletOperations.syncWalletsViaElectrumClient` and is orchestrated by `refreshWalletsWorker` in `src/store/sagas/wallets.ts`. That saga already has access to the full post-sync wallet state (including `transactions[]` and `addresses`) before writing to Realm — exactly where classification belongs.

## Goals / Non-Goals

**Goals:**
- Persist a `spendability` state on every UTXO for both wallets and vaults
- Automatically classify UTXOs on every `refreshWalletsWorker` call (not just hard refresh)
- Preserve manual overrides across refreshes (including hard refresh)
- Show a one-time toast when newly detected dust arrives during a user-initiated refresh
- Surface Do Not Spend state across six existing UI touch points with no new screens

**Non-Goals:**
- Restricting dust UTXOs from being selected in send flow (separate issue)
- BIP329 export of spendability state
- Any Electrum or backend network call specific to dust detection
- Separate dashboard or global upgrade script

## Decisions

### D1 — Embed spendability directly on UTXO (not a separate Realm schema)

**Decision**: Add two fields to the existing embedded `UTXOSchema`:
```
spendability:     'string?'   // null = unclassified | 'spendable' | 'doNotSpend'
isManualOverride: 'bool'      // default false; true = do not re-classify automatically
```

**Rationale**: A separate top-level `UTXOSpendabilityState` schema would require a join at every display site and explicit pruning when UTXOs are spent. Embedding the state means it lives and dies with the UTXO — a spent UTXO is simply removed from `confirmedUTXOs`, taking its state with it. No cleanup needed. Querying for "does this wallet have a Do Not Spend UTXO?" is a simple in-memory filter on `wallet.specs.confirmedUTXOs`.

**Trade-off**: Adding fields to an embedded schema still requires a Realm schema version bump (106 → 107). Both new fields are nullable/defaulted, so the migration is additive — no data transform required.

**Alternatives considered**: Separate top-level schema (rejected — join complexity + stale state cleanup), Tags-based approach (rejected — Tags are BIP329 labels, semantically wrong for spendability, hard to query).

---

### D2 — Pre-sync spendability snapshot to survive hard refresh

**Decision**: In `refreshWalletsWorker`, before calling `syncWalletsViaElectrumClient`, build a `Map<txId:vout, {spendability, isManualOverride}>` from the wallet objects already in the `payload.wallets` array (which are the pre-sync Realm objects). After sync returns, iterate the new UTXO set and:
- If UTXO is in the map → restore its state (preserve both manual and auto states)
- If UTXO is not in the map → classify it fresh (it's genuinely new)

**Rationale**: On hard refresh, `syncWalletsViaElectrumClient` starts `confirmedUTXOs = []`, so all embedded spendability is lost before the saga ever sees the synced wallet. The saga already holds the pre-sync wallet in `payload.wallets`, making the snapshot cost-free.

On normal refresh, UTXOs are copied as `[...wallet.specs.confirmedUTXOs]` at the start of the sync function, so existing fields survive. The snapshot still ensures correctness for edge cases (e.g., a UTXO that was unconfirmed is now confirmed and rebuilt).

---

### D3 — `nextFreeAddressIndex - 1` as `highestReceivedReceiveAddressIndex`

**Decision**: No separate caching of address receive history. For the out-of-order check, use `preSyncNextFreeAddressIndex - 1` (captured from the pre-sync wallet before the sync call).

**Rationale**: `wallet.specs.nextFreeAddressIndex` equals `lastUsedAddressIndex + 1` by construction in `fetchTransactions`. External addresses are receive-only in BIP44/84, so "last used" = "highest that has received". Using the **pre-sync** value avoids false positives when multiple fresh addresses receive funds in the same sync batch (see explore session reasoning).

For `hasReceivedBefore`, use post-sync `synchedWallet.specs.transactions` so the full history including the current sync is visible. A count > 1 on a single address correctly identifies address reuse.

---

### D4 — Pure classification utility; sagas own all DB interaction

**Decision**: `src/services/wallets/operations/dustClassification.ts` is a pure function module:
```typescript
classifyDustUTXO(
  utxo: UTXO,
  synchedWallet: Wallet | Vault,
  preSyncNextFreeAddressIndex: number
): 'spendable' | 'doNotSpend'
```
It reads only from its arguments (UTXO value, address cache, transaction history). No Realm, no Redux, no side effects.

All Realm writes (restoring snapshot, writing classification results, manual override) are done exclusively in `refreshWalletsWorker` and the new `markUTXOSpendabilityWorker` via `dbManager` — following the established saga pattern for all DB interaction.

---

### D5 — Toast via transient Redux state + HomeWallet `useEffect`

**Decision**: Add `pendingDustToast: string | null` (walletId) to the `utxos` Redux slice (blacklisted from persist). When `refreshWalletsWorker` detects new dust and `options.addNotifications === true`, it dispatches `setPendingDustToast(walletId)`. `HomeWallet` watches this in a `useEffect`, calls `showToast('Potential dust payment found')`, then dispatches `clearDustToast()`.

**Rationale**: `showToast` is a UI hook — sagas cannot call it directly. The `addNotifications` guard already ensures this only fires on user-initiated refreshes (login auto-sync passes `addNotifications: true`; background-only syncs pass `false`). The `HomeWallet` component is always mounted when the user is on the home screen (immediately after refresh), making it the natural consumer.

**Alternatives considered**: UAI stack (rejected — too persistent, UAI is for actionable notifications in the bell; dust toast is ephemeral), saga channel (rejected — over-engineered for one use case).

---

### D6 — `MARK_UTXO_SPENDABILITY` follows the existing wallet mutation pattern

**Decision**: Manual override uses the same pattern as `removeConsumedUTXOs`: fetch the wallet/vault from Realm, find the target UTXO by `txId + vout` in `confirmedUTXOs` / `unconfirmedUTXOs`, set `spendability` and `isManualOverride`, then write the full updated `specs` back via `dbManager.updateObjectById`.

**Rationale**: Realm embedded objects cannot be mutated independently — you must go through the parent. This pattern is already established across the codebase. No new DB access pattern is needed.

---

## Data Flow

### Classification during wallet refresh

```
refreshWalletsWorker(payload: { wallets, options })
│
├─ 1. Capture preSyncSnapshot per wallet:
│        Map<"txId:vout" → {spendability, isManualOverride}>
│        from payload.wallets[i].specs.{confirmed,unconfirmed}UTXOs
│
├─ 2. syncWalletsViaElectrumClient(wallets, network, hardRefresh)
│        → synchedWallets: [{ synchedWallet, newUTXOs }]
│
├─ 3. For each synchedWallet:
│     a. For each UTXO in confirmedUTXOs + unconfirmedUTXOs:
│          if key in preSyncSnapshot → restore {spendability, isManualOverride}
│          else → classifyDustUTXO(utxo, synchedWallet, preSyncNFAI)
│                 set spendability + isManualOverride = false
│                 if doNotSpend → add to newDustList
│
│     b. if options.addNotifications && newDustList.length > 0:
│          yield put(setPendingDustToast(synchedWallet.id))
│
│     c. yield call(dbManager.updateObjectById, schema, id, { specs })
│
└─ HomeWallet useEffect: pendingDustToast !== null → showToast → clearDustToast
```

### Manual override

```
UTXOLabeling screen
│  "Mark Do Not Spend" / "Mark Spendable" button press
│
└─ dispatch(markUTXOSpendability({ wallet, txId, vout, spendability, isManualOverride: true }))
   │
   └─ markUTXOSpendabilityWorker (saga)
        fetch wallet from Realm
        find UTXO in specs.confirmedUTXOs / unconfirmedUTXOs (match txId + vout)
        set utxo.spendability = payload.spendability
        set utxo.isManualOverride = true
        dbManager.updateObjectById(schema, wallet.id, { specs: wallet.specs })
```

## Affected Files

| Layer | File | Change |
|-------|------|--------|
| Storage | `src/storage/realm/schema/wallet.ts` | Add `spendability`, `isManualOverride` to `UTXOSchema` |
| Storage | `src/storage/realm/realm.ts` | Bump `schemaVersion` 106 → 107 |
| Storage | `src/storage/realm/migrations.ts` | Add migration guard for v107 (no-op, additive fields) |
| Storage | `src/storage/realm/enum.ts` | No change needed (UTXOSchema enum value unchanged) |
| Interface | `src/services/wallets/interfaces/index.ts` | Add `spendability?` and `isManualOverride?` to `UTXO` / `InputUTXOs` interfaces |
| Business Logic | `src/services/wallets/operations/dustClassification.ts` | **New** — pure `classifyDustUTXO` function |
| Saga | `src/store/sagas/wallets.ts` | Inject snapshot + classify step in `refreshWalletsWorker` |
| Saga | `src/store/sagas/utxos.ts` | Add `markUTXOSpendabilityWorker` + watcher |
| Reducer | `src/store/reducers/utxos.ts` | Add `pendingDustToast`, `setPendingDustToast`, `clearDustToast` |
| Saga Actions | `src/store/sagaActions/utxos.ts` | Add `MARK_UTXO_SPENDABILITY` action creator |
| Hook | `src/hooks/useUTXOSpendability.ts` | **New** — `useUTXOSpendability(wallet)` returns `hasDoNotSpendUTXOs`, `getSpendability(txId, vout)` |
| UI | `src/screens/Home/components/Wallet/WalletCard.tsx` | Add `showDot` prop |
| UI | `src/screens/Home/components/Wallet/HomeWallet.tsx` | Pass dust dot; `useEffect` for `pendingDustToast` toast |
| UI | `src/screens/WalletDetails/WalletDetails.tsx` | "Includes Do Not Spend coins" line (conditional) |
| UI | `src/screens/WalletDetails/components/DetailCards.tsx` | `showDot` on View All Coins card |
| UI | `src/components/UTXOsComponents/UTXOList.tsx` | Inject Do Not Spend chip via `useUTXOSpendability` |
| UI | `src/screens/UTXOManagement/UTXOLabeling.tsx` | Mark Do Not Spend / Mark Spendable CTA + reason display |

## Risks / Trade-offs

**[Risk] Transaction history may not include all addresses on import/restore** → Mitigation: Classification runs after every wallet sync. On first sync post-import, `wallet.specs.transactions` will be fully populated by `syncWalletsViaElectrumClient` before classification runs. Any UTXO that can't be matched in the address cache is classified as `'spendable'` (safe default).

**[Risk] Reverse address lookup (address → index) is O(n) over address cache on each UTXO** → Mitigation: Address caches are small (typically < 200 entries per wallet). The total cost is O(UTXOs × cache_size), which is negligible on a mobile device. No caching of the reverse map is needed at this scale.

**[Risk] Normal refresh carries stale spendability for existing UTXOs (doesn't re-classify)** → This is intentional per spec. Once classified, the state is stable. Re-classifying on every refresh would be surprising for users who manually override. New UTXOs always get classified.

**[Risk] `pendingDustToast` fires after every login auto-sync if the user has existing dust** → Mitigation: The toast only fires for UTXOs not present in the pre-sync snapshot (genuinely new). Existing dust UTXOs will be in the snapshot and restored, never hitting the "new" path.

## Migration Plan

1. Bump `RealmDatabase.schemaVersion` from 106 to 107 in `src/storage/realm/realm.ts`
2. Add a guard in `src/storage/realm/migrations.ts`: `if (oldRealm.schemaVersion < 107) { /* no-op: spendability and isManualOverride are nullable/defaulted */ }`
3. On app update, existing UTXOs will have `spendability = null` and `isManualOverride = false` (Realm defaults for nullable string and bool). They will be classified on the next wallet refresh automatically — no migration script needed.

## Open Questions

None — all major decisions resolved during explore session.
