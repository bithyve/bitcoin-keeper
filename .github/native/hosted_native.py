#!/usr/bin/env python3
"""Disposable hosted smoke harness; only allowlisted metadata leaves the runner.

Native and Maestro output stays under RUNNER_TEMP, never in an uploaded glob.
The gate trusts protected workflow/job provenance, never this writable artifact.
"""

import hashlib
import json
import os
from pathlib import Path
import platform
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import time
import urllib.request
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[2]
PLATFORM = os.environ.get('KEEPER_NATIVE_PLATFORM', '')
PRIVATE = Path(os.environ.get('RUNNER_TEMP', tempfile.gettempdir())) / 'keeper-native-private'
EVIDENCE = ROOT / 'artifacts' / 'native' / PLATFORM.lower() / 'metadata.json'
MAESTRO_VERSION = 'cli-2.11.0'
MAESTRO_SHA256 = '5384593cb4e7a106489e75a821d157dd43f4e438df6bc308b72e82c685e1283a'
APP_IDS = {'IOS': 'io.hexawallet.hexakeeper.dev', 'ANDROID': 'io.hexawallet.keeper.development'}


def save(data):
    EVIDENCE.parent.mkdir(parents=True, exist_ok=True)
    EVIDENCE.write_text(json.dumps(data, indent=2) + '\n')


def read():
    return json.loads(EVIDENCE.read_text())


def failure_details(log):
    """Bounded tool errors from this fresh CI fixture, never raw process logs."""
    selected = []
    for line in log.splitlines():
        if not re.search(r'(?:\berror:|^error |^e: |^\[!\]|^FAILURE:|^> (?!Task\b)|^Caused by:|^Could not |'
                         r'^A problem occurred|^Execution failed|^The sandbox is not in sync)', line):
            continue
        line = re.sub(r'https?://\S+', '[URL]', line)
        line = re.sub(r'(?i)\b(password|token|secret|api[_-]?key|authorization)\s*[:=]\s*\S+',
                      r'\1=[REDACTED]', line)
        line = re.sub(r'(?i)\bBearer\s+\S+', 'Bearer [REDACTED]', line)
        line = re.sub(r'\b[a-fA-F0-9]{24,}\b', '[HEX]', line)
        line = re.sub(r'/Users/[^/\s]+', '/Users/[runner]', line)
        selected.append(line[:500])
        if len(selected) == 20:
            break
    return selected


def command(args, label, timeout=120, cwd=ROOT, capture=False):
    """Record exact nonsecret argv and status; keep all process output private."""
    PRIVATE.mkdir(parents=True, exist_ok=True)
    data = read()
    entry = {'label': label, 'command': args, 'timeout_seconds': timeout}
    data['commands'].append(entry)
    save(data)
    started = time.monotonic()
    output_file = PRIVATE / ('command-%03d.log' % len(data['commands']))
    print(label, flush=True)
    try:
        with output_file.open('wb') as output:
            proc = subprocess.Popen(args, cwd=cwd, stdout=output, stderr=subprocess.STDOUT,
                                    start_new_session=True)
            try:
                code = proc.wait(timeout=timeout)
            except subprocess.TimeoutExpired:
                os.killpg(proc.pid, signal.SIGKILL)
                proc.wait()
                code = 124
    except OSError:
        code = 127
    entry['exit_code'] = code
    entry['duration_seconds'] = round(time.monotonic() - started, 1)
    if code:
        # Fixed diagnostics expose install blockers without publishing arbitrary logs.
        log = output_file.read_text(errors='replace') if output_file.exists() else ''
        known = {
            'lockfile needs to be updated': 'Manifest and yarn.lock are inconsistent; repair the lockfile separately.',
            'could not find compatible versions': 'The native dependency lock is incompatible with the manifest.',
            'no space left on device': 'The hosted runner ran out of disk space.',
            'command not found': 'A required native tool is unavailable.',
            'requires a higher minimum deployment target': 'A pod requires a higher iOS deployment target.',
        }
        entry['diagnostic'] = next((message for needle, message in known.items()
                                    if needle in log.lower()), 'Inspect this command locally; private raw output was not retained.')
        entry['redacted_tool_errors'] = failure_details(log)
        for line in entry['redacted_tool_errors']:
            print(line, flush=True)
        save(data)
        raise RuntimeError('%s failed (exit %s). %s' % (label, code, entry['diagnostic']))
    save(data)
    return output_file.read_text(errors='replace').strip() if capture else None


