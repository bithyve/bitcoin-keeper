## ADDED Requirements

### Requirement: Historical potential dust spend labeling
Transaction history SHALL mark transactions that spent potential-dust inputs.

#### Scenario: Label historical dust spend
- **GIVEN** a historical transaction spent an input that matches potential-dust rules (`UTXO` value below 5,000 satoshis plus qualifying address condition)
- **WHEN** transaction history renders that entry
- **THEN** transaction SHALL display `Potential dust spend`

#### Scenario: Detail explanation for privacy impact
- **GIVEN** user opens a transaction labeled `Potential dust spend`
- **WHEN** transaction detail screen is shown
- **THEN** the screen SHALL display `This transaction may have spent a suspicious small amount together with other wallet funds. This may have reduced wallet privacy.`

#### Scenario: No wallet red-dot from historical-only event
- **GIVEN** wallet has historical `Potential dust spend` records but no current `Do Not Spend` UTXOs
- **WHEN** wallet list is rendered
- **THEN** wallet-level red-dot indicator SHALL not be shown based on historical-only events
