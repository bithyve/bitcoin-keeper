# Vault Specification

## Purpose

The Vault domain owns the full lifecycle of multi-signature vaults in Bitcoin Keeper — creation, quorum configuration, type-specific behavior, POLICY_SERVER integration, vault migration, archiving, and descriptor import/export. A vault groups one or more signing keys under an m-of-n (or Miniscript) spending policy and forms the primary high-security custody structure in the app.

---

## Requirements

### Requirement: Default Vault Creation

The app MUST allow a user to create an m-of-n multisig vault by selecting n signing keys from the registered key list and choosing a threshold m (where 1 ≤ m ≤ n).

The app MUST require at least one signing key to be selected before the vault can be created.

The app MUST prevent creating a vault if the number of selected keys does not match the declared n value of the chosen scheme.

#### Scenario: Create a 2-of-3 vault successfully

- GIVEN the user has at least 3 registered signing keys
- WHEN the user selects 3 keys, sets m=2 n=3, enters a name and description, and confirms
- THEN a new DEFAULT vault is created and appears on the home screen
- AND the vault displays a confirmed balance of 0 and no transactions

#### Scenario: Insufficient keys for scheme

- GIVEN the user has 2 registered keys but selects an m=2 n=3 scheme
- WHEN the user attempts to confirm vault creation with only 2 keys selected
- THEN the app prevents vault creation and surfaces an error indicating insufficient keys

---

### Requirement: Single-Sig Vault

The app MUST support creating a SINGE_SIG vault using a single signing key, producing a P2WPKH (native SegWit) address structure rather than a multisig P2WSH structure.

#### Scenario: Create single-sig vault

- GIVEN the user has one registered signing key
- WHEN the user selects that key and confirms creation of a SINGE_SIG vault
- THEN a single-sig vault is created with a P2WPKH script type
- AND the vault is accessible from the vault details screen

---

### Requirement: Script Types

The app MUST use P2WSH (native SegWit multisig) as the default script type for multisig vaults and P2WPKH for single-key vaults. The app MUST use P2TR (Taproot) for Miniscript vaults that specify a Taproot multisig script type.

#### Scenario: Multisig vault uses P2WSH

- GIVEN the user creates a 2-of-3 DEFAULT vault
- WHEN the vault is created
- THEN all receiving addresses generated for that vault conform to the P2WSH (bc1q…) format

---

### Requirement: Vault Types

The app MUST support the following vault types: DEFAULT (standard multisig), COLLABORATIVE (multi-party custody), SINGE_SIG (single-key), CANARY (honey-pot detection), and MINISCRIPT (policy-based spending conditions).

Canary vaults MUST be excluded from the primary vault list shown on the home screen and managed separately from the user's standard vaults.

#### Scenario: Canary vault hidden from main vault list

- GIVEN the user has a CANARY vault and a DEFAULT vault
- WHEN the user opens the home screen vault list
- THEN only the DEFAULT vault is shown; the CANARY vault does not appear in the primary list

---

### Requirement: Miniscript Vaults

The app MUST support Miniscript vaults with any combination of the following spending-path subtypes: ASSISTED (server co-signing), TIMELOCKED (time- or block-height-gated primary path), INHERITANCE (reserve key activated after timelock), and EMERGENCY (emergency key activated after a longer timelock).

The app MUST validate the miniscript scheme before accepting vault creation.

#### Scenario: Create Miniscript vault with timelock

- GIVEN the user selects MINISCRIPT vault type with TIMELOCKED subtype
- WHEN the user selects an initial timelock duration (e.g., 6 months) and confirms
- THEN a MINISCRIPT vault is created with the timelock encoded in the miniscript policy
- AND the vault details screen displays the time remaining until the timelock expires

#### Scenario: Timelock expiry display

- GIVEN a MINISCRIPT TIMELOCKED vault exists with a 6-month timelock set 5 months ago
- WHEN the user opens the vault details screen
- THEN the app displays approximately 1 month remaining before the timelock activation path becomes spendable

---

### Requirement: Policy Server Configuration

For vaults that include a POLICY_SERVER signing key, the user MUST be able to configure a spending limit (maximum transaction amount, and optionally a time window for aggregate limits), a signing delay (duration the server waits before co-signing), and 2FA verification requirements.

