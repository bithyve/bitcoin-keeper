# Send-and-Receive Specification

## Purpose

Send and Receive owns bitcoin sending, receiving, review, signing handoff, broadcast,
and pending/unconfirmed transaction states for Keeper wallets.

Internal multisig/vault handling can remain where required by code. User-facing copy
must use Wallet and multi-key wallet instead of vault or multi-signature vault.

---

## Requirements

### Requirement: Send Phase One — Fee Estimation

The app MUST calculate transaction prerequisites (UTXOs, outputs, and fees) for LOW,
MEDIUM, HIGH, and CUSTOM priority levels before presenting a confirmation screen.

The app MUST display the estimated confirmation time (in blocks) alongside the fee
amount for each priority level.

The app MUST NOT allow the send flow to proceed if the selected UTXOs cannot cover
the send amount plus the estimated fee for the chosen priority.

The app MUST NOT allow initiating a send from a watch-only wallet (a wallet without
a private key). Watch-only copy: "This wallet can show balances and transactions,
but cannot send bitcoin."

The app MUST NOT allow initiating a send from an archived wallet. To send from an
archived wallet, the user must unarchive it first.

Unconfirmed bitcoin transactions are included in wallet balance and shown as
pending/unconfirmed in transaction history.

The automatic coin selection pool MUST exclude UTXOs with `spendability === 'doNotSpend'`
when no UTXOs have been manually pre-selected. Manually pre-selected UTXOs are used as-is regardless of spendability.

#### Scenario: Fee estimation succeeds

- GIVEN the user has a wallet with a confirmed or unconfirmed spendable balance
- WHEN the user enters a valid recipient address and amount and proceeds to the confirmation screen
- THEN the app displays the LOW, MEDIUM, and HIGH fee options each with a fee amount in sats and an estimated confirmation time in blocks
- AND the CUSTOM fee option is presented for manual input

#### Scenario: Insufficient balance

- GIVEN the user has a wallet whose spendable balance is less than the requested amount plus the minimum fee
- WHEN the user attempts to proceed to the confirmation screen
- THEN the app surfaces an error indicating insufficient balance and does not advance the send flow

#### Scenario: Send attempted from watch-only wallet

- GIVEN the user has a watch-only wallet (imported xpub without a private key)
- WHEN the user attempts to initiate a send from that wallet
- THEN the app prevents the send and displays "This wallet can show balances and transactions, but cannot send bitcoin."

#### Scenario: Send attempted from archived wallet

- GIVEN the user has an archived wallet
- WHEN the user attempts to initiate a send from that wallet
- THEN the app prevents the send and explains the wallet must be unarchived before use

#### Scenario: Do Not Spend UTXOs excluded from automatic coin selection

- GIVEN a wallet contains UTXOs where some have spendability Do Not Spend and no UTXOs have been manually pre-selected
- WHEN the send phase one calculation runs
- THEN only UTXOs with spendability Spendable are considered for the transaction inputs

---

### Requirement: Available Balance

The available balance shown to the user in the send flow MUST reflect only UTXOs that are spendable (i.e., `spendability !== 'doNotSpend'`). The balance MUST be computed from the filtered UTXO arrays at display time, not from the pre-computed `specs.balances` aggregate.

#### Scenario: Spendable balance displayed in send flow

- GIVEN a wallet contains both spendable UTXOs and Do Not Spend UTXOs
- WHEN the user opens the send amount entry screen
- THEN the balance displayed MUST equal the sum of values for spendable UTXOs only

---

### Requirement: Custom Fee

The user MUST be able to specify a custom fee rate in sat/vbyte that overrides the auto-estimated fee tiers.

The app MUST enforce a minimum custom fee rate of 1 sat/vbyte.

#### Scenario: Custom fee entered and applied

- GIVEN the user is on the send confirmation screen
- WHEN the user selects the CUSTOM fee option and enters a valid sat/vbyte value
- THEN the app recalculates the transaction prerequisites using the custom fee rate
- AND the confirmation screen updates to show the new fee amount and estimated confirmation time

#### Scenario: Custom fee below minimum

- GIVEN the user is on the custom fee entry screen
- WHEN the user enters a value less than 1 sat/vbyte
- THEN the app rejects the input and prevents the user from proceeding with an invalid fee rate

---

### Requirement: High Fee Alert

The app MUST warn the user on the confirmation screen when the selected transaction fee exceeds 10% of the total amount being sent.

The alert MUST display both the fee amount and the send amount side by side to allow the user to make an informed decision.

The user MUST be able to acknowledge the alert and proceed or return to change the fee.

