# Dust Protection Specification

## Purpose

The Dust Protection domain covers the full lifecycle of potential dust payment
detection and enforcement in Bitcoin Keeper. It automatically classifies
wallet-owned UTXOs as **Spendable** or **Do Not Spend** on every sync, persists
and preserves that state across refreshes, surfaces visual indicators wherever
dust UTXOs are present, allows the user to override classification manually, and
enforces that Do Not Spend UTXOs are excluded from automatic coin selection while
giving the user explicit opt-in controls when selecting them manually.

---

## Requirements

### Requirement: Automatic Dust Classification

The app MUST automatically classify every current wallet-owned UTXO (confirmed and
unconfirmed) as either **Spendable** or **Do Not Spend** during every wallet sync.
Classification runs inside the wallet refresh flow for both wallets and vaults.

Classification is driven by address-level taint, not individual UTXO values. During
soft and hard refresh the app evaluates the **current UTXO set** (confirmed and
unconfirmed) directly — no `walletOutputs` backfill or historical transaction scan
is required. For each current UTXO with `valueSats < 5,000`, the app checks whether
the receiving address is tainted by evaluating address conditions against existing
transaction history (`recipientAddresses`) already stored in the wallet:

**Receive address (external chain):**
- The address appears in `recipientAddresses` of more than one transaction (reused), OR
- The address derivation index is lower than the highest external index that had
  received in any earlier transaction (out-of-order).

**Change address (internal chain):**
- The address appears in `recipientAddresses` of more than one transaction (reused
  change address).

The sub-threshold value (`valueSats < 5,000`) is the **trigger** for evaluating
address conditions. Once an address is identified as tainted, **all** UTXOs at that
address MUST be classified as **Do Not Spend**, regardless of the individual UTXO
value — including UTXOs whose value is well above the dust threshold. The value
check only determines which UTXOs act as triggers; the marking itself is
address-wide.

In all other cases, UTXOs MUST be classified as **Spendable**.

> **Dust scan (`dustScan: true`) extends this**: the full historical `walletOutputs`
> scan and BFS descendant propagation run, catching dust that was already spent
> before Keeper could evaluate it and tracing taint to descendant UTXOs. See the
> `Dedicated Dust Scan Operation` requirement.

Detection MUST use satoshi amounts only. Fiat value MUST NOT influence
classification. Out-of-order detection MUST NOT be applied to change addresses.

#### Scenario: UTXO under threshold on reused receive address is classified Do Not Spend

- GIVEN a wallet that has previously received funds at receive address index 3
- WHEN a new UTXO of 2,000 sats arrives at that same address during a wallet sync
- THEN the UTXO is classified as Do Not Spend with reason Potential dust payment

#### Scenario: UTXO under threshold on out-of-order receive address is classified Do Not Spend

- GIVEN a wallet whose highest previously-used receive address index is 7
- WHEN a new UTXO of 1,500 sats arrives at receive address index 4 (which has never
  received before)
- THEN the UTXO is classified as Do Not Spend with reason Potential dust payment

#### Scenario: UTXO under threshold on reused change address is classified Do Not Spend

- GIVEN a wallet whose change address index 2 was previously used as a change output
  and then received an external payment
- WHEN a new UTXO of 3,000 sats arrives at that change address
- THEN the UTXO is classified as Do Not Spend with reason Potential dust payment

#### Scenario: UTXO under threshold on a fresh receive address is classified Spendable

- GIVEN a wallet whose current highest receive address index is 5
- WHEN a new UTXO of 4,999 sats arrives at receive address index 6 (never used before)
- THEN the UTXO is classified as Spendable

#### Scenario: UTXO under threshold on a fresh change address is classified Spendable

- GIVEN a change address that has never received any funds
- WHEN a new UTXO of 800 sats (a change output) arrives at that address
- THEN the UTXO is classified as Spendable

#### Scenario: Large UTXO above threshold on a tainted receive address is classified Do Not Spend (during refresh)

- GIVEN address X (external index 2, previously received) currently holds two unspent
  UTXOs: a 546-sat UTXO (the triggering dust payment, still unspent) and a
  500,000-sat UTXO
- AND address X is reused (it appears in more than one transaction's
  `recipientAddresses`)
- WHEN a soft or hard refresh runs dust classification
- THEN the 546-sat UTXO acts as the trigger: address X is identified as tainted
- AND **both** the 546-sat UTXO and the 500,000-sat UTXO are classified as Do Not
  Spend with reason Potential dust payment

> **Note**: if the 546-sat triggering UTXO had already been spent before the refresh
> ran, soft/hard refresh would not detect the taint (the address has no current
> sub-threshold UTXO to act as a trigger). A full dust scan (`dustScan: true`) is
> required to catch historically spent dust.

#### Scenario: Large UTXO above threshold on a non-tainted reused address is classified Spendable

- GIVEN address Y (external index 4, previously received) has never received any
  UTXO with valueSats < 5,000 — so it is not tainted — AND address Y now holds a
  10,000-sat UTXO
