# recovery-key-confirmation-skip Specification

## Purpose
TBD - created by archiving change add-initial-recovery-key-skip-option. Update Purpose after archive.
## Requirements
### Requirement: User can defer the initial recovery key confirmation from Home
The system SHALL show a skip option in the initial Home recovery-key modal for a software-key `Wallet`, and the skip action MUST remain disabled until the user explicitly acknowledges the recovery risk.

#### Scenario: Skip becomes available after risk acknowledgement
- **GIVEN** the current Keeper app instance has not been marked as backed up and the initial recovery-key modal is shown on Home
- **WHEN** the user reads the risk warning and checks the acknowledgement box
- **THEN** the modal SHALL enable the skip action so the user can continue using the wallet without confirming the recovery key in that session

#### Scenario: Skip stays blocked without acknowledgement
- **GIVEN** the current Keeper app instance has not been marked as backed up and the initial recovery-key modal is shown on Home
- **WHEN** the user has not checked the acknowledgement box
- **THEN** the system MUST keep the skip action disabled and MUST NOT mark the recovery key as backed up

### Requirement: Skipping MUST NOT confirm recovery-key backup state
When a user skips from the initial Home modal or exits the recovery-key confirmation screen, the system SHALL return the user to Home without dispatching the backup-confirmed actions for the software-key `Wallet`.

#### Scenario: Skip from Home leaves backup pending
- **GIVEN** the initial recovery-key modal is shown on Home for a Keeper app instance whose recovery key is still pending backup
- **WHEN** the user checks the acknowledgement box and taps skip
- **THEN** the system SHALL close the modal and keep the recovery-key backup state pending for that app instance

#### Scenario: Skip from recovery-key screen avoids false confirmation
- **GIVEN** the user has navigated to the recovery-key confirmation screen from Home
- **WHEN** the user chooses to skip instead of finishing the confirmation challenge
- **THEN** the system SHALL return the user to Home and MUST NOT dispatch backup confirmation or cloud-backup actions

