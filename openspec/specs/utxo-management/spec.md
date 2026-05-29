# UTXO Management Specification

## Purpose

The UTXO Management domain owns coin-level visibility and control for Bitcoin
wallets: displaying the full unspent output set, assigning labels to individual
outputs and addresses, selecting specific UTXOs as inputs for a transaction
(coin control), and importing or exporting the complete label set in a portable
format.

USDT wallets are excluded from this domain. USDT balance management is owned
by the `usdt` domain.

---

## Requirements

### Requirement: UTXO List

The app MUST display all confirmed and unconfirmed UTXOs for the active wallet
on the Manage Coins screen, sorted with unconfirmed outputs first, then
by block height in descending order so that the most recently confirmed outputs
appear at the top.

Each UTXO entry MUST show the transaction ID, output amount, any assigned
coin-level labels, and a transaction note if one has been recorded.

Unconfirmed UTXOs (those with no block height) MUST be visually distinguished
from confirmed UTXOs with a dedicated icon.

#### Scenario: View confirmed and unconfirmed UTXOs

- GIVEN a wallet has both confirmed and unconfirmed UTXOs
- WHEN the user opens the Manage Coins screen
- THEN all UTXOs are listed, unconfirmed entries appear at the top with the
  unconfirmed icon, and confirmed entries follow in descending block-height order

#### Scenario: Wallet has no UTXOs

- GIVEN a wallet has never received any bitcoin
- WHEN the user opens the Manage Coins screen
- THEN an empty-state illustration and explanatory text are displayed instead of
  a list

---

### Requirement: UTXO Sync

The app MUST trigger a wallet sync when the Manage Coins screen is opened if
the wallet is not already syncing, and MUST refresh the UTXO set when the user
performs a pull-to-refresh gesture, executing a hard refresh against the
connected Electrum node.

While a sync is in progress the screen MUST display an activity indicator.

#### Scenario: Screen opens with stale UTXOs

- GIVEN the user last synced more than a few minutes ago
- WHEN the user navigates to the Manage Coins screen
- THEN the app initiates a background sync and shows an activity indicator until
  the refresh completes and the list updates

#### Scenario: User pulls down to refresh

- GIVEN the Manage Coins screen is visible
- WHEN the user pulls the list downward past the pull-to-refresh threshold
- THEN the app performs a hard sync against the Electrum node and the UTXO list
  updates to reflect the latest confirmed and unconfirmed outputs

---

### Requirement: UTXO Detail View

The app MUST navigate to a UTXO detail screen when the user taps a UTXO row
while coin selection is not active. The detail screen MUST display the UTXO
value, the receiving address, the transaction ID, and the transaction note, each
with an appropriate action affordance.

Tapping the address or transaction ID MUST open the corresponding entry on a
Bitcoin block explorer in an in-app browser.

In addition, the detail screen MUST display the UTXO's current spendability state
and provide a manual override action:

- When the UTXO is **Spendable**: the screen MUST show a **Mark Do Not Spend** button.
- When the UTXO is **Do Not Spend**: the screen MUST show:
  - A reason line: **Potential dust payment** (auto-classified) or **Marked manually**
    (manually overridden).
  - An explanation: **Keeper marked this coin Do Not Spend to help protect wallet
    privacy.**
  - A **Mark Spendable** button.

The Do Not Spend state MUST NOT be removable via the labels editor — only via the
explicit Mark Spendable CTA.

#### Scenario: Open UTXO detail from list

- GIVEN the Manage Coins list is displayed and selection mode is inactive
- WHEN the user taps a UTXO row
- THEN the UTXO detail screen opens showing value, address, transaction ID,
  transaction note, and spendability state

#### Scenario: Navigate to block explorer from UTXO detail

- GIVEN the UTXO detail screen is open
- WHEN the user taps the link icon next to the transaction ID or address
- THEN the relevant mempool.space page opens in an in-app browser, pointing to
  the testnet4 path when the app is configured for testnet

#### Scenario: Detail screen shows Mark Do Not Spend for a Spendable UTXO

- GIVEN the UTXO detail screen is open for a UTXO with spendability Spendable
- WHEN the screen renders
- THEN a Mark Do Not Spend button is visible

#### Scenario: Detail screen shows Mark Spendable and reason for a Do Not Spend UTXO

- GIVEN the UTXO detail screen is open for a UTXO with spendability Do Not Spend
- WHEN the screen renders
- THEN the reason line (Potential dust payment or Marked manually), the explanation
  text, and the Mark Spendable button are all visible

---

### Requirement: Do Not Spend Label in Manage Coins List

The Manage Coins screen MUST display a **Do Not Spend** label chip using
warning-style visual treatment on every UTXO row whose spendability state is
Do Not Spend.

