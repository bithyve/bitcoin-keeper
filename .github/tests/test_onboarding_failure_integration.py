"""Synthetic existing-query integration; no Android process/device is started."""
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import types
import unittest
from unittest import mock

NATIVE = Path(__file__).resolve().parents[1] / 'native'
spec = importlib.util.spec_from_file_location('onboarding_android_test', NATIVE / 'android_startup_diagnosis.py')
diag = importlib.util.module_from_spec(spec)
spec.loader.exec_module(diag)
MARKER = 'KEEPER_ONBOARDING_BOUNDARY|v1|SKIP_PRESS'


def line(message=MARKER, pid=100, tag='ReactNativeJS'):
    return '10-22 12:00:00.123 %s 101 E %s: %s\n' % (pid, tag, message)


class IntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.private = Path(self.temp.name)
        (self.private / 'metro.log').write_text('')

    def collect(self, payload, *, failed=False):
        expected = [
            ['shell', 'ps', '-A', '-o', 'PID,NAME'],
            ['shell', 'dumpsys', 'activity', 'activities'],
            ['shell', 'dumpsys', 'activity', 'exit-info', diag.APP],
            ['logcat', '-d', '-b', 'main', '-b', 'crash', '-t', '1200', '-v', 'threadtime', '*:E'],
        ]
        calls = []
        def query(args, stdout, **kwargs):
            self.assertEqual(args[:3], ['adb', '-s', 'emulator-5554'])
            self.assertEqual(args[3:], expected[len(calls)])
            self.assertEqual(kwargs, {'stderr': subprocess.STDOUT, 'timeout': 15, 'check': False})
            calls.append(args)
            content = ['PID NAME\n100 ' + diag.APP + '\n',
                       'topResumedActivity=ActivityRecord{a u0 ' + diag.APP + '/.MainActivity t1}\n',
                       '', payload][len(calls) - 1]
            stdout.write(content.encode())
            return subprocess.CompletedProcess(args, 1 if failed and len(calls) == 4 else 0)
        with mock.patch.object(diag.subprocess, 'run', side_effect=query):
            result = diag.collect(self.private, 'emulator-5554')
        self.assertEqual(len(calls), 4, 'observer must not add a native query')
        self.assertEqual(result['cleanup_status'], 'DELETED')
        self.assertFalse((self.private / 'android-startup-diagnosis').exists())
        return result

    def test_existing_four_queries_supply_separate_positive_receipt_not_runtime_faults(self):
        result = self.collect(line() + line('TypeError: PRIVATE_SENTINEL') +
                              line('KEEPER_ONBOARDING_BOUNDARY|v999|PRIVATE_SENTINEL'))
        receipt = result['onboarding_boundary_observation']
        self.assertEqual(receipt['state'], 'PARTIAL')
        self.assertIs(receipt['stages']['SKIP_PRESS'], True)
        self.assertIsNone(receipt['stages']['NEW_KEEPER_EFFECT'])
        self.assertEqual(receipt['freshness'], 'GUEST_CLOCK_UNVERIFIED')
        self.assertEqual(receipt['unsupported_marker_records'], 1)
        errors = result['runtime_errors']
        self.assertEqual(errors['diagnostic_marker_records'], 2)
        self.assertEqual(errors['own_error_records'], 1)
        self.assertEqual(errors['parsed_error_records'], 1)
        self.assertEqual(errors['fault_categories'], ['JS_TYPE_ERROR'])
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(result))
        self.assertNotIn(diag.APP, json.dumps(result))

    def test_prefix_must_start_native_message_with_exact_error_tag(self):
        payload = (line('TypeError: ' + MARKER) + line(MARKER, tag='OtherTag') +
                   line('KEEPER_ONBOARDING_BOUNDARY|broken TypeError: PRIVATE_SENTINEL'))
        errors = diag.android_log(payload, {100})
        self.assertEqual(errors['diagnostic_marker_records'], 1)
        self.assertEqual(errors['own_error_records'], 2)
        self.assertEqual(errors['fault_categories'], ['JS_TYPE_ERROR'])
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(errors))

    def test_failed_query_foreign_pid_and_control_text_never_claim_current_stage(self):
        cases = [(line(), {'failed': True}), (line(pid=200), {}),
                 ('INFO PRIVATE_SENTINEL\r' + line(), {})]
        for payload, options in cases:
            with self.subTest(options=options, size=len(payload)):
                receipt = self.collect(payload, **options)['onboarding_boundary_observation']
                self.assertEqual(receipt['state'], 'UNKNOWN')
                self.assertTrue(all(value is None for value in receipt['stages'].values()))
                self.assertNotIn('PRIVATE_SENTINEL', json.dumps(receipt))

    def test_partial_input_retains_only_positive_complete_records_without_absence_claim(self):
        original = diag.bounded
        def partial(path, private):
            payload, observed = original(path, private)
            if path.name == 'runtime-errors.log':
                observed.update(input_truncated=True, read_scope='PREFIX_AND_TAIL')
            return payload, observed
        with mock.patch.object(diag, 'bounded', side_effect=partial):
            result = self.collect(line())
        receipt = result['onboarding_boundary_observation']
        self.assertEqual(receipt['state'], 'PARTIAL')
        self.assertIs(receipt['stages']['SKIP_PRESS'], True)
        self.assertIsNone(receipt['stages']['SKIP_RESET_RETURNED'])

    def test_optional_import_or_parser_failure_preserves_original_fault_facts_and_purge(self):
        for importing in (True, False):
            module = types.SimpleNamespace(parse=mock.Mock(side_effect=ValueError('PRIVATE_SENTINEL')))
            source = types.SimpleNamespace(loader=types.SimpleNamespace(exec_module=lambda _: None))
            with self.subTest(importing=importing), \
                 mock.patch.object(diag.importlib.util, 'spec_from_file_location',
                     side_effect=OSError('PRIVATE_SENTINEL') if importing else None, return_value=source), \
                 mock.patch.object(diag.importlib.util, 'module_from_spec', return_value=module):
                result = self.collect(line() + line('TypeError: PRIVATE_SENTINEL'))
            self.assertEqual(result['onboarding_boundary_observation']['state'], 'UNKNOWN')
            self.assertEqual(result['runtime_errors']['fault_categories'], ['JS_TYPE_ERROR'])
            self.assertEqual(result['runtime_errors']['diagnostic_marker_records'], 1)
            self.assertNotIn('PRIVATE_SENTINEL', json.dumps(result))


if __name__ == '__main__':
    unittest.main()