- WHEN dust classification runs
- THEN the 10,000-sat UTXO is classified as Spendable

---

### Requirement: Spendability State Persistence and Preservation

Every UTXO MUST carry its spendability state (`spendability`, `isManualOverride`)
as embedded fields persisted in the wallet/vault specs.

Once a UTXO has a spendability state, the automatic classification MUST NOT
overwrite it on subsequent syncs — this applies to both automatically-assigned and
manually-assigned states.

A UTXO that has been manually marked Spendable (`isManualOverride: true`) MUST
remain Spendable after any future sync, including a hard refresh.

On hard refresh (which rebuilds the full UTXO set), the app MUST restore existing
spendability states from the pre-sync wallet snapshot before writing the refreshed
UTXO set to storage.

Spent UTXOs (removed from the confirmed/unconfirmed sets during sync) MUST have
their spendability state removed alongside the UTXO object — no explicit cleanup
is required.

#### Scenario: Existing spendability state survives a normal refresh

- GIVEN a UTXO classified as Do Not Spend on a previous sync
- WHEN the wallet performs a normal refresh that returns the same UTXO
- THEN the UTXO retains Do Not Spend state without re-classification

#### Scenario: Existing spendability state survives a hard refresh

- GIVEN a UTXO classified as Do Not Spend with isManualOverride false
- WHEN the user performs a pull-to-refresh (hard refresh) and the UTXO is still
  present
- THEN the UTXO retains Do Not Spend state

#### Scenario: Manual Spendable override survives a hard refresh

- GIVEN a UTXO that was automatically classified Do Not Spend and then manually
  marked Spendable
- WHEN the user performs a pull-to-refresh
- THEN the UTXO remains Spendable and is not re-classified as Do Not Spend

#### Scenario: New UTXO with no prior state is classified on every refresh

- GIVEN a UTXO that has never been classified (newly arrived)
- WHEN any wallet refresh completes
- THEN the UTXO is classified and its state is persisted

---

### Requirement: New Dust Toast Notification

When a wallet refresh detects one or more newly-arrived Do Not Spend UTXOs that
were not present in the wallet before the sync, the app MUST show a one-time
ephemeral toast:

> **Potential dust payment found**

The toast MUST NOT appear:
- For Do Not Spend UTXOs already known before the sync (existing in the pre-sync
  snapshot)
- During wallet import or restore flows (where `addNotifications` is false)
- More than once per sync cycle, even if multiple wallets have new dust

#### Scenario: Toast appears once when new dust UTXO is detected during normal refresh

- GIVEN a wallet with no prior Do Not Spend UTXOs
- WHEN a wallet refresh completes and a new UTXO under 5,000 sats on a reused
  address is classified Do Not Spend
- THEN a toast "Potential dust payment found" is shown once and then dismissed

#### Scenario: Toast does not appear for already-known Do Not Spend UTXOs

- GIVEN a wallet that already has a Do Not Spend UTXO from a previous sync
- WHEN the wallet performs any refresh and the UTXO is still present
- THEN no toast is shown

#### Scenario: Toast does not appear during wallet import or restore

- GIVEN a wallet is being imported or restored (addNotifications is false)
- WHEN the first wallet sync completes and UTXOs are classified
- THEN no toast is shown regardless of classification results

---

### Requirement: Manual Spendability Override

The user MUST be able to manually change the spendability state of any UTXO from
the UTXO Details screen at any time.

**Spendable UTXO:** the screen MUST show a **Mark Do Not Spend** button. Tapping it
MUST persist Do Not Spend with `isManualOverride: true` and show a success
confirmation: **Coin marked Do Not Spend**.

**Do Not Spend UTXO:** the screen MUST show:
- A reason line: either **Potential dust payment** (auto-classified) or **Marked
  manually** (manually overridden).
- An explanation: **Keeper marked this coin Do Not Spend to help protect wallet
  privacy.**
- A **Mark Spendable** button. Tapping it MUST persist Spendable with
  `isManualOverride: true` and show a success confirmation: **Coin marked
  spendable**.

The Do Not Spend state on an automatically-classified UTXO MUST NOT be removable
via normal label/tag deletion — only via the explicit Mark Spendable CTA.

#### Scenario: Mark a Spendable UTXO as Do Not Spend

- GIVEN the UTXO Details screen is showing a Spendable UTXO
- WHEN the user taps Mark Do Not Spend
- THEN the UTXO state changes to Do Not Spend with isManualOverride true, the screen
  stays on UTXO Details, and a success message "Coin marked Do Not Spend" is
  displayed

#### Scenario: Mark a Do Not Spend UTXO as Spendable

- GIVEN the UTXO Details screen is showing a Do Not Spend UTXO (automatically
  classified)
- WHEN the user taps Mark Spendable
- THEN the UTXO state changes to Spendable with isManualOverride true, the screen
  stays on UTXO Details, and a success message "Coin marked spendable" is displayed

#### Scenario: Manually marked UTXO shows correct reason

