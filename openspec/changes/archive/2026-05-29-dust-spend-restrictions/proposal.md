## Why

Do Not Spend UTXOs (classified by #6970) are currently still included in automatic coin selection and the available balance shown to users during sends, meaning privacy-sensitive coins could be spent silently without user awareness. This change enforces the spend restriction promise: Do Not Spend coins are never used automatically, balances shown to users reflect only spendable coins, and users receive an explicit warning before manually choosing a Do Not Spend coin.

## What Changes

- **Automatic coin selection filter**: Both `prepareTransactionPrerequisites` and `calculateSendMaxFee` in `src/services/wallets/operations/index.ts` filter out UTXOs with `spendability === 'doNotSpend'` when no manually selected UTXOs are provided.
- **Spendable balance display**: The available balance shown in the send flow (`AddSendAmount`) is computed from the UTXO arrays filtered to exclude Do Not Spend coins, rather than from the pre-computed `specs.balances` sum.
- **Insufficient spendable balance warning**: When total wallet balance is sufficient but spendable balance is not, an inline helper message — "Some coins are marked Do Not Spend and are not available for this payment." — and a **View Coins** button are displayed in the send flow.
- **Manual coin selection warning**: In the Manage Coins selection flow (`UTXOList`), tapping a Do Not Spend UTXO triggers a warning bottom sheet ("Use Do Not Spend Coin?") before the coin is added to the manual selection.
- **i18n**: New copy strings added to `en.json`.

## Capabilities

### New Capabilities

- `dust-spend-restrictions`: Enforces Do Not Spend status during the send flow — automatic coin selection exclusion, spendable balance calculation, insufficient-spendable-balance warning, and manual selection warning modal.

### Modified Capabilities

- `send-and-receive`: Insufficient balance scenario gains a new sub-case (enough total balance but spendable balance blocked by Do Not Spend coins), and available balance display is now filtered.
- `utxo-management`: Manual coin selection flow gains a Do Not Spend warning gate before adding a flagged UTXO to the selection.

## Impact

- **Environments**: Mainnet and testnet.
- **Hardware signer compatibility**: No impact — the filter is purely at the coin-selection/UI layer. No PSBT or signing flow changes.
- **Subscription tier gating**: None — available to all users across all tiers.
- **Security/privacy impact**: Prevents inadvertent privacy leakage by ensuring Do Not Spend coins cannot be spent without explicit user acknowledgement. No key material is accessed or exposed. No new network calls.
- **Affected files**: `src/services/wallets/operations/index.ts` (coin selection filter), `src/screens/Send/AddSendAmount.tsx` (spendable balance, warning UI), `src/components/UTXOsComponents/UTXOList.tsx` (manual selection warning modal), `src/context/Localization/language/en.json` (new strings).
- **Dependencies**: Builds on `dust-utxo-classification` change — requires `spendability` field on UTXO objects and `useUTXOSpendability` hook.

## Non-goals

- Classifying or reclassifying UTXOs (covered by `dust-utxo-classification`).
- Dust donation flow.
- Classification of already-spent UTXOs and descendant marking.
- Any changes to hardware signer flows, PSBT construction, or broadcast.
- BIP329 export of spendability state.
- Blocking the send flow entirely when only Do Not Spend coins exist — users can still manually select them after acknowledging the warning.
