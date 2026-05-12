# Vault Specification

## Purpose

The Vault domain owns the full lifecycle of multi-key wallet creation in Bitcoin
Keeper — creation, quorum configuration, type-specific behavior, Server Key
integration, wallet migration, archiving, and wallet configuration file
import/export.

Internally, this domain uses `vault`, `POLICY_SERVER`, `CANARY`, `SINGE_SIG`
(legacy typo — preserved as persisted enum value), and similar code-level terms.
User-facing copy MUST use **Wallet**, **Server Key**, and related product
language throughout.

A wallet (internally a vault) groups one or more signing keys under an m-of-n
(or Miniscript) spending policy and forms the primary high-security custody
structure in the app.

---

## Requirements

### Requirement: Default Multi-Key Wallet Creation

The app MUST allow a user to create an m-of-n multi-key wallet by selecting n
signing keys from the registered key list and choosing a threshold m
(where 1 ≤ m ≤ n).

The app MUST require at least one signing key to be selected before the wallet
can be created.

The app MUST prevent creating a wallet if the number of selected keys does not
match the declared n value of the chosen scheme. No subscription gating applies.

#### Scenario: Create a 2-of-3 wallet successfully

- GIVEN the user has at least 3 registered signing keys
- WHEN the user selects 3 keys, sets m=2 n=3, enters a name and description, and confirms
- THEN a new DEFAULT wallet is created and appears on the home screen
- AND the wallet displays a confirmed balance of 0 and no transactions

#### Scenario: Insufficient keys for scheme

- GIVEN the user has 2 registered keys but selects an m=2 n=3 scheme
- WHEN the user attempts to confirm wallet creation with only 2 keys selected
- THEN the app prevents wallet creation and surfaces an error indicating insufficient keys

---

### Requirement: Single-Sig Wallet

The app MUST support creating a single-sig wallet (internally `SINGE_SIG` — legacy
typo preserved as persisted enum value) using a single signing key, producing a
P2WPKH (native SegWit) address structure rather than a multisig P2WSH structure.

#### Scenario: Create single-sig wallet

- GIVEN the user has one registered signing key
- WHEN the user selects that key and confirms creation of a single-sig wallet
- THEN a single-sig wallet is created with a P2WPKH script type
- AND the wallet is accessible from the wallet details screen

---

### Requirement: Script Types

The app MUST use P2WSH (native SegWit multisig) as the default script type for
multi-key wallets and P2WPKH for single-key wallets. The app MUST use P2TR
(Taproot) for Miniscript wallets that specify a Taproot multisig script type.

#### Scenario: Multi-key wallet uses P2WSH

- GIVEN the user creates a 2-of-3 DEFAULT wallet
- WHEN the wallet is created
- THEN all receiving addresses generated for that wallet conform to the P2WSH (bc1q…) format

---

### Requirement: Wallet Types

The app MUST support the following wallet types: DEFAULT (standard multi-key), COLLABORATIVE (multi-party custody), SINGE_SIG (single-key, legacy enum), CANARY (honey-pot detection), and MINISCRIPT (policy-based spending conditions).

Canary Wallets MUST be excluded from the primary wallet list shown on the home screen and managed separately from the user's standard wallets.

#### Scenario: Canary Wallet hidden from main wallet list

- GIVEN the user has a Canary Wallet and a DEFAULT wallet
- WHEN the user opens the home screen wallet list
- THEN only the DEFAULT wallet is shown; the Canary Wallet does not appear in the primary list

---

### Requirement: Miniscript Wallets

The app MUST support Miniscript wallets with any combination of the following spending-path subtypes: ASSISTED (server co-signing), TIMELOCKED (time- or block-height-gated primary path), INHERITANCE (reserve key activated after timelock), and EMERGENCY (emergency key activated after a longer timelock).

The app MUST validate the miniscript scheme before accepting wallet creation.

#### Scenario: Create Miniscript wallet with timelock

- GIVEN the user selects MINISCRIPT wallet type with TIMELOCKED subtype
- WHEN the user selects an initial timelock duration (e.g., 6 months) and confirms
- THEN a MINISCRIPT wallet is created with the timelock encoded in the miniscript policy
- AND the wallet details screen displays the time remaining until the timelock expires

#### Scenario: Timelock expiry display

- GIVEN a MINISCRIPT TIMELOCKED wallet exists with a 6-month timelock set 5 months ago
- WHEN the user opens the wallet details screen
- THEN the app displays approximately 1 month remaining before the timelock activation path becomes spendable

---

### Requirement: Server Key Configuration

