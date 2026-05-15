## Context

This change introduces privacy-focused dust attack protection across wallet sync, UTXO management, send flow, and transaction history, while keeping existing Keeper navigation and screen architecture. Current UTXO objects (`Wallet.specs.confirmedUTXOs` / `unconfirmedUTXOs`) have no persisted spendability status, so automatic coin selection can include suspicious low-value UTXOs. The selected approach is Option A: extend persisted UTXO metadata in Realm so each current wallet-owned UTXO has an explicit spendability state and reason, with user override support.

Stakeholders include wallet users (privacy safety), transaction/signing flows (software + hardware signers), and sync/storage integrity (Realm migration and refresh performance). The change affects both mainnet and testnet UTXO classification behavior.

## Goals / Non-Goals

**Goals:**
- Persist UTXO spendability state (`Spendable` or `Do Not Spend`) plus reason and override.
- Classify UTXOs during existing sync/refresh points without adding a new dashboard screen.
- Use sats-only detection: `< 5000` sats + address-reuse/out-of-order rule.
- Trace already-spent potential dust descendants one level deep for this release.
- Exclude Do Not Spend UTXOs from automatic send input selection and spendable balance.
- Provide manual state controls and reasons in existing UTXO screens.
- Keep existing PSBT signing flow compatible for Wallet, Vault, and Signer interactions.
- Include Donate Dust flow using only Do Not Spend UTXOs and minimum fee rate.

**Non-Goals:**
- Multi-level risk scoring or pattern-based mass-dusting analytics.
- Full recursive descendant tracing beyond one level.
- Out-of-order detection rules for change addresses.
- New subscription gating or tier-specific behavior.
- New standalone dust management screens.

## Decisions

1. **Use Option A persisted metadata in Realm (`UTXOInfo`)**
- Decision: extend `UTXOInfo` with spendability fields (`spendability`, `reason`, `isUserOverride`, optional `toastShownAt` or equivalent marker).
- Rationale: explicit domain model, queryable by wallet, robust override persistence.
- Alternative considered: system labels-only approach in `Tags`; rejected because override semantics and efficient querying become implicit and brittle.

2. **Classification runs in wallet sync pipeline, not in UI layer**
- Decision: compute/assign spendability during `WalletOperations.syncWalletsViaElectrumClient` result handling in wallet refresh saga path.
- Rationale: single source of truth and consistent behavior across wallet create/import/restore/post-upgrade open/pull-refresh.
- Alternative considered: classify on demand in each UI screen; rejected due to inconsistency and repeated logic.

3. **Address metadata uses lightweight wallet-scoped cache**
- Decision: derive and persist per-wallet address receive metadata needed for reused/out-of-order checks (receive + change), using existing address index knowledge and transaction refresh outputs.
- Rationale: avoids repeated full-history scans and keeps classification bounded.
- Alternative considered: recompute from full history each refresh; rejected due to avoidable cost.

4. **One-level descendant tracing for already-spent potential dust**
- Decision: detect historical potential-dust spends and mark traceable currently-owned direct descendants as `Do Not Spend` with reason `Linked to potential dust spend`.
- Rationale: aligns with current scope and complexity budget.
- Alternative considered: recursive multi-level graph traversal; deferred.

5. **Coin selection enforcement at transaction preparation layer**
- Decision: filter default input pools in `calculateSendMaxFee`, `prepareTransactionPrerequisites`, and `prepareCustomTransactionPrerequisites` to exclude Do Not Spend unless user explicitly selected UTXOs.
- Rationale: guarantees automatic send exclusions regardless of UI entry path.
- Alternative considered: UI-only filtering; rejected because backend selection paths can still include restricted UTXOs.

6. **Donate Dust in scope with strict input-source rules**
- Decision: add Donate Dust action in Manage Coins using only current Do Not Spend UTXOs, paying fees only from those UTXOs, minimum fee rate, and donation destination `bc1qyqequr0824nwf7snzvq5gqsr6xscn62e3ttm06`.
- Rationale: allows privacy cleanup without mixing spendable coins.
- Failure behavior: if no valid tx can be built from selected Do Not Spend UTXOs alone, keep state unchanged and show required error copy.

