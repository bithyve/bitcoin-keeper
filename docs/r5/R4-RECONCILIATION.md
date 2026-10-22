# R4 baseline reconciliation preflight — 22 October 2026

Status: source comparison complete; baseline selection is awaiting clarification.
This is not a completed rebase, released-baseline verification or native result.

## Evidence and baseline discrepancy

The owner reported that R4 is released and authorized the next R5 step. Read-only
checks found the latest recorded store-artifact source to be
`1d8a86a7462d935cbd0e28b857934b5718c152fc`, from open/draft/unmerged PR #7045.
Its newest public record, [store checkpoint](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7045#issuecomment-6313099996),
still says iOS 2.6.4/620 WAITING_FOR_REVIEW/manual release and Android 2.6.4/627
IN_REVIEW/managed publishing; public release is held. GitHub has no v2.6.4 tag or
release, and sprint remains `def0d6a90c80287edb4f58ae272cbfc340f00d73`.
The public Apple India lookup for app1545535925 returned 2.6.3, released 7 October.
That regional lookup is not proof of all countries/platforms and does not override
newer owner evidence that may not yet be recorded.

Clarification requested: use 1d8a86a as the settled baseline, or provide the newer
released SHA/tag. Pending that answer, R5's ancestry and PR base remain unchanged.
No R4 ref, release state, store state or backend was modified.

## Read-only integration preview

R5 compared: `98c4e2e78483ec03fac7ac72d86419e6da42fc98`.
R4 compared: `1d8a86a7462d935cbd0e28b857934b5718c152fc`.
Common ancestor: sprint `def0d6a90c80287edb4f58ae272cbfc340f00d73`.

`git merge-tree --write-tree` wrote a preview object only; no checkout, index or
branch merge was performed. The preview reports one textual conflict, yarn.lock.
Application modules combine textually; this does not prove semantic compatibility.
Localization and the CI workflow auto-combine but still require review.

Resolve a future lock conflict by preserving the selected R4 dependency graph and
retaining only necessary R5 root ESLint selector repairs. Do not reintroduce an
obsolete eslint-plugin-react resolution or discard R4's pinned backup dependencies.
Run frozen install, explicit patch application and input-immutability checks before
using reconciled dependencies. Do not copy another workstream's lockfile wholesale.

R4 contains 337 changed paths relative to sprint. Incorporating that unmerged tree
into the sprint-based R5 PR now would also expose R4's large change set as R5's diff.
Keep the R5 review range separate and confirm the release/integration baseline
rather than silently turning R5 into a vehicle to merge R4.

## Compatibility findings

- The R4 deletion worker forwards original app/session/write authority and treats
  unsuccessful local deletion as failure. `deleteAppImageEntityWorker` checks all
  retained Vault signer references *inside* the local transaction before deleting
  any signer. This complements R5's live-query/UI guard; it does not replace the
  pending integrated account/authentication, callback and native Realm tests.
- R4 middleware binds destructive action origins at dispatch. After integration,
  verify that an R5 confirmation created before an account/session switch cannot
  be rebound to a new account merely because dispatch happens later. Do not infer
  this from separate UI and backend unit tests. No backend/session guard was
  changed in this preflight.
- R5's Splash, setup and secure-store changes combine without textual conflict.
  R4's changed PIN/login flow remains authoritative for native validation; no
  shipped PIN fix was reimplemented. The updated Maestro flow must actually run.
- R4 still uses the Inheritance Key helper on ResetEmergencyKey. The independent
  R5 copy correction now selects an Emergency-specific localization entry, leaving
  the Inheritance helper and every time/policy/calculation operation unchanged.
  Both supplied locales retained their existing English-copy convention.
- Assisted Server Backup names/retention guarantees still require comparison with
  the actual shipped app/help surfaces; do not rewrite backup guarantees from the
  store-submission record alone.

## Executed checks and limits

R4 source was checked out **detached in a separate task-owned audit worktree**;
its tracked files remain unchanged. It reused the current R5 node_modules by
symlink, so no new dependency/environment/native setup was needed. Executed:

`node --test tests/recovery/accountSessionDestructive.test.cjs tests/recovery/deleteResultTruthfulness.test.cjs tests/recovery/signerPersistence.test.cjs`

Result: **31 PASS, 0 FAIL, 0 SKIP**, actual R4 source at 1d8a86a, using the existing
unit transaction/queue/Realm adapters. No production provider/backend, native
Realm, physical device, integration build or R5-on-R4 combined tree was tested.
These cases must not be presented as a reconciled R5 or native pass.

The Emergency copy change passes localization JSON parsing and `git diff --check`.
Its focused ESLint remains **FAIL 39 errors / 1 warning**, exactly the prior R5
screen's findings; zero added diagnostics. No new copy-mirroring test was added.
Native Emergency and Inheritance reset screens still need verification.

The previous R5 head98c4 hosted CI39586080249 Tests job and CodeQL39586080223 are
now SUCCESS. This is recorded job status, not a new native or clean-lint result.
Detailed hosted job-log download was unavailable (403); no new full-suite count
or claim that actual full lint passed follows from the green workflow job.
Prior local R5 218-test proof retains its original source scope.

## Next action

Confirm the exact settled R4 source, integrate/reconcile R5 in isolation while
preserving R4 and the existing review history, resolve the lock conflict narrowly,
and rerun affected R5 plus account/session/deletion and release-baseline checks.
Only then issue the exact-head finite native plan: Cloud first where available,
Mac only where needed, one native build at a time, fresh capacity assessment and
no unapproved worktree/device/wallet/cache/evidence cleanup. No optional Linux
setup is a prerequisite. No merge/release action is authorized by this preflight.
