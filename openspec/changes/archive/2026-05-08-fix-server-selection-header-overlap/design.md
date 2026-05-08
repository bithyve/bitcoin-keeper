## Context

The Server Selection (Node Selection) screen (`src/screens/AppSettings/Node/NodeSelection.tsx`) displays two tabs — **Public Server** and **Private Electrum** — inside a single `ScreenWrapper`. The Private Electrum tab renders `AddNode`, which contains `KeeperTextInput` fields backed by native `TextInput`.

On iOS, `ScreenWrapper` avoids the status bar by computing `paddingTop: hp(15) + insets.top` via `useSafeAreaInsets()` — a JavaScript-side hook that reads from the `SafeAreaProvider` context. After switching tabs (Public → Private → Public), iOS may update the safe-area context in response to keyboard events or layout passes triggered by the text-input fields. During this window, `useSafeAreaInsets()` can transiently return `{top: 0}`, and if a React re-render captures that value the `paddingTop` collapses, causing the header to permanently overlap the status bar.

A secondary contributor is that the shared `ScrollView` (Gluestack-wrapped) retains its scroll offset and keyboard-adjusted content insets across tab switches. When switching back to the Public Server tab the scroll view can be positioned incorrectly, compounding the visual shift.

Android is unaffected because `ScreenWrapper` uses `SafeAreaView` (native insets applied in layout rather than via a JS hook) on that platform.

## Goals / Non-Goals

**Goals:**
- Eliminate the status-bar overlap on iOS after switching tabs on the Server Selection screen.
- Make `ScreenWrapper`'s iOS path use `SafeAreaView` (native inset handling), matching the existing Android path and removing dependence on the transient-zero bug in `useSafeAreaInsets()`.
- Dismiss the keyboard and reset the `ScrollView` scroll offset when the user switches tabs, so no stale scroll state carries over.

**Non-Goals:**
- Changing visual spacing or padding values on any other screen.
- Refactoring any screen other than `NodeSelection.tsx` and `ScreenWrapper.tsx`.
- Modifying `TabBar`, `AddNode`, or `WalletHeader` components.
- Redux, Realm, or MMKV changes — no data-layer work required.

## Decisions

### D1 — Switch iOS ScreenWrapper path to `SafeAreaView`

**Decision:** Replace the iOS-specific `Box` + manual `paddingTop: hp(15) + insets.top` in `ScreenWrapper.tsx` with `SafeAreaView` (from `react-native-safe-area-context`) using `edges={['top', 'left', 'right', 'bottom']}` and an extra top-padding of `hp(15)` (via `styles.container.paddingTop`), matching the existing Android `SafeAreaView` path.

**Why:** `SafeAreaView` resolves insets natively in the layout pass; it does not rely on the JS-context timing that `useSafeAreaInsets()` is subject to. This is the recommended approach in the `react-native-safe-area-context` docs for full-screen wrappers.

**Alternative considered — guard `insets.top` with a ref:** Store the first non-zero `insets.top` in a `useRef` and fall back to it on subsequent renders. Rejected: adds complexity for every screen that uses `ScreenWrapper`; doesn't fix the root timing issue.

**Alternative considered — fix only `NodeSelection.tsx`:** Add a local `SafeAreaView` or extra top padding in that one screen. Rejected: the root cause is in `ScreenWrapper` and would recur in any other tab-based screen with text inputs.

### D2 — Dismiss keyboard and reset scroll on tab switch in `NodeSelection.tsx`

**Decision:** In the `setActiveTab` handler, call `Keyboard.dismiss()` from `react-native` before updating state. Additionally create a `scrollRef` (`useRef<ScrollView>`) on the native `ScrollView` and call `scrollRef.current?.scrollTo({ y: 0, animated: false })` on tab switch.

**Why:** Ensures no stale scroll offset or keyboard-adjusted content inset carries over from the Private Electrum tab to the Public Server tab.

**Alternative considered — `keyboardShouldPersistTaps="handled"` only:** Does not dismiss the keyboard proactively; the user would still see a stale layout briefly.

## Risks / Trade-offs

- **`ScreenWrapper` change is app-wide (iOS):** Every iOS screen using `ScreenWrapper` will switch from the manual-padding approach to `SafeAreaView`. Risk is low because the effective insets are identical; the only difference is the inset source (native vs. JS). All existing `paddingTop`/`paddingHorizontal` values are preserved via `styles.container`.
- **`SafeAreaView` `edges` prop:** Using `edges={['top', 'left', 'right', 'bottom']}` is consistent with the Android path. Any screen that previously relied on getting extra bottom padding from `insets.bottom` in the old path will receive equivalent handling since `SafeAreaView` adds native bottom inset. Should be tested visually on notched and non-notched devices.

## Affected Files

| File | Change |
|---|---|
| `src/components/ScreenWrapper.tsx` | iOS path: replace `Box` + `useSafeAreaInsets` with `SafeAreaView` |
| `src/screens/AppSettings/Node/NodeSelection.tsx` | Add `Keyboard.dismiss()` + `scrollRef.scrollTo(0)` on tab switch |

## Open Questions

_None — fix scope is fully determined._
