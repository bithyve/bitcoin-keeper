# Collaborative-Wallet Specification

## Purpose

The collaborative-wallet domain covers the setup, coordination, and management of a 2-of-3 multi-signature vault shared between two or more independent users, each holding their own signing key. It owns the full coordination lifecycle: key exchange, relay-based session synchronization, vault finalization, and post-creation co-signer inspection.

## Requirements

### Requirement: Vault Scheme

The app MUST enforce a fixed 2-of-3 quorum for all collaborative vaults. The scheme MUST NOT be configurable by the user at creation time.

#### Scenario: Scheme displayed during setup

- GIVEN a user has navigated to the collaborative vault setup screen
- WHEN the screen is presented
- THEN the app MUST display that the vault requires 2 signatures out of 3 total keys
- AND three key slots MUST be shown

#### Scenario: Vault created with wrong number of keys

- GIVEN the coordinator's setup screen is open
- WHEN fewer than three key slots have been filled
- THEN the app MUST NOT allow vault finalization
- AND the incomplete key slots MUST remain visible as unfilled placeholders

---

### Requirement: Initiator Key Pre-population

When a user initiates a collaborative vault, the app MUST automatically populate the first key slot with the user's own mobile key. The user MUST NOT be required to manually add their own key.

#### Scenario: Opening setup screen as coordinator

- GIVEN a user who has a mobile key available opens the collaborative vault setup screen
- WHEN the screen first renders
- THEN key slot 1 MUST already be filled with the user's own mobile key
- AND slots 2 and 3 MUST show prompts to add co-signers

---

### Requirement: Coordinator Key Sharing

The coordinator MUST be able to share their own key descriptor and channel credentials with co-signers via QR code, NFC, or file export, so co-signers can join the coordination session.

#### Scenario: Share via QR code

- GIVEN the coordinator is on the collaborative vault setup screen
- WHEN the coordinator taps "Share Contact Details"
- THEN the app MUST display a QR code encoding the coordinator's key descriptor and channel credentials

#### Scenario: Share via NFC

- GIVEN the coordinator has opened the sharing screen
- WHEN the coordinator selects NFC
- THEN the app MUST activate NFC and transmit the coordinator's key bundle when another device taps

#### Scenario: Share via file

- GIVEN the coordinator has opened the sharing screen
- WHEN the coordinator selects file export
- THEN the app MUST export a file containing the coordinator's key bundle that can be transferred to co-signers out of band

---

### Requirement: Co-signer Key Addition

The coordinator MUST be able to add each co-signer's key to the session by scanning their QR code, receiving an NFC tap, or importing a file containing the co-signer's key bundle.

#### Scenario: Add co-signer via QR scan

- GIVEN the coordinator's setup screen has an unfilled key slot
- WHEN the coordinator taps the empty slot and selects "Scan QR"
- AND scans a valid co-signer key bundle
- THEN the scanned key MUST be added to the corresponding slot
- AND the slot MUST display the co-signer's key fingerprint and label

#### Scenario: Add co-signer via NFC tap

- GIVEN the coordinator's setup screen has an unfilled key slot
- WHEN the coordinator selects NFC and the co-signer's device taps
- THEN the received key bundle MUST be parsed and the co-signer's key added to the slot

#### Scenario: Add co-signer via file import

- GIVEN the coordinator's setup screen has an unfilled key slot
- WHEN the coordinator selects file import and opens a valid co-signer key bundle file
- THEN the key MUST be extracted and added to the slot

#### Scenario: Invalid or malformed QR scanned

- GIVEN the coordinator scans a QR code that is not a valid key bundle
- WHEN the scan completes
- THEN the app MUST display an error indicating the QR is invalid
- AND the key slot MUST remain unfilled

#### Scenario: Wrong network key scanned

- GIVEN the coordinator's app is configured for mainnet
- WHEN the coordinator scans a co-signer key bundle derived for testnet
- THEN the app MUST reject the key and display an error indicating the network mismatch
- AND the key slot MUST remain unfilled

#### Scenario: Duplicate co-signer scanned

- GIVEN a co-signer's key has already been added to the session
- WHEN the coordinator attempts to scan or import the same co-signer's bundle again
- THEN the app MUST display an error indicating the key is already present
- AND the duplicate key MUST NOT be added

---

### Requirement: Relay-Based Session Synchronization

The app MUST synchronize collaborative session state between participants using an encrypted relay channel hosted by the BitHyve relay server. Each participant's app MUST periodically fetch updates from the relay so that key contributions from remote co-signers are discovered automatically.

#### Scenario: Remote co-signer's key appears after relay sync

- GIVEN two participants have exchanged credentials and both have the app open
- WHEN the remote co-signer submits their key via the relay
- THEN the coordinator's app MUST detect the new key during its next sync cycle
- AND the corresponding slot MUST be updated to show the co-signer's key

