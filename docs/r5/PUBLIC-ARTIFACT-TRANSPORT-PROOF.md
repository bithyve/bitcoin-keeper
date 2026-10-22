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
failure. Full reviewed adapter-fix ancestry is required before freezing this
probe. The actual hosted capability remains **NOT RUN** until separately approved.
