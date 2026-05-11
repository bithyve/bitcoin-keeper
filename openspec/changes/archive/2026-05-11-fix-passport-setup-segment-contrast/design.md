## Context

The signer setup QR flows reuse a shared segmented control component to switch derivation contexts (e.g., Singlesig BIP84 vs Multisig BIP48). In light mode, the inactive label can render with insufficient contrast, reducing readability in setup flows such as Passport onboarding.

## Goals / Non-Goals

**Goals:**
- Ensure inactive and active segmented options remain readable in light and dark themes.
- Keep current segmented behavior, interaction, and option selection logic unchanged.
- Limit scope to UI styling in the shared segmented control.

**Non-Goals:**
- No changes to Redux slices or sagas.
- No changes to hardware signer scanning, PSBT flow, or derivation/business logic.
- No schema, MMKV, or migration changes.

## Decisions

1. **Set explicit unselected label color using themed text color**
   - Rationale: the label currently depends on implicit text color defaults, which can be low-contrast on certain backgrounds.
   - Alternative considered: adjust background color only. Rejected because text contrast remains brittle if theme tokens change.

2. **Keep selected-state color override unchanged**
   - Rationale: selected text color is already legible on the highlighted segment; changing it is unnecessary for this issue.

3. **Apply fix in shared `SegmentController` component**
   - Rationale: one targeted change fixes all screens that use this control and avoids duplicated per-screen patches.

Affected files (expected):
- `src/components/SegmentController.tsx` (modified)

Redux/store and data flow impact:
- Redux slices/sagas: none
- PSBT/hardware interaction flow: none
- Realm/MMKV/migrations: none

## Risks / Trade-offs

- **[Risk]** Theme token mismatch could still produce low contrast in custom themes.
  **Mitigation:** use existing `secondaryText` token already used by sub-labels in this component.
- **[Trade-off]** Shared component update may adjust visuals beyond Passport setup.
  **Mitigation:** limit change to inactive main label color only.
