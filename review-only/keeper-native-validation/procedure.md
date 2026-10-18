# Review-only one-time native bridge prerequisite

This proposal is not installed policy, execution authority, a handoff or a gate
attestation. Source remains bccb63348754e7a7975ea140717d31be214f0801, parent
sprint def0d6a90c80287edb4f58ae272cbfc340f00d73, tree
3768d44eaa9005f56f564b1faeb2732bef2da1e8. Exactly four files are byte-identical
to #7060 d865ca9c4f91532a1524443cc6da42d8d7b07e1a. No source correction was
necessary. The existing draft PRs/worktrees remain unchanged.

The final runner commit is recorded in identity.json after local packaging. It
is a child of the source commit, adding only this reviewed infrastructure. The
workflow is deliberately prepared with its real first-push trigger: it is NOT
installed and must not be pushed without the explicit execution approval below.
Its existence in this private directory creates no runner or execution owner.

## Minimum acceptance scope and why it is enough for this unit

The four-file change repairs dependency selection, upgrades the Nitro bridge,
aligns native IAP/OpenIAP pods, and initializes the React Native dependency
provider. MMKV 4.3.0, MMKVCore 2.4.0, Realm 12.15.0, the app schema and migrations
are unchanged. Independent review concluded that a historical-release fixture
is not mandatory for this narrow bridge prerequisite. The following actual
checks are required on BOTH platforms; no failure is waived:

1. Frozen Yarn installation without lifecycle scripts, explicit checked-in
   dependency patches, bounded Node mappings, deployment-only CocoaPods, and
   unchanged Yarn/Pod locks. Any install or patch failure stops that platform.
2. An unsigned simulator/development debug-key native build with artifact
   hashes verified before installation; actual current source, pinned harness,
   runner, runtime and toolchain records.
3. The original app startup/passcode smoke, with original index.js and App.tsx:
   render Create a passcode, enter four throwaway digits, render Confirm your
   passcode, and stop before storing credentials or creating an account.
4. An alternate development JS entrypoint in the SAME built native binary:
   real app MMKV wrapper typed string/number/boolean writes; real encrypted
   Realm objects using the current app schema 109; actual process stop and two
   relaunches preserving data; correct persisted values, separate-file isolation,
   transaction rollback, wrong-key rejection, targeted deletion and cleanup.
   Synthetic sentinels are invalid as wallet keys and use no owner data.
5. Actual IAP initConnection/endConnection/initConnection/endConnection, awaited
   and each strictly true. Each call has a 20-second deadline; missing APIs,
   false results, timeouts, unknown exceptions and known store unavailability
   BLOCK the probe. Host tests verify failure categorization only; they are not
   native failure-path evidence. No product lookup, purchase, restore, receipt,
   store login or account credential is used.

The existing-state case is REOPENING SAME-BINARY SYNTHETIC STATE. It does not
claim prior-release upgrade/migration compatibility. This is a native bridge
prerequisite, not full Phase A/R5, normal app account isolation, recovery,
performance, hardware or release acceptance. #7062's storage primitive was
adapted and independently reviewed; none of its historical or unexecuted
results is credited.

Android remains the reviewed API 35 google_apis/x86_64 pixel 6 image. It has no
Play Store/account, so IAP may report unavailable. That remains BLOCKED even if
storage succeeds. Approval of a run is not a promise of a green result and does
not permit swapping the image, adding a login, changing expected results or
retrying. A failed required platform check prevents LOCAL_PASSED.

## Valid publication and execution route without registration or adoption

Use a single first push to the currently unused branch
codex/one-time-native-validation-bccb6334. The reviewed runner commit's parent
is source bccb63348754e7a7975ea140717d31be214f0801, so that one push publishes
both objects. The app checkout remains exactly bccb; runner infrastructure is
checked out separately. Harness files come from #7063
0984c5b97e7e8326d6856ba662274ecf325e5e0f with their existing SHA256 pins.

GitHub push workflows can run from a branch before default-branch merging:
https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#push
No workflow_dispatch registration, default-branch merge, new service or grant
is assumed. Publication and automatic native execution are ONE consequential
step requiring explicit approval. Do not publish this runner merely for review.

Job predicates require the exact repository and branch, public visibility,
branch-created push, not deletion/force, workflow SHA equal to pushed SHA, and
attempt 1. Both jobs have contents:read only, no retained checkout credential,
no status/comment permission, secrets, cache, uploads or automatic retry. The
helper then verifies the immutable runner checkout/parent, source tree, pinned
harness hashes, current public repository, unchanged sprint def0d6 and the live
runner ref. Source changes or a moved base/ref block. The external reviewer must
compare the actual workflow SHA to the externally approved runner commit;
equality with self-reported metadata alone never establishes approval.

There is intentionally no source PR requirement for this OBSERVATION-ONLY run.
It selects no PR and cannot satisfy the installed keeper/local-validation gate
by itself. This avoids opening a PR just to obtain observations and triggering
existing Tests/non-frozen install or CodeQL jobs. Inspection of the unchanged
base workflows shows their push filters only match sprint/dev/main; the local
gate uses PR/comment events and release ingestion uses release events. None
matches this new branch push. Recheck those facts before any future push.

