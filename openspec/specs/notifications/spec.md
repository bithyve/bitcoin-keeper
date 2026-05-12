# Notifications Specification

## Purpose

The notifications domain governs all mechanisms by which Bitcoin Keeper surfaces
time-sensitive information to the user: Firebase Cloud Messaging (FCM) push
notifications received from the BitHyve relay server, and the in-app User Action
Item (UAI) stack that aggregates locally-generated and server-triggered alerts
into an ordered, prioritized queue displayed throughout the home screen experience.

---

## Requirements

### Requirement: FCM Permission and Token Registration

The app MUST request push notification permission from the operating system on
every login attempt. After permission is granted, the app MUST retrieve the
device's current FCM token and upload it to the BitHyve relay server. The
locally stored token MUST be compared with the freshly fetched token; the server
upload MUST only occur when the tokens differ.

#### Scenario: Permission granted and token uploaded on first login

- GIVEN the user is logging in for the first time on this device
- WHEN the login screen mounts
- THEN the app requests notification permission from the OS
- AND upon grant, the app fetches an FCM token
- AND the app uploads the token to the relay server
- AND the token is stored locally for future comparison

#### Scenario: Token unchanged — no upload needed

- GIVEN the user has previously logged in and the FCM token has not rotated
- WHEN the user authenticates again
- THEN the app fetches the current FCM token
- AND detects it matches the stored token
- AND does NOT issue a duplicate upload request to the relay server

#### Scenario: Permission denied by user

- GIVEN the user dismisses or denies the notification permission prompt
- WHEN the login screen mounts
- THEN the app continues the login flow without an FCM token
- AND no upload is attempted
- AND all local UAI functionality continues to operate normally

---

### Requirement: FCM Topic Subscription

The app MUST subscribe to the FCM topic corresponding to the installed app
version on each successful login, enabling the relay server to broadcast
version-specific release announcements.

#### Scenario: Subscription on login

- GIVEN the user successfully authenticates
- WHEN the login saga completes credential storage
- THEN the app subscribes to the FCM topic for the current app version

#### Scenario: Topic updated after app upgrade

- GIVEN the app has been upgraded to a new version
- WHEN the user authenticates for the first time after upgrade
- THEN the app unsubscribes from the previous version's FCM topic
- AND subscribes to the current version's FCM topic

---

### Requirement: UAI Stack Persistence and Priority Ordering

The app MUST maintain a persistent, ordered stack of User Action Items. UAIs
MUST be sorted first by type priority and second by the time they were last
actioned (older-actioned items ranked higher). The following priority tiers
MUST apply:

| Priority | UAI Types |
|----------|-----------|
| 100 (highest) | Canary Wallet, Zendesk Ticket, Signing Delay, Incoming Transaction |
| 90 | Server Backup Failure, Signing Device Health Check, Recovery Phrase Health Check |
| 70 | Secure Vault |

UAIs tagged with a specific Bitcoin network (mainnet or testnet) MUST only
appear when the app is operating on that network.

#### Scenario: UAI stack sorted by priority on home screen

- GIVEN the UAI stack contains an Incoming Transaction alert (priority 100) and
  a Server Backup Failure alert (priority 90)
- WHEN the user navigates to the home screen
- THEN the Incoming Transaction alert is positioned above the Server Backup
  Failure alert in the home screen header banner

#### Scenario: Network-tagged UAI hidden on wrong network

- GIVEN a Health Check UAI was created while the app was on mainnet
- WHEN the user switches to testnet
- THEN the mainnet Health Check UAI does NOT appear in the UAI stack

---

### Requirement: Home Screen UAI Banner

The app MUST display a banner beneath the home screen header showing the
highest-priority unseen UAI with priority 90 or above. The banner MUST show
the UAI heading and body text. The user MUST be able to tap the banner to
navigate directly to the relevant screen for that UAI. The user MUST be able
to dismiss the banner without actioning the underlying UAI.

#### Scenario: High-priority unseen UAI shown in banner

- GIVEN the UAI stack contains an unseen Signing Delay alert (priority 100)
- WHEN the user is on the home screen
- THEN a banner appears beneath the header showing the signing delay heading
  and body
- AND tapping the banner navigates to the Send Confirmation screen for the
  pending delayed transaction

#### Scenario: Banner dismissed without actioning UAI

- GIVEN a UAI banner is visible on the home screen
- WHEN the user taps the dismiss (X) button on the banner
- THEN the banner is hidden for the current session
- AND the UAI remains in the stack and is still visible in the Notifications Center

