# Authentication Specification

## Purpose

Authentication owns all flows that gate access to the app: first-launch PIN creation, cold-launch PIN and biometric unlock, session re-lock after inactivity, PIN change, forgotten-PIN recovery via seed phrase, and deep-link handling while unauthenticated. No wallet functionality is accessible until the user has successfully completed authentication.

---

## Requirements

### Requirement: App Initialization

On first launch the app MUST detect that no credentials exist and route the user to the PIN creation flow before any wallet functionality is accessible. The app MUST collect the FCM push-notification permission and register the device token immediately after the initial app setup is confirmed.

#### Scenario: First launch — no existing credentials

- GIVEN the app is launched on a device that has never had credentials stored
- WHEN the splash animation completes
- THEN the app navigates to the PIN creation screen
- AND the user cannot access any wallet screen until a PIN has been created and setup is complete

#### Scenario: Returning launch — credentials already exist

- GIVEN the app is launched on a device that already has credentials stored
- WHEN the splash animation completes
- THEN the app navigates to the PIN login screen
- AND no wallet content is visible until authentication succeeds

---

### Requirement: PIN Creation

The app MUST require the user to create a 4-digit numeric PIN by entering the same value twice consecutively. The app MUST NOT store the PIN in plain text; it MUST be derived into a secure hash before any storage operation.

#### Scenario: Successful PIN creation

- GIVEN the user is on the PIN creation screen for the first time
- WHEN the user enters a 4-digit PIN and then re-enters the same 4 digits to confirm
- THEN the app stores the PIN credentials securely
- AND navigates the user toward biometric setup (if first-time, non-recovery flow) or onboarding slides

#### Scenario: PIN confirmation mismatch

- GIVEN the user has entered a 4-digit PIN in the creation stage
- WHEN the user enters a different 4-digit value in the confirmation stage
- THEN the app displays an error indicating the PINs do not match
- AND resets both entry fields so the user can start over

#### Scenario: PIN creation during forgot-passcode flow

- GIVEN the user has verified their identity via seed phrase in the forgot-passcode flow
- WHEN they complete the new PIN creation and confirmation
- THEN the app replaces the stored PIN hash with the new one
- AND navigates to the passcode change success screen

---

### Requirement: PIN Authentication

The app MUST authenticate the user via their 4-digit PIN on every cold launch and after a session re-lock. The PIN is validated entirely on-device; network access is NOT required.

#### Scenario: Correct PIN entered

- GIVEN the user is on the login screen with valid stored credentials
- WHEN the user enters the correct 4-digit PIN and taps Proceed
- THEN the app decrypts the local database key and unlocks the session
- AND navigates to the home screen (or to the previously pending deep-link destination)

#### Scenario: Wrong PIN entered — below cooldown threshold

- GIVEN the user is on the login screen
- WHEN the user enters an incorrect 4-digit PIN
- THEN the app displays an "Incorrect passcode" error message
- AND increments an in-session failure counter without triggering a cooldown yet

#### Scenario: PIN failures trigger cooldown

- GIVEN the user has failed PIN entry 3 consecutive times within a session
- WHEN the third failure is recorded
- THEN the app increments the persistent failure counter
- AND enforces a time-based cooldown (5 min after 1st cooldown, 15 min after 2nd, 60 min after 3rd, exponentially increasing thereafter)
- AND disables the PIN input field for the duration of the cooldown
- AND displays a "Forgot passcode?" link so the user can recover via seed phrase

#### Scenario: Cooldown expires

- GIVEN a PIN cooldown is active
- WHEN the cooldown period elapses
- THEN the app re-enables the PIN input field automatically
- AND clears the cooldown error message

---

### Requirement: Biometric Authentication

When biometric unlock is enabled for the active account, the app MUST automatically prompt for biometric authentication on each cold launch before the PIN pad is shown. On biometric failure or cancellation the app MUST fall back to PIN entry.

#### Scenario: Biometric authentication succeeds

- GIVEN the user has biometric unlock enabled for their account
- WHEN the app presents the biometric prompt and the user authenticates successfully
- THEN the app unlocks the session using the biometrically-retrieved key
- AND navigates to the home screen without requiring PIN entry

#### Scenario: Biometric authentication cancelled or fails

- GIVEN the user has biometric unlock enabled
- WHEN the user cancels the biometric prompt or biometric recognition fails
- THEN the app falls back to the PIN entry screen
- AND does not count the biometric failure as a PIN failure attempt

#### Scenario: Biometric not enrolled on device

- GIVEN the user attempts to enable biometric login from the PIN-creation or settings flow
- WHEN the device has no biometric sensor or no biometrics enrolled
- THEN the app displays an error indicating biometrics are not available
- AND keeps PIN as the active login method

---

### Requirement: Session Re-lock

The app MUST lock the session and require re-authentication when the app returns to the foreground after having been in the background for more than 5 minutes.

#### Scenario: App returns from background after timeout

- GIVEN the user had an authenticated session and sent the app to the background
- WHEN the app is foregrounded after more than 5 minutes in the background
- THEN the app resets navigation to the login screen (re-lock mode)
- AND any pending deep link received while backgrounded is preserved so it can be handled after re-authentication

#### Scenario: App returns from background within timeout

- GIVEN the user had an authenticated session and sent the app to the background
- WHEN the app is foregrounded within 5 minutes
- THEN the app resumes the authenticated session without requiring re-authentication

---

### Requirement: Re-authentication for Sensitive Actions

The app MUST require the user to re-authenticate (PIN or biometric) before accessing screens or actions that are gated with an internal authentication check, even within an already-authenticated session.

