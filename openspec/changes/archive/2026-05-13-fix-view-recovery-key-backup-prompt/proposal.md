## Why

When a user taps "View Recovery Key" in Settings and passes the passcode check, the app incorrectly shows a "Backup Now" modal before displaying the Recovery Key. This intermediate modal is confusing because the user has not opted into a backup action — they only asked to view their key. The fix removes the blocking modal so the Recovery Key is shown immediately after passcode verification.

## What Changes

- Remove the `BackupModal` (`KeeperModal` with "Backup Now" CTA) from the `AppBackupSettings` passcode success callback.
- Change the `onSuccess` handler in `AppBackupSettings` to navigate directly to `ViewRecoveryKeyScreen` instead of showing the backup modal.
- Remove the `backupModalVisible` state variable from `AppBackupSettings` (dead code after the fix).

## Capabilities

### New Capabilities

- `view-recovery-key-direct`: After passcode verification from the "View Recovery Key" Settings entry point, the app navigates directly to `ViewRecoveryKeyScreen` without any intermediate backup modal.

### Modified Capabilities

<!-- No existing spec-level behaviour changes outside of the above. -->

## Impact

- **Affected file**: `src/screens/AppSettings/AppBackupSettings.tsx` — remove backup modal wiring from `onSuccess` callback; navigate to `ViewRecoveryKeyScreen` instead.
- **No store changes**: No Redux slices, sagas, or Realm schema are affected.
- **No migration needed**: No persisted state shape changes.
- **No new screens or components**: `ViewRecoveryKeyScreen` already exists and is registered in the navigator.
- **Environments**: Affects both mainnet and testnet (UI-only change, network-agnostic).
- **Hardware signer compatibility**: Not applicable — this is a Settings/backup UI flow, not a signing flow.
- **Subscription tier gating**: Not applicable — "View Recovery Key" is available to all tiers.
- **Security/privacy**: No change to key material handling. The Recovery Key mnemonic is already protected behind passcode verification; this change preserves that gate and does not expose the key earlier.

## Non-goals

- Do not add a separate "Back Up Recovery Key" action in Settings.
- Do not remove the backup confirmation flow from Health Check or periodic reminders.
- Do not mark the Recovery Key as confirmed when it is viewed.
- Do not modify `ViewRecoveryKeyScreen` — reuse it as-is.
- Do not redesign the passcode verification screen.
