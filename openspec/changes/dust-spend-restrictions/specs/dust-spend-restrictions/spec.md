## ADDED Requirements

### Requirement: Automatic Coin Selection Excludes Do Not Spend UTXOs

When no UTXOs have been manually selected, the automatic coin selection pool MUST exclude all UTXOs whose `spendability` field equals `'doNotSpend'`. This applies to both the primary send flow (`prepareTransactionPrerequisites`) and the send-max fee calculation (`calculateSendMaxFee`).

When UTXOs have been manually selected by the user (non-empty `selectedUTXOs`), the filter MUST NOT be applied — manually selected Do Not Spend UTXOs SHALL be used as-is.

#### Scenario: Do Not Spend UTXOs excluded from auto coin selection

- GIVEN a wallet contains UTXOs where some have `spendability === 'doNotSpend'`
- WHEN `prepareTransactionPrerequisites` is called without a `selectedUTXOs` list
- THEN the input UTXO pool used for coinselect SHALL contain only UTXOs with `spendability !== 'doNotSpend'`

#### Scenario: Manually selected Do Not Spend UTXOs are not filtered

- GIVEN a wallet contains at least one UTXO with `spendability === 'doNotSpend'`
- WHEN `prepareTransactionPrerequisites` is called with that UTXO in `selectedUTXOs`
- THEN that UTXO SHALL be included in the coinselect input pool

#### Scenario: Send max excludes Do Not Spend UTXOs

- GIVEN a wallet contains UTXOs where some have `spendability === 'doNotSpend'`
- WHEN `calculateSendMaxFee` is called without a `selectedUTXOs` list
- THEN the fee calculation MUST be based only on spendable UTXOs, and the resulting send-max amount MUST reflect only the spendable balance

---

### Requirement: Spendable Balance Display in Send Flow

The available balance shown to the user in the send flow MUST reflect only UTXOs with `spendability !== 'doNotSpend'`. This balance MUST be computed from `wallet.specs.confirmedUTXOs` and `wallet.specs.unconfirmedUTXOs` filtered to exclude Do Not Spend UTXOs, not from `specs.balances`.

#### Scenario: Available balance excludes Do Not Spend UTXOs

- GIVEN a wallet contains a mix of spendable and Do Not Spend UTXOs
- WHEN the user opens the send amount screen
- THEN the balance displayed MUST equal the sum of values for UTXOs with `spendability !== 'doNotSpend'`

#### Scenario: Available balance equals full balance when no Do Not Spend UTXOs exist

- GIVEN a wallet contains no UTXOs with `spendability === 'doNotSpend'`
- WHEN the user opens the send amount screen
- THEN the balance displayed MUST equal `specs.balances.confirmed + specs.balances.unconfirmed`

---

### Requirement: Insufficient Spendable Balance Warning

When the total wallet balance is sufficient to cover the send amount but the spendable balance (excluding Do Not Spend UTXOs) is not, the send flow MUST display an inline helper message and a **View Coins** button. The existing insufficient balance error MUST also be shown.

Helper copy: **Some coins are marked Do Not Spend and are not available for this payment.**

The **View Coins** button MUST navigate the user to the Manage Coins screen for the sending wallet.

This warning MUST NOT be shown when total balance is also insufficient (standard insufficient balance error applies instead).

This warning MUST NOT be shown when the user has already manually selected UTXOs (`selectedUTXOs.length > 0`).

#### Scenario: Helper copy shown when spendable balance is insufficient but total balance is not

- GIVEN a wallet where spendable balance < send amount AND total balance >= send amount
- WHEN the user enters the send amount
- THEN the helper copy "Some coins are marked Do Not Spend and are not available for this payment." MUST be displayed inline
- AND a **View Coins** button MUST be shown

#### Scenario: View Coins button navigates to Manage Coins

- GIVEN the insufficient spendable balance helper copy is shown
- WHEN the user taps **View Coins**
- THEN the app MUST navigate to the Manage Coins screen for the sending wallet

#### Scenario: Standard insufficient balance error shown when total balance is also insufficient

- GIVEN a wallet where total balance < send amount
- WHEN the user enters the send amount
- THEN the standard insufficient balance error MUST be shown
- AND the Do Not Spend helper copy MUST NOT be shown

---

### Requirement: Do Not Spend Manual Selection Warning

When the user is in manual coin selection mode and taps a UTXO with `spendability === 'doNotSpend'` that is not yet selected, the app MUST display a warning modal before adding the UTXO to the selection.

**Modal title:** Use Do Not Spend Coin?

**Modal body:** This coin was marked Do Not Spend to help protect wallet privacy. Spending it with other coins may reduce privacy.

**Buttons:**
- **Use Coin** — adds the UTXO to the manual selection
- **Cancel** — does not add the UTXO; returns to manual coin selection

This warning MUST NOT be shown during automatic coin selection (Do Not Spend coins are excluded automatically in that path).

This warning MUST NOT be shown when tapping a Do Not Spend UTXO that is already selected (tapping a selected UTXO deselects it; no warning required for deselection).

#### Scenario: Warning shown when selecting a Do Not Spend UTXO

- GIVEN manual coin selection is active and a UTXO with `spendability === 'doNotSpend'` is not yet selected
- WHEN the user taps that UTXO row
- THEN the warning modal MUST appear with the title "Use Do Not Spend Coin?" and the body text

#### Scenario: Use Coin adds UTXO to selection

- GIVEN the Do Not Spend warning modal is shown
- WHEN the user taps **Use Coin**
- THEN the UTXO MUST be added to the manual selection and the modal MUST close

#### Scenario: Cancel dismisses modal without selecting

- GIVEN the Do Not Spend warning modal is shown
- WHEN the user taps **Cancel**
- THEN the UTXO MUST NOT be added to the selection and the modal MUST close

#### Scenario: No warning when deselecting a Do Not Spend UTXO

- GIVEN manual coin selection is active and a UTXO with `spendability === 'doNotSpend'` is already selected
- WHEN the user taps that UTXO row again
- THEN the UTXO MUST be deselected immediately with no warning modal
