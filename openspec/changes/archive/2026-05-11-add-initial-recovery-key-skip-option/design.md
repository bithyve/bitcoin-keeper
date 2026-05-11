## Context

The initial recovery-key reminder is shown from `src/screens/Home/HomeScreen.tsx` whenever the current Keeper app instance has not been marked as backed up. Today the modal only offers a continue path into `ViewRecoveryKeyScreen`, and `src/screens/BackupWallet/ViewRecoveryKeyScreen.tsx` only exits cleanly after the user completes the confirmation challenge and dispatches backup actions.

This feature adds a controlled deferral path for the software hot key onboarding flow. The solution must keep the existing backup-confirmation behavior intact, avoid mutating backup state on skip, and make the risk of skipping explicit to the user.

## Goals / Non-Goals

**Goals:**
- Add a skip action to the home recovery-key modal itself.
- Require explicit risk acknowledgement before the skip action is enabled.
- Let the user continue into Home or leave the recovery-key screen without dispatching backup confirmation actions.
- Keep the existing confirmed-backup path unchanged.

**Non-Goals:**
- Changing Redux slices, sagas, or backup persistence semantics.
- Adding Realm schema or MMKV storage keys.
- Modifying PSBT, hardware signer, Vault, or cloud backup behavior.

## Decisions

1. **Keep skip state ephemeral to the current modal interaction**
   - Rationale: the app already decides whether to show the reminder from `recoveryKeyBackedUpByAppId`; because a skipped backup must not be treated as confirmed, the flow should simply close or navigate home without updating account or BHR state.
   - Alternative considered: persist a separate “reminded” or “skipped” flag. Rejected because it changes product behavior beyond the request and would require store/storage changes plus migration work.

2. **Embed the risk checkbox inside the existing home modal content**
   - Rationale: `KeeperModal` already supports custom `Content` and a secondary action, so the least invasive implementation is to reuse that structure and gate the secondary “Skip” action on a checkbox acknowledgement.
   - Alternative considered: build a second confirmation modal after tapping skip. Rejected because the issue asks for the skip option in the home modal itself.

3. **Support skip from `ViewRecoveryKeyScreen` via navigation-only exit**
   - Rationale: users who continue into the recovery screen should still be able to back out safely without marking the recovery key as backed up. This keeps the “use the wallet without creating a hot key backup now” path consistent with the request.
   - Alternative considered: leave the recovery screen mandatory once opened. Rejected because it still traps the user after they choose to defer.

4. **Localize the new warning and acknowledgement copy**
   - Rationale: the modal already uses translation strings, so the new risk text and skip acknowledgement should live alongside existing home/backup translations.

Redux slice(s) / saga(s) involved: none changed. Existing `account` and `bhr` actions remain only on the confirm-backup path.

PSBT / hardware interaction: none.

Realm schema / MMKV additions: none.

Affected files:
- `src/screens/Home/HomeScreen.tsx`
- `src/screens/BackupWallet/ViewRecoveryKeyScreen.tsx`
- `src/context/Localization/language/en.json`
- `src/context/Localization/language/es.json`
- Focused tests covering the modal and skip behavior in the affected screen test area

Migration needed: none; `src/store/migrations.ts` is unchanged because store shape does not change.

## Risks / Trade-offs

- **[Risk]** Users may skip without understanding the consequence. → **Mitigation:** require a checkbox acknowledgement and show explicit warning copy in the modal before enabling skip.
- **[Risk]** Navigation changes could accidentally mark backup complete. → **Mitigation:** keep all backup-related dispatches only on the existing confirm path and use navigation-only exits for skip flows.
- **[Risk]** The reminder may continue to appear after skip, which could feel repetitive. → **Mitigation:** accept this as the correct behavior for now because the issue requests deferral, not dismissal of the backup requirement.
