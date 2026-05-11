## Context

`src/screens/AppSettings/Node/NodeSettings.tsx` renders saved Electrum servers in a `FlatList` and renders the offline `WarningNote` inside the footer area that also holds the "Add New Node" button. When the list content becomes tall, the fixed footer placement allows the note to visually collide with the last `ServerItem` card. This change only affects screen layout and does not involve Redux slices, sagas, Realm schema changes, MMKV keys, PSBT flows, or hardware signers.

## Goals / Non-Goals

**Goals:**
- Ensure the offline warning note is displayed after the saved server list content instead of on top of the last server row
- Preserve the existing add-node button placement and warning behavior for empty and non-empty node lists
- Keep the implementation limited to the Server Settings UI and focused validation

**Non-Goals:**
- Modify any Electrum connection or deletion behavior
- Introduce store, saga, migration, or persistence changes
- Change warning copy, navigation, or modal behavior

## Decisions

- Render the non-empty offline warning inside the `FlatList` flow as a footer component so it scrolls with the list content and always appears after the final `ServerItem`
  - Alternative considered: increase outer footer spacing or add absolute bottom padding. Rejected because it depends on device height and does not guarantee separation from the last card.
- Keep the empty-list warning in the footer area above the add button
  - Alternative considered: move all warnings into the list area. Rejected because the empty-state screen already uses a dedicated illustration area and the warning/button grouping is readable there.
- Affected files:
  - `src/screens/AppSettings/Node/NodeSettings.tsx`
  - `tests/components/NodeSettings.test.tsx` (if the focused test is added)

## Risks / Trade-offs

- [List footer spacing differs slightly from current footer spacing] → Match existing spacing with a small wrapper style around the footer warning
- [Focused screen test may require heavy mocks] → Keep the test scope narrow and skip it only if existing screen dependencies make it disproportionately invasive

## Migration Plan

No migration is required. This is a presentation-only change with no persisted data updates, no store version bump, and no rollback complexity beyond reverting the UI diff.

## Open Questions

- None