def record():
    source = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    if source != os.environ.get('KEEPER_SOURCE_SHA'):
        raise RuntimeError('Checkout does not match the exact requested PR head.')
    save({
        'schema': 1, 'platform': PLATFORM, 'source_sha': source,
        'workflow_ref': os.environ.get('GITHUB_WORKFLOW_REF'),
        'workflow_sha': os.environ.get('GITHUB_WORKFLOW_SHA'),
        'run_id': os.environ.get('GITHUB_RUN_ID'), 'run_attempt': os.environ.get('GITHUB_RUN_ATTEMPT'),
        'runner': {key: os.environ.get(key) for key in
                   ['RUNNER_OS', 'RUNNER_ARCH', 'ImageOS', 'ImageVersion']},
        'os': platform.platform(), 'commands': [], 'build': 'NOT RUN', 'smoke': 'NOT RUN',
        'hardware': 'NOT RUN', 'signing': 'NOT RUN', 'app_id': APP_IDS[PLATFORM],
        'smoke_scope': 'Fresh install; render Create a passcode; type four disposable digits; assert Confirm your passcode; stop before persisting credentials.',
        'artifact_policy': 'Metadata only. No raw logs, screenshots, app binaries, simulator data or credentials.',
    })
    versions = {
        'node': command(['node', '--version'], 'Record Node version', capture=True),
        'java': command(['java', '-version'], 'Record Java version', capture=True),
    }
    if PLATFORM == 'IOS':
        versions['xcode'] = command(['xcodebuild', '-version'], 'Record Xcode version', capture=True)
        versions['sdk'] = command(['xcrun', '--sdk', 'iphonesimulator', '--show-sdk-version'],
                                  'Record iOS Simulator SDK', capture=True)
    else:
        versions['expected_sdk_build'] = 'compileSdk=36; buildTools=35.0.0; NDK=27.1.12297006'
        versions['expected_emulator_target'] = 'Android API 35; google_apis; x86_64; pixel_6'
    data = read()
    data['toolchain'] = versions
    save(data)


def fixtures():
    # Empty values would fall back to real development services in config.ts.
    overlays = ['.env.ci', 'firebase.json']
    (ROOT / '.env.ci').write_text('''ENVIRONMENT=DEVELOPMENT
RELAY=https://127.0.0.1:9/
SIGNING_SERVER_TESTNET=https://127.0.0.1:9/
SIGNING_SERVER_MAINNET=https://127.0.0.1:9/
CHANNEL_URL=https://127.0.0.1:9/
SENTRY_DNS=https://public@127.0.0.1:9/1
ENC_KEY_STORAGE_IDENTIFIER=KEEPER-HOSTED-DISPOSABLE
''')
    (ROOT / 'firebase.json').write_text(json.dumps({'react-native': {
        'app_data_collection_default_enabled': False,
        'analytics_auto_collection_enabled': False,
        'analytics_collection_deactivated': True,
        'messaging_auto_init_enabled': False,
    }}) + '\n')
    if PLATFORM == 'IOS':
        import plistlib
        for path, bundle in [('ios/GoogleService-Info.plist', 'io.hexawallet.keeper'),
                             ('ios/GoogleServices/dev/GoogleService-Info.plist', APP_IDS['IOS'])]:
            overlays.append(path)
            with (ROOT / path).open('wb') as output:
                plistlib.dump({'API_KEY': 'AIzaSy' + '0' * 33, 'GCM_SENDER_ID': '123456789012',
                               'PLIST_VERSION': '1', 'BUNDLE_ID': bundle,
                               'PROJECT_ID': 'keeper-disposable-ci',
                               'GOOGLE_APP_ID': '1:123456789012:ios:0000000000000000000000',
                               'IS_GCM_ENABLED': False, 'IS_ANALYTICS_ENABLED': False,
                               'IS_ADS_ENABLED': False, 'IS_SIGNIN_ENABLED': False}, output)
    else:
        overlays.append('android/app/google-services.json')
        (ROOT / 'android/app/google-services.json').write_text(json.dumps({
            'project_info': {'project_number': '123456789012', 'project_id': 'keeper-disposable-ci'},
            'client': [{'client_info': {'mobilesdk_app_id': '1:123456789012:android:0000000000000000',
                                       'android_client_info': {'package_name': APP_IDS['ANDROID']}},
                        'api_key': [{'current_key': 'AIzaSy' + '0' * 33}]}],
            'configuration_version': '1',
        }) + '\n')
    data = read()
    data['configuration'] = 'Synthetic Firebase project; DEVELOPMENT/testnet; loopback-only configured services; no production secrets.'
    data['configuration_overlays'] = [{'path': path, 'sha256': hashlib.sha256((ROOT / path).read_bytes()).hexdigest()}
                                      for path in overlays]
    save(data)


