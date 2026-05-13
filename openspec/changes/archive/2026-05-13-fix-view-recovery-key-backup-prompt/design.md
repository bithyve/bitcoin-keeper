## Context

In `AppBackupSettings.tsx`, when a user taps "View Recovery Key" the app opens a `PasscodeVerifyModal`. On passcode success, the current `onSuccess` handler sets `backupModalVisible = true`, which shows a "Backup Now" modal (`KeeperModal` backed by `BackupModalContent`). Only after the user presses "Backup Now" in that modal does the app navigate to `ExportSeedScreen` with `viewRecoveryKeys: true`.

`ViewRecoveryKeyScreen` already exists (`src/screens/BackupWallet/ViewRecoveryKeyScreen.tsx`) and is registered in the navigator as route `'ViewRecoveryKeyScreen'`. It displays the 12-word Recovery Key with masked reveal, optional seed word confirmation, and standard back navigation — exactly what the user expects to see after passcode verification.

No Redux slices, sagas, Realm schema, or MMKV keys are involved in this fix. It is a pure navigation/UI correction in a single file.

## Goals / Non-Goals

**Goals:**
- On passcode success in the "View Recovery Key" Settings flow, navigate directly to `ViewRecoveryKeyScreen`.
- Remove the `backupModalVisible` state variable and the associated `KeeperModal` (backup prompt) from `AppBackupSettings`.

**Non-Goals:**
- Do not modify `ViewRecoveryKeyScreen`.
- Do not change the passcode verification screen or logic.
- Do not alter the backup confirmation flow in Health Check or periodic reminders.
- Do not mark the Recovery Key as confirmed or backed up by this action.
- No store, saga, schema, or migration changes.

## Decisions

### Decision: Navigate to `ViewRecoveryKeyScreen` instead of `ExportSeedScreen`

**Chosen**: `navigation.navigate('ViewRecoveryKeyScreen')`

**Alternatives considered**:
- Keep routing to `ExportSeedScreen` with `viewRecoveryKeys: true` — this route is used in the backup confirmation context (Health Check) and carries backup-intent semantics. Using it from a "view only" entry point conflates two different intents and is what produced the bug in the first place.
- Create a new screen — unnecessary; `ViewRecoveryKeyScreen` already handles display-only viewing with optional user-initiated confirmation.

**Rationale**: `ViewRecoveryKeyScreen` is the correct, already-existing screen for viewing the Recovery Key. Routing there directly is minimal, correct, and consistent.

---

### Decision: Remove `backupModalVisible` state entirely

**Chosen**: Delete the state variable and the `KeeperModal` that uses it.

**Rationale**: After the navigation fix, neither the state nor the modal has any remaining callers. Leaving dead state in the component adds confusion. Removal is safe and clean.

## Risks / Trade-offs

- **Risk**: `BackupModalContent` or the backup `KeeperModal` in `AppBackupSettings` might be used elsewhere in the same file.  
  → **Mitigation**: Confirmed by code inspection — `BackupModalContent` is only imported for this one modal. The import of `BackupModalContent` from `./BackupModal` can also be removed if it becomes unused (check for other usages before removing the import).

- **Risk**: Removing the "Backup Now" prompt from this flow might reduce the rate at which users confirm their backup.  
  → **Mitigation**: This is intentional per the issue requirements. Backup confirmation belongs in Health Check and reminder flows, not between passcode and Recovery Key display. Those flows are unaffected.

- **No migration risk**: No persisted state changes.

## Affected Files

| File | Change |
|------|--------|
| `src/screens/AppSettings/AppBackupSettings.tsx` | Remove `backupModalVisible` state; change `onSuccess` to navigate to `ViewRecoveryKeyScreen`; remove backup `KeeperModal`; remove unused `BackupModalContent` import if no other usages |

## Open Questions

None.
