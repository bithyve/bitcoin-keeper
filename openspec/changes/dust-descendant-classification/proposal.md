## Why

The existing `dust-utxo-classification` change (#6970) marks a sub-5,000-sat UTXO as Do Not Spend when it arrives on a suspicious address — but this misses two attack scenarios: (1) the dust UTXO was already spent before Keeper could mark it, leaving descendant UTXOs unprotected, and (2) large UTXOs at the same dusted address are silently included in automatic coin selection, allowing the attacker to achieve wallet clustering even when the dust itself is frozen. This change closes both gaps by adopting an address-level taint model and propagating that taint forward through wallet transaction history.

## What Changes

- **Address-taint model replaces UTXO-taint model**: An address is tainted when it received _any_ UTXO meeting dust criteria (value < 5,000 sats AND reused/out-of-order/reused-change). Once tainted, **all** UTXOs at that address are Do Not Spend — not just the sub-threshold one. This supersedes the existing `#6970` rule "UTXO above threshold on a reused address is Spendable."
- **Transaction-history-based detection**: Initial taint detection uses `walletOutputs` (per-wallet-output values stored on each Transaction), enabling identification of dust-triggering receives even when the dust UTXO itself has long been spent. No dependency on the current UTXO set.
- **New field `walletOutputs` on Transaction**: `Array<{address: string, valueSats: number}>` — wallet-owned outputs of each transaction with their individual values. Populated during `transformElectrumTxToTx` for all new transactions. Backfilled via Electrum batch fetch for pre-existing transactions during any hard-refresh that finds transactions with `walletOutputs` absent (not one-time-on-app-update, to avoid silent failures).
- **Forward taint propagation**: After initial taint identification, a BFS pass walks forward through `senderAddresses → recipientAddresses` on the stored transaction history. Any wallet-owned output address of a transaction where a tainted address was a sender also becomes tainted. This traces all descendant addresses across any number of layers. **Manual override (`isManualOverride: true`) breaks the chain**: if the user has manually marked any UTXO at a tainted address as Spendable, that address is removed from the BFS frontier and its descendants are NOT propagated to.
- **Transaction labels**: Any transaction where a tainted address appears in `senderAddresses` is labelled **Potential dust spend** in transaction history.
- **UTXO reason granularity (`dustReason`)**: Three distinct reasons are stored on the UTXO:
  - `'initial'` — the sub-threshold UTXO that triggered the address taint; shows **Potential dust payment**.
  - `'adjacent'` — a co-located above-threshold UTXO at the same initially-tainted address (e.g. a 50,000-sat receive to the same address that also received 800 sats of dust); shows **Linked to potential dust spend**.
  - `'descendant'` — a UTXO at an address tainted solely by BFS forward propagation; shows **Linked to potential dust spend**.
- **Manual override respected**: UTXOs with `isManualOverride: true` (user-marked Spendable) are skipped during all taint-based classification, exactly as in `#6970`.
- **Realm schema version bump**: 107 → 108 (adding `walletOutputs` to `TransactionSchema`).

## Capabilities

### New Capabilities

- `dust-descendant-classification`: Address-level taint model, transaction-history-based dust detection, forward taint propagation via BFS, transaction labelling as Potential dust spend, and UTXO marking with three-tier `dustReason` (`'initial'` / `'adjacent'` / `'descendant'`). Includes the `walletOutputs` transaction field and the backfill mechanism for pre-existing transactions.

### Modified Capabilities

- `dust-utxo-classification`: The core classification rule is extended — "UTXO above threshold on a reused address is Spendable" is superseded when that address received a triggering dust UTXO. All UTXOs at a tainted address are Do Not Spend regardless of their individual value.
- `utxo-management`: UTXO Details screen gains two new Do Not Spend reason strings based on `dustReason`: `'adjacent'` and `'descendant'` both display **Linked to potential dust spend**; `'initial'` displays **Potential dust payment**. The **Mark Spendable** CTA and override flow are reused without change.

## Impact

- **Environments**: Mainnet and testnet.
- **Hardware signer compatibility**: No impact — classification is purely wallet-side logic over stored transaction and address data. No PSBT or signing changes.
- **Subscription tier gating**: None — available to all users.
- **Security/privacy impact**: Improves privacy by closing the cross-address clustering gap left by UTXO-level-only dust marking. No key material accessed. The backfill adds Electrum batch calls during any hard-refresh that finds missing `walletOutputs` (idempotent and bounded — terminates as soon as all transactions are populated); restore/import is zero-cost as all transactions are processed fresh.
- **Storage**: `TransactionSchema` gains `walletOutputs: {address: string, valueSats: number}[]` (embedded list). Realm schema version bump 107 → 108. No Redux slice changes required.
- **Affected files**: `TransactionSchema` (Realm), `realm.ts` (schema version), `wallet.ts` interface, `wallets.ts` saga (backfill pass), `WalletOperations.transformElectrumTxToTx` (populate `walletOutputs`), `dustClassification.ts` (address-taint algorithm replaces per-UTXO classification), affected UI label strings in `UTXOLabeling` and transaction detail screens.

## Non-goals

- Blocking the send flow when tainted UTXOs are selected (covered by `dust-spend-restrictions`).
- Donation of dust UTXOs.
- Detection of mass-dusting transactions (multiple addresses dusted in one transaction).
- BIP329 export of taint state.
- A dedicated taint history or dust audit screen.
- Changing the 5,000-sat value threshold.
- Fiat-value-based classification.
