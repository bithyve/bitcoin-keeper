# Transaction-History Specification

## Purpose

Transaction-History owns every surface where a user views, navigates, and annotates
past and in-flight transactions for a wallet or vault. It covers the full-list view,
the detail view (with note editing and block-explorer link), the advanced input/output
breakdown, and the cached-transaction resume flow for unsigned multi-signer transactions.

---

## Requirements

### Requirement: Transaction List

The app MUST display all confirmed and unconfirmed transactions for a wallet or vault
in a single scrollable list. Unconfirmed transactions (zero confirmations) MUST appear
at the top of the list. Within the confirmed set, transactions MUST be ordered newest
first by broadcast date.

#### Scenario: List renders with confirmed and unconfirmed entries

- GIVEN a wallet has three confirmed transactions and one unconfirmed (mempool) transaction
- WHEN the user opens the transaction history screen
- THEN the unconfirmed transaction is shown first
- AND the three confirmed transactions follow in reverse-chronological order

#### Scenario: List is empty

- GIVEN a wallet has no transactions
- WHEN the user opens the transaction history screen
- THEN the app displays an empty-state illustration and message indicating no transactions exist
- AND no list rows are shown

#### Scenario: Pull-to-refresh triggers a sync

- GIVEN the transaction history screen is open
- WHEN the user pulls down on the list
- THEN the app requests a hard refresh of the wallet from the connected Electrum node
- AND the list updates to reflect any newly confirmed or incoming transactions once the sync completes

---

### Requirement: Sent/Received Distinction

The app MUST visually distinguish sent transactions from received transactions on
every list row and on the detail screen.

#### Scenario: Received transaction in list

- GIVEN a wallet has a received transaction
- WHEN the transaction list is shown
- THEN the row displays a receive icon distinct from the send icon
- AND the amount is shown with positive context indicating funds arrived

#### Scenario: Sent transaction in list

- GIVEN a wallet has a sent transaction
- WHEN the transaction list is shown
- THEN the row displays a send icon distinct from the receive icon

---

### Requirement: Unconfirmed Transaction Indicator

The app MUST display a pending indicator on any transaction with zero confirmations
so the user can distinguish it from confirmed transactions at a glance.

#### Scenario: Unconfirmed transaction shown with pending badge

- GIVEN a sent or received transaction has zero confirmations
- WHEN the transaction appears in the list
- THEN a pending/clock icon overlays the direction icon
- AND the row remains tappable and navigates to the transaction detail screen

#### Scenario: Transaction confirmed after refresh

- GIVEN a transaction was previously shown as unconfirmed
- WHEN the user pulls to refresh and the node reports the transaction now has at
  least one confirmation
- THEN the pending indicator is no longer displayed
- AND the transaction moves from the top of the list into chronological order

---

### Requirement: Transaction Detail

Each transaction MUST have a detail screen that shows: the transaction ID (txid),
the transaction type (sent or received), the date and time, the amount, the fee
in satoshis, and the confirmation count.

#### Scenario: User opens a confirmed transaction detail

- GIVEN a confirmed transaction exists in the list
- WHEN the user taps the transaction row
- THEN the app navigates to the transaction detail screen
- AND the screen shows the txid, date, amount, fee, and confirmation count
- AND if the confirmation count is greater than six the display shows "6+"

#### Scenario: Confirmation count capped at "6+"

- GIVEN a transaction has 12 confirmations
- WHEN the user views the transaction detail
- THEN the confirmation count is shown as "6+"

---

### Requirement: Block Explorer Link

The app MUST provide a direct link from the transaction detail screen to a public
block explorer for the corresponding transaction. The explorer URL MUST reflect the
current network (mainnet or testnet).

#### Scenario: User navigates to block explorer from detail screen

- GIVEN a confirmed or unconfirmed transaction is open in the detail screen
- WHEN the user taps the transaction ID field
- THEN the app opens the transaction's URL on mempool.space in an external browser
- AND on testnet the URL points to the testnet explorer

---

### Requirement: Transaction Note (Label)

The user MUST be able to add and edit a single text note on any transaction. The note
MUST be displayed in place of the truncated txid on the list row when one exists.
Adding, editing, or clearing a note MUST update the list row immediately.

#### Scenario: Add a note to a transaction with no existing note

- GIVEN a transaction has no note
- WHEN the user opens the transaction detail screen and taps the note field
- THEN a modal appears with a text input pre-filled with placeholder text
- AND after the user enters a note and saves it, the note appears in the note field on the detail screen
- AND the list row now shows the note text instead of the truncated txid

#### Scenario: Edit an existing transaction note

