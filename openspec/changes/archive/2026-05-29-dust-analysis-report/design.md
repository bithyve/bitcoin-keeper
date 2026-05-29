## Context

Keeper now has a complete dust detection stack: UTXOs carry `spendability`, `dustReason` (`'initial'` / `'adjacent'` / `'descendant'`), and `isManualOverride` fields. Transactions carry the `potential-dust-spend` system tag. The `refreshWallets` saga accepts `dustScan: true` to run a full address-taint scan (all four phases including BFS propagation and transaction labelling). The scan signals progress via the existing `walletSyncing[wallet.id]` Redux state.

This change adds only a consumption layer: a new screen that triggers the existing scan and presents the results.

## Goals / Non-Goals

**Goals:**
- Add a Dust Report entry to Wallet Settings that opens a wallet-scoped report flow.
- Drive scan via the existing `refreshWallets` saga with `dustScan: true`.
- Derive all report content from `wallet.specs` post-scan without new Realm fields.
- Persist the last-scanned timestamp in MMKV.
- Surface inline Donate Dust confirmation using `KeeperModal`, handing off to the existing send/signing flow.

**Non-Goals:**
- New Redux slice or saga. All state is local to the screen plus the existing `walletSyncing` Redux flag.
- New Realm schema changes.
- Tappable report rows (deferred).
- Background scanning or scan-on-open behaviour.

## Decisions

### Decision 1: Single screen with a local phase state machine

**Options:**
- A: Three separate navigator screens (start → scanning → result).
- B: One screen with a local `phase` state variable.

**Decision: Option B.**

All four phases (start, scanning, result, error) share wallet context. A single screen avoids registering three routes, eliminates the awkward "Cancel from scanning → pop 2 screens" problem, and matches Keeper's pattern in screens like `UTXOLabeling` and `WalletDetailsSettings` which manage their own multi-stage UI locally.

Phase state machine:

```
'start'  ──Run Report──▶  'scanning'  ──success──▶  'result'
                              │
                              └──error──▶  'error'
                              │
                              └──Cancel──▶  goBack()
```

### Decision 2: MMKV for last-scanned timestamp

**Options:**
- A: Realm field on `Wallet` (requires schema bump and migration).
- B: MMKV KV store, key `dust-report-lastScanned-{walletId}`.
- C: Transient Redux state (lost on restart).

**Decision: Option B — MMKV.**

Stores a millisecond epoch timestamp only. No sensitive data, no schema migration, no Redux Persist version bump. Written immediately after `walletSyncing[wallet.id]` transitions from `true` to `false`.

MMKV key pattern: `dust-report-lastScanned-${wallet.id}`

### Decision 3: Inline donate dust confirmation via KeeperModal

**Options:**
- A: Navigate to `UTXOManagement` and auto-open the donation sheet there.
- B: Duplicate the donation confirmation as a `KeeperModal` on the report screen, then hand off to the existing send/signing flow with pre-populated locked parameters (same pattern as `dust-donation`).
- C: A separate navigator screen.

**Decision: Option B — inline KeeperModal.**

Keeps the report self-contained and avoids the fragility of injecting sheet-open state into another screen. The confirmation copy and transaction-building logic mirror `dust-donation` exactly. After the user confirms, navigate to `Send` with `{ sender: wallet, selectedUTXOs: doNotSpendUTXOs, isDonation: true }` — the same locked parameter flow defined in `dust-donation`.

### Decision 4: Report data derivation — pure derivation from wallet.specs

All report content is derived on the client side after the scan completes. No new saga action, no new Redux selector, no async call.

```typescript
const allUTXOs = [
  ...(wallet.specs.confirmedUTXOs ?? []),
  ...(wallet.specs.unconfirmedUTXOs ?? []),
];

// Active Dust: sub-threshold UTXOs that triggered the initial taint
const activeDust = allUTXOs.filter(
  (u) => u.spendability === 'doNotSpend' && u.dustReason === 'initial'
);

// Linked Coins: adjacent (co-located) or descendant (BFS-propagated) UTXOs
const linkedCoins = allUTXOs.filter(
  (u) =>
    u.spendability === 'doNotSpend' &&
    (u.dustReason === 'adjacent' || u.dustReason === 'descendant')
);

// Do Not Spend total (summary card)
const doNotSpendUTXOs = allUTXOs.filter((u) => u.spendability === 'doNotSpend');
const amountMarkedDNS = doNotSpendUTXOs.reduce((sum, u) => sum + u.value, 0);

// Past Dust Spends: transactions carrying the system tag
const pastDustSpends = (wallet.specs.transactions ?? []).filter((tx) =>
  tx.tags?.includes('potential-dust-spend')
);

// Eligibility for Donate Dust CTA
const hasEligibleDustForDonation = doNotSpendUTXOs.length > 0;
```

Empty state condition: `activeDust.length === 0 && linkedCoins.length === 0 && pastDustSpends.length === 0`.

### Decision 5: Scan trigger and completion detection

**Trigger**: `dispatch(refreshWallets([wallet], { hardRefresh: true, dustScan: true }))` on "Run Report" tap. Sets `phase = 'scanning'` immediately.

**Completion detection**: `useEffect` watching `walletSyncing[wallet.id]`. When it transitions from `true` → `false` while `phase === 'scanning'`:
1. Write MMKV timestamp.
2. Re-derive report data from the updated `wallet` from Redux.
3. Set `phase = 'result'` or `phase = 'error'` depending on whether the scan threw (caught via `try/catch` in a local async wrapper or via a separate error flag).

**Error detection**: Wrap the dispatch in a try/catch. If the saga throws, catch it and set `phase = 'error'`.

