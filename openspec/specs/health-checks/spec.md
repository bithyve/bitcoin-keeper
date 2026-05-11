# Health-Checks Specification

## Purpose

The health-checks domain governs the periodic verification that each signing key is still accessible and controlled by its owner. It owns the health check reminder cadence, the methods by which a check can be completed, the per-signer status history, the analogous recovery-phrase confirmation flow, and the consolidated pending-check modal that surfaces overdue items when the user opens a vault or initiates a send.

---

## Requirements

### Requirement: Health Check Reminder Cadence

The app MUST evaluate whether each signing device requires a health check on every login and after every wallet sync. A signing device MUST be considered overdue when it has not been verified within 180 days (production). A UAI of type `SIGNING_DEVICES_HEALTH_CHECK` MUST be added to the UAI stack for each overdue signer that does not already have an active UAI. If a signer's last check falls within the 180-day window, any existing health-check UAI for that signer MUST be dismissed automatically.

#### Scenario: Signer becomes overdue at login

- GIVEN a signing device whose last health check was more than 180 days ago
- WHEN the user authenticates and the app evaluates the UAI stack
- THEN the app MUST add a pending health-check UAI for that signer to the UAI stack
- AND the UAI MUST identify the specific signer by name in its body text

#### Scenario: Signer recently verified — no UAI generated

- GIVEN a signing device whose last health check was within the past 180 days
- WHEN the app evaluates the UAI stack
- THEN the app MUST NOT add a duplicate health-check UAI for that signer
- AND any pre-existing overdue UAI for that signer MUST be dismissed

#### Scenario: Hidden signer excluded from reminder

- GIVEN a signing device that has been marked as hidden
- WHEN the app evaluates the UAI stack
- THEN the app MUST NOT generate a health-check UAI for that signer

---

### Requirement: Health Check Methods

A health check MAY be completed by any of the following methods:
- **Signing a test transaction (PSBT)** — the user provides a partial signature using the device, which the app verifies.
- **QR scan** — the user scans the device's output QR code.
- **NFC tap** — the user taps the NFC-capable device to the phone.
- **Bluetooth or USB connection** — the user connects a compatible hardware device.
- **Manual confirmation** — the user explicitly marks the device as verified without device interaction.
- **Signing an actual transaction** — participating in a real transaction signing is counted as a successful check.
- **Vault registration or address verification** — registering the signer in a vault or verifying a vault address via the device also resets the health check timer.

The method used MUST be recorded as part of the signer's health check history.

#### Scenario: Hardware signer verified via QR

- GIVEN a signing device that uses QR-based communication (e.g., Coldcard, SeedSigner, Keystone)
- WHEN the user opens the device's health check flow and the device produces a valid QR response
- THEN the app MUST record a `HEALTH_CHECK_SUCCESSFULL` entry with the current timestamp
- AND the signer's last health check timestamp MUST be updated to now
- AND any pending health-check UAI for that signer MUST be dismissed

#### Scenario: Hardware signer fails verification

- GIVEN a hardware signer being health-checked via any method
- WHEN the response from the device does not match the expected fingerprint or is rejected by the app
- THEN the app MUST record a `HEALTH_CHECK_FAILED` entry with the current timestamp
- AND the pending health-check UAI MUST remain active

#### Scenario: Signing a live transaction counts as health check

- GIVEN a multi-sig vault with a hardware signer
- WHEN the user signs a real transaction using that hardware signer
- THEN the app MUST record a `HEALTH_CHECK_SIGNING` entry for that signer
- AND the signer's last health check timestamp MUST be updated

---

### Requirement: Health Check Status History

Each signing device MUST maintain a chronological history of all health check events. Every event MUST record the event type and the date and time it occurred. The supported event types are:

