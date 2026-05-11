## 1. UI Components

- [ ] 1.1 Update the Home recovery-key modal to show risk copy, an acknowledgement checkbox, and a gated skip action.
- [ ] 1.2 Update the recovery-key confirmation screen to allow skipping back to Home without confirming backup.

## 2. Business Logic / Hooks

- [ ] 2.1 Keep skip behavior navigation-only so the recovery key remains pending until the existing confirm path completes.

## 3. Store (Slice + Saga)

- [ ] 3.1 Confirm no Redux slice, saga, or migration changes are needed because skip does not mutate backup state.

## 4. Storage

- [ ] 4.1 Confirm no Realm, MMKV, or keychain storage changes are needed for the skip flow.

## 5. Tests

- [ ] 5.1 Add or update focused tests covering the gated skip action and the recovery-screen skip path.
