# R5 delivery continuation

This ledger records bounded implementation packages. Exact current source SHA,
workflow run/attempt and actual results belong in [integration #7068](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7068)
and [execution #7082](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7082).
Never transfer a package's checks to the combined candidate. No merge, shared
promotion, release signing, upload, distribution, deployment or publication is
authorized by this document. Native development acceptance uses Cloud, with no
personal Mac dependency.

The supplied R4 source1d8a86a7462d935cbd0e28b857934b5718c152fc is already an
ancestor; no further R4 confirmation is awaited. This source fact is separate
from store/publication and device evidence in other workstreams. Core and5.1
are incorporated. **5.2 remains owner-reported running, unidentified, untouched
and unintegrated.5.1 and5.2 have not been tested together. No candidate freeze.**
The approved read-only assessor's source is also unavailable; its supplied patch
SHA256 is not a Git commit. Preserve both source dependencies without guessing.

## Included app and acceptance packages

Completed implementation means the bounded source/check deliverable; native
acceptance remains remaining unless an exact-source receipt says it ran.

| Package | Branch / draft / exact checkpoint | State / actual checks / next action |
| --- | --- | --- |
| Core deletion/startup/scoped copy | codex/r5-key-deletion-startup #7058,77b72da29ac5f2cdf3f51c9a0e9f3fd1c2af7238 | REMAINING native acceptance; source included. Earlier exact3eb combined565Jest/502recoveryPASS. |
| 5.1 backup/history | codex/7066-protected-backup-correction #7067,c1c4b803039b61b940373c4dc9d08473cf25e042 | REMAINING combined native acceptance; both protected-backup and Version History corrections included. |
| Biometric callback | codex/r5-biometric-callback-guard #7069,257fbe17e1a85d0e5d7e5d8ab97e1a69edbd9628 +14a2459b30e31ea3099d56f6c6928a4a3b7d6995 | COMPLETED source/review,17component controlsPASS; actual biometricsNOTRUN. |
| Infrastructure reconciliation | codex/r5-cloud-native-reconcile #7070,17baf3bff3a5cd96787218b9e8e1fee75f549967 | REMAINING live/installed acceptance; preserves7060/7063/7062 package reviews and R4 guards. |
| Native worker/storage witness | codex/r5-native-feature-probe #7071,486810052f90550d55dd6ddd541ff53ebd875caa | REMAINING execution; actual Realm/MMKV with controlled adapters, not full UI/crypto/backend acceptance. |
| Product measurements/Retry | codex/r5-native-product-measurements #7073,040955d0caca38bb3cb386ca2918adf60f0f30db | REMAINING five raw observations plus separate real socket-disconnect/Retry; development timing includes warm Metro/driver overhead. |
| Unused key/PIN UI | codex/r5-native-key-ui-acceptance #7079,5c4c211339aeee3216faa0663c309314a1627123 | COMPLETED implementation/host controls; native cancel/wrong PIN/delete/relaunchNOTRUN. |
| Installed-byte comparisons | codex/r5-installed-byte-acceptance #7083,56b91ba87da8e979cb3d72cadf25828b59bce61a | REMAINING combined execution;8independent controlsPASS. Exact3eb Android before-smoke pulled-APK comparisonPASS; this supplies no iOS/feature pass. |
| Credential errors | codex/r5-native-credential-acceptance #7088,dd5fca6707308e3d2a1e3fe664c7fa424455b258 | COMPLETED implementation/review,112Node/99PythonPASS. Controlled malformed native JSON, not OS denial; nativeNOTRUN. |
| Stale/empty Version History | codex/r5-native-version-history-ui #7093,b8abebb2001ac506eafb560d4ac8980eee8a6858 | COMPLETED implementation/review,115Node/98PythonPASS; controlled histories/actual Realm/exact restore, not authentic historic migration. NativeNOTRUN. |
| Genuine Vault reference UI | codex/r5-native-vault-reference-ui #7097,b6cb88c0b78e97988ead30f2e40ee4d8e6ef9341 | COMPLETED implementation/review,8host/67componentPASS, TS/lint0delta; visible/hidden/archive/reinstate nativeNOTRUN. |
| Companion orchestration | codex/r5-native-feature-orchestration-20261022 #7102,196bfeded03705315871eb5c8d1b693540110581 | COMPLETED source/review,124Node/125Python/actionlintPASS; root9+3controlsPASS. Producer ancestry preserved, primary failures/cleanup hardened, new native execution remaining. |
| Retry artifacts | codex/r5-native-attempt-artifacts #7100,461d3119dae6e717ab700ada2e4caaae2fcd257f | COMPLETED source/review,106Node/93PythonPASS; run+attempt names preserve prior evidence without overwrite. |
| Android startup diagnosis | codex/r5-android-startup-diagnostics #7101,87d21fa34ee7d55e2b49c91ccb83bc9a1c1346c7 | COMPLETED source/review,105Python/4policy controlsPASS. Actual collectionNOTRUN; unavailable factsUNKNOWN, causeUNDETERMINED. |
| Witness fee sizing | codex/r5-witness-fee-fix-20261022 #7098,514d2d656da17336312fef98989c01c2113ef9f1 | COMPLETED narrow fix/review;223actual-production-body testsPASS, immutable baseline78policies/927witnesses/120APIcasesPASS. Exact combined security/native fee checks remain. |

The orchestration and canonical platform workers have the same240minute global
ceiling on standard hosted runners, one build/device per platform. The new
100–150minute planning range is unmeasured; nested maxima can exceed the global
ceiling, which remains fail-closed. No larger runner or paid activation is used.
Physical-device and signer results require actual authorized devices/testers.

## Protected preparation and non-app work

| Package | Branch / draft / exact checkpoint | State / actual checks / next action |
| --- | --- | --- |
| Inventory, PHP research, unsent copy | codex/r5-cloud-release-readiness #7072,f2fc0cb557f0e5303335dadc9e98152640795e6c | COMPLETED preparation/research; deployed PHP exposureUNKNOWN, remediesR6, communicationunsent. |
| Fail-closed origin guard | codex/r5-release-origin-guard #7074,76150f455978c1a565f2c670774672bc18789877 | COMPLETED source fix,21controlsPASS; authorization deliberately disabled. |
| Worker core | codex/r5-protected-release-workers #7076,e195de31ffc38ec54fcee9c43f74e610139d3844 | COMPLETED preparation,67Node/24PythonPASS; signing/provider acceptanceNOTVERIFIED. |
| Frozen Ruby inputs | codex/r5-cloud-ruby-locks #7078,1241256d465d25f2ea2bb4c4e75fccb608ff276e | COMPLETED preparation; frozen118-gem install/load/project parse and Ruby21runs117assertionsPASS at its own checkpoint. |
| Protected orchestration | codex/r5-protected-release-orchestration #7080,c1e0e6df99eb762d62e31e9d71afa2cb97958bc5 | COMPLETED inert preparation/review,67Node/24Python/Ruby3runs16assertionsPASS; no dispatch/sign/upload. |
| Upload-only behavior | codex/r5-protected-upload-purity #7086,36df64be4ccafc287c0ac07fb911d7e3a1c4711c | COMPLETED source fix/review; actual pinned Fastlane fake-boundary8runs40assertionsPASS; no provider call. |
| Frozen preparation alignment | codex/r5-cloud-release-reconciliation #7096,945a0ee3c6af68eed70e412f948dcaab2f876150 | COMPLETED source/review;67Node/25Python/input alignment/actionlintPASS. Ruby inputs pair7078 with exact3eb Pod/Nitro inputs. |
| Canonical native producer | codex/r5-canonical-native-attestation #7084,29a73faaf4312f3536db9aad1d5b6795042aef7d | REMAINING installed/live verification;114Node/82PythonPASS. Incomplete parent obligations emit blocked readiness only. |
| Dedicated live-pin reader | codex/r5-canonical-pin-read-identity #7095,effd9175c00ebbdbaf616813a3ecfa6886bbbf45 | COMPLETED source/review,119Node/82PythonPASS; credential unprovisioned/liveNOTRUN, prior integration403 preserved. |
| Origin consumer | codex/r5-trusted-origin-consumer #7085,a1e167cab4e8485bb84418cadfb2313cbcedb644 | COMPLETED read-only source;89consumer+B1/100NodePASS. Not imported into B1, authorizationfalse. |
| Consumer byte proofs | codex/r5-trusted-installed-byte-proof #7087,546d77261d02c0633e45b2c62df8f8e5580620c0 | COMPLETED source/review,182consumer/203combinedPASS; retained as7099mergeancestor, no duplicate patch. |
| Official analysis provenance | codex/r5-codeql-run-provenance #7099,bd8ad7fc41b41b19a9d83a32b4e816a1e7abd51f | COMPLETED bounded source/review,268NodePASS; official upload/run linkage stronger, GAS-check-to-analysis joinUNVERIFIED and API403 retained. Authorization remainsfalse. |

These capabilities are prepared source, not installed or verified release
operations. Read-only environment inventory18:23:58UTC showed onlycopilot,Env,
keeper-claude-review; both release environments absent. Credential custody is
UNKNOWN after403, not asserted absent. Installation/pins/protection/API identity,
conditional review, artifact audience, binary config/provider readback and
actual cleanup/signing/upload acceptance remain separately bounded setup and
operation requirements. No production account operation is permitted here.

## Running, blocked and later packages

| Package | Checkpoint | State / next action |
| --- | --- | --- |
| Current paired backend | Private Relay #160,control296b2880f1e62f320665fb44d69288b72859fb0c; app3eb92fc8a622a3e09926d49f47243c163e32d009 +Relay29597b27eeeb299205bf7d0555db0a90c38cc4be | COMPLETED exact host protocol witness43+1+3PASS/run39825255620, genuine Realm/owned Mongo cleanup; rerun affected new candidate. Not native acceptance/deployment. |
| Private genuine native fixture | Relay #164,a5b85102c91d9b9362fcd6c0953d8a5827616903 | COMPLETED source/local4characterizationsPASS; real service/router/crypto/Mongo, provider traps. |
| Private native backup UI | Relay #165,fb021d101eac34855aff1bb440d6a1bc84e50b6a | COMPLETED source/11host controlsPASS; unarmed nativeNOTRUN, original checkpoint retained. |
| Private teardown follow-up | Relay #167,35860ea95202d071b585c9793215d5dbffdea3f4 | COMPLETED bounded fix/18Python2NodePASS; root independent18controlsPASS. Execution-fork setup remaining, no native marker. |
| Fresh restore fixture | Relay #166,codex/r5-native-recovery-20261022,f15a0825e82b3ec0775cac5286e6da9e2c191579 | COMPLETED bounded source/6current-protocol/crypto/source/admission controlsPASS; known-public vector, provider-free current v3. Build workflow correctlySKIPPED; no native execution. |
| Fresh restore / native accounts UI | Separate recovery consumer, then account switching | RUNNING bounded packages; genuine normal Restore UI/native Realm and cold history, native generated B remains on-device in separate package. Source estimates12–16k/7–12k, split before20k. No native result yet. |
| Hosted driver/runtime diagnosis | codex/r5-hosted-readiness-20261022 #7094,a319936a754372ff76b10d515dadeded87e88aca; reviewed follow-up codex/r5-startup-diagnostic-cleanup,50a0e3e7c1acbc8417001a6bbd1c691f7b2c08e8 | COMPLETED bounded source/integration/review;108Node/124Python/actionlintPASS, root32affected controlsPASS. Initialffb2131 diagnosis39832536511FAIL, runner lookup timed outUNKNOWN. No proven SDK cause; unchanged3eb retry passed driver readiness. New observation collectionNOTRUN. |
| Historical public caller ports | codex/r4-public-ci-v3-ports-20261022 #7091,b9dc036049561a8edd48f18f7492e2520ce4591c | RUNNING independent work preserved;32candidate ports, genuine runtime pending at inspected checkpoint,263historical obligations remain. |
| 5.2 | Actual task/branch/PR/handoff unavailable | RUNNING per owner; locate authoritative completed checkpoint, inspect overlaps, integrate verified commits and rerun affected checks before freeze. |
| Read-only assessor | task01a15e9e-3c9a-7518-8adc-2fe5eee410f4; supplied patchSHA2567f7ffc52c1aafa39448e2a1d6e7205c6a2b4c98606eb3a23b830bfe413a2c50f | BLOCKED source handoff; full key/origin/script/intent binding and native isolation remain. Never guessed to be5.2. |
| Navigation7055/timezone6991 | Existing bounded investigations | REMAINING native reproduction/QA; fourTZ72assertions+18historical controls, no confirmed narrow fix. Preserve scoped PIN/Emergency/backup copy. |
| Review/physical/release evidence | Conditional7034 route, exact source/artifact | REMAINING; independent source reviews recorded, applicable Claude route uninstalled/unverified/no paid activation, real devices/testers required for physical credit. |
| Excluded/later | Prior agreed boundaries | EXPLICITLY DEFERRED: legacy all-copy purge, parked7056secondPOST, storage/passcode redesign, ReceiveQR R07, broad terminology/componentsR08, scaling/AskreplySoon, separate AssistedMultisig. PHP remediesR6. |

## Evidence retained and remaining deltas

The current3eb window is preserved independently of next-source work. Attempt1
iOS driverFAIL/appNOTRUN; Android build/install/actual installed APKPASS but
startupFAIL, product/worker/Retry/key UI/five measurementsNOTRUN. Attempt2passed
the unchanged driver and development build, with startup smoke in progress at
the last recorded checkpoint. Its
future result belongs only to3eb and its actual run/attempt.

Old public protocol matrix2PASS/293FAIL, original CodeQL High, whole TypeScript
943errors and ESLint4450errors/882warnings remain recorded. Exact3eb individually
normalized static comparison had0added/0removed diagnostics. Scoped7098CodeQL
PASS is not fullR5clearance. An independent exact3eb local scan completed all89
default queries (888/888JS/TS and13/13Actions files), finding two inherited High
results; the first2048MB analysis attempt failed with OOM and the bounded4096MB
retry completed. Private SARIF and source evidence remain under SECURITY.md;
combined security comparison is pending. New combined checks must report
their own findings and source, including inherited failures and environment
blockers. Never suppress or relabel them as native success.

Core+5.1 already approximate35k changed code/test tokens. Major adopted
infrastructure retains its original reviews. New credential8–10k/history9.7k/
Vault8.3k/orchestration11–13k/Android diagnostics6.5k and private fixture9k/UI13–16k
are separate packages. Remaining source deltas include bounded recovery/account
packages above, small diagnosis overlap/cleanup fixes, final receipt-schema/trust
integration and source retargeting after5.2. Unknown5.2/assessor scope cannot be
estimated honestly before their authoritative handoffs. Continue unrelated Cloud
work while those dependencies remain unresolved.
