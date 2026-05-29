# Health-Checks Specification

## Purpose

Health Checks help users confirm that wallet signers, keys, and backup-related
controls remain available and usable. Manual Health Check is considered a valid
health check.

Internal enum names may remain if the code already uses them. UAI may remain
internal only. User-facing copy must use Wallet, Recovery Key, and Server Key.

**Internal terminology note:**
- `POLICY_SERVER` may remain as an internal enum/model name.
- `HEALTH_CHECK_SUCCESSFULL` and `HEALTH_CHECK_MANAUAL` are legacy enum typos.
  If these values are persisted, used in analytics, or expected by backend APIs,
  keep internally and document as legacy. If safe to rename, correct to
  `HEALTH_CHECK_SUCCESSFUL` and `HEALTH_CHECK_MANUAL`.

---

## Requirements

### Requirement: Health Check Reminder Cadence

The app MUST evaluate whether each signing device requires a health check on every
login and after every wallet sync. A signing device MUST be considered overdue when
it has not been verified within 180 days (production). A health-check action item
of type `SIGNING_DEVICES_HEALTH_CHECK` MUST be added to the internal action item
stack for each overdue signer that does not already have an active item. If a
signer's last check falls within the 180-day window, any existing health-check
action item for that signer MUST be dismissed automatically.

#### Scenario: Signer becomes overdue at login

- GIVEN a signing device whose last health check was more than 180 days ago
- WHEN the user authenticates and the app evaluates the action item stack
- THEN the app MUST add a pending health-check action item for that signer
- AND the action item MUST identify the specific signer by name in its body text

#### Scenario: Signer recently verified — no reminder generated

- GIVEN a signing device whose last health check was within the past 180 days
- WHEN the app evaluates the action item stack
- THEN the app MUST NOT add a duplicate health-check action item for that signer
- AND any pre-existing overdue action item for that signer MUST be dismissed

#### Scenario: Hidden signer excluded from reminder

- GIVEN a signing device that has been marked as hidden
- WHEN the app evaluates the action item stack
- THEN the app MUST NOT generate a health-check action item for that signer

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
- THEN the app MUST record a `HEALTH_CHECK_SUCCESSFULL` entry (legacy enum) with the current timestamp
- AND the signer's last health check timestamp MUST be updated to now
- AND any pending health-check action item for that signer MUST be dismissed

#### Scenario: Hardware signer fails verification

- GIVEN a hardware signer being health-checked via any method
- WHEN the response from the device does not match the expected fingerprint or is rejected by the app
- THEN the app MUST record a `HEALTH_CHECK_FAILED` entry with the current timestamp
- AND the pending health-check action item MUST remain active

#### Scenario: Signing a live transaction counts as health check

- GIVEN a multi-sig vault with a hardware signer
- WHEN the user signs a real transaction using that hardware signer
- THEN the app MUST record a `HEALTH_CHECK_SIGNING` entry for that signer
- AND the signer's last health check timestamp MUST be updated

---

### Requirement: Health Check Status History

Each signing device MUST maintain a chronological history of all health check events.
Every event MUST record the event type and the date and time it occurred. The
supported event types are:

| Status | Meaning |
|---|---|
| `HEALTH_CHECK_SUCCESSFULL` | Device was successfully verified by the app (legacy enum — keep if persisted) |
| `HEALTH_CHECK_FAILED` | Device verification failed |
| `HEALTH_CHECK_SKIPPED` | User explicitly skipped the check |
| `HEALTH_CHECK_MANAUAL` | User manually confirmed the device is accessible (legacy enum — keep if persisted) |
| `HEALTH_CHECK_SIGNING` | Key was used to co-sign a transaction |
| `HEALTH_CHECK_REGISTRATION` | Key was used during wallet registration |
| `HEALTH_CHECK_VERIFICATION` | Key was used for wallet address verification |

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

### Requirement: Recovery Key Health Check