#### Scenario: Internal check passes

- GIVEN the user is authenticated and navigates to a screen requiring an internal re-authentication check
- WHEN the user successfully enters their PIN (or biometric)
- THEN the app unlocks navigation to the requested screen
- AND does not disrupt the overall session state

#### Scenario: Internal check fails

- GIVEN the user is on the re-authentication prompt for a sensitive screen
- WHEN the user enters an incorrect PIN
- THEN the app shows an error and keeps the user on the re-authentication screen
- AND does not navigate to the gated screen

---

### Requirement: PIN Change

A logged-in user MUST be able to change their PIN. The change MUST require the user to verify their current PIN before a new one is accepted, ensuring that an unauthorized party cannot silently replace credentials.

#### Scenario: Successful PIN change

- GIVEN the user is logged in and navigates to the change PIN screen
- WHEN the user enters the correct current PIN, then creates and confirms a new 4-digit PIN
- THEN the app replaces the stored PIN hash with the new hash
- AND navigates to the passcode change success page

#### Scenario: Current PIN entered incorrectly during change

- GIVEN the user is on the PIN change screen
- WHEN the user enters an incorrect current PIN
- THEN the app displays an error and does not proceed to the new PIN entry
- AND records the failure consistently with normal PIN failure tracking

---

### Requirement: Forgotten PIN Recovery

When a user cannot remember their PIN, the app MUST provide a recovery flow that verifies identity via the primary seed phrase before allowing a new PIN to be set. The app MUST NOT allow a PIN reset without this verification.

#### Scenario: Successful passcode reset via seed phrase

- GIVEN the user has forgotten their PIN and is on the login screen during cooldown
- WHEN the user taps "Forgot passcode?", confirms understanding of the seed-phrase requirement, and successfully enters their seed phrase
- THEN the app verifies the seed phrase against the stored app identity
- AND routes the user to the PIN creation screen with the "isForgot" flag active
- AND after the new PIN is set, the app restores the previous app state

#### Scenario: Wrong seed phrase entered during recovery

- GIVEN the user is in the forgotten-passcode recovery flow
- WHEN the user enters an incorrect or incomplete seed phrase
- THEN the app displays an error and does not proceed to PIN creation
- AND the existing PIN credentials remain unchanged

---

### Requirement: Deep Link Handling While Unauthenticated

The app MUST preserve any deep link that arrives while the session is locked or before authentication completes, and MUST navigate to the deep-link destination after the user successfully authenticates.

#### Scenario: Deep link arrives while app is locked

- GIVEN the app is on the login screen (session locked or cold launch)
- WHEN an external deep link triggers app activation
- THEN the app stores the deep link internally
- AND after successful authentication, the app navigates to the screen or action designated by that deep link

#### Scenario: Deep link arrives with no authenticated destination

- GIVEN the app receives a deep link but the link refers to an unknown or invalid route
- WHEN the user completes authentication
- THEN the app navigates to the home screen
- AND does not crash or display an error related to the deep link

---

### Requirement: Offline Authentication

The app MUST allow PIN-authenticated access when the device has no network connectivity. Local credential verification MUST NOT depend on an internet connection.

#### Scenario: PIN login while offline

- GIVEN the device has no active network connection
- WHEN the user enters the correct PIN
- THEN the app decrypts the local database and grants access
- AND the user can view their locally-cached wallet data

#### Scenario: Receipt verification fails at login (non-Pleb user)

- GIVEN the user is authenticated but the server subscription verification call fails due to network issues
- WHEN the verification failure is detected
- THEN the app displays a modal offering "Retry" or "Continue Offline" options
- AND if the user chooses "Continue Offline", the session proceeds in offline mode without downgrading stored subscription data

---

### Requirement: Electrum Connection Status at Login

After a successful cold-launch authentication, the app SHOULD initiate a connection to the configured Electrum node and surface the connection status so the user has visibility into network availability.

#### Scenario: Electrum connects successfully after login

- GIVEN the user has just authenticated via PIN or biometrics on a cold launch
- WHEN the Electrum connection attempt succeeds
- THEN the connection status reflects a successful, connected state with the node address visible

#### Scenario: Electrum fails to connect after login

- GIVEN the user has just authenticated
- WHEN the Electrum connection attempt fails
- THEN the app surfaces an error indicator for the node connection
- AND continues to allow access to locally-cached data

---

### Requirement: Multi-Account Support

The app MUST support multiple independent accounts on the same device. Each account has its own PIN and, optionally, its own biometric binding. Switching accounts requires the user to authenticate with the target account's credentials.

#### Scenario: Additional account login

- GIVEN a device with more than one account created
- WHEN the user selects a different account on the login screen and enters that account's PIN
- THEN the app loads only the data associated with that account
- AND does not expose any data from the previously active account

#### Scenario: Biometric bound to a specific account

- GIVEN biometric login is enabled for Account A but not Account B
- WHEN Account B is selected on the login screen
- THEN the biometric prompt is NOT presented
- AND the user must enter the PIN for Account B to authenticate

---

## Non-Goals

- This spec does not cover wallet or vault creation; those are owned by the `wallets` and `vault` domains.
- This spec does not cover the content displayed after login on the home screen; that is owned by the `wallets`, `vault`, and `notifications` domains.
- This spec does not cover the cloud backup or seed-export flows used in the recovery path; those are owned by `backup-and-recovery`.
- This spec does not cover subscription tier verification logic; that is owned by `subscription`.
- This spec does not cover the specific UX of onboarding slides shown after first-time PIN creation.
