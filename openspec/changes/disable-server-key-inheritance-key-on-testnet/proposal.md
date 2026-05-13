## Why

The dev instance for Signing Server (Server Key) has been terminated, making Server Key and the Enhanced Security vault features (Inheritance Key, Emergency Key, Wallet Timelock) non-functional on Testnet. Users on Testnet can currently tap into these flows and encounter broken or hanging API calls. These features are supported only on Mainnet and should be clearly disabled on Testnet.

## What Changes

- **Server Key card in `SigningDeviceList`** — disabled with subtext "Not available on Testnet." when `bitcoinNetworkType === NetworkType.TESTNET`.
- **Inheritance Key card in `EnhancedSecurityModal`** (`AddNewWallet.tsx`) — disabled with subtext "Not available on Testnet." on Testnet.
- **Emergency Key card in `EnhancedSecurityModal`** — disabled with subtext "Not available on Testnet." on Testnet.
- **Wallet Timelock card in `EnhancedSecurityModal`** — disabled with subtext "Not available on Testnet." on Testnet.
- **"Save Changes" button in `EnhancedSecurityModal`** — disabled when all three Enhanced Security options are disabled due to Testnet.
- **Inheritance Key CTA button in `AssistedKeys.tsx`** — disabled on Testnet (prevents navigating into Inheritance Key wallet creation flow).
- No changes to Mainnet behavior. No API call changes. No code removal.

## Non-Goals

- Do not change any Mainnet behavior for Server Key, Inheritance Key, Emergency Key, or Wallet Timelock.
- Do not remove any existing code paths for these features.
- Do not add a new Testnet Signing Server.
- Do not introduce new subscription or donation logic.
- Do not rename internal service identifiers (e.g., `POLICY_SERVER`).
- Do not add a warning bottom sheet or interstitial — disabled UI is sufficient.

## Capabilities

### New Capabilities

- `testnet-feature-gating`: Environment guard that disables Server Key, Inheritance Key, Emergency Key, and Wallet Timelock entry points when the app is operating on Testnet. Covers the Enhanced Security modal cards, the Server Key signer card, and the Inheritance Key CTA in the Inheritance Planning section.

### Modified Capabilities

<!-- None — no existing spec-level behavior is changing on Mainnet. -->

## Impact

- **`src/screens/Vault/SigningDeviceList.tsx`** — post-process `getDeviceStatus()` result for `SignerType.POLICY_SERVER` to force `disabled = true` on Testnet.
- **`src/screens/AddWalletScreen/AddNewWallet.tsx`** — `EnhancedSecurityModal`: add `isTestnet` guard to Inheritance Key, Emergency Key, and Wallet Timelock `Pressable` cards and to the "Save Changes" button.
- **`src/screens/InheritanceToolsAndTips/components/AssistedKeys.tsx`** — disable CTA `callback` on Testnet.
- **Environments affected**: Testnet only (both dev builds where `isDevMode()` is true, and production builds where the user has manually switched to Testnet in App Settings → Network Type).
- **Subscription gating**: None changed. The existing L3 gate in `EnhancedSecurityModal` is orthogonal; both guards apply independently.
- **Security/privacy**: No key material is handled. No new network calls. Blocking the entry points prevents calls to the terminated dev Signing Server endpoint.
