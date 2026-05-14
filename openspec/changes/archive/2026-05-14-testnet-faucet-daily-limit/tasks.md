## 1. Relay — Data Model

- [x] 1.1 Add `faucetQuotaSchema` to `src/db.ts` with fields `appId: String`, `utcDate: String`, `count: Number`, `createdAt: Date`; set compound unique index on `(appId, utcDate)` and TTL index on `createdAt` (expireAfterSeconds: 172800 = 48 h)
- [x] 1.2 Add `getFaucetQuotaModel()` method to the `Database` class in `src/db.ts`

## 2. Relay — Quota Service

- [x] 2.1 Create `src/services/faucetQuota.ts` exporting `checkAndIncrementQuota(appId: string): Promise<void>` — reads today's UTC date key, atomically increments count, and throws a structured error with `code: "FAUCET_DAILY_LIMIT_REACHED"` if the post-increment count exceeds 5

## 3. Relay — Route Update

- [x] 3.1 In `src/routes/routes.ts` `/testnetFaucet` handler: add `appId` to the required body parameter check (return 400 if missing)
- [x] 3.2 Call `checkAndIncrementQuota(req.body.appId)` before `TestnetFaucet.transfer()` and catch the quota error to return HTTP 429 with `{ err: "Daily limit reached. Try again after midnight UTC.", code: "FAUCET_DAILY_LIMIT_REACHED" }`
- [x] 3.3 Verify that the quota counter is only incremented on successful transfer by placing `checkAndIncrementQuota` call _before_ transfer but using a transactional approach (increment, check result; rollback is not needed as the design accepts increment-first, since 429 is returned before transfer)
  > Note: the chosen design (Design § Decision 2) increments only after transfer — move `checkAndIncrementQuota` call to _after_ a successful transfer and add a pre-check (read count, if >= 5 reject before attempting transfer) to avoid charging for failed attempts

## 4. Keeper App — State

- [x] 4.1 In `src/store/reducers/wallets.ts`: add `testCoinsQuotaReached: boolean` field to `WalletsState`, default `false`
- [x] 4.2 Add `setTestCoinsQuotaReached` reducer action
- [x] 4.3 Add `testCoinsQuotaReached` to the `blacklist` array in `walletPersistConfig` (do not persist)
- [x] 4.4 Export `setTestCoinsQuotaReached` from the slice

## 5. Keeper App — Client Relay Wrapper

- [x] 5.1 In `src/services/backend/Relay.ts` `getTestcoins`: add `appId: string` as a second parameter
- [x] 5.2 Include `appId` in the POST body: `{ recipientAddress, appId }`
- [x] 5.3 In the catch block, check `err.response?.status === 429`; if true, throw an error with an identifiable property (`message: "FAUCET_DAILY_LIMIT_REACHED"` or a custom typed error) so the saga can distinguish it from generic failures

## 6. Keeper App — Saga

- [x] 6.1 In `src/store/sagas/wallets.ts` `testcoinsWorker`: read `appId` from Redux state via `yield select((state: RootState) => state.storage.appId)`
- [x] 6.2 Pass `appId` to `Relay.getTestcoins(receivingAddress, network, appId)`
- [x] 6.3 Wrap the `Relay.getTestcoins` call in a try/catch; on quota error (`err.message === "FAUCET_DAILY_LIMIT_REACHED"`) put `setTestCoinsQuotaReached(true)`; on other errors put `setTestCoinsFailed(true)`

## 7. Keeper App — Hook UX

- [x] 7.1 In `src/hooks/useTestSats.tsx`: select `testCoinsQuotaReached` from Redux state
- [x] 7.2 Add a `useState` for `quotaModalVisible`; set it to `true` when `testCoinsQuotaReached` becomes `true`, then dispatch `setTestCoinsQuotaReached(false)` to reset the Redux flag
- [x] 7.3 Render a `KeeperModal` (already in scope via WalletSettings/VaultSettings) triggered by `quotaModalVisible` with:
  - `title`: `walletText.faucetDailyLimitTitle` ("Daily Limit Reached")
  - `subTitle`: `walletText.faucetDailyLimitBody` ("You can request test sats up to 5 times per day. Try again after midnight UTC.")
  - `buttonText`: `common.ok` ("OK")
  - `callback`: `() => setQuotaModalVisible(false)`
- [x] 7.4 Update the `SettingCard` item description from `${walletText.recieveSatsDesc} ${entityLabel}` to `You can request test sats up to 5 times per day. ${walletText.recieveSatsDesc} ${entityLabel}` (or use a separate localization key)

## 8. Keeper App — Localization

- [x] 8.1 Add to `src/context/Localization/language/en.json` wallet section: `"faucetDailyLimitTitle": "Daily Limit Reached"`, `"faucetDailyLimitBody": "You can request test sats up to 5 times per day. Try again after midnight UTC."`, `"faucetDailyLimitError": "Daily limit reached. Try again after midnight UTC."`
- [x] 8.2 Mirror the same three keys in `src/context/Localization/language/es.json`

## 9. Verification

- [ ] 9.1 Manually test: make 5 faucet requests with a single `appId` on relay dev/testnet — verify 6th returns 429 with `FAUCET_DAILY_LIMIT_REACHED`
- [ ] 9.2 Manually test: verify a failed transfer (e.g., bad address in direct relay call) does not increment the quota counter
- [ ] 9.3 Manually test in app: trigger quota-reached response; verify KeeperModal appears with correct copy and OK dismisses it
- [ ] 9.4 Manually test in app: trigger a non-quota error (disconnect network); verify generic "Process Failed" toast, not the quota modal
- [ ] 9.5 Verify the Receive Test Sats row description in testnet mode shows the daily limit hint text
