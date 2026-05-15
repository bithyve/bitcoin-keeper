## ADDED Requirements

### Requirement: UTXO spendability classification and persistence
The system SHALL persist a spendability state for each current wallet-owned `UTXO` in `Wallet` or `Vault` as either `Spendable` or `Do Not Spend`, including a reason and user override marker.

#### Scenario: Classify new receive-address dust
- **GIVEN** a wallet refresh identifies a new `UTXO` worth 4,999 satoshis on a receive address that has received before
- **WHEN** classification runs during sync
- **THEN** the `UTXO` SHALL be persisted as `Do Not Spend` with reason `Potential dust payment`

#### Scenario: Classify out-of-order receive-address dust
- **GIVEN** a wallet refresh identifies a new `UTXO` worth 4,000 satoshis on receive address index 2 while highest received receive index is 7
- **WHEN** classification runs during sync
- **THEN** the `UTXO` SHALL be persisted as `Do Not Spend` with reason `Potential dust payment`

#### Scenario: Do not classify non-dust by value
- **GIVEN** a new `UTXO` worth 5,000 satoshis or more on any address
- **WHEN** classification runs during sync
- **THEN** the `UTXO` SHALL be persisted as `Spendable`

#### Scenario: Preserve user override
- **GIVEN** a `UTXO` is marked spendable by user override
- **WHEN** subsequent refresh classification runs
- **THEN** the same `UTXO` SHALL remain `Spendable` unless user changes it again

### Requirement: Already-spent dust descendant handling (one level)
The system SHALL identify historical potential dust spends and mark traceable current wallet-owned one-level descendants as `Do Not Spend`.

#### Scenario: Mark one-level descendants
- **GIVEN** a historical potential-dust `UTXO` has been spent and one direct output descendant is currently owned by the same `Wallet`
- **WHEN** dust spend tracing runs
- **THEN** the descendant `UTXO` SHALL be marked `Do Not Spend` with reason `Linked to potential dust spend`

#### Scenario: Out-of-scope deeper descendants
- **GIVEN** a potential-dust lineage has descendants beyond one transaction hop
- **WHEN** tracing runs in this version
- **THEN** only direct descendants SHALL be considered for automatic marking

### Requirement: Dust detection one-time notification
The system SHALL show a one-time informational toast for newly detected potential dust during normal refresh scans.

#### Scenario: Show one-time toast for new dust
- **GIVEN** refresh detects a newly classified `Do Not Spend` `UTXO` with reason `Potential dust payment`
- **WHEN** the wallet is in normal post-import runtime refresh
- **THEN** the app SHALL show `Potential dust payment found` exactly once for that `UTXO`

#### Scenario: Suppress repeated toast
- **GIVEN** the same potential dust `UTXO` is seen in later refreshes
- **WHEN** classification runs again
- **THEN** no additional dust toast SHALL be shown for that `UTXO`
