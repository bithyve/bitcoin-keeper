# R4 signed-v3 wallet and label caller coverage

This additive package preserves all 11 wallet/vault and nine label/send/coin-choice
obligations from the original public-v2 caller suites. It is based on public
candidate b572b28c9cec09e47e1b9cb3b62a51369dd74c51 (PR #7091), not the submitted
R4 artifact. Runtime, dependencies, original runners, fixture guards and the old
295-case lane are unchanged. No native or submitted-artifact pass transfers.

## Exact obligation mapping

| Original suite | Obligations retained in the new protected proof |
| --- | --- |
| automaticWalletProducer (11) | Atomic two-wallet creation before transport; second-insert rollback/no HTTP; local rename preserved through real CAS conflict; Hide/readback gates Delete; lost Hide ACK preserves local state/withholds Delete/no replay; stale factory A→B→A rejection; stale encrypted presentation rejection; vault Hide/Delete advances remote proof; shared signer registration/private-material preservation; migration archive-before-create success; migration partial conflict preserves local commits and backup-pending state |
| automaticLabelProducers (9) | Add/import/edit committed labels and full readback; grouped send/change/inherited labels; invalid second import rolls back; persisted manual coin choice; send-label uncertainty after actual 409, 404, malformed ACK and lost reply (four cases); stale A→B→A worker cannot modify the returning account |

The new proofs use actual production workers and explicit production opt-in,
encrypted native Realm, isolated production backup authority/crypto, signed HTTP,
original revision/generation/authEpoch tuples, complete decrypted readback and the
current transactional Relay fixture. Factory/descriptor adapters supply public,
intentionally unspendable fixtures. No successful database/network result is
fabricated. Conflicts use genuine competing signed CAS; disappearance uses only
owned disposable namespace state; ACK faults corrupt or withhold real replies.
This is host integration, not rendered UI, MMKV, physical phones, live providers,
transaction broadcast or release acceptance.

## Verification and review

Syntax and whitespace checks passed before publication. Independent source review
preserved all 20 original obligations. Initial wallet review found two observers
still attached to legacy Relay methods; they were corrected to observe/delegate
the actual protectedBackupMutation boundary. Fanout additionally verifies it uses
only its own preceding ACK revision and never borrows a competing commit.

Genuine execution is pending at this source checkpoint; the PR/control-run receipt
must record actual test counts, exact public app/backend/control SHAs and all
prerequisite/source/cleanup outcomes. Source review is not an execution pass.
The owned backend is pinned at 29597b27eeeb299205bf7d0555db0a90c38cc4be.

## Remaining coverage and existing evidence

The old public result remains 2 PASS / 293 FAIL. PR #7091/#163 supplies 32 earlier
queue/bootstrap ports, leaving 263 original obligations before this package has
actual passing evidence. A genuine 20/20 result would reduce the unmapped/unported
remaining obligations to 243: 213 core + nine signer + 11 USDT + nine upgrade + one
complete retained-copy recovery corpus. It would not establish replacement
295-case parity or change the public CI lane without reviewed migration.

Do not rerun/relabel the accepted R5 43+1+3 pair or submitted R4 43+3 pair merely
for this package. Production Relay acceptance in PR #158 comment6321195858 stays
separate. Duplicate guard #155 remains unapplied while legacy writers are fenced.
No merge, production access/mutation, deployment, signing, store action or personal
Mac work is part of this coverage package.
