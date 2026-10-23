"""Synthetic-only fixed iOS readout controls; no real artifact or native launch."""
from contextlib import redirect_stdout
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import stat
import struct
import tempfile
import unittest
from unittest import mock
import warnings
import zipfile

SPEC = importlib.util.spec_from_file_location('ios_readout',
    Path(__file__).resolve().parents[1] / 'scripts/read-044-ios-artifact.py')
reader = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(reader)


def fixture():
    return {'schema': 1, 'source_sha': reader.SOURCE, 'workflow_sha': reader.WORKFLOW,
        'workflow_ref': reader.WORKFLOW_REF, 'run_id': reader.RUN, 'run_attempt': reader.ATTEMPT,
        'platform': 'IOS', 'diagnostic_only': True, 'build': 'PASS', 'smoke': 'FAIL',
        'native_probe': 'NOT RUN', 'r5_features': 'NOT RUN', 'hardware': 'NOT RUN', 'signing': 'NOT RUN',
        'built_artifact': {'executable_sha256': 'a' * 64, 'bundle_tree_sha256': 'b' * 64,
                           'path': 'PRIVATE_SENTINEL', 'executable': 'PRIVATE_SENTINEL'},
        'installed_artifact_verified': True,
        'installed_artifact': {'method': 'FULL_SIMULATOR_BUNDLE_TREE_AND_EXECUTABLE_SHA256',
                               'executable_sha256': 'a' * 64, 'inventory_sha256': 'c' * 64},
        'commands': [{'label': 'Assert startup and disposable passcode transition',
                       'duration_seconds': 123.456, 'timeout_seconds': 420, 'exit_code': 1,
                       'command': ['PRIVATE_SENTINEL']}],
        'startup_diagnostics': {'maestro': {'report': 'PRESENT', 'testcase_statuses': ['ERROR'],
            'testcase_failures': ['Maestro assertion failed: Create a passcode']},
            'ios_errors': {'query_status': 'SUCCESS', 'parse_status': 'PARSED',
                'observation_state': 'OWN_RECORDS_OBSERVED', 'error_records': 616,
                'classified_error_records': 18, 'unclassified_error_records': 598,
                'categories': ['CONNECTION'], 'category_record_counts': {'CONNECTION': 18}},
            'maestro_preflight': {'status_check_failed': True, 'exception_types': ['ConnectException']}},
        'startup_observation': {'collection_errors': [],
            'hierarchy': {'login': True, 'retry': False, 'snapshot_count': 1,
                           'observation_state': 'SNAPSHOTS_PARSED'},
            'metro': {'coverage': 'BOUNDED_INPUT_ONLY', 'observation_state': 'ROWS_OBSERVED',
                'rows': [{'stage': 'APP_WINDOW', 'kind': 'RESPONSE', 'request': 'ENTRY_BUNDLE',
                           'outer_http_status': 200},
                         {'stage': 'BEFORE_APP', 'kind': 'REQUEST', 'request': 'ENTRY_BUNDLE',
                           'options': {'dev': True, 'lazy': False, 'platform': 'ios', 'engine': 'hermes'}},
                         {'stage': 'UNKNOWN', 'kind': 'BUILD', 'event': 'bundle_build_done',
                           'platform': 'ios', 'dev': True, 'minify': False, 'categories': []}]}}}


def archive(data=None, raw=None, name='ios/metadata.json', attributes=None, extra=False):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, 'w', zipfile.ZIP_DEFLATED) as output:
        entry = zipfile.ZipInfo(name)
        entry.compress_type = zipfile.ZIP_DEFLATED
        entry.external_attr = attributes if attributes is not None else (stat.S_IFREG | 0o600) << 16
        output.writestr(entry, raw if raw is not None else json.dumps(fixture() if data is None else data))
        if extra:
            output.writestr('PRIVATE_SENTINEL', 'PRIVATE_SENTINEL')
    return stream.getvalue()


