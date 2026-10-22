"""Fixed own-process log classification controls; no native execution."""
import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('ios_log_controls',
    Path(__file__).resolve().parents[1] / 'native/hosted_native.py')
native = importlib.util.module_from_spec(spec)
spec.loader.exec_module(native)


class IOSStartupDiagnosticsTests(unittest.TestCase):
    def record(self, message, process='hexa_keeper_dev', severity='Df'):
        return '2026-10-22 20:00:00.123+0000 %s %s[123:abc] %s' % (severity, process, message)

    def test_known_js_native_bundle_and_network_markers_are_fixed_not_error_excerpts(self):
        cases = {
            'JS_TYPE_ERROR': 'TypeError: private value',
            'JS_REFERENCE_ERROR': 'ReferenceError: private identifier',
            'JS_SYNTAX_ERROR': 'SyntaxError: private source',
            'JS_RANGE_ERROR': 'RangeError: private value',
            'JS_INVARIANT': 'Invariant Violation: private details',
            'JS_EXCEPTION': 'Unhandled JS Exception: private details',
            'NATIVE_EXCEPTION': 'NSInvalidArgumentException: private details',
            'NATIVE_MODULE_UNAVAILABLE': 'TurboModuleRegistry: module could not be found',
            'NATIVE_LIBRARY_LOAD_ERROR': 'dyld: Library not loaded: private path',
            'HERMES_ERROR': 'Hermes fatal error: private details',
            'SCRIPT_URL_MISSING': 'No bundle URL present: private URL',
            'ATS_BLOCKED': 'NSURLErrorDomain Code=-1022 private URL',
            'CONNECTION_ERROR': 'NSURLErrorDomain Code=-1004 private URL',
        }
        for category, message in cases.items():
            with self.subTest(category=category):
                result = native.ios_startup_diagnostics(
                    self.record(message + ' PRIVATE_SENTINEL'), 'hexa_keeper_dev')
                self.assertEqual(result['category_record_counts'][category], 1)
                self.assertEqual(result['error_records'], 1)
                self.assertEqual(result['unclassified_error_records'], 0)
                self.assertEqual(result['errors'], ['IOS_STARTUP_ERROR'])
                self.assertNotIn('PRIVATE_SENTINEL', json.dumps(result))
                self.assertNotIn(message, json.dumps(result))

    def test_foreign_process_continuation_and_ordinary_hermes_records_cannot_become_app_errors(self):
        payload = '\n'.join([
            self.record('TypeError PRIVATE_SENTINEL', process='OtherApp', severity='E'),
            'TypeError PRIVATE_SENTINEL unprefixed continuation',
            'hexa_keeper_dev[123:abc] SyntaxError PRIVATE_SENTINEL missing timestamp',
            self.record('Hermes engine initialized normally'),
        ])
        result = native.ios_startup_diagnostics(payload, 'hexa_keeper_dev')
        self.assertEqual(result['matching_process_records'], 1)
        self.assertEqual(result['error_records'], 0)
        self.assertFalse(any(result['category_record_counts'].values()))
        self.assertEqual(result['errors'], [])
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(result))

    def test_generic_errors_remain_unclassified_and_missing_records_remain_unknown(self):
        result = native.ios_startup_diagnostics('\n'.join([
            self.record('PRIVATE_SENTINEL arbitrary application text', severity='E'),
            self.record('ReferenceError PRIVATE_SENTINEL', severity='E'),
            self.record('TypeError and ReferenceError PRIVATE_SENTINEL', severity='E'),
        ]), 'hexa_keeper_dev')
        self.assertEqual(result['error_records'], 3)
        self.assertEqual(result['unclassified_error_records'], 1)
        self.assertEqual(result['category_record_counts']['JS_REFERENCE_ERROR'], 2)
        self.assertEqual(result['category_record_counts']['JS_TYPE_ERROR'], 1)
        self.assertEqual(result['parse_status'], 'PARSED')
        absent = native.ios_startup_diagnostics('PRIVATE_SENTINEL no compact records', 'hexa_keeper_dev')
        self.assertEqual(absent['parse_status'], 'UNKNOWN')
        self.assertFalse(any(absent['category_record_counts'].values()))
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps((result, absent)))


if __name__ == '__main__':
    unittest.main()
