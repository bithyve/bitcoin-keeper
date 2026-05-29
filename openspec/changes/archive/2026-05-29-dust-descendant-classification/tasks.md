## 1. Storage Schema & Interface

- [x] 1.1 Add `walletOutputs?: Array<{address: string; valueSats: number}>` to `Transaction` interface in `src/services/wallets/interfaces/index.ts`
- [x] 1.2 Add `dustReason?: 'initial' | 'descendant'` field to `UTXO` interface in `src/services/wallets/interfaces/index.ts`
- [x] 1.3 Add `walletOutputs: 'mixed?'` to `TransactionSchema` in `src/storage/realm/schema/wallet.ts`
- [x] 1.4 Add `dustReason: 'string?'` to `UTXOSchema` in `src/storage/realm/schema/wallet.ts`
- [x] 1.5 Bump Realm schema version 107 → 108 in `src/storage/realm/realm.ts`
- [x] 1.6 Add Redux Persist migration if any slice shape changes in `src/store/migrations.ts`

## 2. Transaction Transformation: Populate walletOutputs

- [x] 2.1 In `WalletOperations.transformElectrumTxToTx` (`src/services/wallets/operations/index.ts`), collect wallet-owned outputs (`address` + `valueSats`) from the existing `tx.vout` loop and attach as `walletOutputs` on the returned `Transaction` object

## 3. Dust Classification: Address-Taint Algorithm

- [x] 3.1 In `src/services/wallets/operations/dustClassification.ts`, replace `classifyDustUTXO` with `classifyDustByAddress(wallet, preSyncNFAI, externalAddresses, internalAddresses): { taintedAddresses: Set<string>; dustSpendTxids: Set<string> }`
- [x] 3.2 Implement the precompute step: build `txCountByAddress` (Map<address, number> — count of distinct transactions including the address in `recipientAddresses`) and `highestExtIdxBeforeTx` (Map<txid, number>) from `wallet.specs.transactions` sorted by `blockTime` ascending
- [x] 3.3 Implement Phase 1 with two modes:
  - `'current'` mode: iterate `confirmedUTXOs + unconfirmedUTXOs`; for each UTXO with `value < 5000`, apply reuse (`txCountByAddress > 1`) and out-of-order (`addrIdx < highestExtIdxBeforeTx[utxo.txId]`) criteria; return early without BFS or tx labels
  - `'full'` mode: scan `walletOutputs` across all sorted transactions; apply same address criteria (including historically spent dust)
- [x] 3.4 Implement Phase 2 (BFS forward propagation) gated on `includePropagation` flag: for each initially tainted address, check `manualOverrideAddresses` to break the chain; find transactions where it appears in `senderAddresses`; add wallet-owned addresses from `recipientAddresses` to the tainted set; iterate until frontier is empty. When `includePropagation` is `false`, skip this phase entirely and set `taintedAddresses = initialTaintAddresses`.
- [x] 3.5 Implement Phase 3 (transaction label output) gated on `includePropagation` flag: collect txids where any `senderAddresses` entry is in `taintedAddresses` into `dustSpendTxids`. Return empty set when `includePropagation` is `false`.
- [x] 3.6 Add `scanMode: 'current' | 'full'` parameter to `classifyDustByAddress`; early return after Phase 1 when `scanMode === 'current'`; keep file as pure functions (no Realm, no Redux)

## 4. Saga: Backfill, Classification, and Marking

- [x] 4.1 In `refreshWalletsWorker` (`src/store/sagas/wallets.ts`), add `dustScan?: boolean` to the options type; backfill step runs ONLY when `dustScan: true` (skipped on normal refresh and hard refresh)
- [x] 4.2 Batch-fetch raw transaction data from Electrum (`ElectrumClient.getTransactionsById`) for unclassified transactions (max 40 per call); extract wallet-owned outputs; set `walletOutputs` on those Transaction objects before proceeding; the step is idempotent — exits immediately when all transactions already have `walletOutputs`; this entire block is skipped when `dustScan` is not set
- [x] 4.3 Update the pre-sync snapshot capture (from `dust-utxo-classification`) to also include `dustReason` alongside `spendability` and `isManualOverride`
- [x] 4.4 Call `classifyDustByAddress` with the synced wallet, address maps, manual override set, and `scanMode: options.dustScan ? 'full' : 'current'`; receive `{ taintedAddresses, initialTaintAddresses, dustSpendTxids }`
- [x] 4.5 For each UTXO in `confirmedUTXOs + unconfirmedUTXOs`: if the UTXO key is in the pre-sync snapshot with `isManualOverride: true`, preserve from snapshot; else if `utxo.address` is in `taintedAddresses`, set `spendability: 'doNotSpend'` and `dustReason` (`'initial'` if initially tainted, `'descendant'` if propagation-tainted); else set `spendability: 'spendable'` and clear `dustReason`
- [x] 4.6 For each txid in `dustSpendTxids` (only non-empty during dust scan), attach system tag `potential-dust-spend` to the corresponding Transaction object
- [x] 4.7 Persist the updated wallet specs (UTXOs + transactions) via `dbManager.updateObjectById`

## 5. UI: Transaction History Labels

- [x] 5.1 In the transaction list item component, detect the `potential-dust-spend` system tag (or `isDustSpend` flag) and render the **Potential dust spend** label chip using the existing label/chip component
- [x] 5.2 In the transaction detail screen, when the `potential-dust-spend` tag is present, render the explanation: "This transaction may have spent a suspicious small amount together with other wallet funds. This may have reduced wallet privacy." using the existing info/warning pattern; no action button

## 6. UI: UTXO Details Reason Strings

- [x] 6.1 In `UTXOLabeling` (UTXO detail screen), update the reason/explanation display logic to branch on `dustReason`:
  - `'initial'` → reason: **Potential dust payment**, explanation: **Keeper marked this coin Do Not Spend to help protect wallet privacy.**
  - `'descendant'` → reason: **Linked to potential dust spend**, explanation: **Keeper marked this coin Do Not Spend to help protect wallet privacy.**
  - `isManualOverride && no dustReason` → reason: **Marked manually**, no explanation
- [x] 6.2 Verify the **Mark Spendable** CTA (sets `spendability: 'spendable'`, `isManualOverride: true`) and its **Coin marked spendable** toast are triggered for both `'initial'` and `'descendant'` Do Not Spend UTXOs (no behaviour change needed if already implemented in `dust-utxo-classification`)


