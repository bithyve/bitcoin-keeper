## Why

The Server Settings screen can place the offline warning note on top of the last saved Electrum server card when the list grows, which makes the Delete and Connect actions hard to read and use. This needs to be fixed now so saved server management remains readable and tappable on both mainnet and testnet screens.

## What Changes

- Keep the saved server warning content visually separated from server cards when no Electrum server is connected
- Update the Server Settings layout so the warning note flows after the list content instead of overlapping list actions
- Add focused validation for the Server Settings warning placement if practical within the existing Jest setup

## Capabilities

### New Capabilities
- `server-settings-layout`: Defines how the Server Settings screen lays out saved Electrum servers and offline guidance without overlapping actionable controls

### Modified Capabilities

- None

## Impact

- Affects both mainnet and testnet server settings flows
- No hardware signer compatibility impact
- No subscription tier gating impact
- Security/privacy impact is unchanged because this is a presentation-only change with no new key, storage, or network handling

## Non-goals

- Changing Electrum connection logic or saved server persistence
- Redesigning the Server Settings screen beyond the overlap fix
- Adding new node management capabilities or copy changes unrelated to spacing
