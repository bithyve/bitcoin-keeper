#!/usr/bin/env python3
"""REVIEW ONLY. Bound evidence collection; never approve, attest or write statuses."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import plistlib
import re
import shutil
import subprocess
import sys
import urllib.request
import xml.etree.ElementTree as ET
import provenance

REPOSITORY = 'KeeperCommunity/bitcoin-keeper'
BASE = 'def0d6a90c80287edb4f58ae272cbfc340f00d73'
SOURCE = 'bccb63348754e7a7975ea140717d31be214f0801'
SOURCE_TREE = '3768d44eaa9005f56f564b1faeb2732bef2da1e8'
HARNESS = '0984c5b97e7e8326d6856ba662274ecf325e5e0f'
RUNNER_BRANCH = 'codex/native-auth-prepare-once-bccb6334'
PROPOSAL_PATH = 'review-only/keeper-native-validation/'
PROBE_FILES = ('prerequisite_storage.cjs', 'prerequisite_iap.cjs', 'prerequisite_probe.js',
               'prerequisite_probe.yaml', 'prerequisite_metro.cjs', 'bundle_observer.cjs')
HARNESS_FILES = {
    'hosted_native.py': '9328707beea95c48b4d5594d2ddb2cdb486099c2d522919cca5b8d3cb50ddb03',
    'nodeify.cjs': '842ed4755d302fecdcab23099af5eefe02356fe132dfe93417e91a842f742fea',
    'startup.yaml': '89ac67286d1086edf32f797332c98f1ef1ca5cffe04aee82893bd8bd54b5ecea',
}
RUNTIME_PATCHES = {
    'app-runtime.patch': 'fb6a5c0369de573ab31e7195054041d637da0783de3c4ca2e1f19de8c3f25f3e',
    'harness-bundler.patch': '6c374c092b5f758c6031c1d5b011b32432937ab3a80726da8fbcf315b1ba43c2',
}
RUNTIME_FILES = {
    'Gemfile': '265e7bb58640ba33f98ee88438dd1072245c44663e2b51befd9e0207c79a552e',
    'Gemfile.lock': '6fd9e78b81474e5d631124a9f75ed0c21c8b7a284a65a35b2dc960ddaa4fd024',
}
STAGED_HARNESS_FILES = dict(HARNESS_FILES, **{
    'hosted_native.py': '3ff70788a1a6df8400e3e79c9c1bf4d951125f078ad14df3dc1c97d91ab94210',
})


def runtime_patch_guard(review):
    for name, expected in RUNTIME_PATCHES.items():
        require(digest(review / PROPOSAL_PATH / name) == expected)


def apply_runtime_patches(app, review):
    runtime_patch_guard(review)
    # Only the reviewed native implementation is staged; the bundled patch also
    # preserves its source-owner regression test for review, not app execution.
    for check in (True, False):
        for name in RUNTIME_PATCHES:
            args = ['apply'] + (['--check'] if check else [])
            if name == 'harness-bundler.patch':
                args += ['--include=.github/native/hosted_native.py']
            git(app, *args, str(review / PROPOSAL_PATH / name))


def runtime_file_guard(app):
    for name, expected in RUNTIME_FILES.items():
        require(digest(app / name) == expected)


CONFIG = {'firebase.json', '.env.ci', 'ios/GoogleService-Info.plist',
          'ios/GoogleServices/dev/GoogleService-Info.plist', 'android/app/google-services.json'}
MAPPING_FIELDS = {'browser', 'react-native', 'browserify'}
PHASES = ('record', 'prepare', 'driver', 'build', 'smoke', 'bridge')
OUTCOMES = {'success', 'failure', 'cancelled', 'skipped'}
ENV_CI = '''ENVIRONMENT=DEVELOPMENT
RELAY=https://127.0.0.1:9/
SIGNING_SERVER_TESTNET=https://127.0.0.1:9/
SIGNING_SERVER_MAINNET=https://127.0.0.1:9/
CHANNEL_URL=https://127.0.0.1:9/
SENTRY_DNS=https://public@127.0.0.1:9/1
ENC_KEY_STORAGE_IDENTIFIER=KEEPER-HOSTED-DISPOSABLE
'''


def require(condition):
    if not condition:
        raise RuntimeError('INPUT_OR_EVIDENCE_CHECK_FAILED')


def git(root, *args):
    return subprocess.check_output(['git', '-C', str(root), *args], stderr=subprocess.DEVNULL)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def roots():
    workspace = Path(os.environ['GITHUB_WORKSPACE']).resolve()
    return workspace / 'app', workspace / 'harness', workspace / 'review'


_API_TOKEN = None


class NoApiRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        # Reject even same-origin redirects; never replay Authorization.
        return None


def api_token():
    global _API_TOKEN
    # Consume the step-only credential before any Git or dependency subprocess.
    supplied = os.environ.pop('KEEPER_PROVENANCE_TOKEN', None)
    actions = os.environ.get('GITHUB_ACTIONS')
    if actions != 'true':
        require(actions in (None, 'false') and supplied is None and _API_TOKEN is None)
        return None
    expected = {
        'GITHUB_REPOSITORY': REPOSITORY,
        'GITHUB_SERVER_URL': 'https://github.com',
        'GITHUB_API_URL': 'https://api.github.com',
        'GITHUB_EVENT_NAME': 'push',
        'GITHUB_REF': 'refs/heads/' + RUNNER_BRANCH,
        'GITHUB_WORKFLOW_REF': REPOSITORY + '/.github/workflows/'
                               'keeper-one-time-native-diagnostic.yml@refs/heads/' + RUNNER_BRANCH,
        'GITHUB_RUN_ATTEMPT': '1',
    }
    require(all(os.environ.get(key) == value for key, value in expected.items()))
    runner = os.environ.get('GITHUB_SHA', '')
    require(re.fullmatch(r'[0-9a-f]{40}', runner) and
            os.environ.get('GITHUB_WORKFLOW_SHA') == runner)
    if supplied is not None:
        require(_API_TOKEN is None)
        require(re.fullmatch(r'[A-Za-z0-9_]{1,4096}', supplied))
        _API_TOKEN = supplied
    require(_API_TOKEN is not None)
    return _API_TOKEN


def public_get(endpoint):
    require(endpoint in ('', '/branches/sprint', '/git/ref/heads/' + RUNNER_BRANCH))
    token = api_token()
    request = urllib.request.Request(
        'https://api.github.com/repos/' + REPOSITORY + endpoint,
        headers={'Accept': 'application/vnd.github+json', 'User-Agent': 'Keeper-review-only-proposal'})
    if token is not None:
        request.add_unredirected_header('Authorization', 'Bearer ' + token)
    # Fixed HTTPS origin, default TLS verification, no proxy or redirect forwarding.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoApiRedirect())
    with opener.open(request, timeout=20) as response:
        require(response.status == 200)
        return json.loads(response.read(1024 * 1024))


def current_source():
    # Observation run only. This neither selects a PR nor gives gate eligibility.
    repo = public_get('')
    require(repo['full_name'] == REPOSITORY and repo['private'] is False)
    require(repo['default_branch'] == 'sprint')
    require(public_get('/branches/sprint')['commit']['sha'] == BASE)
    require(public_get('/git/ref/heads/' + RUNNER_BRANCH)['object']['sha'] ==
            os.environ['GITHUB_WORKFLOW_SHA'])
    return BASE


def verify_inputs():
    api_token()
    app, harness, review = roots()
    runner = os.environ.get('GITHUB_SHA', '')
    require(re.fullmatch(r'[0-9a-f]{40}', runner))
    require(os.environ.get('GITHUB_EVENT_NAME') == 'push')
    require(os.environ.get('GITHUB_REF') == 'refs/heads/' + RUNNER_BRANCH)
    require(os.environ.get('GITHUB_RUN_ATTEMPT') == '1')
    event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    require(event.get('created') is True and event.get('deleted') is False)
    require(event.get('forced') is False and event.get('after') == runner)
    require(os.environ.get('GITHUB_REPOSITORY') == REPOSITORY)
    require(os.environ.get('GITHUB_WORKFLOW_SHA') == runner)
    require(os.environ.get('KEEPER_SOURCE_SHA') == SOURCE)
    require(os.environ.get('KEEPER_POD_LOCK_REPAIR') == '0')
    require(os.environ.get('KEEPER_NATIVE_PLATFORM') == 'IOS')
    platform = os.environ['KEEPER_NATIVE_PLATFORM']
    require(os.environ.get('RUNNER_OS') == ('macOS' if platform == 'IOS' else 'Linux'))
    require(os.environ.get('RUNNER_ARCH') == ('ARM64' if platform == 'IOS' else 'X64'))
    for root, sha in ((app, SOURCE), (harness, HARNESS), (review, runner)):
        require(git(root, 'rev-parse', 'HEAD').decode().strip() == sha)
    require(git(review, 'rev-parse', 'HEAD^').decode().strip() == '3535a34109c10b7baba310a41d4a277da359c064')
    require(git(app, 'rev-parse', 'HEAD^{tree}').decode().strip() == SOURCE_TREE)
    require(not git(review, 'status', '--porcelain', '--untracked-files=all'))
    require(not git(harness, 'status', '--porcelain', '--untracked-files=all'))
    require(not git(app, 'diff', '--cached'))
    for name, expected in HARNESS_FILES.items():
        require(digest(harness / '.github/native' / name) == expected)
    runtime_patch_guard(review)
    return current_source()


def stage():
    verify_inputs()
    app, harness, review = roots()
    require(not git(app, 'status', '--porcelain', '--untracked-files=all'))
    target = app / '.github/native'
    require(not target.exists())
    target.mkdir(parents=True)
    for name in HARNESS_FILES:
        shutil.copyfile(harness / '.github/native' / name, target / name)
    for name in PROBE_FILES:
        shutil.copyfile(review / PROPOSAL_PATH / name, target / name)
    apply_runtime_patches(app, review)
    guard()


def check_configuration(app, platform):
    require((app / '.env.ci').read_text() == ENV_CI)
    require(json.loads((app / 'firebase.json').read_text()) == {'react-native': {
        'app_data_collection_default_enabled': False, 'analytics_auto_collection_enabled': False,
        'analytics_collection_deactivated': True, 'messaging_auto_init_enabled': False}})
    if platform == 'IOS':
        for path, bundle in [('ios/GoogleService-Info.plist', 'io.hexawallet.keeper'),
                             ('ios/GoogleServices/dev/GoogleService-Info.plist', 'io.hexawallet.hexakeeper.dev')]:
            require(plistlib.loads((app / path).read_bytes()) == {
                'API_KEY': 'AIzaSy' + '0' * 33, 'GCM_SENDER_ID': '123456789012',
                'PLIST_VERSION': '1', 'BUNDLE_ID': bundle, 'PROJECT_ID': 'keeper-disposable-ci',
                'GOOGLE_APP_ID': '1:123456789012:ios:0000000000000000000000',
                'IS_GCM_ENABLED': False, 'IS_ANALYTICS_ENABLED': False,
                'IS_ADS_ENABLED': False, 'IS_SIGNIN_ENABLED': False})
    else:
        require(json.loads((app / 'android/app/google-services.json').read_text()) == {
            'project_info': {'project_number': '123456789012', 'project_id': 'keeper-disposable-ci'},
            'client': [{'client_info': {'mobilesdk_app_id': '1:123456789012:android:0000000000000000',
                'android_client_info': {'package_name': 'io.hexawallet.keeper.development'}},
                'api_key': [{'current_key': 'AIzaSy' + '0' * 33}]}], 'configuration_version': '1'})


def guard():
    number = verify_inputs()
    app, _, review = roots()
    target = app / '.github/native'
    require({p.name for p in target.iterdir()} == set(HARNESS_FILES) | set(PROBE_FILES))
    for name, expected in STAGED_HARNESS_FILES.items():
        require(digest(target / name) == expected)
    runtime_file_guard(app)
    for name in PROBE_FILES:
        require((target / name).read_bytes() == git(review, 'show', 'HEAD:' + PROPOSAL_PATH + name))
    changed = set(git(app, 'diff', '--name-only', '-z', 'HEAD').decode().strip('\0').split('\0')) - {''}
    platform = os.environ['KEEPER_NATIVE_PLATFORM']
    allowed = {'.env.ci', 'firebase.json'} | ({'ios/GoogleService-Info.plist',
        'ios/GoogleServices/dev/GoogleService-Info.plist'} if platform == 'IOS'
        else {'android/app/google-services.json'})
    require(changed <= allowed | {'package.json'} | set(RUNTIME_FILES))
    before = json.loads(git(app, 'show', 'HEAD:package.json'))
    after = json.loads((app / 'package.json').read_text())
    require({k: v for k, v in before.items() if k not in MAPPING_FIELDS} ==
            {k: v for k, v in after.items() if k not in MAPPING_FIELDS})
    require(not git(app, 'diff', 'HEAD', '--', 'yarn.lock', 'ios/Podfile.lock'))
    metadata = app / 'artifacts/native' / platform.lower() / 'metadata.json'
    if metadata.is_file():
        require(metadata.stat().st_size <= 1024 * 1024)
        recorded = json.loads(metadata.read_text())
        if platform == 'IOS' and 'toolchain' in recorded:
            versions = safe_versions(recorded, platform)
            require(versions['xcode'] == '16.4' and versions['sdk'] == '18.5')
    prepared = metadata.is_file() and 'configuration_overlays' in json.loads(metadata.read_text())
    if changed & CONFIG or prepared:
        check_configuration(app, platform)
    return number


def checked_junit(path):
    require(path.is_file() and path.stat().st_size <= 1024 * 1024)
    cases = list(ET.parse(path).getroot().iter('testcase'))
    require(cases and not any(list(c.iter('failure')) or list(c.iter('error')) or
                             list(c.iter('skipped')) for c in cases))
    return len(cases)


def evidence(metadata, outcomes, junit_count, built_now, platform):
    """Select fixed statuses, numeric counts and hashes; never export raw fields."""
    require(metadata.get('source_sha') == SOURCE and metadata.get('platform') == platform)
    for field, env in [('workflow_sha', 'GITHUB_WORKFLOW_SHA'), ('run_id', 'GITHUB_RUN_ID'),
                       ('run_attempt', 'GITHUB_RUN_ATTEMPT')]:
        require(str(metadata.get(field)) == os.environ.get(env))
    required = {'record', 'prepare', 'build', 'smoke', 'bridge'} | ({'driver'} if platform == 'IOS' else set())
    success = all(outcomes.get(p) == 'success' for p in required)
    success = success and metadata.get('build') == metadata.get('smoke') == 'PASS'
    success = success and metadata.get('installed_artifact_verified') is True
    success = success and metadata.get('device', {}).get('fresh_disposable_state') is True
    success = success and type(junit_count) is int and junit_count > 0
    success = success and metadata.get('smoke_test_cases') == junit_count
    success = success and metadata.get('built_artifact') == built_now and bool(built_now)
    keys = ['executable_sha256', 'bundle_tree_sha256'] if platform == 'IOS' else ['sha256']
    hashes = {k: built_now[k] for k in keys} if built_now else {}
    require(all(re.fullmatch(r'[0-9a-f]{64}', v) for v in hashes.values()))
    return {'scope': 'NATIVE_BRIDGE_PREREQUISITE_ONLY', 'acceptance': 'NOT_ACCEPTED',
            'bootstrap_observation': 'PASS' if success else 'BLOCKED',
            'phases': {p: outcomes.get(p) if outcomes.get(p) in OUTCOMES else 'unknown' for p in PHASES},
            'successful_junit_cases': junit_count, 'artifact_hashes': hashes,
            'hardware': 'NOT RUN', 'release_signing': 'NOT RUN',
            'full_phase_a': 'NOT VERIFIED', 'r5_acceptance': 'NOT VERIFIED'}


def safe_versions(metadata, platform):
    toolchain = metadata.get('toolchain', {})
    patterns = {'node': r'^v([0-9]+\.[0-9]+\.[0-9]+)$',
                'java': r'version "([0-9]+(?:\.[0-9]+)+)"'}
    if platform == 'IOS':
        patterns.update({'xcode': r'^Xcode ([0-9]+\.[0-9]+)', 'sdk': r'^([0-9]+\.[0-9]+)$'})
    else:
        patterns['gradle'] = r'(?m)^Gradle ([0-9]+(?:\.[0-9]+)+)$'
    result = {}
    for name, pattern in patterns.items():
        value = toolchain.get(name, '')
        require(isinstance(value, str))
        match = re.search(pattern, value.strip())
        require(match is not None)
        result[name] = match.group(1)
    if platform == 'ANDROID':
        revision = toolchain.get('emulator', {}).get('Pkg.Revision', '')
        require(isinstance(revision, str) and re.fullmatch(r'[0-9]+(?:\.[0-9]+)+', revision))
        result['emulator'] = revision
    return result


def failure_record(metadata):
    result = {'acceptance': 'NOT_ACCEPTED', 'bootstrap_observation': 'BLOCKED',
              'scope': 'NATIVE_BRIDGE_PREREQUISITE_ONLY', 'failure': 'INCOMPLETE_OR_INVALID_EVIDENCE',
              'source_sha': SOURCE, 'harness_sha': HARNESS, 'base_sha': BASE}
    category = metadata.get('bridge_failure_category')
    if isinstance(category, str) and category in {
            'STORAGE_FAILURE', 'DEVELOPMENT_ONLY', 'IAP_TIMEOUT', 'IAP_STORE_UNAVAILABLE',
            'IAP_INIT_FALSE', 'IAP_END_FALSE', 'IAP_NATIVE_FAILURE', 'IAP_API_MISSING',
            'NATIVE_PROBE_FAILURE'}:
        result['failure'] = category
    return result


def summary():
    result = {'acceptance': 'NOT_ACCEPTED', 'bootstrap_observation': 'BLOCKED',
              'scope': 'NATIVE_BRIDGE_PREREQUISITE_ONLY', 'failure': 'INCOMPLETE_OR_INVALID_EVIDENCE'}
    success = False
    metadata = {}
    try:
        base = guard()
        app, harness, _ = roots()
        platform = os.environ['KEEPER_NATIVE_PLATFORM']
        path = app / 'artifacts/native' / platform.lower() / 'metadata.json'
        require(path.is_file() and path.stat().st_size <= 1024 * 1024)
        metadata = json.loads(path.read_text())
        outcomes = {p: os.environ.get('STEP_' + p.upper(), '') for p in PHASES}
        count = 0
        artifact = {}
        if all(outcomes[p] == 'success' for p in ('build', 'smoke')):
            count = checked_junit(Path(os.environ['RUNNER_TEMP']) / 'keeper-native-private/smoke-junit.xml')
            spec = importlib.util.spec_from_file_location('reviewed_harness', harness / '.github/native/hosted_native.py')
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            module.ROOT = app
            artifact = module.artifact_identity()
        result = evidence(metadata, outcomes, count, artifact, platform)
        probe = metadata.get('bridge_probe', {})
        require(outcomes['bridge'] == 'success' and probe.get('result') == 'PASS')
        require(probe.get('installed_artifact_verified') is True)
        require(probe.get('device', {}).get('fresh_disposable_state') is True)
        bridge_count = checked_junit(Path(os.environ['RUNNER_TEMP']) / 'keeper-native-private/bridge-junit.xml')
        require(bridge_count == probe.get('successful_junit_cases') and bridge_count == 1)
        result['bridge_junit_cases'] = bridge_count
        result['same_binary_storage_reopen'] = 'PASS'
        result['iap_init_end_reinit'] = 'PASS'
        result['prior_release_upgrade'] = 'NOT VERIFIED'
        require(metadata.get('device', {}).get('image'))
        result['device_image_sha256'] = hashlib.sha256(metadata['device']['image'].encode()).hexdigest()
        result['observed_versions'] = safe_versions(metadata, platform)
        result['durable_provenance'] = provenance.select(metadata, platform,
                                                        int(os.environ['GITHUB_RETENTION_DAYS']))
        for phase in ['startup', 'bridge']:
            served = Path(os.environ['RUNNER_TEMP']) / 'keeper-native-private' / (phase + '-served.json')
            require(served.is_file() and served.stat().st_size <= 16384)
            require(json.loads(served.read_text()) == metadata[phase + '_probe']['served_bundles'])
        # Verify durable hashes against files, not metadata assertions alone.
        for row in metadata['configuration_overlays']:
            require(digest(app / row['path']) == row['sha256'])
        mapping = metadata['nodeify_overlay']
        require(digest(app / 'package.json') == mapping['after_sha256'])
        require(hashlib.sha256(git(app, 'show', 'HEAD:package.json')).hexdigest() == mapping['before_sha256'])
        require(hashlib.sha256(git(app, 'diff', 'HEAD', '--', 'package.json')).hexdigest() == mapping['diff_sha256'])
        result['staged_probe_sha256'] = {name: digest(app / '.github/native' / name) for name in PROBE_FILES}
        result['source_file_sha256'] = {name: hashlib.sha256(git(app, 'show', 'HEAD:' + name)).hexdigest()
                                       for name in ['package.json', 'yarn.lock', 'ios/Podfile.lock',
                                                    'ios/hexa_keeper/AppDelegate.mm']}
        result['expected_device'] = 'iPhone16_iOS18.5' if platform == 'IOS' else 'pixel6_API35_googleapis_x86_64'
        result.update({'source_sha': SOURCE, 'source_tree': SOURCE_TREE, 'harness_sha': HARNESS,
                       'runner_sha': os.environ['GITHUB_WORKFLOW_SHA'], 'base_sha': base,
                       'platform': platform, 'metadata_sha256': digest(path)})
        for field in ('GITHUB_RUN_ID', 'GITHUB_RUN_ATTEMPT'):
            require(re.fullmatch(r'[1-9][0-9]*', os.environ.get(field, '')))
            result[field.lower()] = int(os.environ[field])
        success = result['bootstrap_observation'] == 'PASS'
    except Exception:
        result = failure_record(metadata)
    payload = json.dumps(result, sort_keys=True, indent=2)
    require(len(payload.encode()) <= 64 * 1024)
    with Path(os.environ['GITHUB_STEP_SUMMARY']).open('a') as output:
        output.write('```json\n' + payload + '\n```\n')
    require(success)


def main():
    require(len(sys.argv) == 2 and sys.argv[1] in ('stage', 'guard', 'summary'))
    {'stage': stage, 'guard': guard, 'summary': summary}[sys.argv[1]]()


if __name__ == '__main__':
    try:
        main()
    except Exception:
        print('REVIEWED_INPUT_OR_EVIDENCE_CHECK_FAILED', file=sys.stderr)
        sys.exit(1)