7. **UI follows existing DESIGN.md primitives and patterns**
- Decision: reuse existing red-dot indicator, UTXO label chip, warning text style, bottom sheets/modals, and toast components.
- DESIGN.md alignment:
  - calm warning tone, no panic copy
  - existing tokens/surfaces and component patterns
  - no new visual language or dashboard
  - security-relevant copy untruncated
- New component need: none required; only state/copy wiring into existing components.

8. **Hardware/PSBT compatibility preserved**
- Decision: dust protection modifies eligible inputs but does not modify PSBT format, signing algorithm, or signer protocol.
- Data flow impact for signing:
  - Wallet/Vault UTXOs -> filtered prerequisites -> PSBT construction -> existing Signer(s) sign path unchanged.

## Risks / Trade-offs

- **[Risk] False positives from address-reuse heuristics** -> Mitigation: explicit `Mark Spendable` override and persistence to prevent re-marking after override.
- **[Risk] Sync-time performance regressions** -> Mitigation: lightweight metadata persistence and incremental classification only for UTXOs without state.
- **[Risk] State drift between UTXO set and metadata records** -> Mitigation: upsert by `txId:vout`, prune/ignore absent UTXOs during refresh, and keep classification in one pipeline.
- **[Risk] Donation tx build failures for tiny sets** -> Mitigation: deterministic validation and explicit user-facing failure copy; no fallback to spendable inputs.
- **[Risk] UX confusion around total vs spendable balance** -> Mitigation: helper copy in send flow only when mismatch condition occurs.

## Migration Plan

1. Add new fields to Realm `UTXOInfo` schema and bump Realm schema version (currently 106 -> next version).
2. Add migration logic in `src/storage/realm/migrations.ts` to initialize new fields for existing rows.
3. During post-upgrade wallet refresh, classify UTXOs that lack spendability state; preserve any existing user override.
4. No Redux Persist version bump in `src/store/migrations.ts` is required unless store shape changes are introduced later.
5. Rollback strategy: keep migration additive/nullable so old states degrade to default `Spendable` behavior if feature flags or code paths are disabled.

## Affected Files (Planned)

- `src/services/wallets/interfaces/index.ts` (UTXO/UTXOInfo type additions)
- `src/storage/realm/schema/wallet.ts` (UTXOInfo schema extension)
- `src/storage/realm/realm.ts` (schema version bump)
- `src/storage/realm/migrations.ts` (migration for new fields)
- `src/services/wallets/operations/index.ts` (classification metadata + send input filtering + donation prerequisites)
- `src/store/sagas/wallets.ts` (classification persistence, one-time dust toast trigger)
- `src/store/sagaActions/utxos.ts` and `src/store/sagas/utxos.ts` (manual mark actions persistence if needed)
- `src/screens/UTXOManagement/UTXOManagement.tsx` and UTXO components (labels, Donate Dust CTA)
- `src/screens/Send/AddSendAmount.tsx` and related send screens (spendable-vs-total helper messaging)
- `src/screens/WalletDetails/*` and home wallet card components (red-dot/subtitle indicators)
- `src/screens/ViewTransactions/*` (Potential dust spend informational tag/detail)
- `src/navigation/types.ts` and related screen params if new modal routes are added
- Tests under `tests/` and/or feature-specific test files for classification, filtering, overrides, and donation failures

## Open Questions

- For testnet, should Donate Dust be hidden or allowed with fallback handling when donation address is mainnet-only?
- Should one-time dust toast suppression be persisted as an explicit field or inferred from first-time Do Not Spend transition?
- Should manual selection warning for Do Not Spend be implemented as modal or bottom sheet in current mobile layout patterns?

## DESIGN.md Checklist Confirmation

- Existing component reuse prioritized: Yes.
- Existing tokens and warning patterns respected: Yes.
- No new visual language introduced: Yes.
- Security/privacy copy remains concise and clear: Yes.
- UI remains consistent with current Keeper structure: Yes.
