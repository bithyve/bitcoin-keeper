## Context

The `dust-utxo-classification` change added `spendability` fields on UTXOs, and `dust-spend-restrictions` wired those fields into the automatic coin selection filter and manual selection warning. The send flow (`AddSendAmount` → `SendConfirmation` → `SignTransactionScreen`) is the established PSBT-based signing path for all wallet types.

Currently, there is no way to clear Do Not Spend coins from a wallet other than manually reclassifying them one by one in the labeling screen.

Key existing pieces this feature builds on:

- `calculateSendMaxFee` Redux saga action — synchronously calculates the fee for a fixed input set at a given `feePerByte`, writes result to `state.sendAndReceive.sendMaxFee`.
- `sendPhaseOne` Redux saga action — calls `WalletOperations.transferST1`, builds `txPrerequisites` and `txRecipients` for all priority levels, writes to `state.sendAndReceive.sendPhaseOne`.
- `SendConfirmation` screen — reads `txPrerequisites`/`txRecipients` from Redux state, accepts `sender`, `addresses`, `amounts`, `selectedUTXOs`, `transactionPriority`, and `note` from route params.
- `UTXOFooter` — the non-selection-mode footer in `UTXOManagement`; currently only has the "Select to Send" button.
- `UTXOManagement` (`src/screens/UTXOManagement/UTXOManagement.tsx`) — the Manage Coins screen; owns the UTXO list, selection state, and footer rendering.

The spend restriction filter (Decision 1 in `dust-spend-restrictions/design.md`) is skipped when `selectedUTXOs.length > 0`, so passing Do Not Spend UTXOs explicitly as `selectedUTXOs` bypasses the filter for free — no extra code needed for this.

## Goals / Non-Goals

**Goals:**

- Add a contextual "Donate Dust" CTA in the Manage Coins footer, visible only when Do Not Spend UTXOs exist.
- Show the confirmation sheet immediately when the user taps the footer CTA, then perform an eligibility check when the user taps **Donate Dust** inside the sheet; show an error and close the sheet if no valid transaction can be built.
- Show a confirmation bottom sheet with the required copy before proceeding.
- Build and execute the donation transaction using only Do Not Spend UTXOs at the `low` fee rate, sending net-of-fees amount to the hardcoded Keeper donation address.
- Hand off to the existing `SendConfirmation` → `SignTransactionScreen` flow with fee priority locked to `low`.

**Non-Goals:**

- Modifying `AddSendAmount` — the donation flow bypasses it entirely.
- Allowing the user to pick a fee rate or donation recipient.
- Modifying PSBT construction, signing protocols, or broadcast logic.
- Special transaction history labeling.

## Decisions

### Decision 1: Eligibility check via existing `calculateSendMaxFee` action, triggered by the confirmation modal's primary button

**Decision:** The footer CTA opens the confirmation modal immediately (no pre-check). When the user taps **Donate Dust** inside the modal, dispatch `calculateSendMaxFee` with `selectedUTXOs = doNotSpendUTXOs`, `feePerByte = averageTxFees[networkType].low.feePerByte`, and `recipients = [{ address: DONATION_ADDRESS, amount: 0 }]`. If the resulting `sendMaxFee >= totalDoNotSpendValue` (net amount ≤ 0), close the modal and show the error. If it passes, immediately dispatch `sendPhaseOne` in the same `useEffect` handler and close the modal on navigation.

**Rationale:** Opening the modal first lets the user read the copy and make an informed choice before paying any async cost. The eligibility check and `sendPhaseOne` dispatch are then a single committed action from the user's perspective — the modal's **Donate Dust** button shows a loading state throughout both steps. `calculateSendMaxFee` already handles fixed-input, send-max fee estimation correctly and bypasses the `doNotSpend` filter when `selectedUTXOs.length > 0`.

**Alternative considered:** Check eligibility before opening the modal (on footer tap). Rejected — it adds latency to what looks like a simple navigation action, and the user hasn't yet seen the copy explaining what they're about to do.

**Alternative considered:** Call `WalletOperations.calculateSendMaxFee` directly (synchronously) inside the tap handler, bypassing Redux. Rejected — direct static calls inside React components couple the UI layer to the service layer.

---

### Decision 2: Bypass `AddSendAmount` — dispatch `sendPhaseOne` from `UTXOManagement` and navigate directly to `SendConfirmation`

**Decision:** After the user confirms in the modal, dispatch `sendPhaseOne` with `wallet`, `recipients = [{ address: DONATION_ADDRESS, amount: netDonationAmount }]`, and `selectedUTXOs = doNotSpendUTXOs`. When `sendPhaseOne.isSuccessful`, navigate to `SendConfirmation` with pre-populated params.