- GIVEN the UTXO Details screen is showing a Do Not Spend UTXO with isManualOverride
  true
- WHEN the screen renders the reason line
- THEN it displays "Marked manually" (not "Potential dust payment")

#### Scenario: Auto-classified UTXO shows correct reason

- GIVEN the UTXO Details screen is showing a Do Not Spend UTXO with isManualOverride
  false
- WHEN the screen renders the reason line
- THEN it displays "Potential dust payment"

---

### Requirement: Wallet Home Red Dot Indicator

The wallet card on the home screen MUST show the standard red dot indicator when
the wallet contains at least one current Do Not Spend UTXO.

#### Scenario: Red dot appears on wallet card with Do Not Spend UTXOs

- GIVEN a wallet has at least one UTXO classified as Do Not Spend
- WHEN the home screen renders the wallet card for that wallet
- THEN a red dot is shown on the wallet card

#### Scenario: Red dot does not appear when no Do Not Spend UTXOs exist

- GIVEN a wallet has no UTXOs classified as Do Not Spend
- WHEN the home screen renders the wallet card
- THEN no red dot is shown on the wallet card

---

### Requirement: View All Coins Red Dot Indicator

The **View All Coins** card in the Wallet Details quick-action strip MUST show the
standard red dot indicator when the wallet contains at least one current Do Not
Spend UTXO.

#### Scenario: Red dot appears on View All Coins when Do Not Spend UTXOs exist

- GIVEN the Wallet Details screen is open and the wallet has at least one Do Not
  Spend UTXO
- WHEN the screen renders the quick-action strip
- THEN the View All Coins card shows a red dot

#### Scenario: Red dot does not appear on View All Coins when no dust exists

- GIVEN the Wallet Details screen is open and the wallet has no Do Not Spend UTXOs
- WHEN the screen renders the quick-action strip
- THEN no red dot appears on the View All Coins card

---

### Requirement: Automatic Coin Selection Excludes Do Not Spend UTXOs

When no UTXOs have been manually selected, the automatic coin selection pool MUST
exclude all UTXOs whose `spendability` field equals `'doNotSpend'`. This applies
to both the primary send flow (`prepareTransactionPrerequisites`) and the send-max
fee calculation (`calculateSendMaxFee`).

When UTXOs have been manually selected by the user (non-empty `selectedUTXOs`),
the filter MUST NOT be applied — manually selected Do Not Spend UTXOs SHALL be
used as-is.

#### Scenario: Do Not Spend UTXOs excluded from auto coin selection

- GIVEN a wallet contains UTXOs where some have `spendability === 'doNotSpend'`
- WHEN `prepareTransactionPrerequisites` is called without a `selectedUTXOs` list
- THEN the input UTXO pool used for coinselect SHALL contain only UTXOs with
  `spendability !== 'doNotSpend'`

#### Scenario: Manually selected Do Not Spend UTXOs are not filtered

- GIVEN a wallet contains at least one UTXO with `spendability === 'doNotSpend'`
- WHEN `prepareTransactionPrerequisites` is called with that UTXO in `selectedUTXOs`
- THEN that UTXO SHALL be included in the coinselect input pool

#### Scenario: Send max excludes Do Not Spend UTXOs

- GIVEN a wallet contains UTXOs where some have `spendability === 'doNotSpend'`
- WHEN `calculateSendMaxFee` is called without a `selectedUTXOs` list
- THEN the fee calculation MUST be based only on spendable UTXOs, and the resulting
  send-max amount MUST reflect only the spendable balance

---

### Requirement: Spendable Balance Display in Send Flow

The available balance shown to the user in the send flow MUST reflect only UTXOs
with `spendability !== 'doNotSpend'`. This balance MUST be computed from
`wallet.specs.confirmedUTXOs` and `wallet.specs.unconfirmedUTXOs` filtered to
exclude Do Not Spend UTXOs, not from `specs.balances`.

#### Scenario: Available balance excludes Do Not Spend UTXOs

- GIVEN a wallet contains a mix of spendable and Do Not Spend UTXOs
- WHEN the user opens the send amount screen
- THEN the balance displayed MUST equal the sum of values for UTXOs with
  `spendability !== 'doNotSpend'`

#### Scenario: Available balance equals full balance when no Do Not Spend UTXOs exist

- GIVEN a wallet contains no UTXOs with `spendability === 'doNotSpend'`
- WHEN the user opens the send amount screen
- THEN the balance displayed MUST equal `specs.balances.confirmed + specs.balances.unconfirmed`

---

### Requirement: Do Not Spend Manual Selection Warning

When the user is in manual coin selection mode and taps a UTXO with
`spendability === 'doNotSpend'` that is not yet selected, the app MUST display a
warning modal before adding the UTXO to the selection.

**Modal title:** Use Do Not Spend Coin?

**Modal body:** This coin was marked Do Not Spend to help protect wallet privacy.
Spending it with other coins may reduce privacy.

**Buttons:**
- **Use Coin** — adds the UTXO to the manual selection
- **Cancel** — does not add the UTXO; returns to manual coin selection

