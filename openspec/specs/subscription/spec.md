# Subscription Specification

## Purpose

Subscription owns the tier-based feature-gating model that governs which capabilities are available to a user. It covers plan discovery, in-app purchase via the platform store, receipt verification with the BitHyve backend, discount code redemption, purchase restoration, subscription interval management (monthly vs. yearly), desktop-purchase management via a QR channel, and tier downgrade handling when a subscription lapses.

---

## Requirements

### Requirement: Subscription Tiers

The app MUST recognize exactly four subscription tiers in ascending order: Pleb (L1, free), Hodler (L2), Diamond Hands (L3), and Keeper Private (L4). Each tier MUST be associated with a numeric level (1–4) that the backend returns and that the app persists locally.

#### Scenario: App correctly identifies user's current tier on launch

- GIVEN the user has an active Hodler subscription verified with the backend
- WHEN the user completes authentication and the home screen loads
- THEN the app reflects Hodler (L2) as the active tier for all feature-gate checks
- AND features gated at L3 and above are not accessible

#### Scenario: App defaults to Pleb tier when no subscription exists

- GIVEN the app has just been installed and no purchase record exists
- WHEN the user completes app setup
- THEN the app sets the tier to Pleb (L1, free)
- AND all L2-and-above features display an upgrade indicator rather than the full feature

---

### Requirement: Plan Display

The app MUST present all four subscription tiers on the plan selection screen, including each tier's name, level label, feature list (benefits), and pricing for monthly and yearly billing intervals. Pricing MUST be fetched from the BitHyve backend and from the platform's native subscription catalog; the app MUST indicate when store billing is unavailable.

#### Scenario: Plans load successfully

- GIVEN the user navigates to the Choose Plan screen
- WHEN the plan list finishes loading
- THEN each tier is displayed with its title, subtitle, description, and pricing for the selected billing interval
- AND the currently active plan is marked as "Current Plan" and its selection button is disabled

#### Scenario: Store billing is unavailable (e.g., Android Play billing unavailable)

- GIVEN the device cannot reach the platform billing service
- WHEN the plan screen attempts to load pricing
- THEN the app shows a toast message indicating the billing service is unavailable
- AND the plan list is still displayed without pricing, so the user can see tier features

#### Scenario: Plan details fetch fails entirely

- GIVEN the backend or store returns an unrecoverable error during plan loading
- WHEN the fetch completes with that error
- THEN the app displays an error toast
- AND navigates the user back to the previous screen

---

### Requirement: Billing Interval Selection

For paid tiers, the app MUST allow the user to switch between monthly and yearly billing intervals before initiating a purchase. The app MUST surface any free trial period available for a given plan and interval combination. Yearly subscriptions MUST display the per-month equivalent cost so the user can compare intervals.

#### Scenario: User selects yearly interval and sees trial period

- GIVEN the user is on the plan screen viewing a paid tier with a yearly trial offer
- WHEN the user selects the yearly billing toggle
- THEN the plan card shows the yearly price and the trial period label (e.g., "1 month free")
- AND the "Get Started" button initiates a yearly subscription purchase

#### Scenario: User switches from yearly to monthly interval

- GIVEN the user currently has a yearly subscription
- WHEN the user selects a plan at the monthly interval and proceeds
- THEN the app presents a confirmation dialog warning that switching to monthly removes the yearly benefit (2 free months)
- AND the downgrade completes only after the user confirms

---

### Requirement: In-App Purchase

The app MUST process subscription purchases through the platform's native IAP mechanism (App Store on iOS, Google Play on Android). The app MUST pass any existing purchase token (Android) or product ID (iOS) when upgrading or changing intervals so the platform can apply the correct proration. The app MUST listen to purchase update events and hand each receipt to the backend for verification before activating the new tier.

#### Scenario: Successful new subscription purchase

- GIVEN the user is on Pleb (L1) and selects Hodler (L2) monthly
- WHEN the user confirms the purchase in the platform purchase dialog
- THEN the app receives a purchase receipt from the platform
- AND sends the receipt to the backend for verification
- AND upon backend confirmation, updates the local tier to Hodler (L2)
- AND displays a "Upgrade Successful" confirmation modal

#### Scenario: IAP purchase error

- GIVEN the user initiates a purchase
- WHEN the platform IAP returns an error (e.g., payment declined)
- THEN the app stops the requesting state without updating the local tier
- AND shows an error indication so the user can retry

#### Scenario: User upgrades from Hodler to Diamond Hands

- GIVEN the user is on Hodler (L2) monthly
- WHEN the user selects Diamond Hands (L3) and confirms
- THEN the app initiates the upgrade using the existing purchase token
- AND after backend confirmation, updates the local tier to Diamond Hands (L3)
- AND shows an "Upgrade Successful" confirmation modal