#### Scenario: Fee exceeds 10% of send amount

- GIVEN the user has entered a send amount and selected a fee priority
- WHEN the calculated fee is greater than 10% of the total amount being sent
- THEN the app surfaces a high fee alert on the confirmation screen showing the fee and send amount
- AND the user can choose to proceed or go back to select a lower fee priority

#### Scenario: Fee within acceptable range

- GIVEN the user has selected a fee priority whose fee is 10% or less of the send amount
- WHEN the confirmation screen is displayed
- THEN no high fee alert is shown

---

### Requirement: Send Phase Two — Transaction Preparation

For single-signature wallets, the app MUST sign and finalize the transaction internally
in Phase Two, making it ready for immediate broadcast without requiring any external
signing device interaction.

For multi-key wallets, the app MUST serialize a PSBT with per-signer envelopes and
cache it so the user can collect signatures from the required number of signing devices
across multiple sessions.

The app MUST persist a snapshot of the in-progress signing session so the user can
leave the signing screen and resume without losing collected signatures.

The final review screen MUST show:
- Source wallet
- Recipient address
- Amount
- Network fee
- Total amount if applicable
- Signer status if multi-key wallet
- Warning that bitcoin transactions cannot be undone

**Required warning:** "Bitcoin transactions cannot be undone. Check the address and
amount carefully before sending."

#### Scenario: Single-sig wallet proceeds to broadcast immediately

- GIVEN the user has a single-signature wallet with internal keys
- WHEN the user confirms the send on the confirmation screen
- THEN the app signs the transaction internally and advances directly to the broadcast step without requiring any external device

#### Scenario: Multi-key wallet generates PSBT for signing

- GIVEN the user has a 2-of-3 multi-key wallet and confirms a send on the confirmation screen
- WHEN Phase Two executes
- THEN the app creates a PSBT and presents the signing device list screen showing all n required signers
- AND the app caches the PSBT so the session can be resumed if the user navigates away

---

### Requirement: Multi-Signer Signing

The app MUST accumulate partial signatures from the required number of signing
devices before the transaction can be broadcast.

The app MUST visually indicate which signers have provided their signature and
which are still pending.

The app MUST support collecting signatures from the same signing session across
multiple app launches via a persisted transaction snapshot.

#### Scenario: First signer signs, second still pending

- GIVEN a 2-of-3 multi-key wallet with a PSBT awaiting signatures
- WHEN the user signs with the first device
- THEN the signing screen marks that device as signed and shows the remaining signer(s) as pending
- AND the app does not yet enable the broadcast action

#### Scenario: Threshold reached, broadcast enabled

- GIVEN a 2-of-3 multi-key wallet PSBT with one signature collected
- WHEN the user collects a second valid partial signature from a different device
- THEN the app combines the partial PSBTs, validates the resulting transaction, and enables the broadcast action

---

### Requirement: QR Signing

The app MUST support PSBT exchange with hardware signing devices via animated QR codes.

For Coldcard devices, the app MUST encode the PSBT as a BBQr animated sequence.

For other QR-compatible devices, the app MUST encode the PSBT as a UR (Uniform Resources) animated sequence or as a static Base64 QR code depending on device capability.

The app MUST provide a QR scanner to read the signed PSBT returned by the hardware device after signing.

The user MUST be able to adjust the QR animation speed (frame density) to match their hardware device's scanning capability.

#### Scenario: Sign via QR with Coldcard

- GIVEN a vault PSBT is ready for signing and the user selects a Coldcard signer
- WHEN the user taps the Coldcard signing option
- THEN the app displays the PSBT as an animated BBQr sequence
- AND after the user signs on the Coldcard and scans the returned QR, the partial signature is recorded and the signer is marked as signed

#### Scenario: Sign via QR with Keystone

- GIVEN a vault PSBT is ready for signing and the user selects a Keystone signer
- WHEN the user taps the Keystone signing option
- THEN the app displays the PSBT as a UR animated QR sequence
- AND after the user scans the returned QR from Keystone, the partial signature is captured

---

### Requirement: NFC Signing

The app MUST support PSBT signing via NFC for compatible devices (TAPSIGNER and Satochip).

The app MUST prompt the user to tap their NFC card and MUST provide clear on-screen instructions during the NFC interaction.

#### Scenario: Sign with TAPSIGNER via NFC

- GIVEN a vault PSBT is ready for signing and the user selects a TAPSIGNER signer
- WHEN the user initiates NFC signing and taps their TAPSIGNER card to the device
- THEN the app reads the card, signs the PSBT, and records the partial signature
- AND the signer is marked as signed on the signing screen