Policy configuration changes MUST NOT take effect immediately — the app MUST enforce a configurable delay period before a policy update is applied, surfacing a UAI notification when the delay has elapsed.

#### Scenario: Configure spending limit

- GIVEN a vault with a POLICY_SERVER key exists
- WHEN the user sets a maximum transaction amount of 1,000,000 sats and a 7-day time window
- THEN the policy server is updated and will refuse to co-sign any transaction exceeding 1,000,000 sats within any rolling 7-day period

#### Scenario: Configure signing delay

- GIVEN a vault with a POLICY_SERVER key
- WHEN the user sets a signing delay of 1 day
- THEN the policy server will not co-sign a requested transaction until at least 1 day after the signing request is submitted

#### Scenario: Policy update delayed

- GIVEN the user submits a policy change to reduce the spending limit
- WHEN the change is submitted
- THEN the app displays a pending state indicating when the policy change will take effect
- AND a UAI notification appears when the delay period has elapsed and the new policy is active

#### Scenario: Transaction exceeds spending limit

- GIVEN a POLICY_SERVER is configured with a maximum transaction amount of 500,000 sats
- WHEN the user attempts to send 600,000 sats through that vault
- THEN the policy server refuses to co-sign the PSBT
- AND the app displays an error indicating the transaction exceeds the configured limit

---

### Requirement: Vault Migration

The app MUST allow migrating an existing vault to a new signing key set or quorum scheme without interrupting access to vault funds. Migration MUST create a new vault and require the user to sweep the balance from the old vault to the new one.

During migration, the original vault MUST remain accessible in a pending-archive (migrating) state until its balance reaches zero, at which point it MUST be automatically archived.

The user MUST be able to manually trigger final archiving from vault settings if the automatic transition does not complete.

#### Scenario: Successful vault migration sweep

- GIVEN a 2-of-3 DEFAULT vault with a confirmed balance of 500,000 sats
- WHEN the user initiates migration to a new 2-of-3 vault with a different key set
- THEN a new vault is created and a sweep transaction is composed sending the full balance to the new vault's first address
- AND once the sweep transaction confirms, the original vault is automatically archived

#### Scenario: Migration with insufficient balance

- GIVEN a 2-of-3 vault with a zero balance undergoing migration
- WHEN the app detects the balance is already zero
- THEN the original vault is immediately archived without requiring a sweep transaction

#### Scenario: Migration sweep fails due to insufficient balance

- GIVEN a 2-of-3 vault with a balance being migrated and a pending sweep transaction
- WHEN the sweep transaction fails with "Insufficient balance"
- THEN the app shows an error toast and allows the user to retry
- AND the original vault remains in the pending-archive state

---

### Requirement: Archived Vaults

A vault that has been migrated MUST be marked as archived and MUST be accessible in a read-only view (no new transactions can be sent from it). The archived vault list MUST be accessible from the settings of the current active vault that replaced it.

The app MUST NOT show archived vaults in the primary vault list on the home screen.

#### Scenario: View archived vault

- GIVEN a vault was previously migrated and is now archived
- WHEN the user navigates to the current vault's settings and selects "Archived Vaults"
- THEN the archived vault appears in a read-only list
- AND tapping the archived vault navigates to its details screen in read-only mode

#### Scenario: Archived vault absent from home screen

- GIVEN the user has one active vault and one archived vault
- WHEN the user views the home screen
- THEN only the active vault is displayed; the archived vault does not appear

---

### Requirement: Vault Reinstatement

The app MUST allow reinstating an archived vault (reversing its archived state) so that the vault becomes active again. Reinstatement MUST also un-archive the associated signing keys.

#### Scenario: Reinstate archived vault

- GIVEN a vault is in archived state
- WHEN the user reinstates the vault from the vault details screen
- THEN the vault's archived flag is cleared
- AND the vault reappears in the active vault list on the home screen

---

### Requirement: Vault Visibility

The app MUST allow the user to hide a vault so it does not appear in the primary home screen list. Hidden vaults MUST remain accessible via vault management settings.

#### Scenario: Hide a vault

