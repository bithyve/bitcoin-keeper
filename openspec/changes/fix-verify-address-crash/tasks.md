## Analysis

The app crashes in `ConnectChannel.tsx` because `useVault` is called inside a conditional
`if (mode === InteracationMode.ADDRESS_VERIFICATION)` block (lines 141–161). React's Rules
of Hooks require all hooks to be called at the top level of a component, never inside
conditionals, loops, or nested functions. Violating this rule corrupts React's internal
hook state and causes an immediate runtime crash.

**Root cause**: `useVault({ vaultId })` at line 142 is inside an `if` block.

**Fix**: Move `useVault({ vaultId })` to the top level of `ConnectChannel`, then gate
the address-verification derived values (`descriptorString`, `miniscriptPolicy`,
`addressIndex`, `walletName`, `hmac`, `receivingAddress`) with the mode check at the
data-derivation level — not the hook-call level.

## 1. Fix ConnectChannel hook violation

- [ ] 1.1 Move `useVault({ vaultId })` call to the top level of `ConnectChannel` (outside the `if (mode === InteracationMode.ADDRESS_VERIFICATION)` block)
- [ ] 1.2 Retain the `if (mode === InteracationMode.ADDRESS_VERIFICATION)` conditional block for deriving `descriptorString`, `miniscriptPolicy`, `addressIndex`, `walletName`, `hmac`, and `receivingAddress` from the now-unconditionally fetched vault
