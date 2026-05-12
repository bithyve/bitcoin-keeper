# Signing-Devices Specification

## Purpose

Signing Devices owns the complete lifecycle of cryptographic signing keys used in
Bitcoin Keeper: adding, labeling, inspecting, hiding, and removing keys of all
categories (hardware, software, and assisted). Every wallet and multi-key
transaction depends on at least one registered signing device.

Internal code may still use `POLICY_SERVER`, `ADVISOR_KEY`, or vault terminology
where the codebase requires it. User-facing copy must use Wallet and Server Key.

**Server Key trust model:**
- Server Key is independently generated (not derived from the Recovery Key).
- Server Key is securely stored server-side.
- Server Key is sent to the app only once on request.
- Server Key is not persisted locally after one-time delivery.
- Server Key is never a sole signer.
- Keeper cannot spend with Server Key alone.
- Server Key must only be used as one signer in a multi-key wallet setup.

---

## Requirements

### Requirement: Signer Categories

The app MUST classify every registered signer into exactly one category: HARDWARE (air-gapped or USB physical device with cold or warm storage), SOFTWARE (key material held in device memory or derived on-demand), or ASSISTED (remote co-signer managed by a third-party service). The category determines which management actions are available for a signer.

#### Scenario: Hardware signer listed under HARDWARE category

- GIVEN a user has registered a physical hardware wallet (e.g., Coldcard)
- WHEN the user opens the key management screen
- THEN the signer is listed under the HARDWARE category
- AND its storage type is shown as COLD

#### Scenario: Software signer listed under SOFTWARE category

- GIVEN a user has registered a mobile key or seed-words signer
- WHEN the user opens the key management screen
- THEN the signer is listed under the SOFTWARE category
- AND its storage type reflects HOT (mobile key) or WARM (seed-words)

---

### Requirement: Supported Hardware Signers

The app MUST support registering the following hardware signing devices, each via its native communication protocol:

| Signer | Protocol(s) |
|---|---|
| TAPSIGNER | NFC |
| SATOCHIP | NFC |
| COLDCARD | NFC, SD card / file |
| TREZOR | USB |
| LEDGER | USB |
| PASSPORT | QR (animated / static) |
| JADE | QR (animated / static) |
| KEYSTONE | QR (animated / static), file |
| BITBOX02 | USB |
| SEEDSIGNER | QR (animated / static) |
| SPECTER | QR (animated / static) |
| PORTAL | NFC |
| KRUX | QR / file |

The app MUST reject a hardware signer whose exported key material is signed for a different network (mainnet vs testnet) than the app's currently active network.

#### Scenario: Successful Coldcard registration via NFC

- GIVEN the app is in vault-addition or key-management mode
- WHEN the user taps a Coldcard to the device's NFC reader and it exports a valid key payload
- THEN the app registers the Coldcard as a COLD-storage HARDWARE signer
- AND the signer appears in the key management list with its master fingerprint and derivation path

#### Scenario: Successful Coldcard registration via file

- GIVEN the user has exported a Coldcard multisig config file to local storage
- WHEN the user selects the file import option and picks the config file
- THEN the app parses the file, registers the Coldcard signer, and confirms success

#### Scenario: TAPSIGNER registration via NFC

- GIVEN the user selects TAPSIGNER on the add-signer screen
- WHEN the user taps their TAPSIGNER to the NFC reader and enters the correct CVC
- THEN the app derives the xpub, registers the TAPSIGNER as a COLD-storage HARDWARE signer
- AND displays a success confirmation with the key fingerprint

#### Scenario: TAPSIGNER NFC — wrong CVC entered

- GIVEN the user is registering a TAPSIGNER
- WHEN the user enters an incorrect CVC
- THEN the app displays an error indicating the wrong PIN and does not register the signer
- AND the remaining attempt count is reflected if the device reports it

#### Scenario: TAPSIGNER rate-limited (locked)

- GIVEN the TAPSIGNER has been locked due to too many wrong CVC attempts
- WHEN the app detects the locked state during NFC interaction
- THEN the app navigates to the Unlock TAPSIGNER screen and instructs the user to tap again to begin the unlock process

#### Scenario: Hardware signer registered on wrong network

- GIVEN the app is configured for mainnet
- WHEN the user attempts to register a signer whose exported key is derived on testnet
- THEN the app rejects the signer and displays an "Incorrect Network" error

#### Scenario: PORTAL registration via NFC with a fresh card

- GIVEN the user selects PORTAL and the card has no seed yet
- WHEN the user taps the Portal card and the app detects the uninitialized state
- THEN the app prompts the user to generate a new seed on the Portal card before completing registration

---

### Requirement: Software Signers

The app MUST support three software signer types:

