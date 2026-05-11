# Backup And Recovery Specification

## Purpose

This domain covers all mechanisms for protecting and restoring a user's complete
app state: seed phrase display and confirmation, assisted server backup of wallets
and signers, cloud (iCloud / Google Drive) backup of vault output descriptors, and
full app recovery from either a seed phrase or a cloud backup file. It is the
safety net that ensures no user ever permanently loses access to their Bitcoin.

---

## Requirements

### Requirement: Seed Phrase Display

The app MUST present the full primary seed phrase (12, 18, or 24 BIP-39 words) to
the user one word at a time, with each word initially obscured. The user MUST be
able to tap any word to reveal it individually.

#### Scenario: User views seed phrase

- GIVEN the user has authenticated and navigated to the seed backup screen
- WHEN the seed phrase list is displayed
- THEN each word appears obscured by default
- AND tapping a word reveals its plaintext content
- AND tapping the same word again re-obscures it

#### Scenario: Seed phrase hidden when navigating away

- GIVEN the user has revealed one or more seed words
- WHEN the user navigates away from the seed backup screen
- THEN all previously revealed words return to their obscured state upon re-entry

---

### Requirement: Seed Phrase Confirmation

The app MUST verify that the user has recorded their seed phrase by prompting them
to correctly enter one randomly-selected word from the phrase before marking the
backup as confirmed.

#### Scenario: Correct word entered

- GIVEN the user has viewed their seed phrase
- WHEN the app prompts for a specific seed word and the user enters it correctly
- THEN the backup status is updated to confirmed
- AND the confirmation is recorded in backup history

#### Scenario: Incorrect word entered

- GIVEN the app has prompted for a specific seed word
- WHEN the user enters an incorrect or misspelled word
- THEN the app displays an error message
- AND the backup is NOT marked as confirmed

#### Scenario: Confirmation skipped

- GIVEN the app has prompted for seed word confirmation
- WHEN the user declines to confirm
- THEN the skip action is recorded in backup history
- AND the backup remains in an unconfirmed state

---

### Requirement: Seed Phrase Export

A logged-in user MUST be able to view their seed phrase at any time from the app
settings or backup management screen, after passing authentication.

#### Scenario: Viewing seed phrase after authentication

- GIVEN the user is authenticated
- WHEN the user navigates to the export seed or view recovery key screen
- THEN the full seed phrase is displayed in obscured form
- AND each word can be individually revealed by tapping

#### Scenario: Unauthenticated access blocked

- GIVEN the user has not yet authenticated in the current session
- WHEN the user attempts to access the seed export screen
- THEN the app requires authentication before displaying the seed phrase

---

### Requirement: Backup History

The app MUST maintain a chronological history of all backup-related events
(seed created, seed confirmed, seed confirmation skipped) and display it to
the user on the backup management screen.

#### Scenario: History displayed after seed backup created

- GIVEN the user has completed the seed phrase backup flow
- WHEN the user opens the backup history screen
- THEN the history list shows a "seed backup created" entry with a timestamp

#### Scenario: History updated after confirmation

- GIVEN the user has confirmed their seed phrase
- WHEN the backup history screen is opened
- THEN the list shows a "seed backup confirmed" entry with the confirmation timestamp

---

### Requirement: Assisted Server Backup

The app MUST automatically back up all wallets, signers, vaults, labels, and node
configurations to the BitHyve relay server, encrypted with a key derived from the
user's primary seed. This backup MUST be triggered whenever significant app state
changes occur.

#### Scenario: Successful server backup after state change

- GIVEN the user has added a new wallet or signer
- WHEN the app syncs state to the relay server
- THEN all wallets, signers, vaults, and labels are encrypted and uploaded successfully
- AND the pending backup flag is cleared

#### Scenario: Server backup fails due to network error

- GIVEN the device has no network connectivity
- WHEN the app attempts a relay server backup
- THEN the backup is marked as pending
- AND a "server backup failed" alert is surfaced to the user
- AND the app retries the backup the next time connectivity is restored

#### Scenario: Server backup failure UAI generated

