## Why

On iOS, the Server Selection screen's header permanently overlaps the system status bar after switching from the Private Electrum tab back to the Public Server tab. This breaks the UI for any user who explores node configuration options, making the screen unusable without navigating away and back.

## What Changes

- Dismiss the keyboard when the user switches tabs in `NodeSelection.tsx` to prevent iOS keyboard-driven layout distortions from persisting.
- Replace `useSafeAreaInsets()` manual padding in `ScreenWrapper.tsx` iOS path with `SafeAreaView` from `react-native-safe-area-context` for robust, layout-pass–safe inset handling (matching the existing Android path).
- Reset scroll position when switching tabs so the `ScrollView` does not retain a shifted offset from the Private Electrum tab.

## Capabilities

### New Capabilities
<!-- None — this is a bug fix with no new user-facing capabilities -->

### Modified Capabilities
<!-- No spec-level requirement changes; this is an implementation-only fix -->

## Impact

- **Affected files**: `src/screens/AppSettings/Node/NodeSelection.tsx`, `src/components/ScreenWrapper.tsx`
- **Platform**: iOS only (Android path already uses `SafeAreaView`)
- **Network**: Mainnet and testnet (the Server Selection screen is shared)
- **Hardware signers**: Not affected
- **Subscription tiers**: Not gated — all users can access node settings
- **Security/privacy**: No key material handled; no network calls introduced
- **Non-goals**: Do not change layout behaviour on Android; do not alter existing screen padding values; do not refactor unrelated screens

## Non-goals

- Changing the visual spacing or padding values on any other screen
- Fixing unrelated layout issues on other tab-based screens
- Modifying the `TabBar` component itself
