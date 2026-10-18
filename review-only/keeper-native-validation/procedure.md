# Review-only bounded HTTP evidence correction

Local preparation only. This document does not authorize a push or request retry. The correction cannot recover the causes of historical Android input/CocoaPods failures in run 39110949138 or the HTTP 403 in run 39115084442. The latter response headers/body were not retained. Any future evidence would describe only a newly authorized request.

## Fixed identities and scope

Repository: KeeperCommunity/bitcoin-keeper. Proposed first-created branch: codex/native-http-evidence-diagnostic-bccb6334. The packaged runner must have the exact app source as its sole parent.

- Base: def0d6a90c80287edb4f58ae272cbfc340f00d73.
- App source: bccb63348754e7a7975ea140717d31be214f0801.
- App source tree: 3768d44eaa9005f56f564b1faeb2732bef2da1e8.
- Reviewed harness: 0984c5b97e7e8326d6856ba662274ecf325e5e0f.
- Previous diagnostic runner: 3ac24c3c1ae468ec122d1369c6a8b16ec121e9a1, kept unchanged.

Android: one ubuntu-24.04 job, at most 5 minutes, exact checkouts and input verification/staging only. No Node/Java/SDK setup, dependency installation or emulator execution.

iOS: one macos-15 job, at most 30 minutes, exact checkouts, original pinned setup actions, original record and prepare phases only. The pinned harness main() retains its environment initialization. Preparation comprises frozen Yarn with scripts disabled, reviewed patches/Node mapping, synthetic configuration, pinned Maestro download/extraction, CocoaPods 1.16.2 installation and pod install --deployment. No driver startup, app compilation, simulator, app launch or probes. Existing Podfile/locks must remain unchanged; pod update/repair and non-frozen resolution are excluded.

Combined cap: 35 runner-minutes (5 + 30). Target new charges: $0 through the same public-repository standard-runner route, to be rechecked before any separately authorized execution. No cache configuration, artifact upload, paid resource, grant, signing or release step. No execution or publication has occurred for this correction.

## Bounded response evidence

verify.py retains every original validation predicate, public unauthenticated source request, checkout and hash check; only the unique branch identity changes. The workflow likewise changes only that branch identity. No authentication, URL, credential, permission or trust change is introduced. The source-map digest is updated to bind the copied verifier bytes.

On HTTPError, diagnose.py reads the existing response once with an 8,193-byte limit and closes it; it never requests the error URL or documentation URL. Bodies over 8,192 bytes are not parsed. JSON is limited to 32 nesting levels, duplicate keys and non-JSON constants are rejected, and only a top-level string message of at most 2,048 characters is considered. Controls, malformed JSON, HTML, missing/unrecognized fields and read failures yield fixed states with no raw fallback.

Recognized leading messages produce fixed categories for declared primary/secondary rate limits, integration/token permissions, authentication and server errors. The exported redacted message is a constant canonical phrase; all supplied message text, including prefixes/suffixes, is discarded. A generic 403/Forbidden remains UNKNOWN. An unrecognized private prefix cannot produce a known category.

The only exported header values are strict ASCII decimal retry-after seconds (0–604800), x-ratelimit-limit/remaining/used (0–1000000000), x-ratelimit-reset epoch (0–99999999999), and x-ratelimit-resource from a fixed five-value vocabulary. Duplicate/conflicting headers, controls, dates, large/out-of-range values and unknown resources are rejected without echoing them. Exact Server: GitHub.com is reported as GITHUB_DECLARED; other values remain UNKNOWN. issuer_verified is always false. Status, header observations and body declarations remain separate: remaining=0 does not establish cause, and conflicting signals are not silently resolved. No authorization, cookie, redirect, request ID or arbitrary header/body field is exported.

The original error category and nonzero failure survive extraction failures. A denied/failed verifier guard stops further guard requests; this includes HTTPError, URL/network errors, timeout and any other guard exception. A network exception from the harness also suppresses the final network guard. Ordinary command failure still receives its final guard, and that guard cannot turn the original failure into success. A failure there is recorded once and stops. Successful preparation retains all three original guard calls. No automatic retry, alternate route, fallback authentication or retry-after scheduling is added.

CocoaPods diagnostics remain the same bounded first/last 64 KiB fixed-category inspection of the private deployment-command log. Records remain capped at 8 KiB and printed as KEEPER_DIAGNOSTIC. Acceptance always remains NOT_ACCEPTED; native builds and probes remain NOT_RUN. No raw diagnostic artifact is uploaded.

## Deterministic local validation

Run python3 -B -m unittest discover -s proposal -p 'test_*.py' from the package directory. Fixtures cover 403 variants, ambiguous/absent fields, privacy, numeric/header/body/nesting bounds, duplicate keys/headers, read/close/extraction failures, no repeated guard after denial/network failure, command failure plus denial, preserved successful guards, pinned harness entrypoint, verifier digest and unchanged workflow settings. Tests use synthetic inputs and mocks, with no network/native request. Python syntax, workflow structure/immutable pins and git diff checks are separate checks; unavailable actionlint must be reported as not run.

## Minimal next execution proposal, requiring separate authorization

1. Verify the exact reviewed commit/parent/tree/patch, clean unchanged source/harness, unchanged sprint, public visibility and the $0 standard-runner route, no overlapping run, and absent target branch. Stop on material drift or denied access; do not change credentials/routes to continue.
2. Only after explicit authorization, push that one commit once to the new branch above. First-created push and attempt-1 guards prohibit reuse/rerun. If push outcome is uncertain, inspect remote/run state before any other write.
3. Observe that one setup-only run within 5 + 30 minutes; retrieve its fixed records through the existing log reader and independently review them. Denials remain failures. No retry follows a denied request or unknown diagnostic.
4. Stop and report. Evidence belongs only to the newly authorized request; historical causes remain unrecoverable. Unknown/truncated/unrecognized evidence is not permission to expose raw data, bypass the 403 or authorize another attempt.

No PR/handoff/manual-status writes, security/trust changes, merge, adoption, distribution, signing, native build, old-run rerun, original branch update or additional attempt is included.
