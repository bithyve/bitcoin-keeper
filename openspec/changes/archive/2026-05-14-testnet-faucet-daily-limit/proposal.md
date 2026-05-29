## Why

The testnet faucet endpoint (`/testnetFaucet`) applies no per-app cap, allowing a single Keeper instance to call `getTestcoins()` an unlimited number of times per day and drain faucet funds, leaving other users unable to receive test sats. A daily request limit keyed by `appId` is needed to protect shared faucet reserves.

## What Changes

- The relay's `/testnetFaucet` route is updated to require `appId` in the request body and enforce a maximum of 5 successful requests per `appId` per UTC calendar day.
- A new lightweight quota collection is added to the relay MongoDB database to track daily usage counts per `appId`.
- The relay returns a structured error code `FAUCET_DAILY_LIMIT_REACHED` (HTTP 429) when the daily cap is exceeded, including a clear user-readable message.
- The Keeper app's `Relay.getTestcoins` method is updated to pass `appId` in the request body.
- The faucet saga and hook are updated to distinguish quota-exceeded errors from generic network/server errors and surface the correct user-facing message for each case.
- The Receive Test Sats screen gains a static informational note ("You can request test sats up to 5 times per day.") and proper handling for the daily-limit-reached error state.

## Capabilities

### New Capabilities

- `faucet-quota`: Per-app daily request limiting for the testnet faucet. Covers relay-side quota storage, enforcement logic, error response shape, and client-side error classification and UX messaging.

### Modified Capabilities

<!-- No existing spec-level behavior is changing. The Receive Test Sats entry point visibility in Wallet Settings (testnet mode gating) is unchanged. -->

## Impact

- **Relay** (`bitcoin-keeper-relay`): `src/routes/routes.ts` — `/testnetFaucet` route; new Mongoose schema/model for faucet quota; new service helper for quota checking.
- **Keeper app**: `src/services/backend/Relay.ts` — `getTestcoins` method; `src/store/sagas/wallets.ts` — `testcoinsWorker`; `src/hooks/useTestSats.tsx` — error state branching; `src/context/Localization/language/en.json` / `es.json` — new string keys.
- **Environment**: Testnet only. No mainnet behavior changes.
- **No hardware signer compatibility implications.**
- **No subscription tier gating.** Feature is available to all users when testnet mode is active.
- **Security**: `appId` is client-supplied and unverified beyond relay lookup; this is consistent with how all other relay endpoints use `appId`. Provides meaningful faucet conservation while not being a hard abuse-proof control.

## Non-goals

- Do not apply rate limiting by wallet address, IP, or device name.
- Do not add user accounts or login-based identity to the faucet.
- Do not add mainnet faucet behavior.
- Do not move or duplicate the Testnet mode toggle into Wallet Settings.
- Client-side limiting may be added only as a convenience, not as the security control — backend is the enforcer.
