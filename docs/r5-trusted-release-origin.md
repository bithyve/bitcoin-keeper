# R5 protected-release evidence consumer

This separate package adds a read-only consumer for original Actions execution
provenance. It does not import into the preparation gate or enable an operation.
The B1 guard at `551198c6a5d55d05b5ecd2cae57505ca69270264` remains fail-closed.
There is no release authorization, signing, build, upload or dispatch entry point.

`scripts/trusted-release-origin.cjs` exports `collectTrustedOrigin(request, token)`
and `isTrustedOrigin(proof)`. A proof is an immutable object registered in this
module's private WeakSet; a copied API/JSON payload cannot mint one. A future,
separately reviewed gate integration must call the collector again immediately
before every protected operation and after environment approval, bind its result
to the same immutable source/driver, and retain all owner/environment/config,
certificate, artifact and version checks. This object always records
`release_authorized: false`, `authorization_eligible: false` and
`execution_allowed: false`. **It must not mint B1's authorization capability.**

## Required installed sources

- Source and driver must both equal the **current protected sprint HEAD**.
  The repository variable `KEEPER_CANONICAL_NATIVE_DRIVER_SHA` must explicitly
  pin that same installed commit. No variable is created or changed here.
- Tests must originate from the active installed `.github/workflows/test.yml`,
  its latest exact-source `push` run on sprint and its `Tests` job with successful
  actual test, recovery, version and packaged-artifact steps.
- CodeQL must originate from the active installed `.github/workflows/codeql.yml`,
  its latest exact-source `push` run on sprint and its actual analysis job/steps.
- Canonical native evidence must originate from the separately reviewed
  `.github/workflows/keeper-canonical-native.yml`, its latest exact-source manual
  run on sprint, both platform jobs and its attestation collector step.

Each selected run must have completed successfully within 24 hours. The consumer
selects the latest run without a success filter, validates the current attempt,
and binds every required job to the original GitHub Actions check ID and check
suite. Status context strings, check names alone and a bot/app assertion provide
no credit. The legacy `keeper/local-validation` commit status is not treated as
independent canonical proof and is never manufactured here. Existing PR gates
and their installed-base requirements remain unchanged.

The official GitHub Advanced Security CodeQL result is checked separately from
the Actions analysis job: a failed, pending, missing or foreign-app exact-source
security result blocks this read-only proof. This matters because an Actions
analysis run can succeed while the separate CodeQL security check fails on a
high alert. The current API token cannot read code-scanning analyses (HTTP 403),
so analysis-key/security-result linkage to the selected run/attempt remains
**UNVERIFIED**, recorded as `security_analysis_run_linkage_verified: false`.
No fallback infers that linkage or treats the Actions job as security review.
The preparation capability remains disabled until that binding receives its
own reviewed implementation and genuine verification.

## Artifact contract

The canonical producer uses attempt-scoped names:

- `keeper-canonical-native-attestation-${sha}-${runid}-${attempt}` contains only
  `keeper-canonical-native-attestation.json`.
- `keeper-canonical-native-${IOS|ANDROID}-${sha}-${runid}-${attempt}` contains only
  `metadata.json`.

The consumer independently reads the original artifact API record, requires its
immutable SHA256 digest, original run/source association and unexpired bounded
size, then verifies the downloaded archive bytes. It accepts only a single
regular-file ZIP entry with the exact filename, at most 128 KiB archived and
64 KiB expanded; it rejects ambiguous ZIPs, extra files, links and traversal.
Only GitHub's signed HTTPS storage redirect is followed, without forwarding the
GitHub token. It prints no token, signed URL, artifact payload or process log.

The strict schema-1 attestation binds repository, source commit/tree, installed
workflow commit/path, original run/current attempt, route and both platform
artifact IDs/raw receipt hashes. All seven reviewed required native obligations
must be present exactly once and PASS on each platform. `feature_matrix_complete`
must be the boolean `true`. Each original platform receipt must independently
bind the same source/workflow/run/attempt and record PASS for build, startup,
native persistence, R5 worker scenarios and full product UI measurements.
It also requires the fixed nine executed-check IDs and bounded scopes. Original
receipts must contain all five raw product samples, history/key-entry observations,
the separately bounded Retry and unused-key/PIN UI receipts, and all five worker
scenarios/helper timing pairs. Worker function hashes are checked against the
same committed source files fetched as data from GitHub, rather than merely
trusting another PASS boolean or a self-reported source SHA.

The separate installed-byte follow-up also requires a literal verified boolean
and the exact platform proof schema at the receipt root, every one of the five
product observations, Retry and key/PIN UI. Android requires the single pulled
base APK SHA256; iOS requires the full typed bundle inventory and executable
SHA256. Every observation must match the root proof, and the installed binary
hash must match the built artifact. iOS typed inventory and the older build tree
use different algorithms, so their digest strings are not equated. Missing,
malformed, unexpected or mismatched fields fail closed; installer normalization
and successful installation commands provide no substitute for byte comparison.

The existing helper probe and product measurements do **not** complete every
required native obligation. The producer must emit blocked readiness evidence
while any obligation is unimplemented or unexecuted. The consumer rejects such
evidence; neither a successful startup nor a helper result waives a missing case.
It repeats mutable protected-source/pin, producer latest-run/current-attempt and
artifact authority checks after downloading the receipts.

## Verification and setup boundaries

Run `node --test scripts/trusted-release-origin.test.cjs scripts/protected-release-plan.test.cjs`.
All tests use fake API responses and bounded synthetic unsigned metadata archives.
They do not establish actual Actions permissions, installed trust, native feature
acceptance, signing identities, store access or release readiness. No native or
release operation has been run by this package.

Before any future integration, separately verify the canonical producer is
reviewed and installed, the nonsecret commit pin is set through the approved
repository administration process, and the read-only token can read repository
variables, Actions runs/jobs/artifacts and checks. Missing permissions, a missing
digest, pagination over 100 entries, a changed current source or incomplete
feature scenarios fail closed. This package adds no credentials and performs no
repository configuration or protection changes. Physical-device and paired-backend
acceptance remain separate exact-candidate evidence requirements.
