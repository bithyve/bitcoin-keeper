# Fixed artifact transport capability

This source package prepares one read-only hosted call using the production
`readPublicArtifactBytes` adapter and the actual pinned `github-script` v8 client.
Only an approved push of the isolated branch starts it, with contents/actions
read permissions. It creates no native runner, build, dependency installation,
cache, protected environment or release operation. Original contents stay in
memory; they are never extracted, retained or logged.

The sole target is diagnostic iOS artifact `12462694619` from run `39858617273`,
attempt 1, app `1bc34890cb8618b2fffd446a63924974e0fe15b5`, reusable control
`3c44ab6412a8118b183273c402dd08136db05b28`. The archive is 6884 bytes,
SHA256 `550142809a0faf812741a586630b17d6f458b2b6c935b5bab4b00f84da67c84f`.
Its sole `ios/metadata.json` member is 29150 bytes, SHA256
`202ff3e86b6697e30f02d233453365ffca4ee809fae5491f36d79f7ef28866e4`.
The fixed workflow ID 392538840 and artifact head branch were confirmed against
saved [run](https://api.github.com/repos/KeeperCommunity/bitcoin-keeper/actions/runs/39858617273)
and [artifact](https://api.github.com/repos/KeeperCommunity/bitcoin-keeper/actions/artifacts/12462694619)
API snapshots, independently of test models.

The script checks fixed API identities before and after download, bounded manual
redirect/stream handling, original byte digests, the frozen ZIP reader and strict
JSON parser. Every tracked file's raw Git blob, literal path and owner executable
bit is checked before imports/API and again after download. An inline bootstrap
checks the probe script itself before loading it. Successful format transport
preserves the original smoke **FAIL** and native probe **NOT RUN**; every native,
installed-trust, readiness and authorization flag remains false.

Local source controls use mocked API/HTTP and the authorized saved archive via
test-only `R5_ARTIFACT_FIXTURE`. They do not prove the actual hosted SDK transport.
The earlier pinned SDK source finding (ignored `request.redirect`) is not a host
failure. This probe contains the full reviewed adapter-fix ancestry
`a23992f1604e47bd68e898cb696e51ef3814d4eb`; its mock deliberately ignores
`request.redirect`, honors `request.fetch` and prevents SDK body parsing.
The actual hosted capability remains **NOT RUN** until separately approved.
