# optional-recovery-key-backup-flow Specification

## Purpose
TBD - created by archiving change update-initial-recovery-key-backup-flow. Update Purpose after archive.
## Requirements
### Requirement: Optional Recovery Key backup entry
The app MUST show a Recovery Key education bottom sheet when the user opens Wallets and their Recovery Key is not confirmed, and MUST allow app usage if the user explicitly skips after warning.

#### Scenario: User chooses to back up from education sheet
- **GIVEN** a `Wallet` user has Recovery Key status of `generated` or `viewed`
- **WHEN** the user taps "Back Up Now" on the education sheet
- **THEN** the app SHALL navigate to the Recovery Key viewing screen

#### Scenario: User chooses skip path from education sheet
- **GIVEN** a `Wallet` user has Recovery Key status of `generated` or `viewed`
- **WHEN** the user taps "Skip for Now"
- **THEN** the app SHALL open the skip warning bottom sheet before allowing normal app usage

### Requirement: Recovery Key viewing and confirmation behavior
The app MUST treat viewing as distinct from confirmation, MUST prompt for one random Recovery Key word index, and MUST mark status `confirmed` only after correct validation.

#### Scenario: Correct confirmation marks key as confirmed
- **GIVEN** a `Wallet` user is on confirmation sheet and the prompt requests index `N` from the stored 12-word Recovery Key
- **WHEN** the user enters the exact stored word at index `N` and taps "Confirm"
- **THEN** the app SHALL set Recovery Key status to `confirmed`, dismiss the sheet, and show toast "Recovery Key backed up successfully"

#### Scenario: Incorrect confirmation allows retry
- **GIVEN** a `Wallet` user is on confirmation sheet with a requested index `N`
- **WHEN** the user enters a non-matching word and taps "Confirm"
- **THEN** the app SHALL show inline error "That word does not match. Please check your Recovery Key and try again." and keep the sheet open for retry

### Requirement: Skip warning and post-skip reminder
The app MUST allow continue-without-backup after warning, MUST keep status not confirmed when skipped, and MUST surface a non-blocking reminder later.

#### Scenario: User continues without backup
- **GIVEN** a `Wallet` user opens the skip warning sheet from the education sheet
- **WHEN** the user taps "Continue Without Backup"
- **THEN** the app SHALL dismiss the sheet, set Recovery Key status to `skipped`, and allow normal app usage

#### Scenario: Skipped user sees non-blocking reminder
- **GIVEN** a `Wallet` user has Recovery Key status `skipped`
- **WHEN** the user later reaches a reminder trigger point in-app
- **THEN** the app SHALL show a non-blocking reminder with text "Recovery Key not backed up" and CTA "Back Up Now"