#### Scenario: NFC tap fails or card not detected

- GIVEN the user initiates NFC signing with a TAPSIGNER
- WHEN the NFC tap times out or the card is not detected
- THEN the app surfaces an error and allows the user to retry

---

### Requirement: File-Based Signing

The app MUST allow exporting a PSBT to a file (`.psbt`) so it can be transferred to an air-gapped signing device via SD card or other means.

The app MUST allow importing a signed PSBT from a file after it has been signed by an external device.

The app MUST validate the imported signed PSBT against the original unsigned PSBT before accepting it.

#### Scenario: Export PSBT to file for Coldcard SD card workflow

- GIVEN a vault PSBT is ready for signing and the user selects a Coldcard file-based workflow
- WHEN the user exports the PSBT
- THEN the app writes a `.psbt` file to the device's downloads directory for transfer to the Coldcard's SD card

#### Scenario: Import signed PSBT from file

- GIVEN the user has returned from their air-gapped device with a signed PSBT file
- WHEN the user imports the file from the signing screen
- THEN the app validates the signed PSBT against the expected transaction and records the partial signature if valid
- AND if the file does not match the expected PSBT, the app surfaces a validation error and rejects the import

---

### Requirement: Keeper Channel Signing

The app MUST support signing via the Keeper Channel — a secure encrypted socket connection — for compatible remote signers (such as a mobile key on another device or a signing server).

To initiate a channel, the user MUST scan a QR code displayed by the remote device to establish the encrypted connection.

#### Scenario: Sign via Keeper Channel with remote mobile key

- GIVEN a vault PSBT is ready and the user selects a signer that uses the Keeper Channel
- WHEN the user scans the QR code shown on the remote device to open the channel
- THEN the app transmits the PSBT over the encrypted channel and waits for the signed response
- AND when the remote device returns a signed PSBT, the partial signature is recorded and the signer is marked as signed

#### Scenario: Channel connection cannot be established

- GIVEN the user attempts to initiate a Keeper Channel signing session
- WHEN the connection to the channel relay fails or times out
- THEN the app surfaces an error and allows the user to retry or cancel

---

### Requirement: Broadcast — Phase Three

The app MUST broadcast the fully-signed transaction to the Bitcoin network via the configured Electrum node once all required signatures have been collected.

On successful broadcast, the app MUST display a success screen showing the transaction ID (txid).

On broadcast failure (e.g., Electrum not connected, rejected by node), the app MUST display an error message and MUST NOT navigate away from the signing screen so the user can retry.

#### Scenario: Broadcast succeeds

- GIVEN a multi-sig vault PSBT with the threshold number of signatures collected
- WHEN the user taps the broadcast button
- THEN the app combines the partial signatures, validates the final transaction, and broadcasts it to the Electrum node
- AND a success screen is shown with the txid and a confirmation that the transaction was submitted

#### Scenario: Broadcast fails due to Electrum disconnection

- GIVEN the Electrum node is unreachable at the time of broadcast
- WHEN the user taps the broadcast button
- THEN the app displays an error indicating the node is not connected
- AND the signing screen remains open so the user can retry when connectivity is restored

---

### Requirement: Transaction Note

The user MUST be able to attach a text note to a transaction at the time of sending. The note MUST be persisted and associated with the resulting transaction ID.

#### Scenario: Note attached to transaction

- GIVEN the user has entered a recipient and amount on the send screen
- WHEN the user enters a note in the note field and completes the send
- THEN the note is stored and associated with the resulting txid
- AND the note is visible when viewing that transaction in the transaction history

---

### Requirement: Receive Address Generation

The app MUST generate the next unused receive address for the selected wallet and
display it as both a QR code and a copyable address string.

If receive is opened from a wallet, the app MUST avoid redundant wallet selection
unless required.

The app MUST allow the user to manually advance to a new address, incrementing the
derivation index and generating a fresh address.

The app MUST indicate whether the currently displayed address has been previously
used in a transaction via a visible badge ("Used Address" in red / "New Address"
in green).

#### Scenario: Display receive address

- GIVEN the user opens the receive screen for a wallet
- WHEN the screen loads
- THEN the app shows the next unused address as a QR code and a copyable string
- AND a "New Address" badge is displayed in green to indicate the address has not been used

#### Scenario: Address has been used

- GIVEN the wallet's current receive address has already appeared in a transaction
- WHEN the user opens the receive screen
- THEN a "Used Address" badge is displayed in red alongside the address
- AND the user can generate a new unused address

