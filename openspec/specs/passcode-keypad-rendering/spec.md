# passcode-keypad-rendering Specification

## Purpose
TBD - created by archiving change fix-passcode-keypad-missing-digit. Update Purpose after archive.
## Requirements
### Requirement: Shared passcode keypad renders all numeric keys
The system SHALL render all numeric keys from `0` through `9` when the shared passcode keypad is shown in authentication flows that use `KeyPadView`.

#### Scenario: Login keypad loads with every digit visible
- **GIVEN** the user opens the login screen on mainnet or testnet
- **WHEN** the shared passcode keypad is rendered
- **THEN** numeric keys `1` through `9` and `0` MUST all be visible without waiting for a delayed re-render

#### Scenario: Passcode creation keypad reuses the same stable rendering
- **GIVEN** the user opens the passcode creation flow
- **WHEN** the shared passcode keypad is rendered
- **THEN** numeric keys `1` through `9` and `0` MUST all be visible in the initial keypad layout

#### Scenario: Rendering fix does not change passcode controls
- **GIVEN** an authentication flow renders the shared passcode keypad
- **WHEN** the keypad is displayed
- **THEN** the delete control MUST remain available
- **AND** the keypad MUST continue to emit the same numeric key values when pressed