- GIVEN a DEFAULT vault is visible on the home screen
- WHEN the user selects "Hide Vault" in vault settings
- THEN the vault no longer appears on the home screen
- AND a confirmation toast is displayed

---

### Requirement: Vault Settings and Naming

The user MUST be able to view vault details (name, description, scheme, script type) and update the vault's name and description from the vault settings screen.

#### Scenario: Edit vault name

- GIVEN a vault named "Cold Storage"
- WHEN the user opens vault settings and updates the name to "Long-Term Hold"
- THEN the vault displays "Long-Term Hold" on the home screen and in all vault-detail views

---

### Requirement: Vault Descriptor Export

The app MUST allow exporting a vault's output descriptor (or BSMS-compatible wallet configuration) as both a QR code and as shareable text. The export MUST support both static and animated (BBQr) QR formats to accommodate different hardware signer scanners.

#### Scenario: Export descriptor as static QR

- GIVEN a 2-of-3 DEFAULT vault exists
- WHEN the user opens "Wallet Configuration" in vault settings
- THEN a static QR code representing the vault's output descriptor is displayed
- AND the descriptor string is shown as copyable text below the QR

#### Scenario: Export descriptor as animated QR

- GIVEN a vault with a large descriptor
- WHEN the user switches to the animated QR tab in the configuration screen
- THEN an animated BBQr sequence is displayed for hardware signers that require animated QR input

#### Scenario: Share descriptor via NFC

- GIVEN the user is on the vault configuration screen on an NFC-capable device
- WHEN the user taps "Share via NFC" and holds the device to the receiving device
- THEN the vault descriptor is transmitted via NFC

---

### Requirement: Vault Descriptor Import

The app MUST allow importing a vault from an existing output descriptor or BSMS file, enabling recovery of a vault configured in another wallet or for collaborative setups where the coordinator shares the final descriptor.

The import MUST check whether the described vault already exists in the app and prevent duplicate creation.

#### Scenario: Import vault from QR

- GIVEN the user has a valid vault output descriptor as a QR code
- WHEN the user scans the QR code via the import flow
- THEN the app parses the descriptor and presents the vault configuration for review
- AND if no duplicate exists, the vault is created and appears in the vault list

#### Scenario: Import duplicate vault

- GIVEN a vault matching the scanned descriptor already exists in the app
- WHEN the user attempts to import the descriptor
- THEN the app surfaces an error or warning indicating the vault already exists and does not create a duplicate

#### Scenario: Import vault from file

- GIVEN the user has a BSMS or descriptor file on their device
- WHEN the user selects the file via the import option
- THEN the app reads the file, parses the vault configuration, and proceeds to the vault setup screen

---

### Requirement: Vault Sync

The app MUST sync a vault's confirmed and unconfirmed balances, UTXO set, and transaction history from the connected Electrum node. Vault sync MUST occur on demand (pull-to-refresh) and automatically when the vault screen is opened with auto-refresh enabled.

Sync errors due to lost Electrum connectivity MUST surface a descriptive error message without clearing previously cached balance and transaction data.

#### Scenario: Successful vault sync

- GIVEN a vault with a connected Electrum node
- WHEN the user pulls down to refresh the vault details screen
- THEN the vault's balance and transaction list are updated with the latest on-chain data

#### Scenario: Sync failure shows error

- GIVEN the Electrum node is unreachable
- WHEN the user attempts to refresh the vault
- THEN the app displays a connectivity error message
- AND the previously cached balance and transaction data remain visible

---

### Requirement: Canary Vault Alert

The app MUST detect when a canary vault's balance changes and generate a UAI (User Action Item) alert notifying the user of the unexpected balance change. Canary vaults are used as honeypots to detect unauthorized access.

#### Scenario: Canary vault receives unexpected transaction

- GIVEN a canary vault with a known balance
- WHEN the canary vault sync detects a new incoming transaction
- THEN a CANARY_WALLET UAI is added to the alert stack
- AND the UAI is surfaced on the home screen prompting the user to investigate

---

### Requirement: Emergency Key Configuration (Miniscript)

For MINISCRIPT vaults, the user MUST be able to add an Emergency Key signer whose signing rights activate only after a user-configured emergency timelock period (12 months to 5 years). The emergency key can be reset by the primary keyholders before its activation timelock expires.

