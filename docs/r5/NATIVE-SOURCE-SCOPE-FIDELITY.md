# Native source proof scope fidelity

This narrow reader correction preserves published C2/B1 e502 and D/B2 b11
checkpoints. Their shared `sourceProofs` validator incorrectly required the
protected-tooling scope for all three suites. Real frozen D448 guard return
objects have three distinct scopes:

| Suite | Required exact source scope |
| --- | --- |
| protected | `BOUNDED_PRIVATE_NATIVE_ACCEPTANCE_TOOLING` |
| recovery | `BOUNDED_PRIVATE_FRESH_RECOVERY_TOOLING` |
| account | `BOUNDED_PRIVATE_NORMAL_ACCOUNT_READ_ISOLATION_TOOLING` |

This was a fail-closed availability defect: actual recovery/account guard
receipts would be rejected. No genuine native execution or acceptance was
established by the old synthetic all-generic fixture. The original producer
execution also rejected recovery before service/native start; its correction
is separately owned and does not rewrite D448 or app S.

The validator now uses a fixed code-owned per-suite map. Shared host fixtures
match these actual return literals. Both unchanged C2 exact10/7 and D exact13/13
profiles reject generic aliases, missing scopes, and cross-suite swaps after
raw hash/barrier rebinding. Source hashes, modes, identities, cleanup and byte
proof requirements are unchanged. No receipt supplies the map.

An author-side private source-contract canary reads the actual returned object
AST from immutable D448 Git blobs for all three guards, records blob/digest
identities and feeds those exact literals into both validator profiles. It
runs no guard, service, database, API or native operation. Public tests remain
synthetic host controls, not actual native/installed/physical results.

All authority/readiness/release flags remain false. Consumers must adopt this
full descendant before reading a corrected execution fork. Neither a failed
check nor an original checkpoint is erased or converted into a pass.
