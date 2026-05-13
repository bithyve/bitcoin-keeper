## 1. Inspect Component APIs

- [x] 1.1 Confirm `KeeperModal` props — verify whether a `buttonDisabled` prop exists or whether the callback must be conditionally wrapped
- [x] 1.2 Confirm `AssistedKeysSlider` / `AssistedKeysSliderContent` — verify how the CTA button is rendered and whether a `disabled` prop or a null `callback` suppresses it

## 2. Server Key — getDeviceStatus + callers

- [x] 2.1 Add optional `networkType?: NetworkType` parameter to `getDeviceStatus()` in `src/hardware/index.ts` (last positional param, default `undefined`)
- [x] 2.2 Pass `networkType` through to `getPolicyServerStatus()` and add testnet check as the first guard: return `{ disabled: true, message: 'Not available on Testnet.', displayToast: false }` when `networkType === NetworkType.TESTNET`
- [x] 2.3 In `SigningDeviceList.tsx`: read `bitcoinNetworkType` from Redux and pass it as the `networkType` argument to `getDeviceStatus()`
- [x] 2.4 In `AssignSignerType.tsx`: read `bitcoinNetworkType` from Redux and pass it as the `networkType` argument to `getDeviceStatus()` (the existing POLICY_SERVER override in that screen is unaffected)

## 3. Enhanced Security Modal — AddNewWallet

- [x] 3.1 Read `bitcoinNetworkType` from Redux in `EnhancedSecurityModal` and derive `isTestnet`
- [x] 3.2 Inheritance Key card: add `|| isTestnet` to its `disabled` prop; conditionally replace subtext with "Not available on Testnet." when `isTestnet`
- [x] 3.3 Emergency Key card: same pattern as 3.2
- [x] 3.4 Wallet Timelock card: same pattern as 3.2
- [x] 3.5 "Save Changes" button: disable when `isTestnet` (via `buttonDisabled` prop or no-op callback wrapper per finding from task 1.1)

## 4. Inheritance Key CTA — AssistedKeys

- [x] 4.1 Read `bitcoinNetworkType` from Redux in `AssistedKeys.tsx` and derive `isTestnet`
- [x] 4.2 Set the Inheritance Key item `callback` to `undefined` or a no-op when `isTestnet` (or pass a `disabled` prop if the slider component supports it per finding from task 1.2)

## 5. Verification

- [ ] 5.1 Switch app to Testnet — confirm Server Key card in Software signer list is greyed, non-tappable, shows "Not available on Testnet."
- [ ] 5.2 Switch app to Testnet — open Enhanced Security modal, confirm all three cards are greyed and subtext shows "Not available on Testnet.", confirm "Save Changes" is disabled
- [ ] 5.3 Switch app to Testnet — open Inheritance Planning → Assisted Keys slide, confirm CTA button is inert
- [ ] 5.4 Switch app to Mainnet — confirm all three areas behave exactly as before (no regression)