| Status | Meaning |
|---|---|
| `HEALTH_CHECK_SUCCESSFULL` | Device was successfully verified by the app |
| `HEALTH_CHECK_FAILED` | Device verification failed |
| `HEALTH_CHECK_SKIPPED` | User explicitly skipped the check |
| `HEALTH_CHECK_MANAUAL` | User manually confirmed the device is accessible |
| `HEALTH_CHECK_SIGNING` | Key was used to co-sign a transaction |
| `HEALTH_CHECK_REGISTRATION` | Key was used during vault registration |
| `HEALTH_CHECK_VERIFICATION` | Key was used for vault address verification |

The app MUST display this history in chronological order on the signer detail screen with human-readable date labels (e.g., "Today at 10:30AM", "Last Monday at 3:00PM").

#### Scenario: Viewing health check history

- GIVEN a signing device that has had multiple health check events
- WHEN the user navigates to the signer detail screen
- THEN the app MUST display a timeline list of all past health check events
- AND each entry MUST show the event type in plain language and the date/time it occurred

#### Scenario: Newly added signer has no history

- GIVEN a signing device that was just registered for the first time
- WHEN the user views its detail screen
- THEN the app MUST show a `HEALTH_CHECK_REGISTRATION` (signer added) entry as its first history item

---

### Requirement: Recovery Phrase Health Check

The app MUST independently track whether the user has recently confirmed their recovery phrase. The confirmation threshold is 180 days (production). If the user has never confirmed their recovery phrase, or if the last confirmed backup is older than 180 days, the app MUST add a `RECOVERY_PHRASE_HEALTH_CHECK` UAI to the UAI stack on login.

The recovery phrase health check is satisfied when the user confirms their seed words by re-entering selected words in correct order (BackupAction.SEED_BACKUP_CONFIRMED). The app MUST dismiss the UAI automatically once confirmation is recorded.

#### Scenario: Recovery phrase never confirmed

- GIVEN a user who has created the app but never confirmed their recovery phrase backup
- WHEN the user authenticates
- THEN the app MUST add a recovery phrase health check UAI to the UAI stack

#### Scenario: Recovery phrase confirmed within threshold

- GIVEN a user who last confirmed their recovery phrase within the past 180 days
- WHEN the app evaluates the UAI stack on login
- THEN the app MUST NOT add a recovery phrase health check UAI
- AND any existing recovery phrase health check UAI MUST be dismissed

#### Scenario: Recovery phrase re-confirmation flow

- GIVEN a pending recovery phrase health check UAI
- WHEN the user taps the UAI and navigates to the backup history screen
- THEN the app MUST present the user with the option to re-confirm their seed phrase
- AND on successful word entry, the app MUST record a `SEED_BACKUP_CONFIRMED` event and dismiss the UAI

#### Scenario: Backup confirmation skipped

- GIVEN the user is presented with the recovery phrase re-confirmation flow
- WHEN the user explicitly skips confirmation
- THEN the app MUST record a `SEED_BACKUP_CONFIRMATION_SKIPPED` event
- AND the recovery phrase health check UAI MUST remain active

---

### Requirement: Health Check Skip

The user MAY skip a signing device health check. Skipping MUST be recorded as a `HEALTH_CHECK_SKIPPED` event in the signer's history. The app MUST present a confirmation step before recording a skip so the user understands the implications. Skipping a health check MUST NOT dismiss the pending UAI — the UAI remains until the signer is actually verified.

#### Scenario: User skips a health check

- GIVEN a signer with an overdue health check
- WHEN the user opens the health check flow and selects the skip option
- THEN the app MUST display a confirmation modal explaining the implication of skipping
- AND when the user confirms, the app MUST record a `HEALTH_CHECK_SKIPPED` entry with the current timestamp
- AND the pending health-check UAI MUST remain active

#### Scenario: User cancels the skip

- GIVEN the app is showing the skip-confirmation modal
- WHEN the user cancels without confirming
- THEN the app MUST return to the health check flow without recording any event

---

### Requirement: Pending Health Check Modal at Vault Opening

