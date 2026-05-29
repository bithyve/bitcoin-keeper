## ADDED Requirements

### Requirement: walletOutputs Persisted on Every Transaction

> **`walletOutputs` is required only for dust scan mode.** The backfill step that populates `walletOutputs` for pre-existing transactions MUST run only when `dustScan: true` is set. Soft and hard refresh do NOT run the backfill and do NOT require `walletOutputs` to be present.

The app MUST store the wallet-owned outputs of each transaction as `walletOutputs` — an array of `{address: string, valueSats: number}` entries — on the `Transaction` object at the time the transaction is first constructed via `transformElectrumTxToTx`.

Only outputs whose address is owned by the wallet (present in `externalAddresses` or `internalAddresses` at sync time) MUST be included. External recipient addresses MUST NOT be stored.

For existing transactions that predate this feature (where `walletOutputs` is absent), the app MUST perform a backfill during any `refreshWalletsWorker` pass with `hardRefresh: true`: batch-fetch raw transaction data from Electrum for all transactions missing `walletOutputs`, extract wallet-owned outputs, and persist the result before running dust classification. The backfill is idempotent — once all transactions are populated, subsequent hard-refreshes skip it immediately.

#### Scenario: walletOutputs populated for a new incoming transaction

- GIVEN a wallet receives a new confirmed transaction with two outputs: one to a wallet receive address (5,000 sats) and one to an external address
- WHEN the transaction is processed during a wallet sync
- THEN `walletOutputs` on the stored Transaction object contains exactly one entry: `{address: <wallet-receive-address>, valueSats: 5000}`

#### Scenario: walletOutputs populated for a new send transaction with change

- GIVEN a wallet sends a transaction where one output is change to a wallet-owned internal address (12,000 sats) and one output is to an external recipient
- WHEN the transaction is processed during a wallet sync
- THEN `walletOutputs` contains exactly one entry for the change address with `valueSats: 12000`

#### Scenario: walletOutputs backfilled for existing transactions during a hard-refresh

- GIVEN an existing wallet with 50 confirmed transactions all lacking `walletOutputs`
- WHEN the user triggers a hard-refresh
- THEN `walletOutputs` is populated on all 50 transactions before dust classification runs, using Electrum batch fetch

#### Scenario: walletOutputs backfill is skipped on both normal and hard refresh

- GIVEN an existing wallet with 50 confirmed transactions all lacking `walletOutputs`
- WHEN a normal wallet refresh OR a hard refresh completes (no `dustScan` flag)
- THEN no Electrum backfill calls are made; classification runs against current UTXOs only

---

### Requirement: Address-Level Taint Detection from Transaction History

> **This phase runs only when the refresh worker is invoked with `dustScan: true`.** During normal and hard refresh, only the current UTXO set is evaluated (see `dust-utxo-classification` spec); the historical `walletOutputs` scan described here is skipped.

The app MUST identify wallet addresses as tainted by scanning `walletOutputs` across all transactions in wallet history, without relying on the current UTXO set.

An address MUST be classified as initially tainted when it received a wallet output with `valueSats < 5000` AND one of the following address conditions was true **at the time that transaction was received**:

- **Reused receive address**: The address is on the external chain AND had appeared as a recipient address in any earlier transaction (earlier by `blockTime`).
- **Out-of-order receive address**: The address is on the external chain AND its derivation index is lower than the highest external address index that had received in any earlier transaction.
- **Reused change address**: The address is on the internal chain AND had appeared as a recipient address in any earlier transaction.

The address conditions MUST be evaluated at the historical blockTime of the triggering transaction, not against the current wallet state.

#### Scenario: Taint detected for a spent dust UTXO on a reused receive address

- GIVEN a wallet whose transaction history includes: Tx0 (external → address A, 80,000 sats) and Tx1 (attacker → address A, 546 sats, received later), and address A is no longer in `confirmedUTXOs` because both UTXOs were spent
- WHEN dust classification runs
- THEN address A is identified as initially tainted (A received 546 sats and had already received in Tx0 before Tx1)

#### Scenario: Large UTXO at tainted address is marked Do Not Spend

- GIVEN address A is tainted (it received a triggering dust UTXO) AND address A currently has a 500,000-sat unspent UTXO
- WHEN dust classification runs
- THEN the 500,000-sat UTXO is marked Do Not Spend with reason Potential dust payment

#### Scenario: Fresh address with single small legitimate receive is not tainted

