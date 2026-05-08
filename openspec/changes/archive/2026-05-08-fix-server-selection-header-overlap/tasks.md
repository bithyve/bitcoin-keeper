## 1. Fix ScreenWrapper iOS safe-area handling

- [x] 1.1 In `src/components/ScreenWrapper.tsx`, replace the iOS `Box` + `useSafeAreaInsets()` path with `SafeAreaView` (from `react-native-safe-area-context`) using `edges={['top', 'left', 'right', 'bottom']}` and preserve `paddingHorizontal` and the existing `styles.container` top/bottom padding values
- [x] 1.2 Remove the `useSafeAreaInsets` import and hook call from `ScreenWrapper.tsx` (no longer needed after 1.1)
- [x] 1.3 Verify that `SafeAreaView` is already exported by `react-native-safe-area-context` in the project (it is — already imported on the Android path)

## 2. Fix NodeSelection tab-switch layout issues

- [x] 2.1 In `src/screens/AppSettings/Node/NodeSelection.tsx`, add `import { Keyboard } from 'react-native'` and call `Keyboard.dismiss()` at the start of the `setActiveTab` callback (before `setConnectionError` and `setActiveTab`)
- [x] 2.2 Add a `scrollRef` using `useRef<ScrollView>(null)` and attach it to the `ScrollView` via the `ref` prop
- [x] 2.3 In the `setActiveTab` callback, after calling `Keyboard.dismiss()`, call `scrollRef.current?.scrollTo({ y: 0, animated: false })` to reset the scroll position on every tab switch
- [x] 2.4 Ensure `ScrollView` type import for the ref is sourced correctly (use `ScrollView` from `@gluestack-ui/themed-native-base` or cast via `ScrollView as unknown as typeof RNScrollView` if the ref type requires it)

## 3. Verify

- [ ] 3.1 Manually test on an iOS device/simulator: open Server Selection, switch to Private Electrum, switch back to Public Server — confirm header does not overlap status bar
- [ ] 3.2 Manually test: focus a text input on Private Electrum tab, switch to Public Server — confirm keyboard is dismissed and header is correctly positioned
- [ ] 3.3 Manually test on Android: confirm no visual regression on the Server Selection screen
- [ ] 3.4 Check at least one other screen that uses `ScreenWrapper` on iOS (e.g., Wallet Details) to confirm safe-area padding is unchanged