- GIVEN a transaction already has a note
- WHEN the user taps the note field on the detail screen and changes the text and saves
- THEN the updated note replaces the previous one on both the detail screen and the list row

#### Scenario: Clear an existing transaction note

- GIVEN a transaction already has a note
- WHEN the user opens the note modal, clears the text, and saves
- THEN the note is removed
- AND the list row reverts to showing the truncated txid

---

### Requirement: Currency Display Toggle

The transaction history list MUST respect the app-wide currency display setting
(Bitcoin / sats vs fiat equivalent). The user MUST be able to switch the display
unit directly from the transaction history screen without leaving it.

#### Scenario: Switch display unit from the transaction history header

- GIVEN the transaction history screen is open and amounts are shown in sats
- WHEN the user taps the currency toggle in the screen header
- THEN all transaction amounts on the list update to show the fiat equivalent (or vice versa)

---

### Requirement: Advanced Transaction Details

The app MUST provide an advanced detail view that lists all input addresses (senders)
and all output addresses (recipients) for a transaction, with amounts per address.

#### Scenario: User views inputs and outputs

- GIVEN a transaction detail screen is open
- WHEN the user taps the "Advanced Details" entry point
- THEN the app navigates to the advanced detail screen
- AND the screen presents a tabbed view with an Inputs tab and an Outputs tab
- AND each tab lists the relevant addresses with their corresponding amounts

#### Scenario: Switch between inputs and outputs tabs

- GIVEN the advanced detail screen is open on the Inputs tab
- WHEN the user taps the Outputs tab
- THEN the address list updates to show only the output (recipient) addresses

---

### Requirement: Vault Transaction List

The app MUST display a vault-scoped transaction list that can be filtered to show
only vault transactions or only wallet transactions. The vault detail screen MUST
show a preview of the five most recent transactions with a "View All" control that
navigates to the full list.

#### Scenario: Vault detail shows up to five recent transactions

- GIVEN a vault has eight transactions
- WHEN the vault detail screen is displayed
- THEN at most five transactions are shown in the recent-transactions section
- AND a "View All" control is visible

#### Scenario: "View All" navigates to the full transaction list

- GIVEN the vault detail screen shows the recent-transactions section with a "View All" control
- WHEN the user taps "View All"
- THEN the app navigates to the full transaction history for that vault

---

### Requirement: Cached (Unsigned) Transaction Display

When a multi-signer PSBT has been created but not yet fully signed and broadcast,
the app MUST surface it as a pending entry in the transaction list with a distinct
cached indicator. Tapping the cached entry MUST resume the signing flow rather than
navigating to a transaction detail screen.

#### Scenario: Unsigned PSBT appears in the transaction list

- GIVEN a PSBT has been created for a vault transaction and signing is still in progress
- WHEN the user opens the vault or wallet transaction list
- THEN a cached transaction entry appears in the list with a special cache icon instead
  of a sent/received icon
- AND the row has a visually distinct background color

#### Scenario: Tapping a cached transaction resumes signing

- GIVEN a cached transaction entry is visible in the list
- WHEN the user taps the cached entry
- THEN the app restores the previous send state and navigates to the confirmation/signing screen
  so the user can continue the signing process

---

### Requirement: Offline Cached Display

The app MUST persist the last-known transaction list locally so that previously
synced transactions remain visible when the Electrum node is unreachable.

#### Scenario: Transactions visible while node is unreachable

- GIVEN the app was previously synced and has cached transactions stored locally
- AND the device is currently offline or cannot reach the Electrum node
- WHEN the user opens the transaction history screen
- THEN the last-known transactions are displayed from local storage
- AND no error prevents the user from reading the cached data

#### Scenario: Pull-to-refresh while offline

- GIVEN the transaction history screen is open and the node is unreachable
- WHEN the user pulls down to refresh
- THEN the app attempts the refresh
- AND the cached transaction list remains visible without being cleared

---

## Non-Goals

- UTXO-level coin control and freezing are owned by the `utxo-management` domain.
- Filtering or searching transactions by amount, address, or date range is not
  currently specified; future filtering UI is out of scope for this baseline spec.
- Exporting transaction history to a file (CSV, PDF, etc.) is not part of this domain.
- Transaction fee bumping (RBF) and child-pays-for-parent (CPFP) are owned by the
  `send-and-receive` domain.
- USDT transaction history display is owned by the `usdt` domain; this spec covers
  Bitcoin transactions only.
- The mechanics of PSBT creation, partial signing, and broadcast are owned by the
  `send-and-receive` domain; this spec only covers how cached PSBTs surface in the list.
