## Context

The `dust-utxo-classification` change established the foundation: `spendability` and `isManualOverride` on each UTXO, the `classifyDustUTXO` pure function, the pre-sync snapshot (D2), and the `refreshWalletsWorker` integration. This change extends that foundation in two ways:

1. **Widening the initial taint surface**: A tainted address marks _all_ its UTXOs Do Not Spend, not just the sub-5,000-sat trigger. Detection uses per-output values stored on Transaction objects (not the current UTXO set), so historical dust — already spent before Keeper could mark it — is correctly identified.

2. **Propagating taint forward**: Once an address is tainted, any wallet-owned output address of a spending transaction from that address also becomes tainted. This traces wallet clustering risk across any number of hops using data already stored in `wallet.specs.transactions`.

The existing `classifyDustUTXO(utxo, wallet, preSyncNFAI)` function is replaced by a wallet-scoped `classifyDustByAddress(wallet, preSyncNFAI)` that returns the full tainted-address set in one pass, which the saga then uses to mark all UTXOs. The BFS propagation respects manual overrides: any address where any UTXO has `isManualOverride: true` in the pre-sync snapshot is **excluded from the BFS frontier** — the chain is broken there and its descendants are not tainted.

## Goals / Non-Goals

**Goals:**
- Correctly identify historically dusted addresses even when the dust UTXO is long spent
- Mark all UTXOs at a tainted address as Do Not Spend (not just the triggering sub-threshold UTXO)
- Propagate address taint forward through the spending graph using existing transaction data (dust scan only)
- Label spending-from-tainted-address transactions as "Potential dust spend" in history (dust scan only)
- Backfill `walletOutputs` for pre-existing transactions on dust scan
- Preserve the manual override (`isManualOverride: true`) invariant across all scan modes
- Keep normal and hard refresh fast by skipping BFS propagation; reserve full graph traversal for explicit dust scan
- Perform all classification in-memory, within the existing `refreshWalletsWorker` pass

**Non-Goals:**
- Re-architecting the spendability schema on UTXO (D1 from `dust-utxo-classification` is unchanged)
- Changes to the send flow or coin selection (owned by `dust-spend-restrictions`)
- Dust donation flow
- Separate Electrum queries per-scan for already-classified transactions
- Storing the complete transaction graph for arbitrary future graph queries

## Decisions

### D1 — Add `walletOutputs` to `TransactionSchema` (minimal field, per-wallet-output values)

**Decision**: Add one new optional field to the embedded `TransactionSchema`:
```
walletOutputs: 'mixed?'   // Array<{address: string, valueSats: number}> | undefined
```
Populated inside `WalletOperations.transformElectrumTxToTx` during the existing `tx.vout` loop — wallet-owned outputs already being identified there for the `amount` calculation. No extra Electrum calls.

**Rationale**: Without per-output values on Transaction, the initial taint step has no way to know how much was received at a specific address in a historical (now-spent) transaction. Storing the full raw `vout` array would be large and contains external-address data that is irrelevant. Storing only wallet-owned outputs is minimal (~10–40 bytes per transaction for typical wallets).

**Alternatives considered**: (a) Re-fetch raw tx from Electrum on every scan — rejected; adds network dependency to the classification pass and is expensive for wallets with large history. (b) Store full `inputs` array (vin) — rejected; much larger, only needed for the old outpoint-level approach, not the address-taint model. (c) Store a boolean `hasDustReceive` per transaction — rejected; loses the per-address granularity needed to identify which address was triggered, preventing multi-address transactions from being handled correctly.

**Schema version**: 107 → 108.

---

### D2 — Replace `classifyDustUTXO` with `classifyDustByAddress` (wallet-scoped, three-phase)

**Decision**: Replace the per-UTXO `classifyDustUTXO(utxo, wallet, preSyncNFAI): 'spendable' | 'doNotSpend'` function with a wallet-scoped function:
```typescript
classifyDustByAddress(
  wallet: Wallet | Vault,
  externalAddresses: Record<string, number>,
  internalAddresses: Record<string, number>,
  manualOverrideAddresses: Set<string>,
  scanMode: 'current' | 'full'  // 'current' = soft/hard refresh; 'full' = dust scan
): {
  taintedAddresses: Set<string>;
  initialTaintAddresses: Set<string>;
  dustSpendTxids: Set<string>;
}
```
In `'current'` mode, Phase 0 (precompute) runs, then Phase 1 scans the current UTXO set directly (not `walletOutputs`); Phases 2 (BFS) and 3 (tx labels) are skipped and `dustSpendTxids` is always empty.
In `'full'` mode, all phases run: Phase 0 precompute, Phase 1 walletOutputs history scan, Phase 2 BFS propagation, Phase 3 transaction label output.

