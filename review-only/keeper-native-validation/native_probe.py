#!/usr/bin/env python3
"""Review-only native probe adapter. All output stays private except fixed categories."""
import importlib.util
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(os.environ.get('GITHUB_WORKSPACE', '.')).resolve() / 'app'
PLATFORM = os.environ.get('KEEPER_NATIVE_PLATFORM', '')
PRIVATE = Path(os.environ.get('RUNNER_TEMP', '/tmp')) / 'keeper-native-private'

def runtime_record(device):
    if PLATFORM == 'IOS':
        payload = json.loads(command(['xcrun', 'simctl', 'list', '--json'],
                                     'Record actual simulator runtime', capture=True))
        matching = [(runtime, item) for runtime, items in payload['devices'].items()
                    for item in items if item['udid'] == device]
        if len(matching) != 1:
            raise RuntimeError('RUNTIME_IDENTITY_FAILED')
        runtime_id, selected = matching[0]
        runtime = next(r for r in payload['runtimes'] if r['identifier'] == runtime_id)
        return {'device_type': selected['deviceTypeIdentifier'], 'runtime_id': runtime_id,
                'runtime_version': runtime['version'], 'runtime_build': runtime['buildversion']}
    sdk = Path(os.environ.get('ANDROID_HOME', os.environ.get('ANDROID_SDK_ROOT', '')))
    return {'api': command(['adb', '-s', device, 'shell', 'getprop', 'ro.build.version.sdk'],
                           'Record actual emulator API', capture=True),
            'abi': command(['adb', '-s', device, 'shell', 'getprop', 'ro.product.cpu.abi'],
                           'Record actual emulator ABI', capture=True),
            'system_image': H.android_sdk_metadata(sdk, 'system-images/android-35/google_apis/x86_64')}

def run_probe(mode):
    if read()['build'] != 'PASS':
        raise RuntimeError('A successful native build is required before smoke testing.')
    if artifact_identity() != read()['built_artifact']:
        raise RuntimeError('Built artifact changed before the disposable startup smoke.')
    metro_output = (PRIVATE / 'metro.log').open('wb')
    metro = subprocess.Popen(['node', 'node_modules/react-native/cli.js', 'start', '--port', '8081', '--config', '.github/native/prerequisite_metro.cjs'],
                             cwd=ROOT, stdout=metro_output, stderr=subprocess.STDOUT, start_new_session=True)
    device = None
    report = PRIVATE / ('bridge-junit.xml' if mode == 'bridge' else 'smoke-junit.xml')
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
        warm_metro_bundle()
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
            emulator_version = H.android_sdk_metadata(sdk, 'emulator')
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
        runtime = runtime_record(device)
        data = read()
        data['device'] = {'id': device, 'image': descriptor, 'fresh_disposable_state': True}
        data['installed_artifact_verified'] = True
        data['bridge_runtime'] = runtime
        save(data)
        command([data['maestro']['binary'], '--device', device, 'test', '--env', 'APP_ID=' + APP_IDS[PLATFORM],
                 '--flatten-debug-output', '--debug-output', str(PRIVATE / 'maestro-output'),
                 '--format', 'junit', '--output', str(report), '--test-output-dir', str(PRIVATE / 'maestro-output'),
                 '.github/native/prerequisite_probe.yaml' if mode == 'bridge' else '.github/native/startup.yaml'],
                'Assert native storage relaunch and strict IAP lifecycle' if mode == 'bridge'
                else 'Assert original startup and passcode transition', timeout=540)
        suite = ET.parse(report).getroot()
        cases = list(suite.iter('testcase'))
        if not cases or any(list(case.iter('failure')) or list(case.iter('error')) or list(case.iter('skipped'))
                            for case in cases):
            raise RuntimeError('Maestro did not produce a complete successful smoke report.')
        data = read()
        data['smoke'] = 'PASS'
        data['smoke_test_cases'] = len(cases)
        save(data)
    except Exception:
        if device and mode == 'bridge':
            category = 'NATIVE_PROBE_FAILURE'
            try:
                hierarchy = command([read()['maestro']['binary'], '--device', device, 'hierarchy'],
                                    'Classify fixed probe failure', timeout=20, capture=True, error_details=False)
                codes = ['STORAGE_FAILURE', 'DEVELOPMENT_ONLY', 'IAP_TIMEOUT', 'IAP_STORE_UNAVAILABLE',
                         'IAP_INIT_FALSE', 'IAP_END_FALSE', 'IAP_NATIVE_FAILURE', 'IAP_API_MISSING']
                found = [code for code in codes if re.search(r'\b' + code + r'\b', hierarchy)]
                if len(found) == 1:
                    category = found[0]
            except Exception:
                pass
            data = read()
            data['bridge_failure_category'] = category
            save(data)
        try:
            record_startup_failure(report, device)
        except Exception as error:
            # Diagnostics never replace the original failed native/UI result.
            data = read()
            data['startup_diagnostics'] = {'collection_errors': [
                {'stage': 'collector', 'error_type': type(error).__name__}]}
            save(data)
        raise
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
    global H, read, save, command, artifact_identity, warm_metro_bundle, record_startup_failure, APP_IDS
    spec = importlib.util.spec_from_file_location('pinned_native', ROOT / '.github/native/hosted_native.py')
    H = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(H)
    read, save, command = H.read, H.save, H.command
    artifact_identity, warm_metro_bundle = H.artifact_identity, H.warm_metro_bundle
    record_startup_failure, APP_IDS = H.record_startup_failure, H.APP_IDS
    before = read()
    if len(sys.argv) != 2 or sys.argv[1] not in ('startup', 'bridge'):
        raise RuntimeError('PROBE_MODE_REQUIRED')
    mode = sys.argv[1]
    os.environ['KEEPER_PROBE_MODE'] = mode
    os.environ.update({'ENVFILE': '.env.ci', 'RCT_NO_LAUNCH_PACKAGER': '1',
                       'RCT_NEW_ARCH_ENABLED': '1', 'MAESTRO_CLI_NO_ANALYTICS': '1'})
    served_file = PRIVATE / (mode + '-served.json')
    if served_file.exists():
        raise RuntimeError('PROBE_MUST_BE_FRESH')
    if before.get('build') != 'PASS' or (mode == 'bridge' and before.get('smoke') != 'PASS'):
        raise RuntimeError('BUILD_AND_BOOTSTRAP_REQUIRED')
    original = {key: before.get(key) for key in ['smoke', 'smoke_test_cases', 'device',
                'installed_artifact_verified', 'metro_warmup']}
    result = 'FAIL'
    try:
        run_probe(mode)
        result = 'PASS'
    finally:
        data = read()
        data[mode + '_probe'] = {'result': result,
            'successful_junit_cases': data.get('smoke_test_cases', 0) if result == 'PASS' else 0,
            'runtime': data.get('bridge_runtime', {}),
            'bundle': data.get('metro_warmup', {}),
            'device': data.get('device', {}),
            'installed_artifact_verified': data.get('installed_artifact_verified') is True,
            'scope': 'SAME_BINARY_STORAGE_REOPEN_AND_STRICT_IAP_LIFECYCLE'}
        if served_file.is_file() and served_file.stat().st_size <= 16384:
            data[mode + '_probe']['served_bundles'] = json.loads(served_file.read_text())
        if mode == 'bridge':
            data.update(original)
        save(data)

if __name__ == '__main__':
    try:
        main()
    except Exception:
        print('NATIVE_BRIDGE_PROBE_BLOCKED', file=sys.stderr)
        sys.exit(1)
