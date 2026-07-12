## MODIFIED Requirements

### Requirement: UTXO Detail View

The app MUST navigate to a UTXO detail screen when the user taps a UTXO row
while coin selection is not active. The detail screen MUST display the UTXO
value, the receiving address, the transaction ID, and the transaction note, each
with an appropriate action affordance.

Tapping the address or transaction ID MUST open the corresponding entry on a
Bitcoin block explorer in an in-app browser.

In addition, the detail screen MUST display the UTXO's current spendability state and provide a manual override action:

- When the UTXO is **Spendable**: the screen MUST show a **Mark Do Not Spend** button.
- When the UTXO is **Do Not Spend**: the screen MUST show:
  - A reason line: **Potential dust payment** (auto-classified) or **Marked manually** (manually overridden).
  - An explanation: **Keeper marked this coin Do Not Spend to help protect wallet privacy.**
  - A **Mark Spendable** button.

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

#### Scenario: Detail screen shows Mark Spendable and reason for a Do Not Spend UTXO

- GIVEN the UTXO detail screen is open for a UTXO with spendability Do Not Spend
- WHEN the screen renders
- THEN the reason line (Potential dust payment or Marked manually), the explanation text, and the Mark Spendable button are all visible

---

## ADDED Requirements

### Requirement: Do Not Spend Label in Manage Coins List

The Manage Coins screen MUST display a **Do Not Spend** label chip using warning-style visual treatment on every UTXO row whose spendability state is Do Not Spend.

The Do Not Spend label MUST be shown alongside any existing system labels (Change, Self) and user-defined labels. Do Not Spend UTXOs MUST remain visible in the list and MUST NOT be hidden or filtered out.

#### Scenario: Do Not Spend chip appears on affected UTXO rows

- GIVEN the Manage Coins screen is open and the wallet contains at least one Do Not Spend UTXO
- WHEN the list renders
- THEN each Do Not Spend UTXO row shows a Do Not Spend chip in warning-style treatment alongside any other labels

#### Scenario: Spendable UTXOs show no Do Not Spend chip

- GIVEN the Manage Coins screen is open
- WHEN the list renders a UTXO with spendability Spendable
- THEN no Do Not Spend chip is shown on that row
