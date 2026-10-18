"""Strict durable schema: fixed keys/categories, bounded numeric versions and hashes."""
import re

def require(value):
    if not value:
        raise ValueError('INVALID_DURABLE_RECORD')

def pattern(value, expression):
    require(isinstance(value, str) and len(value) <= 128)
    require(re.fullmatch(expression, value) is not None)
    return value

def sha(value):
    return pattern(value, r'[0-9a-f]{64}')

def version(value):
    return pattern(value, r'[0-9]+(?:\.[0-9]+){0,4}')

def build(value):
    return pattern(value, r'[0-9]{1,3}[A-Z][0-9]{1,6}[a-z]?')

def select(metadata, platform, retention_days):
    require(type(retention_days) is int and 1 <= retention_days <= 90)
    runner = metadata['runner']
    require(runner['RUNNER_OS'] == ('macOS' if platform == 'IOS' else 'Linux'))
    require(runner['RUNNER_ARCH'] == ('ARM64' if platform == 'IOS' else 'X64'))
    require(runner['ImageOS'] in ({'macos15', 'macos15-arm64'} if platform == 'IOS' else {'ubuntu24'}))
    result = {'retention_days': retention_days,
              'runner_os': runner['RUNNER_OS'], 'runner_arch': runner['RUNNER_ARCH'],
              'runner_image': runner['ImageOS'], 'runner_image_version': version(runner['ImageVersion']),
              'maestro_version': '2.11.0', 'maestro_archive_sha256': sha(metadata['maestro']['sha256'])}
    require(metadata['maestro']['version'] == 'cli-2.11.0')
    require(result['maestro_archive_sha256'] == '5384593cb4e7a106489e75a821d157dd43f4e438df6bc308b72e82c685e1283a')
    mapping = metadata['nodeify_overlay']
    require(mapping['allowed_fields'] == ['browser', 'react-native', 'browserify'])
    result['node_mappings'] = {key: sha(mapping[key]) for key in
                              ['before_sha256', 'after_sha256', 'diff_sha256']}
    expected = {'.env.ci', 'firebase.json'} | ({'ios/GoogleService-Info.plist',
                'ios/GoogleServices/dev/GoogleService-Info.plist'} if platform == 'IOS'
                else {'android/app/google-services.json'})
    overlays = metadata['configuration_overlays']
    require(len(overlays) == len(expected) and {row['path'] for row in overlays} == expected)
    result['synthetic_config_sha256'] = {row['path']: sha(row['sha256']) for row in overlays}
    for name, data in [('startup_bundle', metadata['metro_warmup']),
                       ('probe_bundle', metadata['bridge_probe']['bundle'])]:
        require(data['result'] == 'PASS' and data['http_status'] == 200)
        require(type(data['bytes']) is int and 0 < data['bytes'] < 1024 * 1024 * 1024)
        result[name] = {'sha256': sha(data['sha256']), 'bytes': data['bytes']}
    result['served_bundles'] = {}
    for phase in ['startup', 'bridge']:
        rows = metadata[phase + '_probe']['served_bundles']
        require(isinstance(rows, list) and 2 <= len(rows) <= 8)
        require({row['kind'] for row in rows} == {'warmup', 'served'})
        selected = []
        for row in rows:
            require(set(row) == {'kind', 'status', 'bytes', 'sha256'})
            require(row['status'] == 200 and type(row['bytes']) is int and 0 < row['bytes'] < 1024**3)
            selected.append({'kind': row['kind'], 'sha256': sha(row['sha256']), 'bytes': row['bytes']})
        result['served_bundles'][phase] = selected
    runtime = metadata['bridge_probe']['runtime']
    if platform == 'IOS':
        require(metadata['toolchain']['ios_simulator_architecture'] == 'arm64')
        require(runtime['device_type'] == 'com.apple.CoreSimulator.SimDeviceType.iPhone-16')
        require(runtime['runtime_id'] == 'com.apple.CoreSimulator.SimRuntime.iOS-18-5')
        result['device'] = {'type': 'iPhone-16', 'runtime': version(runtime['runtime_version']),
                            'build': build(runtime['runtime_build'])}
        require(result['device']['runtime'] == '18.5')
        xcode = metadata['toolchain']['xcode']
        match = re.fullmatch(r'Xcode (16\.4)\nBuild version ([0-9]{1,3}[A-Z][0-9]{1,6}[a-z]?)', xcode.strip())
        require(match)
        result['xcode'] = {'version': match[1], 'build': build(match[2])}
    else:
        require(runtime['api'] == '35' and runtime['abi'] == 'x86_64')
        require(runtime['system_image']['AndroidVersion.ApiLevel'] == '35')
        result['device'] = {'api': 35, 'abi': 'x86_64', 'target': 'google_apis',
                            'image_revision': version(runtime['system_image']['Pkg.Revision'])}
        observed = metadata['toolchain']['observed_android_sdk']
        expected_sdk = {'platforms/android-36', 'build-tools/35.0.0', 'ndk/27.1.12297006'}
        require(set(observed) == expected_sdk)
        result['android_sdk'] = {key: version(observed[key]['Pkg.Revision']) for key in sorted(expected_sdk)}
        require(observed['platforms/android-36']['AndroidVersion.ApiLevel'] == '36')
        require(result['android_sdk']['build-tools/35.0.0'] == '35.0.0')
        require(result['android_sdk']['ndk/27.1.12297006'] == '27.1.12297006')
    return result