The function remains a pure function (no Realm, no Redux) in `dustClassification.ts`. The returned `taintedAddresses` set drives UTXO marking; `dustSpendTxids` drives transaction labelling.

---

### D3 — Precompute historical address-state indexes from sorted transaction history

**Decision**: Inside `classifyDustByAddress`, before the taint detection loop, build two indexes from `wallet.specs.transactions` sorted by `blockTime` ascending:

- `addressFirstReceivedTime: Map<address, blockTime>` — earliest blockTime the address appeared in `recipientAddresses`.
- `highestExtIdxBeforeTx: Map<txid, number>` — highest external address index seen in any transaction _before_ this transaction (used for out-of-order detection at the time of arrival).

These replace the use of `preSyncNFAI` for historical transactions. `preSyncNFAI` is still used for the current-sync batch (new UTXOs without a `blockTime` yet).

**Rationale**: Using the live `nextFreeAddressIndex` as the out-of-order threshold (as in `dust-utxo-classification`) is correct for newly-arriving UTXOs but wrong for historical transactions — an address that was out-of-order two years ago relative to the chain state then would not be out-of-order relative to today's index. The precomputed index restores historical accuracy with no extra data storage.

**Complexity**: O(T log T) for the sort + O(T) for the two-pass map build.

---

### D4 — Backfill `walletOutputs` during hard-refresh whenever absent; zero-cost on restore/import

**Decision**: In `refreshWalletsWorker`, when the call has `dustScan: true`, identify transactions in `synchedWallet.specs.transactions` where `walletOutputs === undefined`. Batch-fetch their raw data from Electrum using `ElectrumClient.getTransactionsById` (40 txids per call), extract wallet-owned outputs, and write `walletOutputs` back onto those Transaction objects before running dust classification. The backfill is idempotent — once all transactions have `walletOutputs` populated, the check exits immediately on subsequent dust scans.

The backfill MUST NOT run on normal (soft) refresh or hard refresh. Soft and hard refresh evaluate only the current UTXO set and do not require `walletOutputs` to be present.

For restore/import, all transactions pass through `transformElectrumTxToTx` as new — `walletOutputs` is populated in-line at zero extra cost.

**Rationale**: Decoupling the backfill from hard refresh keeps pull-to-refresh fast. The backfill is only needed when the full historical scan (`scanMode: 'full'`) is requested, so it naturally belongs with the dust scan operation. The idempotent design means the first successful dust scan populates all history; subsequent scans skip the Electrum calls immediately.

---

### D5 — `dustSpendTxids` drives transaction labels; label stored as a `tag` on Transaction

**Decision**: A transaction is a "Potential dust spend" when any address in its `senderAddresses` is in the `taintedAddresses` set. `classifyDustByAddress` returns this as `dustSpendTxids`. In `refreshWalletsWorker`, for each tx in `dustSpendTxids`, set a system tag `potential-dust-spend` via the existing BIP329 `Tags` mechanism (or a dedicated `tags` field on Transaction — to be confirmed by the spec). The transaction list and detail screens read this tag to render the label and explanation.

**Rationale**: Tags are already the established pattern for attaching semantic labels to transactions in Keeper. Reusing the existing system avoids a new schema field on Transaction for label state.

**Alternatives considered**: Add `isDustSpend: boolean` directly to `TransactionSchema` — accepted as fallback if the Tags mechanism proves too indirect for this label. Decision deferred to implementation; either approach is valid.

---

### D6 — UTXO reason distinguishes initial taint, adjacent taint, and propagated taint

**Decision**: The existing `spendability: 'doNotSpend'` is sufficient. The reason displayed in UTXO Details is derived at display time from three distinct taint origins:
- `'initial'`: the specific sub-threshold UTXO (`value < 5,000`) that triggered the address taint — reason = **Potential dust payment** (consistent with `dust-utxo-classification`)
- `'adjacent'`: any other UTXO at the same initially-tainted address whose value is **at or above** the dust threshold (a larger coin co-located with the triggering dust) — reason = **Linked to potential dust spend**
- `'descendant'`: UTXOs at addresses tainted solely by BFS forward propagation (downstream of a dust spend) — reason = **Linked to potential dust spend**

Both `'adjacent'` and `'descendant'` display the same reason string. The distinction exists in data to allow future UI or reporting differentiation if needed.

To support this at display time, store `dustReason: 'initial' | 'adjacent' | 'descendant' | undefined` on the UTXO as a third optional field (alongside `spendability` and `isManualOverride`), set during UTXO marking in `refreshWalletsWorker`:
```typescript
if (!initialTaintAddresses.has(utxo.address)) {
  utxo.dustReason = 'descendant';
} else if ((utxo.value as number) < 5000) {
  utxo.dustReason = 'initial';    // the triggering dust UTXO itself
} else {
  utxo.dustReason = 'adjacent';   // co-located at the initially-tainted address
}
```

