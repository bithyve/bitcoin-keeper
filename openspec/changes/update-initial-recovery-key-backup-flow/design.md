## Context

The current initial Recovery Key backup flow blocks normal Wallets usage until the user completes seed-word confirmation. Product now requires a non-blocking approach: educate users, allow skip after explicit warning, and only mark confirmation complete after correct word verification.

Current implementation lives primarily in Recovery Key backup screens and account-level backup flags. The flow must keep Keeper visual language and existing reusable components (bottom sheets, warning boxes, seed grid, buttons, input, toast).

## Goals / Non-Goals

**Goals:**
- Make initial Recovery Key confirmation optional without bypassing risk disclosure.
- Add a warning gate before users can continue without backup.
- Keep Recovery Key status progression explicit (`generated`, `viewed`, `confirmed`, `skipped`) so reminders can be shown later.
- Preserve existing local-only key handling and word-confirmation validation.

**Non-Goals:**
- Changes to wallet/vault signing, PSBT flow, hardware signer communication, or backend APIs.
- New external dependencies, new design systems, or global onboarding redesign.

## Decisions

1. **Use existing backup screen stack + KeeperModal/ModalWrapper for new sheets**
   - **Why:** Minimizes code change and preserves existing Keeper UI behavior/theme.
   - **Alternative considered:** Add new standalone navigator route for each sheet. Rejected to avoid unnecessary route complexity.

2. **Track status in account Redux slice with a new recovery-key status enum-like field**
   - **Why:** Persisted state can differentiate viewed vs confirmed vs skipped and suppress repeated blocking prompts.
   - **Alternative considered:** Infer from existing boolean `isRecoveryKeyBackedUp`. Rejected because boolean cannot represent skipped/viewed.
   - **Redux slices/sagas involved:** `src/store/reducers/account.ts` (new status transitions), existing backup sagas unchanged.

3. **Validate confirmation by random index against existing mnemonic in local Realm KeeperApp**
   - **Why:** Meets requirement to verify actual key material without generating random word text.
   - **Alternative considered:** fixed index prompt. Rejected due weaker verification.
   - **PSBT/hardware data flow:** none; no signer or PSBT interaction.

4. **Show non-blocking reminder UI on Wallets for skipped status**
   - **Why:** Enforces encouragement requirement without blocking app entry.
   - **Alternative considered:** modal-only periodic interruption. Rejected due friction.

5. **Persisted store migration update if account state shape changes**
   - **Why:** Redux Persist compatibility for existing users.

### Affected Files (planned)

- `src/screens/BackupWallet/ViewRecoveryKeyScreen.tsx`
- `src/screens/Wallets/` (wallet entry reminder/banner/sheet trigger)
- `src/components/SeedWordBackup/ConfirmSeedWord.tsx` (if prompt/error copy and flow wiring require)
- `src/store/reducers/account.ts`
- `src/store/migrations.ts` (if recovery key status persisted shape changes)
- `src/localization/*` files for exact copy updates
- Related Jest tests under `src/screens/**/__tests__/` and/or `src/store/**/__tests__/`

## Risks / Trade-offs

- **[Risk]** Users skip backup and remain unprotected longer → **Mitigation:** warning sheet + non-blocking reminders + Settings entry point copy.
- **[Risk]** Incorrect persisted-state migration could reset backup flags → **Mitigation:** add migration entry with backward-safe defaults.
- **[Risk]** UI regressions across onboarding and Wallets overlays → **Mitigation:** reuse existing components/styles and add focused tests.

## Migration Plan

1. Add/extend account recovery key status field with backward-compatible default (`generated` or existing mapped value).
2. Bump Redux Persist migration version in `src/store/migrations.ts` if account shape changes.
3. Deploy UI flow update using existing navigation entry points.
4. Rollback strategy: revert new status field usage and map to prior boolean backup behavior.

## Open Questions

- Which exact Wallets surface currently hosts the initial backup blocker so the new education sheet can replace it with minimal churn?
- Should reminder trigger timing be strictly immediate post-skip for this change, with periodic trigger hooks left for follow-up?