This warning MUST NOT be shown during automatic coin selection (Do Not Spend coins
are excluded automatically in that path).

This warning MUST NOT be shown when tapping a Do Not Spend UTXO that is already
selected (tapping a selected UTXO deselects it; no warning required for
deselection).

#### Scenario: Warning shown when selecting a Do Not Spend UTXO

- GIVEN manual coin selection is active and a UTXO with `spendability === 'doNotSpend'`
  is not yet selected
- WHEN the user taps that UTXO row
- THEN the warning modal MUST appear with the title "Use Do Not Spend Coin?" and
  the body text

#### Scenario: Use Coin adds UTXO to selection

- GIVEN the Do Not Spend warning modal is shown
- WHEN the user taps **Use Coin**
- THEN the UTXO MUST be added to the manual selection and the modal MUST close

#### Scenario: Cancel dismisses modal without selecting

- GIVEN the Do Not Spend warning modal is shown
- WHEN the user taps **Cancel**
- THEN the UTXO MUST NOT be added to the selection and the modal MUST close

#### Scenario: No warning when deselecting a Do Not Spend UTXO

- GIVEN manual coin selection is active and a UTXO with `spendability === 'doNotSpend'`
  is already selected
- WHEN the user taps that UTXO row again
- THEN the UTXO MUST be deselected immediately with no warning modal

---

### Requirement: Donate Dust — Eligibility and CTA Visibility

When the Manage Coins screen is active and the wallet contains at least one current Do Not Spend UTXO, the app MUST display a **Donate Dust** CTA in the footer area. The CTA MUST NOT be shown when no Do Not Spend UTXOs exist.

"Current Do Not Spend" means all UTXOs with `spendability === 'doNotSpend'` on the wallet object as of the current render, regardless of their classification reason (automatic dust detection, linked to potential dust spend, or manual override).

#### Scenario: Donate Dust CTA is visible when Do Not Spend UTXOs exist

- GIVEN the user is on the Manage Coins screen
- AND the wallet has at least one UTXO with `spendability === 'doNotSpend'`
- THEN the **Donate Dust** CTA MUST be visible in the footer

#### Scenario: Donate Dust CTA is hidden when no Do Not Spend UTXOs exist

- GIVEN the user is on the Manage Coins screen
- AND no UTXO in the wallet has `spendability === 'doNotSpend'`
- THEN the **Donate Dust** CTA MUST NOT be rendered

---

### Requirement: Donate Dust — Confirmation Modal and Eligibility Check

When the user taps **Donate Dust** in the Manage Coins footer, the app MUST immediately open the donation confirmation modal. No eligibility check is performed at this point.

When the user taps **Donate Dust** inside the confirmation modal, the app MUST perform an eligibility check by estimating the minimum-fee transaction using only the Do Not Spend UTXOs as inputs, paying to the Keeper donation address.

If the estimated fee equals or exceeds the total value of all Do Not Spend UTXOs (net donation amount ≤ 0 sats), the app MUST close the modal and show the error message **"These coins are too small to donate on their own. Keeper will keep them marked Do Not Spend."** The Do Not Spend coins MUST remain marked Do Not Spend.

While the eligibility check (and subsequent transaction building) is in progress, the **Donate Dust** button inside the modal MUST be in a loading/disabled state to prevent duplicate taps.

#### Scenario: Footer CTA opens the confirmation modal immediately

- GIVEN the user is on Manage Coins with at least one Do Not Spend UTXO
- WHEN the user taps **Donate Dust** in the footer
- THEN the donation confirmation modal MUST open immediately without any loading delay

#### Scenario: Eligibility check passes — proceeds to transaction review

- GIVEN the donation confirmation modal is open
- AND the wallet's Do Not Spend UTXOs have sufficient combined value to cover the minimum fee
- WHEN the user taps **Donate Dust** inside the modal
- THEN the app performs the eligibility check
- AND on passing, the modal MUST close and the app MUST proceed to the transaction review/signing flow

#### Scenario: Eligibility check fails — modal closes and error is shown

- GIVEN the donation confirmation modal is open
- AND the wallet's Do Not Spend UTXOs combined value is insufficient to cover the minimum fee
- WHEN the user taps **Donate Dust** inside the modal
- THEN the modal MUST close
- AND the app MUST show the error: **"These coins are too small to donate on their own. Keeper will keep them marked Do Not Spend."**
- AND all Do Not Spend coins MUST remain marked Do Not Spend

#### Scenario: Donate Dust button is disabled during in-progress check

- GIVEN the eligibility check is in progress after the user tapped **Donate Dust** in the modal
- WHEN the user attempts to tap **Donate Dust** again
- THEN the second tap MUST be ignored

---

### Requirement: Donate Dust — Confirmation Modal Copy

The donation confirmation modal MUST include:

