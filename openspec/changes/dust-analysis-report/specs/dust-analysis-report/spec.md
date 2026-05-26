## ADDED Requirements

### Requirement: Dust Report start screen

The Dust Report start screen SHALL display the title "Dust Report" and the body copy "Keeper can scan this wallet for dust activity and show coins that may reduce privacy if spent." It SHALL provide a "Run Report" primary CTA and a "Cancel" secondary CTA. Tapping "Run Report" SHALL immediately begin the scan. Tapping "Cancel" SHALL return the user to Wallet Settings without running a scan.

#### Scenario: User views start screen and taps Run Report

- GIVEN the user has navigated to the Dust Report screen from Wallet Settings
- WHEN the start screen is rendered
- THEN the title "Dust Report" is displayed
- AND the body copy matches the requirement exactly
- AND two CTAs are shown: "Run Report" and "Cancel"
- WHEN the user taps "Run Report"
- THEN the scanning state begins for that wallet

#### Scenario: User cancels from start screen

- GIVEN the Dust Report start screen is displayed
- WHEN the user taps "Cancel"
- THEN the user is returned to Wallet Settings
- AND no scan is triggered

---

### Requirement: Scanning Wallet state

While the dust analysis scan is in progress, the screen SHALL display the title "Scanning Wallet" and the body copy "Keeper is checking this wallet for potential dust activity. This may take a few minutes." The screen SHALL reveal up to three non-technical progress items sequentially: "Checking wallet coins", "Checking past transactions", "Preparing report". The scanning state SHALL be driven by dispatching `refreshWallets` with `dustScan: true`. The screen SHALL monitor `walletSyncing[wallet.id]` to detect scan completion.

#### Scenario: Progress items appear during scan

- GIVEN the user has tapped "Run Report" and the scan is in progress
- WHEN the scanning screen is rendered
- THEN the title "Scanning Wallet" and the correct body copy are displayed
- AND progress items are revealed one by one as the scan proceeds (cosmetic, not tied to real saga steps)

#### Scenario: Scan completes successfully

- GIVEN the scanning screen is displayed and the scan is in progress
- WHEN `walletSyncing[walletId]` transitions to `false`
- THEN the last-scanned timestamp SHALL be written to MMKV under the key `dust-report-lastScanned-{walletId}`
- AND the report result screen SHALL be shown with data derived from the wallet's updated `Wallet` state

#### Scenario: Scan fails

- GIVEN the scanning screen is displayed and the scan is in progress
- WHEN the scan throws an error
- THEN the error state ("Report Not Completed") SHALL be shown
- AND no partial report data SHALL be displayed

---

### Requirement: Report result — findings found

When the scan finds at least one Active Dust UTXO, Linked Coin, or Past Dust Spend, the report screen SHALL display the title "Dust Report" and the summary copy "Keeper found coins or transactions that may reduce wallet privacy." A summary card SHALL show: Do Not Spend coin count, total amount marked Do Not Spend in sats, past dust spend count, and last scanned time. Three sections SHALL be shown: Active Dust, Linked Coins, and Past Dust Spends. Report rows SHALL be static (non-tappable) in this version.

#### Scenario: Summary card values are correct

- GIVEN the scan has completed and wallet `W` has 3 UTXOs with `spendability === 'doNotSpend'` (values: 400, 600, 800 sats) and 1 transaction tagged `potential-dust-spend`
- WHEN the report result screen renders
- THEN the summary card shows "Do Not Spend coins: 3"
- AND "Amount marked Do Not Spend: 1,800 sats"
- AND "Past dust spends: 1"
- AND "Last scanned" shows the timestamp written to MMKV at scan completion

#### Scenario: Active Dust section shows initial-taint UTXOs

- GIVEN the scan has completed and wallet `W` has UTXOs with `dustReason === 'initial'` and `spendability === 'doNotSpend'`
- WHEN the Active Dust section renders
- THEN each row displays the UTXO value in sats, the label "Do Not Spend", and the reason "Potential dust payment"
- AND rows are not tappable

#### Scenario: Active Dust section empty state

- GIVEN the scan has completed and wallet `W` has no UTXOs with `dustReason === 'initial'`
- WHEN the Active Dust section renders
- THEN the empty state copy "No active dust found." is displayed

#### Scenario: Linked Coins section shows adjacent and descendant UTXOs

- GIVEN the scan has completed and wallet `W` has UTXOs with `dustReason === 'adjacent'` or `dustReason === 'descendant'` and `spendability === 'doNotSpend'`
- WHEN the Linked Coins section renders
- THEN each row displays the UTXO value in sats, the label "Do Not Spend", and the reason "Linked to potential dust spend"

#### Scenario: Linked Coins section empty state

- GIVEN the scan has completed and wallet `W` has no linked coin UTXOs
- WHEN the Linked Coins section renders
- THEN the empty state copy "No linked coins found." is displayed

#### Scenario: Past Dust Spends section shows tagged transactions

