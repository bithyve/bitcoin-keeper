## Why

Bitcoin Keeper currently blocks app usage until the Recovery Key is confirmed, which adds onboarding friction and causes drop-off before users can reach Wallets. We need to make confirmation optional while preserving strong backup guidance so users can continue safely and still understand the recovery risk.

## What Changes

- Add an optional Recovery Key education bottom sheet on Wallets when the Recovery Key is not confirmed, with explicit **Back Up Now** and **Skip for Now** actions.
- Add a skip warning bottom sheet that allows users to return to backup or continue without backup after acknowledging risk.
- Update the Recovery Key viewing + confirmation flow so only successful word verification marks the key as confirmed.
- Track Recovery Key progression state separately (`generated`, `viewed`, `confirmed`, `skipped`) so reminders can be shown later for skipped users without blocking app usage.
- Keep existing Keeper design language/components and approved copy across all new/updated screens.
- Environment scope: affects both mainnet and testnet onboarding flows.
- Hardware signer compatibility: no hardware signer protocol, PSBT, or signer communication changes.
- Subscription tier gating: no subscription-gated behavior changes.

## Non-goals

- Changing Recovery Key generation logic or mnemonic entropy.
- Changing vault/hot-wallet signing, PSBT flow, or hardware signer integrations.
- Introducing a new design framework, component library, or unrelated onboarding redesign.

## Capabilities

### New Capabilities
- `optional-recovery-key-backup-flow`: Allow users to proceed without confirming the Recovery Key, while preserving warning and reminder UX.

### Modified Capabilities
- None.

## Impact

- Affected areas: Recovery Key onboarding/backup screens in `src/screens/BackupWallet/`, confirmation modal behavior, wallet-entry reminder UI, and related localization copy.
- Storage/state impact: adds explicit Recovery Key backup status transitions and reminder trigger state handling in Redux/realm-backed app state.
- API/dependency impact: no new external APIs or dependencies.
- Security/privacy impact: key material remains local; confirmation validates user-entered word against existing local mnemonic index without exposing copy/export options; no new network calls for this flow.