---

### Requirement: Receipt Verification

The app MUST verify each platform purchase receipt with the BitHyve backend before activating the corresponding tier. The backend MUST return the authorized tier level, which the app uses as the authoritative source. The app MUST NOT activate a new tier based solely on a local receipt without backend confirmation.

#### Scenario: Backend confirms receipt and grants tier

- GIVEN the user has completed a purchase and the app has the transaction receipt
- WHEN the app sends the receipt to the backend
- THEN the backend responds with `updated: true` and the authorized level
- AND the app persists the new subscription level and tier name locally

#### Scenario: Backend rejects or reports an error for the receipt

- GIVEN the user has completed a purchase
- WHEN the backend returns an error (e.g., `updated: false` with an error message)
- THEN the app displays the backend error message to the user
- AND does not change the locally stored tier

---

### Requirement: Purchase Restoration

The app MUST allow users to restore a previously purchased subscription in case they reinstall the app or switch devices. The restoration flow MUST query the platform for available past purchases and match them against valid product IDs. If no platform purchases are found, the app MUST also query the BitHyve backend for a prior desktop-purchased subscription that can be restored.

#### Scenario: Platform purchase restored successfully

- GIVEN the user reinstalls the app on the same device or a new device
- WHEN the user triggers the "Restore Purchases" flow
- THEN the app queries the platform for past purchases
- AND finds a matching valid purchase
- AND sends it to the backend for verification
- AND restores the associated tier upon backend confirmation

#### Scenario: No purchases available to restore

- GIVEN the user triggers restore and the platform returns no past purchases
- WHEN the backend also confirms no restorable desktop purchase exists
- THEN the app shows a message indicating no available purchases were found
- AND the tier remains at Pleb (L1)

#### Scenario: Legacy product ID restored

- GIVEN the user has a subscription purchased under an old product ID format
- WHEN that purchase is found during restoration
- THEN the app maps the legacy product ID to the corresponding current monthly product ID
- AND sends the mapped purchase to the backend for verification
- AND restores the tier if confirmed

---

### Requirement: Desktop Subscription Management

The app MUST support purchasing or renewing a subscription initiated on the Bitcoin Keeper desktop application via a secure QR-channel handshake. A "Desktop Subscription Management" entry point MUST be shown on the plan screen when the user is either on Pleb (L1) or has an existing desktop purchase approaching its renewal window. Selecting this entry point opens a QR scanner that links the mobile app to the desktop session and activates the tier once the desktop purchase is confirmed by the backend.

#### Scenario: Desktop subscription purchase confirmed via QR channel

- GIVEN the user is on the Desktop Subscription Management screen and has scanned the desktop app QR
- WHEN the desktop app completes the purchase and the channel message is received
- THEN the app verifies the receipt with the backend
- AND activates the new tier locally upon confirmation
- AND displays the tier change confirmation modal

#### Scenario: Desktop channel reports an error

- GIVEN the user has connected the mobile app to the desktop session via QR
- WHEN the desktop purchase fails and the channel reports an error
- THEN the app displays the error message
- AND navigates the user back to the plan screen without changing the tier

---

### Requirement: Keeper Private Tier Contact Flow

The Keeper Private (L4) tier MUST NOT have a standard IAP purchase button. Instead, the plan screen MUST display a "Get in Touch" action for Keeper Private, which routes the user to a contact or inquiry flow rather than initiating an in-app purchase.

#### Scenario: User selects Keeper Private tier

- GIVEN the user is on the plan screen and selects Keeper Private (L4)
- WHEN the user taps the action button for Keeper Private
- THEN the app presents a "Get in Touch" option instead of a purchase dialog
- AND does not initiate any platform IAP flow

#### Scenario: Active Keeper Private subscription shows expiry date

- GIVEN the user has an active Keeper Private (L4) subscription
- WHEN the user views the plan screen
- THEN the plan card for Keeper Private displays the subscription expiry month and year

---

### Requirement: Discount Codes

The app MUST provide a Discount Codes screen that lists available discount offers. Each offer MUST display a partner name, discount percentage, and a copyable discount code. Tapping an offer MUST open a detail modal showing the full description and a link to the partner's purchase page. The app MUST allow the user to copy the discount code to the clipboard.

#### Scenario: User copies a discount code

- GIVEN the user is on the Discount Codes screen and taps a listed offer
- WHEN the detail modal opens
- THEN the modal shows the discount percentage, description, and the discount code
- AND a copy action is available that copies the code to the clipboard

---

### Requirement: Feature Gating

The app MUST restrict access to certain features based on the user's active subscription tier. Accessing a gated feature while on an insufficient tier MUST surface a visible upgrade indicator or upgrade prompt rather than silently failing or hiding the feature entirely. Gated features by tier are:

