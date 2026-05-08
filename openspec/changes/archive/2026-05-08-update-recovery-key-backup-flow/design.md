## Context

Bitcoin Keeper shows a `KeeperModal` on the Home screen when `recoveryKeyBackedUpByAppId[appId]` is falsy. The modal is currently non-dismissable (`close={() => {}}`): tapping the primary button navigates via `CommonActions.reset` to `ViewRecoveryKeyScreen`, fully replacing the stack and blocking the user from accessing the rest of the app.

The `ViewRecoveryKeyScreen` already handles 12-word display, masked/unmasked toggling, word-confirmation (`ConfirmSeedWord`), and dispatches `setRecoveryKeyBackedUp` + `backupAllSignersAndVaults` / `seedBackedUp` saga actions on success.

State lives in `src/store/reducers/account.ts` as `recoveryKeyBackedUpByAppId: { [appId: string]: Boolean }`.

## Goals / Non-Goals

**Goals:**
- Allow users to skip Recovery Key confirmation and still access the app.
- Introduce a graduated, 4-screen flow: education sheet → (Back Up Now path) viewing screen → confirmation sheet → success toast; or (Skip path) skip-warning sheet → dismiss to app.
- Track Recovery Key status with four states: `generated | viewed | confirmed | skipped`.
- Show non-blocking in-app reminders to users who skipped.
- Reuse all existing UI components (KeeperModal / ModalWrapper, Buttons, ConfirmSeedWord, toast/snackbar, word-grid).

**Non-Goals:**
- Changing how the Recovery Key is generated, stored, or encrypted.
- Adding biometric/PIN re-authentication before viewing.
- Multi-language copy translation work.
- Redesigning the Settings-based Recovery Key backup path.

## Decisions

### Decision 1 — Extend `recoveryKeyBackedUpByAppId` to a richer status type

**Options considered:**
- **A (chosen)**: Change `recoveryKeyBackedUpByAppId[appId]` from `Boolean` to `RecoveryKeyStatus ('generated' | 'viewed' | 'confirmed' | 'skipped')`. Add a `recoveryKeyStatusByAppId` alias. Keep backward-compatible migration: existing `true` values → `confirmed`; `false` / missing → `generated`.
- **B**: Add a separate `recoveryKeyStatusByAppId` key alongside the existing Boolean field. Avoids migration but doubles the state surface.

**Rationale:** Option A keeps a single source of truth and requires one clean migration. Option B risks the two fields drifting out of sync.

**Affected files:**
- `src/store/reducers/account.ts` — type change + new selector helper
- `src/store/migrations.ts` — new migration version bumping the store

### Decision 2 — Education sheet as a dismissable bottom sheet on the Wallets screen

**Options considered:**
- **A (chosen)**: Show `KeeperModal` (already used for this purpose) with `close` wired to the skip path. No navigation reset; the Wallets screen stays mounted behind the sheet.
- **B**: Navigate to a dedicated full-screen onboarding route. Simpler routing, but more disruptive.

**Rationale:** The design spec explicitly requires bottom sheets over a dimmed Wallets screen. Option A reuses the existing modal system without adding navigation complexity.

### Decision 3 — Skip-warning and confirmation sheets as separate local state modals

Rather than adding navigation routes for every intermediate sheet, drive all four states (`idle`, `educationVisible`, `skipWarningVisible`, `confirmationVisible`) through a single `recoveryKeyFlowState` local state enum in `HomeScreen`. Each sheet is a `KeeperModal` or `ModalWrapper` toggled by this state.

**Affected files:**
- `src/screens/Home/HomeScreen.tsx` — flow state machine + four modal stanzas

### Decision 4 — Word-confirmation logic stays in `ConfirmSeedWord` + random index

`ConfirmSeedWord` already handles input and validation against a supplied word. We add a `randomIndex` computed once per session (`Math.floor(Math.random() * 12)`) and pass `words[randomIndex]` + `randomIndex` as props to the confirmation sheet. No backend call or new cryptographic logic is needed.

**Affected files:**
- `src/screens/Home/HomeScreen.tsx` or extracted hook `useRecoveryKeyFlow.ts`

### Decision 5 — Non-blocking reminder banner / nudge

Add a small banner component (`RecoveryKeyReminderBanner`) to the Wallets tab header area, shown when status is `skipped`. It displays "Recovery Key not backed up · Back Up Now" and triggers the education sheet. This is the minimum viable reminder without a complex notification scheduling system.

**Reminder trigger moments wired in this change:** Wallets screen mount (when status is `skipped`). Future triggers (app update, hot-wallet creation) are deferred but the status field supports them.

**Affected files:**
- `src/screens/Home/HomeScreen.tsx` — conditional banner
- `src/components/RecoveryKeyReminderBanner.tsx` — new lightweight component

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Migration bug leaves users in wrong status | Unit-test the migration function; keep backward-compat default to `generated` for any unrecognised value |
| User skips, loses funds, blames Keeper | Warning copy matches approved spec; "Continue Without Backup" is the secondary (not primary) action; the warning sheet is not bypassable without seeing risk text |
| `ConfirmSeedWord` receives wrong word index | Snapshot test the confirmation sheet with a mocked word list |
| Multiple rapid taps open duplicate modals | Guard flow state transitions with a `transitioning` flag or `useRef` debounce |

## Migration Plan

1. Bump Redux Persist store version in `src/store/migrations.ts`.
2. Migration function: for each app in `recoveryKeyBackedUpByAppId`, map `true → 'confirmed'`, `false / missing → 'generated'`.
3. New key name in state: `recoveryKeyStatusByAppId` (the `recoveryKeyBackedUpByAppId` key is retained as a computed backward-compat selector returning a Boolean for any code not yet migrated).
4. Existing `setRecoveryKeyBackedUp` action updated to accept `RecoveryKeyStatus`; callers updated.
5. No rollback risk — if migration fails, default status `'generated'` shows the education sheet, which is safe.

## Open Questions

- Should the education sheet re-appear on every cold launch while status is `skipped`, or only once per session? (Spec says "show reminder later" — suggest once per app session via `useRef` session flag.) Ans: No need to show on every cold launch, it should be visible on only first launch 
- Does "after app updates" trigger require reading the last-seen app version from storage? (Deferred — not in scope of this change.)
