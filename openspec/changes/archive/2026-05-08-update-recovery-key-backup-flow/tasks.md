## 1. State Management

- [x] 1.1 Add `RecoveryKeyStatus` type (`'generated' | 'viewed' | 'confirmed' | 'skipped'`) to `src/store/reducers/account.ts`
- [x] 1.2 Add `recoveryKeyStatusByAppId: { [appId: string]: RecoveryKeyStatus }` field to account slice initial state
- [x] 1.3 Add `setRecoveryKeyStatus` reducer action accepting `{ appId: string; status: RecoveryKeyStatus }`
- [x] 1.4 Export `setRecoveryKeyStatus` action and update existing `setRecoveryKeyBackedUp` callers to use the new action where appropriate
- [x] 1.5 Add a migration entry in `src/store/migrations.ts` that maps the old `recoveryKeyBackedUpByAppId` Boolean values to the new `recoveryKeyStatusByAppId` enum values (`true → 'confirmed'`, `false/missing → 'generated'`) and bumps the store version

## 2. Education & Skip-Warning Sheets (HomeScreen)

- [x] 2.1 Replace the current non-dismissable `KeeperModal` in `src/screens/Home/HomeScreen.tsx` with a `recoveryKeyFlowState` local state (`'idle' | 'education' | 'skipWarning'`) and a session-scoped `useRef` flag to prevent re-showing after dismissal in the same session
- [x] 2.2 Add the education sheet modal stanza with title "Protect Your Recovery Key", approved body copy, primary button "Back Up Now", and secondary button "Skip for Now"
- [x] 2.3 Wire "Back Up Now" to navigate to `ViewRecoveryKeyScreen` and dispatch `setRecoveryKeyStatus({ appId, status: 'viewed' })`
- [x] 2.4 Wire "Skip for Now" to transition `recoveryKeyFlowState` to `'skipWarning'`
- [x] 2.5 Add the skip-warning sheet modal stanza with title "Continue Without Backup?", risk body copy, warning box, secondary info box, primary button "Back Up Recovery Key", secondary button "Continue Without Backup", and footer text
- [x] 2.6 Wire "Back Up Recovery Key" on the warning sheet to navigate to `ViewRecoveryKeyScreen` and dispatch status `'viewed'`
- [x] 2.7 Wire "Continue Without Backup" to dispatch `setRecoveryKeyStatus({ appId, status: 'skipped' })` and set `recoveryKeyFlowState` to `'idle'`

## 3. Recovery Key Viewing Screen Updates

- [x] 3.1 Update `src/screens/BackupWallet/ViewRecoveryKeyScreen.tsx` primary button label to "I've Written It Down" and secondary button to "Back" (replacing the current navigation-reset-only behaviour)
- [x] 3.2 Wire "I've Written It Down" to open the confirmation sheet (transition to an `isConfirmationVisible` state rather than the current `confirmSeedModal` default-true approach)
- [x] 3.3 Wire "Back" button to `navigation.goBack()`
- [x] 3.4 Ensure navigating to this screen from the education/warning sheet does NOT use `CommonActions.reset`; use `navigation.navigate('ViewRecoveryKeyScreen')` instead

## 4. Confirmation Sheet

- [x] 4.1 Compute a `confirmWordIndex` once per flow initiation using `Math.floor(Math.random() * 12)` (stored in a `useRef` so it is stable across retries)
- [x] 4.2 Pass `confirmWordIndex` and the corresponding expected word to `ConfirmSeedWord` component inside the confirmation sheet
- [x] 4.3 On correct word submission: dispatch `setRecoveryKeyStatus({ appId, status: 'confirmed' })` and `backupAllSignersAndVaults` / `seedBackedUp` saga actions (preserve existing backup saga dispatch), dismiss the sheet, and show toast/snackbar "Recovery Key backed up successfully"
- [x] 4.4 On incorrect word submission: show inline error "That word does not match. Please check your Recovery Key and try again." and keep the sheet open for retry
- [x] 4.5 Wire "Back" on the confirmation sheet to return to `ViewRecoveryKeyScreen`

## 5. Non-Blocking Reminder Banner

- [x] 5.1 Create `src/components/RecoveryKeyReminderBanner.tsx` — a small banner with label "Recovery Key not backed up" and a "Back Up Now" `TouchableOpacity`
- [x] 5.2 Accept an `onPress` prop that re-triggers the education sheet flow
- [x] 5.3 Render `RecoveryKeyReminderBanner` in `src/screens/Home/HomeScreen.tsx` when `recoveryKeyStatusByAppId[appId]` is `'skipped'`

## 6. Cleanup & Correctness

- [x] 6.1 Remove or update any code that performs `CommonActions.reset` to `ViewRecoveryKeyScreen` as a hard gate (the navigation reset is no longer needed for the primary flow)
- [x] 6.2 Ensure the `close` prop on the education `KeeperModal` is wired to dismiss the sheet (no longer `() => {}`) so tapping outside / pressing back on Android closes it gracefully (transitions to `'idle'` without changing status)
- [x] 6.3 Confirm that users with existing `recoveryKeyBackedUpByAppId[appId] === true` do not see any Recovery Key prompts after migration

## 7. Testing

- [x] 7.1 Unit-test the migration function: verify `true → 'confirmed'`, `false → 'generated'`, missing → `'generated'`
- [x] 7.2 Unit-test `setRecoveryKeyStatus` reducer transitions
- [x] 7.3 Add a Jest render test for `HomeScreen` asserting the education sheet is visible when status is `'generated'` and hidden when status is `'confirmed'`
- [x] 7.4 Add a Jest render test for `RecoveryKeyReminderBanner` asserting it renders correctly and fires `onPress`
- [x] 7.5 Snapshot-test or render-test the confirmation sheet with a mocked word list to verify the correct 1-based prompt index is displayed
