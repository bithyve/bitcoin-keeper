## MODIFIED Requirements

### Requirement: Automatic Dust Classification

The app MUST automatically classify every current wallet-owned UTXO (confirmed and unconfirmed) as either **Spendable** or **Do Not Spend** during every wallet sync. Classification runs inside the wallet refresh flow for both wallets and vaults.

Classification is driven by address-level taint, not individual UTXO values. During soft and hard refresh the app evaluates the **current UTXO set** (confirmed and unconfirmed) directly — no `walletOutputs` backfill or historical transaction scan is required. For each current UTXO with `valueSats < 5,000`, the app checks whether the receiving address is tainted by evaluating address conditions against existing transaction history (`recipientAddresses`) already stored in the wallet:

**Receive address (external chain):**
- The address appears in `recipientAddresses` of more than one transaction (reused), OR
- The address derivation index is lower than the highest external index that had received in any earlier transaction (out-of-order).

**Change address (internal chain):**
- The address appears in `recipientAddresses` of more than one transaction (reused change address).

The sub-threshold value (`valueSats < 5,000`) is the **trigger** for evaluating address conditions. Once an address is identified as tainted, **all** UTXOs at that address MUST be classified as **Do Not Spend**, regardless of the individual UTXO value — including UTXOs whose value is well above the dust threshold. The value check only determines which UTXOs act as triggers; the marking itself is address-wide.

In all other cases, UTXOs MUST be classified as **Spendable**.

> **Dust scan (`dustScan: true`) extends this**: the full historical `walletOutputs` scan and BFS descendant propagation run, catching dust that was already spent before Keeper could evaluate it and tracing taint to descendant UTXOs. See the `dust-descendant-classification` spec.

Detection MUST use satoshi amounts only. Fiat value MUST NOT influence classification. Out-of-order detection MUST NOT be applied to change addresses.

#### Scenario: UTXO under threshold on reused receive address is classified Do Not Spend

- GIVEN a wallet that has previously received funds at receive address index 3
- WHEN a new UTXO of 2,000 sats arrives at that same address during a wallet sync
- THEN the UTXO is classified as Do Not Spend with reason Potential dust payment

#### Scenario: UTXO under threshold on out-of-order receive address is classified Do Not Spend

- GIVEN a wallet whose highest previously-used receive address index is 7
- WHEN a new UTXO of 1,500 sats arrives at receive address index 4 (which has never received before)
- THEN the UTXO is classified as Do Not Spend with reason Potential dust payment

#### Scenario: UTXO under threshold on reused change address is classified Do Not Spend

- GIVEN a wallet whose change address index 2 was previously used as a change output and then received an external payment
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

- GIVEN address X (external index 2, previously received) currently holds two unspent UTXOs: a 546-sat UTXO (the triggering dust payment, still unspent) and a 500,000-sat UTXO
- AND address X is reused (it appears in more than one transaction's `recipientAddresses`)
- WHEN a soft or hard refresh runs dust classification
- THEN the 546-sat UTXO acts as the trigger: address X is identified as tainted
- AND **both** the 546-sat UTXO and the 500,000-sat UTXO are classified as Do Not Spend with reason Potential dust payment

> **Note**: if the 546-sat triggering UTXO had already been spent before the refresh ran, soft/hard refresh would not detect the taint (the address has no current sub-threshold UTXO to act as a trigger). A full dust scan (`dustScan: true`) is required to catch historically spent dust.

#### Scenario: Large UTXO above threshold on a non-tainted reused address is classified Spendable

- GIVEN address Y (external index 4, previously received) has never received any UTXO with valueSats < 5,000 — so it is not tainted — AND address Y now holds a 10,000-sat UTXO
- WHEN dust classification runs
- THEN the 10,000-sat UTXO is classified as Spendable
