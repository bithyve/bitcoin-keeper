## Why

Users who switch to Testnet have no visible confirmation of the active network on core wallet surfaces, creating a risk of confusion — particularly at the point of receiving or sending, where a Testnet address or transaction could be mistaken for a Mainnet one. A lightweight, non-intrusive indicator on the screens where network mistakes matter most removes that ambiguity.

## What Changes

- **Wallets tab header** now shows `Wallets (Testnet)` when Testnet is active; reverts to `Wallets` on Mainnet.
- **Keys tab header** now shows `Keys (Testnet)` when Testnet is active; reverts to `Keys` on Mainnet.
- **Receive Bitcoin screen header** now shows `Receive Bitcoin (Testnet)` when Testnet is active.
- **Send Confirmation screen header** now shows `Send Confirmation (Testnet)` (existing title + ` (Testnet)`) when Testnet is active.
- The indicator is display-only: non-tappable, no new routes, no layout shift.
- No indicator is shown in Mainnet mode anywhere.

## Capabilities

### New Capabilities

- `testnet-indicator`: Inline `(Testnet)` suffix appended to the header title on the Wallets tab, Keys tab, Receive Bitcoin screen, and Send Confirmation screen when the global Network Type is Testnet.

### Modified Capabilities

- `settings`: The global Network Type setting already exists; this change adds a display side-effect driven by it. No requirement changes to how the setting is stored or toggled.

## Impact

- **Affected files**: `src/components/HomeScreenHeader.tsx`, `src/screens/Recieve/ReceiveScreen.tsx`, `src/screens/Send/SendConfirmation.tsx`
- **State**: Reads `state.settings.bitcoinNetworkType` via `useAppSelector` — no new state, no store shape changes, no migration needed.
- **No API or network calls added.**
- **No hardware signer compatibility implications.**
- **No subscription tier gating** — the indicator is visible to all users when Testnet is active.
- **Security/privacy**: Display-only change; no key material is accessed, stored, or transmitted.
- **Environments**: Testnet-only UI change (indicator shown only in Testnet mode).

## Non-Goals

- No Mainnet indicator.
- No tappable indicator or new network-switcher shortcut.
- No full-width banner or new visual system.
- No changes to the Network Type setting flow itself.
- No indicator on screens beyond the four listed above.
