## Why

Bitcoin Keeper currently lacks broad Maestro journey coverage for critical app paths, which increases regression risk for release candidates. We need a small, maintainable set of flow tests that cover core user navigation and key wallet actions end-to-end.

## What Changes

- Add new Maestro flow YAMLs under `flows/` for core journeys: onboarding/setup, wallet viewing, receive, send, settings, and key-management.
- Add a composed smoke/regression flow that runs these journey flows in sequence using `runFlow`.
- Keep selectors and assertions aligned with existing in-repo Maestro conventions (screen IDs/text assertions and `appId` header usage).
- Limit scope to flow coverage additions only; no production app logic changes.
- Environment impact: applies to both mainnet and testnet UI journeys (flow-level navigation coverage is network-agnostic unless explicitly gated by screen text).
- Hardware signer compatibility impact: no protocol behavior changes; key-management checks validate UI accessibility only and do not alter PSBT/hardware integrations.
- Subscription tier gating impact: no subscription logic changes; flows should tolerate tier-gated surfaces by asserting stable, non-premium entry points where possible.

## Capabilities

### New Capabilities
- `maestro-core-journey-flows`: Defines baseline Maestro test coverage for essential Bitcoin Keeper journeys through composable YAML flows.

### Modified Capabilities
- None.

## Impact

- Affected area: `flows/` Maestro test assets only.
- APIs/dependencies: no new runtime dependencies, no API contract changes.
- Systems: improves CI/manual QA confidence for onboarding, wallet navigation, send/receive, settings, and key-management paths.

## Non-goals

- Changing app feature behavior, navigation structure, or component IDs.
- Adding deep negative-path matrixes for every device/network scenario.
- Automating external hardware signer interactions beyond existing UI-access checks.

## Security & Privacy Impact

- No new key material is created, exported, or stored by this change.
- No new network calls are introduced; flows only exercise existing UI paths.
- No storage schema or secret-handling logic is modified.
