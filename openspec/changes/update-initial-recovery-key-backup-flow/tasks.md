## 1. UI Components

- [ ] 1.1 Update Recovery Key education/skip warning sheets to use required copy, actions, and Keeper bottom-sheet styling
- [ ] 1.2 Update Recovery Key viewing screen text, warning/info boxes, and CTA labels to match approved copy and behavior
- [ ] 1.3 Add confirmation sheet prompt/input/footer and success toast behavior with no separate success screen

## 2. Business Logic / Hooks

- [ ] 2.1 Wire flow transitions: education -> view -> confirm and education -> skip warning -> continue
- [ ] 2.2 Implement random recovery-word index selection and exact local-word validation with retry error state
- [ ] 2.3 Add non-blocking reminder entry point for skipped users with CTA back into backup flow

## 3. Store (Slice + Saga)

- [ ] 3.1 Extend account recovery-key tracking to support generated/viewed/confirmed/skipped states
- [ ] 3.2 Ensure confirmation updates `confirmed` only on correct validation and skip keeps status non-confirmed
- [ ] 3.3 Keep existing backup sagas compatible (no new network/hardware signer flow changes)

## 4. Storage

- [ ] 4.1 Add/update Redux Persist migration in `src/store/migrations.ts` for any account state shape change
- [ ] 4.2 Verify no Realm schema change is required for this flow update

## 5. Tests

- [ ] 5.1 Add/update focused tests for skip path, warning gate, and continue-without-backup behavior
- [ ] 5.2 Add/update focused tests for confirmation success/failure and state transitions
- [ ] 5.3 Run targeted lint/tests for touched files and verify updated UI flow with screenshot evidence