- GIVEN a relay server backup has failed
- WHEN the home screen is displayed
- THEN an actionable user alert item appears indicating the backup failure
- AND the alert is dismissed once the backup succeeds

---

### Requirement: Cloud Backup Password

Before a cloud backup can be created, the user MUST set an encryption password. The
password MUST be used to encrypt vault output descriptors before uploading to cloud
storage. The password MUST NOT be stored on the relay server or transmitted in
plaintext.

#### Scenario: Password set successfully

- GIVEN the user navigates to the cloud backup password screen
- WHEN the user enters a password and a matching confirmation
- THEN the password is accepted and the cloud backup screen becomes active

#### Scenario: Passwords do not match

- GIVEN the user is on the cloud backup password screen
- WHEN the user enters a password and a non-matching confirmation
- THEN the app displays a validation error
- AND the password is not saved

#### Scenario: Empty password rejected

- GIVEN the user is on the cloud backup password screen
- WHEN the user submits without entering a password
- THEN the app displays an error requiring a password

---

### Requirement: Cloud Backup (BSMS)

The app MUST support encrypting and uploading vault output descriptors (BSMS format)
to iCloud (iOS) or Google Drive (Android). Canary vaults MUST be excluded from
cloud backup. A backup MUST only proceed when the user has previously set an
encryption password and has at least one eligible vault.

#### Scenario: Successful cloud backup

- GIVEN the user has set a cloud backup password and has at least one non-canary vault
- WHEN the user initiates a cloud backup
- THEN the app uploads the encrypted vault descriptors to the platform cloud service
- AND a success entry is recorded in the cloud backup history
- AND the pending cloud backup flag is cleared

#### Scenario: Cloud backup fails — no eligible vaults

- GIVEN the user has no active non-canary vaults
- WHEN the user attempts a cloud backup
- THEN the app records a failure in cloud backup history with a descriptive reason
- AND the user is informed that no vaults are available to back up

#### Scenario: Cloud backup fails — cloud service unavailable

- GIVEN the cloud service (iCloud / Google Drive) cannot be reached
- WHEN the user initiates a cloud backup
- THEN the app records a failure entry in cloud backup history
- AND the user is shown an error indicating the cloud service is unavailable

---

### Requirement: Cloud Backup Health Check

The app MUST allow the user to verify that a previously uploaded cloud backup is
accessible and intact.

#### Scenario: Health check passes

- GIVEN a cloud backup file exists on the platform cloud service
- WHEN the user triggers a cloud backup health check
- THEN the app confirms the file is accessible
- AND a health check success entry is recorded in the cloud backup history

#### Scenario: Health check fails

- GIVEN the cloud backup file is missing or corrupted
- WHEN the user triggers a cloud backup health check
- THEN the app records a failure entry in the cloud backup history
- AND the user is informed that the backup file could not be verified

---

### Requirement: Cloud Backup History

The app MUST display a chronological log of all cloud backup events (created,
failed, health check passed, health check failed) on the cloud backup screen.

#### Scenario: History shown after successful backup

- GIVEN the user has performed at least one cloud backup
- WHEN the cloud backup screen is opened
- THEN the history list shows entries ordered from most recent to oldest
- AND each entry shows the event type and a relative timestamp

#### Scenario: Empty state shown with no prior backup

- GIVEN the user has never performed a cloud backup
- WHEN the cloud backup screen is opened
- THEN the history section is empty and the user is prompted to create a first backup

---

### Requirement: Seed Phrase Recovery

The app MUST allow a user to restore their complete app state by entering a valid
12-, 18-, or 24-word BIP-39 seed phrase. Upon successful entry, the app MUST
re-derive all wallets, re-import all signers and vaults from the relay server,
restore UTXO labels, and restore saved node configurations.

#### Scenario: Successful recovery with valid seed

- GIVEN the user selects "recover existing app" on the new app screen
- WHEN the user enters a valid BIP-39 seed phrase that matches an existing app image
- THEN the app recreates all wallets, signers, and vaults from the relay backup
- AND UTXO and address labels are restored
- AND saved Electrum node configurations are restored
- AND the app navigates to the home screen
- AND wallet sync is triggered automatically

#### Scenario: Invalid mnemonic entered

