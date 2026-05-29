## Why

Do Not Spend UTXOs accumulate in wallets as dust and privacy hazards, but users currently have no active way to clear them — they just sit, unusable by normal sends. This change gives users a one-tap "Donate Dust" action that sweeps all Do Not Spend coins into a single minimum-fee transaction payable to the Keeper donation address, removing the coins from the wallet cleanly and privately.

## What Changes

- **Donate Dust CTA** added to the Manage Coins footer — contextual, visible only when the wallet has at least one current Do Not Spend UTXO.
- **Donation confirmation bottom sheet** — shows title, body, warning copy, and two buttons (Donate Dust / Cancel).
- **Eligibility check** — after the user taps **Donate Dust** on the confirmation sheet, attempt fee calculation using only Do Not Spend UTXOs at the `low` fee rate; surface an error and close the sheet if no valid transaction can be built.
- **Donation transaction** — built using only Do Not Spend UTXOs as inputs, forced to `low` fee rate, sending the net-of-fees amount to the Keeper donation address (`bc1qyqequr0824nwf7snzvq5gqsr6xscn62e3ttm06`). Normal spendable coins are never touched.
- **Transaction review/signing flow reuse** — after confirmation, navigation proceeds to the existing send confirmation/signing screen with recipient, UTXOs, and fee tier pre-populated and locked (no user editing).
- **i18n** — new copy strings added to `en.json`.

## Capabilities

### New Capabilities

- `dust-donation`: The end-to-end donate-dust flow — CTA visibility rule, eligibility check, confirmation modal, donation transaction construction, and handoff to the existing signing flow.

### Modified Capabilities

- `utxo-management`: Manage Coins footer gains a contextual Donate Dust CTA alongside the existing Select to Send action. Requirement change: footer must conditionally render the CTA based on Do Not Spend UTXO presence.
- `send-and-receive`: The existing send confirmation/signing screen must accept pre-populated, locked parameters (recipient, UTXOs, fee tier) for the donation path, with no user-editable fields in that mode.

## Impact

- **Affected files**:
  - `src/screens/UTXOManagement/UTXOManagement.tsx` — Donate Dust CTA and bottom sheet
  - `src/components/UTXOsComponents/UTXOFooter.tsx` — conditional Donate Dust button
  - `src/screens/Send/AddSendAmount.tsx` (or downstream signing screen) — locked pre-populated mode
  - `src/context/Localization/language/en.json` — new strings
- **Dependencies**: Requires `dust-utxo-classification` (for `spendability` field on UTXOs) and `dust-spend-restrictions` (for the per-UTXO spendability filter pattern). Both are implemented on the current branch.
- **Environments**: Mainnet and testnet.
- **Hardware signer compatibility**: No impact — the donation transaction is built at the coin-selection/UI layer using the same PSBT/signing flow as any other send. No signing protocol changes.
- **Subscription tier gating**: None — available to all users.
- **Security/privacy impact**: Improves privacy by giving users a clear path to remove dust/Do Not Spend coins. The donation address is hardcoded in source; no user-provided address is used. No key material is accessed outside the normal signing flow. No new network calls beyond the fee estimation already performed during normal sends.

## Non-goals

- Classifying or reclassifying UTXOs (covered by `dust-utxo-classification`).
- Spend restrictions during normal sends (covered by `dust-spend-restrictions`).
- Allowing the user to choose a different donation recipient.
- Allowing the user to choose a different fee rate.
- Partial donation (user selecting which Do Not Spend coins to donate).
- Special transaction history label for the donation transaction.
- BIP329 export of donation metadata.
- Any changes to hardware signer protocols, PSBT construction, or broadcast logic.