The app MUST independently track whether the user has recently confirmed their
Recovery Key. The confirmation threshold is 180 days (production). If the user
has never confirmed their Recovery Key, or if the last confirmed backup is older
than 180 days, the app MUST add a `RECOVERY_PHRASE_HEALTH_CHECK` internal action
item to the action item stack on login.

User-facing copy must say **Recovery Key Health Check**, not Recovery Phrase Health Check.

The Recovery Key health check is satisfied when the user confirms their 12-word
Recovery Key by re-entering selected words in correct order
(`BackupAction.SEED_BACKUP_CONFIRMED`). The app MUST dismiss the action item
automatically once confirmation is recorded.

#### Scenario: Recovery Key never confirmed

- GIVEN a user who has created the app but never confirmed their Recovery Key backup
- WHEN the user authenticates
- THEN the app MUST add a Recovery Key health check action item to the internal stack

#### Scenario: Recovery Key confirmed within threshold

- GIVEN a user who last confirmed their Recovery Key within the past 180 days
- WHEN the app evaluates the action item stack on login
- THEN the app MUST NOT add a Recovery Key health check action item
- AND any existing Recovery Key health check action item MUST be dismissed

#### Scenario: Recovery Key re-confirmation flow

- GIVEN a pending Recovery Key health check action item
- WHEN the user taps the action item and navigates to the backup history screen
- THEN the app MUST present the user with the option to re-confirm their Recovery Key
- AND on successful word entry, the app MUST record a `SEED_BACKUP_CONFIRMED` event and dismiss the action item

#### Scenario: Backup confirmation skipped

- GIVEN the user is presented with the Recovery Key re-confirmation flow
- WHEN the user explicitly skips confirmation
- THEN the app MUST record a `SEED_BACKUP_CONFIRMATION_SKIPPED` event
- AND the Recovery Key health check action item MUST remain active

---

### Requirement: Health Check Skip

The user MAY skip a signing device health check. Skipping MUST be recorded as a
`HEALTH_CHECK_SKIPPED` event in the signer's history. The app MUST present a
confirmation step before recording a skip so the user understands the implications.
Skipping a health check MUST NOT dismiss the pending action item — the action item
remains until the signer is actually verified.

#### Scenario: User skips a health check

- GIVEN a signer with an overdue health check
- WHEN the user opens the health check flow and selects the skip option
- THEN the app MUST display a confirmation modal explaining the implication of skipping
- AND when the user confirms, the app MUST record a `HEALTH_CHECK_SKIPPED` entry with the current timestamp
- AND the pending health-check action item MUST remain active

#### Scenario: User cancels the skip

- GIVEN the app is showing the skip-confirmation modal
- WHEN the user cancels without confirming
- THEN the app MUST return to the health check flow without recording any event

---

### Requirement: Pending Health Check Modal at Wallet Opening

When a user opens a multi-key wallet, the app MUST evaluate whether any of that
wallet's signing keys have health checks that are overdue. If one or more keys are
overdue, the app MUST surface a modal listing those specific keys and prompting the
user to take action.

The same check MUST be performed when a user initiates a send from a wallet with
overdue signers.

#### Scenario: Wallet opened with overdue signers

- GIVEN a multi-key wallet with at least one signing key whose health check is overdue
- WHEN the user opens the wallet detail screen
- THEN the app MUST display the pending health check modal listing all overdue keys by name
- AND the modal MUST provide a clear call-to-action to proceed to the signing device detail screen

#### Scenario: Wallet opened with all signers current

- GIVEN a multi-key wallet where every signing key's health check is current
- WHEN the user opens the wallet detail screen
- THEN the app MUST NOT display the pending health check modal

#### Scenario: Send initiated with overdue signers

- GIVEN a wallet with one or more signing keys whose health check is overdue
- WHEN the user initiates a send from that wallet
- THEN the app MUST display the pending health check modal before allowing the user to proceed
- AND the user MUST be able to continue with the send despite overdue checks (after acknowledging)

---

### Requirement: Health Check Action Item Indicator

