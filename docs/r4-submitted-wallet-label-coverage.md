# Submitted R4: additive wallet and label caller proofs

Baseline is exactly submitted R4 source
`1d8a86a7462d935cbd0e28b857934b5718c152fc` (PR #7045).
This candidate adds only two test files and this coverage map. It imports no R5
runtime, native, dependency, configuration or fixture changes. It does not alter
or rebuild the existing signed iOS620/Android627 artifacts.

The earlier app #7150/control #190 candidate was based on #7091 b572, which
inherits the combined R5 candidate #7082. That separate run is preserved only
for its actual source and supplies no submitted-R4 acceptance. Existing 32
queue/bootstrap ports on that source likewise require independent exact-R4
validation before their evidence can transfer.

## Original obligations retained (20)

- Wallet/vault callers (11): atomic two-wallet commit before HTTP; second insert
  rollback; rename conflict preserves local success/pending backup; Hide/readback
  gates Delete; lost Hide ACK keeps local state and withholds Delete without
  replay; stale factory A-to-B-to-A; stale encrypted presentation; vault Hide and
  Delete; shared signer registrations/private material; archive-before-new-vault
  migration success; partial migration conflict with own-ACK/no-peer-rebase.
- Label/send/coin-choice callers (9): add/import/edit readback; grouped transaction
  note/change/inherited labels; invalid second import rollback; persisted manual
  coin choice; actual409, actual404, malformed ACK and lost-reply uncertainty
  (four cases); stale A-to-B-to-A worker cannot modify the returning account.

Actual production workers, explicit opt-in, native encrypted Realm, production
backup authority/crypto, signed HTTP, original revision/generation/authEpoch,
complete readback and current transactional Relay remain real. Only the existing
unspendable public factory/descriptor adapters and bounded real-failure/reply
scheduling boundaries are used. No successful backup/DB result is fabricated.

Selected wallet/UTXO workers, ManageWallets gate and both fixture files are
byte-identical between submitted1d8 and the earlier b572 source. Their called
APIs are checked against the submitted source. Any genuine R4 failure remains a
failure; this test package does not backport a product correction.

## Execution boundary and remaining coverage

Syntax/source compatibility review precedes any genuine execution. Current Relay
is fixed at `29597b27eeeb299205bf7d0555db0a90c38cc4be`. A private CI-only admission
preload follows the existing reviewed submitted-R4 #161 approach; the historical
public app proof runner/pins and all private source boundaries stay unchanged.

Until an actual exact-source receipt exists, none of these20 cases is passed.
A later20/20 would verify these20 obligations only on the test-only descendant
of submitted1d8. It would not change signed artifact bytes or establish native,
physical, store or complete295-case parity. The original2 PASS/293 FAIL public
lane stays unchanged. The other275 original obligations still need exact-R4
mapping/validation; R5-derived receipts are not subtracted.

Production Relay14-request acceptance, submitted-R443+3 proof and R5 43+1+3
proof stay separate and are not repeated for this batch. #155 stays unapplied
while legacy writers are fenced. Sonar connectivity and current store/artifact
access remain separate blockers. No production, index, merge, deployment,
signing, store/publication or personal Mac action is included.
