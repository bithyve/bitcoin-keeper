## ADDED Requirements

### Requirement: Automatic send input exclusion for Do Not Spend
Automatic input selection SHALL exclude all `UTXO` entries marked `Do Not Spend`.

#### Scenario: Exclude Do Not Spend from default selection
- **GIVEN** a `Wallet` has 20,000 satoshis total and 6,000 satoshis are in `Do Not Spend` `UTXO` entries
- **WHEN** user starts normal send without manual `selectedUTXOs`
- **THEN** transaction prerequisite input selection SHALL consider only 14,000 spendable satoshis

#### Scenario: Manual selection warning for Do Not Spend
- **GIVEN** user is in manual coin selection and taps a `Do Not Spend` `UTXO`
- **WHEN** selection action is attempted
- **THEN** app SHALL require explicit confirmation before including that `UTXO`

### Requirement: Spendable-balance aware send messaging
The send flow SHALL explain insufficient spendable balance when total balance is sufficient.

#### Scenario: Total sufficient but spendable insufficient
- **GIVEN** total wallet balance is 50,000 satoshis and spendable balance is 30,000 satoshis
- **WHEN** user attempts to send 40,000 satoshis
- **THEN** send flow SHALL show `Some coins are marked Do Not Spend and are not available for this payment.`

#### Scenario: Standard insufficient balance behavior
- **GIVEN** spendable balance is less than requested amount and total balance is also less than requested amount
- **WHEN** user attempts send
- **THEN** existing insufficient balance behavior SHALL remain unchanged
