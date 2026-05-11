## Why

The home screen currently blocks the initial recovery key flow until the user completes the confirmation challenge, which prevents users from entering the app if they are not ready to back up their hot key immediately. We need a safer deferral path that still communicates the risk clearly and requires an explicit acknowledgement before allowing the user to skip.

## What Changes

- Add a skip action to the initial home screen recovery key modal so users can defer the first recovery key confirmation.
- Require users to actively acknowledge the backup risk with a checkbox before the skip action is enabled.
- Allow skipped users to continue into the wallet without marking the recovery key as backed up, so the recovery key flow can still be completed later.
- Update the recovery key confirmation screen to support a skip exit path that returns users to Home without falsely confirming backup state.

## Capabilities

### New Capabilities
- `recovery-key-confirmation-skip`: Lets a user defer the initial recovery key confirmation after explicitly acknowledging the risk in the home screen modal.

### Modified Capabilities
- None.

## Impact

- Affects both mainnet and testnet environments because the home screen and hot wallet backup flow are shared.
- No hardware signer compatibility impact; this only changes the software hot key recovery-key onboarding path.
- No subscription tier gating changes.
- Security/privacy impact: no new key material, storage location, or network call is introduced, but the UI must clearly communicate that skipping increases recovery risk if the device is lost before backup.
- Expected code areas: `src/screens/Home/HomeScreen.tsx`, `src/screens/BackupWallet/ViewRecoveryKeyScreen.tsx`, localization strings, and focused tests for the modal/skip behavior.

## Non-goals

- Changing how the recovery key is generated, stored, or encrypted.
- Marking a skipped recovery key as backed up.
- Altering hardware signer, Vault, or cloud backup flows outside the initial hot key confirmation UX.
