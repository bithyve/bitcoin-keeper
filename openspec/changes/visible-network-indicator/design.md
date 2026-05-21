## Context

Bitcoin Keeper has a global Network Type setting (Mainnet / Testnet) stored in the Redux `settings` slice (`state.settings.bitcoinNetworkType`). When Testnet is active the app routes all wallet, key, node, receive, and send operations to the Bitcoin testnet, yet the UI currently gives no persistent visual confirmation of this on the core workflow screens. A user who has switched to Testnet has to navigate back to App Settings to verify their network mode.

The `TestnetIndicator` component (`src/components/TestnetIndicator.tsx`) already exists and is used on the Login screen via `{isTestnet() && <TestnetIndicator />}`. The `isTestnet()` utility reads the Redux store synchronously; it is not reactive and will not re-render when the store changes while a screen is mounted.

`HomeScreenHeader` (`src/components/HomeScreenHeader.tsx`) renders the title for the Wallets, Keys, Buy, Ask AI, and More tabs via a `title` prop passed from `HomeScreen`.

`WalletHeader` (`src/components/WalletHeader.tsx`) renders the back-navigation header on nested screens (Receive Bitcoin, Send Confirmation, etc.) via a `title` prop. It already has a `rightComponent` slot used on Send Confirmation for `CurrencyTypeSwitch`.

## Goals / Non-Goals

**Goals:**

- Display `(Testnet)` inline with the header title on four surfaces: Wallets tab, Keys tab, Receive Bitcoin screen, Send Confirmation screen.
- Derive indicator visibility solely from `state.settings.bitcoinNetworkType` using `useAppSelector`, so it responds reactively when the user changes the network without restarting the app.
- Zero layout shift, no new vertical space consumed, no interactive element added.

**Non-Goals:**

- No Mainnet indicator.
- No new components, routes, modals, or banners.
- No change to the Network Type setting or switching flow.
- No indicator on screens outside the four listed above.
- No saga, reducer, or store shape changes.
- No Realm schema changes or MMKV additions.

## Decisions

### Decision 1: Append `(Testnet)` to the title string (Path A) rather than composing a badge component inline

**Chosen**: Conditionally derive the title string at the point of use. When `bitcoinNetworkType === NetworkType.TESTNET`, the string passed to the header's `title` prop is `"<base title> (Testnet)"`. In Mainnet the base title is passed unchanged.

**Alternatives considered**:
- *Path B — Badge component*: Render the existing `TestnetIndicator` pill inside `HomeScreenHeader` / `WalletHeader` alongside the title. This reuses the existing pill and matches the Login screen pattern, but would require modifying the two header components (adding internal Redux reads) and introduces a horizontal layout element that may conflict with the notification bell or `rightComponent` slot on small screens.

**Rationale for Path A**: Minimal surface area — only three call sites change, both header components stay unchanged. The `(Testnet)` text is the exact copy required by the spec. No new component or layout concern. `WalletHeader`'s `numberOfLines={1}` on title is a minor truncation risk on very narrow widths, but the longest affected string is `"Send Confirmation (Testnet)"` (~30 chars) which fits within the available flex space on all supported screen widths.

### Decision 2: Use `useAppSelector` (not `isTestnet()`) for reactivity

**Chosen**: Each affected component reads `const { bitcoinNetworkType } = useAppSelector((state) => state.settings)` directly. This ensures React re-renders when the global network state changes.

**Rationale**: `isTestnet()` is a synchronous store read outside the React render cycle — it captures a snapshot at mount time and misses subsequent changes. `useAppSelector` subscribes to the Redux store and triggers re-renders on change, satisfying the requirement that indicators disappear immediately when the user switches back to Mainnet.

### Decision 3: Scope changes to `HomeScreen.tsx`, `ReceiveScreen.tsx`, and `SendConfirmation.tsx`

The Wallets and Keys titles are both derived from the `selectedOption` state in `HomeScreen` and passed as a single `title` prop to `HomeScreenHeader`. Appending there avoids touching the shared header component. Similarly, Receive and Send Confirmation each pass a static string to `WalletHeader`.

**Redux slices involved**: `settings` (read-only, `bitcoinNetworkType`).  
**Sagas involved**: none.  
**Realm / MMKV**: no changes.  
**Store migration**: not required (no shape change).

## Affected Files

| File | Change type |
|------|-------------|
| `src/screens/Home/HomeScreen.tsx` | Modified — derive testnet-suffixed title for Wallets and Keys tabs |
| `src/screens/Recieve/ReceiveScreen.tsx` | Modified — pass testnet-suffixed title to `WalletHeader` |
| `src/screens/Send/SendConfirmation.tsx` | Modified — pass testnet-suffixed title to `WalletHeader` |

No new files. No component files modified.

## Risks / Trade-offs

- **Title truncation on narrow screens**: `WalletHeader` sets `numberOfLines={1}` on the title `Text`. The longest new string (`"Send Confirmation (Testnet)"`) is ~30 characters. On 320 pt (iPhone SE 1st gen) this sits comfortably within the flex space after the back arrow. Risk: low.
- **`HomeScreenHeader` dynamic title logic**: `HomeScreenHeader.getHeaderTitle()` applies `capitalizeEachWord()` to the title. The string `"Wallets (Testnet)"` will become `"Wallets (Testnet)"` after capitalization (already capitalized correctly). Risk: none.
- **Reactivity during navigation**: `HomeScreen` keeps `selectedOption` in local state and reads `bitcoinNetworkType` from Redux. If the user changes network while on the Wallets tab the component will re-render via `useAppSelector` and show the updated title without navigation. Receive/Send Confirmation screens similarly subscribe.
- **No new tests needed for store logic** (no store changes). UI-level snapshot or render tests covering the title string conditional are the appropriate test target.

## Migration Plan

Display-only change. No deployment steps, no feature flag, no rollback concern. If reverted, the three files return to their previous state and no persistent data is affected.

## Open Questions

None.