- GIVEN address B (external index 5, never previously received) receives 3,000 sats as its first-ever transaction, and no higher-indexed address had received before
- WHEN dust classification runs
- THEN address B is NOT tainted (no reuse, no out-of-order condition met)

#### Scenario: Out-of-order address is tainted using historical index state

- GIVEN wallet history shows address C (external index 3) received after address D (external index 5) had already received — making C out-of-order at the time of its receive
- AND address C received 2,000 sats in that out-of-order transaction
- WHEN dust classification runs
- THEN address C is initially tainted based on the out-of-order condition at that historical blockTime

---

### Requirement: Forward Taint Propagation Through Spending Graph

> **This phase runs only when the refresh worker is invoked with `dustScan: true`.** During normal (soft) and hard refresh, only initial taint detection runs; forward propagation to descendants is skipped.

The app MUST propagate address taint forward through wallet transaction history using a breadth-first traversal of the spending graph.

For each initially tainted address, the app MUST find all transactions where that address appears in `senderAddresses`. For each such transaction, all wallet-owned addresses in `recipientAddresses` MUST also be marked tainted. This process MUST continue iteratively until no new addresses are added.

The propagation MUST use only data already stored in `wallet.specs.transactions` (`senderAddresses`, `recipientAddresses`). No additional Electrum queries are required for propagation.

The propagation MUST NOT mark external (non-wallet-owned) recipient addresses as tainted.

**Manual override breaks the propagation chain**: If any UTXO at a tainted address has `isManualOverride: true` (the user has explicitly marked it Spendable), that address MUST be excluded from the BFS frontier. Its wallet-owned recipient addresses in spending transactions MUST NOT be tainted. The override breaks the chain at that address; previously-propagated taint on earlier addresses is unaffected.

#### Scenario: Layer-1 descendant address is tainted

- GIVEN address X is initially tainted AND wallet transaction Tx1 has X in `senderAddresses` AND wallet-owned change address D in `recipientAddresses`
- WHEN dust classification runs the BFS propagation
- THEN address D is added to the tainted set

#### Scenario: Layer-2 descendant address is tainted

- GIVEN address D was tainted in the previous propagation step AND wallet transaction Tx2 has D in `senderAddresses` AND wallet-owned change address E in `recipientAddresses`
- WHEN dust classification continues the BFS
- THEN address E is also added to the tainted set

#### Scenario: External recipient addresses are not tainted

- GIVEN address X is tainted AND Tx1 sends to an external address (not wallet-owned) alongside wallet change address D
- WHEN dust classification runs
- THEN only D is tainted; the external address is not tracked

#### Scenario: Already-tainted address is not re-processed

- GIVEN address X is initially tainted AND appears as sender in two separate transactions Tx1 and Tx2
- WHEN BFS propagation processes both transactions
- THEN X is not added to the frontier a second time, and its output addresses from both transactions are each added at most once

#### Scenario: Manual override on auto-classified Do Not Spend UTXO breaks BFS chain

- GIVEN address X is initially tainted AND the user has marked the UTXO at address X as Spendable (`isManualOverride: true`)
- AND wallet transaction Tx1 has X in `senderAddresses` AND wallet-owned address D in `recipientAddresses`
- WHEN dust classification runs the BFS propagation
- THEN address D is NOT added to the tainted set (override at X breaks the chain)

#### Scenario: Manual override on descendant UTXO breaks further propagation

- GIVEN address D was tainted by propagation AND the user has marked the UTXO at address D as Spendable (`isManualOverride: true`)
- AND wallet transaction Tx2 has D in `senderAddresses` AND wallet-owned address E in `recipientAddresses`
- WHEN dust classification runs the BFS propagation
- THEN address E is NOT added to the tainted set (override at D breaks the chain at that hop)

---

### Requirement: Descendant UTXOs Marked Do Not Spend

All current wallet-owned UTXOs whose address is in the tainted set (whether initially tainted or tainted by propagation) MUST be marked Do Not Spend, unless the UTXO has `isManualOverride: true`.

`dustReason` MUST be assigned as follows:

| UTXO | `dustReason` |
|---|---|
| The sub-threshold UTXO (`value < 5,000`) at an initially tainted address (the triggering dust output) | `'initial'` |
| Any other UTXO at an initially tainted address whose value is **at or above** the dust threshold (adjacent coin at the same tainted address) | `'adjacent'` |
| Any UTXO at an address tainted solely by BFS propagation (downstream of a dust spend) | `'descendant'` |

