## Context

The login screen and passcode creation flow both render the shared `KeyPadView` / `KeyPadButton` components from `src/components/AppNumPad/`. The reported failure is intermittent: one numeric label can render late or disappear even though the keypad layout remains visible and tappable. This points to a presentation-layer issue inside the shared keypad button rather than Redux, saga, Realm, MMKV, PSBT, or hardware signer flows.

## Goals / Non-Goals

**Goals:**
- Make keypad digit labels render consistently on first paint in shared passcode flows.
- Keep the fix isolated to the shared keypad presentation components.
- Add focused tests that verify the shared keypad renders all digits.

**Non-Goals:**
- Changing any Redux slice or saga; none are involved in this UI-only fix.
- Changing passcode validation, biometric authentication, or navigation.
- Adding Realm schema changes, MMKV keys, or migrations; none are needed.

## Decisions

1. **Stabilize the shared digit label rendering in `KeyPadButton`.**  
   The keypad is reused by login and passcode creation, so fixing the shared button prevents duplicate screen-level work. The implementation should prefer the most direct React Native text rendering path for the digit label and keep the existing touch/animation behavior intact.

   - Alternative considered: patching layout in `Login.tsx` only. Rejected because `CreatePin.tsx` uses the same shared keypad and could retain the bug.
   - Alternative considered: changing passcode state timing or throttling. Rejected because the screenshot shows a display problem before any input interaction.

2. **Cover the regression with a focused component test.**  
   A keypad-level test can assert that digits `0` through `9` are present without coupling the test to login business logic.

3. **Avoid store and persistence changes.**  
   Redux slices/sagas involved: none. Realm schema changes: none. MMKV additions: none. Migration in `src/store/migrations.ts`: not required.

## Risks / Trade-offs

- **[Risk]** Replacing the label rendering path could slightly change keypad typography.  
  **Mitigation:** Keep the existing font size, line height, and alignment so the visual change stays minimal.

- **[Risk]** Tests may need mocks for shared animated/themed wrappers.  
  **Mitigation:** Reuse the repository’s current Jest setup and keep the assertion focused on rendered digit labels.

## Migration Plan

No data migration or rollout sequencing is required. The change is a local UI rendering fix that can be rolled back by reverting the shared keypad component if needed.

## Open Questions

- None at this time.

## Affected Files

- Modified: `src/components/AppNumPad/KeyPadButton.tsx`
- Modified or added test: keypad-focused test file under the existing Jest test structure
