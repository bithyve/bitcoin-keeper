# Preview Mobile Key native core checks

Run on Linux with Java 17+, Bash, `curl`, `unzip`, and `sha256sum`:

```sh
bash tests/native/preview-mobile-key/run.sh
```

The harness compiles the app's actual `KeeperPreviewMobileKeyStore.kt` using
Kotlin 2.0.21. It executes 21 checks against real JVM AES-GCM, temporary files,
and the production monitor/file lock. Coverage includes every record-byte
mutation, wrong key/app authenticated data, seed/record length boundaries,
bounded corrupt-file reads, missing/unreadable aliases, `.new`/`.bak` artifacts,
interrupted writes, readback mismatch/failure, clearing the generated seed
buffer, read-existing without creation, and concurrent threads/processes.

For a narrow Android bridge compilation check against actual Android API 36
and React Native 0.83.9 classes:

```sh
bash tests/native/preview-mobile-key/run.sh --android-bridge-typecheck
```

Only generated `BuildConfig` is a fixture in that compilation. This is not an
APK build and does not exercise Gradle flavor configuration or app registration.
The runner pins downloaded archives by SHA256. The compiler and React hashes
match publisher checksum files; the Android archive also matched Google's
repository checksum before its SHA256 was recorded. Tool archives stay in the
temporary tools cache; generated check artifacts and fixture directories are
removed after execution.

These checks use JVM software keys and file adapters. They do not execute
Android Keystore, Android AtomicFile, iOS Keychain/Security, hardware signers,
or a simulator/emulator. The backup-restoration case tests the lifecycle's
response to an adapter-provided record; actual AtomicFile recovery and durability
still require Android validation. Random-source errors are injected; platform
entropy quality and hardware backing are not proved.

The seed still crosses the native bridge as an immutable base64 string for
preview public-key derivation. Buffer clearing is best effort and cannot erase
all framework/JavaScript copies. Readback proves neither restart durability,
device backup/recovery, non-exportable signing, nor wallet readiness. All
platform and physical-device checks remain required before review approval.