- **Mobile Key** — a hot signing key generated on and stored by the current device, used as a recovery fallback key.
- **Seed Key** — a BIP-39 mnemonic (12 or 24 words) entered by the user; the app derives the xpub from it without retaining the mnemonic.
- **External Key (MY_KEEPER / KEEPER)** — a key exported from another Bitcoin Keeper instance on a different device via QR code or a deep-link channel.

#### Scenario: Adding a Mobile Key

- GIVEN the user selects "Mobile Key" on the add-signer screen
- WHEN the user confirms the addition
- THEN the app generates a new hot key on-device, registers it as a HOT-storage SOFTWARE signer
- AND the signer appears in the key management list

#### Scenario: Adding a Seed Key

- GIVEN the user selects "Seed Key" on the add-signer screen
- WHEN the user enters a valid BIP-39 mnemonic (12 or 24 words) and confirms
- THEN the app derives the xpub from the mnemonic, registers the signer as a WARM-storage SOFTWARE signer
- AND the mnemonic is not persisted by the app after derivation

#### Scenario: Seed Key — invalid mnemonic

- GIVEN the user is entering a seed-words signer
- WHEN the user submits a phrase that is not a valid BIP-39 mnemonic (bad checksum or wrong word count)
- THEN the app displays a validation error and does not register the signer

#### Scenario: Adding an External Key from another Keeper instance

- GIVEN the coordinator device is on the add-signer screen and selects "External Key"
- WHEN the second device shows its xpub QR code and the coordinator scans it
- THEN the app registers the scanned key as an external KEEPER signer
- AND the signer appears with the second device's master fingerprint

---

### Requirement: Assisted Keys

The app MUST support `POLICY_SERVER` (Server Key) as an assisted signing key managed
by the BitHyve relay service. User-facing copy must say **Server Key**, not Policy
Server. Internal code may continue to use `POLICY_SERVER`.

The Server Key MUST validate transactions against a configurable signing policy before
co-signing. Use of a Server Key requires a multi-key wallet scheme with a minimum of
2-of-3 (two required signers, at least three total signers). No subscription gating.

The app MAY also register an `ADVISOR_KEY` provided by a third-party advisor
(Keeper Advisor / External Advisor) in an inheritance planning context. If not
currently implemented, mark as future/out of scope but preserve the product concept.

#### Scenario: Successful Server Key registration with 2FA

- GIVEN the user selects "Server Key" and chooses a signing policy (e.g., spending limit)
- WHEN the registration request succeeds and the app displays a TOTP QR code
- WHEN the user scans the QR with an authenticator app and enters the 6-digit TOTP to validate
- THEN the Server Key is registered and appears in the key management list with "WARM" storage

#### Scenario: Server Key registration with invalid TOTP

- GIVEN the user is completing Server Key registration
- WHEN the user enters an incorrect TOTP
- THEN the app displays an invalid OTP error and does not finalize the registration

#### Scenario: Server Key attempted with insufficient quorum

- GIVEN the user is configuring a wallet with fewer than 3 total keys
- WHEN the user tries to include a Server Key
- THEN the app displays an error indicating the Server Key requires at least a 2-of-3 scheme

---

### Requirement: Signer Registration Protocol Enforcement

Each hardware signer MUST only be registered via its supported protocol. The app MUST surface a clear error when the required hardware interface (NFC, USB, or camera) is unavailable on the user's device.

#### Scenario: NFC unavailable when registering NFC-only signer

- GIVEN the user's device does not support NFC
- WHEN the user attempts to register a TAPSIGNER, SATOCHIP, COLDCARD via NFC, or PORTAL
- THEN the app displays an "NFC not supported" error and does not proceed with the registration flow

#### Scenario: USB signing attempted on unsupported platform

- GIVEN the user is on a device that does not support USB OTG (or the required driver is unavailable)
- WHEN the user attempts to register a Trezor, Ledger, or BitBox02 via USB
- THEN the app surfaces an appropriate connection error without crashing

---

### Requirement: Other and Unknown Signers

The app MUST support an "Other Signer" (OTHER_SD) type for hardware wallets that can export an xpub but are not explicitly enumerated. The user MUST be able to manually enter the xpub, derivation path, and master fingerprint to register such a device.

The app MUST handle a signer discovered with an UNKNOWN type (e.g., imported from a vault descriptor or config file whose signer type cannot be determined) and MUST allow the user to assign it a known signer type after discovery.

#### Scenario: Adding an Other Signer via manual xpub entry

- GIVEN the user selects "Other Signer" on the add-signer screen
- WHEN the user enters a valid xpub, derivation path, and master fingerprint and confirms
- THEN the app registers the signer as an OTHER_SD HARDWARE signer
- AND it appears in the key management list

#### Scenario: Unknown signer resolved to a known type