**Rationale:** `AddSendAmount` exists to let users enter an address, amount, and choose a fee tier. For Donate Dust, all three are fixed — skipping it avoids presenting an editable screen before a read-only review. The `SendConfirmation` screen already accepts `transactionPriority` in its route params, so pre-setting it to `TxPriority.LOW` is straightforward.

**Alternative considered:** Navigate to `AddSendAmount` with pre-filled params and `isReadOnly` flags. Rejected — it would require adding multiple lock props to a complex screen, and the screen's internal `useEffect`s (re-dispatching `calculateSendMaxFee` on mount, listening to various Redux slices) would cause unnecessary async operations and potential race conditions.

---

### Decision 3: Lock fee priority in `SendConfirmation` via `isDonation` route param

**Decision:** Add an `isDonation?: boolean` param to `SendConfirmationRouteParams`. When `isDonation === true`, `SendConfirmation` hides the fee priority switcher and uses `TxPriority.LOW` regardless of user input.

**Rationale:** The issue spec mandates "minimum fee rate" (= `low`). Users should not be able to bump the fee since that would require adding normal spendable coins, violating the "no spendable coins used" guarantee. A boolean flag is the minimal surface change to `SendConfirmation`.

**Alternative considered:** A new `DonationConfirmation` screen wrapping `SignTransactionScreen` directly, skipping `SendConfirmation` entirely. Rejected — `SendConfirmation` provides the transaction detail review that the issue spec refers to as "existing transaction review/signing flow."

---

### Decision 4: Orchestration state lives in `UTXOManagement`, not in `UTXOFooter`

**Decision:** `UTXOManagement` manages three new state values (`isCheckingDonation: boolean`, `donationSheetVisible: boolean`, `pendingDonationAmount: number`), a `doNotSpendUTXOs` derived value, and the two `useEffect` watchers (one for `sendMaxFee`, one for `sendPhaseOneState`). `UTXOFooter` receives `doNotSpendUTXOs` (to know whether to show the CTA) and `onDonateDust: () => void` (the tap callback) as new props.

**Rationale:** Redux saga state (sendMaxFee, sendPhaseOneState) is already read in `UTXOManagement` via `useAppSelector`. Keeping the orchestration in the screen component avoids prop-drilling deep Redux state into a stateless footer, and keeps `UTXOFooter` a simple presentational component.

**Alternative considered:** A new `useDonation` hook encapsulating all orchestration logic. Acceptable alternative — could be added later as a refactor. Not needed now given `UTXOManagement` already has selector calls.

---

### Decision 5: `sendMaxFee` Redux state guarded by `isCheckingDonation` flag

**Decision:** Before dispatching `calculateSendMaxFee`, set `isCheckingDonation = true` and call `dispatch(setSendMaxFee(0))` to clear stale state. In the `useEffect` watching `sendMaxFee`, only act when `isCheckingDonation === true`.

**Rationale:** `sendMaxFee` is shared global Redux state. Without clearing it first and guarding with a local flag, a stale value from a previous AddSendAmount visit could be misread as a fresh eligibility result.

**Alternative considered:** A local ref instead of state for `isCheckingDonation` to avoid a re-render. Acceptable — use `useRef` if the extra render proves a problem. Default to `useState` for simplicity and testability.

## Risks / Trade-offs

- **`sendPhaseOne` builds for all priorities, but we only use `low`**: `txPrerequisites` will have entries for all three tiers. Navigation to `SendConfirmation` with `isDonation=true` forces `low`, but `sendPhaseOne` still runs coinselect for `medium` and `high` at the donation amount. This is a minor computational overhead, not a correctness issue. Mitigation: none needed; overhead is negligible.

- **`calculateSendMaxFee` crash on uneconomic UTXOs**: If all Do Not Spend UTXOs are so small that even after 10,000 coinselect retries no valid output can be built, `calculateSendMaxFee` will throw (accessing `outputs` when it's still null/undefined). The `calculateSendMaxFee` saga has no try/catch; the saga will swallow the error and `sendMaxFee` will remain 0. Mitigation: The `isCheckingDonation` `useEffect` treats `sendMaxFee === 0` (or `sendMaxFee >= totalDoNotSpendValue`) as "not eligible" and shows the error. This handles the crash case correctly without any saga changes.

- **Race condition between eligibility check and user interaction**: If the user taps **Donate Dust** on the modal multiple times before the check completes, multiple `calculateSendMaxFee` dispatches would fire. Mitigation: disable the **Donate Dust** button inside the modal while `isCheckingDonation === true` (loading state on the modal primary button, not the footer CTA).

- **`netDonationAmount` drifts between eligibility check and `sendPhaseOne`**: `calculateSendMaxFee` estimates the fee; `sendPhaseOne` may produce a slightly different fee (due to coinselect differences). In practice, `calculateSendMaxFee` uses `fixedCoinselect` with the same inputs, so the results should be identical for the same `feePerByte`. Minor residual drift is handled by `SendConfirmation` displaying the actual fee from `txPrerequisites`.