For wallets that include a Server Key (internally `POLICY_SERVER`) signing key,
the user MUST be able to configure a spending limit, a signing delay, and 2FA
verification requirements. No subscription gating applies.

Server Key configuration changes MUST NOT take effect immediately — the app MUST
enforce a configurable delay period before a policy update is applied, surfacing
an action item notification when the delay has elapsed.

#### Scenario: Configure spending limit

- GIVEN a wallet with a Server Key exists
- WHEN the user sets a maximum transaction amount of 1,000,000 sats and a 7-day time window
- THEN the Server Key is updated and will refuse to co-sign any transaction exceeding 1,000,000 sats within any rolling 7-day period

#### Scenario: Configure signing delay

- GIVEN a wallet with a Server Key
- WHEN the user sets a signing delay of 1 day
- THEN the Server Key will not co-sign a requested transaction until at least 1 day after the signing request is submitted

#### Scenario: Policy update delayed

- GIVEN the user submits a policy change to reduce the spending limit
- WHEN the change is submitted
- THEN the app displays a pending state indicating when the policy change will take effect
- AND an action item notification appears when the delay period has elapsed and the new policy is active

#### Scenario: Transaction exceeds spending limit

- GIVEN a Server Key is configured with a maximum transaction amount of 500,000 sats
- WHEN the user attempts to send 600,000 sats through that wallet
- THEN the Server Key refuses to co-sign the PSBT
- AND the app displays an error indicating the transaction exceeds the configured limit

---

### Requirement: Wallet Migration

The app MUST allow migrating an existing wallet to a new signing key set or quorum
scheme without interrupting access to wallet funds. Migration MUST create a new
wallet and require the user to sweep the balance from the old wallet to the new
one.

During migration, the original wallet MUST remain accessible in a pending-archive
(migrating) state until its balance reaches zero, at which point it MUST be
automatically archived. Archived wallets are automatically created as a result
of migration — archiving is not a user-initiated action in isolation.

The user MUST be able to manually trigger final archiving from wallet settings
if the automatic transition does not complete.

#### Scenario: Successful wallet migration sweep

- GIVEN a 2-of-3 DEFAULT wallet with a confirmed balance of 500,000 sats
- WHEN the user initiates migration to a new 2-of-3 wallet with a different key set
- THEN a new wallet is created and a sweep transaction is composed sending the full balance to the new wallet's first address
- AND once the sweep transaction confirms, the original wallet is automatically archived

#### Scenario: Migration with zero balance

- GIVEN a 2-of-3 wallet with a zero balance undergoing migration
- WHEN the app detects the balance is already zero
- THEN the original wallet is immediately archived without requiring a sweep transaction

#### Scenario: Migration sweep fails due to insufficient balance

- GIVEN a 2-of-3 wallet with a balance being migrated and a pending sweep transaction
- WHEN the sweep transaction fails with "Insufficient balance"
- THEN the app shows an error toast and allows the user to retry
- AND the original wallet remains in the pending-archive state

---

### Requirement: Archived Wallets

A wallet that has been migrated MUST be automatically marked as archived and MUST
be accessible in a read-only view (no new transactions can be sent from it without
unarchiving). The archived wallet list MUST be accessible from the settings of the
current active wallet that replaced it.

The app MUST NOT show archived wallets in the primary wallet list on the home screen.

To use an archived wallet again, the user MUST explicitly unarchive it first.

#### Scenario: View archived wallet

- GIVEN a wallet was previously migrated and is now archived
- WHEN the user navigates to the current wallet's settings and selects "Archived Wallets"
- THEN the archived wallet appears in a read-only list
- AND tapping the archived wallet navigates to its details screen in read-only mode

#### Scenario: Archived wallet absent from home screen

- GIVEN the user has one active wallet and one archived wallet
- WHEN the user views the home screen
- THEN only the active wallet is displayed; the archived wallet does not appear

---

### Requirement: Unarchive Wallet

The app MUST allow unarchiving an archived wallet (reversing its archived state)
so that the wallet becomes active again and can be used for sending.
Unarchiving MUST also un-archive the associated signing keys.

#### Scenario: Unarchive wallet

- GIVEN a wallet is in archived state
- WHEN the user unarchives the wallet from the wallet details screen
- THEN the wallet's archived flag is cleared
- AND the wallet reappears in the active wallet list on the home screen
- AND the user can send from the wallet again

---

### Requirement: Wallet Visibility

The app MUST allow the user to hide a wallet so it does not appear in the primary
home screen list. Hidden wallets are a visibility/privacy feature and remain
accessible and spendable. Hidden wallets MUST remain accessible via wallet
management settings.