- GIVEN a signer of type UNKNOWN exists in the key list (e.g., imported from a config file)
- WHEN the user taps the signer and selects "Identify Signer", then chooses the correct device type
- THEN the app updates the signer's type and display name to the selected known type

#### Scenario: Unknown signer encountered during NFC/QR scan

- GIVEN the app scans a QR or NFC payload from an unrecognised signer type
- WHEN the scan succeeds but the device type cannot be auto-detected
- THEN the app registers it as UNKNOWN and prompts the user to identify the signer type before completing wallet addition

---

## Acceptance Criteria

- User-facing copy uses Wallet and Server Key, not Vault or Policy Server.
- `POLICY_SERVER` remains internal only if needed.
- No subscription/tier gating remains.
- Server Key trust model is correct: independently generated, not derived from Recovery Key, never sole signer.
- Keeper's primary Recovery Key is always 12 words; external signer seed import (12 or 24 words) does not conflict.
- Advisor Key (`ADVISOR_KEY`) is handled according to current active advisor product.
- Manual Health Check is valid.
- Hardware signer lists include only currently supported devices.

---

### Requirement: Signer Labeling

A user MUST be able to assign a custom name and a text description to any registered signer. The updated name and description MUST persist and be reflected across all screens that display the signer.

#### Scenario: Renaming a signer

- GIVEN the user is on the signer's advance settings screen
- WHEN the user edits the signer name field and saves
- THEN the new name is displayed on the key management list and the vault signer list

#### Scenario: Adding a description to a signer