#### Scenario: Add emergency key

- GIVEN a MINISCRIPT vault without an emergency key
- WHEN the user selects "Add Emergency Key," chooses a signer, and sets a 36-month activation timelock
- THEN the vault's miniscript policy is updated to include the emergency key path
- AND the vault details screen reflects the updated signing configuration

#### Scenario: Reset emergency key

- GIVEN a MINISCRIPT vault with an emergency key configured with a 3-year timelock
- WHEN the user navigates to settings and resets the emergency key to a new signer
- THEN a vault migration is performed encoding the new emergency key
- AND the vault details screen displays the updated emergency key signer

---

### Requirement: Inheritance Key Configuration (Miniscript)

For MINISCRIPT vaults, the user MUST be able to add an Inheritance (reserve) Key signer whose signing rights activate only after the initial timelock expires. The inheritance key enables estate-planning scenarios where a designated heir gains spending access after a prolonged period of inactivity.

#### Scenario: Add inheritance key

- GIVEN a MINISCRIPT vault with an initial timelock
- WHEN the user adds an Inheritance Key and sets a 12-month activation period
- THEN the vault's Miniscript policy includes an inheritance spending path that activates after 12 months
- AND the vault settings display the inheritance key and its activation schedule

---

### Requirement: Initial Timelock Reset

For MINISCRIPT TIMELOCKED vaults, the user MUST be able to reset the initial timelock before it expires. Resetting the timelock re-encodes it with a new future activation date, preventing the inheritance or emergency spending paths from becoming active.

#### Scenario: Reset timelock before expiry

- GIVEN a MINISCRIPT vault with a timelock expiring in 1 month
- WHEN the user navigates to vault settings and selects "Reset Timelock," then selects a new 6-month duration
- THEN a vault migration is initiated with the updated timelock
- AND after migration the vault details screen shows the new, extended timelock expiry

#### Scenario: Timelock reset after keys already enrolled

- GIVEN a MINISCRIPT vault that has both inheritance and emergency keys
- WHEN the user initiates a timelock reset
- THEN the app walks through resetting all enrolled timelocked keys in sequence before completing the migration

---

### Requirement: Label Import and Export

The app MUST support exporting UTXO and address labels associated with a vault and importing them back, allowing users to transfer labeling data between devices or after recovery.

#### Scenario: Export vault labels

- GIVEN a vault with labeled UTXOs and addresses
- WHEN the user selects "Import/Export Labels" from vault settings
- THEN a labels export file is generated and can be shared or saved

#### Scenario: Import vault labels

- GIVEN a previously exported labels file
- WHEN the user selects the file via the import option in vault settings
- THEN the labels are applied to the matching UTXOs and addresses in the vault

---

### Requirement: Subscription Tier Gating

Creating a multisig vault with more than one hardware signing key MUST require the user to be on the Hodler tier (L2) or above. Users on the Pleb tier (L1, free) MUST be shown an upgrade prompt when they attempt to add a second or subsequent hardware key to a vault.

#### Scenario: Free-tier user attempts to add second hardware key

- GIVEN the user is on the Pleb (L1) subscription tier
- WHEN the user attempts to add a second hardware signing key to a vault
- THEN an upgrade modal is displayed explaining that Hodler (L2) or higher is required
- AND the key is not added to the vault configuration

---

## Non-Goals

- Wallet-level (single-sig hot wallet) creation and management are covered by the `wallets` spec, not this spec.
- The mechanics of signing PSBTs on hardware or software devices are covered by the `signing-devices` and `send-and-receive` specs.
- Transaction broadcasting, fee estimation, and PSBT assembly are owned by the `send-and-receive` spec.
- Collaborative vault co-signer key exchange flow and coordinator session management are covered by the `collaborative-wallet` spec.
- Inheritance planning UX, advisor integration, and PDF export are covered by the `inheritance` spec.
- Health check prompts and signer health history are covered by the `health-checks` spec.
- Cloud backup of vault metadata is covered by the `backup-and-recovery` spec.
- Subscription plan purchase and receipt verification are covered by the `subscription` spec.
