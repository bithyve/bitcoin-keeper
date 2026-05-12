## Why

Users can initiate and broadcast send transactions from wallets that haven't fully synced, causing PSBT finalization to fail with cryptic low-level errors like "Can not finalize input #0" because the app tries to spend UTXOs that no longer exist. The wallet must prevent transaction creation until sync is complete and map any residual technical errors to clear user-facing messages.

## What Changes

- Add a sync-state guard in `AddSendAmount.tsx` that disables the Send/Next CTA and blocks Send Max when the selected wallet or vault is not fully synced.
- Block `handleSendMax`, `calculateSendMaxFee`, and `executeSendPhaseOne` paths when sync is incomplete.
- Add a secondary sync guard in `SendConfirmation.tsx` before PSBT construction/finalization begins.
- Map known PSBT/finalization errors caused by stale UTXOs (e.g. "Can not finalize input") to a user-safe sync message.
- Preserve raw technical errors in logs/Sentry for debugging.
- Add approved copy strings to the existing localization structure.

## Capabilities

### New Capabilities

- `wallet-sync-send-guard`: Sync safety checks across the send flow (amount entry, Send Max, confirmation) and error mapping for low-level PSBT/finalization failures caused by unsynced wallet state.

### Modified Capabilities

<!-- No existing specs have requirement changes. -->

## Impact

- **Screens**: `src/screens/Send/AddSendAmount.tsx`, `src/screens/Send/SendConfirmation.tsx`
- **Sagas**: `src/store/sagas/send_and_receive.ts`
- **Services**: `src/services/wallets/operations/index.ts` (error mapping only)
- **Localization**: existing translations/error key namespace
- **Tests**: `tests/` — new unit tests for blocked and unblocked send paths
- **Environments**: Mainnet and testnet (sync guard applies to both)
- **Hardware signers**: No compatibility changes; the guard fires before PSBT construction, so signer flows are unaffected
- **Subscription tiers**: No gating; sync safety applies to all tiers
- **Security/privacy**: No key material handling changes; no new network calls; no new storage fields
- **Non-goals**: No changes to transaction construction logic, fee calculation, wallet balance display, signing server, Electrum behaviour, or coin selection rules beyond what is required to enforce sync safety