- GIVEN the user is on the signer's advance settings screen
- WHEN the user enters a description (e.g., a person's name or location note) and saves
- THEN the description appears as the signer's subtitle across the app

---

### Requirement: Signer Details and Activity History

The app MUST display a details screen for each registered signer showing: the
signer's name, type, master fingerprint, xpub, derivation path, storage category,
and a chronological list of health check events. The details screen MUST also
indicate which active wallets the signer is participating in.

Health check state for each signer should include:
- signer available
- signer unavailable
- health check due
- manual health check completed
- last checked time if shown

Manual Health Check is valid.

#### Scenario: Viewing signer details

- GIVEN a registered signer exists
- WHEN the user opens the signer's detail screen
- THEN the screen displays the master fingerprint, xpub (for the relevant script type), derivation path, storage type, and date added
- AND the associated wallet(s) are listed

#### Scenario: Viewing signer activity history

- GIVEN a signer has undergone several health checks
- WHEN the user opens the signer's detail screen and scrolls to the activity section
- THEN a chronological list of health check events is displayed, each showing the event type (addition, successful check, failed check, skipped, manual confirmation) and the date

#### Scenario: Signer with no wallet activity

- GIVEN a signer has been added but not yet linked to any wallet
- WHEN the user opens the signer's detail screen
- THEN the activity section displays an empty-state message indicating the signer is not yet linked to any wallet

---

### Requirement: Key Deletion

A signer that is not associated with any active (non-archived) wallet MUST be
permanently deletable after the user confirms the action with their passcode. A
signer that is only referenced by archived wallets MUST be archived rather than
permanently deleted, preserving audit history.

#### Scenario: Deleting an unused signer

- GIVEN the user has a signer that is not part of any active wallet
- WHEN the user selects the signer for deletion, confirms the passcode, and confirms the warning modal
- THEN the signer is permanently removed from the key management list

#### Scenario: Attempting to delete an active-wallet signer

- GIVEN the signer is currently a key in at least one active wallet
- WHEN the user attempts to delete it
- THEN the app lists the wallet(s) that use this signer and prevents deletion until the signer is removed from those wallets

#### Scenario: Deleting a signer only referenced by archived wallets

- GIVEN the signer is referenced only in archived (migrated) wallets
- WHEN the user initiates deletion and confirms with their passcode
- THEN the signer is archived (not permanently deleted) and no longer appears in the active key list

---

### Requirement: Key Hiding

A user MUST be able to hide any signer from the default key management view without
deleting it. Hidden signers MUST be accessible by explicitly choosing to show hidden
keys (gated by passcode). A hidden signer MUST still function in any wallet it
belongs to. No subscription gating applies to viewing hidden keys.

#### Scenario: Hiding a signer

- GIVEN the user opens a signer's advance settings
- WHEN the user selects "Hide Key" and confirms
- THEN the signer disappears from the default key management list
- AND a success toast confirms the signer was hidden

#### Scenario: Viewing hidden signers

- GIVEN one or more signers are hidden
- WHEN the user on the key management screen chooses to reveal all keys (with passcode verification)
- THEN hidden signers are displayed alongside visible ones

---

### Requirement: Advanced Settings for Hardware Signers

Each hardware signer SHOULD expose advanced options appropriate to its protocol. At minimum:

- TAPSIGNER and SATOCHIP: change CVC / PIN via NFC
- TAPSIGNER: unlock after rate-limit lockout via NFC
- COLDCARD and Passport: recover vault configuration from a config file or QR export
- Any signer: perform a health check in identification or signing mode
- Software keys (Mobile Key, Seed Key): back up the key's seed phrase

#### Scenario: Changing TAPSIGNER CVC

- GIVEN the user is on the TAPSIGNER's advance settings screen
- WHEN the user selects "Change PIN", enters the current CVC, sets a new CVC, confirms it, and taps the card via NFC
- THEN the card's CVC is updated and the app shows a success confirmation

#### Scenario: Changing SATOCHIP PIN

- GIVEN the user is on the SATOCHIP's advance settings screen
- WHEN the user selects "Change PIN", enters the current PIN, enters and confirms a new PIN, and taps the card via NFC
- THEN the card's PIN is updated and the app shows a success confirmation

#### Scenario: Passport config recovery

- GIVEN the user needs to recover a Passport vault configuration
- WHEN the user selects "Recover Config" on the advance settings screen and provides the config file or scans the QR
- THEN the app re-imports the vault configuration associated with that Passport

#### Scenario: Mobile Key seed backup

- GIVEN the user opens the advance settings for a Mobile Key
- WHEN the user selects "Back Up Key" and authenticates with their passcode
- THEN the app displays the seed words for the Mobile Key for the user to record
- AND instructs the user to verify the words in the correct order before marking the backup complete

---

### Requirement: Remote Key Sharing

The app MUST allow sharing a signer's public key descriptor with another device via QR code, NFC tap, or a deep-link (magic link). This enables the key to be used as a co-signer in a collaborative vault on a remote device without physically transferring the signing device.

#### Scenario: Sharing a signer via QR

- GIVEN the user is on the signer's detail screen or the remote sharing screen
- WHEN the user selects "Share via QR"
- THEN the app generates a QR code encoding the encrypted key descriptor
- AND the receiving device can scan it to add the key as a remote signer

#### Scenario: Sharing a signer via NFC

- GIVEN the user selects "Share via NFC"
- WHEN the user taps their device to the receiving device
- THEN the app transmits the encrypted key descriptor over NFC
- AND the receiving device registers the key as a remote signer

#### Scenario: Sharing a signer via deep link

- GIVEN the user selects "Share via Magic Link"
- WHEN the user sends the generated link (e.g., via a messaging app) to the co-signer
- THEN the co-signer's device opens Bitcoin Keeper via the deep link and the remote key descriptor is automatically ingested

---

### Requirement: Multi-Account and Multi-Script Xpub Support

Where a hardware signer exports xpubs for multiple script types (P2WSH, P2WPKH, P2TR, P2SH-P2WSH), the app MUST store each xpub keyed by its script type. The correct xpub MUST be used automatically when the signer is added to a vault of the corresponding script type.

#### Scenario: Signer used in a P2WSH vault

- GIVEN a signer has both a P2WSH and a P2TR xpub stored
- WHEN the signer is added to a native-segwit multisig (P2WSH) vault
- THEN the app uses the P2WSH-derived xpub for that vault key

#### Scenario: Signer with missing script-type xpub

- GIVEN a signer only has a P2WSH xpub registered
- WHEN the user attempts to add it to a Taproot (P2TR) vault
- THEN the app displays an error indicating the required key type is not available for this signer

---

### Requirement: Network Isolation

Signers registered on testnet MUST NOT be selectable for mainnet vaults, and vice versa. The app MUST filter the available signer list based on the currently active Bitcoin network.

#### Scenario: Testnet signer invisible on mainnet

- GIVEN the app is running on mainnet and a signer was registered on testnet
- WHEN the user opens the key management screen or the vault signer selection screen
- THEN the testnet signer does not appear in the list

---

## Non-Goals

- This spec does not cover the wallet creation flow that consumes registered signers; that is specified in `vault/spec.md`.
- This spec does not cover the health-check scheduling, action item notification generation, or the pending health-check modal; those are specified in `health-checks/spec.md`.
- This spec does not cover the PSBT signing flow (i.e., using a signer to sign a transaction); that is specified in `send-and-receive/spec.md`.
- This spec does not cover the Collaborative Wallet setup session or co-signer key exchange coordination; those are specified in `collaborative-wallet/spec.md`.
- This spec does not cover the Inheritance Key / Advisor Key flow in detail; that is specified in `inheritance/spec.md`.
- This spec does not cover the signing policy enforcement logic on the server side; only the app-side registration and policy configuration are in scope.
- This spec does not cover Whirlpool or coin-join key types.