- **Title:** Donate Dust?
- **Body:** This helps clear dust / Do Not Spend coins for better privacy. Keeper will use only Do Not Spend coins for this transaction. Fees will be paid from those coins only.
- **Warning line:** No spendable coins will be used.
- **Detail line:** Any amount left after fees will be donated to support Keeper.
- **Donate Dust** button — proceeds to the transaction review/signing flow
- **Cancel** button — closes the modal and returns to Manage Coins without any state change

#### Scenario: Confirmation modal shows correct copy

- GIVEN the user tapped **Donate Dust** in the Manage Coins footer
- WHEN the donation confirmation modal opens
- THEN the modal MUST display the title "Donate Dust?", body text, warning, and detail line as specified

#### Scenario: Cancel returns to Manage Coins without changes

- GIVEN the donation confirmation modal is open
- WHEN the user taps **Cancel**
- THEN the modal MUST close
- AND no coins MUST change state
- AND the user remains on Manage Coins

---

### Requirement: Donate Dust — Transaction Rules

When the user confirms the donation, the app MUST build a transaction that:

- Uses **only** the current Do Not Spend UTXOs as inputs — normal spendable UTXOs MUST NOT be included.
- Pays fees from those UTXOs only — no additional inputs are added to cover the fee.
- Uses the **low** (minimum) fee rate from the current fee estimates.
- Sends the remaining amount after fees to the Keeper donation address: `bc1qyqequr0824nwf7snzvq5gqsr6xscn62e3ttm06`.

After confirmation, the transaction MUST proceed through the existing transaction review/signing flow (`SendConfirmation` screen) with the recipient, UTXOs, and fee priority pre-populated and locked. The fee priority selector MUST NOT be editable in this flow.

#### Scenario: Donation transaction uses only Do Not Spend UTXOs

- GIVEN the user confirms the donation
- WHEN the transaction is built
- THEN ALL current Do Not Spend UTXOs MUST be used as inputs
- AND no spendable UTXOs MUST be included

#### Scenario: Donation fee is paid from Do Not Spend coins only

- GIVEN the donation transaction is being built
- WHEN the fee is calculated
- THEN the fee MUST be deducted from the Do Not Spend UTXOs' total value
- AND normal spendable coins MUST NOT be added as additional inputs to cover the fee

#### Scenario: Donation proceeds to locked transaction review screen

- GIVEN the user confirmed the donation and transaction building succeeded
- WHEN the transaction review screen opens
- THEN the recipient address MUST be pre-populated as `bc1qyqequr0824nwf7snzvq5gqsr6xscn62e3ttm06`
- AND the fee priority MUST be locked to **low** with no user-editable fee selector

---

### Requirement: Donate Dust — Success and Transaction History

After a successful donation transaction is broadcast:

- The app MUST show the success message: **Dust donated**
- The transaction MUST appear in the wallet's normal transaction history with no special label required.

#### Scenario: Successful donation shows success message

- GIVEN the donation transaction was signed and broadcast successfully
- THEN the app MUST display the message **"Dust donated"**

#### Scenario: Donation transaction appears in transaction history

- GIVEN the donation transaction was broadcast
- WHEN the user views the transaction history
- THEN the donation transaction MUST appear as a normal outgoing transaction

---

### Requirement: walletOutputs Persisted on Every Transaction

> **`walletOutputs` is required only for dust scan mode.** The backfill step that
> populates `walletOutputs` for pre-existing transactions MUST run only when
> `dustScan: true` is set. Soft and hard refresh do NOT run the backfill and do
> NOT require `walletOutputs` to be present.

The app MUST store the wallet-owned outputs of each transaction as `walletOutputs`
— an array of `{address: string, valueSats: number}` entries — on the `Transaction`
object at the time the transaction is first constructed via `transformElectrumTxToTx`.

Only outputs whose address is owned by the wallet (present in `externalAddresses`
or `internalAddresses` at sync time) MUST be included. External recipient addresses
MUST NOT be stored.

For existing transactions that predate this feature (where `walletOutputs` is
absent), the app MUST perform a backfill during any `refreshWalletsWorker` pass
with `hardRefresh: true`: batch-fetch raw transaction data from Electrum for all
transactions missing `walletOutputs`, extract wallet-owned outputs, and persist
the result before running dust classification. The backfill is idempotent — once
all transactions are populated, subsequent hard-refreshes skip it immediately.

#### Scenario: walletOutputs populated for a new incoming transaction

- GIVEN a wallet receives a new confirmed transaction with two outputs: one to a
  wallet receive address (5,000 sats) and one to an external address
- WHEN the transaction is processed during a wallet sync
- THEN `walletOutputs` on the stored Transaction object contains exactly one entry:
  `{address: <wallet-receive-address>, valueSats: 5000}`

#### Scenario: walletOutputs populated for a new send transaction with change

- GIVEN a wallet sends a transaction where one output is change to a wallet-owned
  internal address (12,000 sats) and one output is to an external recipient
- WHEN the transaction is processed during a wallet sync
- THEN `walletOutputs` contains exactly one entry for the change address with
  `valueSats: 12000`

#### Scenario: walletOutputs backfilled for existing transactions during a hard-refresh

