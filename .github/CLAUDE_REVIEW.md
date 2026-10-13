# Independent Claude reviewer — deployment blocked

This lightweight, advisory reviewer uses `claude-sonnet-5-5` independently of
OpenAI Codex. It has no tools, shell, approval or merge authority. Copilot remains
enabled. The workflow defaults off: Repository variable `KEEPER_CLAUDE_REVIEW_ENABLED` must equal
`true`, and a signed ledger must attest completed production security checks.
Neither setting has been activated by this change. Do not merge or release.

## Confirmed findings and corrected spending state

The remaining Sonnet review of infrastructure commit
`bec965afc8f388429e4080625dfebf8fea09cd52` identified two real issues. Offline
reproduction bought four simulated Messages calls using four manual retry
comments for the same incomplete head, and deleting old marker comments allowed
a second automatic call. The corrected implementation makes comments request
and display data only; a separate protected repository holds payment authority.

Every attempt permanently reserves **$3.00**, even if actual cost is lower, the
result is incomplete/stale, the process times out, or publication fails. There
are no refunds or automatic paid retries. The ledger atomically enforces **two attempts
per exact head ($6)**, counting changed bases together, and **three attempts per
PR ($9)** across all heads. Only one automatic attempt is allowed per PR. A
completed exact head/base pair and repeated request ID are reused. New manual
comments cannot override these limits. Preparation failures consume no paid
attempt. Exhaustion requires a separately reviewed administrator decision; this
runner has no reset, grant or cap-override path.

Payment history is HMAC-signed, epoch-bound `ledger.json` on the fixed orphan
branch `keeper-claude-review-state` in private repository
`KeeperCommunity/KeeperCommunity-keeper-review-ledger`. It records request, head/base, run,
status, claim ID and full reservation. The Contents API's old file SHA provides
compare-and-swap; the runner verifies the resulting immutable commit and file
before Messages. A race, uncertain write or failed acknowledgement blocks
payment without retry. Authenticated parent-commit binding prevents copying an
old signed file into a new commit to roll back counters. Missing, malformed,
wrong-generation or inaccessible history fails closed; runtime never initializes
an empty ledger. Completion is persisted after successful result publication.
Deleting a review or request comment cannot erase a paid reservation.

The state App can append state but cannot delete or force-reset the protected
branch. Two active rulesets are mandatory: creation/update restricted to this
App; deletion/non-fast-forward blocked for everyone, including this App.
Administrators can still change repository policy, so administrator access and
policy audit are part of the trust boundary. Runtime verifies effective rules
and fails closed if either restriction is missing or weakened.

## Required administrator actions

These are deployment prerequisites, not actions performed by this PR.

1. Leave `KEEPER_CLAUDE_REVIEW_ENABLED` unset or `false`. Keep Copilot and required
   `Tests` / `keeper/local-validation` checks enabled. Confirm `sprint` remains
   the default branch. Review the exact candidate SHA and pinned actions before
   any trusted production installation; this request authorizes no merge.
2. Create environment `keeper-claude-review` with custom deployment policies:
   exactly **branch `sprint`**, no tags/wildcards/other branches. Required human
   approval is an optional additional control; the branch restriction is
   mandatory. Verify its metadata endpoints work with the workflow token.
3. Audit repository and organization secret **names, scopes and consumers**.
   Revoke the old Anthropic key at Anthropic, including any legacy
   `ANTHROPIC_API_KEY` used by earlier agent-action smoke tests. Remove repo/org
   fallbacks exposing that key or any of the three new secret names below to
   this repository. Do not merely rename an exposed key. Create a fresh key in a
   dedicated low-spend Anthropic workspace; configure workspace spending/rate
   backstops and verify Sonnet 5.5 standard pricing. Store it only in the protected
   environment as `KEEPER_CLAUDE_API_KEY`. Never paste keys into PRs/logs/source.
4. Create the separate **private** ledger repository with no ordinary PR-writer
   write access. Create a dedicated GitHub App installed only there, with
   Contents **write**, Administration **read** for private branch-rule metadata,
   and implicit Metadata read. Grant no Actions, Workflows, Secrets or
   Administration write permission, and no access to the application repository.
   Store its private key only in the protected environment as
   `KEEPER_CLAUDE_LEDGER_APP_PRIVATE_KEY`; set environment variable
   `KEEPER_CLAUDE_LEDGER_APP_ID` to its positive numeric App/Integration ID.
   The pinned token action requests only this repository and these permissions,
   revokes the installation token after the job, and runtime verifies that the
   token is an installation token scoped to exactly this one private repository.
