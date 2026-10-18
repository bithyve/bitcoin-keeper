"""Source-derived CocoaPods fixtures; no Ruby, installer or network execution."""
import contextlib
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import types
import unittest
from unittest import mock

import checksum_diff as diff
import diagnose

PRIVATE = 'synthetic-private-wallet-path-DO-NOT-EXPORT'
ROOT = Path(__file__).resolve().parent


def fixture(names=None, quote=''):
    allowed = diff.allowlist()
    names = names or list(allowed)[:2]
    # YAMLHelper sorts New before Old; quoted numeric scalars are also valid.
    return diff.HEADER + '\nSPEC CHECKSUMS:\n' + ''.join(
        f'  {name}:\n    New Lockfile: {quote}{"1" * 40}{quote}\n'
        f'    Old Lockfile: {allowed[name]}\n' for name in names)


class ChecksumDiffTests(unittest.TestCase):
    def test_exact_allowlist_matches_pinned_source_lock(self):
        raw = subprocess.check_output(['git', 'show',
            'bccb63348754e7a7975ea140717d31be214f0801:ios/Podfile.lock'], cwd=ROOT)
        doc = json.loads((ROOT / 'pod-allowlist.json').read_text())
        self.assertEqual(hashlib.sha256(raw).hexdigest(), doc['podfile_lock_sha256'])
        block = raw.decode().split('\nSPEC CHECKSUMS:\n')[1].split('\n\n')[0]
        expected = dict(line.strip().split(': ', 1) for line in block.splitlines())
        self.assertEqual(diff.allowlist(), expected)
        self.assertEqual(len(expected), 142)

    def test_source_format_pairs_and_both_scalar_quotes(self):
        for quote in ['', "'", '"']:
            value = diff.extract(fixture(quote=quote), True)
            self.assertEqual(value['state'], 'COMPLETE_CHECKSUM_SECTION')
            self.assertEqual(value['changed_roots'], 2)
            for row in value['rows']:
                self.assertEqual(row['old_sha1'], diff.allowlist()[row['name']])
                self.assertEqual(row['new_sha1'], '1' * 40)

    def test_ansi_and_unrelated_private_output_not_exported(self):
        text = PRIVATE + '\n\x1b[31m' + fixture() + '\x1b[0m\n'
        text += '\nPODFILE CHECKSUM:\n  New Lockfile: ' + PRIVATE + '\n'
        value = diff.extract(text, True)
        self.assertEqual(value['changed_roots'], 2)
        self.assertNotIn(PRIVATE, json.dumps(value))
        self.assertNotIn(PRIVATE, ''.join(diff.records(value)))

    def test_unknown_or_malformed_closes_entire_section(self):
        text = fixture()
        old = next(iter(diff.allowlist().values()))
        bad = [text.replace('CocoaAsyncSocket', PRIVATE),
               text + '  BVLinearGradient:\n    New Lockfile: ' + '1'*40 + '\n    Old Lockfile: '+old+'\n',
               text.replace(old, '2' * 40),
               text.replace('1' * 40, PRIVATE),
               text.replace('New Lockfile', 'Old Lockfile'),
               text.replace('1' * 40, '&alias ' + '1' * 40),
               text.replace('1' * 40, '!!str ' + '1' * 40),
               text.replace('1' * 40, 'null'),
               text.replace('  CocoaAsyncSocket:', '  "CocoaAsyncSocket":'),
               text + diff.HEADER + '\n',
               text + 'SPEC CHECKSUMS:\n',
               text.rstrip('\n'),
               text.rsplit('    Old Lockfile:', 1)[0],
               text + '  '+PRIVATE+'\n']
        for case in bad:
            with self.subTest(case=bad.index(case)):
                value = diff.extract(case, True)
                self.assertEqual(value['state'], 'UNRECOGNIZED')
                self.assertFalse(value['complete'])
                self.assertNotIn('rows', value)
                self.assertNotIn(PRIVATE, json.dumps(value))
                self.assertEqual(diff.records(value), [])

    def test_reordered_lock_section_cannot_hide_malformed_checksum_tail(self):
        for section in ['PODS', 'DEPENDENCIES', 'SPEC REPOS', 'EXTERNAL SOURCES', 'CHECKOUT OPTIONS']:
            value = diff.extract(fixture() + '\n' + section + ':\n  ' + PRIVATE + '\n', True)
            self.assertFalse(value['complete'])
            self.assertEqual(value['state'], 'UNRECOGNIZED')
            self.assertEqual(diff.records(value), [])

    def test_queued_cocoapods_warning_boundary_is_not_exported(self):
        text = fixture() + '\n[!] ' + PRIVATE + '\n    - ' + PRIVATE + '\n'
        value = diff.extract(text, True)
        self.assertEqual(value['changed_roots'], 2)
        self.assertNotIn(PRIVATE, json.dumps(value))
        self.assertEqual(diff.extract(fixture() + '[!] '+PRIVATE+'\n', True)['state'], 'UNRECOGNIZED')
        broken = fixture().rsplit('    Old Lockfile:', 1)[0] + '\n[!] ' + PRIVATE + '\n'
        self.assertEqual(diff.extract(broken, True)['state'], 'UNRECOGNIZED')

    def test_identical_checksums_are_not_a_change(self):
        name, old = next(iter(diff.allowlist().items()))
        self.assertEqual(diff.extract(fixture([name]).replace('1'*40, old), True)['state'], 'UNRECOGNIZED')

    def test_missing_header_truncated_and_oversize_have_no_rows(self):
        cases = [(fixture().replace(diff.HEADER, PRIVATE), True, 'NOT_OBSERVED'),
                 (fixture(), False, 'INCOMPLETE_LOG'),
                 ('x' * diff.MAX_LOG + fixture(), True, 'INCOMPLETE_LOG')]
        for text, complete, state in cases:
            value = diff.extract(text, complete)
            self.assertEqual(value['state'], state)
            self.assertNotIn('rows', value)

    def test_allowlist_tampering_cannot_export(self):
        text = fixture()
        with mock.patch.object(diff, 'ALLOWLIST_SHA256', '0' * 64):
            self.assertEqual(diff.extract(text, True)['state'], 'UNAVAILABLE')

    def test_all_142_changes_fit_eight_bounded_records(self):
        value = diff.extract(fixture(list(diff.allowlist())), True)
        records = diff.records(value)
        self.assertEqual(value['changed_roots'], 142)
        self.assertEqual(len(records), 8)
        self.assertTrue(all(len(row.encode()) <= 8192 for row in records))
        self.assertLess(sum(len(row.encode()) for row in records), 32768)
        rows = [row for payload in records for row in json.loads(payload)['rows']]
        self.assertEqual(len(rows), 142)
        self.assertEqual({row['name'] for row in rows}, set(diff.allowlist()))

    def observation_fixture(self, tmp, text, code=1):
        app = Path(tmp) / 'app'
        private = Path(tmp) / 'keeper-native-private'
        private.mkdir()
        metadata = app / 'artifacts/native/ios/metadata.json'
        metadata.parent.mkdir(parents=True)
        metadata.write_text(json.dumps({'commands': [{'command': ['env', 'BUNDLE_FROZEN=true',
            'BUNDLE_GEMFILE=' + str(app/'Gemfile'), 'bundle', 'exec', 'pod', 'install', '--deployment'],
            'exit_code': code}]}))
        (private / 'command-001.log').write_text(text)
        return app, private

    def test_complete_log_boundary_does_not_insert_newline_in_pair(self):
        # Old observer injected a newline at 64 KiB, even for complete logs.
        text = fixture()
        split = text.index('New Lockfile') + 5
        text = 'x' * (diagnose.WINDOW - split - 1) + '\n' + text
        with tempfile.TemporaryDirectory() as tmp:
            app, private = self.observation_fixture(tmp, text)
            value = diagnose.pod_observation(app, private)
            self.assertEqual(value['checksum_diff']['changed_roots'], 2)
            self.assertEqual(value['exit_code'], 1)

    def test_success_and_timeout_do_not_report_complete_diff(self):
        for code in [0, 124, -9]:
            with tempfile.TemporaryDirectory() as tmp:
                app, private = self.observation_fixture(tmp, fixture(), code)
                self.assertNotIn('checksum_diff', diagnose.pod_observation(app, private))

    def test_original_failure_guard_and_lock_preserved_with_full_emission(self):
        with tempfile.TemporaryDirectory() as tmp:
            app, private = self.observation_fixture(tmp, fixture(list(diff.allowlist())))
            lock = app / 'ios/Podfile.lock'; lock.parent.mkdir(); lock.write_text(PRIVATE)
            before = lock.read_bytes()
            fake = types.SimpleNamespace(roots=lambda: (app,app,app), guard=mock.Mock())
            harness = types.SimpleNamespace(main=mock.Mock(side_effect=RuntimeError(PRIVATE)))
            spec = types.SimpleNamespace(loader=types.SimpleNamespace(exec_module=mock.Mock()))
            with mock.patch.dict(os.environ, {'RUNNER_TEMP':tmp, 'KEEPER_NATIVE_PLATFORM':'IOS'}), \
                 mock.patch.object(diagnose.importlib.util,'spec_from_file_location',return_value=spec), \
                 mock.patch.object(diagnose.importlib.util,'module_from_spec',return_value=harness), \
                 contextlib.redirect_stdout(io.StringIO()) as out:
                self.assertEqual(diagnose.run('prepare', fake, {}), 1)
            self.assertEqual(lock.read_bytes(), before)
            self.assertEqual(fake.guard.call_count, 2)
            self.assertNotIn(PRIVATE, out.getvalue())
            lines = out.getvalue().splitlines()
            self.assertEqual(len(lines), 9)
            summary = json.loads(lines[0].split(' ', 1)[1])
            self.assertEqual(summary['outcome'], 'FAILED')
            self.assertEqual(summary['pod']['exit_code'], 1)
            self.assertEqual(summary['pod']['checksum_diff']['changed_roots'], 142)
            self.assertNotIn('rows', summary['pod']['checksum_diff'])
            self.assertTrue(all(line.startswith('KEEPER_CHECKSUM_DIFF ') for line in lines[1:]))


if __name__ == '__main__':
    unittest.main()
