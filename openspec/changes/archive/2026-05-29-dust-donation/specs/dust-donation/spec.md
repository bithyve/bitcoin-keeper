## ADDED Requirements

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