When a user opens a multi-sig vault, the app MUST evaluate whether any of that vault's signing keys have health checks that are overdue (i.e., the key's last health check exceeds the configured threshold). If one or more keys are overdue, the app MUST surface a modal listing those specific keys and prompting the user to take action.

The same check MUST be performed when a user initiates a send from a vault with overdue signers.

#### Scenario: Vault opened with overdue signers

- GIVEN a multi-sig vault with at least one signing key whose health check is overdue
- WHEN the user opens the vault detail screen
- THEN the app MUST display the pending health check modal listing all overdue keys by name
- AND the modal MUST provide a clear call-to-action to proceed to the signing device detail screen

#### Scenario: Vault opened with all signers current

- GIVEN a multi-sig vault where every signing key's health check is current
- WHEN the user opens the vault detail screen
- THEN the app MUST NOT display the pending health check modal

#### Scenario: Send initiated with overdue signers

- GIVEN a vault with one or more signing keys whose health check is overdue
- WHEN the user initiates a send from that vault
- THEN the app MUST display the pending health check modal before allowing the user to proceed
- AND the user MUST be able to continue with the send despite overdue checks (after acknowledging)

---

### Requirement: Health Check UAI Indicator

The app MUST surface a visual indicator (dot or badge) on any signing device that has an overdue health check. This indicator MUST be visible on the key list in the signing devices screen and on the health check action button within the signer detail screen.

For the recovery phrase, the indicator MUST appear on the recovery phrase management entry point in the app's settings area.

#### Scenario: Overdue indicator visible on key list

- GIVEN a signing device with an active health-check UAI
- WHEN the user views the list of signing keys
- THEN the app MUST show a visual indicator (dot) on that specific key's card

#### Scenario: Indicator cleared after completion

- GIVEN a signing device with an active health-check UAI and its visual indicator showing
- WHEN the user successfully completes the health check
- THEN the indicator MUST disappear from the key card
- AND the UAI MUST be removed from the active stack

---

### Requirement: Policy Server Health Check

For signing devices of the assisted (server key / policy server) type, the health check MUST be performed by verifying connectivity and authorization with the remote signing server. Actual verification occurs when the server key successfully participates in signing or when the policy server confirms the signing key is reachable and the policy configuration is current.

#### Scenario: Policy server verified via signing

- GIVEN a vault that includes a policy server (server key) signer
- WHEN a transaction is co-signed by the policy server
- THEN the app MUST record a health check event for the server key signer
- AND update its last health check timestamp

---

### Requirement: Implicit Health Check via Registration and Verification

When a signer is used to register a vault or verify a vault address, the app MUST treat this as an implicit health check event. The event MUST be recorded as `HEALTH_CHECK_REGISTRATION` or `HEALTH_CHECK_VERIFICATION` respectively, and the signer's last health check timestamp MUST be updated, resetting the 180-day reminder window.

#### Scenario: Vault registration resets health check

- GIVEN a signing device that is used to register a vault on that device
- WHEN registration completes successfully
- THEN the app MUST record a `HEALTH_CHECK_REGISTRATION` event for that signer
- AND the health check reminder window MUST be reset

---

## Non-Goals

- This spec does not cover the mechanism by which push notifications are dispatched for health check reminders — that belongs to the `notifications` domain.
- This spec does not cover the specific NFC, QR, or Bluetooth communication protocol used to interact with any hardware signer — those details belong to the `signing-devices` domain.
- This spec does not cover the creation, modification, or deletion of signing devices — that lifecycle belongs to the `signing-devices` domain.
- This spec does not cover the seed phrase backup creation or cloud backup workflows — those belong to `backup-and-recovery`; only the periodic re-confirmation health check aspect is covered here.
- This spec does not define the UAI stack ordering or rendering logic — that belongs to the `notifications` domain.
- This spec does not cover health checks for USDT wallets or single-sig wallets; it applies only to signing devices used in multi-sig vaults and the primary recovery phrase.
