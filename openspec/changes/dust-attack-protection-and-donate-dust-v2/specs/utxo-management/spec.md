## ADDED Requirements

### Requirement: UTXO details manual spendability control
The UTXO details flow SHALL allow explicit spendability control for each wallet-owned `UTXO`.

#### Scenario: Mark Do Not Spend manually
- **GIVEN** a `UTXO` currently marked `Spendable`
- **WHEN** user taps `Mark Do Not Spend`
- **THEN** the `UTXO` SHALL persist as `Do Not Spend` with reason `Marked manually`

#### Scenario: Mark Spendable manually
- **GIVEN** a `UTXO` currently marked `Do Not Spend`
- **WHEN** user taps `Mark Spendable`
- **THEN** the `UTXO` SHALL persist as `Spendable` with user override enabled

### Requirement: Do Not Spend visibility in coin list
Manage Coins SHALL visibly label Do Not Spend coins while preserving existing labels.

#### Scenario: Show warning-style Do Not Spend label
- **GIVEN** Manage Coins displays a list of `UTXO` entries
- **WHEN** a row represents a `UTXO` marked `Do Not Spend`
- **THEN** the row SHALL show `Do Not Spend` using existing warning-style label treatment

#### Scenario: Preserve existing label stack
- **GIVEN** a `UTXO` has existing labels such as `Change` or `Self`
- **WHEN** the same `UTXO` is marked `Do Not Spend`
- **THEN** existing labels SHALL remain visible alongside Do Not Spend state

### Requirement: Donate Dust from Do Not Spend-only inputs
Manage Coins SHALL support a Donate Dust flow using only `Do Not Spend` UTXOs.

#### Scenario: Show Donate Dust CTA when eligible
- **GIVEN** the wallet has at least one current `Do Not Spend` `UTXO`
- **WHEN** Manage Coins is rendered
- **THEN** `Donate Dust` SHALL be available

#### Scenario: Build donation with restricted inputs
- **GIVEN** user confirms `Donate Dust`
- **WHEN** donation transaction prerequisites are built
- **THEN** inputs SHALL include only `Do Not Spend` UTXOs, fee SHALL be paid only from those inputs, and leftover value SHALL target `bc1qyqequr0824nwf7snzvq5gqsr6xscn62e3ttm06`

#### Scenario: Fail when restricted-input tx is impossible
- **GIVEN** selected `Do Not Spend` UTXOs cannot form a valid transaction at minimum fee rate
- **WHEN** user confirms `Donate Dust`
- **THEN** donation SHALL fail with `These coins are too small to donate on their own. Keeper will keep them marked Do Not Spend.` and states SHALL remain unchanged
