## 1. UI Components Layer (Flow Surface Audit)

- [ ] 1.1 Audit every existing YAML under `flows/` and fix invalid syntax, brittle selectors, and flaky timing patterns.
- [ ] 1.2 Normalize cross-platform UI interaction steps using platform-aware/conditional logic where Android-only assumptions exist.

## 2. Business Logic / Hooks Layer (Flow Composition)

- [ ] 2.1 Refactor repeated setup/login/navigation blocks into reusable wrapper flows invoked via `runFlow`.
- [ ] 2.2 Update existing journey flows to consume shared wrappers while preserving intent and concise assertions.

## 3. Store (Slice + Saga) Layer

- [ ] 3.1 Verify no Redux slice/saga behavior changes are required because this change is limited to Maestro flow YAML files.
- [ ] 3.2 Confirm no Redux Persist migration updates are needed (`src/store/migrations.ts` unchanged).

## 4. Storage Layer

- [ ] 4.1 Verify no Realm model changes are needed for this flow-only test improvement.
- [ ] 4.2 Verify no MMKV key additions/changes are required.

## 5. Tests (Maestro Coverage Expansion)

- [ ] 5.1 Add/extend flows for onboarding/setup, passcode creation/validation, login, wallet creation/viewing, and wallet settings/details editing.
- [ ] 5.2 Add/extend flows for receive, copy address, send, buy bitcoin, app settings, backup/export seed, version history, subscription, key management, and refresh/health-check.
- [ ] 5.3 Add negative-path flows for invalid passcode confirmation, invalid send input/missing address, cancellation/back navigation, and permission handling.
- [ ] 5.4 Add a `flows/` limitations note documenting coverage gaps that cannot be fully automated with Maestro alone.