- GIVEN the user is on the seed recovery entry screen
- WHEN the user enters words that do not form a valid BIP-39 mnemonic
- THEN the app shows an error indicating the seed phrase is invalid
- AND recovery does not proceed

#### Scenario: Valid mnemonic with no relay image

- GIVEN the user enters a valid BIP-39 seed phrase
- WHEN no matching app image exists on the relay server
- THEN the app creates a fresh default wallet derived from the seed
- AND the user is placed on the home screen without any previously backed-up vaults or signers

#### Scenario: Recovery fails due to network unavailability

- GIVEN the device has no network connectivity
- WHEN the user attempts to recover using a seed phrase
- THEN the app displays a network error
- AND recovery does not proceed until connectivity is restored

---

### Requirement: Relay Sync After Recovery

After a successful seed phrase recovery, the app MUST immediately trigger a wallet
sync to refresh balances and transaction history from the configured Electrum node
using the recovered credentials.

#### Scenario: Wallet sync triggered post-recovery

- GIVEN the user has just completed seed phrase recovery
- WHEN the home screen loads
- THEN all recovered wallets and vaults begin syncing with the Electrum node
- AND confirmed balances and transaction history are displayed once sync completes

---

### Requirement: App Image Validation

The app MUST provide a mechanism for the user to verify that the current relay
server backup matches the local state (wallets, signers, vaults, labels, and
node configurations).

#### Scenario: Validation passes

- GIVEN all local wallets, signers, vaults, and labels match the relay backup
- WHEN the user initiates a server backup validation
- THEN the app confirms the backup is up to date

#### Scenario: Validation detects mismatch

- GIVEN the relay backup and local state are out of sync (e.g., a vault is missing)
- WHEN the user initiates a server backup validation
- THEN the app reports which category of data does not match
- AND the user is prompted to re-run the backup

---

### Requirement: BSMS Cloud Backup Auto-Trigger

When the user completes the seed backup confirmation flow on the view recovery key
screen, the app SHOULD automatically trigger a full server backup (wallets, signers,
and vaults) if an automatic server backup has not previously been enabled. Once
triggered successfully, automatic cloud backup MUST be enabled for subsequent
state changes.

#### Scenario: Auto-backup triggered on first recovery key confirmation

- GIVEN the user has not previously enabled automatic server backup
- WHEN the user completes seed phrase confirmation on the recovery key screen
- THEN the app initiates a server backup of all wallets, signers, and vaults
- AND on success, automatic server backup is enabled for future changes

#### Scenario: Auto-backup skipped when already enabled

- GIVEN automatic server backup is already active
- WHEN the user views the recovery key screen
- THEN no duplicate backup is triggered

---

### Requirement: Delete Server Backup

The app MUST allow the user to delete their relay server backup, removing all
encrypted wallet, signer, vault, and label data from the relay.

#### Scenario: Backup deleted successfully

- GIVEN the user has an existing relay server backup
- WHEN the user confirms deletion of the server backup
- THEN all data is removed from the relay
- AND the pending backup flag is cleared

#### Scenario: Deletion fails

- GIVEN the relay server is unreachable
- WHEN the user attempts to delete their server backup
- THEN the app records a failure
- AND the user is informed that deletion could not be completed

---

## Non-Goals

- This spec does not cover the health check flows for individual signing devices
  (hardware wallets); those are specified in `health-checks/spec.md`.
- This spec does not cover subscription-tier gating of backup features beyond what
  is already enforced by the server (all tiers may access seed backup; server backup
  is universally available).
- This spec does not cover the content or format of the BSMS output descriptor
  beyond the requirement that it encrypts vault descriptors; the BSMS standard
  itself is not specified here.
- This spec does not cover wallet-level individual backup flows for hardware signer
  seed words (e.g., backing up a Coldcard seed); those belong in
  `signing-devices/spec.md`.
- This spec does not cover the mechanism for sharing vault descriptors with
  collaborators during collaborative vault setup; that belongs in
  `collaborative-wallet/spec.md`.
- This spec does not specify the encryption algorithm or key derivation scheme used
  for relay or cloud backup; those are implementation details covered in the design
  document.
