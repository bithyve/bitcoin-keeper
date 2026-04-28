# React Native 0.81.4 → 0.83.9 Upgrade Plan

**Date drafted:** 28 April 2026  
**Current version:** 0.81.4  
**Target version:** 0.83.9  
**Architecture:** New Architecture + Fabric enabled on both platforms  
**Why 0.83.9:** Last patch of the 0.83.x line; the only release in the 0.82-0.83 range to ship with zero user-facing breaking changes (0.83 blog post explicitly states this). Avoids the Hermes V1 default change (0.84+) and the Jest preset package move (0.85+).

---

## Android Build Status (0.81.4 baseline)

✅ Build: **SUCCESSFUL** (verified 28 April 2026, 2m 39s, 986 tasks)  
⚠️  Launch: CLI launcher sends wrong activity class — pre-existing issue unrelated to upgrade  
→ Fix before starting the upgrade: ensure `MainActivity` is the correct entry name in `android/app/src/main/AndroidManifest.xml` or set `mainActivity` in the CLI launch command.

---

## Pre-Upgrade Checklist (Baseline Gate)

Complete these before changing any version. Do not start Phase 1 until all gates pass.

- [ ] iOS dev build green (`yarn ios --scheme=hexa_keeper_dev`)
- [ ] Android dev build green (`yarn androidDevelopmentDebug`)
- [ ] Android launches without the activity class error
- [ ] Jest run passes (`yarn test`)
- [ ] Manual smoke test: wallet open, receive address, send flow, PSBT signing
- [ ] Commit current state on a dedicated branch: `git checkout -b upgrade/rn-0.83.9`

---

## Phase 0 — Patch Hygiene (DO FIRST)

Three patch files contain only generated Gradle/Android build artifacts (`.class`, `.bin`, `.jar`, manifest XMLs). They will break patch-package on every fresh install and have nothing to do with source compatibility. **Delete them before bumping any version.**

Files to delete:
```
patches/@react-native+gradle-plugin+0.81.4.patch    ← 100% build artifacts, no source changes
patches/react-native-iap+13.0.4.patch               ← mostly build artifacts; the one real src change is RNIapModule.kt import
patches/react-native-document-picker+9.3.1.patch    ← mostly build artifacts; the one real src change is ProcessDataTask.java refactor
```

For `react-native-iap` and `react-native-document-picker`, recreate minimal patches that contain only the source-level changes, not the generated build output:

```bash
# After reinstall, re-apply only the source changes manually, then:
npx patch-package react-native-iap
npx patch-package react-native-document-picker
```

Real patches to **keep as-is**:
| Patch file | What it does | Keep? |
|---|---|---|
| `react-native+0.81.4.patch` | Fabric `RCTComponentViewRegistry.mm` — silences assert on view recycle | Verify in 0.83.9 |
| `react-native-screens+4.24.0.patch` | New Arch iOS property export guards | Verify in new version |
| `realm+12.14.2.patch` | Rewrites JNI CallInvokerHolder unwrap for RN 0.80+ | Keep; critical |
| `react-native-blob-util+0.18.3.patch` | Codegen header import fallback chain for New Arch | Keep |
| `react-native-change-icon+5.0.0.patch` | iOS/Android icon switching fix | Keep |
| `react-native-contacts+7.0.8.patch` | iOS contacts permission fix | Keep |
| `react-native-html-to-pdf+0.12.0.patch` | Android JS-enabled PDF render | Keep |
| `react-native-tcp-socket+5.6.2.patch` | Removes premature socketMap.remove on destroy | Keep |
| `bitcoinjs-lib+6.1.5.patch` | Adds `getDigestToSign`/`addSignedDigest` and Buffer.from fix | Keep (Bitcoin-critical) |
| `react-native-modal+13.0.1.patch` | Check what this contains before keeping |
| `react-native-pdf+6.7.7.patch` | Updates pdfiumandroid and gson versions | Keep |

---

## Phase 1 — Bump React Native Core

### 1.1 Package version changes in `package.json`

**React Native peer requirement for 0.83.9:** `react: ^19.2.0`, `@types/react: ^19.1.1`

