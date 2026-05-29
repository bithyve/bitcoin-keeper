## 1. Fix Layout Overlap

- [x] 1.1 In `src/screens/AppSettings/Node/NodeSettings.tsx`, add a `listFooterWarning` component constant that renders `<WarningNote noteText={...} />` conditionally based on `isNoNodeConnected`
- [x] 1.2 Pass the new footer component as `ListFooterComponent` on the `FlatList` in the non-empty list branch
- [x] 1.3 Remove the `WarningNote` render from the `footerContainer` box (keep only the `Buttons` component there)

## 2. Verification

- [x] 2.1 Verify non-empty list state: `WarningNote` appears below the last `ServerItem` when no server is connected, and is absent when a server is connected
- [x] 2.2 Verify empty list state: the existing `noNodeWarning1` path (inside `footerContainer`) for an empty list is unaffected and still shows correctly
- [x] 2.3 Verify the "Add New Node" button remains fixed at the bottom and does not scroll with the list
