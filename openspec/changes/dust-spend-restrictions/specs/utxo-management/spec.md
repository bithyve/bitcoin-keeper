## MODIFIED Requirements

### Requirement: Manual Coin Selection

The Manage Coins screen MUST allow the user to select UTXOs for a manual send via a "Select to Send" mode. All wallet-owned UTXOs remain visible in the list during selection, including Do Not Spend UTXOs.

When the user taps a UTXO row that has `spendability === 'doNotSpend'` and that UTXO is **not yet selected**, the app MUST show a warning modal before adding the coin to the selection:

- **Title:** Use Do Not Spend Coin?
- **Body:** This coin was marked Do Not Spend to help protect wallet privacy. Spending it with other coins may reduce privacy.
- **Use Coin** — adds the UTXO to the selection.
- **Cancel** — dismisses the modal without adding the UTXO.

When the user taps an already-selected Do Not Spend UTXO, the UTXO MUST be deselected immediately with no warning.

#### Scenario: Do Not Spend warning modal appears before selection

- GIVEN manual coin selection is active and a UTXO row is marked Do Not Spend and not yet selected
- WHEN the user taps that UTXO row
- THEN the warning modal MUST appear with title "Use Do Not Spend Coin?" and the privacy warning body text

#### Scenario: Tapping Use Coin adds the UTXO to selection

- GIVEN the Do Not Spend warning modal is shown
- WHEN the user taps **Use Coin**
- THEN the UTXO MUST be added to the selection and the modal MUST close

#### Scenario: Tapping Cancel dismisses without selecting

- GIVEN the Do Not Spend warning modal is shown
- WHEN the user taps **Cancel**
- THEN the UTXO MUST NOT be added to the selection and the modal MUST close

#### Scenario: Deselecting an already-selected Do Not Spend UTXO requires no warning

- GIVEN a Do Not Spend UTXO is already part of the manual selection
- WHEN the user taps that UTXO row
- THEN the UTXO MUST be deselected immediately with no modal
