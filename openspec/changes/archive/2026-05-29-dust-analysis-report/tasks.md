## 1. Navigation & Routing

- [x] 1.1 In `src/navigation/types.ts`, add `DustReport: { walletId: string }` to `AppStackParams`
- [x] 1.2 In `src/navigation/Navigator.tsx`, import `DustReportScreen` and register `<Stack.Screen name="DustReport" component={DustReportScreen} />`

## 2. Business Logic Hook

- [x] 2.1 Create `src/hooks/useDustReport.ts` — define the `DustReportPhase` type (`'start' | 'scanning' | 'result' | 'error'`) and `DustReportData` interface (`{ activeDust: UTXO[]; linkedCoins: UTXO[]; pastDustSpends: Transaction[]; doNotSpendUTXOs: UTXO[]; amountMarkedDNS: number; hasEligibleDustForDonation: boolean; isEmpty: boolean }`)
- [x] 2.2 In `useDustReport`, read `wallet` from Redux using `useWallets()` (or `useVault()` for Vaults), subscribe to `walletSyncing[walletId]` from the wallets Redux slice
- [x] 2.3 Implement `runScan()` — set `phase = 'scanning'`, dispatch `refreshWallets([wallet], { hardRefresh: true, dustScan: true })`, reset progress step to 0
- [x] 2.4 Implement scan completion effect — `useEffect` watching `walletSyncing[walletId]`; when it transitions `true → false` while `phase === 'scanning'`: write `Date.now()` to MMKV key `dust-report-lastScanned-${walletId}`, derive report data from updated `wallet.specs`, set `phase = 'result'`; on error set `phase = 'error'`
- [x] 2.5 Implement progress step reveal — cosmetic interval timer (2 s per step, up to 3 steps) that increments `progressStep` while `phase === 'scanning'`; clear interval on phase change
- [x] 2.6 Implement report data derivation — pure computation from `wallet.specs`:
  - `activeDust`: UTXOs with `spendability === 'doNotSpend'` AND `dustReason === 'initial'`
  - `linkedCoins`: UTXOs with `spendability === 'doNotSpend'` AND (`dustReason === 'adjacent'` OR `dustReason === 'descendant'`)
  - `doNotSpendUTXOs`: all UTXOs with `spendability === 'doNotSpend'`
  - `amountMarkedDNS`: sum of `value` for `doNotSpendUTXOs`
  - `pastDustSpends`: transactions where `tags?.includes('potential-dust-spend')`
  - `hasEligibleDustForDonation`: `doNotSpendUTXOs.length > 0`
  - `isEmpty`: all three lists empty
- [x] 2.7 Implement `lastScanned` read — on mount and after scan completion, read MMKV key `dust-report-lastScanned-${walletId}`; if present, format as human-readable string ("Today, HH:MM" / full date); if absent return `null` (rendered as "Never")
- [x] 2.8 Expose `{ phase, progressStep, reportData, lastScanned, donateDustVisible, setDonateDustVisible, runScan, tryAgain, onDone, onCancel }` from the hook where `tryAgain` re-invokes `runScan` and `onDone`/`onCancel` call `navigation.goBack()`

## 3. Screen — DustReportScreen

- [x] 3.1 Create `src/screens/DustReport/DustReportScreen.tsx` using `ScreenWrapper` + `WalletHeader` (title switches per phase); receive `walletId` from `route.params`; call `useDustReport(walletId)`
- [x] 3.2 Implement **Start phase** render: title "Dust Report", body copy per spec, `Buttons` component with primaryText="Run Report" / secondaryText="Cancel"
- [x] 3.3 Implement **Scanning phase** render: title "Scanning Wallet", body copy per spec, `ActivityIndicatorView` overlay or inline spinner, reveal up to 3 progress item strings based on `progressStep` value, optional "Cancel" text button that calls `onCancel`
- [x] 3.4 Implement **Result phase — findings** render:
  - title "Dust Report" + summary copy
  - Summary card (`Box` with card tokens) showing DNS coin count, amount in sats, past dust spend count, last scanned time (formatted or "Never")
  - Section "Active Dust" with header + flat list of static rows (value in sats, "Do Not Spend" chip, "Potential dust payment" reason); empty state "No active dust found."
  - Section "Linked Coins" with header + flat list (value in sats, "Do Not Spend" chip, "Linked to potential dust spend" reason); empty state "No linked coins found."
  - Section "Past Dust Spends" with header + flat list (date, amount if available, "Potential dust spend" label); empty state "No past dust spends found."
  - Footer: `Buttons` with primaryText="Done" and, if `hasEligibleDustForDonation`, secondaryText="Donate Dust" / secondaryCallback opens donate dust sheet
