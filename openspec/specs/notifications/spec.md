# Notifications Specification

## Purpose

Notifications owns in-app and system-level reminders, alerts, banners, and action
items that help users notice important wallet, backup, transaction, and security
events.

**Internal terminology note:**
- `UAI` (User Action Item) may remain as an internal enum/type name.
- User-facing copy must NOT show "UAI". Use notification, reminder, alert, banner,
  or action item instead.
- `POLICY_SERVER` may remain internal. User-facing copy must say Server Key.

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

### Requirement: Internal Action Item Stack Persistence and Priority Ordering

The app MUST maintain a persistent, ordered stack of internal action items. Items
MUST be sorted first by type priority and second by the time they were last
actioned (older-actioned items ranked higher). The following priority tiers
MUST apply:

| Priority | Internal Action Item Types |
|----------|----------------------------|
| 100 (highest) | Canary Wallet, Signing Delay, Incoming Transaction |
| 90 | Server Backup Failure, Signing Device Health Check, Recovery Key Health Check |
| 70 | Secure Wallet Setup |

Items tagged with a specific Bitcoin network (mainnet or testnet) MUST only
appear when the app is operating on that network.

#### Scenario: Internal action item stack sorted by priority on home screen

- GIVEN the action item stack contains an Incoming Transaction alert (priority 100) and
  a Server Backup Failure alert (priority 90)
- WHEN the user navigates to the home screen
- THEN the Incoming Transaction alert is positioned above the Server Backup
  Failure alert in the home screen header banner

#### Scenario: Network-tagged action item hidden on wrong network

- GIVEN a Health Check action item was created while the app was on mainnet
- WHEN the user switches to testnet
- THEN the mainnet Health Check action item does NOT appear in the stack

---

### Requirement: Home Screen Alert Banner

The app MUST display a banner beneath the home screen header showing the
highest-priority unseen action item with priority 90 or above. The banner MUST
show the heading and body text. The user MUST be able to tap the banner to
navigate directly to the relevant screen for that action item. The user MUST be
able to dismiss the banner without actioning the underlying item.

#### Scenario: High-priority unseen alert shown in banner

- GIVEN the action item stack contains an unseen Signing Delay alert (priority 100)
- WHEN the user is on the home screen
- THEN a banner appears beneath the header showing the signing delay heading
  and body
- AND tapping the banner navigates to the Send Confirmation screen for the
  pending delayed transaction

#### Scenario: Banner dismissed without actioning item

- GIVEN an alert banner is visible on the home screen
- WHEN the user taps the dismiss (X) button on the banner
- THEN the banner is hidden for the current session
- AND the action item remains in the stack and is still visible in the Notifications Center

#### Scenario: No banner when all items are seen or low priority

- GIVEN all pending action items have been marked as seen, or have priority below 90
- WHEN the user is on the home screen
- THEN no alert banner is displayed beneath the header

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
the home screen header bell icon. The screen MUST display all pending action
items in two sections: "New" (unseen) and "Seen" (previously viewed), each
sorted by creation time descending (newest first). Each entry MUST show a
heading, body text, and an icon representing the type. Tapping an entry MUST
navigate to or trigger the action relevant to that type. The screen MUST show
an empty state illustration and message when no pending items exist.

#### Scenario: New and Seen sections displayed

- GIVEN two items exist — one unseen, one previously viewed
- WHEN the user opens the Notifications Center
- THEN the unseen item appears under the "New" section header
- AND the previously viewed item appears under the "Seen" section header
- AND all displayed items are marked as seen after opening the screen

#### Scenario: Empty state displayed with no pending items

- GIVEN no action items are present in the stack
- WHEN the user opens the Notifications Center
- THEN the screen displays an empty-state illustration and a "No new
  notifications" message instead of a list

---

### Requirement: Action Item Actioning and Dismissal

The user MUST be able to action (dismiss) any item from the Notifications Center
or from the home screen banner. Actioning an item MUST record a lastActioned
timestamp and remove it from the active displayed stack. An item deleted via
actioning MUST NOT reappear unless its triggering condition recurs.

#### Scenario: Item actioned from Notifications Center

- GIVEN a Signing Delay action item is visible in the Notifications Center
- WHEN the user taps the primary action button ("View") on that item
- THEN the user is navigated to the Send Confirmation screen for the transaction
- AND the item is marked as lastActioned and removed from the stack display

#### Scenario: Item auto-cleared when condition resolves

- GIVEN a Signing Device Health Check action item exists for a specific device
- WHEN the user completes a health check for that device within the required
  timeframe
- THEN the next action item checks run automatically removes that item from the stack
- AND the item does not reappear until the next overdue threshold is reached
  timeframe
- THEN the next UAI checks run automatically removes that UAI from the stack
- AND the UAI does not reappear until the next overdue threshold is reached

