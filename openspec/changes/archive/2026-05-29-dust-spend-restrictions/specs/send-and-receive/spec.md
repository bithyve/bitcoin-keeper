## MODIFIED Requirements

### Requirement: Send Phase One — Fee Estimation

The app MUST calculate transaction prerequisites (UTXOs, outputs, and fees) for LOW,
MEDIUM, HIGH, and CUSTOM priority levels before presenting a confirmation screen.

The app MUST display the estimated confirmation time (in blocks) alongside the fee
amount for each priority level.

The app MUST NOT allow the send flow to proceed if the selected UTXOs cannot cover
the send amount plus the estimated fee for the chosen priority.

The app MUST NOT allow initiating a send from a watch-only wallet (a wallet without
a private key). Watch-only copy: "This wallet can show balances and transactions,
but cannot send bitcoin."

The app MUST NOT allow initiating a send from an archived wallet. To send from an
archived wallet, the user must unarchive it first.

Unconfirmed bitcoin transactions are included in wallet balance and shown as
pending/unconfirmed in transaction history.

The automatic coin selection pool MUST exclude UTXOs with `spendability === 'doNotSpend'`
when no UTXOs have been manually pre-selected. Manually pre-selected UTXOs are used as-is regardless of spendability.

#### Scenario: Fee estimation succeeds

- GIVEN the user has a wallet with a confirmed or unconfirmed spendable balance
- WHEN the user enters a valid recipient address and amount and proceeds to the confirmation screen
- THEN the app displays the LOW, MEDIUM, and HIGH fee options each with a fee amount in sats and an estimated confirmation time in blocks
- AND the CUSTOM fee option is presented for manual input

#### Scenario: Insufficient balance

- GIVEN the user has a wallet whose spendable balance is less than the requested amount plus the minimum fee
- WHEN the user attempts to proceed to the confirmation screen
- THEN the app surfaces an error indicating insufficient balance and does not advance the send flow

#### Scenario: Send attempted from watch-only wallet

- GIVEN the user has a watch-only wallet (imported xpub without a private key)
- WHEN the user attempts to initiate a send from that wallet
- THEN the app prevents the send and displays "This wallet can show balances and transactions, but cannot send bitcoin."

#### Scenario: Do Not Spend UTXOs excluded from automatic coin selection

- GIVEN a wallet contains UTXOs where some have spendability Do Not Spend and no UTXOs have been manually pre-selected
- WHEN the send phase one calculation runs
- THEN only UTXOs with spendability Spendable are considered for the transaction inputs

---

## MODIFIED Requirements

### Requirement: Available Balance

The available balance shown to the user in the send flow MUST reflect only UTXOs that are spendable (i.e., `spendability !== 'doNotSpend'`). The balance MUST be computed from the filtered UTXO arrays at display time, not from the pre-computed `specs.balances` aggregate.

#### Scenario: Spendable balance displayed in send flow

- GIVEN a wallet contains both spendable UTXOs and Do Not Spend UTXOs
- WHEN the user opens the send amount entry screen
- THEN the balance displayed MUST equal the sum of values for spendable UTXOs only