#### Scenario: No banner when all UAIs are seen or low priority

- GIVEN all pending UAIs have been marked as seen, or have priority below 90
- WHEN the user is on the home screen
- THEN no UAI banner is displayed beneath the header

---

### Requirement: Notification Bell Indicator

The app MUST display a notification bell icon in the home screen header. When
any unseen UAI exists in the stack, the bell MUST display a dot indicator. When
all UAIs have been seen, the bell MUST display without a dot.

#### Scenario: Dot shown for unseen UAIs

- GIVEN at least one UAI has not yet been viewed in the Notifications Center
- WHEN the user looks at the home screen header
- THEN the notification bell displays a dot indicator

#### Scenario: Dot cleared after visiting Notifications Center

- GIVEN unseen UAIs exist and the bell shows a dot
- WHEN the user opens the Notifications Center
- THEN all visible UAIs are marked as seen
- AND on returning to the home screen the bell no longer shows a dot

---

### Requirement: Notifications Center

The app MUST provide a dedicated Notifications Center screen accessible from
the home screen header bell icon. The screen MUST display all pending UAIs in
two sections: "New" (unseen) and "Seen" (previously viewed), each sorted by
creation time descending (newest first). Each entry MUST show a heading, body
text, and an icon representing the UAI type. Tapping an entry MUST navigate
to or trigger the action relevant to that UAI type. The screen MUST show an
empty state illustration and message when no pending UAIs exist.

#### Scenario: New and Seen sections displayed

- GIVEN two UAIs exist — one unseen, one previously viewed
- WHEN the user opens the Notifications Center
- THEN the unseen UAI appears under the "New" section header
- AND the previously viewed UAI appears under the "Seen" section header
- AND all displayed UAIs are marked as seen after opening the screen

#### Scenario: Empty state displayed with no pending UAIs

- GIVEN no UAIs are present in the stack
- WHEN the user opens the Notifications Center
- THEN the screen displays an empty-state illustration and a "No new
  notifications" message instead of a list

---

### Requirement: UAI Actioning and Dismissal

The user MUST be able to action (dismiss) any UAI from the Notifications Center
or from the home screen banner. Actioning a UAI MUST record a lastActioned
timestamp and remove it from the active displayed stack. A UAI deleted via
actioning MUST NOT reappear unless its triggering condition recurs.

#### Scenario: UAI actioned from Notifications Center

- GIVEN a Signing Delay UAI is visible in the Notifications Center
- WHEN the user taps the primary action button ("View") on that UAI
- THEN the user is navigated to the Send Confirmation screen for the transaction
- AND the UAI is marked as lastActioned and removed from the UAI stack display

#### Scenario: UAI auto-cleared when condition resolves

- GIVEN a Signing Device Health Check UAI exists for a specific device
- WHEN the user completes a health check for that device within the required
  timeframe
- THEN the next UAI checks run automatically removes that UAI from the stack
- AND the UAI does not reappear until the next overdue threshold is reached

---

### Requirement: Secure Vault UAI

The app MUST generate a Secure Vault UAI when the user has no vault configured.
This UAI MUST be automatically removed when the user creates their first vault.

#### Scenario: Secure Vault UAI created on first login with no vault

- GIVEN the user has authenticated and no vault exists
- WHEN the app runs UAI checks after login
- THEN a "Create Your First Vault" UAI is added to the stack

#### Scenario: Secure Vault UAI cleared after vault creation

- GIVEN a Secure Vault UAI is active
- WHEN the user creates their first vault
- THEN the Secure Vault UAI is automatically removed from the stack

---

### Requirement: Signing Device Health Check UAI

The app MUST generate a UAI for each non-hidden signing device whose last health
check timestamp exceeds the configured reminder threshold (180 days on mainnet).
The UAI MUST be cleared automatically when the device's health check is brought
current. A separate UAI MUST be created for each overdue signing device.

#### Scenario: Health check UAI created for overdue signer

- GIVEN a signing device's last health check was 181 days ago (mainnet)
- WHEN the app runs UAI checks
- THEN a "Health check pending" UAI is added to the stack for that signer

#### Scenario: Health check UAI removed after completing health check

- GIVEN a Health Check UAI exists for a device
- WHEN the user completes a successful health check for that device
- THEN the next UAI checks run removes the UAI from the active stack

#### Scenario: Health check UAI not created for hidden signers

- GIVEN a signing device has been marked as hidden
- WHEN the app runs UAI checks
- THEN no Health Check UAI is created for the hidden device

