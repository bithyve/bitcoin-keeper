# R4 / 2.6.4 completion reconciliation

Evidence checked on 22 October 2026. This record distinguishes source completion,
submitted builds, deployed services and actual acceptance. It grants no merge,
deployment, signing, resubmission or public-release authority. The current owner
instruction keeps public release held. Existing approvals, source refs and running
R5 jobs remain intact.

## Current evidence

| Work package | Verified checkpoint | Remaining work |
| --- | --- | --- |
| [Mobile #7045](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7045) | Submitted source `1d8a86a7462d935cbd0e28b857934b5718c152fc`, draft/open/unmerged. Required Tests and `keeper/local-validation` pass. [Store receipt](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7045#issuecomment-6313099996) records signed iOS 620 uploaded/VALID, manual release, WAITING_FOR_REVIEW; Android 627 IN_REVIEW with 626 PUBLISHED and Managed publishing ON. APK checksums and both Keeper PGP signatures already verified. | Fresh authenticated Apple/Play readback is unavailable in this cloud session: no store credentials or store connector. Do not infer current review/public status from the 21 October receipt. Do not rebuild, allocate counters or resubmit. Current CodeQL security-result and public-v2 genuine-backup checks still fail. |
| [Private Relay #158](https://github.com/KeeperCommunity/bitcoin-keeper-relay/pull/158) | [Accepted production result](https://github.com/KeeperCommunity/bitcoin-keeper-relay/pull/158#issuecomment-6321195858): `29597b27eeeb299205bf7d0555db0a90c38cc4be` selected, process readiness matched, health 200, old-writer fence 403, 14 synthetic hosted-v3 operations passed, external TCP/3000 denied, temporary access cleaned. | This is completed deployment/hosted-protocol evidence. It does not pass installed-app/device or affected-account acceptance. Do not redeploy or treat the older undeployed/readiness wording as current. |
| [Website #19](https://github.com/KeeperCommunity/bitcoin-keeper-website/pull/19) | Merged and deployed; final website source `ddba13bd289e8899b16a6f653cf5c1ea66be6243`, production 7244276168. [Strict public HTTP run 39726344502](https://github.com/KeeperCommunity/bitcoin-keeper-website/actions/runs/39726344502) passed 8/8, including exact association/fallback bytes and direct JSON 200 without redirects. | Installed iOS/Android cold/warm link association, absent/present fallback, return-to-app and phone-to-Desktop acceptance remain unrun. No website rebuild or deployment is needed. |
| [Desktop #100](https://github.com/KeeperCommunity/keeper-desktop/pull/100) | Approved source `ef050663d33be51f25fb10310d5a0549b111e273`, CI successful. QA artifact 11615331902 remains downloadable, expires **23 October 2026 12:15:31 UTC**; cloud copy rehashed against the recorded outer/inner archive and executable identities. | Native Desktop plus actual phone pairing/signing acceptance remains unrun. Historical mobile pointer `d25d…` does not identify submitted mobile `1d8a86a…`. Keep #100 approval and head intact. |
| [Desktop #102](https://github.com/KeeperCommunity/keeper-desktop/pull/102) | Peer-reviewed, green draft `06233e6a576ae1c9d0a49a34c253b3e9354b9efc`; PGP handoff preflight guards are implemented. | Isolated [#103](https://github.com/KeeperCommunity/keeper-desktop/pull/103) adds those 12 guards to ordinary CI, preserving #102. This is CI proof, not native/signing acceptance. |
| [SigningServer #6](https://github.com/KeeperCommunity/SigningServer/pull/6) | Source-complete six-field lock correction `df9485e9945cdf0bdc231c70329d8905125d42ff`; hosted tests and both secret scans pass. Fresh runtime audit: zero critical/high/moderate, one existing Low AWS SDK advisory. | Ruleset 24651096 still requires one approval and last-push approval, despite optional-human policy draft #3. No service build artifacts/releases are published. Deployed version, health and mobile/provider compatibility are unverified; source CI cannot establish these. |

The mobile local-validation pass is the owner-selected subset, with unchanged-app
input carry-forward from `ffb89f28ace014bc581c53895b16260f2c8f4dd8` to the
metadata-only `1d8a86a…` head. It does not claim a new full native run. Preserve
[exact-source physical deferral](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7045#issuecomment-6312155011)
and [qualified validation](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7045#issuecomment-6312169993).
Developer review remains optional under the [recorded owner decision](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7045#issuecomment-6309829901); existing
requests/approvals are retained. A CodeQL analysis finishing successfully does
not pass its separate high-severity security result. Numeric-only fee-consumer
evidence supports review of the inherited warning; it is not a dismissal.

## Artifact availability

Mobile production bytes are identified in the store receipt:

| Artifact | SHA-256 |
| --- | --- |
| IPA 2.6.4 (620) | `c2ab7c0a49a3f0ccc5cbb1da6be1edcd6e3d71d0e8b9eba3acf57ea4d6174036` |
| AAB 2.6.4 (627) | `48e082dbe9cbc03280cef57cc65edecc004d9f2ee8991fadb2f73602052309ae` |
| APK 2.6.4 (627) | `cf0a84e2e1d73866a7c7b0fff00cbddefab01d06e49d15e4981157c9768090b2` |
| SHA256SUM.asc | `9f2b5125f232ee80c75b81c9b7a3ef53387956a77f57bc5aafbea347d43b5384` |
| KEEPER_DETACHED_SIGN.sign | `c2c1f37498c80506ff2229561c0d3cb1ba306e873ca41c32dccbd41e726302d5` |

The PGP fingerprint is `389F4CADA0785AC0E28A0C181BEBDE261DC3CF62`.
No 2.6.4 GitHub release/draft/assets are currently available; the inspected
current mobile CI run has zero artifacts. Store acceptance of an upload and
recorded hashes do not make the original IPA/AAB/APK/PGP files retrievable from
this workspace. A custodian must place the **existing bytes** in an approved
private cloud location; verify them against the receipt without rebuilding,
resigning, resubmitting or publishing. Do not make a personal Mac the ongoing
release route.

Desktop artifact 11615331902 was preserved at
`/workspace/r4-desktop-evidence/desktop-qa-11615331902.zip`; provenance receipt:
`/workspace/r4-desktop-evidence/artifact11615331902-revalidation.json`.
These workspace paths are session copies, not permanent distribution hosting.
The GitHub artifact retains its stated expiry. No artifact upload/publication is
implied by this preservation.

## Explicit deferred and unresolved acceptance

- Older-copy recovery, protected Delete/tombstone/recreate, original-order
  bootstrap/reconnect and additional native safety permutations remain
  **NOT RUN / OWNER-DEFERRED** under the reduced R4 scope. Existing recovery
  record/cold passes retain their exact-source limits; the two-extra-default-node
  whole-image equality difference remains a difference. No new campaign is started.
- C8 / [#7056](https://github.com/KeeperCommunity/bitcoin-keeper/issues/7056)
  remains **FAILED / PARKED, Later**: lost reply produced a second mutation
  request, despite one commit and later matching readback. It is not a pass.
- [#7057](https://github.com/KeeperCommunity/bitcoin-keeper/issues/7057)
  restored-fixture iOS navigation remains **NOT ACCEPTED / PARKED**, cause unproved.
  [#7055](https://github.com/KeeperCommunity/bitcoin-keeper/issues/7055) Android
  More-to-Wallets remains a separately tracked R5 follow-up if reproduced/in scope.
- Physical phones/cameras/NFC/USB/signers remain **NOT RUN / OWNER-DEFERRED** for
  the exact R4 source. Desktop and installed-link acceptance receive no credit
  from unit, synthetic protocol or HTTP-only checks. Use hosted/remote devices
  where available; no personal-Mac handoff is requested.
- [#7066](https://github.com/KeeperCommunity/bitcoin-keeper/issues/7066) preserves
  the owner's report of an App Store-updated iPhone showing 2.6.4, unverified
  backup and unconfirmed Delete. Accept the owner-reported installed version;
  stale in-app history is not a reason to ask them to repeat that check. This
  report alone does not establish global store state or exact installed build
  provenance. Separate R5 [#7067](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7067)
  already implements the focused backup/history/UI correction and is included
  in [#7068](https://github.com/KeeperCommunity/bitcoin-keeper/pull/7068).
  Native corrected-pair and non-destructive original-phone acceptance remain
  incomplete. Do not call the original phone fixed or automatically reopen the
  deferred R4 Delete campaign. The owner must assess any release-blocking impact
  from this known report; no critical defect is waived.

## Roadmap and R5 continuity

[Roadmap #7065](https://github.com/KeeperCommunity/bitcoin-keeper/issues/7065)
still has R4 active and requires owner closure. Git ancestry of the submitted
R4 source is established in R5 #7058 and #7068; descriptions calling it
"released", "live" or "shipped" are not fresh store evidence or R4 closure.
Retain the earlier owner/device reports with their source attribution while
correcting that distinction. Public status is unverified here; the present
instruction keeps further public release held.

Preserve all running R5 branches, checks and implementation. #7058 remains
`77b72da29ac5f2cdf3f51c9a0e9f3fd1c2af7238`, #7067 remains
`c1c4b803039b61b940373c4dc9d08473cf25e042`, and #7068 was inspected at
`3eb92fc8a622a3e09926d49f47243c163e32d009`. Later R5 progress is expected;
these are observations, not pins to force onto active work. Do not duplicate
#7066 or rerun/cancel the active R5 native/paired-CI jobs. R5 = 2.6.5,
R6 = 2.6.6, R7 = 2.6.7; retain the owner's bug allocations and sequential
closure rule.

#7060's successful hosted native passcode smoke belongs to its own source
`d865ca9c4f91532a1524443cc6da42d8d7b07e1a`, not submitted R4. Its dependency,
Pod and infrastructure changes would alter the submitted source. Leave adoption
with the existing R5 integration/review instead of adding a new R4 build cycle.
This choice neither waives tests nor changes existing gate results.

## Next owner actions

1. Obtain a fresh authenticated read-only Apple 620 / Play 627 status, release
   mode and live-version readback, and reconcile it with the installed-iPhone
   report. Keep the current hold; do not start another submission.
2. Make the existing signed mobile artifacts retrievable from an approved cloud
   location and verify their recorded hashes. Preserve Desktop's downloaded QA
   artifact by assigning durable retention to the existing cloud copy; use it for the outstanding installed-app,
   paired-phone and signer checks, recording each actual result separately.
3. Have an authorized administrator reconcile SigningServer's existing approval
   rule with the recorded owner policy while preserving checks/approvals. Bind
   any required service acceptance to the actual deployed source/artifact; no
   deployment is authorized by this record.
4. Review current protocol/security evidence and explicitly accept remaining
   noncritical deferrals or identify the remaining blocking work. Record R4
   closure only after these decisions and actual release-state reconciliation.
   Public publication remains a separate owner action.
