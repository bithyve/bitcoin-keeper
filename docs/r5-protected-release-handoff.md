# Protected cloud release preparation handoff

This document reconciles the separately reviewable non-app packages. They are
prepared source candidates, **not installed or operational release capability**.
No signing, keychain, provider, upload, distribution, release or deployment
operation has been performed. The primary R5 candidate and all producer branches
remain unchanged. Work-package labels 5.1/5.2 are not app versions.

## Preserved source checkpoints

| Package | Draft PR / exact commit | Current state and next action |
| --- | --- | --- |
| Inventory, authorization preparation and research | [#7072](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7072), `f2fc0cb557f0e5303335dadc9e98152640795e6c` | Preparation complete. Its original estimate and NOT IMPLEMENTED worker state are historical package scope; later packages below supply inert worker candidates. Preserve its source/research evidence. |
| Origin guard | [#7074](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7074), `76150f455978c1a565f2c670774672bc18789877` | Deliberately disabled. The module-private origin marker is never minted by the collector; caller JSON/status names cannot authorize. Keep disabled pending separately reviewed integration. |
| Platform worker core | [#7076](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7076), `e195de31ffc38ec54fcee9c43f74e610139d3844` | Implemented future adapters, not executed. Review together with orchestration and the paired canonical native foundation. |
| Frozen Ruby inputs | [#7078](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7078), `1241256d465d25f2ea2bb4c4e75fccb608ff276e` | Actual frozen118-gem install/load/project parse previously passed. CocoaPods1.16.2/Xcodeproj1.27.0 must be paired with the reviewed native foundation's Podfile.lock; inherited worker-base lock1.15.2 fails before credentials. No native pass follows from dependency loading. |
| Manual orchestration and upload adapters | [#7080](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7080), `c1e0e6df99eb762d62e31e9d71afa2cb97958bc5` | Prepared, deliberately inoperable through B1. The small follow-up containing this handoff corrects TestFlight processing-path metadata writes; review its patch separately from this preserved producer. |
| Canonical native producer | [#7084](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7084), `29a73faaf4312f3536db9aad1d5b6795042aef7d` | Uninstalled/unexecuted. Five parent obligations remain NOT IMPLEMENTED; only blocked readiness can be emitted until genuine complete coverage exists. Read-only capacity admission is not an atomic lock shared with legacy routes. |
| Read-only trusted-origin consumer | [#7085](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7085), `a1e167cab4e8485bb84418cadfb2313cbcedb644` | Separate and unintegrated. Proofs retain authorization_eligible:false, release_authorized:false and execution_allowed:false. Official security-analysis/run linkage is unverified after analysis API403. Never use this object to mint B1 authorization. |

Each linked PR retains its patch-only comparison. Do not squash these packages
into an expanded app implementation PR or transfer their checks to another SHA.
The orchestrator's existing stack totals multiple substantial features; each
future substantial delta must remain separately bounded, with a new estimate
and a split before approximately20k changed code/test tokens.

## Final source review and actual checks

Independent review of orchestration c1e0 and its pinned Fastlane2.225.0 source
found one additional functional discrepancy: waiting for TestFlight processing
reaches `update_beta_app_meta` before `skip_submission` is honored. The follow-up
sets `skip_waiting_for_build_processing:true` with no changelog. Actual library
control-flow tests stub login, package construction and Transporter; the corrected
options stop after one fake upload, while the previous waiting flag reaches the
processing/distribution path. No store or network operation is exercised.

At preserved c1e0, independent local rerun passed Node22.23.3 contracts67,
Python contracts24, Ruby3.3.8 fake adapter tests3runs/16assertions and actionlint
for3workflows. These are source/fake contracts, not native/signing/store tests.
Initial reviewer invocations used a nonexistent artifact-test filename and
workflow path; corrected invocations passed without source changes. They are
review-command errors, not application regressions. Follow-up exact-head results
are recorded in its PR, rather than attributed to c1e0.

Source review also confirmed that transient cleanup, staged-source/recorded
nodeify overlays, signed payload digests and independent operation credentials
remain bounded. Actual hosted cleanup on failure/cancellation or runner loss,
full embedded production-config readback, provider-selected build identities and
processing remain **NOT VERIFIED**. Current upload receipts correctly record
command completion only and storeProcessingVerified:false.

Review follows the latest owner instructions and [#7034](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7034).
Signing/workflow/security changes require adequate Balanced coverage; record
reviewer route, exact SHA/base, findings and disposition. This independent cloud
agent review is source evidence, not a formal GitHub approval or completed
Copilot/Claude provider review. Claude is unavailable/uninstalled; no new paid
activation/retry is authorized. Human developer review is conditional, not a
blanket gate. Preserve substantive security findings and actual required checks.

## Observed one-time setup, without credential values

Read-only environment collection at **2026-10-22 18:23:58 UTC** returned exactly
`copilot`, `Env` and `keeper-claude-review`. Neither `keeper-release-ios` nor
`keeper-release-android` exists in that response. Earlier secret-name/variable-name
reads returned403: custody, value existence, ownership, scope and usability remain
UNKNOWN, not absent. No secret value was requested and no setup was changed.

| Setup boundary | Remaining evidence/action, requiring separately authorized administration or operation |
| --- | --- |
| Protected source and driver | Approved installation on protected sprint, reviewed exact canonical source and release ref, current nonsecret driver pin. No merge/promotion/pin/configuration change has occurred. |
| Protected environments | Create/configure only after approval: independent reviewers, prevented self approval, administrative bypass disabled and exact protected-source restriction; prove actual rejection before loading credentials. Environment selection alone proves nothing. |
| Apple signing | Authorized custodian for existing distribution identity/profile, matching team/app/entitlements and independently verified fingerprint; no personal Mac/keychain export, implicit certificate creation or rotation. |
| Android signing | Authorized existing upload keystore/alias/password custody and independently verified upload-certificate continuity; distinguish Play App Signing identity. |
| Store API custody | Approved least-privileged App Store Connect and Play app/channel identities, current agreements and authenticated complete version/build baselines. Names are listed in release/cloud/README.md; no values enter source, requests or logs. |
| Production app configuration | Reviewed client-safe allowlist and exact digest, no signing/upload/server secret embedded. Input digest/source checks do not establish full binary configuration readback. |
| Artifact audience | Separate owner receipt must acknowledge signed binaries accessible to authenticated readers of this public repository for14days. If that audience is not approved, a private reviewed artifact transport is still required. |
| Hosted capacity and trust access | Verify macOS/Xcode/Android readiness, safe caches/disk, one native build at a time and read-only variable/Actions/check/artifact/analysis permissions. Coordinate legacy routes; do not cancel active work. |
| Native, backend and physical acceptance | Complete exact-candidate software matrix and paired backend evidence remain separate from these source packages; actual devices/testers are required for physical results. |

## Remaining implementation deltas before any authorization integration

1. Bind official CodeQL security analysis to the selected installed run/attempt
   using a genuinely authorized read-only API route. Current403 and separate
   failed security outcomes are not a success. Keep authorization false while
   linkage is incomplete.
2. Reconcile installed selected-route evidence with the legacy all-checks/name
   predicate without accepting unrelated skips, pending/failed checks or another
   SHA. Retain exact owner/environment/version/config/certificate/artifact gates.
3. Require the later installed-byte proof added in [#7083](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7083)
   when combining the consumer with that foundation. Current consumer
   `validateReceipt` checks raw samples/Retry/key outcomes but omits root and
   per-scenario installed_artifact_verified/installed_artifact. Its positive
   fixture currently omits those fields. Enforce strict platform proof schema,
   built-byte identity and equality across samples/Retry/key receipts; reject
   missing/false/malformed/mismatched proofs. Existing false authorization flags
   and incomplete canonical matrix prevent this from granting release authority.
4. Complete the parent native feature/performance matrix in its own app/acceptance
   packages, then obtain genuine exact-canonical receipts after approved
   installation. Do not replace missing cases with helper/startup evidence.
5. Before calling signing/distribution verified, separately authorize hosted
   disposable/approved-channel trials and verify actual transient cleanup,
   embedded config/signature compatibility, artifact transport and provider
   build/readback receipts. This document does not authorize those operations.

The provenance integration and installed-byte binding are estimated separately
at roughly6k–12k changed code/test tokens before live validation; security API
availability and final native schema may change that estimate. Provider receipt
and configuration readback would be another bounded estimated3k–6k delta if
assigned, with actual hosted acceptance separate. No infrastructure absence is
treated as release approval or grounds to weaken a gate.
