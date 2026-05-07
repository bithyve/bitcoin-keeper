## Why

During Server Key setup on iOS, the "Set up 2FA for Server Key" screen shows an error
toast ("Cannot read properties of undefined (reading 'model')"), the QR code fails to
render or remains blank, and sometimes only the manual key is shown. The root cause is a
combination of broken error handling in `SigningServer.ts` (all catch blocks can silently
swallow errors, causing `res.data` to be accessed on an `undefined` `res`), unsafe nested
property access in `SetupSigningServer.tsx`, no error-state for the loading spinner, and
missing QR code render-error handling.

## What Changes

- **`src/services/backend/SigningServer.ts`**: Apply the safe rethrow pattern to all 12+
  method catch blocks (use `err.response?.data?.err || err.code || err.message ||
  err.toString()`). This prevents silent swallowing of axios errors and prevents secondary
  TypeErrors when `res` is `undefined` after a failed request.
- **`src/screens/SigningDevices/SetupSigningServer.tsx`**: Change `validationKey === ''`
  guard to `!validationKey` (handles `undefined`/`null` too); use optional chaining
  `setupData?.verification?.verifier` for safe property access; add a loading/error state
  so the screen shows meaningful feedback (retry button) when registration fails instead of
  permanently showing a spinner.
- **`src/screens/SigningDevices/SetupAdditionalServerKey.tsx`**: Same guard change
  (`!validationKey`) to keep parity.
- **`src/components/KeeperQRCode.tsx`**: Accept an optional `onError` callback prop and
  pass it through to the underlying `QRCode` component from `react-native-qrcode-svg`, so
  QR generation failures on iOS are handled gracefully rather than crashing the component.

## Capabilities

### New Capabilities
_(None — this is a pure bug-fix change.)_

### Modified Capabilities
- `signing-server-2fa-setup`: The 2FA QR-code setup flow now handles registration errors
  and QR render failures gracefully instead of crashing or showing a stuck spinner.

## Impact

- **Affected code**: `src/services/backend/SigningServer.ts`,
  `src/screens/SigningDevices/SetupSigningServer.tsx`,
  `src/screens/SigningDevices/SetupAdditionalServerKey.tsx`,
  `src/components/KeeperQRCode.tsx`
- **Environments**: Affects both mainnet and testnet (error handling applies to both).
- **Hardware signers**: N/A — this change is in the assisted-key (Server Key) path only.
- **Subscription tiers**: N/A — the Server Key 2FA setup screen is available to all tiers
  that support the Server Key.
- **Security/privacy**: The fix tightens error handling; no key material is exposed by the
  changes. Error messages surfaced to the user remain generic.
- **Non-goals**: We are not refactoring the full `SigningServer.ts` API surface; we are
  only fixing the broken catch-block pattern. We are not adding analytics/logging beyond
  what already exists.