> **Note:** Hidden Wallet (visibility/privacy) and Archived Wallet (result of
> migration) are distinct concepts. Archiving is not a user action.

#### Scenario: Hide a wallet

- GIVEN a DEFAULT wallet is visible on the home screen
- WHEN the user selects "Hide Wallet" in wallet settings
- THEN the wallet no longer appears on the home screen
- AND a confirmation toast is displayed

---

### Requirement: Wallet Settings and Naming

The user MUST be able to view wallet details (name, description, scheme, script type) and update the wallet's name and description from the wallet settings screen.

#### Scenario: Edit wallet name

- GIVEN a wallet named "Cold Storage"
- WHEN the user opens wallet settings and updates the name to "Long-Term Hold"
- THEN the wallet displays "Long-Term Hold" on the home screen and in all wallet-detail views

---

### Requirement: Wallet Configuration Export

The app MUST allow exporting a wallet's output descriptor (or BSMS-compatible
wallet configuration file) as both a QR code and as shareable text. The export
MUST support both static and animated (BBQr) QR formats to accommodate different
hardware signer scanners.

#### Scenario: Export wallet configuration as static QR

- GIVEN a 2-of-3 DEFAULT wallet exists
- WHEN the user opens "Wallet Configuration" in wallet settings
- THEN a static QR code representing the wallet's output descriptor is displayed
- AND the descriptor string is shown as copyable text below the QR

#### Scenario: Export wallet configuration as animated QR

- GIVEN a wallet with a large descriptor
- WHEN the user switches to the animated QR tab in the configuration screen
- THEN an animated BBQr sequence is displayed for hardware signers that require animated QR input

#### Scenario: Share wallet configuration via NFC

- GIVEN the user is on the wallet configuration screen on an NFC-capable device
- WHEN the user taps "Share via NFC" and holds the device to the receiving device
- THEN the wallet configuration file is transmitted via NFC

---

### Requirement: Wallet Configuration Import

The app MUST allow importing a wallet from an existing output descriptor or BSMS
file, enabling recovery of a wallet configured in another app or for collaborative
setups where the coordinator shares the final descriptor.

The import MUST check whether the described wallet already exists in the app and
prevent duplicate creation.

#### Scenario: Import wallet from QR

- GIVEN the user has a valid wallet output descriptor as a QR code
- WHEN the user scans the QR code via the import flow
- THEN the app parses the descriptor and presents the wallet configuration for review
- AND if no duplicate exists, the wallet is created and appears in the wallet list

#### Scenario: Import duplicate wallet

- GIVEN a wallet matching the scanned descriptor already exists in the app
- WHEN the user attempts to import the descriptor
- THEN the app surfaces an error or warning indicating the wallet already exists and does not create a duplicate

#### Scenario: Import wallet from file

- GIVEN the user has a BSMS or descriptor file on their device
- WHEN the user selects the file via the import option
- THEN the app reads the file, parses the wallet configuration, and proceeds to the wallet setup screen

---

### Requirement: Wallet Sync

The app MUST sync a wallet's confirmed and unconfirmed balances, UTXO set, and
transaction history from the connected Electrum node. Wallet sync MUST occur on
demand (pull-to-refresh) and automatically when the wallet screen is opened with
auto-refresh enabled.

Sync errors due to lost Electrum connectivity MUST surface a descriptive error
message without clearing previously cached balance and transaction data.

#### Scenario: Successful wallet sync

- GIVEN a wallet with a connected Electrum node
- WHEN the user pulls down to refresh the wallet details screen
- THEN the wallet's balance and transaction list are updated with the latest on-chain data

#### Scenario: Sync failure shows error

- GIVEN the Electrum node is unreachable
- WHEN the user attempts to refresh the wallet
- THEN the app displays a connectivity error message
- AND the previously cached balance and transaction data remain visible

---

### Requirement: Canary Wallet Alert

The app MUST detect when a Canary Wallet's balance changes and generate an action
item alert notifying the user of the unexpected balance change. Canary Wallets
are used as honeypots to detect unauthorized access.

#### Scenario: Canary Wallet receives unexpected transaction

- GIVEN a Canary Wallet with a known balance
- WHEN the Canary Wallet sync detects a new incoming transaction
- THEN a CANARY_WALLET action item is added to the alert stack
- AND the action item is surfaced on the home screen prompting the user to investigate

---

### Requirement: Emergency Key Configuration (Miniscript)

