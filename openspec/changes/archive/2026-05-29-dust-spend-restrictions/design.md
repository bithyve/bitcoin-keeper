## Context

The `dust-utxo-classification` change (issue #6970) added automatic detection and manual classification of Do Not Spend UTXOs — embedded `spendability` and `isManualOverride` fields on each UTXO, classification logic in `classifyDustUTXO`, and the `useUTXOSpendability` hook. However, these signals are not yet wired into the send flow or manual coin selection.

Currently:
- `prepareTransactionPrerequisites` and `calculateSendMaxFee` in `src/services/wallets/operations/index.ts` pull all UTXOs (`[...confirmedUTXOs, ...unconfirmedUTXOs]`) with no filter — Do Not Spend coins are silently included.
- `AddSendAmount.tsx` computes available balance from `specs.balances.confirmed + specs.balances.unconfirmed` — a pre-computed sum that includes all UTXOs.
- `UTXOList.tsx` already renders the Do Not Spend chip (task 10.1) but does nothing special when the user taps a Do Not Spend UTXO during manual selection.

## Goals / Non-Goals

**Goals:**
- Filter Do Not Spend UTXOs out of automatic coin selection pool
- Show users the correct spendable balance (excluding Do Not Spend) in the send flow
- Surface an actionable warning when total balance is sufficient but spendable balance is not
- Gate manual selection of a Do Not Spend coin behind an explicit warning modal

**Non-Goals:**
- Blocking the send flow entirely when all UTXOs are Do Not Spend (user can still manually select them)
- Changing the UTXO classification logic (owned by `dust-utxo-classification`)
- Modifying PSBT construction or hardware signer flows
- Persisting the user's "Use Coin" acknowledgement

## Decisions

### Decision 1: Filter at `prepareTransactionPrerequisites` / `calculateSendMaxFee`, not at the saga layer

**Decision:** Apply the `.filter(u => u.spendability !== 'doNotSpend')` at the two `inputUTXOs` assembly points inside `src/services/wallets/operations/index.ts`, only when `selectedUTXOs` is not provided.

**Rationale:** These two functions are the canonical entry points for automatic coin selection. Filtering here is a single, low-risk change that covers all callers. Filtering at the saga layer would require touching every dispatch site and adds unnecessary indirection.

**Alternative considered:** Filter in the Redux saga (`sendPhaseOneWorker`) before dispatching to the operation. Rejected because it duplicates the UTXO assembly logic that already lives in the operation.

**Note:** The filter is skipped when `selectedUTXOs.length > 0` — manually selected Do Not Spend coins must still be usable.

---

### Decision 2: Compute spendable balance from UTXO arrays in the UI, not from `specs.balances`

**Decision:** In `AddSendAmount.tsx`, derive `spendableBalance` by reducing `sender.specs.confirmedUTXOs + sender.specs.unconfirmedUTXOs` filtered to exclude `spendability === 'doNotSpend'`. Use this for both the balance display header and the `availableToSpend` validation.

**Rationale:** `specs.balances.confirmed/unconfirmed` is a pre-computed aggregate updated during sync — it cannot be selectively filtered without changing the sync/storage layer. Computing from the UTXO array is always accurate without any schema changes.

**Alternative considered:** Store a separate `specs.balances.spendable` field during sync. Rejected — adds sync complexity, a schema migration, and is redundant given the UTXO array is already in memory.

---

### Decision 3: Insufficient-spendable-balance warning as inline UI, not a toast

**Decision:** When `totalBalance >= amountToSend > spendableBalance`, render the helper copy and View Coins button as inline UI below the amount entry in `AddSendAmount.tsx`, alongside the existing insufficient-balance error.

**Rationale:** The "View Coins" CTA requires a tappable button — a toast cannot carry an action. Inline UI is consistent with the existing `errorMessage` display pattern in that screen.

**Alternative considered:** A bottom sheet modal. Rejected — the issue spec says reuse existing confirmation modal/bottom sheet only for the manual selection warning, not for the send flow helper copy.

---

### Decision 4: Manual selection warning as a bottom sheet in `UTXOList`, state lifted to list level

**Decision:** Add `pendingDoNotSpendUTXO` state at the `UTXOList` level. `UTXOElement` calls a new `onDoNotSpendTap(utxo)` prop instead of directly mutating `selectedUTXOMap`. The bottom sheet (reusing the existing `KeeperModal` or equivalent) lives in `UTXOList` — one instance for the whole list.

**Rationale:** A per-item modal state would create a separate modal instance for every row in the FlatList, causing unnecessary re-renders. `setSelectedUTXOMap` is already passed from `UTXOList` → `UTXOElement`, so adding a sibling callback prop is the natural extension of the existing pattern.

**Alternative considered:** Handling the modal entirely inside `UTXOElement`. Rejected for the re-render and multiple-instance concerns above.

---

### Decision 5: Reuse `KeeperModal` for the Do Not Spend warning

**Decision:** Use the existing `KeeperModal` component (used throughout the app for confirmation dialogs) for the "Use Do Not Spend Coin?" warning in the manual selection flow.

**Rationale:** The issue spec explicitly says "reuse existing confirmation modal / bottom sheet component." `KeeperModal` already supports title, body, and two-button layouts.

## Risks / Trade-offs

- **`specs.balances` mismatch**: The balance displayed in the send flow will now differ from `specs.balances.*` (which remains unchanged). This could be confusing if the same wallet's balance is shown elsewhere using `specs.balances`. Mitigation: the send flow is the only place that needs the spendable view; all other balance displays (wallet card, details) can continue using `specs.balances` for now.

- **UTXO array empty edge case**: If `specs.confirmedUTXOs` or `specs.unconfirmedUTXOs` are undefined, the reduce will throw. Mitigation: use `?.` safe access and default to empty array — these fields are always initialized after sync.

- **`calculateSendMaxFee` filter + fee calculation accuracy**: Filtering UTXOs before `calculateSendMaxFee` means the "send max" amount correctly reflects only spendable coins. This is intentional, but means a user with mostly Do Not Spend UTXOs will see a lower "send max" than their total balance. This is the correct UX per the issue spec.
