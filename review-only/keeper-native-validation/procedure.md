# Review-only input and CocoaPods diagnostic proposal

Execution is not authorized by this document. This proposal follows failed run 39110949138, attempt 1. It can identify a newly reproduced failure; it cannot prove the cause of a past transient failure.

## Fixed scope

Repository: KeeperCommunity/bitcoin-keeper. First-created push branch: codex/native-input-pods-diagnostic-bccb6334. The runner commit must have the exact app source as its sole parent.

- Base: def0d6a90c80287edb4f58ae272cbfc340f00d73.
- App source: bccb63348754e7a7975ea140717d31be214f0801.
- App source tree: 3768d44eaa9005f56f564b1faeb2732bef2da1e8.
- Reviewed harness: 0984c5b97e7e8326d6856ba662274ecf325e5e0f.
- Original observation runner: 3d578a0d88291274643ca24a655cd21878e28a8f.

Android: one ubuntu-24.04 job, at most 5 minutes, exact checkouts and input verification/staging only. No Node/Java/SDK setup, dependency installation or emulator execution.

iOS: one macos-15 job, at most 30 minutes, exact checkouts, original pinned setup actions, original record and prepare phases only. The pinned harness main() keeps the same environment initialization. This repeats frozen Yarn with scripts disabled, reviewed patches/Node mapping, synthetic configuration, pinned Maestro download/extraction, CocoaPods 1.16.2 installation and pod install --deployment. No driver startup, app compilation, simulator, app launch or probes. Existing Podfile/locks must remain unchanged; pod update/repair and non-frozen resolution are excluded.

Total cap: 35 runner-minutes. Target new charges: $0 using the same public-repository standard-runner route, rechecked before any future push. No cache configuration, artifact upload, paid resource, grant, signing or release step.

## Instrumentation

verify.py differs from the original only in the new branch identity. Every validation predicate, public unauthenticated source check and hash check remains. No token is added to those checks. diagnose.py invokes those checks; failures stay nonzero and acceptance is always NOT_ACCEPTED.

A source-map hash binds verifier-sites.json to verify.py. A failed check emits only fixed Vnnn site identifiers and a fixed error class, including allowlisted HTTP statuses. These identify the failing predicate/API location without printing exception strings, event payloads, URLs, headers, environment values or paths.

On iOS preparation completion/failure, the wrapper reads at most the first and last 64 KiB of the single private deployment-command log. It emits predefined CocoaPods pattern categories, COMPLETE/TRUNCATED/UNAVAILABLE and fixed lock-section mentions after a recognized deployment-lock header. Mentions and pattern matches are diagnostic hints, not proof of particular dependency changes. Raw log contents, pod names/versions from logs and lock values are not exported. The final guard runs even after preparation fails and cannot turn that failure into success.

Records are at most 8 KiB and printed to job stdout with KEEPER_DIAGNOSTIC, making them available through the already working job-log reader. No dependency on job-summary retrieval is introduced.

## Exact next actions, only after approval

1. Recheck the packaged runner/source/harness identities, patch digest, clean worktrees, unchanged sprint, public visibility/$0 route, no active overlapping run, and absent target branch. Stop on material drift.
2. Push the one reviewed local commit once to the branch above. First-created push and attempt-1 guards prohibit reuse/rerun. Check remote/run state before any repetition if the push result is uncertain.
3. Observe that single run without retry; retrieve job logs/step outcomes and independently review the fixed records against the approved source map.
4. Stop and report. A non-reproduced error remains an unknown cause for attempt 1. An unclassified/truncated diagnostic is not permission to export raw data or run again.

No PR/handoff/manual-status writes, trust changes, policy installation, merge, adoption, release, old-run rerun, original branch update or additional attempt is included.