For MINISCRIPT wallets, the user MUST be able to add an Emergency Key signer whose
signing rights activate only after a user-configured emergency timelock period
(12 months to 5 years). The emergency key can be reset by the primary keyholders
before its activation timelock expires.

#### Scenario: Add emergency key

- GIVEN a MINISCRIPT wallet without an emergency key
- WHEN the user selects "Add Emergency Key," chooses a signer, and sets a 36-month activation timelock
- THEN the wallet's miniscript policy is updated to include the emergency key path
- AND the wallet details screen reflects the updated signing configuration

#### Scenario: Reset emergency key

- GIVEN a MINISCRIPT wallet with an emergency key configured with a 3-year timelock
- WHEN the user navigates to settings and resets the emergency key to a new signer
- THEN a wallet migration is performed encoding the new emergency key
- AND the wallet details screen displays the updated emergency key signer

---

### Requirement: Inheritance Key Configuration (Miniscript)

For MINISCRIPT wallets, the user MUST be able to add an Inheritance Key signer
whose signing rights activate only after the initial timelock expires. The
inheritance key enables estate-planning scenarios where a designated heir gains
spending access after a prolonged period of inactivity.

#### Scenario: Add inheritance key

- GIVEN a MINISCRIPT wallet with an initial timelock
- WHEN the user adds an Inheritance Key and sets a 12-month activation period
- THEN the wallet's Miniscript policy includes an inheritance spending path that activates after 12 months
- AND the wallet settings display the inheritance key and its activation schedule

---

### Requirement: Initial Timelock Reset

For MINISCRIPT TIMELOCKED wallets, the user MUST be able to reset the initial
timelock before it expires. Resetting the timelock re-encodes it with a new
future activation date, preventing the inheritance or emergency spending paths
from becoming active.

#### Scenario: Reset timelock before expiry

- GIVEN a MINISCRIPT wallet with a timelock expiring in 1 month
- WHEN the user navigates to wallet settings and selects "Reset Timelock," then selects a new 6-month duration
- THEN a wallet migration is initiated with the updated timelock
- AND after migration the wallet details screen shows the new, extended timelock expiry

#### Scenario: Timelock reset after keys already enrolled

- GIVEN a MINISCRIPT wallet that has both inheritance and emergency keys
- WHEN the user initiates a timelock reset
- THEN the app walks through resetting all enrolled timelocked keys in sequence before completing the migration

---

### Requirement: Label Import and Export

The app MUST support exporting UTXO and address labels associated with a wallet
and importing them back, allowing users to transfer labeling data between devices
or after recovery.

#### Scenario: Export wallet labels

- GIVEN a wallet with labeled UTXOs and addresses
- WHEN the user selects "Import/Export Labels" from wallet settings
- THEN a labels export file is generated and can be shared or saved

#### Scenario: Import wallet labels

- GIVEN a previously exported labels file
- WHEN the user selects the file via the import option in wallet settings
- THEN the labels are applied to the matching UTXOs and addresses in the wallet

---

### Requirement: Subscription Tier Gating (Removed)

> **Status: Removed from Active Scope**
>
> Subscription tier gating for multi-key wallets is removed. Creating a multi-key
> wallet with any number of hardware signing keys does NOT require a subscription
> tier upgrade. No upgrade prompts should be shown. Keeper is free.

---

## Acceptance Criteria

- User-facing copy uses Wallet and Server Key, not Vault or Policy Server.
- Internal code terms (`vault`, `POLICY_SERVER`, `SINGE_SIG`, `CANARY`) may remain.
- `SINGE_SIG` legacy typo documented as persisted enum value.
- Archived Wallet is auto-created by migration — not a manual user action.
- Archived wallet must be unarchived before use (via Unarchive Wallet).
- Hidden Wallet is distinct from Archived Wallet.
- Canary Wallet is user-facing name (not Canary Vault).
- No subscription/tier gating remains.
- Server Key trust model: not sole signer, only one in multi-key setup.

---

## Non-Goals

- Wallet-level (single-sig hot wallet) creation and management are covered by the `wallets` spec, not this spec.
- The mechanics of signing PSBTs on hardware or software devices are covered by the `signing-devices` and `send-and-receive` specs.
- Transaction broadcasting, fee estimation, and PSBT assembly are owned by the `send-and-receive` spec.
- Collaborative Wallet co-signer key exchange flow and coordinator session management are covered by the `collaborative-wallet` spec.
- Inheritance planning UX, advisor integration, and PDF export are covered by the `inheritance` spec.
- Health check prompts and signer health history are covered by the `health-checks` spec.
- Cloud backup of wallet metadata is covered by the `backup-and-recovery` spec.
