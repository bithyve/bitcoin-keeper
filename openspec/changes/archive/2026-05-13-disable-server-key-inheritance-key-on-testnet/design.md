## Context

Bitcoin Keeper supports two network environments: Mainnet and Testnet. Testnet is selectable by users in App Settings → Network Type, and is the default in development builds (`ENVIRONMENT=DEVELOPMENT`). The network state is stored in Redux (`state.settings.bitcoinNetworkType`) and read throughout the app via `useAppSelector`.

Three feature groups have entry points that must be disabled on Testnet:

1. **Server Key (POLICY_SERVER)** — added through the Software signer category in `SigningDeviceList.tsx`. The `getDeviceStatus()` utility in `src/hardware/index.ts` already produces `{ disabled, message }` for each signer type; `SigningDeviceList` renders these onto `SigningDeviceCard`.

2. **Enhanced Security options (Inheritance Key, Emergency Key, Wallet Timelock)** — selected in `EnhancedSecurityModal` inside `AddNewWallet.tsx`. Cards are already conditionally disabled for non-L3 users via `disabled={!isOnL3Above}`. The modal has a "Save Changes" button.

3. **Inheritance Key CTA** — in `AssistedKeys.tsx` (Inheritance Planning section), which navigates directly to `AddNewWallet` with `isAddInheritanceKeyFromParams: true`, bypassing the normal modal flow.

## Goals / Non-Goals

**Goals:**
- Disable Server Key, Inheritance Key, Emergency Key, and Wallet Timelock entry points when `bitcoinNetworkType === NetworkType.TESTNET`.
- Show "Not available on Testnet." as subtext on each disabled card.
- Disable the "Save Changes" button in `EnhancedSecurityModal` when Testnet is active.
- Disable the Inheritance Key CTA button in `AssistedKeys.tsx` on Testnet.
- Zero behaviour change on Mainnet.

**Non-Goals:**
- Modifying `getDeviceStatus()` in `hardware/index.ts` (keep it network-agnostic).
- Adding bottom sheets or interstitials for blocked navigation.
- Changing routing, navigator config, or deep link handling.
- Removing or hiding cards — disabled state only, cards remain visible.

## Decisions

### Decision 1: Pass `networkType` into `getDeviceStatus()` and handle the testnet check inside `getPolicyServerStatus()`

**Options considered:**
- A. Pass `networkType` into `getDeviceStatus()` — touches the function signature and its two callers (`SigningDeviceList`, `AssignSignerType`), but keeps the gate logic co-located with all other `POLICY_SERVER` status logic.
- B. Override the result in the caller after `getDeviceStatus()` returns — localised to the caller but duplicates guard logic outside the utility where all other status checks live.

**Decision:** Option A. Add an optional `networkType?: NetworkType` parameter to `getDeviceStatus()`. Pass it through to `getPolicyServerStatus()`. Inside `getPolicyServerStatus()`, check testnet first (before subscription or scheme checks) and return `{ disabled: true, message: 'Not available on Testnet.', displayToast: false }`. Both callers (`SigningDeviceList` and `AssignSignerType`) pass `bitcoinNetworkType` from Redux.

```
// hardware/index.ts — updated signatures
export const getDeviceStatus = (
  type, isNfcSupported, isOnL1, isOnL2, scheme, existingSigners,
  addSignerFlow, networkType?: NetworkType   // ← new optional param
)

const getPolicyServerStatus = (
  type, isOnL1, scheme, addSignerFlow, existingSigners, networkType?: NetworkType
) => {
  if (networkType === NetworkType.TESTNET) {
    return { disabled: true, message: 'Not available on Testnet.', displayToast: false };
  }
  // existing checks follow unchanged
}
```

### Decision 2: Additive `isTestnet` guard in `EnhancedSecurityModal` — independent of L3 gate

The L3 subscription gate (`!isOnL3Above`) and the testnet gate (`isTestnet`) are orthogonal. A user could be on L3 on Testnet. The guard is:

```
disabled={!isOnL3Above || isTestnet}
```

Subtext becomes a ternary:
```
isTestnet ? 'Not available on Testnet.' : <existing subtext>
```

The "Save Changes" `buttonCallback` is already passed to `KeeperModal`; `KeeperModal` accepts a `buttonDisabled` prop (verify at implementation time) or the callback can be wrapped to no-op on testnet.

### Decision 3: Disable CTA callback in `AssistedKeys.tsx` rather than adding a guard screen

The `AssistedKeysSlider` accepts items with a `callback` field. On Testnet, `callback` is set to `null` or a no-op so the button is inert. This is the lightest-touch approach and consistent with disabling rather than removing.

## Risks / Trade-offs

- **`getDeviceStatus()` callers must be updated** → Both `SigningDeviceList` and `AssignSignerType` call this function. `AssignSignerType` already overrides the POLICY_SERVER result (`disabled = false`); its override will continue to apply after the new parameter is added. The `networkType` param is optional with a default of `undefined`, so callers that don't pass it are unaffected.
- **`KeeperModal` `buttonDisabled` prop may not exist** → Mitigation: Check `KeeperModal` props at implementation time. If not present, wrap `buttonCallback` in a conditional no-op rather than adding a new prop to the shared component.
- **`AssistedKeysSlider` CTA disabled state may not render visually** → Mitigation: Inspect `AssistedKeysSlider` and `AssistedKeysSliderContent` to confirm the button renders as disabled when `callback` is null or a separate `disabled` prop exists. Add one if needed.
- **User manually toggling network mid-session** → Not a risk: Redux state is reactive; all `useAppSelector` reads update on next render automatically.

## Open Questions

None — all decisions are settled.
