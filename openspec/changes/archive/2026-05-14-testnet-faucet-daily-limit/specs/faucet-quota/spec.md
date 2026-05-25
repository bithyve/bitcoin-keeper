## ADDED Requirements

### Requirement: Relay enforces per-app daily faucet quota

The relay's `/testnetFaucet` endpoint SHALL accept `appId` as a required body parameter and SHALL reject any request where the given `appId` has already completed 5 or more successful faucet transfers within the current UTC calendar day. Rejection SHALL return HTTP 429 with `{ err: "Daily limit reached. Try again after midnight UTC.", code: "FAUCET_DAILY_LIMIT_REACHED" }`. The quota counter SHALL only be incremented after a successful transfer, not on failed attempts.

#### Scenario: Request accepted within daily limit

- **GIVEN** `appId` "app-abc" has made 0 to 4 successful faucet requests on the current UTC date
- **WHEN** a POST to `/testnetFaucet` arrives with `{ appId: "app-abc", recipientAddress: "<valid testnet address>" }`
- **THEN** the relay performs the transfer and returns HTTP 200 with `{ txid: "<txid>", funded: true }`
- **AND** the quota counter for `appId` "app-abc" on the current UTC date is incremented by 1

#### Scenario: Request rejected after daily limit reached

- **GIVEN** `appId` "app-abc" has already made 5 successful faucet requests on the current UTC date
- **WHEN** a POST to `/testnetFaucet` arrives with `{ appId: "app-abc", recipientAddress: "<valid testnet address>" }`
- **THEN** the relay returns HTTP 429 with `{ err: "Daily limit reached. Try again after midnight UTC.", code: "FAUCET_DAILY_LIMIT_REACHED" }`
- **AND** no Bitcoin transfer is attempted

#### Scenario: Missing appId is rejected with validation error

- **WHEN** a POST to `/testnetFaucet` arrives without `appId` in the body
- **THEN** the relay returns HTTP 400 with `{ err: "Input param missing - appId" }`

#### Scenario: Failed transfer does not consume quota

- **GIVEN** `appId` "app-xyz" has made 3 successful faucet requests today UTC
- **WHEN** a POST to `/testnetFaucet` arrives with a valid `appId` and `recipientAddress`, but the Electrum transfer fails (e.g., insufficient faucet balance)
- **THEN** the relay returns HTTP 400 with an error message
- **AND** the quota counter for `appId` "app-xyz" remains at 3

#### Scenario: Quota resets at UTC midnight

- **GIVEN** `appId` "app-abc" has made 5 successful faucet requests on UTC date 2026-05-14
- **WHEN** a POST to `/testnetFaucet` arrives after UTC midnight on 2026-05-15
- **THEN** the relay treats the request as the first of the new UTC day and accepts it
- **AND** returns HTTP 200 with `{ txid: "<txid>", funded: true }`

#### Scenario: Two different appIds have independent quotas

- **GIVEN** `appId` "app-A" has made 5 successful requests today UTC and `appId` "app-B" has made 2
- **WHEN** a POST to `/testnetFaucet` arrives with `appId: "app-B"`
- **THEN** the relay accepts the request and returns HTTP 200

---

### Requirement: Keeper app includes appId in faucet requests

The Keeper app's `Relay.getTestcoins` method SHALL include the app's `appId` in the request body when calling `/testnetFaucet`. The `appId` SHALL be read from the Redux storage state.

#### Scenario: appId is included in faucet request body

- **GIVEN** the app's `appId` is stored in the Redux `storage.appId` field
- **WHEN** the `testcoinsWorker` saga dispatches a faucet request
- **THEN** the POST body sent to the relay includes `{ appId: <storage.appId>, recipientAddress: <address> }`

---

### Requirement: Keeper app distinguishes quota errors from generic failures

The Keeper app SHALL distinguish HTTP 429 quota-exceeded responses from other relay errors. A quota error SHALL result in the Daily Limit Reached modal being shown. Any other error SHALL result in the existing generic failure toast, not the Daily Limit Reached copy.

#### Scenario: Quota error shows Daily Limit Reached modal

- **GIVEN** the relay returns HTTP 429 with `code: "FAUCET_DAILY_LIMIT_REACHED"`
- **WHEN** the `testcoinsWorker` saga processes the response
- **THEN** the `testCoinsQuotaReached` Redux flag is set to `true`
- **AND** the `useTestSats` hook renders a `KeeperModal` with title "Daily Limit Reached" and body "You can request test sats up to 5 times per day. Try again after midnight UTC."
- **AND** the user remains on the Wallet Settings / Vault Settings screen

#### Scenario: Daily Limit Reached modal dismissed with OK

- **GIVEN** the Daily Limit Reached modal is visible
- **WHEN** the user taps "OK"
- **THEN** the modal is dismissed
- **AND** the `testCoinsQuotaReached` flag is reset to `false`
- **AND** the user remains on the settings screen

#### Scenario: Generic network error does not show quota copy

- **GIVEN** the relay returns a non-429 error (e.g., network timeout, 500)
- **WHEN** the `testcoinsWorker` saga processes the error
- **THEN** the `testCoinsFailed` Redux flag is set to `true`
- **AND** the existing generic "Process Failed" toast is shown
- **AND** the Daily Limit Reached modal is NOT shown

---

### Requirement: Receive Test Sats row shows informational daily limit hint

The Receive Test Sats `SettingCard` row SHALL display a static informational description "You can request test sats up to 5 times per day." to set user expectations before they tap.

#### Scenario: Hint is visible in testnet mode

- **GIVEN** the global testnet mode is active
- **WHEN** the user opens Wallet Settings or Vault Settings
- **THEN** the Receive Test Sats row is visible and its description sub-text reads "You can request test sats up to 5 times per day. Receive test sats in your wallet." (or vault as appropriate)

---

### Requirement: Rapid repeated taps cannot submit duplicate in-flight faucet requests

While a faucet request is in progress, the Keeper app SHALL prevent the user from submitting a second faucet request. The `KeeperLoader` overlay SHALL be active from the moment of tap until the saga resolves.

#### Scenario: Duplicate tap blocked during in-flight request

- **GIVEN** a faucet request is in progress (appLoading is true)
- **WHEN** the user attempts to tap the Receive Test Sats row again
- **THEN** the tap is blocked by the `KeeperLoader` overlay
- **AND** no second faucet request is submitted
