## Context

The testnet faucet flow is used from Wallet Settings and Vault Settings when testnet mode is active. Currently:

- `useTestSats` hook (src/hooks/useTestSats.tsx) renders a `SettingCard` row that triggers the `TEST_SATS_RECIEVE` saga action on tap.
- `testcoinsWorker` saga calls `Relay.getTestcoins(recipientAddress, network)` which POSTs `{ recipientAddress }` to `/testnetFaucet` on the relay.
- The relay route requires only `recipientAddress`, calls `TestnetFaucet.transfer()`, and returns `{ txid, funded }`.
- On success the saga puts `setTestCoinsReceived(true)`, which shows a toast and navigates back.
- On failure (any error), the saga puts `setTestCoinsFailed(true)`, which shows a generic "Process Failed" toast via `errorText.processFailed`.

Neither the relay nor the client has any per-app daily cap, structured quota error code, or differentiated error messaging.

## Goals / Non-Goals

**Goals:**
- Add per-`appId` daily quota enforcement to the relay's `/testnetFaucet` endpoint (max 5 per UTC day).
- Introduce a structured error code `FAUCET_DAILY_LIMIT_REACHED` for quota rejection so the client can distinguish it from network/server failures.
- Pass `appId` from the Keeper app with every faucet request.
- Surface a Daily Limit Reached message to the user when the quota is hit, keeping them on the settings screen.
- Keep generic network/server errors on their existing "Process Failed" path — do not conflate with quota errors.
- Add a static informational hint on the Receive Test Sats row ("You can request test sats up to 5 times per day.").

**Non-Goals:**
- No Redis or in-memory rate limiting — MongoDB quota document is sufficient for this traffic volume.
- No mainnet faucet changes.
- No IP, address, or device-name based limiting.
- No client-side quota enforcement as a security control (only convenience).

## Decisions

### 1. Quota storage: new `faucetQuota` Mongoose collection (not embedded in app document)

**Decision**: Add a dedicated lightweight `faucetQuotaSchema` to `src/db.ts` in the relay with fields `{ appId: String, utcDate: String (YYYY-MM-DD), count: Number }` and a unique compound index on `(appId, utcDate)`.

**Alternatives considered**:
- Embed quota counter inside the existing `appSchema` document — rejected because the app document is large and unrelated to quota; also makes atomic increment+check harder without a compound date sub-key.
- Redis TTL counter — rejected because it adds an infra dependency and is overkill for this request volume.

**Reset strategy**: Natural — UTC date is part of the key. When the date rolls over a new document is inserted; old documents can be cleaned up by a periodic TTL index (set `expireAfterSeconds` on `createdAt` to 48 hours to auto-purge stale docs).

### 2. Quota increment timing: after successful transfer only

**Decision**: Increment (or create) the quota document only after `TestnetFaucet.transfer()` resolves successfully.

**Rationale**: Users should not lose quota on electrum timeouts or relay errors. Incrementing before transfer would mean a failed transfer burns a daily attempt, creating frustration with no sats received. The downside (brief race window between two in-flight requests from the same instance) is acceptable given this is testnet-only low-stakes usage.

### 3. HTTP status for quota rejection: 429 Too Many Requests

**Decision**: Relay returns `res.status(429).json({ err: "Daily limit reached. Try again after midnight UTC.", code: "FAUCET_DAILY_LIMIT_REACHED" })`.

**Rationale**: 429 is the semantically correct HTTP status for rate limiting. It is easy to distinguish from 400 (validation) and 500 (server error) on the client.

### 4. Client error discrimination: via HTTP status code, not message string matching

**Decision**: In `Relay.getTestcoins`, catch the axios error and check `err.response?.status === 429` to classify as a quota error. Propagate a typed error or error-code string up to the saga.

**Rationale**: Message string matching is brittle. Status code is stable and part of the public API contract.

**Client error propagation path**:
```
Relay.getTestcoins (check err.response.status)
  → throw error with property quotaExceeded: true (or errCode: "FAUCET_DAILY_LIMIT_REACHED")
    → testcoinsWorker catches it
      → quota? → put setTestCoinsQuotaReached(true)  [new reducer flag]
      → other? → put setTestCoinsFailed(true)  [existing path]
        → useTestSats hook reacts:
          → quotaReached → show KeeperModal "Daily Limit Reached"
          → failed → existing generic toast
```