- **L2 (Hodler) and above:** cloud backup (personal cloud backup and assisted server backup), canary wallet setup
- **L3 (Diamond Hands) and above:** multi-sig vault schemes up to 3-of-5, advanced signer features
- **L4 (Keeper Private):** exclusive visual theme and white-glove support features

The maximum vault quorum scheme allowed per tier is: L1 → 1-of-1, L2 → 2-of-3, L3 → 3-of-5.

#### Scenario: Pleb user attempts to enable cloud backup

- GIVEN the user is on Pleb (L1) and navigates to Backup & Recovery settings
- WHEN the cloud backup or assisted server backup option is visible
- THEN the option shows an upgrade indicator icon instead of the active toggle
- AND tapping the option does not enable the feature

#### Scenario: Pleb user attempts to create a 2-of-3 vault

- GIVEN the user is on Pleb (L1)
- WHEN the user tries to create a multi-sig vault requiring more signing keys than L1 allows
- THEN the app restricts key selection to the L1 quorum scheme (1-of-1)
- AND indicates to the user that higher quorum vaults require an upgraded tier

#### Scenario: L4 user sees Keeper Private theme

- GIVEN the user holds an active Keeper Private (L4) subscription
- WHEN the user toggles the app theme
- THEN the Keeper Private visual theme is applied instead of the standard light or dark theme

---

### Requirement: Tier Upgrade Modal

Completing a subscription change (upgrade, downgrade, or billing interval change) MUST display a confirmation modal that communicates the outcome. The modal MUST use distinct visual treatment for upgrades versus downgrades and MUST describe the change in plain language.

#### Scenario: Upgrade modal shown after successful tier upgrade

- GIVEN the user has successfully upgraded from Pleb (L1) to Hodler (L2)
- WHEN the backend confirms the new level
- THEN an "Upgrade Successful" modal appears with a message confirming the new tier name
- AND a single "Okay" button dismisses the modal

#### Scenario: Downgrade modal shown after tier reduction

- GIVEN the user has successfully downgraded from Diamond Hands (L3) to Hodler (L2)
- WHEN the backend confirms the new level
- THEN a "Downgrade Successful" modal appears with a message confirming the new tier name
- AND the modal uses a downgrade illustration to visually distinguish it from an upgrade

#### Scenario: Billing interval change confirmed

- GIVEN the user switches an existing paid subscription from yearly to monthly
- WHEN the backend confirms the same level but a different interval
- THEN a "Payment Interval Changed Successfully" modal appears
- AND describes the flexibility benefit of monthly billing

---

### Requirement: Tier Downgrade on Subscription Lapse

If the app cannot verify an active paid subscription (due to lapse or network failure at login), the app MUST fall back to Pleb (L1) behavior so that gated features become inaccessible. The app MUST preserve all existing vault and wallet data when a downgrade occurs. If the downgrade occurred only because the device was offline during verification, the app MUST restore the previously active tier once the backend can be reached again.

#### Scenario: Subscription lapses and features become restricted

- GIVEN the user previously held a Hodler (L2) subscription
- WHEN that subscription expires and the backend no longer authorizes the tier
- THEN the app updates the local tier to Pleb (L1)
- AND cloud backup and canary wallet options display upgrade indicators
- AND existing vault and wallet data remains intact and accessible

#### Scenario: Temporary offline downgrade is recovered on next login

- GIVEN the app could not reach the backend during login and temporarily set the tier to Pleb
- WHEN the user next logs in with network connectivity
- THEN the app re-verifies the subscription with the backend
- AND restores the previously authorized tier if the subscription is still valid

---

### Requirement: Subscription Management via Platform Portal

For users with a non-desktop active subscription, the app MUST provide a way to open the platform subscription management portal (App Store or Google Play) so the user can cancel, pause, or update their subscription outside the app.

#### Scenario: User opens platform subscription management

- GIVEN the user has an active non-desktop subscription and is on the plan screen
- WHEN a conflict arises (e.g., the backend rejects a downgrade attempt)
- THEN the app presents a "Manage" option that opens the platform's subscription management page in the system browser

---

## Non-Goals

- This spec does not define pricing values, SKU naming, or the backend business logic for receipt validation.
- This spec does not cover promotional campaigns, referral programs, or affiliate codes beyond the existing Discount Codes screen.
- This spec does not describe the content of feature-specific upgrade prompts in domains such as vault, signing-devices, or backup-and-recovery — those domains specify their own upgrade entry points; this spec only defines the subscription state model and the plan management screens.
- This spec does not cover enterprise or organizational billing; only individual in-app and desktop subscriptions are in scope.
- This spec does not define what happens to active PSBT signing sessions or in-flight transactions if a downgrade occurs mid-flow.
