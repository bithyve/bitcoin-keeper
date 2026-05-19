## 1. Storage — Realm Schema

- [x] 1.1 Add `spendability: 'string?'` and `isManualOverride: 'bool'` fields to `UTXOSchema` in `src/storage/realm/schema/wallet.ts`
- [x] 1.2 Bump `RealmDatabase.schemaVersion` from 106 to 107 in `src/storage/realm/realm.ts`
- [x] 1.3 Add migration guard `if (oldRealm.schemaVersion < 107)` (no-op comment) in `src/storage/realm/migrations.ts`

## 2. TypeScript Interfaces

- [x] 2.1 Add optional `spendability?: 'spendable' | 'doNotSpend'` and `isManualOverride?: boolean` fields to the `UTXO` and `InputUTXOs` interfaces in `src/services/wallets/interfaces/index.ts`
- [x] 2.2 Export a `UTXOSpendability = 'spendable' | 'doNotSpend'` type alias from `src/services/wallets/interfaces/index.ts`

## 3. Business Logic — Dust Classification Utility

- [x] 3.1 Create `src/services/wallets/operations/dustClassification.ts` with a pure `classifyDustUTXO(utxo: UTXO, synchedWallet: Wallet | Vault, preSyncNextFreeAddressIndex: number): UTXOSpendability` function — no DB or Redux imports
- [x] 3.2 Implement the 5,000 sat threshold fast-exit path in `classifyDustUTXO`
- [x] 3.3 Implement receive-address classification: reverse-lookup address index from `specs.addresses.external`, compute `hasReceivedBefore` (transaction count > 1), compute `isOutOfOrder` (index < preSyncNextFreeAddressIndex - 1)
- [x] 3.4 Implement change-address classification: reverse-lookup from `specs.addresses.internal`, compute `hasReceivedBefore` (transaction count > 1, using `TransactionType.RECEIVED`)
- [x] 3.5 Return `'spendable'` as safe default when address is not found in either cache

## 4. Redux — Reducer and Saga Actions

- [x] 4.1 Add `pendingDustToast: string | null` to the initial state in `src/store/reducers/utxos.ts`
- [x] 4.2 Add `setPendingDustToast` and `clearDustToast` reducers to the `utxoSlice` in `src/store/reducers/utxos.ts`; blacklist `pendingDustToast` in the persist config
- [x] 4.3 Add `MARK_UTXO_SPENDABILITY` action type and `markUTXOSpendability` action creator (payload: `{ wallet: Wallet | Vault, txId: string, vout: number, spendability: UTXOSpendability }`) to `src/store/sagaActions/utxos.ts`

## 5. Sagas

- [x] 5.1 In `refreshWalletsWorker` (`src/store/sagas/wallets.ts`): before calling `syncWalletsViaElectrumClient`, capture `preSyncSnapshot: Map<string, {spendability, isManualOverride}>` and `preSyncNextFreeAddressIndex` per wallet from `payload.wallets`
- [x] 5.2 In `refreshWalletsWorker`: after sync returns, for each `synchedWallet` iterate its `confirmedUTXOs` and `unconfirmedUTXOs` — restore state from snapshot where key exists; call `classifyDustUTXO` for unclassified UTXOs; collect `newDustUTXOs`
- [x] 5.3 In `refreshWalletsWorker`: after classification, if `options.addNotifications && newDustUTXOs.length > 0` dispatch `setPendingDustToast(synchedWallet.id)`
- [x] 5.4 Add `markUTXOSpendabilityWorker` to `src/store/sagas/utxos.ts`: fetch wallet/vault from Realm by id, find the UTXO in `specs.confirmedUTXOs` / `unconfirmedUTXOs` by `txId + vout`, set `spendability` and `isManualOverride = true`, write updated specs back via `dbManager.updateObjectById`
- [x] 5.5 Add `markUTXOSpendabilityWatcher` in `src/store/sagas/utxos.ts` and register it in the root saga

## 6. Hook — `useUTXOSpendability`

- [x] 6.1 Create `src/hooks/useUTXOSpendability.ts` that accepts a `wallet: Wallet | Vault` and returns `hasDoNotSpendUTXOs: boolean` (true if any UTXO in confirmedUTXOs or unconfirmedUTXOs has `spendability === 'doNotSpend'`) and `getSpendability(txId: string, vout: number): UTXOSpendability | null`

## 7. UI — Wallet Card Red Dot

- [x] 7.1 Add optional `showDot?: boolean` prop to `WalletCard` in `src/screens/Home/components/Wallet/WalletCard.tsx` and render the standard red dot overlay when true
- [x] 7.2 In `HomeWallet` (`src/screens/Home/components/Wallet/HomeWallet.tsx`): call `useUTXOSpendability` per wallet and pass `hasDoNotSpendUTXOs` as `showDot` to `WalletCard`

## 8. UI — Toast Notification

- [x] 8.1 In `HomeWallet`: add a `useEffect` that watches `pendingDustToast` from the `utxos` Redux slice; when non-null, call `showToast('Potential dust payment found')` and dispatch `clearDustToast()`

## 9. UI — Wallet Details

- [x] 9.1 In `WalletDetails` screen (`src/screens/WalletDetails/WalletDetails.tsx`): call `useUTXOSpendability` for the current wallet and conditionally render a non-tappable "Includes Do Not Spend coins" text line below the wallet name/subtitle when `hasDoNotSpendUTXOs` is true
- [x] 9.2 In `DetailCards` (`src/screens/WalletDetails/components/DetailCards.tsx`): pass `showDot` to the View All Coins card entry when the wallet `hasDoNotSpendUTXOs` — add `showDot` prop rendering to that card item

## 10. UI — Manage Coins (UTXOManagement / UTXOList)

- [x] 10.1 In `UTXOList` (`src/components/UTXOsComponents/UTXOList.tsx`): call `useUTXOSpendability` for the wallet prop and for each UTXO row where `getSpendability` returns `'doNotSpend'`, inject a Do Not Spend chip into the `UTXOLabel` component using warning-style color treatment

## 11. UI — UTXO Details (UTXOLabeling)

- [x] 11.1 In `UTXOLabeling` (`src/screens/UTXOManagement/UTXOLabeling.tsx`): read the UTXO's `spendability` and `isManualOverride` from `useUTXOSpendability`
- [x] 11.2 For a Spendable UTXO: render a "Mark Do Not Spend" button that dispatches `markUTXOSpendability({ wallet, txId, vout, spendability: 'doNotSpend' })` and shows a success toast "Coin marked Do Not Spend"
- [x] 11.3 For a Do Not Spend UTXO: render the reason line ("Potential dust payment" when `isManualOverride` is false, "Marked manually" when true), the explanation "Keeper marked this coin Do Not Spend to help protect wallet privacy.", and a "Mark Spendable" button that dispatches `markUTXOSpendability({ wallet, txId, vout, spendability: 'spendable' })` and shows a success toast "Coin marked spendable"

## 12. Tests

- [x] 12.1 Unit tests for `classifyDustUTXO`: cover all six acceptance criteria scenarios (reused receive, out-of-order receive, reused change, fresh receive, fresh change, above threshold)
- [x] 12.2 Unit test for pre-sync snapshot logic: verify manual override is preserved on hard refresh simulation
- [x] 12.3 Unit test for `useUTXOSpendability` hook: verify `hasDoNotSpendUTXOs` reflects correct state
