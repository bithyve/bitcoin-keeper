## 1. Storage (Realm Schema + Migration)

- [x] 1.1 Extend UTXO metadata types and Realm `UTXOInfo` schema with spendability status, reason, and user override fields.
- [x] 1.2 Bump Realm schema version and add migration logic to initialize new spendability fields for existing records.
- [x] 1.3 Add helper queries/upserts for reading and writing spendability metadata by `txId:vout` and wallet id.
- [x] 1.4 Confirm Redux Persist migration version is unchanged (no Redux store shape change) and document this in PR notes.

## 2. Business Logic / Wallet Operations

- [x] 2.1 Implement dust classification helpers (value threshold 5,000 sats, receive reuse/out-of-order, change reuse only).
- [x] 2.2 Add lightweight address receive metadata update path in wallet sync to avoid full-history rescans.
- [x] 2.3 Integrate classification into wallet refresh pipeline for new and unclassified current UTXOs while preserving user overrides.
- [x] 2.4 Implement one-level descendant marking for already-spent potential dust with reason `Linked to potential dust spend`.
- [x] 2.5 Add one-time dust detection toast marker logic for newly detected potential dust UTXOs.

## 3. Store (Saga + Actions)

- [x] 3.1 Add saga actions for manual `Mark Do Not Spend` and `Mark Spendable` operations and persistence updates.
- [x] 3.2 Update wallet refresh saga flow to persist classification results and trigger one-time dust toast in normal refresh contexts.
- [x] 3.3 Add selectors/utilities to compute `hasDoNotSpendUTXO` and spendable-vs-total balances for UI and send flow decisions.

## 4. Transaction Flow and PSBT Safety

- [x] 4.1 Filter automatic input pools in send prerequisite builders to exclude Do Not Spend UTXOs by default.
- [x] 4.2 Keep explicit manual coin selection path intact with warning confirmation before using Do Not Spend UTXOs.
- [x] 4.3 Implement Donate Dust transaction preparation using only Do Not Spend UTXOs, minimum fee rate, and donation destination `bc1qyqequr0824nwf7snzvq5gqsr6xscn62e3ttm06`.
- [x] 4.4 Add failure handling for unbuildable restricted-input Donate Dust transactions with required copy and no state mutation.
- [x] 4.5 Validate PSBT generation/signing remains unchanged for Wallet, Vault, and Signer flows under filtered input sets.

## 5. UI Components and Screens

- [x] 5.1 Add wallet home red-dot and More Options red-dot indicator wiring based on current Do Not Spend UTXO presence.
- [x] 5.2 Add Wallet Details informational line `Includes Do Not Spend coins` (non-tappable).
- [x] 5.3 Update Manage Coins rows to show warning-style `Do Not Spend` label while preserving existing labels (`Change`, `Self`).
- [x] 5.4 Update UTXO Details to show reason text and actions `Mark Do Not Spend` / `Mark Spendable` with success feedback.
- [x] 5.5 Add `Donate Dust` CTA + confirmation modal/bottom sheet with exact required copy and cancel path.
- [x] 5.6 Update send amount flow to show helper text when total balance is sufficient but spendable balance is insufficient.
- [x] 5.7 Add transaction history/detail informational `Potential dust spend` label and explanation copy.
- [x] 5.8 Verify UI adheres to DESIGN.md reuse and token guidance (existing components, warning patterns, calm security tone).

## 6. Tests

- [ ] 6.1 Add unit tests for classification rules across receive/change addresses and value boundary conditions (4,999 vs 5,000 sats).
- [ ] 6.2 Add unit tests for override persistence and one-level descendant marking behavior.
- [ ] 6.3 Add unit tests for send prerequisite filtering and manual selection warning gating.
- [ ] 6.4 Add unit/integration tests for Donate Dust success/failure (restricted inputs only, fee-only from Do Not Spend set).
- [ ] 6.5 Add UI tests for red-dot indicators, Wallet Details info line, Manage Coins labeling, and send helper copy.
- [ ] 6.6 Add regression checks for hardware signer transaction flows to ensure unchanged PSBT compatibility.
