# maestro-flow-reliability-and-coverage Specification

## Purpose
Define robust, cross-platform Maestro flow requirements for Bitcoin Keeper so core wallet journeys and key negative paths under `flows/` remain valid, maintainable, and reliable in CI.
## Requirements
### Requirement: Cross-platform Maestro flow syntax and execution stability
The Maestro flow suite under `flows/` SHALL use valid YAML syntax and stable assertions/selectors that execute reliably on both iOS and Android, with platform-aware conditionals where system UI or permissions differ.

#### Scenario: Existing flow audit and hardening
- **GIVEN** existing Maestro flows that cover Wallet and Vault user journeys
- **WHEN** the flow definitions are audited and updated
- **THEN** each flow SHALL avoid brittle selectors/timing assumptions and SHALL remain valid Maestro YAML for cross-platform execution

### Requirement: Reusable flow composition for shared user setup
The test suite SHALL centralize common setup/login/navigation steps using `runFlow` wrappers so major journeys reuse consistent preconditions before interacting with Wallet and Vault screens.

#### Scenario: Shared wrapper usage
- **GIVEN** multiple journey tests that require onboarding or authenticated app entry
- **WHEN** those tests are executed
- **THEN** they SHALL invoke shared wrapper flows via `runFlow` rather than duplicating setup logic inline

### Requirement: Major wallet journey coverage
The Maestro suite SHALL include flows for onboarding/setup, passcode creation and validation, login, Wallet creation and viewing, Wallet settings/details editing, receive and copy address, send, buy bitcoin, app settings, backup/export seed, version history, subscription, key management, and refresh/health-check behavior.

#### Scenario: Journey coverage presence
- **GIVEN** the `flows/` directory
- **WHEN** the suite is reviewed
- **THEN** it SHALL include flow files that cover the listed major journeys for Wallet and Vault contexts where applicable

### Requirement: Negative-path behavioral validation
The Maestro suite SHALL include negative-path flows for invalid passcode confirmation, invalid send input or missing destination address, cancellation/back navigation, and permission handling outcomes.

#### Scenario: Invalid send input handling
- **GIVEN** a Wallet send screen for a transaction with amount `0` satoshis or missing address input
- **WHEN** the user attempts to continue
- **THEN** the flow SHALL assert validation feedback and SHALL prevent send progression

#### Scenario: Invalid passcode confirmation handling
- **GIVEN** passcode setup flow requiring confirmation
- **WHEN** the confirmation passcode does not match
- **THEN** the flow SHALL assert mismatch handling and recovery path visibility

### Requirement: Coverage limitations transparency
The `flows/` directory SHALL contain a concise note enumerating known areas that cannot be fully automated with Maestro alone (for example: external app handoffs, hardware signer physical steps, and non-deterministic OS dialogs).

#### Scenario: Limitations note availability
- **GIVEN** contributors reviewing E2E scope
- **WHEN** they inspect `flows/`
- **THEN** they SHALL find a clear limitations file describing missing or partially automatable coverage boundaries
