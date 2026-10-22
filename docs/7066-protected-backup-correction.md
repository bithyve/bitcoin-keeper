# Protected-backup correction — #7066

## Source and scope

This patch uses the owner-designated completed R5 implementation source
`77b72da29ac5f2cdf3f51c9a0e9f3fd1c2af7238` from [PR #7058](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7058).
Live records checked on 22 October 2026 show an open draft with `NEEDS_LOCAL`,
not a publicly released 2.6.5. There is no 2.6.5 GitHub tag/release. The source
still declares 2.6.4 (Android 627, iOS 620); this patch assigns no version.
Store publication/availability has not been checked or inferred.
Its ancestry includes released R4 source
`1d8a86a7462d935cbd0e28b857934b5718c152fc` and `sprint`
`def0d6a90c80287edb4f58ae272cbfc340f00d73`.

Work runs in the selected **Bitcoin Keeper** managed environment, in a separate
worktree and `codex/7066-protected-backup-correction` branch. Explicit fetch
successfully obtained the R5 commit missing from the previous stale attempt.
Live searches found no other #7066 PR/implementation. R5 and the original
checkout remain unchanged. The PR targets `sprint` per AGENTS.md and links a
patch-only comparison from the exact R5 SHA.

The provisional code/test estimate was 5k–10k changed tokens; after diagnosis the
estimate is 10k–12k, including workflow/privacy regressions and the supplemental
current-backend witness. This remains one backup correction and its adjacent UI,
with no legacy all-copy purge, protocol redesign, release change, or parked
investigation.

## Evidence and limits

The [current Relay production receipt](https://github.com/KeeperCommunity/bitcoin-keeper-relay/pull/158#issuecomment-6321195858)
reports selected source `29597b27eeeb299205bf7d0555db0a90c38cc4be` and 14 hosted
protocol checks passing on 21 October after correcting a storage-readiness
probe. The current app and Relay v3 signing, namespace, projection, revision,
generation, epoch and tombstone contracts agree on inspection. The hosted
checks used a fresh synthetic namespace; they do not establish this upgraded
iPhone's backup state. No production operation is performed for this patch.

An enabled never-enrolled installation has only a read-only Check Again action
on the baseline status screen. Repeated reads leave that state unchanged and
cannot finish enrollment. Existing accounts can retain automatic-backup consent
while their legacy encrypted copy has never been enrolled into v3. The backend
intentionally does not adopt a legacy copy as a protected backup. The patch
exposes Back Up Now through the existing explicit repair path, preserving its
account/session, consent, conflict, upload acknowledgement and complete readback
guards. Check Again still never enrolls or uploads. Disabled/deleted/conflicting
states do not silently repair or recreate a protected copy.

The same action is available for the generic unverified state. This is a direct
retry route; it is not evidence that every unverified state was permanently
stuck. For example, after a committed enrollment with a lost reply, a later
read can report different, where the baseline already offered backup. The
failing-before UI controls specifically cover enabled never-enrolled and
unverified states; the supplemental service witness separates those schedules.

An authenticated, validated never-enrolled result is absence of a protected
namespace, not evidence of deletion. Delete remains non-success in that case;
the UI explains the absence instead of showing the generic uncertain-deletion
message. It neither creates a namespace to delete nor deletes legacy copies.
Authorization, network, invalid/incomplete readback and uncertain mutation
results remain failures.

The screenshot's generic unverified state does not establish which request
failed. The original phone's cause and corrected behavior remain **unconfirmed**.
The user can reveal the latest bounded diagnostic on the status screen: fixed
operation/stage/category, HTTP error status when available, elapsed milliseconds,
and app version/build. This result exists only in memory for the selected account
session and is cleared on account changes/new operations. It never displays or
persists caught errors, request/response bodies, headers, identifiers, ciphertext
or recovery contents. Do not request raw logs to fill the remaining evidence gap.

## Targeted native acceptance

Run on the exact final PR head, with the actual compatible backend selected and
recorded. Use disposable accounts and installations for every destructive step.
Record IOS, ANDROID and HARDWARE results separately, including build/backend
identity and any step not run. JavaScript, Linux Realm and fixture results do
not constitute native or original-phone acceptance.

1. Create an older-account fixture with synthetic recovery contents and legacy
   encrypted server copies. Retain saved automatic-backup consent when upgrading
   through 2.6.4 to the patch; use the native app's persisted storage. Include
   wallets, keys, a vault, node and label/metadata as applicable. Check the fresh
   account separately as a control.
2. Interrupt an enrollment/upload or use the demonstrated failing path. Confirm
   enabled and unverified are distinct facts. Check Again only reads. Back Up Now
   explicitly retries through the guarded repair, then requires an acknowledged
   upload plus authenticated complete matching readback. An uncertain reply must
   not claim Verified. A remote recovery conflict must preserve both copies.
3. Reopen/cold launch the same account and recheck. Make an ordinary backup-relevant
   metadata change, confirm it reaches the protected copy, and recheck again.
4. Recover the disposable protected backup into a separate disposable installation.
   Verify complete expected recovery contents and restored consent remaining off
   until the established explicit choice. Never restore over the owner's phone.
5. Turn off automatic backup. Confirm no copy was deleted and status checking
   remains read-only. Separately re-enable and verify backup, then delete the
   disposable protected copy. Require fresh confirmed tombstone/readback, auto
   off, and unchanged local recovery contents. Fresh-read the deleted state and
   explicitly recreate; deleted protected records must not resurrect. Older
   read-only encrypted copies may remain.
6. Check missing enrollment, authorization failure, interrupted request and
   malformed/incomplete readback. No error may become Verified/Deleted. Repeat
   while switching A → B → A; stale work and diagnostics must not bind to the new
   account/session. Revoke consent while backup runs and check the result.
7. On iOS and Android, check More, backup status and the affected enable/delete
   dialogs in light/dark themes, small width (320–360 logical pixels) and larger
   system text. Both long actions must wrap, remain fully readable and tappable;
   the explanatory copy must be complete. Scroll through persistent feedback
   without obscuring bottom navigation. Check retained-copy notice spacing,
   progress/disabled actions, diagnostic show/hide and accessibility labels.

## Original working iPhone — non-destructive only

Before an approved corrected build is available, capture only version/build from
About and, if available, the user-initiated fixed diagnostic from a normal Check
Again. Share only the bounded fields listed above, never screenshots containing
account details or raw logs. After the approved build/backend pair is available,
use normal Back Up Now and Check Again, then reopen/recheck. The owner must confirm
that successful verification persists. Do not reset, uninstall, restore over,
delete a backup, or export private recovery data on that phone as a diagnostic.

Keep #7066 open until disposable native acceptance and original-phone confirmation
are complete. No merge, signing, distribution, deployment or publication is
authorized by this patch or by a passing Cloud check.

## Reproduce the supplemental upgrade witness

Use Node 22.23.3+, frozen app dependencies with repository patches, the genuine
Realm 12.15.0 Linux/macOS N-API binding, a clean separately obtained Relay checkout
at `29597b27eeeb299205bf7d0555db0a90c38cc4be` with frozen dependencies and
`npm ci --ignore-scripts --prefix tests/proof-tools`, and a disposable loopback
Mongo replica set on port 27038. The wrapper verifies exact source hashes and
driver versions; it leaves the historical proof runner/pins unchanged.

```sh
KEEPER_PROTECTED_RELAY_CHECKOUT=/absolute/path/to/current-relay \
BACKUP_TEST_MONGO_URL=mongodb://127.0.0.1:27038 \
node scripts/run-protected-upgrade-regression.cjs
```

The witness uses actual persisted Redux consent, encrypted native Realm, signed
HTTP, current Relay and disposable Mongo: old legacy account → cold rehydration
and upgrade → never-enrolled read/delete non-success → interrupted enrollment
reply → read-only recheck → explicit repair and complete comparison → disable
retains copies → protected deletion/tombstone → explicit recreation. It checks
that legacy and local recovery contents survive. It is a host integration proof,
not native app or original-phone acceptance.

In this Cloud environment execution is **BLOCKED**: the native Realm binding is
absent and `prebuild-install --runtime napi --target 6` received proxy CONNECT
403 from `static.realm.io`. No cached binding or official GitHub release asset
was available. No network-policy bypass, mock substitute, or passing upgrade
proof is claimed. Syntax and exact-current-source admission/wrong-head rejection
were checked. Native acceptance must complete this witness and the matrix above.

## Actual Cloud checks

Node 22.23.3 / Yarn 1.22.22; frozen install and all six repository patches PASS.
Package, lockfile, Pod inputs and version consistency remain unchanged.

| Check | Actual result |
| --- | --- |
| `npm run test -- --runInBand --coverage=false` | PASS: 48 suites, 550 tests, zero skips/failures |
| `node --test tests/recovery/backupDiagnostic.test.cjs tests/recovery/transport.test.cjs tests/recovery/repair.test.cjs` | PASS: 70 tests, zero skips/failures |
| UI interaction suite | PASS: 12; exact-baseline controls FAIL 2 assertions, 10 deliberately deselected (enabled never-enrolled and unverified backup action absent) |
| Diagnostic baseline controls | FAIL: all 9 before; PASS: all 9 after; these establish diagnostic coverage, not the phone's request cause |
| `npm run test:recovery` | FAIL: 479 pass, one test-file load failure, zero skips; missing Realm binding prevents the 10 encrypted-Realm scenarios from loading |
| Supplemental current-backend upgrade witness | BLOCKED by missing Realm native binding; no passing upgraded-account integration claim |
| Current Relay protected/legacy protocol tests on disposable Mongo | PASS: 45; readiness tests PASS: 7; backend only, not upgraded-app acceptance |
| Whole ESLint | FAIL: 4450 errors / 882 warnings; exact baseline 4451 / 882; normalized zero added, one removed |
| Whole TypeScript | FAIL: 943 diagnostics; exact baseline 943; normalized zero added/removed |
| Focused backup service ESLint | PASS: zero errors/warnings |
| CI USDT/retired-configuration guard command | FAIL: 30 pass / 11 fail, all 11 require unavailable Ruby |
| `npm run test:release` | FAIL at Ruby stage (exit 127); preceding Node 28 and Python 7 tests PASS |
| Local-validation/protected-runner contract tests | PASS: 14 |
| Android static/reproducibility Python tools | PASS: 31 |
| Version, JSON parsing, new proof/runner syntax, whitespace | PASS |
| iOS / Android app build, simulator/emulator, physical phone | NOT RUN; required exact-head native handoff remains NEEDS_LOCAL |

The current-backend command, run in its separate exact checkout, was:

```sh
KEEPER_APP_SOURCE=/absolute/path/to/keeper-patch \
BACKUP_TEST_MONGO_URL=mongodb://127.0.0.1:27038 \
node --test tests/protectedBackup.test.cjs tests/legacyBackupReadOnly.test.cjs
```

The task-owned disposable Mongo container is stopped; its data/evidence are
retained. Passing backend checks do not replace the blocked upgraded-account
witness. Existing formatting/lint/type failures are reported, not waived. No
independent cryptographic certification or release clearance is claimed.
