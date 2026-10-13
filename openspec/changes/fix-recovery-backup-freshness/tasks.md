# R4 automatic Assisted Backup tasks

Reconciled 13 October 2026 at audit starting app source b160656218dc6065ad12af9db220c974255bfc23. The earlier checked checklist described a September candidate, including pre-persistence writes; it did not prove today's automatic-write contract. Historical results remain in [validation](validation.md) and unchanged evidence files. Check a current task only after exact-source implementation/proof is linked in [automatic-write-validation](automatic-write-validation.md).

## Local-first implementation

- [ ] Give each logical recovery operation an originating account/session, operation ID and monotonic generation captured after all related local writes commit.
- [ ] Reorder wallet/signer/vault creation, edits and deletions so local persistence precedes cloud effects; cloud failure preserves local results and durable pending state.
- [ ] Prove all seven operation payloads/deletion targets against fresh committed Realm data at queue head with real decrypt/identity validation.
- [ ] Reject stale generation, failed/partial commit, wrong owner/key/consent and A→B→A without network or later substitution of a newer verified base.
- [ ] Cover account-bound node/version writes, exact-KeyUID migration, USDT direct deletion, delayed import callbacks and shared registration propagation.
- [ ] Handle explicit whole-backup opt-out separately; retain consent until positive revisioned acknowledgement and reconcile lost responses.

## Server sequencing and verification

- [ ] Validate v2 snapshot/capabilities and preserve remote-only/conflicting recovery content before automatic send.
- [ ] Enforce atomic expectedRevision with positive precondition acknowledgement and valid newRevision; prohibit legacy fallback.
- [ ] Use one atomic fanout transaction or a serialized acknowledged revision chain, revalidating local proof for each member.
- [ ] Stop fanout on 409/404/protocol/network/timeout/lost response; do not replay prepared ciphertext or claim intermediate success.
- [ ] Complete and decrypt server readback, then compare fresh local data at the same committed generation and account/session.
- [ ] Make the final Redux verified transition reject a local mutation injected immediately before completion; preserve pending across interruption/restart.

## Mandatory R4 disposable proof

- [ ] Exercise each of seven production saga/hook/transport operation entry points with real encryption and disposable Realm + transactional Relay fixtures.
- [ ] Record valid committed write once, stale data/commit rejection, A→B→A, remote-only/conflicting snapshot, 409/old-route 404/malformed acknowledgement, timeout/lost response and complete readback outcomes per operation.
- [ ] Prove vault creation+archive, multi-vault registration and label add/delete fanouts, including successful first member then failure and no later prepared send.
- [ ] Prove disabled/unconsented accounts send zero writes and successful local create/edit/delete survives cloud failure.
- [ ] Prove clean Recovery Key restoration from the newly produced backup, validating all intended records and key/policy/registration identity.
- [ ] Run revisioned Relay HTTP/transaction tests against a disposable replica set, including old-writer fences and competing writers at exact source.
- [ ] Link exact app/backend SHA, commands, fixture provenance, pass/fail/blocked counts and redacted artifacts in the current matrix; prior logs are not replacements.

## Mandatory critical native backup acceptance

- [ ] IOS: exact-source native build/launch; opted-in automatic create/edit/delete, relaunch persistence, check/readback and clean disposable Recovery Key restore.
- [ ] ANDROID: the same exact-source create/edit/delete, relaunch, readback and clean restore checks.
- [ ] Both platforms: legacy snapshot upgrade, failed/stale/absent check truthfulness, account/consent switching and A→B→A, interrupted/uncertain write/retry, no false verified/empty restore or automatic replacement.
- [ ] Both platforms: local mutation during pending upload/final readback remains pending; interrupted recovery never claims complete; record platform-specific outcomes rather than assuming parity.
- [ ] Record physical-device-only follow-up separately when unavailable; do not use it to defer required fixtures or critical simulator/emulator checks.

## Remaining delivery and NFR gates

- [ ] Independent final-source developer review and current-head CI, with inherited lint/type failures disclosed.
- [ ] Native small-width/enlarged-text, large/single-record frame time, memory, throughput and slow/background cases; distinguish mandatory critical safety failures from explicitly accepted physical-only follow-up.
- [ ] Verify deployed request limits and transaction topology, compatible running Relay artifact and old-writer drain/rollout under existing operator authorization.
- [ ] Refresh store histories/counters and source/artifact manifest; obtain intended merge/signing/submission/deployment/release approval separately.

Documentation reconciliation does not complete any unchecked implementation, fixture, native or production task. Reproducibility, Bitkey/Recoverable Wallet and unrelated R4 code stay independent.
