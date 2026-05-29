## 1. UTXOFooter — Donate Dust CTA

- [x] 1.1 In `UTXOFooter.tsx`: add two new props — `doNotSpendUTXOs: UTXO[]` (defaults to `[]`) and `onDonateDust: () => void` — to the `UTXOFooter` function signature
- [x] 1.2 In `UTXOFooter.tsx`: add a second footer item `{ text: walletTranslation.donateDust, Icon: ..., onPress: onDonateDust, disabled: false }` to `footerItems` conditionally when `doNotSpendUTXOs.length > 0`; use an appropriate existing icon (e.g., the same send icon or a gift/donate icon if available)
- [x] 1.3 In `UTXOManagement.tsx`: derive `doNotSpendUTXOs` from the `utxos` array as `utxos?.filter(u => u.spendability === 'doNotSpend') ?? []`
- [x] 1.4 In `UTXOManagement.tsx`: pass `doNotSpendUTXOs` and `onDonateDust={() => setDonationSheetVisible(true)}` to `UTXOFooter` — the footer tap opens the sheet immediately with no eligibility check

## 2. UTXOManagement — Donation Orchestration State

- [x] 2.1 In `UTXOManagement.tsx`: add Redux selectors for `sendMaxFee` (`state.sendAndReceive.sendMaxFee`) and `sendPhaseOneState` (`state.sendAndReceive.sendPhaseOne`)
- [x] 2.2 In `UTXOManagement.tsx`: add three state values: `isCheckingDonation: boolean` (init `false`), `donationSheetVisible: boolean` (init `false`), `pendingDonationAmount: number` (init `0`)
- [x] 2.3 In `UTXOManagement.tsx`: implement `executeDonation()` — the handler called by the modal's **Donate Dust** button; guards against empty `doNotSpendUTXOs`, dispatches `setSendMaxFee(0)` to clear stale state, sets `isCheckingDonation = true`, then dispatches `calculateSendMaxFee({ wallet: selectedWallet, recipients: [{ address: KEEPER_DONATION_ADDRESS, amount: 0 }], selectedUTXOs: doNotSpendUTXOs, feePerByte: averageTxFees[selectedWallet.networkType][TxPriority.LOW].feePerByte })`
- [x] 2.4 In `UTXOManagement.tsx`: add a `useEffect` watching `[sendMaxFee, isCheckingDonation]` — when `isCheckingDonation === true`: compute `totalDoNotSpendValue = doNotSpendUTXOs.reduce((s, u) => s + u.value, 0)`; if `sendMaxFee > 0 && sendMaxFee < totalDoNotSpendValue`, set `pendingDonationAmount = totalDoNotSpendValue - sendMaxFee`, set `isExecutingDonation = true`, dispatch `sendPhaseOneReset()`, dispatch `sendPhaseOne({ wallet: selectedWallet, recipients: [{ address: KEEPER_DONATION_ADDRESS, amount: pendingDonationAmount }], selectedUTXOs: doNotSpendUTXOs })`, clear `isCheckingDonation`; else if `sendMaxFee >= totalDoNotSpendValue || sendMaxFee === 0`, close modal (`setDonationSheetVisible(false)`), show error toast with the "too small" copy, and clear `isCheckingDonation`
- [x] 2.5 In `UTXOManagement.tsx`: add a `useEffect` watching `sendPhaseOneState` (guarded by `isExecutingDonation === true`) — on `isSuccessful`: close modal (`setDonationSheetVisible(false)`), navigate to `SendConfirmation` with pre-populated params (see task 4.4), reset `isExecutingDonation`; on `hasFailed`: close modal, show toast with error message, reset `isExecutingDonation`

## 3. Donation Confirmation Bottom Sheet

- [x] 3.1 In `UTXOManagement.tsx`: render a `KeeperModal` with `visible={donationSheetVisible}` and `close={() => setDonationSheetVisible(false)}`; title prop: `"Donate Dust?"`
- [x] 3.2 In the modal `Content`: render the body copy, warning line ("No spendable coins will be used."), and detail line ("Any amount left after fees will be donated to support Keeper.") using existing text/box components following the existing modal content pattern
- [x] 3.3 In the modal: wire the **Donate Dust** button to `executeDonation()` (task 2.3); show a loading/disabled state on the button while `isCheckingDonation || isExecutingDonation` is true
- [x] 3.4 In the modal: wire the **Cancel** button to `() => setDonationSheetVisible(false)` only — no state changes

## 4. SendConfirmation — Locked Donation Mode

- [x] 4.1 In `SendConfirmation.tsx`: add `isDonation?: boolean` to the `SendConfirmationRouteParams` interface and destructure it from `route.params`
- [x] 4.2 In `SendConfirmation.tsx`: when `isDonation === true`, initialize `transactionPriority` state to `TxPriority.LOW` and wrap the fee priority switcher / priority selector UI in a `{!isDonation && (...)}` guard so it is not rendered in donation mode
- [x] 4.3 In `SendConfirmation.tsx`: when `isDonation === true`, replace the success modal title with the `donateDust.dustDonated` i18n string ("Dust donated") and suppress the sub-title ("Transaction broadcasted") in favour of an empty string or omit `subTitle`
- [x] 4.4 In `UTXOManagement.tsx` (`sendPhaseOneState` success handler from task 2.5): navigate with `CommonActions.navigate('SendConfirmation', { sender: selectedWallet, addresses: [KEEPER_DONATION_ADDRESS], amounts: [pendingDonationAmount], selectedUTXOs: doNotSpendUTXOs, transactionPriority: TxPriority.LOW, isDonation: true, note: '' })`

## 5. i18n

- [x] 5.1 In `src/context/Localization/language/en.json`: add the following keys under the appropriate namespace (create a `donateDust` object or add to `wallet`):
  - `"donateDust": "Donate Dust"`
  - `"donateDustTitle": "Donate Dust?"`
  - `"donateDustBody": "This helps clear dust / Do Not Spend coins for better privacy. Keeper will use only Do Not Spend coins for this transaction. Fees will be paid from those coins only."`
  - `"donateDustWarning": "No spendable coins will be used."`
  - `"donateDustDetail": "Any amount left after fees will be donated to support Keeper."`
  - `"tooSmallToDonate": "These coins are too small to donate on their own. Keeper will keep them marked Do Not Spend."`
  - `"dustDonated": "Dust donated"`

## 6. Tests

- [x] 6.1 Unit test for `UTXOFooter`: given `doNotSpendUTXOs` with one entry, assert the "Donate Dust" footer item is rendered; given `doNotSpendUTXOs = []`, assert it is not rendered
- [x] 6.2 Unit test for `executeDonation` eligibility logic: when `sendMaxFee < totalDoNotSpendValue`, assert `sendPhaseOne` is dispatched with `amount = totalDoNotSpendValue - sendMaxFee` and modal remains open (closed only by sendPhaseOne success effect)
- [x] 6.3 Unit test for `executeDonation` eligibility logic: when `sendMaxFee >= totalDoNotSpendValue`, assert modal closes, error toast is shown, and `donationSheetVisible` becomes `false`
- [x] 6.4 Unit test for `SendConfirmation` in `isDonation` mode: assert the fee priority selector is not rendered and `transactionPriority` is locked to `TxPriority.LOW`
