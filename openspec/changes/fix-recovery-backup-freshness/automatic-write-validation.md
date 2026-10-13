# R4 automatic Assisted Backup: result matrix

This is the required proof matrix, reconciled 13 October 2026. **No implementation or test pass is asserted by these placeholders.** The coordinator replaces a result only with observed exact-source evidence. Historical September repair/native logs are preserved in [validation.md](validation.md) and do not complete this matrix.

Automatic-backup implementation and disposable proof are mandatory R4 work. Critical native IOS and ANDROID backup acceptance also precedes release. Explicitly physical-device-only follow-up may be separate; it cannot waive the required fixtures or critical simulator/emulator checks.

## Source and result record

| Field | Current record |
| --- | --- |
| Audit starting app source | b160656218dc6065ad12af9db220c974255bfc23; not final proof source |
| Final tested app commit / working-tree state | NOT RECORDED |
| Final tested Relay commit / working-tree state | NOT RECORDED |
| Fixture command, UTC time, runtime and platform | NOT RUN / awaiting coordinator evidence |
| Disposable Realm dataset and Mongo replica-set topology | NOT RECORDED |
| HTTP entry points and production saga/hook/transport coverage | NOT RECORDED |
| Test counts and individual result artifact | NOT RECORDED |
| Clean encrypted Recovery Key restore result | NOT RUN |
| IOS exact-source native result | NOT RUN |
| ANDROID exact-source native result | NOT RUN |
| Independent developer review / current-head CI | NOT RECORDED |
| Production running artifact / topology / authorization | NOT VERIFIED; no production action authorized by this matrix |

Use PASS, FAIL, BLOCKED or NOT RUN per scenario, with command/log/provenance. A blocked/missing critical result keeps the gate open. A count from unit tests alone must not be described as real Realm/HTTP/native evidence. Preserve hashes/source/run IDs and sanitized counts; never record real account/wallet identifiers, seed/Recovery Key material, plaintext backups, production configuration or credentials.

## Common cases required for every operation

| Case | Required assertion |
| --- | --- |
| C1 committed match | Real local commit precedes cloud send; operation ID, originating account/session, generation, decrypted payload/target and original verified base are valid. Exactly one intended v2 effect reaches the production transport/HTTP path. Local results survive cloud failure. |
| C2 uncommitted/stale state | Failed/partial local commit, stale generation/payload, wrong encryption owner or missing operation proof sends no mutation. No pre-persistence upload or newly verified base is substituted. |
| C3 account session | A→B→A before send performs no old-session mutation; change after send remains uncertain/pending for A without using B's key/data or changing B's status. |
| C4 remote conflicts | Apply the proposed effect against the validated remote snapshot; remote-only records and immutable identity conflicts are preserved without automatic overwrite/deletion. |
| C5 consent | Disabled/unconsented accounts send zero automatic mutations. The separately explicit whole-backup opt-out preserves its consent choice until positive acknowledgement. |
| C6 competing writer | A real revision race/409 stops the chain and leaves pending; no refreshed base authorizes an old payload. |
| C7 old/malformed protocol | 404/unsupported v2, malformed snapshot or acknowledgement, false/missing preconditionApplied, and invalid/missing newRevision fail closed with no legacy fallback. |
| C8 timeout/lost acknowledgement | Read back uncertain server state before fresh work; do not replay ciphertext or send later fanout members. Matching content alone does not complete the interrupted originating operation. |
| C9 complete readback | Final decrypted server image includes all recovery records/references and matches freshly captured local state at the same committed generation/session. Corruption, partial response or missing references cannot produce verified. |
| C10 final commit race/restart | Inject a local mutation immediately before Redux verification commit: pending persists and verified is rejected. Restart keeps committed local data and pending state; it does not replay prepared payloads. |

## Seven-operation matrix

Every row must cover C1–C10 with real encryption/decryption and production producer/transport entry points against disposable committed Realm and transactional Relay fixtures. Whole-backup deletion is the explicit opt-out exception to payload-equals-retained-local-image, not an automatic wipe operation.

USDT fixtures use existing/recovered wallet records and their supported metadata/deletion paths. They do not enable the paused new-wallet setup/import or GasFree/transactional product flows.

| Operation | Operation-specific proof / target | C1–C5 result + evidence | C6–C10 result + evidence |
| --- | --- | --- | --- |
| updateAppImage | Wallet/USDT/signer ciphertext and exact IDs match committed sanitized records; replaceNodes equals normalized current nodes; app/version metadata belongs to current KeeperApp. Cover creation, edit, nodes and version producers. | NOT RUN | NOT RUN |
| migrateXfps | Old exact KeyUID absent locally; new exact KeyUID/signer matches committed Realm; expected old remote map exists; retained vault signer references remain valid. | NOT RUN | NOT RUN |
| deleteAppImageEntity | Each BTC/USDT/signer ID absent after successful local commit and present in expected remote image; retained vaults stay recoverable. Cover direct USDT hook and saga paths. | NOT RUN | NOT RUN |
| deleteVaults | Exact committed local absence; shared/participant references remain owned and recoverable; server-only vaults are preserved. | NOT RUN | NOT RUN |
| updateVaultImage | Vault ID, policy, sanitized signer records, archive state and signersData match committed Vault and persisted registrations. Cover creation/edit and migration/registration producers. | NOT RUN | NOT RUN |
| modifyLabels | Added ciphertext matches current tag and account-derived hashed ID; deleted hashed IDs correspond to committed absence; add/delete overlap and delayed import callbacks are reconciled. | NOT RUN | NOT RUN |
| deleteBackup | Explicit same-account/session opt-out; fresh validated remote revision and exact whole-account target; local recovery data retained and consent unchanged until positive acknowledgement. Lost response does not imply deletion success. | NOT RUN | NOT RUN |

