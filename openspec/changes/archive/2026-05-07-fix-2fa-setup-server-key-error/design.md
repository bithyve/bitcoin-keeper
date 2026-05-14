## Context

The `SetupSigningServer` screen and `SetupAdditionalServerKey` screen handle TOTP 2FA setup
for the Server Key (assisted signing key). When the screen mounts it calls
`SigningServer.register(policy)` to obtain a TOTP secret (`verifier`) and then renders a
QR code and a copyable key for the user to add to their authenticator app.

Two independent failure paths produce the observed bugs:

1. **Silent error swallowing in `SigningServer.ts`**: Every method has the pattern:
   ```ts
   try { res = await RestClient.post(...) }
   catch (err) {
     if (err.response) throw new Error(err.response.data.err);
     if (err.code)     throw new Error(err.code);
   }
   const { ... } = res.data; // ← res is undefined if neither branch threw
   ```
   When an axios error carries neither `.response` nor `.code` (e.g. network timeout,
   SSL failure on some iOS versions, request cancellation), the catch block exits silently,
   `res` stays `undefined`, and the subsequent `res.data` access throws a secondary
   TypeError. The exact error message depends on which property is accessed first; in the
   Server Key registration flow this surfaces as the "Cannot read properties of undefined
   (reading 'model')" toast observed on iOS.

2. **Unsafe property access + wrong empty check in `SetupSigningServer.tsx`**: The line
   `setValidationKey(setupData.verification.verifier)` throws if `setupData.verification`
   is `null` or `undefined` (server returned malformed data). The loading guard
   `validationKey === ''` doesn't catch `undefined` or `null`, so the QR renderer is
   entered with an invalid value when the guard fails, which can cause QR generation
   errors.

3. **No QR render-error handling in `KeeperQRCode`**: `react-native-qrcode-svg` accepts an
   `onError` callback; without it any generation failure is re-thrown uncaught during
   rendering.

## Goals / Non-Goals

**Goals:**
- Fix all catch blocks in `SigningServer.ts` so that errors always rethrow with a useful
  message.
- Add an error state to `SetupSigningServer` so the user sees a meaningful message and
  a retry button when registration fails instead of a stuck spinner.
- Use safe optional chaining (`?.`) when reading nested API response fields.
- Change the loading guard from `=== ''` to `!validationKey` in both setup screens.
- Forward an `onError` prop through `KeeperQRCode` so callers can handle render failures.

**Non-Goals:**
- Refactoring `SigningServer.ts` to a saga-based pattern.
- Adding retry logic inside `SigningServer.ts` itself.
- Changing the API contract or response shape.
- Fixing unrelated screens or components.

## Decisions

### D1 — Safe rethrow pattern for all axios catch blocks
**Decision**: Replace `if (err.response) throw new Error(err.response.data.err); if (err.code)
throw new Error(err.code);` with
`throw new Error(err.response?.data?.err || err.code || err.message || err.toString())`.

**Rationale**: The stored memory for this codebase documents this exact safe pattern. The
single throw ensures the catch block always propagates an error so that `res.data` is never
reached on an undefined `res`.

**Alternative considered**: Wrap `res.data` in its own null-check. Rejected — it would mask
the underlying error and require duplicating null-checks in every method.

### D2 — Add `registrationError` state to `SetupSigningServer`
**Decision**: Add a boolean `registrationError` state. When `registerSigningServer` throws,
set `registrationError = true` and show an error message with a "Retry" button instead of
the spinner.

**Rationale**: The current UX leaves the user with a permanently spinning loader and a
cryptic toast. A retry button aligns with the pattern used elsewhere in the app.

### D3 — Optional chaining for nested API fields
**Decision**: Use `setupData?.verification?.verifier ?? ''` instead of
`setupData.verification.verifier`.

**Rationale**: Server responses can change; a malformed response should fall back to an
empty string (triggering the spinner/error state) rather than crash the catch block with a
secondary TypeError.

### D4 — `onError` prop in `KeeperQRCode`
**Decision**: Accept `onError?: (error: Error) => void` in `KeeperQRCode` and pass it to
the underlying `<QRCode>` component.

**Rationale**: `react-native-qrcode-svg` already supports `onError`; exposing it at the
`KeeperQRCode` level lets callers handle generation failures (e.g. log and fall back to
manual key only) without crashing the render tree.

## Risks / Trade-offs

- [Risk] Changing all `SigningServer.ts` catch blocks touches many methods in a critical
  service file. → **Mitigation**: The change is purely mechanical (same substitution
  throughout); every changed line makes the behavior strictly safer.
- [Risk] Adding `onError` to `KeeperQRCode` silently hides QR failures from callers that
  do not provide the callback. → **Mitigation**: Without an `onError` the underlying
  library already re-throws; we change nothing for existing call sites that don't pass
  `onError`.

## Affected Files

| File | Change type |
|---|---|
| `src/services/backend/SigningServer.ts` | Modify catch blocks |
| `src/screens/SigningDevices/SetupSigningServer.tsx` | Add error state, fix guards |
| `src/screens/SigningDevices/SetupAdditionalServerKey.tsx` | Fix `!validationKey` guard |
| `src/components/KeeperQRCode.tsx` | Add `onError` prop |
