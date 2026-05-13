## ADDED Requirements

### Requirement: Recovery Key display opens directly after passcode verification
When the user navigates to "View Recovery Key" in Settings and completes passcode verification, the app SHALL navigate directly to the Recovery Key display screen without showing any intermediate backup modal or confirmation step.

#### Scenario: Correct passcode leads directly to Recovery Key display
- **GIVEN** the user is on the Recovery Key settings screen
- **WHEN** the user taps "View Recovery Key" and enters the correct passcode
- **THEN** the app dismisses the passcode modal and navigates to `ViewRecoveryKeyScreen`
- **AND** no "Backup Now" modal appears

#### Scenario: Backup Now modal never appears in this flow
- **GIVEN** the user has passed passcode verification via the "View Recovery Key" Settings entry point
- **WHEN** `ViewRecoveryKeyScreen` is shown
- **THEN** no backup modal or "Backup Now" CTA is displayed before or during the Recovery Key display

#### Scenario: Incorrect passcode leaves the user on the passcode screen
- **GIVEN** the user is on the passcode verification modal (triggered from "View Recovery Key")
- **WHEN** the user enters an incorrect passcode
- **THEN** the app stays on the passcode screen with the existing error message
- **AND** no navigation to `ViewRecoveryKeyScreen` occurs

#### Scenario: Back navigation returns to Recovery Key settings
- **GIVEN** the user is on `ViewRecoveryKeyScreen` reached via "View Recovery Key" in Settings
- **WHEN** the user presses the back button
- **THEN** the app returns to the Recovery Key settings screen (`AppBackupSettings`)

### Requirement: Viewing the Recovery Key does not mark backup as confirmed
Navigating to `ViewRecoveryKeyScreen` from the Settings "View Recovery Key" entry point SHALL NOT update the Recovery Key backup confirmation status, trigger `seedBackedUp`, or affect Health Check completion state.

#### Scenario: View-only navigation does not dispatch seedBackedUp
- **GIVEN** the user has navigated to `ViewRecoveryKeyScreen` via "View Recovery Key" in Settings
- **WHEN** the screen is displayed
- **THEN** `seedBackedUp` is NOT dispatched
- **AND** the Recovery Key confirmation status in the store is unchanged

#### Scenario: User must explicitly confirm to mark backup done
- **GIVEN** the user is on `ViewRecoveryKeyScreen`
- **WHEN** the user taps "I Have Written It Down" and completes seed word confirmation
- **THEN** `seedBackedUp` is dispatched and the confirmation status is updated
- **AND** this is the only path that marks the backup as confirmed

### Requirement: Health Check and reminder flows are unaffected
The backup confirmation flow in Health Check and periodic reminders SHALL continue to function independently of the Settings "View Recovery Key" entry point fix.

#### Scenario: Health Check backup confirmation flow is unchanged
- **GIVEN** the user is in the Health Check flow
- **WHEN** the user reaches the backup confirmation step
- **THEN** the backup confirmation modal and navigation behave as before this change
