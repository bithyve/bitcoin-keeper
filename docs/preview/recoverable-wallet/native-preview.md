# Native preview packaging (milestone 1)

The Recoverable Wallet setup and recovery flow remain simulated. The separate opt-in Test Mobile Key diagnostic can create a real, unbacked-up testnet device key. It creates no wallet, signing authority or recovery protocol, and the checked-in configuration cannot reach Keeper's production service endpoints.

| Platform | Preview identity | Build entry | Storage/cloud boundary |
| --- | --- | --- | --- |
| Android | `io.hexawallet.keeper.recoverablepreview` | `yarn androidRecoverablePreview` / `:app:assembleRecoverablePreviewDebug` | Separate Android app sandbox and Keystore namespace. The native `CloudBackup` module is not registered, Google Drive sign-in is unavailable, and the flavor has a local-only placeholder Firebase configuration. No production backup or app links are registered. |
| iOS | `io.hexawallet.hexakeeper.recoverablepreview` | `yarn iosRecoverablePreview` / `hexa_keeper_recoverable_preview` scheme | Separate app sandbox and default Keychain access group. Preview entitlements contain no iCloud, associated domains or push capability. Preview build settings skip Firebase configuration and include a build phase to remove the development `GoogleService-Info.plist`. The simulator build is still unverified. |

Both builds use the checked-in `.env.recoverable-preview` file. It sets `KEEPER_PREVIEW=true`, `KEEPER_PREVIEW_TESTNET_ONLY=true` and local unreachable service URLs. The preview entry also checks the exact native bundle/application ID before showing the flow; mismatches show a locked error screen. The preview runtime does not initialize the normal Keeper app or its wallet store.

The preview-only native Mobile Key module is registered only in the Android `recoverablePreview` flavor and compiled only in the iOS preview scheme. Both create/load and read-only reload check the exact installed Preview identity. **Test Mobile Key → Check Key** invokes it; the Assisted Multisig setup statuses remain simulated. The second diagnostic read cannot create a replacement, and malformed or changed public identities fail rather than becoming wallet-ready.

Current Cloud checks: 21 actual Android storage-core JVM cases and a narrow Kotlin bridge typecheck against real API 36 / React Native 0.83.9 classes (generated BuildConfig fixture). See [native harness](../../../tests/native/preview-mobile-key/README.md). This does not execute Keystore, AtomicFile or iOS Security, produce an APK/IPA, or prove restart/reinstall continuity. The seed still crosses the native-to-JavaScript bridge; mutable-buffer clearing cannot erase immutable strings/BIP32 copies. Keep native/security review and recovery validation mandatory before a fundable path.

## Build and install

From the repository root after installing JS dependencies:

```sh
yarn androidRecoverablePreview
yarn iosRecoverablePreview
```

For an Android APK without launching an emulator:

```sh
cd android
ENVFILE=.env.recoverable-preview ./gradlew :app:assembleRecoverablePreviewDebug
```

For a smaller Android device APK, use `-PkeeperPreviewAbis=arm64-v8a -PreactNativeArchitectures=arm64-v8a` with that Gradle command. The default flavor retains all four configured ABIs.

The local verification worktree shared `node_modules` through a symlink. Metro required a temporary symlink watch-folder setting for that build; it was removed afterward. A normal dependency installation in this checkout avoids that local workaround.

The Android package must be installed alongside production Keeper and verified on a device before calling the milestone device-tested. The iOS scheme is configured for the simulator, but a simulator build has not yet completed. A signed physical-device build requires an Apple App ID and provisioning profile for `io.hexawallet.hexakeeper.recoverablepreview`; distribution access must be checked with the Keeper team. Neither cloud backup nor a physical hardware connection is claimed by this milestone.

Historical Android emulator verification on 9 October 2026 (older source, not the current native changes): the arm64 APK installed and launched from its embedded JavaScript bundle at 320dp width with 1.6× system text. The shorter testnet demo notice leaves the Assisted Multisig option visible on the empty Wallets screen; Mobile and Server simulated statuses and Choose Hardware remain reachable by scrolling. The persistent Show Setup Error action, simulated Server Key failure, and Try Again recovery were exercised in the native app. Keeper Preview, an existing development app, and the public production Keeper v2.6.3 APK had distinct package IDs and launched on the same emulator. The preceding package also completed the simulated hardware, connection error, inheritance, review, and completion walkthrough at that size. Physical-device installation and real storage/keychain separation still require checks.

Before future cloud backup work, register a dedicated iCloud container for the preview App ID and dedicated Google OAuth/Drive credentials. Keep access disabled until read-back and cross-app isolation are verified on real devices. Do not reuse Keeper's production or development cloud identities.

## Native checks

1. Confirm production Keeper and Keeper Preview install simultaneously without replacing each other.
2. Confirm the preview icon/name is `Keeper Preview`, has no production deep link/backup intent, and starts at the empty Wallets chooser. Selecting Assisted Multisig should start the simulated key sequence directly.
3. Check iOS Keychain and Android app data remain inaccessible to the other app. On iOS, inspect the signed preview entitlements; they must contain no production iCloud or Keychain group.
4. Confirm both preview backends use only local unreachable URLs and the UI has no mainnet control, wallet creation, signing, or cloud-backup action.
5. Uninstall Preview and confirm production Keeper and its wallet/backups remain intact.

## Mobile Key runtime acceptance (current code)

Use disposable Preview data only; record the exact tested commit and installed identity. Keep production Keeper installed and never inspect or modify its keys/backups.

1. Before creating a key, call `readExistingSeedBase64`: it must fail without creating a seed or Keystore alias/Keychain item. Check Key may then create the diagnostic key; repeat and compare the same public BIP48 identity. Backup/recovery/wallet readiness must stay false.
2. Force-stop/terminate Preview, reopen and repeat. Record full public identity in a local test harness separately from the displayed short tag. Test parallel calls and app/background/locked-device transitions; failures must show only safe codes.
3. Android: in a disposable debug Preview sandbox, mutate/truncate/oversize the encrypted record, remove the alias with the record retained, remove the record with the alias retained, and interrupt first write. A lone `.new`/`.bak` artifact or unreadable record must never trigger replacement. A valid AtomicFile backup may restore only its original identity. Exercise actual process/file locks and Keystore behavior.
4. iOS: exercise locked/unlocked Keychain access, missing-item read-only load, corrupt/wrong-length items and duplicate creation against Security.framework. Validate ThisDeviceOnly/non-sync attributes and signed Preview access groups. No simulator result proves physical Keychain behavior.
5. Reinstall expectations differ: Android uninstall normally removes app data/Keystore; iOS Keychain may survive uninstall. Compare against independently recorded policy identity. A fresh key or retained key must never be called a recovered wallet without authenticated backup/native restore proof. Uninstalling Preview must leave production Keeper untouched.
6. Build both exact-head Preview packages, co-install beside production, inspect package IDs/entitlements/no-backup/no-cloud/deep links, run 320dp/larger-text walkthroughs, and test real TAPSIGNER/Satochip/Jade/Coldcard transports before claiming compatibility. Public imports alone are insufficient.

Native backup/import, credential/policy persistence and actual hardware signing remain absent. No diagnostic reset or restoration into native storage is implemented by the fixture service.