The Do Not Spend label MUST be shown alongside any existing system labels (Change,
Self) and user-defined labels. Do Not Spend UTXOs MUST remain visible in the list
and MUST NOT be hidden or filtered out.

#### Scenario: Do Not Spend chip appears on affected UTXO rows

- GIVEN the Manage Coins screen is open and the wallet contains at least one Do Not
  Spend UTXO
- WHEN the list renders
- THEN each Do Not Spend UTXO row shows a Do Not Spend chip in warning-style
  treatment alongside any other labels

#### Scenario: Spendable UTXOs show no Do Not Spend chip

- GIVEN the Manage Coins screen is open
- WHEN the list renders a UTXO with spendability Spendable
- THEN no Do Not Spend chip is shown on that row

---

### Requirement: Coin-Level Labeling

The app MUST allow the user to add, edit, and remove one or more custom text
labels on any individual UTXO. Labels are scoped to the specific output
(transaction ID and vout index) and MUST persist across app restarts.

Multiple labels on the same UTXO MUST all be visible in the UTXO list row. When
the available row height cannot display all labels, the app MUST show a count
badge indicating how many labels are hidden (e.g., "+2").

Label changes MUST be saved to local storage and asynchronously backed up to the
relay server.

#### Scenario: Add a label to a UTXO

- GIVEN a UTXO with no labels is visible on the detail screen
- WHEN the user types a label name in the input field and confirms
- THEN the label appears in the label list on the detail screen and in the UTXO
  row on the Manage Coins screen

#### Scenario: Edit an existing label

- GIVEN a UTXO has at least one label
- WHEN the user taps a label to edit it, changes the text, and saves
- THEN the old label is replaced by the updated name both locally and on the
  relay backup

#### Scenario: Remove a label from a UTXO

- GIVEN a UTXO has at least one label
- WHEN the user taps the remove (×) control on a label and saves the changes
- THEN the label is deleted from local storage and removed from the relay backup,
  and the UTXO row in the list no longer shows that label

#### Scenario: Save fails due to API error

- GIVEN the user has edited labels and taps Save
- WHEN the relay backup call returns an error
- THEN the app displays an error toast and leaves the local label state unchanged
  so the user can retry

---

### Requirement: Transaction Note

The app MUST allow the user to attach a single free-text note to the transaction
associated with a UTXO. The note is scoped to the transaction ID (not the
specific output) and is shared across all UTXOs that originate from the same
transaction.

The note MUST be displayed as a labelled row on the UTXO detail screen and MUST
appear beneath the transaction ID in the UTXO list row when non-empty.

#### Scenario: Add a transaction note from UTXO detail

- GIVEN a UTXO detail screen is open with no existing transaction note
- WHEN the user taps the edit icon next to "Transaction Note", enters text, and
  confirms
- THEN the note is saved and displayed on the detail screen and visible in the
  UTXO list row

#### Scenario: Clear an existing transaction note

- GIVEN a UTXO detail screen shows an existing note
- WHEN the user opens the note editor, clears the text, and saves
- THEN the note is removed and the row in the list reverts to showing no note

---

### Requirement: Address-Level Labeling

The app MUST allow the user to assign one or more labels to a receiving address
directly from the Receive screen. Address-level labels MUST carry over to any
UTXO subsequently received at that address during a wallet sync.

When a previously labelled address has already been used to receive funds, the
Receive screen MUST warn the user that editing labels on a reused address affects
only future transactions to that address.

#### Scenario: Assign a label to a receive address

- GIVEN the Receive screen is showing an unused address
- WHEN the user adds a label via the labels editor and saves
- THEN the label is stored against that address and, when a UTXO is received
  there, the label appears on the resulting UTXO in the Manage Coins screen

#### Scenario: Edit labels on a previously used address

- GIVEN the Receive screen is showing an address that has already received funds
- WHEN the user edits the labels on the address
- THEN the app displays a warning that changes apply only to future transactions
  received at that address, not to UTXOs already present in the list

---

### Requirement: Manual Coin Selection

The app MUST provide a coin-selection mode on the Manage Coins screen in which
the user can manually select one or more individual UTXOs to use as inputs for
an outgoing transaction. While selection mode is active, the running count of
selected UTXOs and their combined sato-value MUST be displayed.

All wallet-owned UTXOs remain visible in the list during selection, including Do Not Spend UTXOs.

The user MUST be able to confirm the selection and proceed directly to the Send
flow, where only the selected UTXOs are available as inputs. Unselected UTXOs
MUST NOT be included in the transaction.

When no UTXOs are selected the Send button MUST be disabled.

When the user taps a UTXO row that has `spendability === 'doNotSpend'` and that UTXO is **not yet selected**, the app MUST show a warning modal before adding the coin to the selection:

