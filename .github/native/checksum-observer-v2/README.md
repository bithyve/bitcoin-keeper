# Checksum observer v2: source and fixture handover

This diagnostic-only Python processor and Ruby comparison adapter preserve original
comparison failures, stop after equality, and export bounded fixed-schema records.
The v2 change streams approved tool hashes in chunks up to 64 KiB with separate
64 MiB per-tool and 256 MiB aggregate limits. Podspec/input limits remain 1 MiB
per file and 16 MiB aggregate. The implementation bytes are preserved unchanged.

This directory contains source, tests, committed-source input fixtures and provenance.
It contains no diagnostic captures, runtime policies, raw logs, private reports,
installed tools, dependency archives or credentials. It adds no workflow or run hook.
`baseline-lock.json` is a JSON representation of the committed lock identified in
`PROVENANCE.json`; `pod-allowlist.json` binds its 142 root checksums. These are fixed
source inputs, not newly resolved locks. The four sample podspec JSON files retain
upstream attribution and reproduce the empty-container serialization difference.

From this directory, run the Python fixture suite with:

```sh
python3 -B -m unittest -v test_observer test_independent test_tool_reader test_transport
```

The real-executable preflight and Ruby transport cases require an explicit absolute
`KEEPER_FIXTURE_RUBY`; preflight also requires `KEEPER_FIXTURE_RUBY_SHA256` from an
independently verified toolchain record. Without these inputs, corresponding cases
are skipped and must be reported as such. The unprovisioned-runtime case deliberately
starts a plain Ruby process without activating CocoaPods; it must remain incomplete.

With an existing Ruby and Minitest installation, run `test_capture.rb`. To run
`test_cocoapods_method.rb`, also set `KEEPER_COCOAPODS_INSTALLER_SOURCE` to the absolute
path of CocoaPods 1.16.2's `lib/cocoapods/installer.rb`. Its whole-file SHA256 remains
pinned in the test. The three cases execute only the unchanged comparison method
with synthetic collaborators; they do not establish full CocoaPods integration.
No test installs dependencies or loads an app Podfile.

All output remains `NOT_ACCEPTED`. Fixture success does not establish app/native
validation, cache completeness, effective offline containment, compatible dependency
selection or release readiness. Any real diagnostic run still requires separately
approved exact source, harness, toolchain/cache identities, containment and final
integrity checks. Existing trust, failure and hardware gates remain in force.

`PROVENANCE.json` records original source hashes and the limited test portability
edits. `SHA256SUMS` seals this handover's files. Originals are preserved separately.
