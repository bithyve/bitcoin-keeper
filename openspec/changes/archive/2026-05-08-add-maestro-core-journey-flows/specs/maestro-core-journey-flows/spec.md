## ADDED Requirements

### Requirement: Core journey suite entrypoint
The system SHALL provide a Maestro flow entrypoint that executes core user journeys for onboarding/setup, wallet viewing, receive, send, app settings, and key-management.

#### Scenario: Full core regression composition
- **GIVEN** Maestro is configured with `${APPID}` and a valid test account context for Wallet and Vault screens
- **WHEN** the tester runs the core regression flow entrypoint
- **THEN** the flow MUST invoke composed subflows for onboarding/setup, wallet viewing, receive/send, app settings, and key-management in a deterministic order

### Requirement: Journey flows SHALL align with existing selectors and assertions
Each new journey flow MUST reuse established IDs/text assertions from existing Bitcoin Keeper Maestro flows to reduce selector drift and maintenance risk.

#### Scenario: Selector compatibility with current branch conventions
- **GIVEN** existing Wallet and Signer UI elements expose IDs/text used in current `flows/*.yaml`
- **WHEN** new journey wrapper flows are added
- **THEN** the wrappers MUST reference existing flow files and retain existing assertion behavior instead of introducing unverified selectors

### Requirement: Receive and send journey coverage
The suite SHALL cover receive and send pathways for a Wallet, including transition into send amount/fee review surfaces that operate on satoshi-backed wallet balances (display format may be BTC).

#### Scenario: Wallet receive and send composition
- **GIVEN** a Wallet with spendable UTXO state and at least 1100 satoshis available for test sending
- **WHEN** the receive/send journey flow runs
- **THEN** it MUST execute receive and send subflows and reach send confirmation/broadcast UI outcomes without changing Signer protocol behavior

#### Scenario: Network-dependent send handling
- **GIVEN** Electrum connectivity is offline or unstable during send journey execution
- **WHEN** the receive/send journey flow invokes the send subflow
- **THEN** the flow MUST fail at existing in-app send/network checks rather than bypassing wallet/network validation

### Requirement: Settings and key-management journey coverage
The suite SHALL include app settings and key-management pathways relevant to Wallet, Vault, and Signer maintenance surfaces.

#### Scenario: Settings and key surfaces are exercised
- **GIVEN** the test account can access settings and manage keys from current app navigation
- **WHEN** the settings and key-management journey flows run
- **THEN** the composed suite MUST traverse existing settings and key-management subflows and verify expected navigation/assertion checkpoints