The app MUST surface a visual indicator (dot or badge) on any signing device that
has an overdue health check. This indicator MUST be visible on the key list in the
signing devices screen and on the health check action button within the signer
detail screen.

For the Recovery Key, the indicator MUST appear on the Recovery Key management
entry point in the app's settings area.

#### Scenario: Overdue indicator visible on key list

- GIVEN a signing device with an active health-check action item
- WHEN the user views the list of signing keys
- THEN the app MUST show a visual indicator (dot) on that specific key's card

#### Scenario: Indicator cleared after completion

- GIVEN a signing device with an active health-check action item and its visual indicator showing
- WHEN the user successfully completes the health check
- THEN the indicator MUST disappear from the key card
- AND the action item MUST be removed from the active stack

---

### Requirement: Server Key Health Check

For signing devices of the assisted (Server Key) type, the health check MUST be
performed by verifying connectivity and authorization with the remote signing server.
Actual verification occurs when the Server Key successfully participates in signing
or when the server confirms the signing key is reachable and the policy configuration
is current.

User-facing copy must say **Server Key**, not Policy Server.
Internal code may still use `POLICY_SERVER` where required.

#### Scenario: Server Key verified via signing

- GIVEN a wallet that includes a Server Key signer
- WHEN a transaction is co-signed by the Server Key
- THEN the app MUST record a health check event for the Server Key signer
- AND update its last health check timestamp

---

### Requirement: Implicit Health Check via Registration and Verification

When a signer is used to register a wallet or verify a wallet address, the app MUST
treat this as an implicit health check event. The event MUST be recorded as
`HEALTH_CHECK_REGISTRATION` or `HEALTH_CHECK_VERIFICATION` respectively, and the
signer's last health check timestamp MUST be updated, resetting the 180-day reminder
window.

#### Scenario: Wallet registration resets health check

- GIVEN a signing device that is used to register a wallet on that device
- WHEN registration completes successfully
- THEN the app MUST record a `HEALTH_CHECK_REGISTRATION` event for that signer
- AND the health check reminder window MUST be reset

---

## Health Check States

The following health check states MUST be handled:
- **due** — within the reminder window but approaching threshold
- **overdue** — threshold exceeded
- **completed** — health check successfully performed
- **failed** — health check attempt failed
- **signer unavailable** — device cannot be reached
- **manual confirmation completed** — user manually confirmed accessibility
- **reminder pending** — action item is active, awaiting user action

## Health Check Triggers

Health checks may be triggered by:
- Periodic reminder (180-day cadence)
- Opening the relevant wallet
- Before a risky transaction, if applicable
- After signer replacement
- After wallet scheme change
- After a backup/recovery event, if applicable

---

## Acceptance Criteria

- Manual Health Check is valid.
- User-facing copy uses Wallet, not Vault.
- User-facing copy uses Recovery Key, not Recovery Phrase.
- Server Key is used in user-facing copy; `POLICY_SERVER` remains internal only.
- UAI / action item internal names do not appear in user-facing copy.
- Health Check states are clearly specified.
- Legacy enum typos (`HEALTH_CHECK_SUCCESSFULL`, `HEALTH_CHECK_MANAUAL`) are
  preserved if persisted or API-sensitive; documented as legacy.

---

## Non-Goals

- This spec does not cover the mechanism by which push notifications are dispatched for health check reminders — that belongs to the `notifications` domain.
- This spec does not cover the specific NFC, QR, or Bluetooth communication protocol used to interact with any hardware signer — those details belong to the `signing-devices` domain.
- This spec does not cover the creation, modification, or deletion of signing devices — that lifecycle belongs to the `signing-devices` domain.
- This spec does not cover the Recovery Key backup creation or cloud backup workflows — those belong to `backup-and-recovery`; only the periodic re-confirmation health check aspect is covered here.
- This spec does not define the internal action item stack ordering or rendering logic — that belongs to the `notifications` domain.
- This spec does not cover health checks for USDT wallets or single-sig wallets; it applies only to signing devices used in multi-key wallets and the primary Recovery Key.
