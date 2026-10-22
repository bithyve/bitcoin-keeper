# Full-product startup and first-wallet UI measurements

This separately reviewable R5 acceptance package runs the ordinary packaged app
through `index.js`, its real PIN/storage setup, production account-creation saga,
wallet/key generation and encrypted persistence. It complements the CI-only
native module/worker probes. Estimates: approximately 4k–6k changed code/test
tokens, one acceptance-infrastructure feature. No app version is allocated here.

The only product change is a FlatList test ID derived from the already-rendered
visible wallet list: `home_visible_wallet_count_N`. Hidden and archived counts
are not exposed. In a fresh one-wallet fixture, count1 before/after a cold process
relaunch demonstrates visible-list persistence without exporting wallet IDs.

## Execution contract

The reconciled hosted foundation must first `record`, `prepare` and `build` the
exact candidate. Before that build its `.env.ci` must use
`RELAY=http://127.0.0.1:8765/`; retain the foundation's DEVELOPMENT, blocked
signing/channel/Sentry endpoints and disposable credential namespace. This
runner checks that exact nonsecret configuration. DEVELOPMENT makes production
Splash select Testnet on the fresh installation. No faucet request, funded
wallet, transaction, signing or server-backup enrollment is performed.

After the hosted smoke/probes finish, run on the same hosted platform:

```sh
python3 .github/native/product_measurements.py run
```

The runner requires a disposable GitHub-hosted runner (`GITHUB_ACTIONS=true`,
`RUNNER_ENVIRONMENT=github-hosted`) to prevent accidental local data clearing.
It imports `.github/native/hosted_native.py`, verifies its successful
build and artifact fingerprint, uses its installed pinned Maestro, warms the
ordinary Metro bundle, then creates its own iOS simulator or uses the CI-owned
Android emulator. Physical Android devices are rejected. Android forwards only
Metro and the fixture ports. It removes only its new iOS simulator or disposable
development app and its own temporary measurement files. Existing personal
devices, simulator profiles, other worktrees, caches and evidence are untouched.

Production source and bundle configuration must match committed HEAD. The sole
manifest exception is the foundation's recorded rn-nodeify module-mapping overlay:
its before hash must match `git show HEAD:package.json`, its after hash must match
current bytes, its allowed fields must be exactly browser/react-native/browserify,
and all other parsed manifest fields must remain equal. Unrecorded mapping changes,
dependency/script changes and expanded allowlists fail closed.

The setup responder binds only127.0.0.1:8765, answers only `createNewApp` with the
controlled `{created:true}` response, discards request bodies without logging or
retaining identifiers, and rejects every other backend operation. A separate
fixed-vocabulary metric route records host monotonic timestamps for UI actions.
This deliberately supplies **no backend-protocol/compatibility acceptance**.
Public Testnet Electrum connections still follow source defaults and may succeed
or fail; that network condition is part of this development fixture, not a
controlled release-performance benchmark. Paired genuine Relay coverage remains
a separate package.

Each of five samples clears only the disposable app and its credentials, then:

1. Launches the full app and waits for Create a passcode.
2. Creates public fixture PIN1111, declines biometrics and skips introduction.
3. Taps Start New and waits for production setup's Next, then reaches the home
   list after explicitly skipping backup. Never opens a seed/recovery-word view.
4. Requires visible-wallet count1 and Mobile Wallet, stops the process, launches
   again, enters PIN1111 and requires the same visible count.
5. Exercises More→Wallets and requires the one-wallet list again. This is a
   bounded fresh-state navigation check; it does not reproduce #7055's original
   backup-delete/multiuser trigger or close that investigation.

Only metadata.json receives bounded raw durations/counts/stage labels. Five
separate startup-to-passcode and StartNew-to-ready values are retained; no median
can hide an individual failure. Timings include Maestro driver and React Native
development overhead, with a warm host bundle and cold app process. They are
actual UI timings when run, not release-build performance or module microbenchmarks.
The authenticated-home duration includes the automated PIN taps. The setup-to-home
duration includes the explicit recovery-backup skip interaction.

All stages must occur once in order, JUnit must fully pass, the artifact must stay
unchanged and exactly one createNewApp call may occur across setup and cold
relaunch. Any missing stage, duplicate request, changed artifact, native/tool error
or incomplete sample keeps the suite failing. Failure metadata retains only
completed fixed stages/numeric durations/error class; it never exports raw errors.
Maestro's temporary diagnostics (including automatic failure screenshots), Metro
logs and app/credential state are deleted; upload only the existing bounded
`artifacts/native/*/metadata.json` path. No screenshot, hierarchy, raw command/app
log or database artifact belongs in uploaded evidence.

## Verification and limits

`python3 -m unittest discover -s .github/tests -p test_product_measurements.py`
tests real loopback HTTP allowlisting, rejection and nonretention, ordered receipt
validation, missing/duplicate setup failure and partial-flow preservation.
Those tests provide no native acceptance. Before the first hosted execution,
the full-app Maestro selectors and per-platform credential-reset behavior remain
unverified. Record actual execution outcomes for each exact candidate; never
copy passes or raw timings from another SHA. Physical biometrics and devices,
offline/error/retry scenarios, full deletion/reference protection, actual
protected-backup operations and release readiness remain separate evidence.
