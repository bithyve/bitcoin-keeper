## Context

The Server Settings screen (`NodeSettings.tsx`) renders a `FlatList` of Electrum server items inside a `flex: 1` container, and a fixed footer below it containing a conditional `WarningNote` (shown when no server is connected) plus the "Add New Node" button.

The bug: the `WarningNote` is rendered in the static footer (`footerContainer`) positioned at the bottom of the screen. When the server list has entries, the last `ServerItem` in the `FlatList` scrolls beneath the footer, causing the `WarningNote` text to visually overlap the action buttons (Delete / Connect) of that last item.

## Goals / Non-Goals

**Goals:**
- Eliminate the visual overlap between the `WarningNote` and the last server list item
- Keep the "Add New Node" button fixed and always visible at the bottom
- Minimal change — touch only what is necessary

**Non-Goals:**
- Redesigning the Server Settings screen
- Changing `WarningNote` content or visibility logic
- Modifying `ServerItem`, `Buttons`, or any other component

## Decisions

### Decision 1: Move `WarningNote` into FlatList's `ListFooterComponent`

**Chosen**: Render the `WarningNote` as the `ListFooterComponent` of the `FlatList` instead of in the static footer.

**Rationale**: `ListFooterComponent` renders inside the scroll area, directly below the last list item. This guarantees no overlap — the warning scrolls with the content and the fixed "Add New Node" button remains unaffected.

**Alternative considered**: Add `contentContainerStyle={{ paddingBottom: <N> }}` to the `FlatList` to push the last item above the footer height. Rejected because it requires hardcoding or dynamically measuring the footer height, which is brittle across device sizes and changes when `WarningNote` conditionally appears/disappears.

**Alternative considered**: Absolutely position the footer. Rejected — introduces z-index complexity and does not solve the root cause.

### Decision 2: Keep `Buttons` in the static footer

The "Add New Node" `Buttons` component stays in `footerContainer`. It must always be reachable without scrolling, so it remains outside the `FlatList`.

## Risks / Trade-offs

- [Risk] When `WarningNote` is inside `ListFooterComponent`, it only appears when the list is non-empty. The empty-state branch already renders `EmptyListIllustration` and uses a separate `isNodeListEmpty` condition for `noNodeWarning1` — this path is unaffected since `ListFooterComponent` only matters when the list is visible.
  → Mitigation: Verify both empty and non-empty states during implementation.