def install_maestro():
    archive = PRIVATE / 'maestro.zip'
    url = 'https://github.com/mobile-dev-inc/Maestro/releases/download/%s/maestro.zip' % MAESTRO_VERSION
    command(['curl', '--fail', '--location', '--silent', '--show-error', '--max-time', '120',
             '--output', str(archive), url], 'Download pinned Maestro', timeout=130)
    if hashlib.sha256(archive.read_bytes()).hexdigest() != MAESTRO_SHA256:
        raise RuntimeError('Maestro archive checksum mismatch.')
    # unzip preserves executable modes for the bundled native iOS driver;
    # Python ZipFile extraction would silently strip those modes.
    command(['unzip', '-q', str(archive), '-d', str(PRIVATE / 'maestro')],
            'Extract verified Maestro including native executable modes', timeout=120)
    candidates = list((PRIVATE / 'maestro').rglob('bin/maestro'))
    if len(candidates) != 1:
        raise RuntimeError('Unexpected Maestro archive layout.')
    data = read()
    data['maestro'] = {'version': MAESTRO_VERSION, 'sha256': MAESTRO_SHA256, 'binary': str(candidates[0])}
    save(data)


def android_sdk_metadata(sdk, component):
    properties = (sdk / component / 'source.properties').read_text()
    values = dict((key.strip(), value.strip()) for line in properties.splitlines()
                  if '=' in line for key, value in [line.split('=', 1)])
    if not values.get('Pkg.Revision'):
        raise RuntimeError('Android SDK component %s has no Pkg.Revision metadata.' % component)
    return {key: value for key, value in values.items()
            if key in ['Pkg.Revision', 'AndroidVersion.ApiLevel']}


def prepare():
    command(['npm', 'install', '--global', 'yarn@1.22.22', '--ignore-scripts'], 'Install pinned Yarn', timeout=180)
    command(['yarn', 'install', '--frozen-lockfile', '--ignore-scripts', '--non-interactive'],
            'Install immutable JavaScript dependencies', timeout=900)
    command(['node_modules/.bin/patch-package', '--error-on-fail'], 'Apply repository dependency patches', timeout=180)
    original_manifest = (ROOT / 'package.json').read_bytes()
    command(['node', '.github/native/nodeify.cjs'],
            'Apply committed Node compatibility whitelist without installing dependencies', timeout=180)
    installed_manifest = (ROOT / 'package.json').read_bytes()
    original = json.loads(original_manifest)
    installed = json.loads(installed_manifest)
    for key in ['browser', 'react-native', 'browserify']:
        original.pop(key, None)
        installed.pop(key, None)
    if original != installed:
        raise RuntimeError('Node compatibility setup changed fields beyond module mappings.')
    data = read()
    data['nodeify_overlay'] = {
        'path': 'package.json', 'before_sha256': hashlib.sha256(original_manifest).hexdigest(),
        'after_sha256': hashlib.sha256(installed_manifest).hexdigest(),
        'diff_sha256': hashlib.sha256(subprocess.check_output(['git', 'diff', 'HEAD', '--', 'package.json'], cwd=ROOT)).hexdigest(),
        'allowed_fields': ['browser', 'react-native', 'browserify'],
    }
    save(data)
    command(['git', 'diff', '--exit-code', 'HEAD', '--', 'yarn.lock', 'ios/Podfile.lock'],
            'Verify dependency locks remain immutable')
    fixtures()
    install_maestro()
    if PLATFORM == 'IOS':
        command(['gem', 'install', 'cocoapods', '--version', '1.16.2', '--no-document'],
                'Install pinned CocoaPods', timeout=300)
        if os.environ.get('KEEPER_POD_LOCK_REPAIR') == '1':
            # Diagnostic bootstrap only. A candidate lock is reviewed/committed,
            # then a separate strict deployment run must build and test the app.
            command(['pod', 'update', 'NitroIap', 'NitroModules', 'openiap', '--no-repo-update'],
                    'Generate targeted CocoaPods lock candidate (not validation)',
                    timeout=900, cwd=ROOT / 'ios')
            shutil.copyfile(ROOT / 'ios/Podfile.lock', EVIDENCE.parent / 'Podfile.lock.candidate')
            raise RuntimeError('Pod lock candidate generated for review; no native validation performed.')
        command(['pod', 'install', '--deployment'], 'Install immutable CocoaPods dependencies',
                timeout=900, cwd=ROOT / 'ios')
        # Existing PBX build phases hardcode this path. Adapt the disposable host,
        # preserving the app project and the source commit being tested.
        command(['sudo', 'mkdir', '-p', '/opt/homebrew/bin'], 'Prepare existing Xcode Node path')
        command(['sudo', 'ln', '-sf', shutil.which('node'), '/opt/homebrew/bin/node'],
                'Connect existing Xcode Node path to pinned Node')
    else:
        command(['sdkmanager', 'platforms;android-36', 'build-tools;35.0.0', 'ndk;27.1.12297006'],
                'Install pinned Android build SDK and NDK', timeout=600)
        sdk = Path(os.environ.get('ANDROID_HOME', os.environ.get('ANDROID_SDK_ROOT', '')))
        observed = {}
        for component in ['platforms/android-36', 'build-tools/35.0.0', 'ndk/27.1.12297006']:
            observed[component] = android_sdk_metadata(sdk, component)
        data = read()
        data['toolchain']['observed_android_sdk'] = observed
        save(data)
    if (ROOT / 'package.json').read_bytes() != installed_manifest:
        raise RuntimeError('Native installation unexpectedly rewrote the installed manifest.')
    command(['git', 'diff', '--exit-code', 'HEAD', '--', 'yarn.lock', 'ios/Podfile.lock'],
            'Verify native installation did not rewrite locks')


