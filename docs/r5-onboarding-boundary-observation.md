# Android onboarding boundary observation

This isolated preparation starts from PR #7131 source
`e34331083959c94b5f0a17603d8c1f578305c474`. It implements observation only and has
not run on a native host. It makes no app, dependency, selector, tap, timing or
navigation correction, and selects no new hosted window. It preserves the
existing credential-failure preparation and does not add an acceptance predicate.

The actual Android artifact `12466091444` from run `39858617273`, attempt `1`,
source `1bc34890cb8618b2fffd446a63924974e0fe15b5`, identifies a failed
ASSERT_VISIBLE `start_new_tile` after the host acknowledged `skip_tapped`.
Its one retained hierarchy contains Skip; Start New IDs/public text are absent.
The current-owned product Metro window contains five valid lines and no fixed
error header. Those observations do not identify why the transition failed.
They do not justify another tap, a timeout change, a new selector or an app fix.

The observer emits only these fixed stages:

| Stage | Code boundary observed |
| --- | --- |
| `ONBOARDING_EFFECT` | Entry to the existing OnBoardingSlides mount effect |
| `SKIP_PRESS` | Entry to the original Skip handler |
| `SKIP_RESET_RETURNED` | The original synchronous `navigation.reset` call returned |
| `SKIP_RESET_THROWN` | That original call threw; the same object is rethrown |
| `NEW_KEEPER_EFFECT` | Entry to NewKeeperApp's existing mount effect |

The original inline Skip handler still calls
`navigation.reset({ index: 0, routes: [{ name: 'NewKeeperApp' }] })` exactly once.
It returns the same value immediately, without awaiting or inspecting it.
Neither the original error nor any route, state, account, event, message or
credential payload is inspected or logged. An immediate return does not prove
that navigation handled the action or a new screen committed. Existing effect
dependencies, registration, cleanup and timer cleanup are unchanged. No effects,
listeners, timers, native queries, file writes or network operations are added.
Layout, props, test IDs and accessibility behavior are unchanged.

`observeOnboardingBoundary` first checks `__DEV__`, then Android's static
`Platform.OS`, before inspecting the native logging hook. Release and iOS calls
emit nothing. In development Android it writes the fixed string
`KEEPER_ONBOARDING_BOUNDARY|v1|<STAGE>` directly through `nativeLoggingHook` at
level 3, bypassing console/ExceptionsManager/LogBox. Hook/getter failures are
quiet. Each stage is limited to four emissions per JS process, twenty total;
missing records cannot establish that a boundary did not execute.

Pinned React Native 0.83.9 source verifies this Android sink:

- `ReactAndroid/src/main/jni/react/runtime/jni/JReactInstance.cpp` binds
  `reactAndroidLoggingHook` through `bindNativeLogger`.
- `ReactCommon/jsiexecutor/jsireact/JSIExecutor.cpp` passes the message and numeric
  level directly to that logger.
- `ReactAndroid/src/main/jni/react/jni/JSLogging.cpp` writes under `ReactNativeJS`
  at `level + ANDROID_LOG_DEBUG`. Android's DEBUG value is 3, so level 3 reaches
  ERROR (6), already included by the existing `*:E` query.

The cached RN tarball SHA1 is `61d2a4ccd89e06b98992c9b9781856ad88a09d39`.
The three respective source SHA256 values are
`251c8d866c84f606c9e1fab3e75fefe67318954df447fb0bfd2e441ce234c598`,
`ab696163e3bd3408bbc5c9a401b9e49d3b85f775884e883c47494084b83b36c0`,
and `fa2c24d2ad0434d2534cc0073efa487c75ee98d2d75071e4ec14b4162eb43623`.
This source proof does not claim that the exact hosted sink has been exercised.

The existing Android post-failure collector still runs its original four
commands with the same arguments and 15-second deadlines. The new pure parser
receives that already-collected raw threadtime payload and current owned PID
inventory. Only complete LF/CRLF records with the fixed Error-level
`ReactNativeJS` framing, valid date/time fields and exact allowed marker are
positive observations. Missing stages remain null/UNKNOWN. Foreign PIDs,
duplicates, malformed text, partial records and exhausted limits have separate
bounded counters. The consumer discloses its 512 KiB, 10,000-record and 64-marker
limits. The receipt remains diagnostic, with cause UNDETERMINED and guest-clock
freshness UNVERIFIED; it cannot bind a record to this particular Maestro tap,
prove a route outcome or establish current screen visibility.

Reserved marker messages beginning exactly at the native message start remain
separate from runtime error counts, including rejected diagnostic suffixes.
Ordinary errors merely mentioning the marker later remain ordinary error input.
Optional parser failure leaves the receipt UNKNOWN and preserves existing fault
classification and private-output cleanup. No arbitrary log text, tag, PID,
timestamp, path, URL or error payload is exported.

The separate Maestro failed-assertion geometry projection is successor C2.
C1 alone adds no snapshot claim and does not change the existing four-key
`failure_observation` contract. Missing marker stages remain UNKNOWN.

Host controls execute the actual TypeScript handler/effect closures, including
original return/throw priority, listener/timer cleanup, release guards and quiet
observer failures. Parser/integration controls exercise foreign PIDs, malformed
framing, reserved-prefix placement, limits, privacy, optional failures and the
unchanged four-command query. Relevant React review checks cover existing hook
lifecycles and unchanged props/accessibility only. No UI-library refactor or
unrelated optimization is included. These controls are not native acceptance.

## Physical source-review split C1

This marker package descends from fixed join `8940d8601d65245ffbd1d42ad0095e8426579978`, whose
parents are frozen B642fc14d1f2c3bd3451fe257642b01c6d1c07c95 and external
044ebb6ea2d465f6a70e9116e3feac5a604cd696; its tree is exactly frozen B.
The join is a source-review baseline, not a native/release candidate.
The external thirteen-file addition is exposed fully across this marker package
and successor C2. Neither producer nor the earlier A/B packages are rewritten.
The complete new external source is approximately16.3k changed code/test tokens
(chars/4), with exact per-package estimates in their handoffs.

React review: existing mount effect/dependency counts, listener registration,
cleanup and timer behavior are preserved. The Skip handler calls the original
reset once with the same receiver/arguments and returns/rethrows immediately.
No state update, render condition, layout, accessibility prop or testID changes.
No UI-library or unrelated performance refactor is included.
