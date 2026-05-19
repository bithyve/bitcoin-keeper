## 1. Coin Selection — Filter Do Not Spend UTXOs

- [x] 1.1 In `prepareTransactionPrerequisites` (`src/services/wallets/operations/index.ts`): when `selectedUTXOs` is not provided, filter the assembled `inputUTXOs` array to exclude UTXOs where `spendability === 'doNotSpend'` before passing to `updateInputsForFeeCalculation`
- [x] 1.2 In `calculateSendMaxFee` (`src/services/wallets/operations/index.ts`): apply the same `spendability !== 'doNotSpend'` filter to the auto-assembled `inputUTXOs` when no `selectedUTXOs` are provided

## 2. Send Flow — Spendable Balance

- [x] 2.1 In `AddSendAmount.tsx`: compute `spendableBalance` by reducing `[...sender.specs.confirmedUTXOs, ...sender.specs.unconfirmedUTXOs].filter(u => u.spendability !== 'doNotSpend')` to a sat sum (use `?.` safe access and default empty arrays)
- [x] 2.2 Replace `availableBalance` (used for the balance display header) with `spendableBalance` when no UTXOs are manually selected; keep the UTXO-sum path (`selectedUTXOs.reduce(...)`) unchanged for the manual-selection case
- [x] 2.3 Replace `availableToSpend` initial value (`balance.confirmed + balance.unconfirmed`) with `spendableBalance` so the inline validation logic uses the filtered balance

## 3. Send Flow — Insufficient Spendable Balance Warning

- [x] 3.1 In `AddSendAmount.tsx`: compute `totalBalance` as `sender.specs.balances.confirmed + sender.specs.balances.unconfirmed` (keep as before) and derive a boolean `hasDoNotSpendWarning = !haveSelectedUTXOs && Number(amountToSend) > spendableBalance && Number(amountToSend) <= totalBalance`
- [x] 3.2 In the `useEffect` that sets `errorMessage`: when `hasDoNotSpendWarning` is true, do not set/clear the error message based on `availableToSpend` comparison (the insufficient-balance error still fires from the saga); keep existing error logic otherwise
- [x] 3.3 In the JSX of `AddSendAmount.tsx`: render an inline `Box` below the amount entry that is visible only when `hasDoNotSpendWarning` is true, containing the helper copy "Some coins are marked Do Not Spend and are not available for this payment." in warning-style text
- [x] 3.4 In the same inline box: add a **View Coins** `TouchableOpacity` / button that dispatches `CommonActions.navigate('UTXOManagement', { wallet: sender })` on press
- [x] 3.5 Add new i18n keys to `src/context/Localization/language/en.json` (under `error` or a suitable group): `"someCoinsDoNotSpend": "Some coins are marked Do Not Spend and are not available for this payment."` and `"viewCoins": "View Coins"` (skip if `viewCoins` already exists)

## 4. Manual Coin Selection — Do Not Spend Warning Modal

- [x] 4.1 In `UTXOList.tsx`: add `pendingDoNotSpendUTXO: UTXO | null` state (initialized to `null`) to the `UTXOList` component
- [x] 4.2 In `UTXOList.tsx`: add an `onDoNotSpendTap` callback prop to `UTXOElement` (signature: `(utxo: UTXO) => void`); in `UTXOElement.onPress`, when `allowSelection && isDoNotSpend && !selectedUTXOMap[utxoId]`, call `onDoNotSpendTap(item)` instead of mutating `selectedUTXOMap` directly
- [x] 4.3 In `UTXOList.tsx`: pass `onDoNotSpendTap={(utxo) => setPendingDoNotSpendUTXO(utxo)}` from `UTXOList` down to each `UTXOElement`
- [x] 4.4 In `UTXOList.tsx`: render a `KeeperModal` (or equivalent bottom sheet already used in the codebase) that is visible when `pendingDoNotSpendUTXO !== null`, with title **"Use Do Not Spend Coin?"**, body **"This coin was marked Do Not Spend to help protect wallet privacy. Spending it with other coins may reduce privacy."**, and two buttons:
  - **Use Coin**: executes the selection mutation logic (same `selectedUTXOMap` update + `setSelectionTotal` recalc currently in `UTXOElement.onPress`) then calls `setPendingDoNotSpendUTXO(null)`
  - **Cancel**: calls `setPendingDoNotSpendUTXO(null)` only
- [x] 4.5 Add new i18n keys to `en.json`: `"useDoNotSpendCoin": "Use Do Not Spend Coin?"`, `"doNotSpendModalBody": "This coin was marked Do Not Spend to help protect wallet privacy. Spending it with other coins may reduce privacy."`, and `"useCoin": "Use Coin"`

## 5. Tests

- [ ] 5.1 Unit test for `prepareTransactionPrerequisites`: given a wallet with a mix of spendable and `doNotSpend` UTXOs and no `selectedUTXOs`, assert the coinselect input pool contains only spendable UTXOs
- [ ] 5.2 Unit test for `prepareTransactionPrerequisites`: given `selectedUTXOs` containing a `doNotSpend` UTXO, assert it is NOT filtered out
- [ ] 5.3 Unit test for the `hasDoNotSpendWarning` condition: verify it is true when `amountToSend > spendableBalance && amountToSend <= totalBalance && !haveSelectedUTXOs`, and false otherwise