5. Generate an independent random signing secret (at least 32 characters) and
   random 32-lowercase-hex epoch. Store secret `KEEPER_CLAUDE_STATE_KEY` and
   environment variable `KEEPER_CLAUDE_LEDGER_EPOCH`. Keep their recovery copies
   in an administrator-controlled secret manager; API-key rotation preserves them.
6. With the workflow still disabled, initialize the orphan JSON-only branch.
   The trusted module's offline `initial_document(...)` helper creates the signed
   revision-zero document with `production_verified: false`, no parent and no
   attempts; it performs no network write. Do not put secrets on command lines
   or enable shell tracing. Import **all** known prior charged/uncertain attempts
   before activation: validate immutable source SHAs, run IDs, billing/usage and
   old signatures using administrator-held evidence, assign distinct historical
   `audit-<40hex>` request IDs if necessary, and retain $3 per attempt. Preserve
   actual status or `started` for uncertainty; calculate revision as attempt
   count plus terminal-status count. Each signed migration binds the real single
   parent commit and preserves the epoch. Historical counts above current caps
   remain readable and block further payment for that PR; do not discard them.
   PR #7049 already had four meaningful paid candidate audits before this fix;
   it must not receive a fresh empty allowance. Verify all other historical runs.
7. Configure two **repository-local, active branch rulesets**, each targeting
   exactly `refs/heads/keeper-claude-review-state` with empty exclusions:
   (a) `creation`, `update`, bypass actors exactly the State App Integration ID,
   `bypass_mode: always`; (b) `deletion`, `non_fast_forward`, **no bypass actors**.
   Confirm effective branch-rules endpoints contain both rulesets. No normal
   user/admin role has a configured bypass; protect repository-admin membership.
8. Record exact-SHA negative verification: ordinary internal PR/branch jobs
   cannot obtain any protected key; source/path/title/comment injection reaches
   no shell; the App cannot access the application repo, delete/force-reset state
   or alter rulesets; missing ledger, invalid signature/epoch/parent, weakened
   rules, extra installation repository, unauthorized/stale requests, comment
   deletion, retry-limit exhaustion and CAS conflict produce **zero Messages**.
   Check trusted checkout, default-branch event provenance, no PR-code execution,
   narrow token scope/revocation and full historical migration. Use offline fakes
   for payment-failure cases and a zero-secret probe for credential-denial tests.
9. Obtain independent security review of the final installed candidate and
   collect production-boundary evidence. These changes have offline/Codex peer
   checks only; the earlier Sonnet review applies to the old SHA. Production
   triggers and credential isolation are **not verified** while this PR remains
   unmerged and administrator setup is absent. Do not use legacy keys as a shortcut.
   Once production security is verified and activation is separately authorized,
   an administrator may sign the one verification transition: preserve every
   record/epoch, set `production_verified: true`, bind the current real parent,
   and set revision to attempts + terminal updates + 1. Then enable the repository
   feature variable. Keep Copilot until real exact-head trigger/delivery/dedupe
   checks pass and the user explicitly approves its switch.

## Rotation, incident response and recovery

- **Anthropic key:** disable the feature flag, let an in-flight paid request finish
  or retain its uncertain reservation, revoke the old key, create a new dedicated
  workspace key, replace only the environment secret, and repeat isolation
  verification. Do not change signing key, epoch or any paid history.
- **State App key:** disable the feature flag, revoke any active installation
  tokens, replace the environment private key and delete the old App private
  key. Verify exact installation scope, read-only administration permission and
  both rulesets again. Preserve the ledger signing key and all reservations.
- **Signing key:** disable the flag and coordinate an audited offline re-signing
  migration of the complete ledger. Preserve attempts, $3 reservations, epoch
  and production evidence; authenticate the actual new commit parent and keep
  counters consistent. Never deploy a new signing key against old signatures
  or delete/reinitialize history. If the key may be compromised, independently
  reconcile immutable runs/billing before trusting the migrated ledger.
