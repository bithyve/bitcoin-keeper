# Hermes checksum mismatch: exact source-only reproduction

The sole observed mismatch is explained by the diagnostic app checkout's extra
`app` path component. A source-derived model reproduces both exact SHA1 values:

- Workspace-root compiler path: 30215ceafa12cccff41931253d1d52e5cbe9fd4a
- Same path with `/app` before node_modules: fc261b849ebacce25435593cde583acd48039bd0

The only JSON value changed is user_target_xcconfig.HERMES_CLI_PATH. Everything
else, including Hermes0.14.1, Pre-built subspec, Maven source URL and script phase,
is byte-for-byte identical after serialization. The fixture is a reconstruction
from source, NOT a captured podspec or a claim of Ruby/CocoaPods execution.
The full complete hosted capture remains in /workspace/keeper-run-39153551615-evidence.json.

## Provenance and mechanism

The canonical react-native0.83.9 package was fetched read-only from its yarn.lock
URL and verified against BOTH committed SHA1 and SHA512 integrity values. No
package scripts or installer ran. Source/extraction manifest is retained at
/workspace/keeper-hermes-source/provenance.json.

Archive SHA1: 61d2a4ccd89e06b98992c9b9781856ad88a09d39
Hermes podspec SHA256: 88786170d9f96fdba0ab90476e9a5aff6e1c9f48b4ad7b084e7ee0605e3e0e33
Hermes utils SHA256: af05ec2bbfb353228028ba78e9a4bea12a27b28592bd2e860ae4d361fa91ff9f
Version properties SHA256: 85e06b20b7c549f15b45166910510d8b973956a70175570589e55b3a3d3a6116

React Native's Hermes podspec resolves hermes-compiler with Node and embeds its
absolute installation directory in HERMES_CLI_PATH for the nonlocal prebuilt case.
CocoaPods serializes the evaluated external podspec into the sandbox; its checksum
is a SHA1 of the resulting specification file. This makes the checksum sensitive
to checkout location. See pinned upstream source:
- https://github.com/facebook/react-native/blob/v0.83.9/packages/react-native/sdks/hermes-engine/hermes-engine.podspec
- https://github.com/facebook/react-native/blob/v0.83.9/packages/react-native/sdks/hermes-engine/hermes-utils.rb
- https://github.com/CocoaPods/CocoaPods/blob/1.16.2/lib/cocoapods/sandbox.rb
- https://github.com/CocoaPods/Core/blob/1.16.2/lib/cocoapods-core/specification.rb
- https://github.com/CocoaPods/Core/blob/1.16.2/lib/cocoapods-core/specification/json.rb

Pinned baseline producer d865ca9c4f91532a1524443cc6da42d8d7b07e1a was fetched
read-only. Its Podfile.lock is byte-identical to app source
bccb63348754e7a7975ea140717d31be214f0801. Its hosted workflow uses default
workspace-root checkout (no path option), standard macos-15 and Xcode16.4. The
later diagnostic uses path:app. Both use the same repository workspace name.
The historical producer workflow was inspected as provenance only, not executed.

Committed react-native+0.83.9.patch modifies three Objective-C mounting/view files;
it does not touch the Hermes podspec, utilities or compiler. The Podfile selects
Hermes through use_react_native!/setup_hermes!. The inspected RN setup/codegen
inputs generate separate ReactCodegen/provider pods, not the modeled Hermes
compiler-path field. The Hermes script phase embeds version0.14.1 and build-time
variables; its bytes are identical in both matching models and are not executed
by this diagnosis. Current hosted root runtime verified JSON2.7.1, CocoaPods1.16.2
and xcodeproj1.27.0 before deployment.

Other possible podspec inputs were inspected: Hermes V1 selection, compiler
resolution/hoisting, local tarball or source directory, explicit commit/source-build
flags, Maven mirror and release/nightly availability. None is needed to reproduce
the observed pair: the default release model with the same hoisted compiler does
so exactly. Nested compiler variants produce neither observed hash. The model has
no empty arrays/hashes, so the previously explored JSON empty-container whitespace
difference is not responsible for this pair. This is a path-valued metadata change,
not evidence of different dependency versions or source declarations.

No Hermes binary archive was fetched or attested here. Identical declarations do
not establish binary payload integrity; that is separate from explaining these
specification checksums. No private producer machine path was guessed or accessed.

## Minimal source-only remedy

Check the app out at workspace root, matching the baseline producer. Immediately
after all three pinned checkouts, move harness/review directories together under a
new RUNNER_TEMP/keeper-native-inputs directory. Refuse to overwrite an existing
destination. Run the reviewed scripts from there, with workspace root as cwd.
verify.roots reflects those exact locations; all source/parent/tree/runtime hashes,
clean-tree checks, command restrictions, deployment/final guards and failure paths
remain intact. Reseal the verifier source map. No checksum override, podspec patch,
lock write, symlink alias, dependency change or relaxation of app cleanliness.

81 diagnostic/runtime/provenance tests pass, including exact pair reproduction,
no-empty-container check, actual workflow move command, clean app checkout and
refusal to overwrite existing runner inputs. Shallow-checkout staging fixture
passes with mocked API transport; simulated quota denial still stops after one
request. No app install, build, native process, hosted run, push or PR performed.
Local packaging uses fresh branch codex/native-workspace-literal-once-bccb6334
and sole parent3535a34109c10b7baba310a41d4a277da359c064. No publication or
execution is authorized in this packaging turn.

The JSON fixture's upstream specification strings and scripts derive from Meta's
MIT-licensed react-native0.83.9 package; local modeling code is a test aid only.


Independent layout review found no blocking issues. The pinned checkout action's
getSource finally removes auth when persist-credentials:false; cleanup returns
when the original .git/config is absent, otherwise removes auth/config only. It
does not delete working trees, so it cannot remove moved harness/review inputs.
Source: https://github.com/actions/checkout/blob/d23441a48e516b6c34aea4fa41551a30e30af803/src/git-source-provider.ts
The app checkout runs first; no later root checkout can clobber the nested inputs.
A regression checks the exact app tree has no harness/review path collision. No
safe.directory wildcard, credential persistence or repository trust expansion.
