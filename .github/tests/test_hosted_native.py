"""Pure hosted-harness checks: these do not claim native simulator evidence."""

import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock


SPEC = importlib.util.spec_from_file_location(
    'hosted_native', Path(__file__).resolve().parents[1] / 'native' / 'hosted_native.py')
native = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(native)


class HostedNativeHarnessTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.patches = mock.patch.multiple(native, ROOT=self.root, PRIVATE=self.root / 'private',
                                          EVIDENCE=self.root / 'evidence/metadata.json', PLATFORM='ANDROID')
        self.patches.start()
        self.addCleanup(self.patches.stop)
        native.save({'commands': [], 'build': 'NOT RUN', 'smoke': 'NOT RUN'})

    def test_success_records_command_and_duration_without_output(self):
        script = self.root / 'output.py'
        script.write_text('print("private output")')
        result = native.command([sys.executable, str(script)], 'Success', capture=True)
        self.assertEqual(result, 'private output')
        record = native.read()['commands'][0]
        self.assertEqual(record['exit_code'], 0)
        self.assertGreaterEqual(record['duration_seconds'], 0)
        self.assertNotIn('private output', native.EVIDENCE.read_text())

    def test_failure_exposes_only_allowlisted_diagnostic(self):
        script = self.root / 'failure.py'
        script.write_text('print("private payload: lockfile needs to be updated"); raise SystemExit(3)')
        with self.assertRaisesRegex(RuntimeError, 'Manifest and yarn.lock are inconsistent'):
            native.command([sys.executable, str(script)], 'Install')
        record = native.read()['commands'][0]
        self.assertEqual(record['exit_code'], 3)
        self.assertNotIn('private payload', native.EVIDENCE.read_text())

    def test_tool_error_details_are_bounded_and_redacted(self):
        output = 'private payload\nerror: missing module https://example.test/private token=secret\n' \
            + 'Caused by: password=private Bearer private\n' + 'error: detail\n' * 30
        details = native.failure_details(output)
        self.assertEqual(len(details), 20)
        self.assertNotIn('private', '\n'.join(details))
        self.assertIn('token=[REDACTED]', details[0])
        self.assertIn('[URL]', details[0])
        kotlin = '> Task :compile\n' * 40 + 'e: file:///runner/App.kt:1 unresolved reference'
        self.assertEqual(native.failure_details(kotlin), ['e: file:///runner/App.kt:1 unresolved reference'])
        excerpts = ''.join(' %s | +(NSDictionary*)statWithError:(NSError**)error:\n' % line
                           for line in range(30))
        self.assertEqual(native.failure_details(excerpts + 'error: actual compiler failure'),
                         ['error: actual compiler failure'])

    def test_timeout_records_failure_and_terminates_process(self):
        with self.assertRaisesRegex(RuntimeError, 'exit 124'):
            native.command([sys.executable, '-c', 'import time; time.sleep(30)'], 'Timeout', timeout=0.05)
        self.assertEqual(native.read()['commands'][0]['exit_code'], 124)

    def test_startup_diagnostics_keep_fixed_failed_steps_and_redact_error_messages(self):
        maestro = '\n'.join([
            'Assert that "Create a passcode" is visible... FAILED',
            'Tap on id: key_2... FAILED',
            'Tap on "private recovery phrase"... FAILED',
            'UI hierarchy: private state',
            'Assertion is false: "Create a passcode" is visible; UI hierarchy: PRIVATE_SENTINEL',
            'Element not found: key_1; private arbitrary suffix',
        ])
        messages = native.maestro_failure_details(maestro)
        self.assertTrue(any('Create a passcode' in message for message in messages))
        self.assertIn('Maestro tap key_2 FAILED', messages)
        self.assertNotIn('private', '\n'.join(messages))
        self.assertNotIn('PRIVATE_SENTINEL', '\n'.join(messages))
        self.assertNotIn('hierarchy', '\n'.join(messages))
        self.assertIn('Maestro assertion failed: Create a passcode', messages)
        self.assertIn('Maestro element not found: key_1', messages)
        metro = native.metro_startup_errors(' BUNDLE index.js\n ERROR Error: Unable to resolve module token=private https://example.test/private; View hierarchy: PRIVATE_SENTINEL')
        self.assertEqual(len(metro), 1)
        self.assertNotIn('private', metro[0])
        self.assertNotIn('PRIVATE_SENTINEL', metro[0])
        native_errors = native.android_startup_errors('\n'.join([
            'E/AndroidRuntime( 123): FATAL EXCEPTION: main; credentials: PRIVATE_SENTINEL',
            'E/ReactNativeJS( 123): TypeError: Cannot load module token=private',
            'E/OtherApp( 124): Error: private unrelated data',
            'E/ReactNativeJS( 123):     at unneeded stack frame',
        ]))
        self.assertEqual(len(native_errors), 2)
        self.assertNotIn('private', '\n'.join(native_errors))
        self.assertNotIn('PRIVATE_SENTINEL', '\n'.join(native_errors))

    def test_junit_failure_collection_omits_hierarchy_and_preserves_failed_result(self):
        native.PRIVATE.mkdir()
        native.save({'commands': [], 'build': 'PASS', 'smoke': 'FAIL'})
        (native.PRIVATE / 'metro.log').write_text('No bundler error\n')
        report = native.PRIVATE / 'smoke-junit.xml'
        report.write_text('<testsuites><testsuite><testcase status="ERROR"><failure>'
                          'Assertion is false: Create a passcode is visible\nUI hierarchy: private data'
                          '</failure></testcase></testsuite></testsuites>')
        hierarchy = native.PRIVATE / 'maestro-output/2026-10-17_092233/Disposable startup and passcode input/screen-hierarchy'
        hierarchy.mkdir(parents=True)
        (hierarchy / 'step-002-assertCondition-Create_a_passcode.json').write_text(json.dumps({
            'attributes': {'accessibilityText': 'PRIVATE_SENTINEL', 'resource-id': 'redbox-error'},
            'children': [{'attributes': {'accessibilityText': 'No script URL provided. PRIVATE_SENTINEL'}}]}))
        native.record_startup_failure(report, None)
        data = native.read()
        self.assertEqual(data['smoke'], 'FAIL')
        self.assertEqual(data['startup_diagnostics']['maestro']['testcase_statuses'], ['ERROR'])
        self.assertNotIn('private data', native.EVIDENCE.read_text())
        self.assertNotIn('PRIVATE_SENTINEL', native.EVIDENCE.read_text())
        self.assertTrue(data['startup_diagnostics']['hierarchy_signals']['RNredbox'])
        self.assertTrue(data['startup_diagnostics']['hierarchy_signals']['noScriptURL'])
        self.assertTrue(data['startup_diagnostics']['maestro']['testcase_failures'])

    def test_private_hierarchy_exports_only_fixed_signals_from_standalone_tree_nodes(self):
        hierarchy = self.root / 'maestro-output/2026-10-17_092233/Disposable startup and passcode input/screen-hierarchy'
        hierarchy.mkdir(parents=True)
        (hierarchy / 'step-002-assertCondition-Create_a_passcode.json').write_text(json.dumps({
            'attributes': {'accessibilityText': 'Create a passcode', 'value': 'PRIVATE_SENTINEL'},
            'children': [
                {'attributes': {'accessibilityText': 'Confirm your passcode'}},
                {'attributes': {'resource-id': 'io.hexawallet.keeper.development:id/rn_redbox_stack',
                                'text': 'Could not connect to development server. PRIVATE_SENTINEL'}},
                {'attributes': {'title': 'Unable to load script. PRIVATE_SENTINEL'}},
                {'attributes': {'text': 'SpringBoard PRIVATE_SENTINEL'}, 'children': None},
            ]}))
        # Other JSON files are not hierarchy snapshots and must not be parsed.
        (hierarchy.parent / 'commands.json').write_text('{ malformed PRIVATE_SENTINEL')
        signals = native.startup_hierarchy_signals(self.root / 'maestro-output')
        self.assertEqual(signals, {'createPIN': True, 'confirmPIN': True, 'RNredbox': True,
                                  'noScriptURL': False, 'developmentServerError': True,
                                  'unableLoadScript': True, 'snapshot_count': 1, 'parse_error_types': []})
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(signals))
        self.assertNotIn('SpringBoard', json.dumps(signals))

    def test_private_hierarchy_bounds_bytes_and_nodes_and_records_only_parse_error_classes(self):
        hierarchy = self.root / 'maestro-output/screen-hierarchy'
        hierarchy.mkdir(parents=True)
        (hierarchy / 'step-001-malformed.json').write_text('{ PRIVATE_SENTINEL')
        (hierarchy / 'step-002-oversize.json').write_bytes(b'PRIVATE_SENTINEL' * (1024 * 1024 // 8))
        (hierarchy / 'step-003-too-many-nodes.json').write_text(json.dumps({
            'attributes': {'accessibilityText': 'Create a passcode'}, 'children': [{}] * 10000}))
        signals = native.startup_hierarchy_signals(self.root / 'maestro-output')
        self.assertEqual(signals['snapshot_count'], 3)
        self.assertEqual(set(signals['parse_error_types']), {'JSONDecodeError', 'ValueError'})
        self.assertFalse(signals['createPIN'])
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(signals))

    def test_ios_startup_errors_restrict_process_and_redact_first_error_line(self):
        payload = '\n'.join([
            'Filtering the log data using the process predicate',
            'Timestamp               Ty Process[PID:TID]',
            '2026-10-17 09:22:33.123 E  hexa_keeper_dev[123:abc] [com.facebook.react:javascript] NSException: module failed token=private; UI hierarchy: PRIVATE_SENTINEL',
            'private stack continuation',
            '2026-10-17 09:22:34.123 E  OtherApp[124:def] Error: hexa_keeper_dev private unrelated application',
            '2026-10-17 09:22:35.123 Df hexa_keeper_dev[123:abc] normal startup message',
            '2026-10-17 09:22:36.123 Df hexa_keeper_dev[123:abc] ReferenceError: missing startup module',
            'PRIVATE_SENTINEL multiline continuation',
            '2026-10-17 09:22:37.123+0000 Df hexa_keeper_dev[123:abc] NSException: failed native startup',
            'PRIVATE_SENTINEL multiline continuation',
            'Error: hexa_keeper_dev[123:abc] missing timestamp must not be accepted',
        ])
        diagnostics = native.ios_startup_diagnostics(payload, 'hexa_keeper_dev')
        errors = diagnostics['errors']
        self.assertEqual(diagnostics['matching_process_records'], 4)
        self.assertEqual(len(errors), 3)
        self.assertIn('NSException: module failed', errors[0])
        self.assertIn('ReferenceError: missing startup module', errors[1])
        self.assertIn('NSException: failed native startup', errors[2])
        self.assertNotIn('private', '\n'.join(errors))
        self.assertNotIn('PRIVATE_SENTINEL', '\n'.join(errors))
        self.assertEqual(native.ios_startup_diagnostics('no compact records', 'hexa_keeper_dev')['matching_process_records'], 0)

    def test_ios_collector_keeps_launch_prefix_when_log_is_truncated_and_preserves_failure(self):
        native.PRIVATE.mkdir()
        native.save({'commands': [], 'smoke': 'FAIL', 'built_artifact': {'executable': 'hexa_keeper_dev'}})
        (native.PRIVATE / 'metro.log').write_text('\x1b[32m BUNDLE \x1b[0m private-path/index.js\n'
                                                   ' BUNDLE private-path/index.js\n PREBUNDLE private-path/index.js\n')

        def compact_log(args, stdout, **kwargs):
            self.assertEqual(args[args.index('--style') + 1], 'compact')
            self.assertEqual(args[args.index('--last') + 1], '10m')
            stdout.write(b'2026-10-17 09:22:33.123 Df hexa_keeper_dev[123:abc] ReferenceError: launch module failed token=private\n')
            stdout.write(b'2026-10-17 09:22:34.123 E OtherApp[124:def] Error: private unrelated data\n')
            # The first MiB ends within a continuation, not a complete record.
            stdout.write(b'PRIVATE_SENTINEL' * (1024 * 1024 // 8))
            stdout.write(b'\n2026-10-17 09:30:33.123 E hexa_keeper_dev[123:abc] Error: tail must not replace launch evidence\n')
            return subprocess.CompletedProcess(args, 0)

        with mock.patch.object(native, 'PLATFORM', 'IOS'), \
                mock.patch.object(subprocess, 'run', side_effect=compact_log):
            native.record_startup_failure(native.PRIVATE / 'missing-report.xml', 'owned-simulator')
        data = native.read()
        self.assertEqual(data['smoke'], 'FAIL')
        diagnostics = data['startup_diagnostics']['ios_errors']
        self.assertTrue(diagnostics['input_truncated'])
        self.assertEqual(diagnostics['matching_process_records'], 1)
        self.assertEqual(diagnostics['errors'], ['error: iOS ReferenceError: launch module failed token=[REDACTED]'])
        self.assertEqual(data['startup_diagnostics']['metro_progress'],
                         {'bundle_marker_observed': True, 'bundle_marker_count': 2, 'prebundle_marker_count': 1})
        self.assertNotIn('private unrelated', native.EVIDENCE.read_text())
        self.assertNotIn('PRIVATE_SENTINEL', native.EVIDENCE.read_text())
        self.assertNotIn('private-path', native.EVIDENCE.read_text())

    def test_ios_warmup_keeps_body_private_and_does_not_supply_smoke_evidence(self):
        native.PRIVATE.mkdir()
        body = b'disposable development bundle PRIVATE_SENTINEL'

        def warmup(args, *unused, **kwargs):
            self.assertEqual(args[-1], 'http://127.0.0.1:8081/index.bundle?platform=ios&dev=true&minify=false')
            Path(args[args.index('--output') + 1]).write_bytes(body)
            return '200'

        with mock.patch.object(native, 'command', side_effect=warmup):
            native.warm_ios_metro_bundle()
        data = native.read()
        self.assertEqual(data['smoke'], 'NOT RUN')
        self.assertEqual(data['metro_warmup']['result'], 'PASS')
        self.assertEqual(data['metro_warmup']['http_status'], 200)
        self.assertEqual(data['metro_warmup']['bytes'], len(body))
        self.assertEqual(data['metro_warmup']['sha256'], hashlib.sha256(body).hexdigest())
        self.assertNotIn('PRIVATE_SENTINEL', native.EVIDENCE.read_text())
        with mock.patch.object(native, 'command', side_effect=RuntimeError('HTTP error')), \
                self.assertRaisesRegex(RuntimeError, 'HTTP error'):
            native.warm_ios_metro_bundle()
        self.assertEqual(native.read()['metro_warmup']['result'], 'FAIL')
        self.assertEqual(native.read()['smoke'], 'NOT RUN')

    def test_ios_collector_rejects_unsafe_executable_without_running_command(self):
        native.PRIVATE.mkdir()
        native.save({'commands': [], 'smoke': 'FAIL', 'built_artifact': {'executable': '../unsafe"'}})
        (native.PRIVATE / 'metro.log').write_text('')
        with mock.patch.object(native, 'PLATFORM', 'IOS'), mock.patch.object(subprocess, 'run') as run:
            native.record_startup_failure(native.PRIVATE / 'missing-report.xml', 'owned-simulator')
        run.assert_not_called()
        self.assertEqual(native.read()['smoke'], 'FAIL')
        self.assertIn({'stage': 'ios_errors', 'error_type': 'ValueError'},
                      native.read()['startup_diagnostics']['collection_errors'])

    def test_diagnostic_failure_never_replaces_original_smoke_failure(self):
        native.PRIVATE.mkdir()
        identity = {'sha256': 'test artifact'}
        native.save({'commands': [], 'build': 'PASS', 'smoke': 'NOT RUN', 'built_artifact': identity})
        metro = mock.Mock()
        metro.poll.return_value = 1
        with mock.patch.object(native, 'artifact_identity', return_value=identity), \
                mock.patch.object(subprocess, 'Popen', return_value=metro), \
                mock.patch.object(native, 'record_startup_failure', side_effect=RuntimeError('collector failed')), \
                self.assertRaisesRegex(RuntimeError, 'Metro exited before the disposable smoke'):
            native.run_phase('smoke')
        self.assertEqual(native.read()['smoke'], 'FAIL')
        self.assertEqual(native.read()['startup_diagnostics']['collection_errors'],
                         [{'stage': 'collector', 'error_type': 'RuntimeError'}])

    def test_missing_executable_is_recorded(self):
        with self.assertRaisesRegex(RuntimeError, 'exit 127'):
            native.command([str(self.root / 'missing-command')], 'Missing')
        self.assertEqual(native.read()['commands'][0]['exit_code'], 127)

    def test_record_rejects_wrong_source_sha_before_collecting_evidence(self):
        before = native.EVIDENCE.read_bytes()
        with mock.patch.dict(native.os.environ, {'KEEPER_SOURCE_SHA': 'b' * 40}), \
                mock.patch.object(subprocess, 'check_output', return_value='a' * 40 + '\n'), \
                self.assertRaisesRegex(RuntimeError, 'exact requested PR head'):
            native.record()
        self.assertEqual(native.EVIDENCE.read_bytes(), before)

    def test_android_fixtures_use_only_dummy_project_and_loopback_services(self):
        (self.root / 'android/app').mkdir(parents=True)
        native.fixtures()
        environment = (self.root / '.env.ci').read_text()
        self.assertIn('ENVIRONMENT=DEVELOPMENT', environment)
        for line in environment.splitlines():
            if 'https://' in line:
                self.assertIn('127.0.0.1:9', line)
        firebase = json.loads((self.root / 'android/app/google-services.json').read_text())
        self.assertEqual(firebase['project_info']['project_id'], 'keeper-disposable-ci')
        settings = json.loads((self.root / 'firebase.json').read_text())['react-native']
        self.assertFalse(settings['messaging_auto_init_enabled'])
        self.assertFalse(settings['app_data_collection_default_enabled'])
        for overlay in native.read()['configuration_overlays']:
            self.assertEqual(overlay['sha256'], hashlib.sha256((self.root / overlay['path']).read_bytes()).hexdigest())
        self.assertEqual(len(native.read()['configuration_overlays']), 3)

    def test_ios_fixtures_cover_both_tracked_firebase_files(self):
        (self.root / 'ios/GoogleServices/dev').mkdir(parents=True)
        with mock.patch.object(native, 'PLATFORM', 'IOS'):
            native.fixtures()
        paths = {overlay['path'] for overlay in native.read()['configuration_overlays']}
        self.assertEqual(paths, {'.env.ci', 'firebase.json', 'ios/GoogleService-Info.plist',
                                 'ios/GoogleServices/dev/GoogleService-Info.plist'})

    def test_emulator_revision_comes_from_sdk_metadata_without_executing_binary(self):
        emulator = self.root / 'emulator'
        emulator.mkdir()
        (emulator / 'source.properties').write_text('Pkg.Revision = 36.6.11\nUnrelated = ignored\n')
        with mock.patch.object(subprocess, 'Popen') as popen:
            self.assertEqual(native.android_sdk_metadata(self.root, 'emulator'), {'Pkg.Revision': '36.6.11'})
        popen.assert_not_called()

    def test_emulator_metadata_must_exist_and_contain_revision(self):
        with self.assertRaises(FileNotFoundError):
            native.android_sdk_metadata(self.root, 'emulator')
        emulator = self.root / 'emulator'
        emulator.mkdir()
        for text in ['Pkg.Desc = Android Emulator\n', 'Pkg.Revision =  \n']:
            with self.subTest(properties=text):
                (emulator / 'source.properties').write_text(text)
                with self.assertRaisesRegex(RuntimeError, 'no Pkg.Revision metadata'):
                    native.android_sdk_metadata(self.root, 'emulator')

    def test_smoke_requires_successful_build(self):
        with mock.patch.object(subprocess, 'Popen') as popen, \
                self.assertRaisesRegex(RuntimeError, 'successful native build'):
            native.smoke()
        popen.assert_not_called()

    def test_ios_build_rejects_unsupported_architecture_before_invoking_xcode(self):
        with mock.patch.object(native, 'PLATFORM', 'IOS'), \
                mock.patch.object(native.platform, 'machine', return_value='riscv64'), \
                mock.patch.object(native, 'command') as command, \
                self.assertRaisesRegex(RuntimeError, 'Unsupported hosted iOS simulator architecture'):
            native.build()
        command.assert_not_called()

    def test_ios_build_uses_only_the_supported_host_simulator_architecture(self):
        for architecture in ['arm64', 'x86_64']:
            with self.subTest(architecture=architecture), \
                    mock.patch.object(native, 'PLATFORM', 'IOS'), \
                    mock.patch.object(native.platform, 'machine', return_value=architecture), \
                    mock.patch.object(native, 'artifact_identity', return_value={'sha256': 'test artifact'}), \
                    mock.patch.object(native, 'command') as command:
                native.build()
                arguments = command.call_args.args[0]
                self.assertIn('ARCHS=' + architecture, arguments)
                self.assertIn('ONLY_ACTIVE_ARCH=YES', arguments)
                self.assertIn('CODE_SIGNING_ALLOWED=NO', arguments)
                self.assertEqual(command.call_args.kwargs['timeout'], 2400)
                self.assertEqual(native.read()['toolchain']['ios_simulator_architecture'], architecture)

    def test_artifact_hash_detects_changed_apk_before_smoke(self):
        apk = self.root / 'android/app/build/outputs/apk/development/debug/app-development-debug.apk'
        apk.parent.mkdir(parents=True)
        apk.write_bytes(b'first disposable artifact')
        identity = native.artifact_identity()
        self.assertEqual(identity['sha256'], hashlib.sha256(apk.read_bytes()).hexdigest())
        native.save({'commands': [], 'build': 'PASS', 'smoke': 'NOT RUN', 'built_artifact': identity})
        apk.write_bytes(b'replacement artifact')
        with mock.patch.object(subprocess, 'Popen') as popen, \
                self.assertRaisesRegex(RuntimeError, 'artifact changed'):
            native.smoke()
        popen.assert_not_called()

    def test_failed_build_and_smoke_are_never_recorded_as_pass(self):
        for phase in ['build', 'smoke']:
            with self.subTest(phase=phase), \
                    mock.patch.object(native, phase, side_effect=RuntimeError('failure')), \
                    self.assertRaisesRegex(RuntimeError, 'failure'):
                native.run_phase(phase)
            self.assertEqual(native.read()[phase], 'FAIL')
            self.assertEqual(native.read()['failed_phase'], phase)


if __name__ == '__main__':
    unittest.main()
