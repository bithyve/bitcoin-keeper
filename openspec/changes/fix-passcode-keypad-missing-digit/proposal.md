## Why

The passcode keypad on the login screen intermittently renders with a missing digit, which blocks or delays passcode entry for returning users. This needs to be fixed now because the issue affects a core unlock flow on both mainnet and testnet environments.

## What Changes

- Stabilize the passcode keypad digit rendering on the login and passcode creation flows so all digits remain visible as soon as the keypad appears.
- Add focused validation around the keypad digit labels to guard against regressions in the shared keypad component.
- Keep the change limited to keypad presentation behavior without altering passcode verification, storage, or signer flows.

## Capabilities

### New Capabilities
- `passcode-keypad-rendering`: Ensures the shared passcode keypad consistently displays all numeric keys in authentication flows.

### Modified Capabilities
- None.

## Impact

- Affected code: `src/components/AppNumPad/*`, login/passcode screens that render the shared keypad, and focused tests covering keypad labels.
- APIs/dependencies: No external API or dependency changes.
- Hardware signer compatibility: No impact; this change only affects local passcode UI rendering.
- Subscription gating: No subscription tier impact.
- Security/privacy impact: No key material, storage, or network behavior changes; the update is limited to local UI rendering.

## Non-goals

- Changing passcode length, passcode validation, or biometric authentication behavior.
- Changing wallet, vault, signer, or network connectivity flows.
- Introducing new theming, navigation, or subscription behavior unrelated to keypad visibility.