## Logical fanout and producer proof

| Scenario | Required assertion | Result + evidence |
| --- | --- | --- |
| New vault plus archived predecessor | Local logical commit completes before cloud effects. One transaction or acknowledged revision chain includes both; final full readback/restore retains active and archived continuity. | NOT RUN |
| Registration shared by several vaults | Committed registration propagates to every affected vault and complete readback includes it. No intermediate response marks the whole backup verified. | NOT RUN |
| Label import plus deletion | Local tags commit first; exact hashed IDs/ciphertext and overlap reconciliation are proved. Remote-only content survives. | NOT RUN |
| First fanout member succeeds, next fails | Remaining prepared members never run; no rollback/success fiction; local data survives and pending persists until reconciliation. Exercise 409, malformed acknowledgement and lost response. | NOT RUN |
| Interleaved local mutation between fanout members | Revalidate proof and committed generation before each send; reject stale effects, stop the chain and keep pending. | NOT RUN |
| Queued action receives newer verification | It cannot borrow the new baseline/epoch or operation-generation proof to authorize old ciphertext. | NOT RUN |
| Pre-persistence producers | Wallet/signer/vault creation and BTC/USDT/signer/vault deletion use local-first completion; cloud failure preserves truthful local result and pending backup. | NOT RUN |
| Disabled/new unconsented account | Local create/edit/delete works; zero automatic writes and no inherited consent. | NOT RUN |
| Complete encrypted restore | A clean disposable Recovery Key restore includes intended BTC MAINNET/TESTNET wallets, USDT recovery metadata, keys, active/archived vaults, registrations, labels and nodes with exact recoverable identities. No partial/empty success. | NOT RUN |
| Transactional HTTP/old writers | Real replica-set CAS race, rollback, malformed/unsupported HTTP, old/full-writer fencing and running source parity are tested. This is not production topology/deployment proof. | NOT RUN |

## Mandatory critical native acceptance

Both platforms must test the final source with disposable accounts/data and a compatible fixture backend. Do not replace the owner's installed app or mutate real wallets for this matrix. Use native build/launch plus simulator/emulator flows; unit mocks and a historical simulator compile do not substitute for launch/flow evidence.

| Native scenario | IOS result + evidence | ANDROID result + evidence |
| --- | --- | --- |
| Build and launch exact source; identify native package/version and backend source | NOT RUN | NOT RUN |
| Opted-in automatic create/edit/delete after initial backup; local data survives forced cloud failure and relaunch | NOT RUN | NOT RUN |
| Complete server readback and clean Recovery Key restore of newly produced committed dataset | NOT RUN | NOT RUN |
| Legacy encrypted snapshot upgrade plus absent/stale/transport/server/decryption failure; no false missing/empty/verified or unsolicited replacement | NOT RUN | NOT RUN |
| Account/consent switch including A→B→A while connectivity/queue/readback waits; no cross-account upload, key selection, persistence or status change | NOT RUN | NOT RUN |
| Local mutation during upload/readback/final completion; truthful pending and no stale verified | NOT RUN | NOT RUN |
| Interrupted/uncertain write, relaunch and manual read-only reconciliation; no ciphertext replay or spinner trap | NOT RUN | NOT RUN |
| Interrupted clean recovery preserves truthful incomplete result; correct Recovery Key retries unavailable/corrupt backup without incorrect-words/empty-success feedback | NOT RUN | NOT RUN |
| Registration-only repair and immutable key/policy conflict, with all affected vaults included in verified readback | NOT RUN | NOT RUN |

Native performance/layout and hardware/physical-only results remain separately described in [nfr-review.md](nfr-review.md) and the final Local handoff. Any accepted physical-only follow-up must name the exact unperformed scenario and its authority; it must not relabel required critical native safety checks as optional. Store/signing/deployment/merge approval remains separate from test results.

## Durable evidence link plan

1. Freeze exact app and Relay source plus fixture/runtime provenance. Record working-tree changes instead of implying committed clean source.
2. Save a sanitized per-scenario result artifact under this change's evidence directory using final source/run identity; link it from the relevant rows. Include actual command, UTC execution time, outcome/count and negative-case assertions. Preserve existing historical logs unchanged.
3. Attach the complete disposable Realm/HTTP/restore report and CI run references to the existing PR. Unit-only and native results receive separate labels.
4. After the final Cloud push, add the AGENTS.md Codex local handoff with the actual current SHA and IOS, ANDROID (plus relevant HARDWARE) checks. Link exact-head Local validation for each native row; new code commits invalidate earlier signoff.
5. Only observed evidence closes a task. Keep production/operator and release blockers visible even after all source/fixture/native rows pass. This document does not send messages, edit trackers, push code or authorize release operations.