**Rationale**: Deriving reason from the tainted set at display time requires passing the tainted set to every UTXO render site. Storing it on the UTXO is consistent with D1 from `dust-utxo-classification` (embed classification state directly on the object) and avoids prop-drilling. The `'adjacent'` reason is particularly useful for the common scenario where a wallet received a 1,000-sat dust payment alongside a 50,000-sat legitimate receive to the same address — both are marked Do Not Spend, but only the 1,000-sat UTXO shows "Potential dust payment"; the 50,000-sat UTXO shows "Linked to potential dust spend", which more accurately reflects its situation.

---

### D7 — Separate refresh (current UTXOs only) from dust scan (full history + BFS + labels)

**Decision**: The wallet refresh flow supports two distinct classification depths via `scanMode`:

| Mode | Trigger | Phase 1 data source | `walletOutputs` backfill | BFS (Phase 2) | Tx labels (Phase 3) |
|---|---|---|---|---|---|
| Normal sync (soft refresh) | automatic background sync | current UTXO set | No | No | No |
| Hard refresh | user pull-to-refresh | current UTXO set | No | No | No |
| Dust scan | explicit `dustScan: true` flag | all `walletOutputs` in tx history | Yes | Yes | Yes |

The classification call becomes:
```typescript
classifyDustByAddress(wallet, externalAddresses, internalAddresses, manualOverrideAddresses,
  options.dustScan ? 'full' : 'current')
```

**Rationale**: Soft and hard refresh are now entirely in-memory after the wallet sync Electrum calls — no additional Electrum calls, no history iteration beyond Phase 0 precompute. Phase 0 (building `txCountByAddress` and `highestExtIdxBeforeTx` from stored `recipientAddresses`) runs in all modes because it is O(T) and powers reuse/order checks on current UTXOs. The full history scan, backfill, and BFS are deferred to the explicit dust scan so pull-to-refresh remains snappy even for wallets with large histories.

The `dustScan` flag would typically be triggered by a dedicated UI action (e.g. a "Scan for dust" button in wallet settings or the UTXO management screen) rather than any automatic trigger.

**Alternatives considered**: Always run full scan on hard refresh — rejected; makes hard refresh noticeably slower. Run BFS but not backfill on hard refresh — rejected; without `walletOutputs`, Phase 1 full-history scan cannot run, making the BFS result incomplete.

**Scan mode preservation invariant**: During soft/hard refresh, any UTXO not detected as tainted by the current (current-UTXOs-only) scan MUST retain its `doNotSpend` classification if the pre-sync snapshot shows it was `doNotSpend` without `isManualOverride`. This prevents the limited current-mode scan from silently clearing `'descendant'` or `'adjacent'` markings set by a prior full dust scan. Only a full dust scan — which re-runs the complete BFS from scratch — is authorised to clear such markings.

---

## Data Flow

```
refreshWalletsWorker(payload: { wallets, options })
│
├─ 1. Capture preSyncSnapshot
│        Map<"txId:vout" → {spendability, isManualOverride, dustReason}>
│        from payload.wallets[i].specs.{confirmed,unconfirmed}UTXOs
│
├─ 2. syncWalletsViaElectrumClient(wallets, network, hardRefresh)
│     ├─ transformElectrumTxToTx (for new txs):
│     │    └─ populate walletOutputs from tx.vout
│     └─ returns synchedWallets
│
├─ 3. For each synchedWallet:
│
│     a. Backfill (dustScan only):
│           find txs where walletOutputs === undefined
│           → batch-fetch Electrum (40 txids/call); set walletOutputs on those objects
│           → no-op if all txs already have walletOutputs
│           → SKIPPED entirely on normal/hard refresh
│
│     b. classifyDustByAddress(
│             synchedWallet, extAddr, intAddr, manualOverrideAddresses,
│             scanMode = options.dustScan ? 'full' : 'current')
│
│        scanMode = 'current' (soft/hard refresh):
│          Phase 0 (precompute): txCountByAddress, highestExtIdxBeforeTx
│          Phase 1 (current UTXOs): for each UTXO with value < 5000
│                                    check reuse/out-of-order → initialTaintAddresses
│          → taintedAddresses = initialTaintAddresses; dustSpendTxids = {}
│
│        scanMode = 'full' (dust scan):
│          Phase 0 (precompute): same
│          Phase 1 (walletOutputs history): scan all tx.walletOutputs for < 5000
│                                           → initialTaintAddresses (includes spent dust)
│          Phase 2 (BFS forward): senderAddresses → recipientAddresses propagation
│            └─ skip address as frontier if isManualOverride: true
│          Phase 3 (tx labels): any tainted sender → dustSpendTxids
│
│        → returns { taintedAddresses, initialTaintAddresses, dustSpendTxids }
│
│     c. Mark UTXOs:
│          for each UTXO in confirmedUTXOs + unconfirmedUTXOs:
│            if isManualOverride in snapshot → restore (preserve user intent)
│            else if address in taintedAddresses:
│              spendability = 'doNotSpend'
│              if address NOT in initialTaintAddresses → dustReason = 'descendant'
│              else if utxo.value < 5000           → dustReason = 'initial'
│              else                                 → dustReason = 'adjacent'
│            else if NOT dustScan AND snapshot.spendability == 'doNotSpend':
│              preserve snapshot (doNotSpend + dustReason from prior dust scan)
│              rationale: only a full scan has the BFS picture to safely clear these
│            else:
│              spendability = 'spendable'; dustReason = undefined
│
│     d. Label transactions (dustScan only):
│          for each tx.txid in dustSpendTxids:
│            set tag 'potential-dust-spend' on that Transaction
│
│     e. if newDustCount > 0 && options.addNotifications:
│          yield put(setPendingDustToast(walletId))
│
│     f. dbManager.updateObjectById(schema, id, { specs })
│
└─ HomeWallet useEffect: pendingDustToast → showToast → clearDustToast
```

