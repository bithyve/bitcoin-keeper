## Why

Dust attacks are a well-known Bitcoin privacy exploit where an attacker sends tiny amounts (< 5,000 sats) to many wallet addresses to deanonymize their owners by tracking subsequent spends. Keeper currently has no mechanism to detect or warn users about these UTXOs, leaving users unknowingly spending dust and exposing their wallet graph. This change adds automatic detection and manual classification of dust UTXOs so users can make informed decisions before spending.

## What Changes

- **New fields on UTXO**: `spendability` (nullable string: `'spendable'` | `'doNotSpend'`) and `isManualOverride` (bool) are embedded directly on each UTXO object in the wallet/vault specs.
- **Automatic dust classification**: On every wallet refresh (both normal and hard), UTXOs without an existing spendability state are classified using address reuse and out-of-order index detection rules.
- **Spendability state preserved across refreshes**: Once classified (auto or manual), the state is restored from the pre-sync snapshot and re-applied after sync. Manual overrides (`isManualOverride: true`) are never overwritten by auto-classification.
- **New saga action `MARK_UTXO_SPENDABILITY`**: Enables user-initiated manual override (Mark Do Not Spend / Mark Spendable) by updating the UTXO's embedded fields in Realm via `dbManager`.
- **Toast notification**: When a new Do Not Spend UTXO is detected during a user-initiated refresh (`addNotifications: true`), a one-time toast "Potential dust payment found" is shown via Redux state → `HomeWallet` `useEffect`.
- **UI indicators on six surfaces**: wallet card red dot, wallet details warning line, More Options bottom sheet red dot on View All Coins, Do Not Spend chip on Manage Coins, Mark Do Not Spend / Mark Spendable CTA on UTXO Details.
- **Realm schema version bump**: 106 → 107 (adding nullable fields to the embedded `UTXOSchema`).

## Capabilities

### New Capabilities

- `dust-utxo-classification`: Automatic detection and manual classification of unspent UTXOs as Spendable or Do Not Spend, including the detection rule, classification lifecycle, manual override, toast notification, and all UI indicators across wallet and vault.

### Modified Capabilities

- `utxo-management`: UTXO Details screen (UTXOLabeling) gains Mark Do Not Spend / Mark Spendable actions and reason/explanation display. Manage Coins screen gains the Do Not Spend label chip on affected UTXOs.

## Impact

- **Environments**: Mainnet and testnet.
- **Hardware signer compatibility**: No impact — classification is purely a wallet-side concern based on local UTXO and transaction history. No PSBT or signing flow changes.
- **Subscription tier gating**: None — available to all users across all tiers.
- **Security/privacy impact**: This feature improves wallet privacy by surfacing potentially tainted UTXOs. No key material is accessed or exposed. Classification reads only from `wallet.specs.transactions` and `wallet.specs.addresses` (already loaded in memory post-sync). No new network calls.
- **Storage**: Realm embedded `UTXOSchema` gains two new nullable fields. Migration is additive (no data transform required). Redux `utxos` slice gains `pendingDustToast` transient state.
- **Affected files**: `UTXOSchema` (Realm), `realm.ts` (schema version), `wallet.ts` interface, `dustClassification.ts` (new utility), `wallets.ts` saga, `utxos.ts` saga + reducer + sagaActions, `useUTXOSpendability` hook (new), `WalletCard`, `HomeWallet`, `WalletDetails`, `UTXOManagement`, `UTXOLabeling`, More Options bottom sheet.

## Non-goals

- Dust spend restrictions during send (covered by separate issue #6965).
- Dust donation flow.
- Classification of already-spent UTXOs and descendant marking.
- Mass-dusting transaction pattern detection (multiple addresses dusted in one tx).
- Fiat-value-based thresholds — sats only.
- A dedicated dust dashboard or new screen.
- BIP329 export of spendability state (not a label — not exported via the existing Tags backup flow).
