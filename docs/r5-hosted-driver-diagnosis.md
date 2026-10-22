# R5 hosted native driver investigation

Resume source: PR #7082, `3eb92fc8a622a3e09926d49f47243c163e32d009`.
Preserve run [39824790868](https://github.com/KeeperCommunity/bitcoin-keeper/actions/runs/39824790868)
and its Android execution. No cancellation, retry or duplicate is requested.

The iOS job `119985112961` failed during setup. Immutable JavaScript/Pod
installation, dependency patches, lock verification and owned iOS18.5 simulator
boot passed. Keeper build, smoke, persistence, production-worker features,
key/PIN, Retry, installed-artifact comparison and product measurements did not
run on iOS.

Artifact [12446402968](https://github.com/KeeperCommunity/bitcoin-keeper/actions/runs/39824790868/artifacts/12446402968)
has ZIP SHA256 `a8950bfd6dcb263050c4a46631b71f5f40f7f65378634451bb8b545721269991`.
Its fixed driver diagnostics show Xcodebuild selected, installer launch returned,
status polling failed without a response, and `IOSDriverTimeoutException` plus
`ConnectException` after149.8 seconds. They do not establish the underlying
Xcodebuild, XCTest installation or runner launch outcome. The installer return
marker precedes asynchronous readiness evaluation. No dependency, runtime or
timeout correction is justified by that artifact alone.

The separate `keeper/ios-driver-preflight` opt-in runs only the unchanged pinned
Maestro driver path on a hosted macOS runner, collecting bounded, fixed
diagnostics before owned simulator cleanup. It installs no app dependencies and
builds no Keeper app. It cannot start Android or supply app/native acceptance.
Raw logs, hierarchies, binaries, simulator data and arbitrary diagnostic text
remain on the disposable runner. Do not apply `keeper/native-diagnostic` to this
investigation while diagnosing setup.

After an observed cause is corrected, recheck current PR/branch/workflow state
and collect any newer existing results before scheduling one exact-source
hosted validation window. Remove opt-in before pushing changes to a candidate
whose synchronization would otherwise queue both platforms. Let active work
finish naturally. Record evidence against the actual checkout/run/attempt;
new commits invalidate previous source acceptance.

The complete bounded validation sequence is startup smoke, actual Realm/MMKV
persistence, six-process production-worker scenarios with committed source
hashes, then five healthy normal-app startup/first-wallet/cold-login measurements,
a separate controlled-disconnect/explicit-Retry fixture, and unused-Mobile-Key
cancel/wrong-PIN/correct-delete/cold-persistence UI. Installed bundle/APK bytes
must match before and after each applicable stage. Helper timings do not
substitute for the five full-product observations.

Referenced-Vault UI is not implemented by this companion; credential-store
faults and real biometrics/phones/signers remain NOT RUN unless actual evidence
establishes otherwise. Controlled transport is not genuine backend compatibility
or protected-backup deletion acceptance. No physical deferral, trusted gate pass,
merge, release signing/upload, deployment or release approval is inferred.

Current outcomes belong in the PR record after execution, without a post-test
source commit that silently transfers acceptance to a new SHA.

## Setup reproduction and remaining diagnosis

The setup-only run [39832536511](https://github.com/KeeperCommunity/bitcoin-keeper/actions/runs/39832536511),
attempt 1 at `ffb2131e4e4478e6befc93c9124941fcff4abb31`, failed with both app
jobs skipped. Artifact12450545303 has ZIP SHA256
`998f4569fe1c06f97c5627265a9e122349fec658c76e29c9a6fd9921c74a575b`.
The exact owned Xcodebuild remained alive without a driver listener or runner
launchctl entry. The runner-container query timed out, making installed state
UNKNOWN; its initial Boolean false must not be read as proof of absence.
The XCTest log was only 449 bytes with no classified test/dyld failure.
Generic permission-denied simulator events do not establish a cause.

The verified archive bundles SDK26.2 runners, but the test bundle's minimum
OS14.0 is below the selected18.5 runtime. SDK mismatch is an investigative lead,
not a demonstrated incompatibility. Keep the dependency and timeout unchanged
until evidence supports a correction. Sample the owned Xcodebuild during
Maestro polling, before the CLI deletes its temporary products; compare bounded
simulator-service controls before and during launch.

Historical run39024530330 at `d865ca9c4f91532a1524443cc6da42d8d7b07e1a`
actually passed driver preflight and startup smoke with the same Maestro archive
checksum, macOS15.7.9 ARM64/image20260907.0337.1, Xcode16.4/16F6 and
iPhone16/iOS18.5. Its driver readiness took153.7 seconds. That proves this tool
combination has worked; it neither transfers app acceptance nor supports a
dependency downgrade based only on the SDK difference.

Android's original artifact12448718229 proves build/install and the installed
single-base-APK SHA256 comparison passed, then startup smoke failed. Its generic
Metro error, HTTP200 warmup and console bundle markers do not identify a cause
or establish actual app-request success. The next Android startup observation
preserves the normal entrypoint, resolver, transformer, middleware, reporter and
assertions while recording fixed Metro event/query/status facts and a private
launch-window logcat including ReactHost. It does not change lazy loading or
perform another native run by itself. Capture cleanup must complete before any
later account/credential feature stage; original app failures remain intact.

## Adopted current execution

Before scheduling the next setup probe, the current run record exposed an
already-started attempt2 of39824790868 on the original exact3eb92fc source.
Its iOS job120011570058 passed driver readiness and began the app build. This
task did not trigger that retry. Adopt its results and serialized Android
continuation as the sole active app-acceptance window. Do not change its source
or dependency tuple, cancel it, or schedule a competing app build.

The investigation PR's exclusive preflight label was removed before further
preparation pushes. The live-stack and Android observability additions are
offline preparation until evidence requires another hosted diagnostic; their
contract passes are not native acceptance. The first failure's underlying cause
remains unproven, and a passing newer preflight does not establish a dependency
fix. No pin, timeout or app behavior was changed.

## Prepared diagnostic safety correction

Independent review of `a319936a754372ff76b10d515dadeded87e88aca` reproduced
receipt read/write failures replacing the original startup/driver exception.
In the Android observer finalizer, those failures also skipped capture, Metro
and device cleanup. The isolated follow-up preserves the primary exception,
attempts every owned cleanup independently, purges only the three new observer
raw files, then attempts the fixed receipt. A failed receipt or unconfirmed
cleanup fails a previously successful phase before any subsequent probe.
Shared private build/tool files remain available to later phases.

Failed, malformed or truncated inventories cannot establish absence. Runner
installation failures and the observer's non-positive process/foreground queries
therefore stay UNKNOWN (`null`); complete valid iOS process/launchctl inventories
can still establish presence or absence. PR #7101's separate Android failure
inventory remains the canonical complete process/foreground diagnosis when
combined; this companion retains its unique continuous launch-log and Metro
observations. Neither package establishes an Android cause.

The new regressions exercise the actual smoke and driver finalizers with fake
process/device boundaries, including receipt, capture-stop, Metro, device and
purge failures. They supply source evidence only. No native run, SDK/profile
change, timeout change, gate waiver or release operation is part of this fix.

## Observed iOS install timeout

Original source `3eb92fc8a622a3e09926d49f47243c163e32d009`, run39824790868
attempt2, job120011570058 passed driver readiness and the unsigned app build
(1614.3s). Warm bundle HTTP200 (164.0s) and fresh simulator boot (82.8s) passed;
`simctl install` then timed out with exit124 at120.4s. No Maestro, JUnit, app UI,
installed-byte comparison or later feature checks ran. Artifact12452576904 ZIP
SHA256 `eb78af70712620e31478d239931f804e21cdad11fc8655f398023d77f87cfc3a`
preserves that failure separately from the earlier driver failure.

The separate install allowance follow-up raises only that command's bound to
300s. This is an execution allowance, not an established cause or proven fix.
There is one install attempt, no retry; timeout still kills its owned process
group, fails the phase and disposes the simulator. The existing command receipt
already records the fixed install label, bound, exit code and duration, so no
additional speculative diagnostic stage is added. Byte comparison, default PIN
flow, runtime/SDK profiles and acceptance requirements remain unchanged. The
allowance has no native execution evidence until a coordinated exact-head run.
