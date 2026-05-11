## ADDED Requirements

### Requirement: Recovery Key status is tracked with four distinct states
The system SHALL track Recovery Key backup status per app instance using the type `RecoveryKeyStatus = 'generated' | 'viewed' | 'confirmed' | 'skipped'`. The status SHALL be persisted in the Redux store under `recoveryKeyStatusByAppId[appId]`. On first migration from the legacy Boolean field, `true` SHALL map to `'confirmed'` and `false` / missing SHALL map to `'generated'`.

#### Scenario: New install — status defaults to generated
- **WHEN** the app is freshly installed and no Recovery Key status exists for the current appId
- **THEN** `recoveryKeyStatusByAppId[appId]` SHALL equal `'generated'`

#### Scenario: Migration from legacy Boolean true
- **WHEN** the Redux store is migrated and `recoveryKeyBackedUpByAppId[appId]` was `true`
- **THEN** `recoveryKeyStatusByAppId[appId]` SHALL equal `'confirmed'`

#### Scenario: Migration from legacy Boolean false
- **WHEN** the Redux store is migrated and `recoveryKeyBackedUpByAppId[appId]` was `false` or absent
- **THEN** `recoveryKeyStatusByAppId[appId]` SHALL equal `'generated'`

---

### Requirement: Education bottom sheet is shown when Recovery Key is not confirmed
The system SHALL display a non-full-screen bottom sheet ("Protect Your Recovery Key") over the Wallets screen whenever `recoveryKeyStatusByAppId[appId]` is `'generated'`, `'viewed'`, or `'skipped'`, and the user has not yet dismissed it in the current app session. The Wallets screen SHALL remain accessible behind the sheet (not a hard navigation gate).

#### Scenario: Education sheet appears on launch when status is generated
- **WHEN** the app launches and `recoveryKeyStatusByAppId[appId]` is `'generated'`
- **THEN** the education sheet SHALL be visible over the Wallets screen with title "Protect Your Recovery Key", body copy matching the approved spec, primary button "Back Up Now", and secondary button "Skip for Now"

#### Scenario: Education sheet appears when status is skipped
- **WHEN** the app launches and `recoveryKeyStatusByAppId[appId]` is `'skipped'`
- **THEN** the education sheet SHALL be visible over the Wallets screen

#### Scenario: Education sheet is NOT shown when status is confirmed
- **WHEN** `recoveryKeyStatusByAppId[appId]` is `'confirmed'`
- **THEN** no Recovery Key education sheet SHALL be shown

#### Scenario: Education sheet is dismissed after one appearance per session
- **WHEN** the user dismissed the education sheet (via skip path or backup path) during the current session
- **THEN** navigating away and returning to the Wallets screen SHALL NOT show the education sheet again in the same session

---

### Requirement: Tapping Back Up Now navigates to the Recovery Key viewing screen
The system SHALL navigate to `ViewRecoveryKeyScreen` when the user taps "Back Up Now" on the education sheet. The status SHALL be updated to `'viewed'` on arrival.

#### Scenario: Back Up Now from education sheet
- **WHEN** the user taps "Back Up Now" on the education sheet
- **THEN** the app SHALL navigate to `ViewRecoveryKeyScreen` and `recoveryKeyStatusByAppId[appId]` SHALL equal `'viewed'`

#### Scenario: Back button from viewing screen returns to Wallets
- **WHEN** the user taps "Back" on `ViewRecoveryKeyScreen`
- **THEN** the app SHALL return to the Wallets screen without changing the status

---

### Requirement: Tapping Skip for Now shows a skip-warning sheet
The system SHALL display a second bottom sheet ("Continue Without Backup?") when the user taps "Skip for Now" on the education sheet. This sheet SHALL be visually consistent with the education sheet and SHALL NOT use a dark full-screen error style.

#### Scenario: Skip for Now shows warning sheet
- **WHEN** the user taps "Skip for Now" on the education sheet
- **THEN** the skip-warning sheet SHALL be visible with title "Continue Without Backup?", risk body copy, a warning box, a secondary info box, primary button "Back Up Recovery Key", secondary button "Continue Without Backup", and footer text "You can back up your Recovery Key anytime from Settings."

#### Scenario: Back Up Recovery Key from warning sheet navigates to viewing screen
- **WHEN** the user taps "Back Up Recovery Key" on the skip-warning sheet
- **THEN** the app SHALL navigate to `ViewRecoveryKeyScreen` and status SHALL be updated to `'viewed'`

#### Scenario: Continue Without Backup dismisses the flow
- **WHEN** the user taps "Continue Without Backup" on the skip-warning sheet
- **THEN** both sheets SHALL be dismissed, `recoveryKeyStatusByAppId[appId]` SHALL equal `'skipped'`, and the user SHALL have full access to the app

---

### Requirement: Recovery Key confirmation sheet validates a randomly selected word
The system SHALL display a bottom sheet ("Confirm Your Recovery Key") after the user taps "I've Written It Down" on `ViewRecoveryKeyScreen`. The sheet SHALL randomly select one index (0–11) from the user's 12-word Recovery Key on each flow initiation and prompt the user to enter that word. The index SHALL NOT be regenerated during a retry within the same flow.

#### Scenario: Confirmation sheet shown after I've Written It Down
- **WHEN** the user taps "I've Written It Down" on `ViewRecoveryKeyScreen`
- **THEN** the confirmation sheet SHALL appear with title "Confirm Your Recovery Key", body "To make sure you wrote it down, enter the word shown below.", a prompt such as "Enter the 7th word of your Recovery Key" (using 1-based index matching the randomly selected word), and an input field with placeholder "Type the word here"

#### Scenario: Correct word confirms Recovery Key
- **WHEN** the user enters the correct word for the prompted index and taps "Confirm"
- **THEN** `recoveryKeyStatusByAppId[appId]` SHALL equal `'confirmed'`, the confirmation sheet SHALL be dismissed, and a toast/snackbar "Recovery Key backed up successfully" SHALL be shown for approximately 2 seconds

#### Scenario: Incorrect word shows inline error
- **WHEN** the user enters an incorrect word and taps "Confirm"
- **THEN** an inline validation error "That word does not match. Please check your Recovery Key and try again." SHALL be shown, and the input SHALL remain active for retry

#### Scenario: Back from confirmation sheet
- **WHEN** the user taps "Back" on the confirmation sheet
- **THEN** the confirmation sheet SHALL be dismissed and the user SHALL return to `ViewRecoveryKeyScreen`

---

### Requirement: A non-blocking reminder is shown to users who skipped
The system SHALL display a small, non-blocking UI element on the Wallets screen when `recoveryKeyStatusByAppId[appId]` is `'skipped'`. This element SHALL show the text "Recovery Key not backed up" and a tappable "Back Up Now" call-to-action that re-opens the education sheet.

#### Scenario: Reminder shown when status is skipped
- **WHEN** the Wallets screen is displayed and `recoveryKeyStatusByAppId[appId]` is `'skipped'`
- **THEN** a non-blocking `RecoveryKeyReminderBanner` SHALL be visible with label "Recovery Key not backed up" and CTA "Back Up Now"

#### Scenario: Tapping Back Up Now on reminder opens education sheet
- **WHEN** the user taps "Back Up Now" on the reminder banner
- **THEN** the education sheet SHALL open

#### Scenario: Reminder is NOT shown when status is confirmed
- **WHEN** `recoveryKeyStatusByAppId[appId]` is `'confirmed'`
- **THEN** the reminder banner SHALL NOT be visible
