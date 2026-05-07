## Why

The app crashes instantly when the user taps "Verify Address" on the Receive screen. The root cause is a React Hooks Rules violation in `ConnectChannel.tsx`: the `useVault` hook is called inside a conditional `if (mode === InteracationMode.ADDRESS_VERIFICATION)` block, which is forbidden by React's rules of hooks. This causes a runtime error on every navigation to `ConnectChannel` with `ADDRESS_VERIFICATION` mode.

## What Changes

- Move the `useVault` hook call from inside the conditional `if (mode === InteracationMode.ADDRESS_VERIFICATION)` block to the top level of the `ConnectChannel` component.
- Derive `descriptorString`, `miniscriptPolicy`, `addressIndex`, `walletName`, `hmac`, and `receivingAddress` from the unconditionally fetched vault, gated by the `mode` condition at the data-derivation level (not the hook-call level).

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
<!-- No spec-level behavior changes; this is a bug fix restoring existing intended behavior. -->

## Impact

- **File**: `src/screens/Channel/ConnectChannel.tsx`
- **Scope**: Affects all environments (mainnet + testnet) where `ADDRESS_VERIFICATION` mode is used.
- **Hardware signers**: Fixes address verification for BITBOX02, LEDGER, TREZOR, COLDCARD, JADE (all signers routed through `ConnectChannel`).
- **Security/Privacy**: No change to key material handling or network calls; fix is purely structural (hook placement).
- **Subscription**: No gating changes.

## Non-goals

- Not changing the address verification logic or UX flow.
- Not fixing other potential issues in `ConnectChannel.tsx`.
