## ADDED Requirements

### Requirement: ConnectChannel renders without crashing in ADDRESS_VERIFICATION mode
The `ConnectChannel` screen SHALL render successfully when navigated to with `mode === InteracationMode.ADDRESS_VERIFICATION`, without throwing a React hooks rules violation error.

#### Scenario: Navigating to Verify Address does not crash the app
- **GIVEN** a user is on the Receive screen for a Vault that has at least one address-verifiable signer
- **WHEN** the user taps the "Verify Address" button and selects a signer
- **THEN** the app SHALL navigate to `ConnectChannel` without crashing
- **AND** the QR scanner SHALL be displayed so the user can scan the desktop channel QR code