```jsonc
// package.json — change these values
"react": "19.2.0",                          // was 19.1.0
"react-native": "0.83.9",                   // was 0.81.4

// devDependencies — all must match RN version
"@react-native/babel-preset": "0.83.9",     // was 0.81.4
"@react-native/metro-config": "0.83.9",     // was 0.81.4
"@react-native/eslint-config": "0.83.9",    // was 0.81.4
"@react-native/typescript-config": "0.83.9",// was 0.81.4
"@react-native-community/cli": "15.1.0",    // stay; compatible with 0.83
"@react-native-community/cli-platform-android": "15.1.0",
"@react-native-community/cli-platform-ios":  "15.1.0",
```

> Do **not** bump `@react-native-community/cli` beyond 15.x yet unless a build error forces it. Version 20.x ships with RN 0.85+.

### 1.2 Reinstall dependencies

```bash
rm -rf node_modules
npm install
# or: yarn install
```

Watch for peer dependency conflicts on `react` version. If any library rejects `19.2.0`, check whether a patch version exists before adding a `resolutions` override.

### 1.3 iOS pods

```bash
cd ios && pod install --repo-update && cd ..
```

The `@react-native+gradle-plugin` patch will no longer be needed after Phase 0 cleanup. If pods fail, try:

```bash
cd ios && pod deintegrate && pod install && cd ..
```

### 1.4 Android codegen cache

```bash
cd android && ./gradlew clean && cd ..
```

Clear Metro cache too:

```bash
npx react-native start --reset-cache
```

---

## Phase 2 — Native Integration File Audit