## Bounded, durable and non-sensitive evidence

Raw build, device, Metro and Maestro output stays under RUNNER_TEMP. Durable
summaries export only fixed categories/keys, numeric values, fixed repository
paths and SHA256/commit hashes, at most 64 KiB per platform. They record source,
base, harness and runner commits; run/attempt; source/probe file hashes; artifact
hashes; actual runner OS/architecture/image version; selected tool versions;
Xcode build and actual simulator runtime; actual Android SDK/NDK/system-image
revisions; pinned Maestro archive identity; Node mapping and synthetic config
hashes; successful JUnit counts; and Metro warmup/served-body hashes.

The Metro observer hashes exact served HTTP response-body bytes, which may
include transport formatting. It does not claim device receipt or parsed-JS
identity. It keeps at most 8 records per phase, no URL/header/body/path, and
separates known curl warmup requests from other served responses. The startup
uses the original app entrypoint; only the bridge phase maps to the synthetic
entrypoint. Native artifact identity, actual UI assertions and independently
verified workflow/source provenance provide supporting linkage.

Both actual JUnit reports must succeed without skipped/error/failure cases,
with successful actual step outcomes and unchanged artifacts. Missing or
malformed provenance blocks; arbitrary errors/diagnostics cannot become output.
Every summary remains acceptance:NOT_ACCEPTED. No job posts a handoff or gate
status. Checks are not an adversarial sandbox against malicious same-user build
code; source/dependency review and independent GitHub run verification remain
necessary.

Records live in ordinary Actions logs/job summaries, not uploaded artifacts.
GITHUB_RETENTION_DAYS is captured and bounded 1–90; no retention setting changes.
The reviewer must retrieve and independently verify the bounded summary and run
provenance before expiration, preserving the small safe record in this existing
private workspace or the coordinator record. Do not assume a 90-day setting or
indefinite GitHub retention. Expired/unavailable evidence cannot be credited.

## Verified zero-new-charge route

Read-only GitHub repository metadata confirmed public visibility and existing
push/admin permission on 18 October 2026. Official billing documentation says
standard GitHub-hosted runners are free for public repositories, and generated
log files and job summaries do not count toward artifact storage:
https://docs.github.com/en/billing/concepts/product-billing/github-actions
Standard macos-15 and ubuntu-24.04 are used; no larger/custom/self-hosted runner,
cache, uploaded artifact, custom image, package upload or new paid service is
proposed. Therefore planned new compute and evidence-storage charges are $0.
This is a documented route, not an inspection of the organization's existing
bill. Recheck public visibility, standard labels and billing rules before push;
stop if they no longer support $0 rather than adding a budget or permission.

One attempt, iOS 65 minutes and Android 60 minutes, total maximum 125 runner-minutes.
Do not manually rerun, dispatch, delete/recreate the branch or change expected
results under this approval. Missing Xcode 16.4/iOS 18.5 or other pinned tools is a
blocking result, never permission to change image/toolchain or regenerate locks.

## Exact next actions after explicit approval, and no further

1. Read-only recheck: source/worktree identities and cleanliness; sprint remains
   def0d6; target branch absent; repository public; existing push permission;
   no competing native execution; base workflows still exclude this branch;
   standard runner labels and documented $0 route unchanged. If any fails, stop.
2. Verify runner commit/tree against identity.json and SHA256SUMS. Push only that
   exact local commit to refs/heads/codex/one-time-native-validation-bccb6334 using
   the existing authorized repository connection, without force or new grants.
   Do not open/update a PR or post a handoff. That first push starts the two jobs.
3. Monitor only that exact run/attempt. Do not retry. Retrieve bounded evidence
   before its observed retention expires. Independently verify run/job/step
   conclusions and source/runner/harness identities; report PASS/FAIL/BLOCKED
   only for actual named observations. Any missing or failed required check blocks.
4. Stop. A named trusted collaborator's acceptance/report through the existing
   gate requires separate explicit approval of the one-time cloud-attestation
   procedure and actual sufficient evidence. Source/runner merging, policy
   installation, #7064 superseding, #7063 adoption, #7062 restacking, hardware,
   signing/distribution and all release decisions remain separately unauthorized.

Suggested execution approval (substitute exact final runner SHA from identity):
“Approve publishing the reviewed runner/source objects by ONE first push of
<runner SHA> to codex/one-time-native-validation-bccb6334, and the resulting
single iOS+Android native bridge prerequisite attempt on source bccb6334, at $0
new charges and a 125-minute total cap, including evidence retrieval/review?
Known IAP unavailability remains blocking; no retries, PR/status/handoff writes,
new grants, policy installation, merge, adoption, signing or release.”

This request is conditional on final independent review finding no remaining
execution-proposal blocker. It authorizes nothing until the owner approves it.
