## Why

Keeper now classifies dust UTXOs, propagates address taint, and tags past dust-spend transactions — but users have no single place to review what was found. The Dust Report gives users a clear, wallet-scoped summary of all dust activity and a direct path to act on it.

## What Changes

- **New Wallet Settings entry**: A "Dust Report" row is added to Wallet Settings. Tapping it opens the Dust Report flow for that wallet.
- **Dust Report start screen**: Explains the scan and offers Run Report / Cancel CTAs.
- **Scanning Wallet screen**: Progress state shown while `refreshWallets` runs with `dustScan: true`. Watches `walletSyncing[wallet.id]` to detect completion.
- **Report result screen**: Static report with summary card and three sections — Active Dust, Linked Coins, Past Dust Spends. Rows are non-tappable in v1.
- **Empty state**: Shown when no dust activity is found.
- **Error state**: Shown when scan fails; offers Try Again / Cancel.
- **Inline Donate Dust CTA**: A donate dust confirmation bottom sheet is included directly on the report result screen, shown only when eligible Do Not Spend dust coins exist. Does not navigate to UTXOManagement.
- **Last scanned timestamp**: Stored in MMKV under key `dust-report-lastScanned-{walletId}`, written immediately after scan completes. Displayed in the summary card.
- **i18n**: All new copy strings added to `en.json`.

## Capabilities

### New Capabilities

- `dust-analysis-report`: The end-to-end Dust Report flow — wallet settings entry point, start screen, scanning state, result screen with summary card and three content sections (Active Dust, Linked Coins, Past Dust Spends), empty state, error state, inline Donate Dust confirmation, and MMKV-persisted last-scanned timestamp.

### Modified Capabilities

- `wallets`: Wallet Settings gains a new "Dust Report" list row that opens the Dust Report flow per wallet.

## Impact

- **Environments**: Mainnet and testnet.
- **Hardware signer compatibility**: No impact — the report reads classification output from existing UTXO and transaction data. No signing or PSBT changes.
- **Subscription tier gating**: None — available to all users.
- **Security/privacy impact**: No key material accessed. No new network calls beyond the existing `refreshWallets` saga already used for dust scanning. Last-scanned timestamp in MMKV contains only a millisecond epoch value — no addresses or amounts.
- **Storage**: One new MMKV key per wallet (`dust-report-lastScanned-{walletId}`). No Realm schema changes. No Redux Persist migration.
- **Affected files**:
  - `src/screens/WalletDetails/WalletSettings.tsx` — new Dust Report row
  - `src/screens/DustReport/DustReportScreen.tsx` — new screen (all phases)
  - `src/navigation/Navigator.tsx` — new route registration
  - `src/navigation/types.ts` — new route type entry
  - `src/context/Localization/language/en.json` — new strings
- **Dependencies**: Requires `dust-utxo-classification` (for `spendability` and `dustReason` on UTXOs), `dust-descendant-classification` (for `dustReason: 'adjacent' | 'descendant'` and `potential-dust-spend` transaction tags, and `dustScan: true` saga option), and `dust-donation` (for the donation address constant and transaction-building pattern reused inline).

## Non-goals

- Creating a new top-level tab or app-wide dust dashboard.
- Making report rows tappable to UTXO Details or Transaction Details (deferred to a future iteration).
- Showing dust detection rules or technical logic in the UI.
- Full or partial custom donation recipient selection.
- BIP329 export of dust report data.
- Any changes to the normal wallet refresh cycle or background scanning behaviour.
- Persistence of the full report result set across sessions — only the last-scanned timestamp is persisted.
