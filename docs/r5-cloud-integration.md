# R5 cloud integration and acceptance record

This is an isolated candidate, not release approval. Ordinary development and
native testing use Cloud, including hosted macOS; the owner's personal Mac is
not a prerequisite. No producer branch or shared branch is rewritten.

## Source continuity

Observed 22 October 2026. Recheck producer heads before candidate freeze.

| Input | Verified commit | Integration |
| --- | --- | --- |
| Released R4 | `1d8a86a7462d935cbd0e28b857934b5718c152fc` | Ancestor of core and 5.1; no further R4 confirmation required |
| Core #7058, `codex/r5-key-deletion-startup` | `77b72da29ac5f2cdf3f51c9a0e9f3fd1c2af7238` | Included by ancestry |
| 5.1 #7067, `codex/7066-protected-backup-correction` | `c1c4b803039b61b940373c4dc9d08473cf25e042` | Integration starts here; includes backup and Version History corrections |
| 5.2 | Identity and authoritative checkpoint unresolved | Owner reports running; do not infer identity/completion or duplicate its implementation |

Patch-only review links remain separate:

- [Core changes after released R4](https://github.com/KeeperCommunity/bitcoin-keeper/compare/1d8a86a7462d935cbd0e28b857934b5718c152fc...77b72da29ac5f2cdf3f51c9a0e9f3fd1c2af7238)
- [5.1 changes after core](https://github.com/KeeperCommunity/bitcoin-keeper/compare/77b72da29ac5f2cdf3f51c9a0e9f3fd1c2af7238...c1c4b803039b61b940373c4dc9d08473cf25e042)

5.1 contains exactly two commits after core: protected-backup correction
`3c5f8d8ace5c211ed78264b1a460c4e06e060ceb`, then Version History correction
`c1c4b803039b61b940373c4dc9d08473cf25e042`. Package names 5.1 and 5.2 do not
assign app versions. Existing native inputs remain 2.6.4 / Android627 / iOS620;
the recorded R5 version intent does not establish new build counters.

## Approved scope and package boundaries

Master Task List Backlog245 and relevant R05 rows select safe discoverable key
deletion, wallet-reference protections and startup/first-use reliability;
bounded navigation/timezone reproduction; PIN/biometric verification; Emergency
Key and Assisted Server Backup copy. Later owner additions select protected
backup/Version History correction, cloud testing, bounded signing preparation,
PHP exposure research (remediation belongs to R6), applicable Claude review and
the separate read-only timelock-assessor candidate with its remaining safeguards.

Core and 5.1 already total roughly 35k changed code/test tokens. This integration
PR assembles reviewed inputs and evidence. Further implementation stays in
separate patch packages: CI reconciliation, executable native feature scenarios,
confirmed biometric callback correction if reproduced, current-protocol witness
repair if needed, and protected-release/non-app readiness. Re-estimate any package
approaching 20k changed code/test tokens or more than two substantial features.

Excluded scope stays excluded: all-copy legacy backup purge, parked #7056 second
POST investigation, storage/passcode redesign, Receive QR, broad navigation,
terminology/scaling redesign and Assisted Multisig implementation. Preserve the
existing assessor candidate; do not infer that it is 5.2.

## Acceptance rules

- An implementation checkpoint is not native acceptance or backend compatibility.
- Tests and artifact evidence belong to the exact tested checkout. Never transfer
  results from infrastructure-only source or an earlier candidate SHA.
- Run disposable current-protocol backup, recovery, deletion and account-isolation
  checks. Do not operate production accounts.
- Native acceptance requires feature checks and at least five raw startup and
  first-wallet observations, not only a startup/passcode smoke.
- Real biometrics, phones and signers require actual devices/testers. Emulator
  evidence cannot satisfy them.
- Hosted diagnostics of unmerged infrastructure cannot satisfy a gate that
  requires reviewed workflow ancestry. Keep trusted gates fail-closed.
- Signing, upload, distribution, deployment, publication, merges and shared-branch
  promotion require separate explicit owner approval. No such action is performed.

## Inherited evidence and unresolved findings

The original core and 5.1 Tests/public-backend jobs pass on their recorded heads.
Their old genuine automatic-backup matrix fails; the historical fixture's result
must remain visible alongside the current-v3 witness. CodeQL analysis execution
passes, while the separate security result fails on an inherited high-severity
incomplete sanitization finding at `src/services/wallets/operations/index.ts`.
No independent review or severity waiver is established. Lint jobs tolerate
command failures; green jobs do not mean lint is clean.

At initial integration there is no combined native acceptance, no five raw
measurements and no identified 5.2 checkpoint. Candidate freeze is blocked until
the authoritative 5.2 handoff is rechecked and all package results are recorded.