- **State missing/corrupt/exhausted:** remain disabled; restore verified full
  history using administrator-approved recovery without resetting debt. Required
  policy must still prohibit deletion/force pushes. Do not add permissive App
  bypasses or return to comment markers. Every uncertain paid call counts as spent.

## Trusted execution and review coverage

Automatic requests use trusted `pull_request_target` code; maintainer commands
use default-branch `issue_comment` code. Checkout is an immutable trusted
base/default SHA, never a PR head or merge ref. A credential-free read-only job
reconciles current maintainer permissions before protected environment access;
those permissions and PR eligibility are rechecked after acquiring the PR lock.
Only pinned checkout/token actions and Python stdlib run. No package installation,
PR scripts, agent configuration, shell/model tools or external MCP server runs.
Authenticated requests refuse redirects. Error bodies and model/source text do
not enter workflow command logs; the publisher escapes text in a `<pre>` block.
The model receives data only, never keys or environment access.

Requests are `/claude-review FULL_HEAD_SHA` from a current write/maintain/admin
collaborator. Event coalescing recovers the newest authorized current-head
command from comments; spent request IDs remain in protected state even if that
comment is removed. A collaborator-permission HTTP 404 means that command is
ignored; it cannot suppress automatic review or an older authorized command.
Other permission/API errors still stop the review before payment.
Docs-only Markdown/MDX consumes no paid attempt; agent-policy
and `.github/` files always count as reviewable. Later code pushes can receive
an unused first automatic attempt. Automatic events never repay an earlier call.

The review reports captured head, base tip and merge-base diff origin, fetching
source by immutable blob SHA and checking the live PR before payment/publication.
Missing/binary/truncated/empty patches, >200 files, >250 commits, incomplete
comparisons and oversized inputs fail unpaid with an incomplete diagnostic.
Optional changed-file source is limited to 100KB/file and remaining input space;
immutable tree sizes prevent unnecessary blob downloads. Source omissions are
explicit; unchanged neighboring files are not inspected. Each API instance caps
cumulative GitHub response transfer at 8MB.

## $3 per-run envelope and safe tests

One Messages request, model `claude-sonnet-5-5`, max 8192 output/thinking tokens,
standard-only service and global inference. No cache, paid retries, model fallback,
tools or extra turns. The free count uses the exact system/messages. Total input
is at most 400,000 UTF-8 bytes; reserve the larger of bytes + 10,000 tokens or
2 × count + 10,000, priced conservatively at $5/M input and $25/M output. Reject
above $3 before payment and validate returned usage. At the byte limit this is
$2.2548; the protected spending ledger nevertheless retains the full $3 allowance.

Sonnet 5.5 documented standard pricing is $2/M input and $10/M output. Messages
has no provider-enforced per-call dollar parameter; this conservative envelope
and dedicated workspace limits supply complementary controls. Recheck pricing
before changing model or routing.
[Model/versioning](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions),
[pricing](https://platform.claude.com/docs/en/about-claude/pricing),
[token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting),
[Messages API](https://platform.claude.com/docs/en/api/messages/create).

Run `python3 -I -m unittest discover -s .github/scripts -p 'test_claude_review*.py' -v`
without real credentials. CI runs hostile-data, spending, ledger-policy, replay
and atomic-write fakes with read-only permissions and no Anthropic key. These
checks establish code behavior; they do not prove live administrator setup.

## R4 PR #7045 remains gated

R4 head `b78b480eb4223390b2d17073387f9887d2e35f95` is a draft with 269 changed
files and about 1.32MB of full diff input. The current reviewer correctly rejects
it; a command or ready transition cannot provide complete bounded coverage.
The [fixed-head seven-batch proposal](review-plans/r4-7045-b78b480e.json) assigns
every patch exactly once, names immutable blobs/patch hashes and context limits,
and remains blocked. Its $21 first-pass planning ceiling is **not spending
authorization** and exceeds the normal three-attempt PR allowance. A separately
reviewed trusted session/batch runner and an explicit immutable, cumulative-budget
grant are required after activation; none exists or is enabled by this PR.

After production verification/activation, independently review the exact R4
snapshot using that approved bounded path, record full coverage and dispositions,
fix significant findings, and refresh Cloud checks and independent coverage for
any changed SHA. Only then issue another Local handoff for IOS, ANDROID, HARDWARE.
Current local validation is BLOCKED; no new local attempt, merge or release is
requested now.