- GIVEN an existing wallet with 50 confirmed transactions all lacking `walletOutputs`
- WHEN the user triggers a hard-refresh
- THEN `walletOutputs` is populated on all 50 transactions before dust classification
  runs, using Electrum batch fetch

#### Scenario: walletOutputs backfill is skipped on both normal and hard refresh

- GIVEN an existing wallet with 50 confirmed transactions all lacking `walletOutputs`
- WHEN a normal wallet refresh OR a hard refresh completes (no `dustScan` flag)
- THEN no Electrum backfill calls are made; classification runs against current
  UTXOs only

---

### Requirement: Address-Level Taint Detection from Transaction History

> **This phase runs only when the refresh worker is invoked with `dustScan: true`.**
> During normal and hard refresh, only the current UTXO set is evaluated; the
> historical `walletOutputs` scan described here is skipped.

The app MUST identify wallet addresses as tainted by scanning `walletOutputs`
across all transactions in wallet history, without relying on the current UTXO set.

An address MUST be classified as initially tainted when it received a wallet output
with `valueSats < 5000` AND one of the following address conditions was true **at
the time that transaction was received**:

- **Reused receive address**: The address is on the external chain AND had appeared
  as a recipient address in any earlier transaction (earlier by `blockTime`).
- **Out-of-order receive address**: The address is on the external chain AND its
  derivation index is lower than the highest external address index that had
  received in any earlier transaction.
- **Reused change address**: The address is on the internal chain AND had appeared
  as a recipient address in any earlier transaction.

The address conditions MUST be evaluated at the historical blockTime of the
triggering transaction, not against the current wallet state.

#### Scenario: Taint detected for a spent dust UTXO on a reused receive address

- GIVEN a wallet whose transaction history includes: Tx0 (external → address A,
  80,000 sats) and Tx1 (attacker → address A, 546 sats, received later), and
  address A is no longer in `confirmedUTXOs` because both UTXOs were spent
- WHEN dust classification runs
- THEN address A is identified as initially tainted (A received 546 sats and had
  already received in Tx0 before Tx1)

#### Scenario: Large UTXO at tainted address is marked Do Not Spend

- GIVEN address A is tainted (it received a triggering dust UTXO) AND address A
  currently has a 500,000-sat unspent UTXO
- WHEN dust classification runs
- THEN the 500,000-sat UTXO is marked Do Not Spend with reason Potential dust payment

#### Scenario: Fresh address with single small legitimate receive is not tainted

- GIVEN address B (external index 5, never previously received) receives 3,000 sats
  as its first-ever transaction, and no higher-indexed address had received before
- WHEN dust classification runs
- THEN address B is NOT tainted (no reuse, no out-of-order condition met)

#### Scenario: Out-of-order address is tainted using historical index state

- GIVEN wallet history shows address C (external index 3) received after address D
  (external index 5) had already received — making C out-of-order at the time of
  its receive
- AND address C received 2,000 sats in that out-of-order transaction
- WHEN dust classification runs
- THEN address C is initially tainted based on the out-of-order condition at that
  historical blockTime

---

### Requirement: Forward Taint Propagation Through Spending Graph

> **This phase runs only when the refresh worker is invoked with `dustScan: true`.**
> During normal (soft) and hard refresh, only initial taint detection runs; forward
> propagation to descendants is skipped.

The app MUST propagate address taint forward through wallet transaction history
using a breadth-first traversal of the spending graph.

For each initially tainted address, the app MUST find all transactions where that
address appears in `senderAddresses`. For each such transaction, all wallet-owned
addresses in `recipientAddresses` MUST also be marked tainted. This process MUST
continue iteratively until no new addresses are added.

The propagation MUST use only data already stored in `wallet.specs.transactions`
(`senderAddresses`, `recipientAddresses`). No additional Electrum queries are
required for propagation.

The propagation MUST NOT mark external (non-wallet-owned) recipient addresses as
tainted.

**Manual override breaks the propagation chain**: If any UTXO at a tainted address
has `isManualOverride: true` (the user has explicitly marked it Spendable), that
address MUST be excluded from the BFS frontier. Its wallet-owned recipient addresses
in spending transactions MUST NOT be tainted. The override breaks the chain at that
address; previously-propagated taint on earlier addresses is unaffected.

#### Scenario: Layer-1 descendant address is tainted

- GIVEN address X is initially tainted AND wallet transaction Tx1 has X in
  `senderAddresses` AND wallet-owned change address D in `recipientAddresses`
- WHEN dust classification runs the BFS propagation
- THEN address D is added to the tainted set

#### Scenario: Layer-2 descendant address is tainted

- GIVEN address D was tainted in the previous propagation step AND wallet transaction
  Tx2 has D in `senderAddresses` AND wallet-owned change address E in
  `recipientAddresses`
- WHEN dust classification continues the BFS
- THEN address E is also added to the tainted set

#### Scenario: External recipient addresses are not tainted

- GIVEN address X is tainted AND Tx1 sends to an external address (not wallet-owned)
  alongside wallet change address D
