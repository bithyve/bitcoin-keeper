## Why

The current "Ask Keeper" CTA in the disclaimer modal navigates users to an external webpage that is not yet ready, resulting in a poor user experience and confusion. Providing an in-app "About Ask Keeper" info screen will deliver clear, immediate information about the feature, improve trust, and keep users within the app.

## What Changes

- Add a new "About Ask Keeper" info screen in the app, accessible from the disclaimer modal CTA.
- Replace the existing CTA navigation (currently to a not-ready webpage) with navigation to the new info screen.
- Display provided content about Ask Keeper on the new screen, with attention to UI quality and alignment with DESIGN.md.
- Content may be inline or in a constants file; no localization required.

## Capabilities

### New Capabilities
- `about-ask-keeper-info-screen`: In-app info screen presenting details about Ask Keeper, accessible from the disclaimer modal CTA.

### Modified Capabilities
- (none)

## Impact

- Affects React Navigation stack (adding new screen, updating navigation target).
- Updates to disclaimer modal logic and UI.
- Adds new screen/component under src/screens/ or src/components/.
- May add new constants file for Ask Keeper info content.
- No backend/API or dependency changes required.
