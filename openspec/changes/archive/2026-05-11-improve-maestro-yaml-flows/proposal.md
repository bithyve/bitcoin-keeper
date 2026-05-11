## Why

The Maestro end-to-end flows under `flows/` are currently inconsistent in syntax quality, selector stability, and timing behavior, which causes flaky CI and weak confidence in critical wallet journeys. We need a focused reliability pass now so regressions in onboarding, access control, and Bitcoin transaction flows are caught earlier across both iOS and Android.

## What Changes

- Audit and fix all existing Maestro YAML files under `flows/` for valid syntax and stronger selectors/assertions.
- Refactor brittle direct steps into reusable wrappers using `runFlow` where it improves consistency.
- Improve cross-platform behavior by reducing Android-only assumptions and adding platform-aware conditionals where possible.
- Expand journey coverage under `flows/` for: onboarding/setup, passcode create/validate, login, wallet creation/view/settings, receive/copy address, send, buy bitcoin, app settings, backup/export seed, version history, subscription, key management, and refresh/health-check.
- Add negative-path coverage for invalid passcode confirmation, invalid/missing send inputs, cancellation/back navigation, and permission handling.
- Add a concise limitations note in `flows/` documenting what cannot be fully automated with Maestro alone.
- Change affects both mainnet and testnet environments (UI and navigation-level E2E behavior only; no network/business logic changes).
- No hardware signer protocol logic changes are introduced; compatibility is unchanged, with only UI-flow navigation checks where hardware-related screens are reachable.
- Subscription-related flow coverage will remain tier-aware and non-invasive (validate navigation/visibility behavior only, no backend subscription mutation).
- Security/privacy impact: no key material handling logic is modified; tests avoid exposing secrets in assertions and only automate existing UI interactions.

## Capabilities

### New Capabilities
- `maestro-flow-reliability-and-coverage`: Validate robust, cross-platform Maestro flow coverage for major wallet journeys and key negative paths under `flows/`.

### Modified Capabilities
- None.

## Non-goals

- Modifying production app code outside `flows/`.
- Changing Redux, Realm, networking, PSBT signing internals, or hardware protocol implementations.
- Building exhaustive backend/state validation beyond what UI-driven Maestro flows can reliably assert.

## Impact

- Affected area: `flows/` YAML test assets only.
- No API, dependency, storage schema, or application runtime behavior changes.
- Improves CI stability and E2E coverage confidence for wallet-critical user journeys.