def artifact_identity():
    if PLATFORM == 'IOS':
        import plistlib
        bundle = PRIVATE / 'DerivedData/Build/Products/Debug-iphonesimulator/hexa_keeper_dev.app'
        with (bundle / 'Info.plist').open('rb') as source:
            executable = plistlib.load(source)['CFBundleExecutable']
        binary = bundle / executable
        tree = hashlib.sha256()
        for file in sorted(path for path in bundle.rglob('*') if path.is_file()):
            tree.update(str(file.relative_to(bundle)).encode() + b'\0')
            tree.update(hashlib.sha256(file.read_bytes()).digest())
        return {'path': str(bundle), 'executable': executable,
                'executable_sha256': hashlib.sha256(binary.read_bytes()).hexdigest(),
                'bundle_tree_sha256': tree.hexdigest()}
    apk = ROOT / 'android/app/build/outputs/apk/development/debug/app-development-debug.apk'
    return {'path': str(apk.relative_to(ROOT)), 'sha256': hashlib.sha256(apk.read_bytes()).hexdigest()}


def build():
    if PLATFORM == 'IOS':
        command(['xcodebuild', '-workspace', 'ios/hexa_keeper.xcworkspace', '-scheme', 'hexa_keeper_dev',
                 '-configuration', 'Debug', '-sdk', 'iphonesimulator', '-destination', 'generic/platform=iOS Simulator',
                 '-derivedDataPath', str(PRIVATE / 'DerivedData'), 'CODE_SIGNING_ALLOWED=NO',
                 'CODE_SIGNING_REQUIRED=NO', 'build'], 'Build unsigned development simulator app', timeout=2100)
    else:
        observed = command(['./gradlew', '--version'], 'Record actual Gradle and JVM version',
                           capture=True, cwd=ROOT / 'android')
        data = read()
        data['toolchain']['gradle'] = observed
        save(data)
        command(['./gradlew', ':app:assembleDevelopmentDebug', '--no-daemon', '--max-workers=2',
                 '-PreactNativeArchitectures=x86_64'], 'Build debug-key-only development APK',
                timeout=2100, cwd=ROOT / 'android')
    data = read()
    data['built_artifact'] = artifact_identity()
    data['build'] = 'PASS'
    save(data)


