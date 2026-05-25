## Context

Bitcoin Keeper already has individual Maestro flows in `flows/`, but there is no consolidated, PR-friendly core journey suite that teams can run for quick regression confidence. Existing flows also vary in scope, so adding a thin composition layer gives broad coverage without changing app code or existing selectors.

Constraints:
- Keep changes limited to Maestro YAML assets under `flows/`.
- Reuse existing IDs/text assertions to avoid brittle selector drift.
- Preserve current app behavior for both mainnet/testnet UI states.

Stakeholders:
- Mobile engineers validating PRs.
- QA/release owners running fast smoke/regression checks.

## Goals / Non-Goals

**Goals:**
- Add a small set of journey-oriented Maestro flow files that cover onboarding/setup, wallet viewing, receive, send, app settings, and key-management.
- Keep flow style consistent (`appId` header, `runFlow` composition, existing assertion patterns).
- Provide one top-level composed regression flow for easy execution.

**Non-Goals:**
- Changing React Native app code, Redux store, sagas, Realm models, or navigation logic.
- Introducing new selectors or refactoring existing legacy flow files extensively.
- Adding hardware-device-in-the-loop automation.

## Decisions

1. **Use composition over rewriting existing flows**
   - Decision: Create new wrapper flows that call stable existing flows with `runFlow`.
   - Rationale: Minimal/surgical change, low maintenance, fast to review.
   - Alternative considered: Rewrite existing flows into a new unified monolith; rejected due to higher risk and selector churn.

2. **Add a single top-level regression entrypoint**
   - Decision: Add one composed flow that runs all new journey wrappers in sequence.
   - Rationale: Gives a predictable CI/manual command target and maps directly to required coverage journeys.
   - Alternative considered: Keep only independent journey files; rejected because orchestration burden shifts to callers.

3. **No app logic/state changes**
   - Decision: Limit implementation strictly to `flows/` YAML files.
   - Rationale: This effort is test coverage only.
   - Redux slices/sagas involved: none.
   - Realm/MMKV changes: none.
   - Migration requirement (`src/store/migrations.ts`): none.

4. **PSBT/hardware interaction treatment**
   - Decision: Reuse existing send/key-management flows that already traverse UI steps tied to transaction signing/key surfaces without adding new signer protocol logic.
   - Data flow note: tests remain UI-driven and rely on existing in-app send/key pathways; no direct PSBT/hardware protocol manipulation is introduced.

Affected files (planned):
- `flows/core_onboarding_setup.yaml` (new)
- `flows/core_wallet_viewing.yaml` (new)
- `flows/core_receive_send.yaml` (new)
- `flows/core_app_settings.yaml` (new)
- `flows/core_key_management.yaml` (new)
- `flows/core_regression.yaml` (new)

## Risks / Trade-offs

- **[Risk] Existing legacy flow instability can propagate into composed suite** → Mitigation: Keep wrappers thin and reuse already-used flows with stable IDs/text assertions.
- **[Risk] Send flow depends on wallet/network state** → Mitigation: Keep coverage practical by composing current branch flows rather than introducing new brittle assertions.
- **[Trade-off] Broad but shallow journey coverage** → Mitigation: This suite is explicitly smoke/regression; deeper edge-case coverage can be added in separate targeted flows.

## Migration Plan

1. Add new composed Maestro YAML files under `flows/`.
2. Validate YAML syntax/consistency with available local checks.
3. Run selected Maestro flow command(s) if environment supports execution.
4. No runtime migration, rollout, or rollback steps needed because app code is unchanged.

## Open Questions

- None blocking for this change.
