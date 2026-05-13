## 1. UI Components

- [x] 1.1 In `AppBackupSettings.tsx`, remove the `backupModalVisible` state variable (`const [backupModalVisible, setBackupModalVisible] = useState(false)`)
- [x] 1.2 In `AppBackupSettings.tsx`, update the `onSuccess` callback of `PasscodeVerifyModal` to call `navigation.navigate('ViewRecoveryKeyScreen')` instead of `setBackupModalVisible(true)`
- [x] 1.3 In `AppBackupSettings.tsx`, remove the second `KeeperModal` (the one with `visible={backupModalVisible}`, title `settings.RKBackupTitle`, and `buttonText={common.backupNow}`) and all its props
- [x] 1.4 In `AppBackupSettings.tsx`, remove the `import BackupModalContent from './BackupModal'` import if it is no longer used anywhere in the file

## 2. Tests

- [x] 2.1 Verify (manually or via existing tests) that pressing "View Recovery Key" in Settings, entering the correct passcode, opens `ViewRecoveryKeyScreen` directly with no intermediate modal
- [x] 2.2 Verify that entering an incorrect passcode stays on the passcode screen and does not navigate
- [x] 2.3 Verify that back navigation from `ViewRecoveryKeyScreen` returns to the Recovery Key settings screen
- [x] 2.4 Verify that the Health Check backup confirmation flow is unaffected
