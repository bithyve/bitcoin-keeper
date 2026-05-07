## Context

`ConnectChannel.tsx` is the screen that bridges the app to hardware signers over the network channel. It handles multiple interaction modes including `ADDRESS_VERIFICATION`. In the current code, `useVault` (a Realm-backed React hook) is called inside an `if (mode === InteracationMode.ADDRESS_VERIFICATION)` block — a direct violation of React's Rules of Hooks. React requires all hooks to be called unconditionally at the top level of a component; calling a hook inside a conditional causes React to lose track of hook call order, crashing the component on render.

## Goals / Non-Goals

**Goals:**
- Fix the crash by calling `useVault` unconditionally at the top level of `ConnectChannel`.
- Derive address-verification-specific values from the vault result conditionally (after the hook call).

**Non-Goals:**
- Not changing address verification behavior or any UX flow.
- Not refactoring other parts of `ConnectChannel.tsx`.

## Decisions

**Decision: Move `useVault` to the top level, gate the derived values with `mode === ADDRESS_VERIFICATION`.**

The `useVault` hook must always be called. When `vaultId` is provided (which it always is for `ADDRESS_VERIFICATION`), it returns the `activeVault`. The conditional logic that derives `descriptorString`, `miniscriptPolicy`, `addressIndex`, `walletName`, `hmac`, and `receivingAddress` from the vault can remain gated by the mode check — only the hook call itself must be moved.

Alternative considered: extract address-verification data into a separate hook or component. Rejected: unnecessary complexity for a one-line structural fix.

## Risks / Trade-offs

- [Risk] `useVault` is called even when `vaultId` is absent (non-address-verification modes). → Mitigation: `useVault` already handles `vaultId = ''` gracefully, returning `null` for `activeVault`.

## Migration Plan

Single file change — no store migrations, no Realm schema changes, no new dependencies. Deploy as a patch release.

## Open Questions

None.
