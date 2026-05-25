## Why

On the Server Settings screen (`NodeSettings.tsx`), the `WarningNote` informational message (shown when no server is connected) is rendered in a fixed footer container that visually overlaps the last item in the scrollable server list, obscuring the Delete and Connect action buttons. This is a layout bug that degrades readability and usability.

## What Changes

- Move the `WarningNote` component out of the fixed `footerContainer` and into the `FlatList`'s `ListFooterComponent` prop so it scrolls with the list and appears below the last server item.
- The `Buttons` component (Add New Node) remains in the fixed footer, always visible at the bottom.
- Remove the now-unnecessary `WarningNote` from the static footer rendering path.

## Capabilities

### New Capabilities

<!-- None introduced — this is a pure bug fix. -->

### Modified Capabilities

<!-- No spec-level requirement changes. The Server Settings screen already has defined behavior; this fixes a visual layout defect only. -->

## Impact

- **File**: `src/screens/AppSettings/Node/NodeSettings.tsx`
- **Scope**: UI layout only — no state, logic, navigation, or API changes
- **Environments**: Affects both mainnet and testnet (the Server Settings screen is environment-agnostic)
- **Hardware signers**: No impact
- **Subscription tiers**: No gating — available to all users
- **Security/Privacy**: No impact — no key material, network calls, or storage involved

## Non-goals

- Redesigning the Server Settings screen beyond fixing the overlap
- Changing the WarningNote content or the conditions under which it appears
- Modifying the `ServerItem` component
- Adding animations or transitions