Both `'adjacent'` and `'descendant'` display as **Linked to potential dust spend** in the UTXO detail screen; only `'initial'` displays as **Potential dust payment**.

The `dustReason` field MUST be persisted on the UTXO and MUST survive hard refresh via the pre-sync snapshot mechanism.

#### Scenario: UTXO at an initially tainted address is marked Do Not Spend

- GIVEN address X is initially tainted AND UTXO U is at address X with `isManualOverride: false`
- WHEN UTXO marking runs
- THEN U has `spendability: 'doNotSpend'` and `dustReason: 'initial'`

#### Scenario: UTXO at a propagation-tainted address is marked Do Not Spend

- GIVEN address D is tainted by forward propagation AND UTXO V is at address D with `isManualOverride: false`
- WHEN UTXO marking runs
- THEN V has `spendability: 'doNotSpend'` and `dustReason: 'descendant'`

#### Scenario: Manual override is respected during taint-based classification

- GIVEN UTXO W is at a tainted address BUT `isManualOverride: true` and `spendability: 'spendable'`
- WHEN UTXO marking runs
- THEN W retains `spendability: 'spendable'` and is not reclassified

#### Scenario: Manual override survives hard refresh

- GIVEN UTXO W was manually marked Spendable (`isManualOverride: true`) on a tainted address
- WHEN the user performs a pull-to-refresh (hard refresh)
- THEN W retains `spendability: 'spendable'` after the refresh

#### Scenario: Non-manual doNotSpend from prior dust scan is preserved across soft/hard refresh

- GIVEN UTXO V has `spendability: 'doNotSpend'` and `dustReason: 'descendant'` set by a prior dust scan (no `isManualOverride`)
- AND the current soft or hard refresh does not detect V's address as tainted (the dust UTXO that triggered it may already be spent)
- WHEN the refresh completes
- THEN V retains `spendability: 'doNotSpend'` and `dustReason: 'descendant'`

#### Scenario: Full dust scan can clear a descendant marking if the address is no longer reachable via BFS

- GIVEN UTXO V was previously marked `doNotSpend` with `dustReason: 'descendant'` by an earlier dust scan
- AND the user subsequently marked the upstream tainted address as Spendable (`isManualOverride: true`), breaking the BFS chain
- WHEN a new dust scan runs
- THEN V is no longer reachable via BFS from any tainted address and is reclassified as `spendable`

---

### Requirement: Potential Dust Spend Transaction Label

> **This phase runs only when the refresh worker is invoked with `dustScan: true`.** Transaction labels are not updated during normal or hard refresh.

Any wallet transaction where at least one address in `senderAddresses` is in the tainted set MUST be labelled as a **Potential dust spend** in the transaction history.

The transaction list item MUST display the **Potential dust spend** label on any such transaction.

The transaction detail screen MUST display the explanation:
> This transaction may have spent a suspicious small amount together with other wallet funds. This may have reduced wallet privacy.

No action or CTA is required on the transaction detail for this label — it is informational only.

#### Scenario: Transaction with tainted sender is labelled Potential dust spend in list

- GIVEN wallet transaction Tx1 has tainted address X in its `senderAddresses`
- WHEN the transaction list renders
- THEN Tx1 shows the Potential dust spend label

#### Scenario: Transaction detail shows privacy explanation for Potential dust spend

- GIVEN wallet transaction Tx1 is labelled Potential dust spend
- WHEN the user opens the transaction detail for Tx1
- THEN the explanation "This transaction may have spent a suspicious small amount together with other wallet funds. This may have reduced wallet privacy." is shown
- AND no action button is shown for the label

#### Scenario: Clean transaction is not labelled

- GIVEN wallet transaction Tx2 has only clean (non-tainted) addresses in its senderAddresses
- WHEN the transaction list renders
- THEN Tx2 does not show any Potential dust spend label


---

### Requirement: Dedicated Dust Scan Operation

The app MUST support a dedicated **dust scan** mode, separate from the normal wallet sync cycle. The dust scan is triggered by passing `dustScan: true` in the wallet refresh options.

During a dust scan the app MUST run the full three-phase classification:
1. **walletOutputs backfill** — populate `walletOutputs` for any transactions missing it (Electrum batch fetch); idempotent after first run.
2. **Initial taint detection** — scan `walletOutputs` across all transaction history to identify initially tainted addresses (including historically spent dust).
3. **Forward propagation (BFS)** — propagate taint to descendant addresses through the spending graph.
4. **Transaction labelling** — apply `potential-dust-spend` tags to all transactions where a tainted address appears in `senderAddresses`.