- GIVEN the scan has completed and wallet `W` has transactions tagged `potential-dust-spend`
- WHEN the Past Dust Spends section renders
- THEN each row displays the transaction date, amount (if available), and the label "Potential dust spend"

#### Scenario: Past Dust Spends section empty state

- GIVEN the scan has completed and wallet `W` has no transactions tagged `potential-dust-spend`
- WHEN the Past Dust Spends section renders
- THEN the empty state copy "No past dust spends found." is displayed

---

### Requirement: Report result — no dust found (empty state)

When the scan finds no Active Dust UTXOs, no Linked Coins, and no Past Dust Spends, the screen SHALL display the title "No Dust Found" and the body copy "Keeper did not find potential dust activity in this wallet." A single "Done" CTA SHALL be shown. The "Donate Dust" CTA SHALL NOT appear.

#### Scenario: Empty state displayed when no dust found

- GIVEN the scan has completed and wallet `W` has no UTXOs with `spendability === 'doNotSpend'` and no transactions tagged `potential-dust-spend`
- WHEN the report result renders
- THEN the title "No Dust Found" is displayed
- AND the body copy matches the requirement exactly
- AND only the "Done" CTA is shown
- AND no Donate Dust CTA is present

---

### Requirement: Error state

When the scan fails to complete, the screen SHALL display the title "Report Not Completed" and the body copy "Keeper could not complete the dust report. Try again." A "Try Again" primary CTA and a "Cancel" secondary CTA SHALL be shown. Tapping "Try Again" SHALL re-trigger the scan. Tapping "Cancel" SHALL return the user to Wallet Settings.

#### Scenario: Try Again re-triggers scan

- GIVEN the error state is displayed after a failed scan
- WHEN the user taps "Try Again"
- THEN the scanning state begins again for that wallet

#### Scenario: Cancel from error state returns to settings

- GIVEN the error state is displayed
- WHEN the user taps "Cancel"
- THEN the user is returned to Wallet Settings

---

### Requirement: Donate Dust CTA on report result

The "Donate Dust" CTA SHALL appear on the report result screen only when the wallet has at least one current UTXO with `spendability === 'doNotSpend'`. It SHALL NOT appear when the report has only past dust spends with no current Do Not Spend coins. Tapping "Donate Dust" SHALL open an inline confirmation bottom sheet. Confirming SHALL navigate to the send/signing flow with all Do Not Spend UTXOs pre-selected, locked to the donation address (`bc1qyqequr0824nwf7snzvq5gqsr6xscn62e3ttm06` on mainnet), and locked to the low fee rate.

#### Scenario: Donate Dust CTA visible when eligible coins exist

- GIVEN the report result shows at least one UTXO with `spendability === 'doNotSpend'`
- WHEN the result screen renders
- THEN the "Donate Dust" CTA is displayed alongside "Done"

#### Scenario: Donate Dust CTA absent when only historical data exists

- GIVEN the report result has one or more past dust spends but no current Do Not Spend UTXOs
- WHEN the result screen renders
- THEN the "Donate Dust" CTA is NOT displayed
- AND only "Done" is shown

#### Scenario: Donate Dust confirmation and handoff

- GIVEN the Donate Dust CTA is visible on the result screen
- WHEN the user taps "Donate Dust"
- THEN a confirmation bottom sheet is shown with the title and body copy matching the dust-donation spec
- WHEN the user confirms
- THEN navigation proceeds to the send/signing screen with all Do Not Spend UTXOs pre-selected, the donation address as recipient, and the low fee rate locked (no user editing)

#### Scenario: Donate Dust cancelled from confirmation sheet

- GIVEN the donate dust confirmation sheet is open
- WHEN the user taps "Cancel" in the sheet
- THEN the sheet closes and the report result screen is shown unchanged

---

### Requirement: Last scanned timestamp persistence

The system SHALL persist the last-scanned timestamp for each wallet in MMKV under the key `dust-report-lastScanned-{walletId}` as a millisecond epoch number. The timestamp SHALL be written immediately after a successful scan completes (when `walletSyncing[walletId]` drops to `false`). If the key is absent, the summary card SHALL display "Never" as the last scanned value.

#### Scenario: Timestamp written after successful scan

- GIVEN a dust scan has completed successfully for wallet `W`
- WHEN `walletSyncing[W.id]` transitions to `false`
- THEN MMKV key `dust-report-lastScanned-{W.id}` SHALL be set to the current time as a millisecond epoch number

#### Scenario: Timestamp absent shows Never

- GIVEN no dust scan has ever been run for wallet `W`
- WHEN the report result screen renders the summary card
- THEN the "Last scanned" field displays "Never"

#### Scenario: Timestamp survives app restart

- GIVEN a successful scan was run for wallet `W` and the timestamp was written to MMKV
- WHEN the user force-closes and reopens the app and then re-runs the scan
- THEN the previous timestamp was stored durably (MMKV persists across app restarts)
- AND the new timestamp replaces it after the next scan completes