- WHEN dust classification runs
- THEN only D is tainted; the external address is not tracked

#### Scenario: Already-tainted address is not re-processed

- GIVEN address X is initially tainted AND appears as sender in two separate
  transactions Tx1 and Tx2
- WHEN BFS propagation processes both transactions
- THEN X is not added to the frontier a second time, and its output addresses from
  both transactions are each added at most once

#### Scenario: Manual override on auto-classified Do Not Spend UTXO breaks BFS chain

- GIVEN address X is initially tainted AND the user has marked the UTXO at address X
  as Spendable (`isManualOverride: true`)
- AND wallet transaction Tx1 has X in `senderAddresses` AND wallet-owned address D
  in `recipientAddresses`
- WHEN dust classification runs the BFS propagation
- THEN address D is NOT added to the tainted set (override at X breaks the chain)

#### Scenario: Manual override on descendant UTXO breaks further propagation

- GIVEN address D was tainted by propagation AND the user has marked the UTXO at
  address D as Spendable (`isManualOverride: true`)
- AND wallet transaction Tx2 has D in `senderAddresses` AND wallet-owned address E
  in `recipientAddresses`
- WHEN dust classification runs the BFS propagation
- THEN address E is NOT added to the tainted set (override at D breaks the chain
  at that hop)

---

### Requirement: Descendant UTXOs Marked Do Not Spend

All current wallet-owned UTXOs whose address is in the tainted set (whether
initially tainted or tainted by propagation) MUST be marked Do Not Spend, unless
the UTXO has `isManualOverride: true`.

`dustReason` MUST be assigned as follows:

| UTXO | `dustReason` |
|---|---|
| The sub-threshold UTXO (`value < 5,000`) at an initially tainted address (the triggering dust output) | `'initial'` |
| Any other UTXO at an initially tainted address whose value is **at or above** the dust threshold (adjacent coin at the same tainted address) | `'adjacent'` |
| Any UTXO at an address tainted solely by BFS propagation (downstream of a dust spend) | `'descendant'` |

Both `'adjacent'` and `'descendant'` display as **Linked to potential dust spend**
in the UTXO detail screen; only `'initial'` displays as **Potential dust payment**.

The `dustReason` field MUST be persisted on the UTXO and MUST survive hard refresh
via the pre-sync snapshot mechanism.

#### Scenario: UTXO at an initially tainted address is marked Do Not Spend

- GIVEN address X is initially tainted AND UTXO U is at address X with
  `isManualOverride: false`
- WHEN UTXO marking runs
- THEN U has `spendability: 'doNotSpend'` and `dustReason: 'initial'`

#### Scenario: UTXO at a propagation-tainted address is marked Do Not Spend

- GIVEN address D is tainted by forward propagation AND UTXO V is at address D
  with `isManualOverride: false`
- WHEN UTXO marking runs
- THEN V has `spendability: 'doNotSpend'` and `dustReason: 'descendant'`

#### Scenario: Manual override is respected during taint-based classification

- GIVEN UTXO W is at a tainted address BUT `isManualOverride: true` and
  `spendability: 'spendable'`
- WHEN UTXO marking runs
- THEN W retains `spendability: 'spendable'` and is not reclassified

#### Scenario: Manual override survives hard refresh

- GIVEN UTXO W was manually marked Spendable (`isManualOverride: true`) on a tainted
  address
- WHEN the user performs a pull-to-refresh (hard refresh)
- THEN W retains `spendability: 'spendable'` after the refresh

#### Scenario: Non-manual doNotSpend from prior dust scan is preserved across soft/hard refresh

- GIVEN UTXO V has `spendability: 'doNotSpend'` and `dustReason: 'descendant'` set
  by a prior dust scan (no `isManualOverride`)
- AND the current soft or hard refresh does not detect V's address as tainted
- WHEN the refresh completes
- THEN V retains `spendability: 'doNotSpend'` and `dustReason: 'descendant'`

#### Scenario: Full dust scan can clear a descendant marking if the address is no longer reachable via BFS

- GIVEN UTXO V was previously marked `doNotSpend` with `dustReason: 'descendant'`
  by an earlier dust scan
- AND the user subsequently marked the upstream tainted address as Spendable
  (`isManualOverride: true`), breaking the BFS chain
- WHEN a new dust scan runs
- THEN V is no longer reachable via BFS from any tainted address and is reclassified
  as `spendable`

---

### Requirement: Potential Dust Spend Transaction Label

> **This phase runs only when the refresh worker is invoked with `dustScan: true`.**
> Transaction labels are not updated during normal or hard refresh.

Any wallet transaction where at least one address in `senderAddresses` is in the
tainted set MUST be labelled as a **Potential dust spend** in the transaction history.

The transaction list item MUST display the **Potential dust spend** label on any
such transaction.

The transaction detail screen MUST display the explanation:
> This transaction may have spent a suspicious small amount together with other
> wallet funds. This may have reduced wallet privacy.