class ReadoutTest(unittest.TestCase):
    def test_original_failure_phase_and_native_int32_are_preserved_without_raw_fields(self):
        value = fixture()
        value['startup_diagnostics']['ios_errors']['startup_failure_receipt'] = {
            'status': 'OBSERVED', 'window': 'BOUNDED', 'marker_records_seen': 1,
            'own_process_count': 1, 'reasons': [], 'input_partial': False,
            'records': [{'phase': 'NATIVE_CREDENTIAL_READ', 'outcome': 'REJECTED',
                'error_name': 'Error', 'code': -34018, 'window_relation': 'IN_WINDOW',
                'pid': 'PRIVATE_SENTINEL', 'timestamp': 'PRIVATE_SENTINEL', 'message': 'PRIVATE_SENTINEL'}]}
        result = reader.decode(archive(value))
        row = result['startup_diagnostics']['ios_errors']['startup_failure_receipt']
        self.assertEqual(row['status'], 'OBSERVED')
        self.assertEqual(row['records'][0]['code'], -34018)
        self.assertEqual(row['own_process_count'], 1)
        self.assertEqual(row['cause'], 'UNDETERMINED')
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(result))
        for invalid in (True, '-34018', -2147483649, 2147483648, {}, None):
            value['startup_diagnostics']['ios_errors']['startup_failure_receipt']['records'][0]['code'] = invalid
            self.assertIsNone(reader.decode(archive(value))['startup_diagnostics']['ios_errors']
                ['startup_failure_receipt']['records'][0]['code'])

    def rejected(self, blob):
        with self.assertRaises(ValueError) as error:
            reader.decode(blob)
        self.assertEqual(str(error.exception), 'Artifact rejected.')

    def test_partial_failure_and_separate_inventory_algorithm_are_preserved(self):
        result = reader.decode(archive())
        self.assertEqual(result['reported_phases']['smoke'], 'FAIL')
        self.assertEqual(result['reported_phases']['native_probe'], 'NOT RUN')
        self.assertTrue(result['installed_artifact']['installed_executable_matches_built'])
        self.assertEqual(result['installed_artifact']['reported_inventory_sha256'], 'c' * 64)
        self.assertNotIn('b' * 64, json.dumps(result))
        self.assertEqual(result['fixed_command_receipts']['startup_ui'][0]['duration_seconds'], 123.456)
        ios = result['startup_diagnostics']['ios_errors']
        self.assertEqual(ios['unclassified_error_records'], 598)
        self.assertEqual(ios['categories'], ['CONNECTION'])
        self.assertTrue(result['startup_diagnostics']['maestro']['first_create_passcode_assertion_reported'])
        self.assertEqual(result['startup_observation']['process_state'], 'UNKNOWN')
        self.assertTrue(result['startup_observation']['hierarchy']['login'])
        self.assertEqual(result['startup_observation']['metro']['rows'][0]['outer_http_status'], 200)
        self.assertEqual(result['cleanup']['status'], 'UNKNOWN')
        self.assertFalse(result['trusted_native_acceptance'])
        self.assertFalse(result['authorization_eligible'])
        self.assertEqual(result['cause'], 'UNDETERMINED')

    def test_exact_identity_and_scalar_types_are_mandatory(self):
        for key in ('schema', 'source_sha', 'workflow_sha', 'workflow_ref', 'run_id',
                    'run_attempt', 'platform', 'diagnostic_only'):
            for replacement in (None, 'PRIVATE_SENTINEL'):
                with self.subTest(key=key, replacement=replacement):
                    value = fixture()
                    value[key] = replacement
                    self.rejected(archive(value))
        value = fixture()
        value['schema'] = True
        self.rejected(archive(value))

    def test_zip_paths_members_types_encryption_and_size_are_rejected(self):
        for options in ({'name': '../ios/metadata.json'}, {'name': '/ios/metadata.json'},
                        {'name': 'ios\\metadata.json'}, {'name': 'ios/metadata.json\0private'},
                        {'attributes': (stat.S_IFLNK | 0o777) << 16},
                        {'attributes': (stat.S_IFIFO | 0o600) << 16}, {'extra': True},
                        {'raw': b'x' * (reader.LIMIT + 1)}):
            with self.subTest(options=tuple(options)):
                # ZipInfo truncates embedded NUL, so construct that invalid header below.
                if '\0' not in options.get('name', ''):
                    self.rejected(archive(**options))
        stream = io.BytesIO()
        with warnings.catch_warnings(), zipfile.ZipFile(stream, 'w') as output:
            warnings.simplefilter('ignore', UserWarning)
            output.writestr('ios/metadata.json', '{}')
            output.writestr('ios/metadata.json', '{}')
        self.rejected(stream.getvalue())
        encrypted = bytearray(archive())
        struct.pack_into('<H', encrypted, 6, struct.unpack_from('<H', encrypted, 6)[0] | 1)
        central = encrypted.index(b'PK\x01\x02')
        struct.pack_into('<H', encrypted, central + 8, struct.unpack_from('<H', encrypted, central + 8)[0] | 1)
        nul = archive().replace(b'ios/metadata.json', b'ios/metadata\0json')
        for blob in (bytes(encrypted), nul, archive()[:-30], b'PRIVATE_SENTINEL', b'x' * (reader.LIMIT + 4097)):
            self.rejected(blob)

    def test_duplicate_json_nonfinite_invalid_utf8_and_malformed_inputs_are_rejected(self):
        root = json.dumps(fixture())[:-1]
        for raw in (root + ',"ignored":{"same":1,"same":2}}', root + ',"ignored":NaN}',
                    root + ',"ignored":Infinity}', root + ',"ignored":1e999}',
                    b'\xffPRIVATE_SENTINEL', '{PRIVATE_SENTINEL'):
            self.rejected(archive(raw=raw))

    def test_unknown_private_text_and_keys_do_not_escape(self):
        value = fixture()
        value['PRIVATE_SENTINEL'] = {'secret': 'PRIVATE_SENTINEL'}
        value['commands'].append({'label': 'PRIVATE_SENTINEL', 'duration_seconds': 5})
        value['startup_diagnostics']['ios_errors'].update(command=['PRIVATE_SENTINEL'],
            categories=['PRIVATE_SENTINEL'], query_status='PRIVATE_SENTINEL')
        value['startup_diagnostics']['maestro_preflight'].update(exception_types=['PRIVATE_SENTINEL'])
        value['startup_diagnostics']['maestro']['testcase_failures'] = ['PRIVATE_SENTINEL']
        observation = value['startup_observation']
        observation['hierarchy']['PRIVATE_SENTINEL'] = True
        observation['metro']['rows'].extend([{'kind': 'ERROR', 'stage': 'PRIVATE_SENTINEL',
            'event': 'PRIVATE_SENTINEL', 'error_type': 'PRIVATE_SENTINEL', 'categories': ['PRIVATE_SENTINEL']},
            {'kind': 'REQUEST', 'request': 'PRIVATE_SENTINEL', 'options': {'app': 'PRIVATE_SENTINEL',
             'engine': 'PRIVATE_SENTINEL', 'sourcePaths': 'PRIVATE_SENTINEL', 'dev': 'PRIVATE_SENTINEL'}}])
        value['startup_cleanup_errors'] = ['PRIVATE_SENTINEL']
        result = reader.decode(archive(value))
        self.assertNotIn('PRIVATE_SENTINEL', json.dumps(result))
        self.assertEqual(result['cleanup']['status'], 'FAIL')
        self.assertEqual(result['cleanup']['reported_errors'], [])
        self.assertEqual(result['startup_diagnostics']['ios_errors']['query_status'], 'UNKNOWN')

    def test_numeric_boolean_and_enum_confusion_cannot_supply_facts(self):
        value = fixture()
        value['commands'][0].update(exit_code=True, duration_seconds='123', timeout_seconds=-1)
        value['startup_diagnostics']['ios_errors'].update(error_records=True, classified_error_records=-1)
        value['startup_observation']['hierarchy'].update(login=1, retry='False')
        value['startup_observation']['metro']['rows'][0]['outer_http_status'] = True
        value['startup_observation']['metro']['rows'][1]['options']['dev'] = 1
        value['installed_artifact_verified'] = 'true'
        result = reader.decode(archive(value))
        self.assertEqual(result['fixed_command_receipts']['startup_ui'][0],
                         {'exit_code': None, 'duration_seconds': None, 'timeout_seconds': None})
        self.assertIsNone(result['installed_artifact']['installed_executable_matches_built'])
        self.assertIsNone(result['startup_observation']['hierarchy']['login'])
        self.assertIsNone(result['startup_observation']['metro']['rows'][0]['outer_http_status'])
        self.assertEqual(result['startup_observation']['metro']['rows'][1]['options']['dev'], 'OTHER')

    def test_rows_and_commands_have_finite_output_limits(self):
        value = fixture()
        value['startup_observation']['metro']['rows'] *= 300
        value['commands'] *= 1001
        result = reader.decode(archive(value))
        self.assertEqual(len(result['startup_observation']['metro']['rows']), 512)
        self.assertEqual(len(result['fixed_command_receipts']['startup_ui']), 5)

    def test_missing_fields_preserve_unknown_and_do_not_invent_cleanup(self):
        value = {key: fixture()[key] for key in ('schema', 'source_sha', 'workflow_sha', 'workflow_ref',
                'run_id', 'run_attempt', 'platform', 'diagnostic_only')}
        result = reader.decode(archive(value))
        self.assertIsNone(result['startup_observation']['hierarchy']['retry'])
        self.assertIsNone(result['startup_diagnostics']['maestro']['first_create_passcode_assertion_reported'])
        self.assertEqual(result['cleanup']['status'], 'UNKNOWN')
        self.assertEqual(result['reported_phases']['smoke'], 'UNKNOWN')
        self.assertIsNone(result['installed_artifact']['installed_executable_matches_built'])

    def test_wrong_executable_and_method_preserve_mismatch_or_unknown(self):
        value = fixture()
        value['installed_artifact']['executable_sha256'] = 'd' * 64
        self.assertFalse(reader.decode(archive(value))['installed_artifact']['installed_executable_matches_built'])
        value['installed_artifact']['method'] = 'SINGLE_INSTALLED_BASE_APK_SHA256'
        self.assertIsNone(reader.decode(archive(value))['installed_artifact']['installed_executable_matches_built'])

    def test_cli_exact_digest_mode_alias_and_arguments_are_enforced_without_text_leak(self):
        blob = archive()
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            file = root / 'r5-044-ios-fixed.zip'
            file.write_bytes(blob)
            file.chmod(0o600)
            environment = {'RUNNER_TEMP': str(root)}
            with mock.patch.dict(os.environ, environment), mock.patch.object(reader, 'ZIP_SIZE', len(blob)), \
                    mock.patch.object(reader, 'ZIP_SHA256', hashlib.sha256(blob).hexdigest()):
                output = io.StringIO()
                with redirect_stdout(output):
                    self.assertEqual(reader.main([]), 0)
                self.assertTrue(output.getvalue().startswith('SAFE_R5_IOS_READOUT '))
                for mutate in ('mode', 'digest', 'symlink', 'hardlink', 'arguments', 'fifo', 'parent_symlink'):
                    with self.subTest(mutate=mutate):
                        file.unlink()
                        file.write_bytes(blob)
                        file.chmod(0o600)
                        args = []
                        if mutate == 'mode': file.chmod(0o644)
                        if mutate == 'digest': file.write_bytes(b'x' * len(blob))
                        if mutate == 'symlink':
                            file.unlink()
                            file.symlink_to(root / 'PRIVATE_SENTINEL')
                        if mutate == 'hardlink': os.link(file, root / 'alias')
                        if mutate == 'arguments': args = ['PRIVATE_SENTINEL']
                        if mutate == 'fifo':
                            file.unlink()
                            os.mkfifo(file, 0o600)
                        if mutate == 'parent_symlink':
                            (root / 'alias-parent').symlink_to(root, target_is_directory=True)
                        output = io.StringIO()
                        with mock.patch.dict(os.environ, {'RUNNER_TEMP': str(root / 'alias-parent') if mutate == 'parent_symlink' else str(root)}), redirect_stdout(output):
                            self.assertEqual(reader.main(args), 1)
                        self.assertEqual(output.getvalue(), 'FIXED_IOS_ARTIFACT_READOUT_FAILED\n')
                        (root / 'alias').unlink(missing_ok=True)


if __name__ == '__main__':
    unittest.main()
