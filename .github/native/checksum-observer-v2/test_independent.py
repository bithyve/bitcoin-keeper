"""Independent synthetic checks; no network, installation or native execution."""
import copy
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

import checksum_observer as obs
from fixture_factory import make_case

ROOT = Path(__file__).resolve().parent
PRIVATE = 'synthetic-private-wallet-DO-NOT-EXPORT'


class IndependentObserverTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.capture, self.policy, self.allow, self.baseline = make_case(self.tmp.name)
        self.inputs = mock.patch.object(obs, 'load_inputs', return_value=(self.allow, self.baseline))
        self.inputs.start()
        self.addCleanup(self.inputs.stop)

    def report(self):
        return obs.build_report(self.capture, self.policy)

    def reject_forged_stream(self, report, expected_identity=None):
        # Bypass producer validation and recompute every unkeyed wire digest:
        # the consumer must independently reject inconsistent evidence.
        if expected_identity is None:
            expected_identity = self.report()['identity']
        chunks = [report['rows'][i:i + 12] for i in range(0, len(report['rows']), 12)]
        records = [{'kind': 'HEADER', 'data': {k: v for k, v in report.items() if k != 'rows'}}]
        records.extend({'kind': 'ROWS', 'sequence': i, 'rows': rows,
                        'sha256': obs.sha(obs.canonical(rows))} for i, rows in enumerate(chunks))
        records.append({'kind': 'END', 'chunks': len(chunks), 'rows': len(report['rows']),
                        'sha256': obs.sha(obs.canonical(report))})
        data = b''.join(obs.canonical(record) + b'\n' for record in records)
        with self.assertRaises(obs.Invalid):
            obs.unpack(data, expected_identity)

    def test_consumer_requires_original_attempt_policy_cache_and_observer_identity(self):
        report = self.report()
        with self.assertRaises(obs.Invalid):
            obs.unpack(obs.pack(report))
        for key in report['identity']:
            with self.subTest(key=key):
                forged = copy.deepcopy(report)
                forged['identity'][key] = (report['identity'][key] + 1 if key == 'attempt'
                                           else 'f' * 64)
                self.reject_forged_stream(forged, report['identity'])

    def test_complete_142_row_roundtrip_and_all_changed(self):
        for changed in (0, 103, 142):
            capture, policy, allow, baseline = make_case(self.tmp.name, changed=changed)
            with mock.patch.object(obs, 'load_inputs', return_value=(allow, baseline)):
                report = obs.build_report(capture, policy)
                self.assertEqual(report['comparison'], 'COMPLETE')
                self.assertEqual(report['counts']['changed'], changed)
                self.assertEqual(len(report['rows']), 142)
                self.assertEqual(obs.unpack(obs.pack(report), report['identity']), report)
                self.assertEqual(report['acceptance'], 'NOT_ACCEPTED')

    def test_claimed_equal_comparison_with_changed_objects_is_incomplete(self):
        self.capture['comparison'] = 'EQUAL'
        report = self.report()
        self.assertEqual(report['comparison'], 'INCOMPLETE')
        self.assertEqual(report['attribution'], 'INCOMPLETE')

    def test_missing_and_unexpected_spec_names_never_leak(self):
        self.capture['new_lock']['SPEC CHECKSUMS'].pop(self.allow[0]['name'])
        self.capture['new_lock']['SPEC CHECKSUMS'][PRIVATE] = 'e' * 40
        report = self.report()
        self.assertEqual(report['comparison'], 'INCOMPLETE')
        self.assertEqual(report['counts']['missing'], 1)
        self.assertEqual(report['counts']['unexpected'], 1)
        self.assertEqual(len(report['rows']), 142)
        self.assertNotIn(PRIVATE, json.dumps(report))

    def test_duplicate_spec_is_rejected_without_path_leak(self):
        item = copy.deepcopy(self.capture['specs'][0])
        item['path'] = '/' + PRIVATE
        self.capture['specs'].append(item)
        report = self.report()
        self.assertEqual(report['comparison'], 'INCOMPLETE')
        self.assertNotIn(PRIVATE, json.dumps(report))

    def test_defining_file_mismatch_cannot_prove_attribution(self):
        Path(self.capture['specs'][0]['path']).write_text(PRIVATE)
        report = self.report()
        self.assertEqual(report['comparison'], 'COMPLETE')
        self.assertEqual(report['attribution'], 'INCOMPLETE')
        self.assertIn('SPEC_FILE_MISMATCH', report['reasons'])
        self.assertNotIn(PRIVATE, json.dumps(report))

    def test_non_checksum_graph_drift_prevents_formatting_attribution(self):
        self.capture['new_lock']['PODS'][0] = self.allow[0]['name'] + ' (2.0.0)'
        report = self.report()
        self.assertEqual(report['comparison'], 'COMPLETE')
        self.assertEqual(report['attribution'], 'INCOMPLETE')
        self.assertEqual(report['sections']['PODS'], 'CHANGED')

    def test_mutated_immutable_input_stays_unverified(self):
        path = next(iter(self.policy['immutable_files']))
        Path(path).write_text(PRIVATE)
        report = self.report()
        self.assertEqual(report['integrity'], 'UNVERIFIED')
        self.assertNotIn(PRIVATE, json.dumps(report))

    def test_runtime_private_values_and_disagreeing_json_are_rejected(self):
        for value in (PRIVATE, '9.9.9'):
            with self.subTest(value=value):
                capture = copy.deepcopy(self.capture)
                capture['runtime'][1]['json_version'] = value
                report = obs.build_report(capture, self.policy)
                self.assertEqual(report['comparison'], 'INCOMPLETE')
                self.assertNotIn(PRIVATE, json.dumps(report))

    def test_stream_rejects_missing_reordered_duplicate_and_truncated_chunks(self):
        report = self.report()
        data = obs.pack(report)
        lines = data.splitlines(keepends=True)
        variants = [b''.join(lines[:-1]), b''.join(lines[:2] + lines[3:]),
                    b''.join([lines[0], lines[2], lines[1], *lines[3:]]),
                    b''.join([*lines[:2], lines[1], *lines[2:]]), data[:-1]]
        for value in variants:
            with self.subTest(size=len(value)):
                with self.assertRaises(obs.Invalid):
                    obs.unpack(value, report['identity'])

    def test_stream_rejects_false_completeness_with_no_rows(self):
        report = self.report()
        report.update(rows=[], runtime=[], counts={}, sections={}, reasons=[],
                      comparison='COMPLETE', attribution='COMPLETE', integrity='VERIFIED')
        self.reject_forged_stream(report)

    def test_stream_rejects_rehashed_count_and_old_hash_forgery(self):
        report = self.report()
        for change in ('counts', 'old_hash', 'cause', 'state', 'fingerprint', 'integrity'):
            with self.subTest(change=change):
                forged = copy.deepcopy(report)
                if change == 'counts':
                    forged['counts']['changed'] = 0
                elif change == 'old_hash':
                    forged['rows'][0]['old_sha1'] = 'f' * 40
                elif change == 'cause':
                    forged['rows'][0]['cause'] = 'FORMAT_ONLY_PROVEN'
                    forged['rows'][0]['matches_new'] = False
                elif change == 'state':
                    forged['rows'][0]['state'] = 'SAME'
                elif change == 'fingerprint':
                    forged['runtime'][1]['fingerprint'] = '0' * 64
                    forged['runtime'][1]['format'] = 'COMPACT_EMPTY'
                else:
                    forged['integrity'] = 'UNVERIFIED'
                    forged['attribution'] = 'COMPLETE'
                self.reject_forged_stream(forged)

    def test_stream_rejects_private_extra_fields_even_with_recomputed_digests(self):
        report = self.report()
        report['rows'][0]['error'] = PRIVATE
        self.reject_forged_stream(report)

    def test_boolean_schema_and_counters_cannot_masquerade_as_integers(self):
        report = self.report()
        report['schema'] = True
        self.reject_forged_stream(report)