#### Scenario: Generate new address

- GIVEN the user is viewing a receive address
- WHEN the user taps the "New Address" action
- THEN the app derives the next address in the HD path and displays it with a "New Address" badge

---

### Requirement: Address Verification on Device

The app SHOULD allow users to verify a wallet receive address on the signing device
for currently supported hardware signers that support on-device address display
(BitBox02, Ledger, Trezor, Coldcard, Jade, Portal). Only currently supported
devices should be listed.

#### Scenario: Verify address on hardware device

- GIVEN the user is viewing the receive screen for a multi-key wallet and has a compatible hardware signer registered
- WHEN the user taps the "Verify on Device" option for that signer
- THEN the app navigates to a verification flow for the respective hardware device
- AND the address shown on the device screen MUST match the address displayed in the app

---

### Requirement: Receive with Amount (BIP-21 URI)

The app MUST support generating a BIP-21 payment URI that encodes the receive address and optionally an amount and label.

The app MUST support scanning a BIP-21 URI from the send screen to pre-fill the recipient address, amount, and label from the URI.

#### Scenario: Generate BIP-21 URI with amount

- GIVEN the user is on the receive screen and enters an amount
- WHEN the amount is confirmed
- THEN the app encodes a BIP-21 URI (e.g., `bitcoin:<address>?amount=<btc>&label=<label>`) and updates the displayed QR code

#### Scenario: Scan BIP-21 URI to pre-fill send

- GIVEN the user opens the send screen and scans a QR code
- WHEN the scanned data is a valid BIP-21 URI
- THEN the app pre-fills the recipient address and, if present in the URI, the amount and label fields

---

### Requirement: Address Labels on Receive

The user MUST be able to attach text labels to a receive address from the receive screen. Labels MUST be associated with that address and visible in the UTXO list and transaction history.

#### Scenario: Add label to receive address

- GIVEN the user is viewing a receive address
- WHEN the user opens the label editor and saves a label
- THEN the label is stored and displayed alongside that address in the UTXO management view

---

### Requirement: Send Max

The app MUST provide a "Send Max" option that sets the send amount to the wallet's entire spendable balance minus the estimated fee for the selected priority level.

#### Scenario: Send max sweeps balance

- GIVEN the user has a wallet with a positive spendable balance
- WHEN the user activates "Send Max"
- THEN the amount field is populated with the total balance minus the estimated fee
- AND the confirmation screen reflects this as the send amount with no change output

---

### Requirement: Miniscript Spending Path Selection

For wallets with Miniscript spending conditions (e.g., timelocked, inheritance,
emergency), the app MUST present the user with the available satisfied spending
paths and require the user to select one before proceeding with PSBT creation.

#### Scenario: User selects active spending path for timelocked wallet

- GIVEN the user has a Miniscript wallet and the primary spending path is currently satisfiable
- WHEN the user initiates a send from that wallet
- THEN the app presents the spending path options with their satisfaction status
- AND after the user selects a valid path, PSBT creation proceeds using that path's signing requirements

#### Scenario: Spending path not yet satisfied

- GIVEN the user has a Miniscript wallet and the timelock for the inheritance path has not yet elapsed
- WHEN the user attempts to use the inheritance path
- THEN the app indicates that path is not yet available and prevents selection

---

## Acceptance Criteria

- User-facing copy uses Wallet, not Vault.
- No Buy/Sell/Swap/Acquire references remain.
- Archived wallets cannot be used until unarchived.
- Watch-only wallets cannot send; copy says "This wallet can show balances and transactions, but cannot send bitcoin."
- Send review screen includes source wallet, recipient, amount, fee, and irreversible-warning copy.
- Required warning is present: "Bitcoin transactions cannot be undone. Check the address and amount carefully before sending."
- Unconfirmed transactions are included in balance and shown as pending/unconfirmed.
- Hardware address verification lists only currently supported devices.

---

## Non-Goals

- This spec does not cover UTXO selection/coin control; that is owned by the `utxo-management` domain.
- This spec does not cover transaction history display or transaction labeling after broadcast; that is owned by the `transaction-history` domain.
- This spec does not cover the creation or configuration of signing devices; that is owned by the `signing-devices` domain.
- This spec does not cover wallet creation or quorum policy setup; that is owned by the `vault` domain.
- This spec does not cover fee insight alerts; those are owned by the `notifications` domain.
- This spec does not cover Replace-By-Fee (RBF) bumping of already-broadcast transactions.
- This spec does not cover Lightning Network payments.
