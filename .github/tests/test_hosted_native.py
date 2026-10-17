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

    def test_timeout_records_failure_and_terminates_process(self):
        with self.assertRaisesRegex(RuntimeError, 'exit 124'):
            native.command([sys.executable, '-c', 'import time; time.sleep(30)'], 'Timeout', timeout=0.05)
        self.assertEqual(native.read()['commands'][0]['exit_code'], 124)

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

    def test_smoke_requires_successful_build(self):
        with mock.patch.object(subprocess, 'Popen') as popen, \
                self.assertRaisesRegex(RuntimeError, 'successful native build'):
            native.smoke()
        popen.assert_not_called()

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