class IndependentBytesAndReaderTests(unittest.TestCase):
    def test_formats_preserve_quoted_tokens_unicode_number_lexemes_and_crlf(self):
        quoted = json.dumps('[] {} \\ " é', ensure_ascii=False).encode()
        data = b'{"n":1.2300e+02,"arr":[],"obj":{},"s":' + quoted + b'}\r\n'
        legacy, compact = obs.empty_formats(data)
        self.assertEqual(compact, data)
        self.assertIn(b'1.2300e+02', legacy)
        self.assertIn(quoted, legacy)
        self.assertTrue(legacy.endswith(b'\r\n'))
        self.assertEqual(json.loads(legacy), json.loads(data))
        self.assertEqual(obs.empty_formats(legacy), (legacy, compact))

    def test_unsupported_or_malformed_formats_are_rejected(self):
        values = [b'{"a":[ ]}', b'{"a":{\r\n}}', b'{"a":[],"a":[]}',
                  b'{"a":[],"\\u0061":[]}', b'{"a":NaN}', b'\xff',
                  b'[' * 70 + b']' * 70]
        for data in values:
            with self.subTest(data=data[:30]):
                with self.assertRaises(obs.Invalid):
                    obs.empty_formats(data)

    def test_reader_rejects_symlink_components_and_root_prefix_lookalikes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / 'allowed'; root.mkdir()
            outside = Path(tmp) / 'allowed-other'; outside.mkdir()
            target = outside / 'private'; target.write_text(PRIVATE)
            (root / 'link').symlink_to(outside, target_is_directory=True)
            (root / 'file').symlink_to(target)
            reader = obs.SafeReader([str(root)])
            for path in [target, root / 'link/private', root / 'file']:
                with self.assertRaises(obs.Invalid):
                    reader.read(str(path))

    def test_reader_limits_and_changed_during_read(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'input'; path.write_bytes(b'a' * 20)
            with mock.patch.object(obs, 'MAX_FILE', 19):
                with self.assertRaises(obs.Invalid):
                    obs.SafeReader([tmp]).read(str(path))
            read = os.read
            changed = False
            def mutate(fd, size):
                nonlocal changed
                value = read(fd, size)
                if value and not changed:
                    changed = True
                    path.write_bytes(b'b' * 21)
                return value
            with mock.patch.object(obs.os, 'read', side_effect=mutate):
                with self.assertRaises(obs.Invalid):
                    obs.SafeReader([tmp]).read(str(path))

    def test_fifo_is_rejected_promptly_without_waiting_for_a_writer(self):
        with tempfile.TemporaryDirectory() as tmp:
            fifo = Path(tmp) / 'input'; os.mkfifo(fifo)
            script = ('import checksum_observer as o,sys\n'
                      'try: o.SafeReader([sys.argv[1]]).read(sys.argv[2])\n'
                      'except o.Invalid: raise SystemExit(0)\n'
                      'raise SystemExit(1)\n')
            try:
                completed = subprocess.run([sys.executable, '-B', '-c', script, tmp, str(fifo)],
                                           cwd=ROOT, capture_output=True, timeout=1)
            except subprocess.TimeoutExpired:
                self.fail('SafeReader blocked opening a FIFO before checking its type')
            self.assertEqual(completed.returncode, 0)


if __name__ == '__main__':
    unittest.main()
