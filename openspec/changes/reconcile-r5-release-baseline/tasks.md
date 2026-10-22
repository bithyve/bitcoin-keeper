## 1. UI Components
- [ ] 1.1 Preserve existing components, confirmation/cancel/privacy and helper copy against released source.

## 2. Business Logic / Hooks
- [ ] 2.1 Capture and validate deletion origin before selection/confirmation, including A → B → A.

## 3. Store (Slice + Saga)
- [ ] 3.1 Carry original app/session on delete/archive actions; retain R4 workers/middleware unchanged.

## 4. Storage
- [ ] 4.1 Verify no schema/MMKV/store-shape change; no Redux Persist migration bump needed.

## 5. Tests
- [ ] 5.1 Add stale account/session/Realm confirmation and retained-card regressions, with failing controls.
- [ ] 5.2 Run frozen setup/patches, affected Jest/recovery/security/quality and baseline comparison.
- [ ] 5.3 Record exact baseline, R5-only diff, results and unresolved native/genuine gaps.

## 6. E2E Flows (Maestro)
- [ ] 6.1 Preserve login flow, document finite deletion/account-switch/native measurements.
- [ ] 6.2 Execute relevant IOS/ANDROID/HARDWARE scenarios when available; retain NOT RUN otherwise.
