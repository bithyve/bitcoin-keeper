## Why

Bitcoin Keeper currently forces users to confirm their Recovery Key before accessing the app, creating a hard onboarding blocker. Making this step optional — while surfacing a clear risk warning for users who skip — reduces friction and increases activation, without compromising the security posture for users who choose to complete the backup.

## What Changes

- The mandatory Recovery Key confirmation gate is removed; the app is accessible without completing the backup flow.
- A new education bottom sheet is shown over the Wallets screen when the Recovery Key has not yet been confirmed, offering **Back Up Now** or **Skip for Now**.
- A new skip-warning bottom sheet is shown when the user taps **Skip for Now**, explaining the risks and offering **Back Up Recovery Key** or **Continue Without Backup**.
- The Recovery Key viewing screen (12-word grid) is updated to include an **I've Written It Down** action and a **Back** action, replacing any existing mandatory-flow navigation.
- A new confirmation bottom sheet prompts the user to enter one randomly selected word from their Recovery Key to verify they wrote it down; success marks the key as confirmed.
- Recovery Key status is tracked as one of: `generated`, `viewed`, `confirmed`, `skipped`.
- A non-blocking in-app reminder is shown to users who skipped, at defined trigger points (app update, hot-wallet creation, periodic).
- Users who have already confirmed their Recovery Key are not re-prompted.

## Capabilities

### New Capabilities

- `recovery-key-optional-flow`: Optional Recovery Key backup flow — education sheet, skip-warning sheet, viewing screen, word-confirmation sheet, post-skip reminder system, and Recovery Key status tracking.

### Modified Capabilities

<!-- No existing capability spec files exist; the current mandatory gate is removed as part of the new capability above. -->

## Impact

- `src/screens/` — New/updated screens for the education sheet, skip-warning sheet, viewing screen updates, and confirmation sheet.
- `src/store/` — New or updated Redux slice to track Recovery Key status (`generated | viewed | confirmed | skipped`); migration entry in `src/store/migrations.ts`.
- `src/navigation/Navigator.tsx` — Remove mandatory gate; replace with conditional bottom-sheet trigger on Wallets screen.
- `src/components/` — Reuse existing bottom-sheet, button, input, toast/snackbar, and word-grid components.
- **Environments**: Affects mainnet and testnet (the flow is environment-agnostic; Recovery Key is the same across both).
- **Hardware signers**: No impact — Recovery Key protects hot wallets and BHR backup data only; hardware signers retain their own seed phrases.
- **Subscription tiers**: No gating — Recovery Key backup is available to all users regardless of subscription tier.
- **Security/privacy**: Recovery Key material (12 words) is already stored securely via react-native-keychain / Realm. The confirmation flow reads the stored key to validate a single word; no new network calls or additional storage of the key is introduced.

## Non-goals

- Redesigning the Recovery Key generation step itself.
- Adding biometric or PIN-based re-authentication before viewing the Recovery Key (existing behaviour is preserved).
- Changing how the Recovery Key is encrypted or stored.
- Multi-language copy translation work (translations follow separately per existing i18n process).
- Removing reminder logic for users who have already confirmed (confirmed users are never re-prompted).