---

### Requirement: Secure Wallet Setup Reminder

The app MUST generate a Secure Wallet Setup reminder when the user has no
multi-key wallet configured. User-facing copy must say:
- "Create Your First Wallet" (when no wallet exists)
- "Secure Your Wallet" (when a wallet exists but is not fully set up)
- "Finish Wallet Setup" (when setup is in progress)

This reminder MUST be automatically removed when the user creates or completes
the relevant wallet.

#### Scenario: Reminder created on first login with no wallet

- GIVEN the user has authenticated and no multi-key wallet exists
- WHEN the app runs checks after login
- THEN a "Create Your First Wallet" reminder is added to the stack

#### Scenario: Reminder cleared after wallet creation

- GIVEN a Secure Wallet Setup reminder is active
- WHEN the user creates their first wallet
- THEN the reminder is automatically removed from the stack

---

### Requirement: Signing Device Health Check Reminder

The app MUST generate a health check reminder for each non-hidden signing device
whose last health check timestamp exceeds the configured reminder threshold
(180 days on mainnet). The reminder MUST be cleared automatically when the
device's health check is brought current. A separate reminder MUST be created
for each overdue signing device.

#### Scenario: Health check reminder created for overdue signer

- GIVEN a signing device's last health check was 181 days ago (mainnet)
- WHEN the app runs checks
- THEN a "Health check pending" reminder is added to the stack for that signer

#### Scenario: Health check reminder removed after completing health check

- GIVEN a Health Check reminder exists for a device
- WHEN the user completes a successful health check for that device
- THEN the next checks run removes the reminder from the active stack

#### Scenario: Health check reminder not created for hidden signers

- GIVEN a signing device has been marked as hidden
- WHEN the app runs checks
- THEN no Health Check reminder is created for the hidden device

---

### Requirement: Recovery Key Health Check Reminder

The app MUST generate a reminder prompting the user to re-confirm their Recovery
Key when the last confirmed backup exceeds the reminder threshold, or when no
confirmed backup exists. User-facing copy must say **Recovery Key Backup Incomplete**
or **Recovery Key Health Check**. The reminder MUST be cleared when a backup is
re-confirmed within the threshold.

#### Scenario: Recovery Key reminder created when no confirmed backup exists

- GIVEN the user has never completed a Recovery Key confirmation
- WHEN the app runs checks
- THEN a "Recovery Key Backup Incomplete" reminder is added to the stack

#### Scenario: Recovery Key reminder cleared after re-confirmation

- GIVEN a Recovery Key Health Check reminder is active
- WHEN the user re-confirms their Recovery Key successfully
- THEN the reminder is removed from the stack

---

### Requirement: Incoming Transaction Alert

The app MUST generate an Incoming Transaction alert whenever a wallet sync detects
a new UTXO received at a non-change external address for any non-canary wallet.
Each new incoming transaction MUST generate a distinct alert entry. The alert
MUST carry an entity reference that allows direct navigation to the specific
transaction in the relevant wallet.

#### Scenario: Incoming transaction alert created on wallet sync

- GIVEN a wallet is synced and a new UTXO is detected at an external receive address
- WHEN the sync completes
- THEN an "Incoming Transaction Received" alert is added to the stack
- AND the alert is associated with the wallet and the specific transaction ID

#### Scenario: Tapping incoming transaction alert navigates to transaction

- GIVEN an Incoming Transaction alert is visible in the Notifications Center
- WHEN the user taps the "View" action
- THEN the app navigates directly to the transaction detail within the relevant wallet screen

#### Scenario: Internal (change) address transactions do not trigger alert

- GIVEN a wallet sync detects a UTXO sent to the wallet's own change address
- WHEN the sync completes
- THEN no Incoming Transaction alert is generated

#### Scenario: Canary wallet transactions do not trigger incoming transaction alert

- GIVEN a canary wallet receives a transaction
- WHEN the wallet sync completes
- THEN no Incoming Transaction alert is created for that wallet
- AND the canary wallet balance change is evaluated separately

---

### Requirement: Canary Wallet Alert

The app MUST generate a Canary Wallet alert when the total balance (confirmed +
unconfirmed) of a canary wallet decreases below its previously cached value. The
alert MUST identify the specific canary wallet. The cached balance MUST be updated
after each sync regardless of whether an alert was created.

#### Scenario: Canary wallet alert created on balance decrease

- GIVEN a canary wallet had a cached balance of 100,000 sats
- WHEN a sync detects the current balance is 80,000 sats
- THEN a "Canary Wallet Accessed" alert is created for that wallet

#### Scenario: No alert when canary balance is unchanged or increased

- GIVEN a canary wallet had a cached balance of 100,000 sats
- WHEN a sync detects the current balance is 100,000 sats or more
- THEN no Canary Wallet alert is created
- AND the cached balance is updated to the current value

