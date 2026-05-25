# Backup And Recovery Specification

## Purpose

Backup and Recovery owns flows that help users preserve and restore access to Keeper
using the 12-word Recovery Key, Cloud Backup, and wallet configuration files. These
flows reduce the risk of losing access, but do not guarantee recovery if the user
loses required keys, wallet configuration files, cloud access, hardware signers, or
the Recovery Key.

Internal implementation may still use terms such as `vault`, descriptor, BSMS, or
mnemonic where the codebase requires them. User-facing copy must use Wallet and
Recovery Key.

---

## Requirements

### Requirement: Recovery Key Display

The app MUST present the full 12-word Recovery Key to the user one word at a time,
with each word initially obscured. The user MUST be able to tap any word to reveal
it individually.

#### Scenario: User views Recovery Key

- GIVEN the user has authenticated and navigated to the Recovery Key backup screen
- WHEN the Recovery Key list is displayed
- THEN each word appears obscured by default
- AND tapping a word reveals its plaintext content
- AND tapping the same word again re-obscures it

#### Scenario: Recovery Key hidden when navigating away

- GIVEN the user has revealed one or more Recovery Key words
- WHEN the user navigates away from the Recovery Key backup screen
- THEN all previously revealed words return to their obscured state upon re-entry

---

### Requirement: Recovery Key Confirmation

The app MUST verify that the user has recorded their Recovery Key by prompting them
to correctly enter one randomly-selected word from the 12-word phrase before marking
the backup as confirmed.

#### Scenario: Correct word entered

- GIVEN the user has viewed their Recovery Key
- WHEN the app prompts for a specific Recovery Key word and the user enters it correctly
- THEN the backup status is updated to confirmed
- AND the confirmation is recorded in backup history

#### Scenario: Incorrect word entered

- GIVEN the app has prompted for a specific Recovery Key word
- WHEN the user enters an incorrect or misspelled word
- THEN the app displays an error message
- AND the backup is NOT marked as confirmed

#### Scenario: Confirmation skipped

- GIVEN the app has prompted for Recovery Key word confirmation
- WHEN the user declines to confirm
- THEN the skip action is recorded in backup history
- AND the backup remains in an unconfirmed state

---

### Requirement: Recovery Key Export

A logged-in user MUST be able to view their Recovery Key at any time from the app
settings or backup management screen, after passing authentication.

#### Scenario: Viewing Recovery Key after authentication

- GIVEN the user is authenticated
- WHEN the user navigates to the export or view Recovery Key screen
- THEN the full 12-word Recovery Key is displayed in obscured form
- AND each word can be individually revealed by tapping

#### Scenario: Unauthenticated access blocked

- GIVEN the user has not yet authenticated in the current session
- WHEN the user attempts to access the Recovery Key export screen
- THEN the app requires authentication before displaying the Recovery Key

---

### Requirement: Backup History

The app MUST maintain a chronological history of all backup-related events
(Recovery Key created, Recovery Key confirmed, Recovery Key confirmation skipped)
and display it to the user on the backup management screen.

#### Scenario: History displayed after Recovery Key backup created

- GIVEN the user has completed the Recovery Key backup flow
- WHEN the user opens the backup history screen
- THEN the history list shows a "Recovery Key backup created" entry with a timestamp

#### Scenario: History updated after confirmation

- GIVEN the user has confirmed their Recovery Key
- WHEN the backup history screen is opened
- THEN the list shows a "Recovery Key confirmed" entry with the confirmation timestamp

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

#### Scenario: Server backup failure action item generated

- GIVEN a relay server backup has failed
- WHEN the home screen is displayed
- THEN an actionable reminder appears indicating the backup failure
- AND the reminder is dismissed once the backup succeeds

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

### Requirement: Cloud Backup (BSMS / Wallet Configuration File)

The app MUST support encrypting and uploading wallet configuration files (output
descriptors in BSMS format) to iCloud (iOS) or Google Drive (Android).

**Cloud Backup saves wallet configuration files. It does not replace your Recovery Key.**

Wallet configuration files help recreate wallet structure but do not contain
private keys.

Canary wallets MUST be excluded from cloud backup. A backup MUST only proceed when
the user has previously set an encryption password and has at least one eligible wallet.

#### Scenario: Successful cloud backup

- GIVEN the user has set a cloud backup password and has at least one non-canary wallet
- WHEN the user initiates a cloud backup
- THEN the app uploads the encrypted wallet configuration files to the platform cloud service
- AND a success entry is recorded in the cloud backup history
- AND the pending cloud backup flag is cleared

#### Scenario: Cloud backup fails — no eligible wallets

- GIVEN the user has no active non-canary wallets
- WHEN the user attempts a cloud backup
- THEN the app records a failure in cloud backup history with a descriptive reason
- AND the user is informed that no wallets are available to back up

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

