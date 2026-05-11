## Context

The current `flows/` Maestro suite has inconsistent selector strategy and waits, making it brittle across CI/device timing differences and between Android and iOS UI variants. This change is constrained to YAML flow assets under `flows/`, with no product code changes. Stakeholders are QA and release engineering teams that rely on E2E stability to prevent wallet journey regressions.

## Goals / Non-Goals

**Goals:**
- Normalize Maestro YAML syntax and remove invalid/brittle patterns.
- Increase cross-platform reliability with platform-aware or optional conditional steps.
- Improve reusable composition via `runFlow` wrappers to reduce duplication.
- Expand journey and negative-path coverage for major wallet operations and settings.
- Document automation limitations that require non-Maestro validation.

**Non-Goals:**
- Changes to React Native app code, Redux behavior, or navigation implementation.
- Any Realm/MMKV/storage schema work.
- Any wallet cryptography, PSBT signing logic, or hardware protocol behavior changes.
- Backend/API contract testing beyond UI-driven flow assertions.

## Decisions

1. **Keep scope strictly in `flows/`**
   - Rationale: requested smallest-possible comprehensive improvement with zero app/runtime risk.
   - Alternative considered: adding testIDs in app code for selector hardening. Rejected due to scope constraints.

2. **Use reusable wrappers with `runFlow` for common preconditions**
   - Rationale: centralizing setup/login/wallet entry patterns improves maintainability and consistency.
   - Alternative considered: duplicating steps per scenario. Rejected as brittle and harder to update.

3. **Prefer stable text/testID assertions and guarded waits over static sleeps**
   - Rationale: improves determinism across emulator/device performance variance.
   - Alternative considered: broad `wait`/sleep usage. Rejected due to flaky timing sensitivity.

4. **Add platform-aware conditionals for divergent permission/system UI**
   - Rationale: avoids Android-only assumptions and reduces iOS failures.
   - Alternative considered: separate full suites per platform. Rejected to keep suite concise.

5. **Model coverage by major journeys plus key negative paths**
   - Rationale: maximize product-surface confidence with minimal additional files.
   - Alternative considered: exhaustive micro-flow coverage. Rejected to avoid maintenance overhead.

### Redux/Saga, PSBT/Hardware, Storage/Migrations
- Redux slices involved: none (test-only YAML changes).
- Redux sagas involved: none.
- PSBT/hardware signer data flow changes: none.
- Realm schema/MMKV key changes: none.
- Redux Persist migration version bump: not required.

### Affected files
- Modified: existing YAML files under `flows/` (direct flow files and any nested flow modules).
- Added: new YAML files under `flows/` for expanded journeys/negative paths, plus one coverage limitations note file under `flows/`.

## Risks / Trade-offs

- **[Risk] UI copy or layout changes may still break text-based selectors** → Mitigation: prefer robust selectors and conditional alternatives where available.
- **[Risk] Some external/system interactions (camera, app-store handoff) remain non-deterministic in CI** → Mitigation: include guarded permission/cancel checks and document unsupported areas.
- **[Risk] Broader flow count can increase runtime** → Mitigation: keep flows concise, compose shared setup, and avoid redundant deep assertions.

## Migration Plan

1. Replace brittle selectors/syntax in existing `flows/` YAML files.
2. Introduce reusable wrapper flows and reference them via `runFlow`.
3. Add new journey/negative-path flow files with platform-aware guards.
4. Add `flows/` limitations note for scenarios not fully automatable via Maestro.
5. Run Maestro lint/validation (where available) and perform sanity dry-runs in CI-compatible environment.
6. Rollback strategy: revert `flows/` changes only if a regression is found.

## Open Questions

- Which environment/account fixture has stable data for buy/subscription paths in all CI targets?
- Are there existing app testIDs that can be standardized further in a follow-up change for long-term resilience?
