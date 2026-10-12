#!/usr/bin/env bash
set -euo pipefail

if [[ $# -gt 1 || (${1:-} != "" && ${1:-} != "--android-bridge-typecheck") ]]; then
  echo "Usage: bash tests/native/preview-mobile-key/run.sh [--android-bridge-typecheck]" >&2
  exit 2
fi

test_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
repo_dir=$(cd -- "$test_dir/../../.." && pwd)
tools_dir=${KEEPER_PREVIEW_NATIVE_TOOLS_DIR:-${TMPDIR:-/tmp}/keeper-preview-native-tools}
compiler_version=2.0.21
compiler_sha256=0352c0a45bd22f80f6b26e485cd04da8047baa5de54865281fb9f89a4a7bcf2a
compiler_archive="$tools_dir/kotlin-compiler-$compiler_version.zip"
mkdir -p -- "$tools_dir"

if [[ ! -f "$compiler_archive" ]]; then
  curl --fail --silent --show-error --location --max-time 180 \
    "https://github.com/JetBrains/kotlin/releases/download/v$compiler_version/kotlin-compiler-$compiler_version.zip" \
    --output "$compiler_archive.download"
  mv -- "$compiler_archive.download" "$compiler_archive"
fi
printf '%s  %s\n' "$compiler_sha256" "$compiler_archive" | sha256sum --check --status

# Re-extract the verified archive; do not trust a previously modified compiler binary.
compiler_dir=$(mktemp -d "$tools_dir/compiler.XXXXXXXX")
build_dir=$(mktemp -d "$tools_dir/check.XXXXXXXX")
trap 'rm -rf -- "$compiler_dir" "$build_dir"' EXIT
unzip -q "$compiler_archive" -d "$compiler_dir"
"$compiler_dir/kotlinc/bin/kotlinc" \
  "$repo_dir/android/app/src/main/java/com/hexa_keeper/KeeperPreviewMobileKeyStore.kt" \
  "$test_dir/KeeperPreviewMobileKeyStoreTest.kt" \
  -jvm-target 17 -include-runtime -d "$build_dir/preview-mobile-key-checks.jar"
java -jar "$build_dir/preview-mobile-key-checks.jar"

if [[ ${1:-} == "--android-bridge-typecheck" ]]; then
  # Actual platform/React classes, plus only the generated build-flag fixture.
  # This checks Kotlin bridge types; it does not build an APK or run platform services.
  android_archive="$tools_dir/platform-36_r02.zip"
  react_archive="$tools_dir/react-android-0.83.9-debug.aar"
  if [[ ! -f "$android_archive" ]]; then
    curl --fail --silent --show-error --location --max-time 180 \
      https://dl.google.com/android/repository/platform-36_r02.zip \
      --output "$android_archive.download"
    mv -- "$android_archive.download" "$android_archive"
  fi
  if [[ ! -f "$react_archive" ]]; then
    curl --fail --silent --show-error --location --max-time 180 \
      https://repo.maven.apache.org/maven2/com/facebook/react/react-android/0.83.9/react-android-0.83.9-debug.aar \
      --output "$react_archive.download"
    mv -- "$react_archive.download" "$react_archive"
  fi
  printf '%s  %s\n' \
    37607369a28c5b640b3a7998868d45898ebcb777565a0e85f9acf36f29631d2e "$android_archive" \
    e8a7e428e5369a541e1eb267b703fb53d84c5be5b2ab32a0d5f8f30dc745e5cc "$react_archive" \
    | sha256sum --check --status
  unzip -p "$android_archive" android-36/android.jar > "$build_dir/android.jar"
  unzip -p "$react_archive" classes.jar > "$build_dir/react-android.jar"
  cat > "$build_dir/BuildConfig.kt" <<'KOTLIN'
package io.hexawallet.keeper
object BuildConfig { const val IS_RECOVERABLE_PREVIEW = true }
KOTLIN
  "$compiler_dir/kotlinc/bin/kotlinc" \
    "$repo_dir/android/app/src/main/java/com/hexa_keeper/KeeperPreviewMobileKeyStore.kt" \
    "$repo_dir/android/app/src/main/java/com/hexa_keeper/KeeperPreviewMobileKeyModule.kt" \
    "$build_dir/BuildConfig.kt" \
    -classpath "$build_dir/android.jar:$build_dir/react-android.jar" \
    -jvm-target 17 -d "$build_dir/android-preview-bridge-typecheck.jar"
  echo "PASS Android bridge typecheck against API 36 / React Native 0.83.9; not an APK build."
fi
