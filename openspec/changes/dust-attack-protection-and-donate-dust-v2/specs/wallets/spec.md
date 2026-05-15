## ADDED Requirements

### Requirement: Wallet-level Do Not Spend indicators
Wallet listing and wallet details SHALL indicate the presence of current `Do Not Spend` UTXOs.

#### Scenario: Home list red dot
- **GIVEN** a `Wallet` contains at least one current `UTXO` marked `Do Not Spend`
- **WHEN** wallet cards are shown on home list
- **THEN** that wallet card SHALL show the customary red dot indicator

#### Scenario: Wallet details informational line
- **GIVEN** a wallet contains at least one current `Do Not Spend` `UTXO`
- **WHEN** wallet details header is rendered
- **THEN** a non-tappable line SHALL show `Includes Do Not Spend coins`

#### Scenario: More options View All Coins red dot
- **GIVEN** a wallet contains at least one current `Do Not Spend` `UTXO`
- **WHEN** More Options is opened
- **THEN** `View All Coins` SHALL show the customary red dot indicator
