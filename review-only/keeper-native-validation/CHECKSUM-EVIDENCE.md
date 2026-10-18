# Source-only deployment checksum evidence candidate

Based on published 7d94dc024bcd033c55e476e8875da30e92572dc5. Packaging changes only the exact branch name in both workflows, verifier and
branch test, plus the verifier source digest. No runtime patch, app source,
dependency lock, source pin or acceptance gate changes. Proposed fresh branch:
codex/native-checksum-diff-once-bccb6334. Sole parent remains
3535a34109c10b7baba310a41d4a277da359c064. No execution/publication authorized.

## Feasibility and source evidence

CocoaPods 1.16.2 `Installer#verify_no_lockfile_changes!` generates the candidate
lockfile, calls Xcodeproj::Differ.hash_diff with Old Lockfile / New Lockfile keys,
formats the difference with YAMLHelper.convert_hash, and raises Informative. This
happens in resolve_dependencies, before download_dependencies and write_lockfiles.
The deployment error therefore already contains the changed root checksum pairs.

Primary sources inspected:
- https://github.com/CocoaPods/CocoaPods/blob/1.16.2/lib/cocoapods/installer.rb
- https://github.com/CocoaPods/Xcodeproj/blob/1.27.0/lib/xcodeproj/differ.rb
- https://github.com/CocoaPods/Core/blob/1.16.2/lib/cocoapods-core/yaml_helper.rb
- https://github.com/CocoaPods/CocoaPods/blob/1.16.2/lib/cocoapods/command.rb
- https://github.com/CocoaPods/CocoaPods/blob/1.16.2/lib/cocoapods/user_interface.rb

Differ represents differing scalar checksums as Old/New pairs. YAMLHelper indents
nested hashes by two spaces, sorts nested keys (New before Old), and can quote
numeric-looking checksum strings. Command.run prints queued warnings afterward;
UI.print_warnings separates these with a blank line and top-level [!] marker.

## Minimal implementation

`checksum_diff.py` parses only that error's SPEC CHECKSUMS subsection from the
existing private merged command log. No Ruby hook, monkeypatch, YAML loader,
podspec reads, checksum recomputation, new process, dependency or network call.

`pod-allowlist.json` is byte-for-byte copied from observer handover
99b1df565a8d318f0c32f7f52cf677f702d3cbcf, path
.github/native/checksum-observer-v2/pod-allowlist.json. SHA256:
028a68bee6cf3354e9e942def5e3d7f1163527cade48b9e41630429bbc7b2099.
The parser pins these exact bytes. A regression test independently checks every
name/old checksum and the lockfile SHA256 against source bccb63348754e7a7975ea140717d31be214f0801.
Only this immutable data and the allowlist/old-value validation idea are reused.
The observer's runtime capture, tool reader, checksum/serialization experiment,
transport, containment and acceptance mechanisms are not incorporated or altered.
Nothing here establishes acceptance of that separate offline experiment.

The existing diagnostic command selector, bounded private-file reader, command
exit code, raised harness exception, final guard and failure result are preserved.
One reader correction avoids inserting an artificial newline at 64 KiB into a
complete log; truncated reads still use a separator and cannot export pairs.

The summary adds fixed checksum status/count fields. Only a completely recognized
checksum subsection exports rows, in KEEPER_CHECKSUM_DIFF JSON records of up to
20 roots: at most 8 records, each below the existing 8192-byte limit. All 142 roots
fit below 32 KiB aggregate payload. Every record remains NOT_ACCEPTED. Exported
variable data is restricted to exact allowlisted root names, committed old SHA-1s,
and strict 40-character lowercase hexadecimal new SHA-1s. Other text stays private.
Unknown roots, additions/removals, malformed/duplicate/incomplete/identical pairs,
baseline mismatches, changed allowlist bytes and logs exceeding the existing
128 KiB window produce no checksum rows. No partial list is labeled complete.
Completeness describes this checksum subsection only, not the whole lockfile.

## Validation and limits

`python3 -B -m unittest discover -s review-only/keeper-native-validation -p 'test_*.py'`
passes 77 tests, including 13 new source-derived fixture/integration cases.
`git diff --check` passes. Tests invoke no installer, network or native build.
The integration fixture preserves Podfile.lock bytes and failed exit status while
running both expected guards and emitting all 142 synthetic changed pairs.

Actual CocoaPods/Ruby execution is not performed in this environment. Fixtures
are based on inspected upstream source, not a claimed real deployment capture.
Supported complete logs can retain the full useful checksum diff within these
privacy bounds; larger, unknown or malformed captures remain explicitly closed.
No checksum cause (including serialization) is inferred. The prior run's exported
summary lacks pairs; this patch cannot recover private logs from the finished job.
A separately authorized future hosted capture would be needed for actual values.
No push, PR, dispatch, rerun, setting change, paid resource or lock repair performed.

Independent formatter review found and resolved a malformed boundary issue: only
PODFILE CHECKSUM and COCOAPODS may follow SPEC CHECKSUMS. Earlier reordered
sections now fail closed. All unsuccessful extraction/serialization summaries
explicitly report complete:false. Review found no remaining blocking findings.
Five unchanged materialized patched-harness tests also pass.
