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