def smoke():
    if read()['build'] != 'PASS':
        raise RuntimeError('A successful native build is required before smoke testing.')
    if artifact_identity() != read()['built_artifact']:
        raise RuntimeError('Built artifact changed before the disposable startup smoke.')
    metro_output = (PRIVATE / 'metro.log').open('wb')
    metro = subprocess.Popen(['node', 'node_modules/react-native/cli.js', 'start', '--port', '8081'],
                             cwd=ROOT, stdout=metro_output, stderr=subprocess.STDOUT, start_new_session=True)
    device = None
    try:
        for _ in range(60):
            if metro.poll() is not None:
                raise RuntimeError('Metro exited before the disposable smoke.')
            try:
                with urllib.request.urlopen('http://127.0.0.1:8081/status', timeout=2) as response:
                    if b'packager-status:running' in response.read():
                        break
            except OSError:
                time.sleep(1)
        else:
            raise RuntimeError('Metro did not become ready within 60 attempts.')
        if PLATFORM == 'IOS':
            device = command(['xcrun', 'simctl', 'create', 'Keeper-disposable-ci',
                              'com.apple.CoreSimulator.SimDeviceType.iPhone-16',
                              'com.apple.CoreSimulator.SimRuntime.iOS-18-5'],
                             'Create fresh iPhone 16 iOS 18.5 simulator', capture=True)
            command(['xcrun', 'simctl', 'boot', device], 'Boot disposable simulator')
            command(['xcrun', 'simctl', 'bootstatus', device, '-b'], 'Wait for simulator boot', timeout=240)
            command(['xcrun', 'simctl', 'install', device,
                     str(PRIVATE / 'DerivedData/Build/Products/Debug-iphonesimulator/hexa_keeper_dev.app')],
                    'Install unsigned development app', timeout=120)
            descriptor = 'iPhone 16; iOS 18.5'
        else:
            sdk = Path(os.environ.get('ANDROID_HOME', os.environ.get('ANDROID_SDK_ROOT', '')))
            # Query the installed SDK package without loading emulator GUI libraries
            # on the headless host. The emulator runner already booted this image.
            emulator_version = android_sdk_metadata(sdk, 'emulator')
            adb_version = command(['adb', 'version'], 'Record actual adb version', capture=True)
            data = read()
            data['toolchain']['emulator'] = {'source': 'emulator/source.properties', **emulator_version}
            data['toolchain']['adb'] = adb_version
            save(data)
            device = command(['adb', 'get-serialno'], 'Identify fresh emulator', capture=True)
            command(['adb', '-s', device, 'reverse', 'tcp:8081', 'tcp:8081'], 'Connect emulator to Metro')
            command(['adb', '-s', device, 'install', '-r',
                     'android/app/build/outputs/apk/development/debug/app-development-debug.apk'],
                    'Install development debug APK', timeout=120)
            descriptor = command(['adb', '-s', device, 'shell', 'getprop', 'ro.build.fingerprint'],
                                 'Record Android emulator image', capture=True)
        data = read()
        data['device'] = {'id': device, 'image': descriptor, 'fresh_disposable_state': True}
        data['installed_artifact_verified'] = True
        save(data)
        report = PRIVATE / 'smoke-junit.xml'
        command([data['maestro']['binary'], '--device', device, 'test', '--env', 'APP_ID=' + APP_IDS[PLATFORM],
                 '--format', 'junit', '--output', str(report), '--test-output-dir', str(PRIVATE / 'maestro-output'),
                 '.github/native/startup.yaml'], 'Assert startup and disposable passcode transition', timeout=240)
        suite = ET.parse(report).getroot()
        cases = list(suite.iter('testcase'))
        if not cases or any(list(case.iter('failure')) or list(case.iter('error')) or list(case.iter('skipped'))
                            for case in cases):
            raise RuntimeError('Maestro did not produce a complete successful smoke report.')
        data = read()
        data['smoke'] = 'PASS'
        data['smoke_test_cases'] = len(cases)
        save(data)
    finally:
        if metro.poll() is None:
            os.killpg(metro.pid, signal.SIGTERM)
            try:
                metro.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(metro.pid, signal.SIGKILL)
        metro_output.close()
        if device and PLATFORM == 'IOS':
            subprocess.run(['xcrun', 'simctl', 'shutdown', device], stdout=subprocess.DEVNULL,
                           stderr=subprocess.DEVNULL, timeout=30, check=False)
            subprocess.run(['xcrun', 'simctl', 'delete', device], stdout=subprocess.DEVNULL,
                           stderr=subprocess.DEVNULL, timeout=30, check=False)
        elif device:
            subprocess.run(['adb', '-s', device, 'uninstall', APP_IDS[PLATFORM]], stdout=subprocess.DEVNULL,
                           stderr=subprocess.DEVNULL, timeout=30, check=False)


def main():
    if PLATFORM not in APP_IDS or len(sys.argv) != 2 or sys.argv[1] not in ['record', 'prepare', 'build', 'smoke']:
        raise RuntimeError('Expected a hosted platform and record|prepare|build|smoke.')
    os.environ.update({'ENVFILE': '.env.ci', 'RCT_NO_LAUNCH_PACKAGER': '1',
                       'RCT_NEW_ARCH_ENABLED': '1', 'MAESTRO_CLI_NO_ANALYTICS': '1'})
    run_phase(sys.argv[1])


def run_phase(phase):
    try:
        globals()[phase]()
    except Exception:
        if EVIDENCE.exists():
            evidence = read()
            evidence['failed_phase'] = phase
            if phase in ['build', 'smoke']:
                evidence[phase] = 'FAIL'
            save(evidence)
        raise


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('Hosted native validation failed: %s' % error, file=sys.stderr)
        sys.exit(1)