#### Scenario: Sync while waiting for third co-signer

- GIVEN two of three keys have been collected
- WHEN the coordinator's app is waiting for the third key
- THEN the app MUST continue synchronizing in the background
- AND the session state MUST reflect which keys have been collected and which are pending

---

### Requirement: Duplicate Signer Prevention

The app MUST prevent the same signer key from being added to more than one slot in the same collaborative session, regardless of the method used to add it (QR, NFC, file, or relay sync).

#### Scenario: Same key contributed via relay and QR

- GIVEN a co-signer's key has already been received through the relay
- WHEN the coordinator also scans that co-signer's QR code
- THEN the app MUST detect the duplicate fingerprint and reject the second addition

---

### Requirement: Vault Finalization

Once all three co-signer keys have been collected, the app MUST automatically finalize the collaborative vault without requiring additional user action. The finalized vault MUST be immediately accessible to the coordinator.

#### Scenario: Third key added completes the vault

- GIVEN two keys are already in the session
- WHEN the third co-signer's key is received (via scan, NFC, file, or relay sync)
- THEN the app MUST construct the 2-of-3 vault from the three collected keys
- AND the app MUST present a success confirmation showing the vault scheme and details

#### Scenario: Vault generation fails

- GIVEN all three keys have been collected
- WHEN the vault construction encounters an error
- THEN the app MUST display an error message
- AND the session state MUST be preserved so the user can retry

---

### Requirement: Descriptor Sharing After Finalization

After the vault is finalized, the coordinator MUST be able to share the resulting vault descriptor with all participants so each can independently register their copy of the vault.

#### Scenario: Coordinator shares vault descriptor via relay

- GIVEN the collaborative vault has been finalized by the coordinator
- WHEN the relay channel is updated with the finalized descriptor
- THEN each co-signer who syncs the channel MUST receive the descriptor

---

### Requirement: Participant Vault Registration

A co-signer who receives a completed vault descriptor MUST be able to register their local copy of the collaborative vault using the shared descriptor, without having performed the initial coordination themselves.

#### Scenario: Second user registers vault from descriptor

- GIVEN a co-signer has received the vault descriptor out of band
- WHEN the co-signer imports or scans the descriptor
- THEN the app MUST register a local read-write copy of the vault linked to that co-signer's own key
- AND the vault MUST appear in the co-signer's vault list

---

### Requirement: Co-signer Details Inspection

After vault creation, any participant MUST be able to inspect the details of each co-signer's key contribution, including the key fingerprint, derivation path, and extended public key.

#### Scenario: View co-signer details

- GIVEN a collaborative vault has been created and is visible in the vault list
- WHEN a participant opens the co-signer details view for a specific key slot
- THEN the app MUST display that co-signer's key fingerprint, label, derivation path, and extended public key
- AND the information MUST be presented in a copyable or exportable form

#### Scenario: Co-signer key not yet contributed

- GIVEN the collaborative vault setup is in progress and a slot is unfilled
- WHEN a participant views the slot
- THEN the app MUST indicate that no key has been contributed to that slot yet
- AND the slot MUST NOT display any key material

---

### Requirement: Subscription Gating

Access to the collaborative vault creation flow MUST require at least the Hodler subscription tier. Users on the free (Pleb) tier MUST be shown an upgrade prompt when they attempt to create a collaborative vault.

#### Scenario: Free-tier user attempts collaborative vault

- GIVEN a user whose subscription is at the Pleb (free) tier
- WHEN the user navigates to the collaborative vault creation entry point
- THEN the app MUST display an upgrade prompt describing the required tier
- AND the setup screen MUST NOT be accessible until the tier requirement is met

---

### Requirement: Session Reset on Completion

Once the collaborative vault has been successfully created, the app MUST clear the in-progress coordination session so that residual key material and channel credentials from the setup are no longer held in active memory.

#### Scenario: Session cleared after vault creation

- GIVEN a collaborative vault has just been successfully created
- WHEN the success confirmation is dismissed
- THEN the coordination session data MUST be cleared
- AND the setup screen MUST no longer reflect the previous session's state if reopened

---

## Non-Goals

- This spec does not cover the general multi-sig vault creation flow for vaults where all keys belong to the same user (see the `vault` spec).
- This spec does not cover PSBT signing or transaction broadcasting for collaborative vaults (see the `send-and-receive` spec).
- This spec does not cover health checks on collaborative vault signers (see the `health-checks` spec).
- This spec does not cover vault migration or archiving of collaborative vaults (see the `vault` spec).
- This spec does not cover the relay server infrastructure, encryption algorithm selection, or key derivation internals.
- This spec does not cover vault descriptor import for recovery purposes outside of the collaborative setup flow (see the `backup-and-recovery` spec).