### Decision 6: Progress items — static sequential reveal

The "Scanning Wallet" screen shows three static progress items:
- Checking wallet coins
- Checking past transactions
- Preparing report

These are revealed with a simple interval timer (every 2 s, reveal the next item). They are cosmetic only — they do not track real saga progress. This matches the intent of the spec ("Optional progress items — short and non-technical") without requiring saga-level step signalling.

## Data Flow

```
User taps "Run Report"
       │
       ▼
dispatch(refreshWallets([wallet], { hardRefresh: true, dustScan: true }))
       │
       ▼
walletSyncing[wallet.id] = true   ← phase = 'scanning'
       │
       ▼ (saga runs: backfill → taint → BFS → tags → persist)
walletSyncing[wallet.id] = false
       │
       ▼
Write MMKV: dust-report-lastScanned-{wallet.id} = Date.now()
       │
       ▼
Derive activeDust, linkedCoins, pastDustSpends from wallet.specs
       │
       ├─ any dust found?  YES → phase = 'result' (findings)
       └─ no dust found?        → phase = 'result' (empty)

Error path: saga throws → phase = 'error'
```

## UI Architecture

### Screen file

`src/screens/DustReport/DustReportScreen.tsx`

Single file, single exported component, local phase state. Business logic extracted into `src/hooks/useDustReport.ts`.

### Custom hook: `useDustReport`

Encapsulates:
- Phase state and transitions
- Redux dispatch for `refreshWallets`
- `walletSyncing` selector subscription
- MMKV read/write for last-scanned timestamp
- Report data derivation
- Donate dust bottom sheet state

Returns: `{ phase, progressStep, reportData, lastScanned, donateDustVisible, setDonateDustVisible, runScan, tryAgain, onDone, onCancel }`

### Existing components used

| Role | Component | Location |
|---|---|---|
| Screen container | `ScreenWrapper` | `src/components/ScreenWrapper.tsx` |
| Header | `WalletHeader` | `src/components/WalletHeader.tsx` |
| All text | `Text` (KeeperText) | `src/components/KeeperText.tsx` |
| Loading overlay | `ActivityIndicatorView` | `src/components/AppActivityIndicator/ActivityIndicatorView.tsx` |
| Donate dust confirmation | `KeeperModal` | `src/components/KeeperModal.tsx` |
| CTA pairs | `Buttons` | `src/components/Buttons.tsx` |
| Do Not Spend chip | Existing label chip from `UTXOLabeling` | `src/screens/UTXOManagement/UTXOLabeling.tsx` |
| Toast feedback | `useToastMessage` | `src/hooks/useToastMessage.tsx` |

No new components are needed. Cards and grouped sections for the report are built from `Box` + `Text` with existing Keeper surface/card tokens (`${colorMode}.textInputBackground`, border `${colorMode}.separator`), matching the visual style of `WalletDetails` and `UTXOManagement` existing cards.

### Color and layout tokens used

- Screen background: `${colorMode}.primaryBackground`
- Card background: `${colorMode}.textInputBackground`
- Card border: `${colorMode}.separator`
- Primary text: `${colorMode}.primaryText`
- Secondary text: `${colorMode}.secondaryText`
- Do Not Spend chip: warning label style from `UTXOLabeling` (`#F24822` / amber background)
- CTA button: primary green via `Buttons` component

### Report card layout

Summary card uses a 2-column grid of label + value rows, matching the pattern in `DetailCards.tsx` in `WalletDetails`. Each content section (Active Dust, Linked Coins, Past Dust Spends) is a `Box` with a section heading and a flat list of static rows. Rows show amount (sats) + label chip + reason string. No chevron (non-tappable).

## Risks / Trade-offs

- **`walletSyncing` false-positive**: If another wallet refresh fires concurrently for the same wallet, `walletSyncing` going `false` would trigger report derivation prematurely. Mitigation: gate the completion `useEffect` on `phase === 'scanning'` strictly so it only fires once per explicit scan trigger.

- **Stale wallet data**: The `wallet` object from Redux is re-read after scan. If Redux hasn't committed the persisted update yet (Realm → Redux lag), derived data could be momentarily stale. Mitigation: the existing `refreshWalletsWorker` dispatches the updated wallet to Redux before unsetting `walletSyncing`, so data is always fresh when `walletSyncing` drops.

- **Donate Dust inline duplication**: The KeeperModal confirmation and send-flow handoff duplicates logic from `dust-donation`'s UTXOManagement integration. Trade-off accepted per design decision. If `dust-donation` refactors its confirmation into a shared component later, the report's inline sheet should be updated to use it.

- **MMKV timestamp loss**: MMKV data can be cleared by the user (via app storage reset). If `dust-report-lastScanned-{walletId}` is missing, the summary card shows "Never" as the last scanned value. This is handled gracefully.

## Affected Files

| File | Status | Change |
|---|---|---|
| `src/screens/DustReport/DustReportScreen.tsx` | **New** | Full report screen, all phases |
| `src/hooks/useDustReport.ts` | **New** | Business logic hook |
| `src/screens/WalletDetails/WalletSettings.tsx` | **Modified** | Add Dust Report action row |
| `src/navigation/Navigator.tsx` | **Modified** | Register `DustReport` route |
| `src/navigation/types.ts` | **Modified** | Add `DustReport: { walletId: string }` to `AppStackParams` |
| `src/context/Localization/language/en.json` | **Modified** | Add all new copy strings |

## Open Questions

None. All decisions resolved:
- Persistence: MMKV ✓
- Donate Dust: inline KeeperModal ✓
- Row tappability: static in v1 ✓
- Screen architecture: single screen, phase state machine ✓
