## ADDED Requirements

### Requirement: Donate Dust CTA in Manage Coins Footer

The Manage Coins footer MUST display a **Donate Dust** action item alongside the existing **Select to Send** action when the wallet contains at least one Do Not Spend UTXO. When no Do Not Spend UTXOs exist, the **Donate Dust** action MUST NOT be rendered.

#### Scenario: Footer shows Donate Dust when Do Not Spend coins exist

- GIVEN the user is on Manage Coins
- AND the wallet has at least one UTXO with `spendability === 'doNotSpend'`
- THEN the footer MUST display the **Donate Dust** action alongside **Select to Send**

#### Scenario: Footer does not show Donate Dust when no Do Not Spend coins exist

- GIVEN the user is on Manage Coins
- AND no UTXO has `spendability === 'doNotSpend'`
- THEN the footer MUST NOT render the **Donate Dust** action
