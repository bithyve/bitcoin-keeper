## Why

On the Passport setup QR scan flow, the segmented toggle for Singlesig/Multisig has poor contrast in light mode, making the inactive option hard to read. This creates setup confusion and increases the risk of users selecting the wrong derivation mode.

## What Changes

- Fix text contrast in the segmented control used during signer setup flows so inactive options remain legible.
- Keep selected-state styling and interaction behavior unchanged.
- Apply only focused UI styling updates without altering signing logic, derivation handling, or navigation.

## Capabilities

### New Capabilities
- `signer-setup-segment-visibility`: Ensure segmented options on signer setup screens are clearly readable in supported themes.

### Modified Capabilities
- None.

## Impact

- **Environments:** both mainnet and testnet (UI-only change).
- **Hardware signer compatibility:** affects setup UX for Passport and any signer flows that reuse the same segmented control; no protocol or key-handling changes.
- **Subscription tiers:** no tier gating impact.
- **Security/privacy impact:** no changes to key material handling, network calls, or storage; display-only improvement.

## Non-goals

- No changes to derivation path defaults (BIP84/BIP48) or signer setup business logic.
- No redesign of segmented layout, spacing, or animation behavior beyond readability fixes.
- No changes to unrelated setup screens.