No action or CTA is required on the transaction detail for this label — it is
informational only.

#### Scenario: Transaction with tainted sender is labelled Potential dust spend in list

- GIVEN wallet transaction Tx1 has tainted address X in its `senderAddresses`
- WHEN the transaction list renders
- THEN Tx1 shows the Potential dust spend label

#### Scenario: Transaction detail shows privacy explanation for Potential dust spend

- GIVEN wallet transaction Tx1 is labelled Potential dust spend
- WHEN the user opens the transaction detail for Tx1
- THEN the explanation "This transaction may have spent a suspicious small amount
  together with other wallet funds. This may have reduced wallet privacy." is shown
- AND no action button is shown for the label

#### Scenario: Clean transaction is not labelled

- GIVEN wallet transaction Tx2 has only clean (non-tainted) addresses in its
  senderAddresses
- WHEN the transaction list renders
- THEN Tx2 does not show any Potential dust spend label

---

### Requirement: Dedicated Dust Scan Operation

The app MUST support a dedicated **dust scan** mode, separate from the normal wallet
sync cycle. The dust scan is triggered by passing `dustScan: true` in the wallet
refresh options.

During a dust scan the app MUST run the full three-phase classification:
1. **walletOutputs backfill** — populate `walletOutputs` for any transactions missing
   it (Electrum batch fetch); idempotent after first run.
2. **Initial taint detection** — scan `walletOutputs` across all transaction history
   to identify initially tainted addresses (including historically spent dust).
3. **Forward propagation (BFS)** — propagate taint to descendant addresses through
   the spending graph.
4. **Transaction labelling** — apply `potential-dust-spend` tags to all transactions
   where a tainted address appears in `senderAddresses`.

During a normal (soft) refresh or hard refresh, the app MUST run **only** current
UTXO classification: for each current UTXO with `valueSats < 5,000`, evaluate
address reuse and out-of-order conditions using existing transaction history data
(no Electrum calls, no walletOutputs, no BFS, no tx labels).

**Preservation of prior dust scan results**: During a soft or hard refresh, if a
UTXO is not found in the current scan's tainted set, the app MUST preserve any
existing `doNotSpend` classification and `dustReason` that was set by a prior dust
scan (i.e. snapshot `spendability === 'doNotSpend'` without `isManualOverride`).
Only an explicit dust scan (with full BFS) has authority to clear such markings,
because only it has a complete picture of the spending graph.

Manual override semantics are identical across all modes: any UTXO with
`isManualOverride: true` is never reclassified automatically.

#### Scenario: Normal refresh classifies initial taint only (no prior dust scan)

- GIVEN a wallet whose address X received 546 sats on a reused address (initially
  tainted), and address D was funded by a spend from X (descendant), and NO prior
  dust scan has ever run
- WHEN a normal wallet sync runs (no `dustScan` flag)
- THEN the UTXO at X is marked Do Not Spend with `dustReason: 'initial'`
- AND the UTXO at D is NOT marked Do Not Spend (BFS skipped; no prior
  classification to preserve)

#### Scenario: Normal refresh preserves descendant Do Not Spend from a prior dust scan

- GIVEN a prior dust scan already marked the UTXO at address D as `doNotSpend`
  with `dustReason: 'descendant'`
- WHEN a subsequent normal (soft) or hard refresh runs (no `dustScan` flag) and
  the current scan does not detect D as initially tainted
- THEN the UTXO at D retains `spendability: 'doNotSpend'` and
  `dustReason: 'descendant'`
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

- GIVEN UTXO W is at a tainted address and has `isManualOverride: true,
  spendability: 'spendable'`
- WHEN either a normal refresh, hard refresh, or dust scan runs
- THEN W retains `spendability: 'spendable'` in all cases

---

### Requirement: UTXO Details Shows Correct Reason for Descendant Do Not Spend

When a UTXO is marked Do Not Spend with `dustReason: 'descendant'`, the UTXO detail
screen MUST display:

- Reason: **Linked to potential dust spend**
- Explanation: **Keeper marked this coin Do Not Spend to help protect wallet privacy.**
- A **Mark Spendable** button

On tapping Mark Spendable, the UTXO MUST be marked `spendability: 'spendable'` with
`isManualOverride: true`. The screen MUST remain open and show a **Coin marked
spendable** success feedback.

#### Scenario: UTXO detail shows Linked reason for descendant Do Not Spend

- GIVEN a UTXO with `dustReason: 'descendant'` and `spendability: 'doNotSpend'`
- WHEN the UTXO detail screen renders
- THEN the reason line shows Linked to potential dust spend and the explanation and
  Mark Spendable button are visible

#### Scenario: Mark Spendable persists for a descendant Do Not Spend UTXO

- GIVEN a descendant Do Not Spend UTXO is displayed in UTXO detail
- WHEN the user taps Mark Spendable
- THEN `spendability` is set to `'spendable'`, `isManualOverride` is set to `true`,
  and a Coin marked spendable toast is shown
- AND after the next wallet refresh the UTXO remains Spendable