### Requirement: Recovery Key Recovery

The app MUST allow a user to restore their complete app state by entering their
valid 12-word Recovery Key. Upon successful entry, the app MUST re-derive all
wallets, re-import all signers and wallet configurations from the relay server,
restore UTXO labels, and restore saved node configurations.

#### Scenario: Successful recovery with valid Recovery Key

- GIVEN the user selects "recover existing app" on the new app screen
- WHEN the user enters a valid 12-word Recovery Key that matches an existing app image
- THEN the app recreates all wallets and signers from the relay backup
- AND UTXO and address labels are restored
- AND saved Electrum node configurations are restored
- AND the app navigates to the home screen
- AND wallet sync is triggered automatically

#### Scenario: Invalid Recovery Key entered

- GIVEN the user is on the Recovery Key entry screen
- WHEN the user enters words that do not form a valid 12-word Recovery Key
- THEN the app shows an error indicating the Recovery Key is invalid
- AND recovery does not proceed

#### Scenario: Valid Recovery Key with no relay image

- GIVEN the user enters a valid 12-word Recovery Key
- WHEN no matching app image exists on the relay server
- THEN the app creates a fresh default wallet derived from the Recovery Key
- AND the user is placed on the home screen without any previously backed-up wallets or signers

#### Scenario: Recovery fails due to network unavailability

- GIVEN the device has no network connectivity
- WHEN the user attempts to recover using a Recovery Key
- THEN the app displays a network error
- AND recovery does not proceed until connectivity is restored

---

### Requirement: Relay Sync After Recovery

After a successful Recovery Key recovery, the app MUST immediately trigger a wallet
sync to refresh balances and transaction history from the configured Electrum node
using the recovered credentials.

#### Scenario: Wallet sync triggered post-recovery

- GIVEN the user has just completed Recovery Key recovery
- WHEN the home screen loads
- THEN all recovered wallets begin syncing with the Electrum node
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

### Requirement: Cloud Backup Auto-Trigger

When the user completes the Recovery Key confirmation flow on the view Recovery Key
screen, the app SHOULD automatically trigger a full server backup (wallets and signers)
if an automatic server backup has not previously been enabled. Once triggered
successfully, automatic cloud backup MUST be enabled for subsequent state changes.

#### Scenario: Auto-backup triggered on first Recovery Key confirmation

- GIVEN the user has not previously enabled automatic server backup
- WHEN the user completes Recovery Key confirmation on the Recovery Key screen
- THEN the app initiates a server backup of all wallets and signers
- AND on success, automatic server backup is enabled for future changes

#### Scenario: Auto-backup skipped when already enabled

- GIVEN automatic server backup is already active
- WHEN the user views the Recovery Key screen
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

## States

The following states MUST be tracked and reflected in the UI where applicable:

### Recovery Key States
- Recovery Key not shown
- Recovery Key shown but not confirmed
- Recovery Key confirmed
- Recovery Key backup skipped/deferred

### Cloud Backup States
- Cloud Backup not configured
- Cloud Backup in progress
- Cloud Backup complete
- Cloud Backup failed

### Wallet Configuration File States
- Wallet Configuration File exported
- Wallet Configuration File export failed

### Reminder Behavior

When a wallet has been created but the Recovery Key has not been backed up (status
is not `confirmed`), the app MUST display a non-blocking reminder to the user.
Reminder buttons must be short:
- **Back Up Now** — navigates to the Recovery Key backup flow
- **Skip** — defers the reminder for the current session

---

## Acceptance Criteria

- Recovery Key is exactly 12 words.
- User-facing copy uses Recovery Key, not seed phrase/recovery phrase/mnemonic.
- Cloud Backup is clearly separated from Recovery Key backup.
- Wallet Configuration File / BSMS / descriptor backup is clearly scoped and does not imply private key storage.
- No backup copy guarantees recovery.
- No subscription/tier gating remains.
- User-facing copy uses Wallet, not Vault.
- Recovery Key backup and confirmation states are tracked separately.

---

## Non-Goals

- This spec does not cover the health check flows for individual signing devices
  (hardware wallets); those are specified in `health-checks/spec.md`.
- This spec does not cover the content or format of the BSMS output descriptor
  beyond the requirement that it encrypts wallet configuration files; the BSMS
  standard itself is not specified here.
- This spec does not cover wallet-level individual backup flows for hardware signer
  seed words (e.g., backing up a Coldcard seed); those belong in
  `signing-devices/spec.md`.
- This spec does not cover the mechanism for sharing wallet configuration files with
  collaborators during collaborative wallet setup; that belongs in
  `collaborative-wallet/spec.md`.
- This spec does not specify the encryption algorithm or key derivation scheme used
  for relay or cloud backup; those are implementation details covered in the design
  document.
