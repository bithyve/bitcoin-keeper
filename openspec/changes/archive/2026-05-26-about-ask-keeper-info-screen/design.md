## Context

Currently, the "Ask Keeper" CTA in the disclaimer modal navigates to an external webpage that is not yet ready, leading to a subpar user experience. Users expect immediate, in-app information about Ask Keeper, especially when encountering the disclaimer. The app uses React Native with Gluestack UI, Redux Toolkit, and React Navigation v6. All UI must follow DESIGN.md for consistency.

## Goals / Non-Goals

**Goals:**
- Provide an in-app "About Ask Keeper" info screen with clear, high-quality presentation of provided content.
- Replace the disclaimer modal CTA navigation to point to this new screen.
- Ensure the new screen matches the app’s design system and UX standards.
- Keep content inline or in a constants file (no localization).

**Non-Goals:**
- No changes to backend, APIs, or external dependencies.
- No localization or multi-language support.
- No changes to Ask Keeper’s backend or feature set.

## Decisions

- **Screen Placement:** The new info screen will be added under src/screens/AskKeeperInfo/AskKeeperInfoScreen.tsx.
- **Navigation:** Update React Navigation stack (likely in src/navigation/Navigator.tsx) to include the new screen. The disclaimer modal CTA will navigate here instead of opening a web URL.
- **Content Source:** Content will be stored inline in the screen or in a new src/constants/AskKeeperInfo.ts file for maintainability.
- **UI:** Use Gluestack UI components, following DESIGN.md for layout, typography, and color. Include a header, scrollable content, and a close/back button.
- **Testing:** Add/extend Jest tests for navigation and screen rendering.

## Risks / Trade-offs

- [Risk] UI may diverge from design system if DESIGN.md is not followed → **Mitigation:** Review DESIGN.md and reuse existing components/styles.
- [Risk] Navigation regression if stack is misconfigured → **Mitigation:** Test navigation flows and fallback behavior.
- [Risk] Content may become outdated if not maintained → **Mitigation:** Store in a constants file for easy updates.

## Migration Plan

- Ship as a minor release; no data migration needed. Rollback is safe (revert navigation and remove screen/component).

## Open Questions

- Final content for Ask Keeper info (to be provided/confirmed).
- Should the screen be accessible from other locations in the app?