---

### Requirement: Recovery Phrase Health Check UAI

The app MUST generate a UAI prompting the user to re-confirm their recovery
phrase when the last confirmed seed backup exceeds the reminder threshold, or
when no confirmed backup exists. The UAI MUST be cleared when a backup is
re-confirmed within the threshold.

#### Scenario: Recovery phrase UAI created when no confirmed backup exists

- GIVEN the user has never completed a seed confirmation
- WHEN the app runs UAI checks
- THEN a "Backup Recovery Key" UAI is added to the stack

#### Scenario: Recovery phrase UAI cleared after re-confirmation

- GIVEN a Recovery Phrase Health Check UAI is active
- WHEN the user re-confirms their seed phrase successfully
- THEN the UAI is removed from the stack

---

### Requirement: Incoming Transaction Alert

The app MUST generate an Incoming Transaction UAI whenever a wallet sync detects
a new UTXO received at a non-change external address for any non-canary wallet or
vault. Each new incoming transaction MUST generate a distinct UAI entry. The UAI
MUST carry an entity reference that allows direct navigation to the specific
transaction in the relevant wallet or vault.

#### Scenario: Incoming transaction UAI created on wallet sync

- GIVEN a wallet is synced and a new UTXO is detected at an external receive address
- WHEN the sync completes
- THEN an "Incoming Transaction Received" UAI is added to the stack
- AND the UAI is associated with the wallet or vault and the specific transaction ID

#### Scenario: Tapping incoming transaction UAI navigates to transaction

- GIVEN an Incoming Transaction UAI is visible in the Notifications Center
- WHEN the user taps the "View" action
- THEN the app navigates directly to the transaction detail within the relevant
  wallet or vault screen

#### Scenario: Internal (change) address transactions do not trigger UAI

- GIVEN a wallet sync detects a UTXO sent to the wallet's own change address
- WHEN the sync completes
- THEN no Incoming Transaction UAI is generated

#### Scenario: Canary vault transactions do not trigger incoming transaction UAI

- GIVEN a canary vault receives a transaction
- WHEN the wallet sync completes
- THEN no Incoming Transaction UAI is created for that vault
- AND the canary wallet balance change is evaluated separately

---

### Requirement: Canary Wallet Alert

The app MUST generate a UAI when the total balance (confirmed + unconfirmed) of
a canary vault decreases below its previously cached value. The alert MUST
identify the specific canary vault. The cached balance MUST be updated after each
sync regardless of whether a UAI was created.

#### Scenario: Canary wallet UAI created on balance decrease

- GIVEN a canary vault had a cached balance of 100,000 sats
- WHEN a sync detects the current balance is 80,000 sats
- THEN a "Canary Wallet Accessed" UAI is created for that vault

#### Scenario: No UAI when canary balance is unchanged or increased

- GIVEN a canary vault had a cached balance of 100,000 sats
- WHEN a sync detects the current balance is 100,000 sats or more
- THEN no Canary Wallet UAI is created
- AND the cached balance is updated to the current value

---

### Requirement: Server Backup Failure Alert

The app MUST generate a Server Backup Failure UAI whenever an automatic cloud
backup attempt fails or cannot be initiated (e.g., no network connectivity). If
a Server Backup Failure UAI already exists, a new one MUST replace the prior
entry. Tapping the UAI MUST trigger a re-attempt of the backup.

#### Scenario: Server backup failure UAI created on failed backup

- GIVEN automatic cloud backup is enabled and the device has no network connection
- WHEN the app attempts an automatic cloud backup
- THEN a "Assisted Server Backup Has Failed" UAI is created
- AND a pending backup flag is set so the next online session retries automatically

#### Scenario: Tapping server backup failure UAI triggers retry

- GIVEN a Server Backup Failure UAI is visible in the Notifications Center
- WHEN the user taps the "View" action
- THEN the app initiates a backup of all signers and vaults immediately

---

### Requirement: Signing Delay Alert

The app MUST generate a Signing Delay UAI when a previously submitted
server-key-delayed transaction has had its delay period expire and the server key
has produced a signature. The UAI MUST be associated with the transaction ID.
Tapping the UAI MUST restore the pending send confirmation state and navigate
the user to the Send Confirmation screen.

#### Scenario: Signing delay UAI created when delay period expires

- GIVEN a transaction was submitted with a server key signing delay
- WHEN the delay period elapses and the server key co-signs the transaction
- THEN a "Server Key Signed Transaction" UAI is added to the stack

