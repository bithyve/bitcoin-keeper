"""Real Ruby/pipe/processor execution using explicitly synthetic installer data."""
import copy
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

import checksum_observer as obs
from fixture_factory import make_case

RUBY = Path(os.environ.get('KEEPER_FIXTURE_RUBY', ''))
ROOT = Path(__file__).resolve().parent


@unittest.skipUnless(RUBY.is_file(), 'Explicit local fixture Ruby runtime unavailable')
class TransportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.package = self.root / 'synthetic_processor'
        self.package.mkdir()
        for name in ('checksum_observer.py', 'capture.rb'):
            shutil.copy2(ROOT / name, self.package / name)
        self.capture, self.policy, self.allow, self.baseline = make_case(self.root / 'inputs')
        (self.package / 'baseline-lock.json').write_bytes(obs.canonical(self.baseline))
        (self.package / 'pod-allowlist.json').write_bytes(obs.canonical({
            'source_sha': obs.SOURCE, 'source_tree': obs.TREE, 'pods': self.allow}))
        self.runner = str(ROOT / 'transport_fixture.rb')
        self.policy['roots'].extend([str(RUBY.parent), str(ROOT)])
        self.policy['tool_files']['ruby'] = {'path': str(RUBY), 'sha256': obs.sha(RUBY.read_bytes())}
        for snapshot in self.capture['runtime']:
            snapshot['files']['ruby'] = str(RUBY)

    def run_transport(self, *, mode='synthetic', processor=None):
        with mock.patch.object(obs, 'ROOT', self.package):
            expected = obs.preflight(self.policy)
        self.capture['identity'] = expected
        capture_path, policy_path, status_path = [self.root / n for n in ('capture.json', 'policy.json', 'status.json')]
        capture_path.write_bytes(obs.canonical(self.capture))
        policy_path.write_bytes(obs.canonical(self.policy))
        result = subprocess.run([str(RUBY), self.runner, str(capture_path), str(policy_path),
                                 sys.executable, str(processor or self.package / 'checksum_observer.py'),
                                 str(status_path), mode], capture_output=True, timeout=20)
        self.assertEqual(result.returncode, 0, result.stderr.decode(errors='replace'))
        self.assertEqual(result.stderr, b'')
        self.assertNotIn(b'PRIVATE_', result.stdout)
        status = json.loads(status_path.read_bytes())
        self.assertFalse(status['continued'])
        self.assertEqual(status['generate_count'], 1)
        self.assertLessEqual(len(result.stdout), obs.MAX_OUTPUT)
        self.assertTrue(all(len(line) <= obs.MAX_RECORD for line in result.stdout.splitlines(keepends=True)))
        return result.stdout, expected, status

    def unpack_fixture(self, wire, expected):
        # The consumer must use the same explicitly synthetic, sealed input set
        # as this subprocess. Its identity checks remain enabled.
        with mock.patch.object(obs, 'ROOT', self.package):
            return obs.unpack(wire, expected)

    def test_changed_objects_complete_real_pipe_roundtrip(self):
        wire, expected, status = self.run_transport()
        report = self.unpack_fixture(wire, expected)
        self.assertEqual(report['comparison'], 'COMPLETE')
        self.assertEqual(len(report['rows']), 142)
        self.assertEqual(report['acceptance'], 'NOT_ACCEPTED')
        self.assertEqual(status['capture_status'], 'CAPTURED')
        self.assertTrue(status['original_preserved'])

    def test_equal_objects_stop_after_real_pipe_roundtrip(self):
        self.capture['new_lock'] = copy.deepcopy(self.capture['old_lock'])
        wire, expected, status = self.run_transport()
        report = self.unpack_fixture(wire, expected)
        self.assertEqual(report['comparison'], 'COMPLETE')
        self.assertEqual(report['deployment'], 'EQUAL')
        self.assertEqual(report['acceptance'], 'NOT_ACCEPTED')
        self.assertTrue(status['stopped_on_equality'])

    def test_private_runtime_failure_is_fixed_output(self):
        self.capture['runtime'][0]['ruby'] = 'PRIVATE_RUNTIME_VALUE'
        wire, expected, status = self.run_transport()
        report = self.unpack_fixture(wire, expected)
        self.assertEqual(report['comparison'], 'INCOMPLETE')
        self.assertEqual(report['reasons'], ['RUNTIME_UNVERIFIED'])
        self.assertEqual(status['capture_status'], 'INCOMPLETE')
        self.assertTrue(status['original_preserved'])

    def test_processor_stderr_and_failure_never_mask_original(self):
        processor = self.root / 'failing_processor.py'
        processor.write_text("import sys\nsys.stderr.write('PRIVATE_PROCESSOR_ERROR')\nsys.exit(9)\n")
        wire, _, status = self.run_transport(processor=processor)
        self.assertEqual(wire, b'')
        self.assertEqual(status['capture_status'], 'INCOMPLETE')
        self.assertTrue(status['original_preserved'])

    def test_real_unprovisioned_runtime_remains_incomplete(self):
        command = [str(RUBY), '-rjson', '-r' + str(ROOT / 'capture.rb'), '-e',
                   'puts JSON.generate(KeeperChecksumObserver.snapshot(ARGV.fetch(0)))', self.runner]
        snapshot = json.loads(subprocess.check_output(command, timeout=10))
        self.assertIsNone(snapshot['gems']['cocoapods'])
        for tool, path in snapshot['files'].items():
            self.policy['roots'].append(str(Path(path).parent))
            self.policy['tool_files'][tool] = {'path': path, 'sha256': obs.sha(Path(path).read_bytes())}
        self.policy['roots'] = list(dict.fromkeys(self.policy['roots']))
        wire, expected, status = self.run_transport(mode='real_runtime')
        report = self.unpack_fixture(wire, expected)
        self.assertEqual(report['comparison'], 'INCOMPLETE')
        self.assertEqual(report['reasons'], ['RUNTIME_UNVERIFIED'])
        self.assertEqual(report['acceptance'], 'NOT_ACCEPTED')
        self.assertEqual(status['capture_status'], 'INCOMPLETE')
        self.assertTrue(status['original_preserved'])


if __name__ == '__main__':
    unittest.main()
