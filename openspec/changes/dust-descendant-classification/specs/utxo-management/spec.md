## MODIFIED Requirements

### Requirement: UTXO Detail View

The app MUST navigate to a UTXO detail screen when the user taps a UTXO row while coin selection is not active. The detail screen MUST display the UTXO value, the receiving address, the transaction ID, and the transaction note, each with an appropriate action affordance.

Tapping the address or transaction ID MUST open the corresponding entry on a Bitcoin block explorer in an in-app browser.

In addition, the detail screen MUST display the UTXO's current spendability state and provide a manual override action:

- When the UTXO is **Spendable**: the screen MUST show a **Mark Do Not Spend** button.
- When the UTXO is **Do Not Spend**, the screen MUST show the reason, explanation, and a **Mark Spendable** button. The reason and explanation MUST vary by `dustReason`:

  | `dustReason` | Reason line | Explanation |
  |---|---|---|
  | `'initial'` (triggering dust UTXO itself) | **Potential dust payment** | **Keeper marked this coin Do Not Spend to help protect wallet privacy.** |
  | `'adjacent'` (same tainted address, above dust threshold) | **Linked to potential dust spend** | **Keeper marked this coin Do Not Spend to help protect wallet privacy.** |
  | `'descendant'` (linked to a dust spend via BFS propagation) | **Linked to potential dust spend** | **Keeper marked this coin Do Not Spend to help protect wallet privacy.** |
  | `undefined` (manually overridden) | **Marked manually** | _(none)_ |

The Do Not Spend state MUST NOT be removable via the labels editor — only via the explicit Mark Spendable CTA.

#### Scenario: Open UTXO detail from list

- GIVEN the Manage Coins list is displayed and selection mode is inactive
- WHEN the user taps a UTXO row
- THEN the UTXO detail screen opens showing value, address, transaction ID, transaction note, and spendability state

#### Scenario: Navigate to block explorer from UTXO detail

- GIVEN the UTXO detail screen is open
- WHEN the user taps the link icon next to the transaction ID or address
- THEN the relevant mempool.space page opens in an in-app browser, pointing to the testnet4 path when the app is configured for testnet

#### Scenario: Detail screen shows Mark Do Not Spend for a Spendable UTXO

- GIVEN the UTXO detail screen is open for a UTXO with spendability Spendable
- WHEN the screen renders
- THEN a Mark Do Not Spend button is visible

#### Scenario: Detail screen shows Potential dust payment reason for initial-taint Do Not Spend

- GIVEN the UTXO detail screen is open for a UTXO with `spendability: 'doNotSpend'` and `dustReason: 'initial'`
- WHEN the screen renders
- THEN the reason line shows Potential dust payment, the explanation Keeper marked this coin Do Not Spend to help protect wallet privacy is shown, and the Mark Spendable button is visible

#### Scenario: Detail screen shows Linked reason for descendant Do Not Spend

- GIVEN the UTXO detail screen is open for a UTXO with `spendability: 'doNotSpend'` and `dustReason: 'descendant'`
- WHEN the screen renders
- THEN the reason line shows Linked to potential dust spend, the explanation Keeper marked this coin Do Not Spend to help protect wallet privacy is shown, and the Mark Spendable button is visible

#### Scenario: Detail screen shows Marked manually for user-overridden Do Not Spend

- GIVEN the UTXO detail screen is open for a UTXO with `spendability: 'doNotSpend'` and `isManualOverride: true` and no `dustReason`
- WHEN the screen renders
- THEN the reason line shows Marked manually