## Affected Files

| Layer | File | Change |
|---|---|---|
| Storage schema | `src/storage/realm/schema/wallet.ts` | Add `walletOutputs: 'mixed?'` to `TransactionSchema`; bump schema version 107 → 108 |
| Storage schema | `src/storage/realm/realm.ts` | Version bump |
| Interface | `src/services/wallets/interfaces/index.ts` | Add `walletOutputs?: Array<{address: string; valueSats: number}>` and `dustReason?: 'initial' \| 'adjacent' \| 'descendant'` to `Transaction` and `UTXO` |
| Interface | `src/services/wallets/interfaces/wallet.ts` | No change (WalletSpecs unchanged) |
| Business logic | `src/services/wallets/operations/index.ts` | `transformElectrumTxToTx`: populate `walletOutputs` |
| Business logic | `src/services/wallets/operations/dustClassification.ts` | Replace `classifyDustUTXO` with `classifyDustByAddress`; add precompute helpers |
| Saga | `src/store/sagas/wallets.ts` | `refreshWalletsWorker`: backfill step, call `classifyDustByAddress`, mark UTXOs with `dustReason`, label transactions |
| Migration | `src/store/migrations.ts` | Version bump if any Redux slice shape changes |
| UI | `src/screens/UTXOManagement/UTXOLabeling.tsx` | Read `dustReason` to select reason/explanation string |
| UI | Transaction list / detail screen | Render "Potential dust spend" label when tag present |

## Risks / Trade-offs

- **`walletOutputs` missing for old txs on first normal refresh (pre-backfill)**: During the backfill Electrum calls, if the Electrum node is offline, those transactions remain unclassified until the next online sync. Mitigation: fall back to current-UTXO-set check for any address whose walletOutputs are absent, which at minimum catches unspent dust.
- **`blockTime` ordering ties**: Transactions in the same block have the same `blockTime`. The `highestExtIdxBeforeTx` index for two same-block transactions is identical — both see the same "before" state. This is correct: within a block, neither transaction causally precedes the other.
- **BFS performance on large wallets**: For a vault with thousands of transactions and a heavily reused address, the BFS frontier could expand broadly. Mitigation: the visited set ensures each address is processed at most once, bounding total work to O(T + A). In practice, tainted address sets are small.
- **Conservative false positives for change addresses**: A change address that received from a tainted spend is correctly marked tainted even if the user considers the taint "old news." The **Mark Spendable** override is the escape valve and is explicit about accepting privacy risk.
- **`dustReason` survives hard refresh via snapshot**: The pre-sync snapshot already captures `dustReason` alongside `spendability` and `isManualOverride`. No additional snapshot logic needed.

## Migration Plan

1. Realm schema version bump 107 → 108 (additive — `walletOutputs` nullable, `dustReason` nullable; no data transform required).
2. On app update, the first `refreshWalletsWorker` call runs the backfill step for each wallet's unclassified transactions. This is transparent to the user.
3. Rollback: removing `walletOutputs` and `dustReason` fields and reverting to version 107 is safe — all fields are nullable and the old `classifyDustUTXO` logic can be restored.

## Open Questions

- **Transaction label storage**: Is the `tags` field on Transaction (BIP329 system tags) the right place for `potential-dust-spend`, or should it be a dedicated `isDustSpend: boolean` field? Using tags avoids a schema change but may conflict with BIP329 export semantics. _(Resolve before implementing task: Label transactions in history UI.)_
- **Propagation depth cap**: Should BFS propagation be capped at N hops for very large wallet graphs, or always run to convergence? The O(T + A) bound is acceptable for current wallet sizes; revisit if needed.