During a normal (soft) refresh or hard refresh, the app MUST run **only** current UTXO classification: for each current UTXO with `valueSats < 5,000`, evaluate address reuse and out-of-order conditions using existing transaction history data (no Electrum calls, no walletOutputs, no BFS, no tx labels).

**Preservation of prior dust scan results**: During a soft or hard refresh, if a UTXO is not found in the current scan's tainted set, the app MUST preserve any existing `doNotSpend` classification and `dustReason` that was set by a prior dust scan (i.e. snapshot `spendability === 'doNotSpend'` without `isManualOverride`). Only an explicit dust scan (with full BFS) has authority to clear such markings, because only it has a complete picture of the spending graph.

Manual override semantics are identical across all modes: any UTXO with `isManualOverride: true` is never reclassified automatically.

#### Scenario: Normal refresh classifies initial taint only (no prior dust scan)

- GIVEN a wallet whose address X received 546 sats on a reused address (initially tainted), and address D was funded by a spend from X (descendant), and NO prior dust scan has ever run
- WHEN a normal wallet sync runs (no `dustScan` flag)
- THEN the UTXO at X is marked Do Not Spend with `dustReason: 'initial'`
- AND the UTXO at D is NOT marked Do Not Spend (BFS skipped; no prior classification to preserve)

#### Scenario: Normal refresh preserves descendant Do Not Spend from a prior dust scan

- GIVEN a prior dust scan already marked the UTXO at address D as `doNotSpend` with `dustReason: 'descendant'`
- WHEN a subsequent normal (soft) or hard refresh runs (no `dustScan` flag) and the current scan does not detect D as initially tainted
- THEN the UTXO at D retains `spendability: 'doNotSpend'` and `dustReason: 'descendant'`
- AND the classification from the prior dust scan is NOT overwritten

#### Scenario: Hard refresh classifies initial taint only, no descendants (no prior dust scan)

- GIVEN the same wallet above (no prior dust scan)
- WHEN the user pulls to refresh (hard refresh, no `dustScan` flag)
- THEN initial taint detection runs against current UTXOs only
- AND BFS propagation is NOT run; the UTXO at D remains Spendable

#### Scenario: Dust scan classifies initial taint AND propagates to descendants

- GIVEN the same wallet above
- WHEN a dust scan runs (`dustScan: true`)
- THEN initial taint detection runs, then BFS propagation runs
- AND the UTXO at X is marked Do Not Spend with `dustReason: 'initial'`
- AND the UTXO at D is marked Do Not Spend with `dustReason: 'descendant'`
- AND any transaction spending from X or D is tagged `potential-dust-spend`

#### Scenario: Manual override is respected in all modes

- GIVEN UTXO W is at a tainted address and has `isManualOverride: true, spendability: 'spendable'`
- WHEN either a normal refresh, hard refresh, or dust scan runs
- THEN W retains `spendability: 'spendable'` in all cases

---

### Requirement: UTXO Details Shows Correct Reason for Descendant Do Not Spend

When a UTXO is marked Do Not Spend with `dustReason: 'descendant'`, the UTXO detail screen MUST display:

- Reason: **Linked to potential dust spend**
- Explanation: **Keeper marked this coin Do Not Spend to help protect wallet privacy.**
- A **Mark Spendable** button

On tapping Mark Spendable, the UTXO MUST be marked `spendability: 'spendable'` with `isManualOverride: true`. The screen MUST remain open and show a **Coin marked spendable** success feedback.

#### Scenario: UTXO detail shows Linked reason for descendant Do Not Spend

- GIVEN a UTXO with `dustReason: 'descendant'` and `spendability: 'doNotSpend'`
- WHEN the UTXO detail screen renders
- THEN the reason line shows Linked to potential dust spend and the explanation and Mark Spendable button are visible

#### Scenario: Mark Spendable persists for a descendant Do Not Spend UTXO

- GIVEN a descendant Do Not Spend UTXO is displayed in UTXO detail
- WHEN the user taps Mark Spendable
- THEN `spendability` is set to `'spendable'`, `isManualOverride` is set to `true`, and a Coin marked spendable toast is shown
- AND after the next wallet refresh the UTXO remains Spendable