#### Scenario: Tapping signing delay UAI resumes send flow

- GIVEN a Signing Delay UAI is active
- WHEN the user taps the "View" action
- THEN the send confirmation state is restored from cache
- AND the user is navigated to the Send Confirmation screen to complete broadcast

---

### Requirement: Policy Delay Alert

The app MUST generate a Policy Delay UAI when a previously submitted policy
update request's delay period expires and the server has applied the updated
policy. Tapping the UAI MUST navigate the user to the policy configuration
screen so they can review or further adjust the active policy.

#### Scenario: Policy delay UAI created on policy application

- GIVEN a policy update was submitted with a delay
- WHEN the delay expires and the server applies the updated policy
- THEN a "Server Key Policy Updated" UAI is added to the stack

#### Scenario: Tapping policy delay UAI opens policy configuration

- GIVEN a Policy Delay UAI is active
- WHEN the user taps the "View" action
- THEN the user is navigated to the policy configuration screen for the server key
- AND the UAI is marked as actioned

---

### Requirement: Zendesk Ticket UAI

The app MUST generate a Zendesk Ticket UAI when a push notification arrives
indicating an update to a support ticket. The UAI MUST carry the ticket ID and
status. Tapping the UAI MUST navigate to the ticket details screen for the
corresponding ticket.

#### Scenario: Zendesk ticket UAI created from foreground push notification

- GIVEN the app is in the foreground
- WHEN a push notification arrives for a Zendesk ticket update
- THEN a Zendesk Ticket UAI is added to the stack with the ticket ID and status

#### Scenario: Tapping Zendesk ticket UAI navigates to ticket details

- GIVEN a Zendesk Ticket UAI is visible in the Notifications Center
- WHEN the user taps the "View" action
- THEN the app navigates to the ticket details screen for the referenced ticket

---

### Requirement: Foreground Push Notification Modal

When the app is in the foreground and receives a Remote Key Share push
notification, the app MUST display an in-app modal showing the notification
title and body. The modal MUST be dismissible by the user.

#### Scenario: Foreground remote key share notification shown as modal

- GIVEN the app is in the foreground
- WHEN a Remote Key Share push notification is received
- THEN an in-app modal appears displaying the notification title and body
- AND the user can dismiss the modal by tapping "Ok" or the close icon

---

### Requirement: Background and Terminated State Notification Handling

When the user taps a push notification while the app is in the background or
terminated, the app MUST open and navigate directly to the destination relevant
to that notification type. For Zendesk ticket notifications, the app MUST
navigate directly to the corresponding ticket details screen.

#### Scenario: Tapping Zendesk notification from background state

- GIVEN the app is in the background and a Zendesk ticket update notification arrives
- WHEN the user taps the notification
- THEN the app opens and navigates directly to the ticket details screen for
  that ticket

#### Scenario: Tapping Zendesk notification from terminated state

- GIVEN the app is terminated (fully closed) and a Zendesk ticket update
  notification was received
- WHEN the user taps the notification to open the app
- THEN the app initializes and navigates to the ticket details screen for that
  ticket

---

### Requirement: UAI Checks on Login

The app MUST run UAI checks for the following types on every successful
authentication: Signing Device Health Check, Secure Vault, Recovery Phrase
Health Check, Zendesk Ticket, Server Backup Failure, Signing Delay, and Policy
Delay. These checks MUST evaluate current app state and create or clear UAIs
as appropriate before the home screen is displayed.

#### Scenario: UAI checks run after authentication

- GIVEN the user has successfully entered their PIN or biometric
- WHEN the authentication saga completes
- THEN the app evaluates all required UAI check types
- AND creates new UAIs for any conditions that are met
- AND removes stale UAIs whose conditions are no longer true

---

## Non-Goals

- This spec does not cover the Concierge ticket creation or listing flow; only
  the UAI and push notification surface for Zendesk ticket status updates is
  within scope.
- This spec does not cover the Fee Insights screen content or fee data
  visualization; the `FEE_INISGHT` UAI type is reserved but not yet implemented
  as an automated alert.
- This spec does not govern how health check completion is performed; that is
  covered by the `health-checks` domain spec.
- This spec does not cover backup initiation flows; only the failure alert UAI
  surface is within scope.
- This spec does not cover in-app release announcements or app changelog content;
  only FCM topic subscription for release messages is referenced.
- This spec does not govern the signing delay mechanics, PSBT construction, or
  broadcast flow; only the UAI surface for delay completion is within scope.