Use [reactnative.dev/upgrade-helper](https://reactnative.dev/upgrade-helper/?from=0.81.4&to=0.83.9) to diff the template files. Apply **only** the changes that are not already overridden in your files. Do not overwrite your customizations.

### Android files to audit

| File | What to check |
|---|---|
| `android/build.gradle` | Gradle plugin version, Kotlin version if bumped in template |
| `android/app/build.gradle` | `compileSdkVersion`, `targetSdkVersion`, `ndkVersion`, react block options |
| `android/gradle.properties` | `newArchEnabled`, `hermesEnabled` flags |
| `android/gradle/wrapper/gradle-wrapper.properties` | Gradle wrapper version |
| `android/settings.gradle` | New modules or settings plugin changes |

Your current values to preserve:
- `compileSdkVersion = 36`, `targetSdkVersion = 36` ✅
- `kotlin_version = '2.0.21'` ✅
- `com.android.tools.build:gradle:8.8.0` — check if 0.83.9 template bumps this

### iOS files to audit

| File | What to check |
|---|---|
| `ios/Podfile` | `platform :ios` minimum, `prepare_react_native_project!`, `use_react_native!` options |
| `ios/hexa_keeper/AppDelegate.mm` | `RCTAppDelegate` changes if any |

Your Podfile customizations to preserve:
- `ENV['RCT_NEW_ARCH_ENABLED'] = '1'` (line 2)
- `$RNFirebaseAsStaticFramework = true`
- `pod 'libportal-ios'`, `pod 'PDFGenerator'`, `pod 'QRCoder'`
- `FirebaseCoreInternal` and `GoogleUtilities` modular headers
- `fabric_enabled => true`, `new_arch_enabled => true` (lines 44-45)
- Post-install bitcode strip for Hermes framework
- `IPHONEOS_DEPLOYMENT_TARGET = '15.1'` for all targets

---

## Phase 3 — Patch Reconciliation

After a clean install, `patch-package` runs automatically via `postinstall`. It will fail for any patch whose target file has changed in 0.83.9. This is the expected first failure surface.

### 3.1 RN core patch

**File:** `patches/react-native+0.81.4.patch`  
**Touches:** `React/Fabric/Mounting/RCTComponentViewRegistry.mm`  
**Action:** Check if the assert was removed or softened in 0.83.9 before reapplying. Search the 0.83.9 changelog and the file itself. If fixed upstream, delete the patch. If not, rename the patch to `react-native+0.83.9.patch` and reapply.

```bash
grep -n "Attempt to recycle a mounted view" node_modules/react-native/React/Fabric/Mounting/RCTComponentViewRegistry.mm
# If line is gone -> delete patch. If still present -> patch still needed.
```

### 3.2 react-native-screens patch

**File:** `patches/react-native-screens+4.24.0.patch`  
**Touches:** 4 iOS `.mm` files — New Arch export guards  
**Action:** Check latest `react-native-screens` version for 0.83.9 compatibility. If upgrading to a newer version resolves the guards, upgrade the library and discard the patch. If staying on `4.24.0`, rename the patch file.

### 3.3 Realm patch

**File:** `patches/realm+12.14.2.patch`  
**Touches:** `io_realm_react_RealmReactModule.cpp` — JNI `CallInvokerHolder` unwrap  
**Risk level:** HIGH — this is a Bitcoin wallet data store  
**Action:** Check if Realm `12.14.2` already has an upstream fix for 0.83.x, or if `realm@20.x` (latest) resolves it. If upgrading Realm, test heavily — local DB migration must be backward compatible or a migration function must be added.

```bash
npm view realm@">=12.14.2 <=20.0.0" version
# Evaluate if an intermediate version ships the JNI fix upstream
```

### 3.4 react-native-blob-util patch

**File:** `patches/react-native-blob-util+0.18.3.patch`  
**Touches:** iOS codegen header include fallback  
**Action:** Check `react-native-blob-util@0.24.7` (latest) — this version likely ships the fallback upstream. If so, upgrade the library and delete the patch.

---

## Phase 4 — Library Compatibility Upgrades (if required)

Upgrade these libraries only if the clean install or first build fails. Do not upgrade preemptively. Work through failures one library at a time.

### Priority order

| Library | Current | Latest compatible | Upgrade trigger |
|---|---|---|---|
| `react-native-screens` | 4.24.0 | 4.24.0 (stay) | iOS build fails |
| `react-native-gesture-handler` | 2.28.0 | 2.31.1 | Peer dep error |
| `react-native-reanimated` | 3.19.5 | 4.3.0 | Build fails |
| `react-native-safe-area-context` | 5.7.0 | 5.7.0 (stay) | Build fails |
| `react-native-svg` | 15.15.4 | 15.15.4 (stay) | Build fails |
| `react-native-mmkv` | 4.3.0 | 4.3.1 | Peer dep error |
| `react-native-nitro-modules` | ^0.35.4 | 0.35.5 | Build fails |
| `react-native-blob-util` | 0.18.3 | 0.24.7 | Patch fails |
| `react-native-iap` | 13.0.4 | 15.2.0 | Build fails |
| `react-native-vision-camera` | ^4.7.2 | 5.0.7 | Build fails |
| `react-native-worklets-core` | ^1.6.3 | 1.6.3 (stay) | Build fails |
| `realm` | 12.14.2 | 20.2.0 | JNI patch fails |
| `@realm/react` | 0.6.2 | latest | After realm |
| `@react-native-firebase/app` | 24.0.0 | 24.0.0 (stay) | Peer dep error |
| `@sentry/react-native` | 8.8.0 | 8.9.2 | Build fails |

> ⚠️ `react-native-vision-camera` 5.x is a major version jump with breaking JS API changes. Do not upgrade unless your current version fails to build against 0.83.9.

> ⚠️ `realm` 20.x is a major version jump. If the JNI patch fails to apply cleanly, evaluate whether an intermediate Realm version (13.x, 14.x) already ships the `CallInvokerHolder` fix.

---

## Phase 5 — TypeScript Config Cleanup

These are non-blocking warnings today but will become errors in TypeScript 7.0. Fix them in the same PR as the upgrade to keep the diff clean.

**File:** `tsconfig.json`

```jsonc
// Before
"moduleResolution": "node",
"baseUrl": "."

// After
"moduleResolution": "bundler",
"ignoreDeprecations": "6.0"
// Remove baseUrl or replace with paths if only used for module aliases
```

> Check that `babel-plugin-module-resolver` still resolves `~` aliases correctly after changing `moduleResolution`.

---

## Phase 6 — Validation Gates

Run these in order after each phase. Do not proceed to the next phase if a gate fails.

### After Phase 1+2 (clean install)
```bash
yarn test
# Expected: all existing test suites pass. If tests fail, fix before building native.
```

### After Phase 3 (patches reconciled)
```bash
yarn ios          # iOS dev build
yarn androidDevelopmentDebug  # Android dev build
```

First build after a major RN bump will recompile all C++ from scratch. Expect 10-20 minutes. Failures at this stage are almost always from unreconciled patches or stale codegen.

### Manual regression — Bitcoin-critical flows

These must pass before merging the upgrade branch. Test on both a physical device and a simulator/emulator.

| Flow | Platform | Notes |
|---|---|---|
| Cold start, PIN entry | Both | Keychain must load |
| Create new wallet (singlesig + multisig) | Both | BIP39, key derivation |
| Recover wallet from seed phrase | Both | 12 and 24 word |
| Receive address generation | Both | Segwit, Taproot |
| Send BTC — fee estimation | Both | UTXO selection |
| PSBT creation | Both | `bitcoinjs-lib` patch is active |
| PSBT signing (software key) | Both | |
| PSBT export/import (file) | Both | `react-native-blob-util` and `react-native-document-picker` |
| Hardware wallet — NFC tap | Android | `react-native-nfc-manager`, `react-native-hce` |
| Hardware wallet — Camera QR scan | Both | `react-native-vision-camera` |
| Electrum server connectivity | Both | `react-native-tcp-socket` patch is active |
| Cloud backup | Both | Google Drive / iCloud |
| Biometric auth | Both | `react-native-biometrics`, `react-native-keychain` |
| PDF export | Both | `react-native-html-to-pdf` patch is active |
| IAP / subscription flow | Both | `react-native-iap` patch was rebuilt |
| App icon change | Both | `react-native-change-icon` patch is active |
| Background sync | Both | `react-native-background-timer` |

---

## Phase 7 — Pre-merge Cleanup

- [ ] Rename all `*+0.81.4.patch` files that are still active to `*+0.83.9.patch`
- [ ] Delete patches that were resolved by upstream library upgrades
- [ ] Delete `patches/@react-native+gradle-plugin+0.83.9.patch` after confirming no build artifacts land in it
- [ ] Add `.gitignore` entries for `node_modules/**/.gradle` and `node_modules/**/build/` to prevent build artifact patches from forming again
- [ ] Remove `patches/react-native-modal+13.0.1.patch` if it contains no source changes (verify contents)
- [ ] Run `yarn lint` and fix any new ESLint errors introduced by the React 19.2 types
- [ ] Document each remaining patch with a one-line comment at the top of the patch file explaining why it exists

---

## Known Pre-existing Issues to Track (Not Caused by Upgrade)

1. **Android launch activity error** — `io.hexawallet.keeper.development/io.hexawallet.keeper does not exist`. The CLI is sending the wrong fully-qualified class name. The build and install succeed. Fix the `mainActivity` resolution in the CLI invocation or the manifest, independent of the upgrade.

2. **TypeScript deprecation warnings** — `moduleResolution: node10` and `baseUrl` are deprecated. Non-blocking today but targeted in Phase 5 above.

3. **Gradle 9.0 incompatibility warning** — "Deprecated Gradle features were used in this build". This is from third-party libraries, not your config. Monitor when upgrading Gradle beyond 8.x.

---

## Rollback Plan

If the upgrade branch is blocked at any gate and cannot be resolved within a reasonable time, the rollback is simply:

```bash
git checkout main   # or your release branch
```

All changes are isolated in `upgrade/rn-0.83.9`. There are no destructive file operations in this plan.

---

## Branch Strategy

```
main (0.81.4)
 └── upgrade/rn-0.83.9
       ├── commit: Phase 0 — patch cleanup
       ├── commit: Phase 1 — version bump + reinstall
       ├── commit: Phase 2 — native file audit
       ├── commit: Phase 3 — patch reconciliation
       ├── commit: Phase 4 — library upgrades (one commit per library)
       └── commit: Phase 5+7 — TS cleanup + patch rename
```

Keep one logical commit per phase so individual changes can be reverted cleanly if needed.
