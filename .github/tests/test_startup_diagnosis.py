import importlib.util
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock

spec = importlib.util.spec_from_file_location('startup_diagnosis_fixture', Path(__file__).resolve().parents[1] / 'native/startup_diagnosis.py')
diagnosis = importlib.util.module_from_spec(spec)
spec.loader.exec_module(diagnosis)


class StartupDiagnosisTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.native = SimpleNamespace(PRIVATE=self.root, PLATFORM='ANDROID')

    def test_rejects_physical_device_and_closes_failed_capture(self):
        with self.assertRaises(ValueError):
            diagnosis.start(self.native, 'physical-PRIVATE_SENTINEL')
        with mock.patch.object(diagnosis.subprocess, 'Popen', side_effect=OSError('PRIVATE_SENTINEL')):
            with self.assertRaises(OSError):
                diagnosis.start(self.native, 'emulator-5554')
        diagnosis.stop(None)

    def test_owned_capture_stops_only_its_process(self):
        process = mock.Mock()
        process.poll.return_value = None
        with mock.patch.object(diagnosis.subprocess, 'Popen', return_value=process) as popen:
            handle = diagnosis.start(self.native, 'emulator-5554')
        self.assertIn('ReactHost:V', popen.call_args.args[0])
        self.assertIn('-T', popen.call_args.args[0])
        diagnosis.stop(handle)
        process.terminate.assert_called_once_with()
        process.wait.assert_called_once_with(timeout=3)
        self.assertTrue(handle.output.closed)

    def test_regenerates_only_allowlisted_metadata(self):
        (self.root / 'startup-logcat.log').write_text('E/ReactHost(123): TypeError PRIVATE_SENTINEL\nANR in ' + diagnosis.APP)
        observations = [
            {'time_ms': 100, 'kind': 'ERROR', 'event': 'bundling_error', 'error_type': 'PRIVATE_SENTINEL', 'categories': ['TYPE', 'PRIVATE_SENTINEL'] * 100, 'raw': 'PRIVATE_SENTINEL'},
            {'time_ms': 200, 'kind': 'REQUEST', 'request': 'ENTRY_BUNDLE', 'options': {'lazy': True, 'app': 'PRIVATE_SENTINEL', 'platform': 'android', 'unknown': 'PRIVATE_SENTINEL'}},
            {'time_ms': 200, 'kind': 'RESPONSE', 'request': 'ENTRY_BUNDLE', 'outer_http_status': 500, 'url': 'PRIVATE_SENTINEL'},
            {'time_ms': 200, 'kind': 'PRIVATE_SENTINEL'},
        ]
        (self.root / 'startup-observer.jsonl').write_text('\n'.join(json.dumps(row) for row in observations))
        directory = self.root / 'maestro-output' / 'screen-hierarchy'
        directory.mkdir(parents=True)
        values = ['Unable to check your passcode. Please try again.', 'Retry', 'Dismiss', 'Minimize', 'PRIVATE_SENTINEL']
        (directory / 'step-1.json').write_text(json.dumps({'children': [{'attributes': {'text': value}} for value in values]}))
        def subprocess_result(args, **kwargs):
            if 'pidof' in args:
                return SimpleNamespace(returncode=0, stdout=b'123\n')
            kwargs['stdout'].write(('mResumedActivity: ActivityRecord{abc u0 ' + diagnosis.APP + '/.MainActivity t42} PRIVATE_SENTINEL').encode())
            return SimpleNamespace(returncode=0)
        with mock.patch.object(diagnosis.subprocess, 'run', side_effect=subprocess_result):
            facts = diagnosis.collect(self.native, 'emulator-5554', SimpleNamespace(started_ms=150))
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(facts))
        self.assertEqual(facts['metro']['rows'][0]['categories'], ['TYPE'])
        self.assertEqual(facts['metro']['rows'][0]['stage'], 'BEFORE_APP')
        self.assertEqual(facts['metro']['rows'][1]['stage'], 'APP_WINDOW')
        self.assertEqual(facts['metro']['invalid_rows'], 1)
        self.assertTrue(facts['hierarchy']['credential_error'])
        self.assertTrue(facts['hierarchy']['logbox_controls'])
        self.assertTrue(facts['foreground']['own_app_resumed'])
        self.assertTrue(facts['process']['alive'])
        self.assertNotIn('coverage', facts['metro'], 'Android receipt schema stays unchanged')
        self.assertNotIn('producer_row_limit', facts['metro'])

    def test_failed_malformed_foreign_and_truncated_queries_do_not_claim_absence(self):
        for code, pid, foreground, oversized in [
            (1, b'', 'permission denied PRIVATE_SENTINEL', False),
            (0, b'PRIVATE_SENTINEL', 'malformed PRIVATE_SENTINEL', False),
            (0, b'', 'mResumedActivity: ActivityRecord{x u0 ' + diagnosis.APP + '.foreign/.MainActivity t1}', False),
            (0, b'', 'mResumedActivity: ActivityRecord{x u0 foreign/.MainActivity t1} ' + diagnosis.APP + '/.MainActivity', False),
            (0, b'123\n', 'mResumedActivity: ActivityRecord{x u0 ' + diagnosis.APP + '/.MainActivity t1}', True),
        ]:
            with self.subTest(code=code, oversized=oversized):
                def run(args, **kwargs):
                    if 'pidof' in args:
                        return SimpleNamespace(returncode=code, stdout=pid)
                    kwargs['stdout'].write((foreground + ('x' * (1024 * 1024 + 1) if oversized else '')).encode())
                    return SimpleNamespace(returncode=code)
                with mock.patch.object(diagnosis.subprocess, 'run', side_effect=run):
                    facts = diagnosis.collect(self.native, 'emulator-5554')
                self.assertIsNone(facts['foreground']['own_app_resumed'])
                if not oversized:
                    self.assertIsNone(facts['process']['alive'])
                self.assertNotIn('PRIVATE_SENTINEL', json.dumps(facts))

    def test_private_size_bounds_and_symlink_rejection(self):
        path = self.root / 'large.log'
        path.write_bytes(b'a' * (1024 * 1024 + 1))
        payload, truncated = diagnosis._read(self.native, path)
        self.assertTrue(truncated)
        self.assertLessEqual(len(payload), 1024 * 1024 + 1)
        link = self.root / 'link.log'
        link.symlink_to(path)
        with self.assertRaises(ValueError):
            diagnosis._read(self.native, link)
        small = self.root / 'small.json'
        small.write_text(json.dumps({'padding': 'x' * (600 * 1024)}))
        payload, truncated = diagnosis._read(self.native, small)
        self.assertFalse(truncated)
        self.assertEqual(len(json.loads(payload)['padding']), 600 * 1024)

    def test_ios_timestamp_only_start_collects_metro_on_success_without_native_commands(self):
        native = SimpleNamespace(PRIVATE=self.root, PLATFORM='IOS')
        device = '12345678-1234-1234-1234-123456789ABC'
        rows = [
            {'time_ms': 149, 'kind': 'BUILD', 'event': 'bundle_build_done'},
            {'time_ms': 150, 'kind': 'REQUEST', 'request': 'ENTRY_BUNDLE',
             'options': {'platform': 'ios', 'app': 'EXPECTED', 'private': 'PRIVATE_SENTINEL'}},
            {'time_ms': 151, 'kind': 'RESPONSE', 'request': 'ENTRY_BUNDLE', 'outer_http_status': 200},
        ]
        (self.root / 'startup-observer.jsonl').write_text('\n'.join(json.dumps(row) for row in rows))
        with mock.patch.object(diagnosis.time, 'time', return_value=0.150), \
                mock.patch.object(diagnosis.subprocess, 'Popen') as popen, \
                mock.patch.object(diagnosis.subprocess, 'run') as run:
            handle = diagnosis.start(native, device)
            facts = diagnosis.collect(native, device, handle)
            diagnosis.stop(handle)
        self.assertEqual(handle.started_ms, 150)
        self.assertIsNone(handle.process)
        self.assertIsNone(handle.output)
        popen.assert_not_called()
        run.assert_not_called()
        self.assertEqual([row['stage'] for row in facts['metro']['rows']],
                         ['BEFORE_APP', 'APP_WINDOW', 'APP_WINDOW'])
        self.assertEqual(facts['metro']['rows'][-1]['outer_http_status'], 200)
        self.assertEqual(facts['metro']['observation_state'], 'ROWS_OBSERVED')
        self.assertEqual(facts['metro']['coverage'], 'BOUNDED_INPUT_ONLY')
        self.assertEqual(facts['metro']['valid_rows_in_scanned_input'], 3)
        self.assertEqual(facts['metro']['exported_rows'], 3)
        self.assertEqual(facts['process']['state'], 'UNKNOWN')
        self.assertEqual(facts['hierarchy']['observation_state'], 'UNKNOWN')
        self.assertIsNone(facts['hierarchy']['login'])
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(facts))

    def test_ios_missing_or_malformed_observation_does_not_invent_absence_or_app_stage(self):
        native = SimpleNamespace(PRIVATE=self.root, PLATFORM='IOS')
        device = '12345678-1234-1234-1234-123456789ABC'
        facts = diagnosis.collect(native, device)
        self.assertEqual(facts['metro']['observation_state'], 'UNKNOWN')
        self.assertEqual(facts['hierarchy']['observation_state'], 'UNKNOWN')
        self.assertIn('metro', facts['collection_errors'])
        (self.root / 'startup-observer.jsonl').write_text(json.dumps(
            {'time_ms': 150, 'kind': 'REQUEST', 'request': 'ENTRY_BUNDLE', 'options': {'platform': 'ios'}}))
        folder = self.root / 'maestro-output' / 'screen-hierarchy'
        folder.mkdir(parents=True)
        (folder / 'step-1.json').write_text('{PRIVATE_SENTINEL')
        facts = diagnosis.collect(native, device)
        self.assertEqual(facts['metro']['rows'][0]['stage'], 'UNKNOWN')
        self.assertEqual(facts['hierarchy']['observation_state'], 'UNKNOWN')
        self.assertIsNone(facts['hierarchy']['credential_error'])
        self.assertIn('hierarchy', facts['collection_errors'])
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(facts))
        for invalid in ['booted', 'emulator-5554', 'physical-PRIVATE_SENTINEL']:
            with self.assertRaises(ValueError):
                diagnosis.start(native, invalid)

    def test_ios_public_login_and_modern_logbox_text_is_presence_only_and_fixed(self):
        native = SimpleNamespace(PRIVATE=self.root, PLATFORM='IOS')
        folder = self.root / 'maestro-output' / 'screen-hierarchy'
        folder.mkdir(parents=True)
        path = folder / 'step-1.json'
        def snapshot(values):
            path.write_text(json.dumps({'children': [
                {'attributes': {'accessibilityText': value}} for value in values]}))
            return diagnosis.hierarchy(native, folder.parent)
        public = ['Enter your passcode', 'Welcome Back',
                  'Unable to check your passcode. Please try again.', 'Retry',
                  'Uncaught Error', 'Console Warning', 'Failed to compile',
                  'This error cannot be dismissed.', 'Dismiss', 'Minimize',
                  'Log 2 of 11', 'please wait', 'PRIVATE_SENTINEL']
        facts = snapshot(public)
        for name in ['login', 'welcome_back', 'credential_error', 'retry', 'loading',
                     'logbox_error_header', 'logbox_warning_header', 'logbox_syntax_footer',
                     'logbox_controls', 'logbox_counter']:
            self.assertTrue(facts[name], name)
        self.assertFalse(facts['redbox_resource'], 'modern text need not expose native IDs')
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(facts))
        facts = snapshot(['Retry', 'PRIVATE_SENTINEL Enter your passcode', 'Log 0 of 3'])
        self.assertTrue(facts['retry'])
        for name in ['login', 'credential_error', 'loading', 'logbox_controls', 'logbox_counter']:
            self.assertFalse(facts[name], name)

    def test_ios_incomplete_or_excess_hierarchy_stays_unknown(self):
        native = SimpleNamespace(PRIVATE=self.root, PLATFORM='IOS')
        device = '12345678-1234-1234-1234-123456789ABC'
        folder = self.root / 'maestro-output' / 'screen-hierarchy'
        folder.mkdir(parents=True)
        path = folder / 'step-1.json'
        path.write_bytes(b'PRIVATE_SENTINEL' + b'x' * (1024 * 1024 + 1))
        facts = diagnosis.collect(native, device)
        self.assertEqual(facts['hierarchy']['observation_state'], 'UNKNOWN')
        self.assertIsNone(facts['hierarchy']['login'])
        for index in range(1, 10):
            (folder / ('step-%d.json' % index)).write_text('{}')
        facts = diagnosis.collect(native, device)
        self.assertEqual(facts['hierarchy']['observation_state'], 'UNKNOWN')
        self.assertIsNone(facts['hierarchy']['logbox_error_header'])
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(facts))

    def test_ios_malformed_category_shapes_are_invalid_not_substring_or_key_matches(self):
        native = SimpleNamespace(PRIVATE=self.root, PLATFORM='IOS')
        device = '12345678-1234-1234-1234-123456789ABC'
        invalid = ['PRIVATE_SENTINELTYPE', {'TYPE': 'PRIVATE_SENTINEL'}, None, True, [True], [['TYPE']]]
        rows = [{'time_ms': 150, 'kind': 'ERROR', 'event': 'bundling_error',
                 'categories': value} for value in invalid]
        rows.append({'time_ms': 150, 'kind': 'ERROR', 'event': 'bundling_error',
                     'categories': ['TYPE', 'PRIVATE_SENTINEL']})
        (self.root / 'startup-observer.jsonl').write_text('\n'.join(json.dumps(row) for row in rows))
        facts = diagnosis.collect(native, device)
        self.assertEqual(facts['metro']['invalid_rows'], len(invalid))
        self.assertEqual(len(facts['metro']['rows']), 1)
        self.assertEqual(facts['metro']['rows'][0]['categories'], ['TYPE'])
        self.assertEqual(facts['metro']['valid_rows_in_scanned_input'], 1)
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(facts))

    def test_ios_row_caps_expose_bounded_counts_and_conservative_coverage(self):
        native = SimpleNamespace(PRIVATE=self.root, PLATFORM='IOS')
        device = '12345678-1234-1234-1234-123456789ABC'
        row = {'time_ms': 150, 'kind': 'BUILD', 'event': 'bundle_build_done'}
        for count in [511, 512, 513, 1025]:
            with self.subTest(count=count):
                (self.root / 'startup-observer.jsonl').write_text('\n'.join(json.dumps(row) for _ in range(count)))
                facts = diagnosis.collect(native, device)['metro']
                self.assertEqual((facts['producer_row_limit'], facts['export_row_limit'], facts['line_scan_limit']),
                                 (512, 512, 1024))
                self.assertEqual(facts['valid_rows_in_scanned_input'], min(count, 1024))
                self.assertEqual(facts['exported_rows'], min(count, 512))
                self.assertEqual(len(facts['rows']), min(count, 512))
                self.assertEqual(facts['producer_limit_may_be_reached'], count >= 512)
                self.assertEqual(facts['export_truncated'], count > 512)
                self.assertEqual(facts['line_scan_truncated'], count > 1024)
                self.assertEqual(facts['coverage'], 'BOUNDED_INPUT_ONLY' if count < 512 else 'PARTIAL_OR_CAPPED')

    def test_ios_supplied_falsey_nonobject_attributes_and_nonlist_children_stay_unknown(self):
        native = SimpleNamespace(PRIVATE=self.root, PLATFORM='IOS')
        device = '12345678-1234-1234-1234-123456789ABC'
        folder = self.root / 'maestro-output' / 'screen-hierarchy'
        folder.mkdir(parents=True)
        for field, values in [('attributes', [[], None, False, 0, '']),
                              ('children', [{}, None, False, 0, ''])]:
            for value in values:
                with self.subTest(field=field, value=value):
                    (folder / 'step-1.json').write_text(json.dumps({field: value}))
                    facts = diagnosis.collect(native, device)
                    self.assertEqual(facts['hierarchy']['observation_state'], 'UNKNOWN')
                    self.assertIsNone(facts['hierarchy']['credential_error'])
                    self.assertIn('hierarchy', facts['collection_errors'])


if __name__ == '__main__':
    unittest.main()
