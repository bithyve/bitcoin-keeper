## Why

Keeper currently treats all wallet UTXOs as spendable by default, so suspicious low-value UTXOs can be auto-selected in normal sends and reduce user privacy by linking coins. This change adds first-version dust attack protection now because Keeper already has coin-control surfaces and can deliver protection without introducing a new screen model.

## What Changes

- Add persisted UTXO spendability state with two values: Spendable and Do Not Spend.
- Use Option A storage model: extend persisted UTXO metadata to store spendability status, reason, and user override.
- Classify UTXOs during wallet scan/refresh flows (create, import/restore, post-upgrade open, pull-to-refresh, incoming scan) using sats-only rules.
- Mark potential dust UTXOs as Do Not Spend when value is below 5,000 sats and address reuse/out-of-order rules match.
- Preserve explicit user overrides so marked-spendable coins are not auto-re-marked on next scan.
- Detect already-spent potential dust and trace affected descendants one level deep for this version, marking current traceable descendants as Do Not Spend.
- Exclude Do Not Spend UTXOs from normal automatic coin selection and available-to-spend calculations.
- Add send-flow helper messaging when total balance is enough but spendable balance is insufficient due to Do Not Spend state.
- Add manual controls in UTXO details: Mark Do Not Spend and Mark Spendable with reason visibility.
- Add wallet-level visual indicators (red dots and wallet detail subtitle line) based on presence of current Do Not Spend coins.
- Add transaction history/detail informational tagging for Potential dust spend events.
- Add Donate Dust flow in scope: build donation transaction from Do Not Spend UTXOs only, pay fees from those UTXOs only, minimum fee rate, and donate remainder to configured address.
- Affect both mainnet and testnet behavior for dust classification and Do Not Spend handling; donation destination remains the specified mainnet donation address.
- Hardware signer compatibility: no new signing protocol; flows must remain compatible with existing PSBT signing across software and hardware signers.
- Subscription tier gating: no additional tier gate introduced; feature follows current wallet/coin-control availability.

## Non-goals

- Multi-level dust risk scoring.
- Mass-dusting transaction-pattern analytics.
- Out-of-order detection rules for change addresses.
- General economic dust cleanup beyond privacy-focused Do Not Spend handling.
- Deep recursive descendant tracing beyond one level in this version.
- New standalone dust dashboard or dedicated dust screen.

## Capabilities

### New Capabilities
- `dust-attack-protection`: end-to-end Do Not Spend classification, visibility, overrides, and donation flow for potential dust privacy protection.

### Modified Capabilities
- `utxo-management`: add spendability state UX, reason visibility, manual state toggles, and donation entry points in existing coin-control surfaces.
- `send-and-receive`: exclude Do Not Spend from default input selection and available balance; add insufficient-spendable helper behavior.
- `wallets`: include wallet-level red-dot and subtitle indicators derived from Do Not Spend UTXO presence during refresh/sync.
- `transaction-history`: add informational Potential dust spend labeling and detail explanation for identified historical spends.

## Impact

- Affected systems: wallet sync/classification pipeline, coin selection and fee prep, UTXO management UI, send flow UI logic, wallet list/detail indicators, transaction history metadata.
- Storage: Realm schema change required for Option A persisted UTXO spendability metadata and migration updates.
- Security/privacy impact: reduces unintended privacy linkage risk by preventing automatic spending of suspicious UTXOs; no new key-material handling; no new external network dependencies beyond existing wallet sync calls.
- APIs/dependencies: existing transaction construction and PSBT flows reused; no new third-party dependency required for core behavior.
