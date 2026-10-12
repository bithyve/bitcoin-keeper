# Independent Claude reviewer

This is a lightweight, advisory Sonnet 5.5 review, independent of OpenAI Codex.
It does not approve or merge PRs, run application tests, or replace local validation.

## Credential boundary and setup

Before activation, an administrator must:

1. Create environment `keeper-claude-review` with custom deployment policies
   allowing **only branch `sprint`**, no tag policy or wildcard. Required human
   environment approval is optional; the branch restriction is mandatory.
2. Store a newly rotated Anthropic key there as `KEEPER_CLAUDE_API_KEY`, and a
   separate stable random secret of at least 32 characters as
   `KEEPER_CLAUDE_STATE_KEY`. Preserve the state key when rotating the API key.
   Remove repository/organization secrets exposing either new name or the old
   `ANTHROPIC_API_KEY` to this repository. A repository secret can be used by other
   internal PR workflows; changing this review workflow alone cannot protect it.
3. Verify the environment-policy read endpoints work with the workflow token.
   The reviewer checks the policy before its key-bearing step and fails closed
   on a missing policy, extra branch/tag, non-sprint event ref, or API error.

GitHub's environment branch policy prevents a PR-controlled `pull_request` or
ordinary branch-push job from obtaining the environment key. The trusted workflow
uses `pull_request_target` for automatic requests and the default-branch
`issue_comment` workflow for maintainer requests. The repository default branch
must remain `sprint`. Both check out an immutable trusted base/default SHA only.
Never change checkout to the PR head or synthetic merge ref.

These boundaries work together: the environment restricts ordinary PR/branch
jobs, while base/default-branch workflow provenance and trusted checkout protect
`pull_request_target`/`issue_comment` (whose event ref is already `sprint`). The
environment cannot make an unsafe PR checkout safe. Changing trusted workflow
code still requires normal review and merge approval.

A credential-free authorization job (read-only GitHub token, no environment)
checks the live PR and reconciles current maintainer permissions before allowing
the protected job to start. The protected runner repeats those checks after its
PR lock is acquired. Only a fixed boolean enters the workflow output.

Only pinned `actions/checkout` code and Python's standard library execute.
No Anthropic agent action, package installation, PR scripts, repository model
configuration, shell tools, MCP servers or model-generated commands execute.
The key stays in the trusted API process, authenticated requests refuse redirects,
and error bodies/source/model output never enter workflow command logs.

## Review and payment state

- Automatic events: opened, reopened, ready_for_review, synchronize and edited.
  Every run rechecks the live open/non-draft/same-repo/sprint PR. Docs-only
  Markdown/MDX changes consume no paid attempt, so later code can receive its
  first review. Executable/configuration files under `docs/` remain reviewable.
  Agent policy files (`AGENTS.md`, `CLAUDE.md`, `SKILL.md`) and `.github/` files
  are always reviewable, including Markdown; ordinary prose remains exempt.
- One automatic **paid attempt** per PR, including failed/uncertain/stale attempts.
  Concurrency serializes the PR with cancellation disabled. GitHub may coalesce
  queued events; each surviving run reads the latest PR snapshot.
  Eligible jobs alone enter the lock. Surviving runs recover the newest authorized
  current-head command from durable comments, so event coalescing cannot drop it.
- Maintainers request a review with `/claude-review FULL_HEAD_SHA`. The command
  must match the live head and current write/maintain/admin permissions.
  Association OWNER/MEMBER/COLLABORATOR is an early job filter only; API permission
  checks are authoritative, including recovered comments.
  Reusing the same comment/run or a completed head/base pair performs no paid request.
  A new command explicitly authorizes retrying a failed/uncertain attempt.
- Immediately before payment, a separate marker-only bot comment reserves the
  attempt. It is HMAC-signed and scoped to repository/PR; bot identity alone is
  insufficient. Model text is escaped and cannot create a state marker.
- API credential rotation preserves signatures through the separate stable state
  key. Invalid forged markers are ignored. Rotating the state key invalidates
  historical claims, so migrate existing markers before changing that key.
- Completion is persisted only after delivering the review. Timeout, process
  cancellation or delivery failure leaves a durable claim and never auto-retries.
  Deleting state comments can remove deduplication; preserve them.

Diffs use captured base/head SHAs, and report the actual merge-base diff origin.
Changed-file source comes from immutable blob SHAs. The PR is rechecked before
payment and publication. Changed-head/base results are explicitly stale.
Missing/binary/truncated patches, >200 files, >250 commits, incomplete comparisons, and
oversized inputs fail with an advisory incomplete diagnostic before payment.
Empty rename patches also require human review because mode changes are absent
from GitHub's patch JSON. Complete source for changed files up to 100KB is
included when the total input budget permits; unchanged neighboring files are
not inspected. Collection validates the full patch budget before requesting
source, then uses immutable head-commit/tree size metadata to skip oversized or
unaffordable source without downloading its blob. Optional context that would
overflow the input envelope is explicitly marked unavailable. Cumulative GitHub
response transfer is capped at 8MB, including comparisons, trees and comments.

## $3 request envelope

Pinned model ID: `claude-sonnet-5-5`. One paid Messages request, at most 8192
generated tokens including thinking, global inference and standard-only service.
There are no paid retries, cache controls, fallback models, tools or extra turns.
The free token-count preflight uses the exact model/system/messages.

The complete system/user input is capped at 400,000 UTF-8 bytes. Reserve the
larger of bytes + 10,000 tokens or twice the token estimate + 10,000, priced at
conservative ceilings of $5/M input and $25/M output. Reject any reservation over
$3 before payment. At the byte limit the reservation is $2.2548; token estimates
can cause earlier rejection. Returned usage must also remain within the bound.

Anthropic documents Sonnet 5.5 standard pricing as $2/M input and $10/M output
and describes token counting as an estimate. This enforced conservative request
envelope has ample margin; the Messages API has no provider-enforced dollar-cap
parameter. A dedicated low-spend Anthropic workspace supplies an additional
billing backstop. Recheck pricing before intentionally updating this model.

Sources: [model/versioning](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions),
[pricing](https://platform.claude.com/docs/en/about-claude/pricing),
[token counting](https://platform.claude.com/docs/en/build-with-claude/token-counting),
[Messages API](https://platform.claude.com/docs/en/api/messages/create).

## Safe verification and switch

Run `python3 -I -m unittest discover -s .github/scripts -p 'test_claude_review.py' -v`
without real credentials. The PR test workflow runs these hostile-data and fake
API fixtures with read-only permissions and no Anthropic key.

Before merge, a temporary verification workflow may execute a fixed, explicitly
reviewed infrastructure commit and make one tool-free Claude security review of
PR #7049 as data. It must pin checkout and reviewer source, test fixtures first,
have no PR checkout, and publish exact SHA/model/usage evidence. This verifies
the runner, not the unmerged production triggers or environment deployment.
Remove the temporary branch afterward. Do not rerun the old unsafe agent action.

Keep Copilot and required `Tests` / `keeper/local-validation` checks enabled.
Do not merge until protected-secret setup and candidate verification are complete
and the user approves. After that approved merge, verify the real trusted triggers
and protected credential access while Copilot remains enabled; disable Copilot
only after the user approves that switch. Previous agent-action
reviews do not establish the corrected security boundary.
