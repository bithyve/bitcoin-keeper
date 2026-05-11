# signer-setup-segment-visibility Specification

## Purpose
TBD - created by archiving change fix-passport-setup-segment-contrast. Update Purpose after archive.
## Requirements
### Requirement: Signer setup segmented options remain readable
The system MUST render both selected and unselected options in the signer setup segmented controller with sufficient visual contrast in supported themes, so users can identify Singlesig and Multisig choices during setup.

#### Scenario: Readable inactive option in light theme
- **GIVEN** a user is on a signer setup flow that shows the segmented controller for Singlesig and Multisig selection
- **WHEN** one option is inactive in light theme
- **THEN** the inactive option label SHALL remain clearly readable against the segmented control background

#### Scenario: Selected option remains readable after contrast fix
- **GIVEN** a user is on a signer setup flow with the segmented controller rendered
- **WHEN** the user selects either Singlesig or Multisig
- **THEN** the selected option label SHALL remain readable on the selected segment background