### 5. UI for quota-reached: KeeperModal (not toast)

**Decision**: Show the "Daily Limit Reached" error as a `KeeperModal` with title "Daily Limit Reached", body "You can request test sats up to 5 times per day. Try again after midnight UTC.", and a single "OK" button that dismisses and keeps the user on the settings screen.

**Rationale**: The `useToastMessage` + `showToast()` pattern is used for brief success/failure feedback. A daily limit is a meaningful state the user needs to read and act on — a modal (KeeperModal) is the established Keeper pattern for this (already used for confirmations and educational overlays). The KeeperModal is already imported in the settings screens.

**Design tokens referenced from DESIGN.md**:
- Modal: `KeeperModal` component (`src/components/KeeperModal.tsx`).
- Error copy text: `${colorMode}.textGreen` or `${colorMode}.primaryText` depending on modal background — follow existing Keeper modal usage in WalletSettings.
- The OK button uses existing modal `buttonText`/`callback` props.

### 6. Static hint on Receive Test Sats row

**Decision**: Add a description sub-line "You can request test sats up to 5 times per day." below the existing row subtitle inside the `SettingCard` items array in `useTestSats`.

**Rationale**: Proactively informing users avoids surprise when the limit is hit. This reuses the existing `description` field of `SettingCard` items — no new component needed.

### 7. In-flight duplicate tap protection

**Decision**: Reuse the existing global `appLoading` context (already set to `true` before saga dispatch in `useTestSats`). The `KeeperLoader` overlay blocks all touches while loading. No separate local guard flag is needed.

**Rationale**: This is how the current flow works; the loader is rendered in Navigator.tsx with no touch passthrough. It is sufficient for this use case.

## Risks / Trade-offs

- **Race window on parallel requests**: Two requests from the same app overlapping in-flight could both pass the pre-transfer quota check before either increments the counter. Mitigated by MongoDB atomic `findOneAndUpdate` with `$inc` on count and a post-increment re-check, or by checking count after increment rather than before.
- **appId is client-supplied**: Any sufficiently motivated actor can rotate their `appId`. This is an existing constraint of the relay architecture and is accepted — the cap protects against accidental/casual overuse, not adversarial abuse.
- **Old app versions**: Clients that don't send `appId` will receive a 400 validation error from the updated route. This is acceptable — testnet faucet is a developer/testing tool and old clients are expected to update.

## Affected Files

**Relay (`bitcoin-keeper-relay`)**:
- `src/db.ts` — add `faucetQuotaSchema` and `getFaucetQuotaModel()` method
- `src/services/faucetQuota.ts` — new service: `checkAndIncrementQuota(appId: string): Promise<void>` (throws on limit)
- `src/routes/routes.ts` — update `/testnetFaucet` handler: require `appId`, call quota service, return 429 on limit

**Keeper app (`bitcoin-keeper`)**:
- `src/services/backend/Relay.ts` — `getTestcoins`: add `appId` param, pass in request body, map 429 to `quotaExceeded` error
- `src/store/sagas/wallets.ts` — `testcoinsWorker`: read `appId` from redux storage, pass to `Relay.getTestcoins`, handle quota error branch
- `src/store/reducers/wallets.ts` — add `testCoinsQuotaReached: boolean` state flag + `setTestCoinsQuotaReached` action
- `src/hooks/useTestSats.tsx` — handle `testCoinsQuotaReached` state: show `KeeperModal` with limit-reached copy; reset flag on dismiss
- `src/context/Localization/language/en.json` — add `faucetDailyLimitTitle`, `faucetDailyLimitBody`, `faucetDailyLimitError` keys
- `src/context/Localization/language/es.json` — mirror same keys

## Migration Plan

1. Deploy relay with updated `/testnetFaucet` route first. Old app clients that don't send `appId` will receive a 400 error (graceful — they already see "Process Failed").
2. Deploy Keeper app update with `appId` in request. New clients get full quota behavior.
3. No Redux store migration needed — `testCoinsQuotaReached` starts as `false` (default) and is blacklisted from persistence (same pattern as `testCoinsReceived`/`testCoinsFailed`).

## Open Questions

- None at this time. Backend counter TTL (48 h) is sufficient; no explicit purge job needed.