---

### Requirement: Server Backup Failure Alert

The app MUST generate a Server Backup Failure alert whenever an automatic cloud
backup attempt fails or cannot be initiated (e.g., no network connectivity). If
a Server Backup Failure alert already exists, a new one MUST replace the prior
entry. Tapping the alert MUST trigger a re-attempt of the backup.

#### Scenario: Server backup failure alert created on failed backup

- GIVEN automatic cloud backup is enabled and the device has no network connection
- WHEN the app attempts an automatic cloud backup
- THEN an "Assisted Server Backup Has Failed" alert is created
- AND a pending backup flag is set so the next online session retries automatically

#### Scenario: Tapping server backup failure alert triggers retry

- GIVEN a Server Backup Failure alert is visible in the Notifications Center
- WHEN the user taps the "View" action
- THEN the app initiates a backup of all signers and wallets immediately

---

### Requirement: Signing Delay Alert

The app MUST generate a Signing Delay alert when a previously submitted
server-key-delayed transaction has had its delay period expire and the Server Key
has produced a signature. The alert MUST be associated with the transaction ID.
Tapping the alert MUST restore the pending send confirmation state and navigate
the user to the Send Confirmation screen.

#### Scenario: Signing delay alert created when delay period expires

- GIVEN a transaction was submitted with a Server Key signing delay
- WHEN the delay period elapses and the Server Key co-signs the transaction
- THEN a "Server Key Signed Transaction" alert is added to the stack

#### Scenario: Tapping signing delay alert resumes send flow

- GIVEN a Signing Delay alert is active
- WHEN the user taps the "View" action
- THEN the send confirmation state is restored from cache
- AND the user is navigated to the Send Confirmation screen to complete broadcast

---

### Requirement: Policy Delay Alert

The app MUST generate a Policy Delay alert when a previously submitted policy
update request's delay period expires and the server has applied the updated
policy. Tapping the alert MUST navigate the user to the policy configuration
screen so they can review or further adjust the active policy.

#### Scenario: Policy delay alert created on policy application

- GIVEN a policy update was submitted with a delay
- WHEN the delay expires and the server applies the updated policy
- THEN a "Server Key Policy Updated" alert is added to the stack

#### Scenario: Tapping policy delay alert opens policy configuration

- GIVEN a Policy Delay alert is active
- WHEN the user taps the "View" action
- THEN the user is navigated to the policy configuration screen for the Server Key
- AND the alert is marked as actioned

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
to that notification type.

#### Scenario: Tapping notification from background state

- GIVEN the app is in the background and a push notification arrives
- WHEN the user taps the notification
- THEN the app opens and navigates directly to the relevant screen

---

### Requirement: Action Item Checks on Login

The app MUST run action item checks for the following types on every successful
authentication: Signing Device Health Check, Secure Wallet Setup, Recovery Key
Health Check, Server Backup Failure, Signing Delay, and Policy Delay. These
checks MUST evaluate current app state and create or clear action items as
appropriate before the home screen is displayed.

#### Scenario: Action item checks run after authentication

- GIVEN the user has successfully entered their PIN or biometric
- WHEN the authentication saga completes
- THEN the app evaluates all required action item check types
- AND creates new action items for any conditions that are met
- AND removes stale action items whose conditions are no longer true

---

## Acceptance Criteria

- `UAI` remains internal only. User-facing copy uses notification/reminder/alert/action item.
- User-facing copy uses Wallet and Recovery Key, not Vault or Recovery Phrase.
- Backup notifications clearly identify backup type (Cloud Backup Failed, Wallet Configuration Backup Failed, Recovery Key Backup Incomplete).
- No subscription/tier notifications remain.
- No donation push notifications are added.
- Zendesk ticket notifications are not active (Concierge is deprecated).
- Transaction notifications support pending/unconfirmed and confirmed states.
- Health Check notifications use Wallet, Recovery Key, Server Key, and signer terminology.

---

## Non-Goals

- This spec does not cover the Concierge ticket creation or listing flow (Concierge is deprecated).
- This spec does not cover the Fee Insights screen content or fee data
  visualization; the `FEE_INISGHT` internal action item type is reserved but not yet implemented
  as an automated alert.
- This spec does not govern how health check completion is performed; that is
  covered by the `health-checks` domain spec.
- This spec does not cover backup initiation flows; only the failure alert surface
  is within scope.
- This spec does not cover in-app release announcements or app changelog content;
  only FCM topic subscription for release messages is referenced.
- This spec does not govern the signing delay mechanics, PSBT construction, or
  broadcast flow; only the alert surface for delay completion is within scope.
- This spec does not cover donation notifications. Donation prompts must be
  contextual, in-app, non-blocking, and located in Settings or post-success surfaces.
