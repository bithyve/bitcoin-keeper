import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

import checksum_observer as obs
from fixture_factory import make_case


class ObserverTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.capture, self.policy, self.allow, self.baseline = make_case(self.tmp.name)
        self.loader = mock.patch.object(obs, 'load_inputs', return_value=(self.allow, self.baseline))
        self.loader.start()
        self.addCleanup(self.loader.stop)

    def report(self):
        return obs.build_report(self.capture, self.policy)

    def test_complete_mixed_comparison(self):
        report = self.report()
        self.assertEqual(report['counts'], dict(expected=142, observed=142, unexpected=0, same=39, changed=103, missing=0))
        self.assertEqual(report['comparison'], 'COMPLETE')
        self.assertEqual(report['attribution'], 'COMPLETE')
        self.assertEqual(report['integrity'], 'VERIFIED')
        self.assertEqual(obs.unpack(obs.pack(report), report['identity']), report)
        self.assertEqual(report['acceptance'], 'NOT_ACCEPTED')

    def test_preflight_pins_before_runtime_loading(self):
        self.assertEqual(obs.preflight(self.policy), obs.identity(self.policy))
        tool = Path(self.policy['tool_files']['installer']['path'])
        tool.write_text('changed upstream implementation')
        with self.assertRaises(obs.Invalid):
            obs.preflight(self.policy)

    def test_same_and_all_changed(self):
        for count in (0, 142):
            capture, policy, allow, baseline = make_case(self.tmp.name, changed=count)
            with mock.patch.object(obs, 'load_inputs', return_value=(allow, baseline)):
                result = obs.build_report(capture, policy)
            self.assertEqual(result['attribution'], 'COMPLETE')
            self.assertEqual(result['counts']['changed'], count)

    def test_actual_committed_sample_pairs(self):
        expected = {'BVLinearGradient': ('880f91a7854faff2df62518f0281afb1c60d49a3', 'cb006ba232a1f3e4f341bb62c42d1098c284da70'),
                    'react-native-background-timer': ('17ea5e06803401a379ebf1f20505b793ac44d0fe', '4638ae3bee00320753647900b21260b10587b6f7')}
        for name, values in expected.items():
            for version in ('2.7', '2.8'):
                data = (obs.ROOT / 'fixtures' / f'{name}.json-{version}-style.json').read_bytes()
                legacy, compact = obs.empty_formats(data)
                self.assertEqual((obs.sha(legacy, 'sha1'), obs.sha(compact, 'sha1')), values)
                self.assertEqual(json.loads(legacy), json.loads(compact))

    def test_preserves_other_bytes_and_escaped_brackets(self):
        raw = b'{\r\n "n":1.000e+2,"u":"\\u0061","text":"[] {} \\\" \\\\" ,"nested":[[],{}]}\n'
        legacy, compact = obs.empty_formats(raw)
        self.assertEqual(compact, raw)
        self.assertIn(b'1.000e+2', legacy)
        self.assertIn(b'\\u0061', legacy)
        self.assertEqual(json.loads(legacy), json.loads(compact))

    def test_invalid_json(self):
        for data in (b'{"a":1,"a":2}', b'NaN', b'1e9999', b'{bad}', b'[]PRIVATE', b'[' * 80 + b']' * 80):
            with self.assertRaises(obs.Invalid):
                obs.empty_formats(data)

    def test_unexpected_private_name_and_missing(self):
        name = self.allow[0]['name']
        self.capture['new_lock']['SPEC CHECKSUMS'].pop(name)
        self.capture['new_lock']['SPEC CHECKSUMS']['SECRET_PRIVATE'] = 'f' * 40
        report = self.report()
        self.assertEqual(report['comparison'], 'INCOMPLETE')
        self.assertEqual(len(report['rows']), 142)
        self.assertNotIn(b'SECRET_PRIVATE', obs.pack(report))

    def test_graph_change_retained(self):
        self.capture['new_lock']['DEPENDENCIES'].append('private-string')
        report = self.report()
        self.assertEqual(report['comparison'], 'COMPLETE')
        self.assertEqual(report['attribution'], 'INCOMPLETE')
        self.assertEqual(report['sections']['DEPENDENCIES'], 'CHANGED')
        self.assertNotIn(b'private-string', obs.pack(report))

    def test_baseline_and_source_mismatch(self):
        self.capture['source_sha'] = 'secret'
        self.assertEqual(self.report()['reasons'], ['SOURCE_MISMATCH'])
        self.capture['source_sha'] = obs.SOURCE
        self.capture['old_lock'] = copy.deepcopy(self.baseline)
        self.capture['old_lock']['COCOAPODS'] = '0.0.0'
        self.assertEqual(self.report()['reasons'], ['BASELINE_MISMATCH'])

    def test_duplicate_spec_and_invalid_hash(self):
        self.capture['specs'].append(self.capture['specs'][0])
        self.assertEqual(self.report()['reasons'], ['DUPLICATE_SPEC'])
        self.capture['specs'].pop()
        self.capture['new_lock']['SPEC CHECKSUMS'][self.allow[0]['name']] = 'SECRET'
        self.assertEqual(self.report()['reasons'], ['INVALID_CHECKSUM'])

    def test_symlink_and_outside_root_rejected(self):
        file = Path(self.capture['specs'][0]['path'])
        target = file.with_suffix('.target')
        file.rename(target); file.symlink_to(target)
        self.assertIn('PATH_REJECTED', self.report()['reasons'])
        with self.assertRaises(obs.Invalid):
            obs.SafeReader([self.tmp.name]).read('/etc/passwd')

    def test_input_mutation_and_size(self):
        file = Path(next(iter(self.policy['immutable_files'])))
        file.write_text('changed')
        self.assertEqual(self.report()['reasons'], ['INPUT_CHANGED'])
        large = Path(self.tmp.name) / 'large'
        large.write_bytes(b'x' * (obs.MAX_FILE + 1))
        with self.assertRaises(obs.Invalid):
            obs.SafeReader([self.tmp.name]).read(str(large))

    def test_runtime_private_fields_fail_closed(self):
        for field in ('ruby', 'json_version', 'engine', 'fingerprint'):
            original = self.capture['runtime'][1][field]
            self.capture['runtime'][1][field] = 'PRIVATE_SECRET'
            output = obs.pack(self.report())
            self.assertNotIn(b'PRIVATE_SECRET', output)
            self.capture['runtime'][1][field] = original

    def test_missing_reordered_corrupt_stream(self):
        lines = obs.pack(self.report()).splitlines(keepends=True)
        variants = [b''.join(lines[:-1]), b''.join([lines[0], lines[2], lines[1], *lines[3:]]),
                    b''.join(lines).replace(b'P001', b'P002', 1)]
        for value in variants:
            with self.assertRaises(obs.Invalid):
                obs.unpack(value, self.report()['identity'])

    def test_cli_failure_never_prints_source(self):
        policy = Path(self.tmp.name) / 'policy.json'
        policy.write_text('{}')
        result = subprocess.run([sys.executable, '-B', str(obs.ROOT / 'checksum_observer.py'), '--policy', str(policy)],
                                input=b'PRIVATE_BAD_INPUT', capture_output=True)
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stderr, b'')
        self.assertNotIn(b'PRIVATE', result.stdout)


if __name__ == '__main__':
    unittest.main()
