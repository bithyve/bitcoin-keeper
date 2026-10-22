"""HTTP controls and fail-closed measurement receipts; these are not native tests."""
import importlib.util
import hashlib
import json
from pathlib import Path
import threading
import unittest
import urllib.error
import urllib.request

SPEC = importlib.util.spec_from_file_location('product_measurements',
    Path(__file__).resolve().parents[1] / 'native/product_measurements.py')
product = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(product)


class FixtureTests(unittest.TestCase):
    def setUp(self):
        self.receipt = product.Receipt()
        self.server = product.make_server(self.receipt, port=0)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = 'http://127.0.0.1:%d' % self.server.server_port

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)

    def post(self, path, value):
        raw = value if isinstance(value, bytes) else json.dumps(value).encode()
        request = urllib.request.Request(self.base + path, data=raw, method='POST',
                                         headers={'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(request, timeout=2) as response:
                return response.status, json.loads(response.read())
        except urllib.error.HTTPError as error:
            return error.code, json.loads(error.read())

    def complete(self):
        self.post('/createNewApp', {'publicId': 'DO_NOT_RETAIN', 'fcmToken': 'DO_NOT_RETAIN'})
        for stage in product.STAGES:
            self.assertEqual(self.post('/metric', {'stage': stage}), (200, {'accepted': True}))

    def test_loopback_only(self):
        self.assertEqual(self.server.server_address[0], '127.0.0.1')

    def test_complete_numeric_receipt_does_not_retain_account_data(self):
        self.complete()
        evidence = self.receipt.snapshot(passed=True)
        self.assertEqual(evidence['status'], 'PASS')
        self.assertEqual(evidence['visible_wallet_count_after_relaunch'], 1)
        self.assertEqual(len(evidence['raw_durations']), 5)
        self.assertNotIn('DO_NOT_RETAIN', json.dumps(evidence))
        self.assertTrue(all(value >= 0 for value in evidence['raw_durations'].values()))

    def test_out_of_order_and_duplicate_markers_are_rejected(self):
        self.assertEqual(self.post('/metric', {'stage': 'wallet_ready'})[0], 422)
        self.assertEqual(self.post('/metric', {'stage': 'startup_start'})[0], 200)
        self.assertEqual(self.post('/metric', {'stage': 'startup_start'})[0], 422)
        self.assertEqual(self.receipt.snapshot()['completed_stages'], ['startup_start'])

    def test_unknown_marker_and_additional_fields_are_rejected_without_echo(self):
        for payload in ({'stage': 'DO_NOT_RETAIN'}, {'stage': 'startup_start', 'secret': 'DO_NOT_RETAIN'}):
            status, response = self.post('/metric', payload)
            self.assertEqual(status, 422)
            self.assertNotIn('DO_NOT_RETAIN', json.dumps(response))
        self.assertEqual(self.receipt.snapshot()['completed_stages'], [])

    def test_duplicate_setup_fails_even_after_every_ui_stage(self):
        self.complete()
        self.post('/createNewApp', b'{}')
        with self.assertRaisesRegex(RuntimeError, 'DUPLICATE_SETUP'):
            self.receipt.snapshot(passed=True)

    def test_missing_setup_or_partial_flow_cannot_pass(self):
        self.receipt.mark('startup_start')
        with self.assertRaises(RuntimeError):
            self.receipt.snapshot(passed=True)
        self.assertEqual(self.receipt.snapshot()['status'], 'FAIL')

    def test_unknown_backend_route_fails_closed(self):
        status, response = self.post('/deleteBackup', b'{}')
        self.assertEqual(status, 503)
        self.assertNotIn('deleted', response)
        self.assertEqual(self.receipt.snapshot()['other_backend_calls_rejected'], 1)

    def test_oversized_payload_is_rejected_without_retention(self):
        self.assertEqual(self.post('/createNewApp', b'x' * 8193)[0], 413)
        self.assertEqual(self.receipt.snapshot()['create_new_app_calls'], 0)

    def test_reset_discards_prior_sample_receipt(self):
        self.complete()
        self.receipt.reset(2)
        state = self.receipt.snapshot()
        self.assertEqual((state['sample'], state['create_new_app_calls']), (2, 0))
        self.assertEqual(state['completed_stages'], [])


class PackageOverlayTests(unittest.TestCase):
    def setUp(self):
        self.original = {'name': 'fixture', 'dependencies': {'crypto-shim': '1.0.0'},
                         'scripts': {'start': 'react-native start'}, 'browser': {'path': 'before'}}
        self.installed = {**self.original, 'browser': {'path': 'react-native-path'},
                          'react-native': {'crypto': 'crypto-shim'}, 'browserify': {'transform': []}}

    def evidence(self, original=None, installed=None):
        original_bytes = json.dumps(self.original if original is None else original).encode()
        installed_bytes = json.dumps(self.installed if installed is None else installed).encode()
        return original_bytes, installed_bytes, {
            'path': 'package.json', 'allowed_fields': ['browser', 'react-native', 'browserify'],
            'before_sha256': hashlib.sha256(original_bytes).hexdigest(),
            'after_sha256': hashlib.sha256(installed_bytes).hexdigest(),
        }

    def test_recorded_mapping_overlay_is_accepted(self):
        product.verify_package_overlay(*self.evidence())

    def test_recorded_unchanged_mapping_is_accepted(self):
        product.verify_package_overlay(*self.evidence(installed=self.original))

    def test_unrecorded_changes_are_rejected(self):
        original, installed, overlay = self.evidence()
        for missing in (None, {}, {**overlay, 'after_sha256': '0' * 64}):
            with self.assertRaisesRegex(RuntimeError, 'UNRECORDED'):
                product.verify_package_overlay(original, installed, missing)

    def test_recording_must_match_committed_original_bytes(self):
        original, installed, overlay = self.evidence()
        with self.assertRaisesRegex(RuntimeError, 'UNRECORDED'):
            product.verify_package_overlay(original + b' ', installed, overlay)

    def test_hash_matching_protected_dependency_change_is_rejected(self):
        installed = {**self.installed, 'dependencies': {'crypto-shim': '2.0.0'}}
        with self.assertRaisesRegex(RuntimeError, 'PROTECTED_FIELDS_CHANGED'):
            product.verify_package_overlay(*self.evidence(installed=installed))

    def test_hash_matching_script_change_is_rejected(self):
        installed = {**self.installed, 'scripts': {'start': 'different-entrypoint'}}
        with self.assertRaisesRegex(RuntimeError, 'PROTECTED_FIELDS_CHANGED'):
            product.verify_package_overlay(*self.evidence(installed=installed))

    def test_expanded_field_allowlist_and_wrong_path_are_rejected(self):
        original, installed, overlay = self.evidence()
        for changed in ({**overlay, 'allowed_fields': overlay['allowed_fields'] + ['dependencies']},
                        {**overlay, 'path': 'another-package.json'}):
            with self.assertRaisesRegex(RuntimeError, 'UNRECORDED'):
                product.verify_package_overlay(original, installed, changed)


if __name__ == '__main__':
    unittest.main()