- **Title:** Use Do Not Spend Coin?
- **Body:** This coin was marked Do Not Spend to help protect wallet privacy. Spending it with other coins may reduce privacy.
- **Use Coin** — adds the UTXO to the selection.
- **Cancel** — dismisses the modal without adding the UTXO.

When the user taps an already-selected Do Not Spend UTXO, the UTXO MUST be deselected immediately with no warning.

#### Scenario: Select UTXOs and proceed to Send

- GIVEN the Manage Coins screen has confirmed UTXOs
- WHEN the user taps "Select to Send", checks one or more UTXOs, and taps Send
- THEN the Send screen opens with the selected UTXOs pre-loaded as inputs and
  the available-to-spend amount equals the sum of selected UTXO values

#### Scenario: Attempt to send with no UTXOs selected

- GIVEN coin-selection mode is active and no UTXOs are checked
- WHEN the user views the Send button
- THEN the button is disabled and cannot be tapped

#### Scenario: Cancel selection mode

- GIVEN coin-selection mode is active with some UTXOs checked
- WHEN the user taps Cancel
- THEN selection mode ends, all checkboxes are cleared, and the Manage Coins
  screen returns to its default browse state

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

---

### Requirement: Miniscript Spending-Path Selection

For Miniscript wallets, the app MUST present a spending-path selector after the
user confirms their UTXO selection. The user MUST choose a valid Miniscript
spending path before the selected UTXOs are passed to the Send flow.

#### Scenario: Select UTXOs for a Miniscript wallet send

- GIVEN the active wallet is a Miniscript wallet and the user has selected UTXOs
- WHEN the user taps Send
- THEN the Miniscript path selector appears listing available spending conditions
- AND after the user selects a path, the Send screen opens with both the selected
  UTXOs and the chosen spending satisfier pre-loaded

#### Scenario: Cancel Miniscript path selection

- GIVEN the Miniscript path selector is open
- WHEN the user taps the cancel action on the path selector
- THEN the app returns to coin-selection mode with the previous UTXO selections
  intact

---

### Requirement: Label Import and Export (BIP-329)

The app MUST allow the user to export all labels for a wallet to a JSONL file
compatible with BIP-329, and to import a BIP-329-compatible JSONL or JSON label
file. This feature MUST be accessible from wallet settings.

During export the app MUST write one JSON object per line, each containing
`type`, `ref`, `label`, and `origin` fields, naming the file after the wallet.

During import the app MUST parse the file, filter entries whose `origin`
descriptor matches the current wallet, and persist only those labels. If no
entries match the current wallet the app MUST display an error and import
nothing. If the file cannot be parsed the app MUST display an error.

#### Scenario: Export wallet labels

- GIVEN a wallet has labels on several UTXOs and the user opens wallet settings
- WHEN the user selects "Import/Export Wallet Labels" and taps Export Labels
- THEN the app writes a JSONL file named after the wallet containing one BIP-329
  record per label, and confirms success to the user

#### Scenario: Import labels from a BIP-329 file

- GIVEN the user has a valid JSONL label file whose `origin` matches the current
  wallet's descriptor
- WHEN the user opens wallet settings, selects Import/Export Wallet Labels, taps
  Import Labels, and selects the file
- THEN the app parses the file, persists the matching labels locally and backs
  them up to the relay server, and reports the number of labels imported

#### Scenario: Import file contains no matching labels

- GIVEN the user selects a BIP-329 file whose `origin` descriptor belongs to a
  different wallet
- WHEN the import is processed
- THEN the app displays an error message stating "No labels found for this
  wallet" and no labels are added

#### Scenario: Import file is malformed

- GIVEN the user selects a file that is neither valid JSON nor valid JSONL
- WHEN the import is processed
- THEN the app displays an error message and no labels are added or overwritten

---

## Acceptance Criteria

- User-facing copy uses Wallet, not Vault.
- Miniscript wallets (not Miniscript vaults) terminology used.
- BIP-329 import/export UI accessible from wallet settings.
- UTXO Freezing is explicitly not supported.
- USDT wallets are excluded from this domain.

---

## Non-Goals

- **UTXO Freezing**: The app does not support locking individual UTXOs to
  exclude them from automatic coin selection; all confirmed UTXOs remain
  available unless the user explicitly selects specific ones via coin-selection
  mode.
- **Address-reuse enforcement**: The spec does not govern how the app
  generates or rotates receive addresses; that belongs to the `send-and-receive`
  domain.
- **Mempool fee estimation from the UTXO screen**: Fee rates and transaction
  construction are handled by the `send-and-receive` domain.
- **UTXO consolidation flows**: Merge or consolidation strategies that
  automatically combine many UTXOs into fewer outputs are not part of this
  domain.
- **USDT or non-Bitcoin outputs**: Coin control applies only to Bitcoin (on-chain
  sats) UTXOs; USDT balance management is covered by the `usdt` domain.

---

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
