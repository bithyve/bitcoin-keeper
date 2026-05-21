## 1. HomeScreen — Wallets & Keys Tab Titles

- [x] 1.1 In `src/screens/Home/HomeScreen.tsx`, add `useAppSelector` read of `bitcoinNetworkType` from `state.settings`
- [x] 1.2 Derive a `testnetSuffix` constant: `' (Testnet)'` when `bitcoinNetworkType === NetworkType.TESTNET`, otherwise `''`
- [x] 1.3 In the `getContent()` switch, append `testnetSuffix` to the `walletText.homeWallets` string when building the Wallets case title — pass as the `title` prop to `HomeScreenHeader`
- [x] 1.4 In the `getContent()` switch, append `testnetSuffix` to the `walletText.keys` string when building the Keys case title — pass as the `title` prop to `HomeScreenHeader`
- [x] 1.5 Verify that the `HomeScreenHeader`'s `getHeaderTitle` / `capitalizeEachWord` does not mangle `(Testnet)` — confirm by inspection

## 2. Receive Bitcoin Screen

- [x] 2.1 In `src/screens/Recieve/ReceiveScreen.tsx`, add `useAppSelector` read of `bitcoinNetworkType` from `state.settings`
- [x] 2.2 Import `NetworkType` from `src/services/wallets/enums` if not already imported
- [x] 2.3 Derive the header title: `bitcoinNetworkType === NetworkType.TESTNET ? \`${common.receive} (Testnet)\` : common.receive`
- [x] 2.4 Pass the derived title string to the `WalletHeader` `title` prop at line ~353

## 3. Send Confirmation Screen

- [x] 3.1 In `src/screens/Send/SendConfirmation.tsx`, add `useAppSelector` read of `bitcoinNetworkType` from `state.settings`
- [x] 3.2 Import `NetworkType` from `src/services/wallets/enums` if not already imported
- [x] 3.3 Derive the header title: `bitcoinNetworkType === NetworkType.TESTNET ? \`${common.sendConfirmation} (Testnet)\` : common.sendConfirmation`
- [x] 3.4 Pass the derived title string to the `WalletHeader` `title` prop at line ~653

## 4. Tests

- [x] 4.1 Add/update a render test for `HomeScreen` (or `HomeScreenHeader`) asserting that `Wallets (Testnet)` appears in the header when `bitcoinNetworkType` is `TESTNET`
- [x] 4.2 Add/update a render test asserting that `Keys (Testnet)` appears when `bitcoinNetworkType` is `TESTNET`
- [x] 4.3 Add/update a render test for `ReceiveScreen` asserting `Receive Bitcoin (Testnet)` in the header when `bitcoinNetworkType` is `TESTNET`
- [x] 4.4 Add/update a render test for `SendConfirmation` asserting the title includes `(Testnet)` when `bitcoinNetworkType` is `TESTNET`
- [x] 4.5 Add render tests asserting no `(Testnet)` text appears in any of the four headers when `bitcoinNetworkType` is `MAINNET`
