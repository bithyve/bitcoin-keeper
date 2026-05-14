## Analysis

Root causes of the 2FA setup regression on iOS:

1. **Silent error swallowing** — All catch blocks in `SigningServer.ts` skip rethrowing
   when `err.response` and `err.code` are both absent (network timeout, SSL failure).
   `res` stays `undefined`; the next line (`res.data`) throws a secondary TypeError whose
   property name depends on the runtime path ("model", "data", etc.).

2. **Unsafe nested access** — `setupData.verification.verifier` throws if
   `setupData.verification` is `null`/`undefined`.

3. **Wrong guard condition** — `validationKey === ''` doesn't catch `undefined`/`null`,
   causing the QR renderer to run with a falsy key.

4. **No QR render-error handling** — `KeeperQRCode` doesn't forward `onError` to the
   underlying `react-native-qrcode-svg`, so iOS render failures crash the component tree.

---

## Tasks

- [x] **T1 — Fix catch blocks in `SigningServer.ts`**
  Apply `throw new Error(err.response?.data?.err || err.code || err.message || err.toString())` to every axios catch block in `src/services/backend/SigningServer.ts` (methods: `register`, `validate`, `addSecondaryVerificationOption`, `removeSecondaryVerificationOption`, `fetchSignerSetup`, `updateBackupSetting`, `fetchBackup`, `updatePolicy`, `signPSBT`, `fetchSignedDelayedTransaction`, `cancelDelayedTransaction`, `fetchDelayedPolicyUpdate`, `checkSignerHealth`, `migrateSignerPolicy`).

- [x] **T2 — Add `onError` prop to `KeeperQRCode`**
  In `src/components/KeeperQRCode.tsx` accept an optional `onError?: (error: Error) => void` prop and pass it to `<QRCode onError={onError} .../>`.

- [x] **T3 — Fix `SetupSigningServer.tsx`**
  - Change `validationKey === ''` guard to `!validationKey`.
  - Use `setupData?.verification?.verifier ?? ''` when calling `setValidationKey`.
  - Add a `registrationError` boolean state; when `registerSigningServer` fails, set `registrationError = true`.
  - When `registrationError` is true, render an error message and a "Retry" button (calls `registerSigningServer` again) instead of the spinner.
  - Pass `onError` to `KeeperQRCode` that logs the error (or shows toast) so QR render failures are surfaced.

- [x] **T4 — Fix `SetupAdditionalServerKey.tsx`**
  Change `validationKey === ''` guard to `!validationKey` for parity with T3.