- [x] 3.5 Implement **Result phase — empty** render: title "No Dust Found", body copy per spec, single "Done" CTA (no Donate Dust)
- [x] 3.6 Implement **Error phase** render: title "Report Not Completed", body copy per spec, `Buttons` primaryText="Try Again" / secondaryText="Cancel"
- [x] 3.7 Implement **Donate Dust inline confirmation** — `KeeperModal` with `visible={donateDustVisible}`, title "Donate Dust", body copy "Donating can help clear dust / Do Not Spend coins for better privacy.", primaryText="Donate Dust", secondaryText="Cancel"; on confirm: build donation transaction (all DNS UTXOs → donation address at low fee rate) and navigate to Send signing screen with locked parameters; on cancel: close sheet

## 4. Wallet & Vault Settings Entry Points

- [x] 4.1 In `src/screens/WalletDetails/WalletSettings.tsx`, add a new action object to the `actions` array: `{ title: walletTranslation.dustReport, description: walletTranslation.dustReportDesc, icon: null, isDiamond: false, onPress: () => navigation.navigate('DustReport', { walletId: wallet.id }) }`
- [x] 4.2 In `src/screens/Vault/VaultSettings.tsx`, add a new action object to the `actions` array: `{ title: walletText.dustReport, description: walletText.dustReportDesc, icon: null, isDiamond: false, onPress: () => navigation.dispatch(CommonActions.navigate('DustReport', { walletId: vault.id })) }`
- [x] 4.3 In `src/hooks/useDustReport.ts`, import `useVault` and resolve the entity as `walletResult ?? activeVault` so the hook transparently supports both wallet and vault IDs

## 5. Internationalisation

- [x] 5.1 In `src/context/Localization/language/en.json`, add all new strings under the `wallet` namespace (or equivalent namespace used by `WalletSettings`):
  - `dustReport`: `"Dust Report"`
  - `dustReportDesc`: `"View potential dust activity for this wallet"`
  - `dustReportStartBody`: `"Keeper can scan this wallet for dust activity and show coins that may reduce privacy if spent."`
  - `scanningWalletTitle`: `"Scanning Wallet"`
  - `scanningWalletBody`: `"Keeper is checking this wallet for potential dust activity. This may take a few minutes."`
  - `scanProgressCoins`: `"Checking wallet coins"`
  - `scanProgressTxs`: `"Checking past transactions"`
  - `scanProgressReport`: `"Preparing report"`
  - `dustReportFoundBody`: `"Keeper found coins or transactions that may reduce wallet privacy."`
  - `noDustFoundTitle`: `"No Dust Found"`
  - `noDustFoundBody`: `"Keeper did not find potential dust activity in this wallet."`
  - `reportNotCompletedTitle`: `"Report Not Completed"`
  - `reportNotCompletedBody`: `"Keeper could not complete the dust report. Try again."`
  - `activeDustTitle`: `"Active Dust"`
  - `linkedCoinsTitle`: `"Linked Coins"`
  - `pastDustSpendsTitle`: `"Past Dust Spends"`
  - `noActiveDust`: `"No active dust found."`
  - `noLinkedCoins`: `"No linked coins found."`
  - `noPastDustSpends`: `"No past dust spends found."`
  - `potentialDustPayment`: `"Potential dust payment"`
  - `linkedToDustSpend`: `"Linked to potential dust spend"`
  - `potentialDustSpend`: `"Potential dust spend"`
  - `donateDustConfirmBody`: `"Donating can help clear dust / Do Not Spend coins for better privacy."`
  - `lastScannedNever`: `"Never"`
  - `runReport`: `"Run Report"`
  - `tryAgain`: `"Try Again"`
  - `tooSmallToDonate`: `"Dust amount is too small to donate after fees"`

## 6. Tests

- [x] 6.1 In `tests/hooks/useDustReport.test.ts`, unit test `reportData` derivation: given UTXOs with various `dustReason` and `spendability` values, assert correct `activeDust`, `linkedCoins`, `doNotSpendUTXOs`, `amountMarkedDNS`, `pastDustSpends`, `isEmpty`, and `hasEligibleDustForDonation` outputs
- [x] 6.2 In `tests/hooks/useDustReport.test.ts`, test `lastScanned` formatting: given a stored MMKV epoch for today's date, assert "Today, HH:MM" format; given an absent key, assert `null`
- [x] 6.3 In `tests/screens/DustReportScreen.test.tsx`, render the start phase and assert title, body copy, "Run Report" and "Cancel" buttons are present
- [x] 6.4 In `tests/screens/DustReportScreen.test.tsx`, render the empty result phase and assert "No Dust Found" title, correct body, "Done" button, and absence of "Donate Dust"
- [x] 6.5 In `tests/screens/DustReportScreen.test.tsx`, render the findings result phase with mock UTXOs and transactions, and assert summary card values, all three section headings, and presence of "Donate Dust" button
- [x] 6.6 In `tests/screens/DustReportScreen.test.tsx`, render the error phase and assert "Report Not Completed" title, correct body, "Try Again" and "Cancel" buttons
