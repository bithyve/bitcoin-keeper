# Maestro Flow Coverage Summary

## What Is Covered

### Happy-Path Flows
| Flow file | Scenario |
|---|---|
| `newapp.yaml` | Fresh-install onboarding + `setpin.yaml` |
| `setpin.yaml` | Create passcode, mismatch negative case inline, onboarding carousel |
| `setpin_mismatch.yaml` | Dedicated standalone passcode-mismatch negative test |
| `login.yaml` | Wrong-PIN case then correct login (combined) |
| `login_wrong_pin.yaml` | Dedicated wrong-PIN negative test → recover with correct PIN |
| `addwallet.yaml` | Create a new hot wallet with transfer policy |
| `addNewKey.yaml` | Add a mobile signing key via the Keeper flow |
| `viewwallet.yaml` | Open wallet, first-run modal dismiss, wallet action buttons |
| `walletSetting.yaml` | Navigate to wallet settings and back |
| `editwalletdetails.yaml` | Edit wallet name + description end-to-end |
| `editwallet.yaml` | Open wallet details sub-screen |
| `receive.yaml` | Open receive screen and navigate back |
| `receive_address_display.yaml` | Receive screen QR + copy address + success toast |
| `copywalletaddress.yaml` | Copy wallet address and verify success toast |
| `receivesats.yaml` | Receive test-sats via wallet settings (testnet) |
| `send.yaml` | Full send flow: address → amount → fee → passcode → broadcast |
| `buyBTC.yaml` | Buy Bitcoin entry flow |
| `refreshwallet.yaml` | Pull-to-refresh wallet transaction list |
| `appsettings.yaml` | App Settings screen assertions + dark-mode toggle + sub-flows |
| `appsettings_toggles.yaml` | Dark-mode toggle round-trip |
| `exportseed.yaml` | Backup → export recovery phrase with correct passcode |
| `versionhistory.yaml` | Version History screen assertions |
| `subscription.yaml` | Navigate to subscription / upgrade screen |
| `keySetting.yaml` | Open key settings |
| `healthCheckKey.yaml` | Run health check on a mobile key |
| `hidendeletekey.yaml` | Hide → show → delete a mobile key (passcode-verified) |
| `sanity.yaml` | Smoke: onboarding + wallet + key creation |
| `regression_full.yaml` | Full composed regression suite |

### Negative-Path Flows
| Flow file | Scenario |
|---|---|
| `setpin_mismatch.yaml` | Passcode mismatch error + clear + correct re-entry |
| `login_wrong_pin.yaml` | Wrong PIN → "Incorrect password" error → retry with correct PIN |
| `login.yaml` | Inline wrong-PIN case (1237) before successful login |
| `send_invalid_address.yaml` | Non-Bitcoin string → app should not advance to amount screen |
| `send_empty_amount.yaml` | Empty amount field → app should not advance to fee screen |
| `send_cancel.yaml` | Back/cancel at address-entry step → returns to wallet screen |
| `exportseed_wrong_pin.yaml` | Wrong PIN on seed-export passcode screen → recovery phrase not shown |
| `wallet_creation_cancel.yaml` | Cancel mid-wizard wallet creation → returns to home |

---

## What Remains Missing

The following app scenarios are **not yet covered** by any flow:

### Authentication / Security
- Biometric enable, disable, and deny flows
- Multiple consecutive wrong PINs and any lockout / cooldown behaviour
- Passcode reset / recovery via backup phrase

### Wallet Management
- Creating a 2-of-3 or 3-of-5 vault wallet
- Creating a Collaborative wallet
- Renaming an existing wallet (distinct from `editwalletdetails.yaml` which also changes description)
- Duplicate wallet name validation
- Switching between multiple wallets
- Wallet archival / deletion

### Send – Advanced
- QR-scan-based address entry (requires camera hardware)
- Fee selection variants (slow / medium / fast)
- Send-max flow
- Insufficient balance or dust-limit error state
- Wrong passcode at send confirmation
- Network / broadcast failure UX

### Buy Bitcoin
- Choosing a specific buy provider
- Completing a real buy order (requires external service)
- Handling buy-redirect in browser / webview

### Key Management
- Adding hardware signers (Coldcard, Ledger, Trezor, etc.)
- Health check failure states (key unavailable)
- Add-key cancellation at each wizard step

### App Settings – Deep
- Tor on / off toggle and connectivity validation
- Custom node settings entry and save
- Language and currency change and persistence
- FAQ, Terms, Privacy Policy webview navigation

### Backup / Recovery
- Import existing wallet via recovery phrase
- Backup verification quiz (if present)
- Cloud backup (Google Drive / iCloud) flows

### Notifications / Background
- Push notification permission request and denial
- App-relaunch state persistence

---

## What Cannot Be Reliably Automated with Maestro Alone

| Limitation | Reason |
|---|---|
| **Hardware signer interactions** | Coldcard, Ledger, Trezor require physical USB/NFC; no Maestro equivalent |
| **QR-code scanning** | Maestro cannot present a QR image to the device camera |
| **Real Bitcoin transactions** | Require funded testnet wallet, broadcast, and network confirmation |
| **External browser / app handoff** | Maestro cannot control a system browser or third-party app opened mid-flow |
| **OS biometric prompts** | Face ID / fingerprint dialogs cannot be interacted with in Maestro without additional tooling |
| **Camera / photo-library permission matrixes** | Full iOS permission variants (Ask Every Time, Only While Using, etc.) need XCUITest or Appium |
| **Deep OS-level permission flows on iOS** | iOS restricts programmatic interaction with system permission dialogs beyond a single grant/deny |
| **Network / backend simulation** | Simulating Electrum node downtime or API failures requires environment instrumentation |
| **Dynamic balance-dependent paths** | Tests that branch on wallet balance or UTXO count require controlled test-data setup |
| **Push notifications** | Cannot be triggered or dismissed reliably via Maestro alone |
| **App Store / Play Store in-app purchase** | Subscription purchase dialogs are system-owned and cannot be automated by Maestro |
| **Clipboard verification** | Reading the clipboard content after a copy action is not natively supported by Maestro |
