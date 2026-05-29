# Dust UTXO Classification Specification

## Purpose

The Dust UTXO Classification domain provides automatic detection and classification
of potential dust payments into Bitcoin wallets. The feature classifies each
wallet-owned UTXO as either **Spendable** or **Do Not Spend** during every wallet
sync, persists that state across refreshes, allows the user to override it manually,
and surfaces visual indicators wherever dust UTXOs are present.

---

## Requirements

### Requirement: Automatic Dust Classification

The app MUST automatically classify every current wallet-owned UTXO (confirmed and
unconfirmed) as either **Spendable** or **Do Not Spend** during every wallet sync.
Classification runs inside the wallet refresh flow for both wallets and vaults.

A UTXO MUST be classified as **Do Not Spend** when its value is strictly less than
5,000 satoshis AND one of the following address conditions is met:

**Receive address (external chain):**
- The receiving address has already received funds in a prior transaction, OR
- The receiving address index is lower than the highest external address index that
  had received funds before the current sync batch began.

**Change address (internal chain):**
- The change address has already received funds in a prior transaction (indicating
  an external sender paid to a known change address).

In all other cases, the UTXO MUST be classified as **Spendable**.

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

#### Scenario: UTXO above threshold on a reused address is classified Spendable

- GIVEN a wallet that has previously received funds at receive address index 2
- WHEN a new UTXO of 10,000 sats arrives at that same address
- THEN the UTXO is classified as Spendable regardless of address reuse

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
