"""Independent bounded tool-hashing regressions; no network or installation."""
import hashlib
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

import checksum_observer as obs
from fixture_factory import make_case

ROOT = Path(__file__).resolve().parent
RUBY = Path(os.environ.get('KEEPER_FIXTURE_RUBY', ''))
RUBY_SHA256 = os.environ.get('KEEPER_FIXTURE_RUBY_SHA256', '')


class IndependentToolReaderTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

    def file(self, name, data):
        path = self.root / name
        path.write_bytes(data)
        return path

    @unittest.skipUnless(RUBY.is_file() and RUBY_SHA256,
                         'Set KEEPER_FIXTURE_RUBY and its independently verified SHA256')
    def test_real_verified_ruby_binary_passes_local_preflight(self):
        self.assertTrue(RUBY.is_file(), 'An explicitly selected fixture Ruby is required')
        self.assertGreater(RUBY.stat().st_size, obs.MAX_FILE)
        _, policy, allow, baseline = make_case(str(self.root / 'case'))
        policy['roots'].append(str(RUBY.parent))
        policy['tool_files']['ruby'] = {'path': str(RUBY), 'sha256': RUBY_SHA256}
        with mock.patch.object(obs, 'load_inputs', return_value=(allow, baseline)):
            self.assertEqual(obs.preflight(policy), obs.identity(policy))

    def test_streamed_digest_matches_independent_hash_and_bounds_read_chunks(self):
        data = bytes(range(256)) * 1025
        path = self.file('tool', data)
        reads = []
        original_read = os.read
        def tracked_read(fd, size):
            reads.append(size)
            return original_read(fd, size)
        with mock.patch.object(obs.os, 'read', side_effect=tracked_read):
            digest = obs.SafeReader([str(self.root)]).hash_tool(str(path))
        self.assertEqual(digest, hashlib.sha256(data).hexdigest())
        self.assertGreater(len(reads), 1)
        self.assertTrue(all(0 < size <= 65536 for size in reads))

    def test_empty_tool_file_has_standard_empty_digest(self):
        path = self.file('empty', b'')
        self.assertEqual(obs.SafeReader([str(self.root)]).hash_tool(str(path)),
                         hashlib.sha256(b'').hexdigest())

    def test_per_file_limit_accepts_boundary_and_rejects_oversize_before_read(self):
        exact = self.file('exact', b'x' * 17)
        oversized = self.file('large', b'x' * 18)
        with mock.patch.object(obs, 'MAX_TOOL_FILE', 17):
            reader = obs.SafeReader([str(self.root)])
            self.assertEqual(reader.hash_tool(str(exact)), hashlib.sha256(b'x' * 17).hexdigest())
            with mock.patch.object(obs.os, 'read', side_effect=AssertionError('oversize file read')):
                with self.assertRaises(obs.Invalid):
                    reader.hash_tool(str(oversized))

    def test_aggregate_tool_budget_counts_repeated_reads(self):
        path = self.file('tool', b'x' * 10)
        with mock.patch.object(obs, 'MAX_TOOL_TOTAL', 20):
            reader = obs.SafeReader([str(self.root)])
            reader.hash_tool(str(path))
            reader.hash_tool(str(path))
            with mock.patch.object(obs.os, 'read', side_effect=AssertionError('over-budget read')):
                with self.assertRaises(obs.Invalid):
                    reader.hash_tool(str(path))

    def test_input_and_tool_budgets_are_independent_and_input_cap_unchanged(self):
        small = self.file('input', b'i' * 6)
        tool = self.file('tool', b't' * 10)
        with mock.patch.object(obs, 'MAX_FILE', 7), mock.patch.object(obs, 'MAX_TOTAL', 7), \
             mock.patch.object(obs, 'MAX_TOOL_FILE', 11), mock.patch.object(obs, 'MAX_TOOL_TOTAL', 11):
            for tool_first in (False, True):
                with self.subTest(tool_first=tool_first):
                    reader = obs.SafeReader([str(self.root)])
                    if tool_first:
                        reader.hash_tool(str(tool))
                        self.assertEqual(reader.read(str(small)), b'i' * 6)
                    else:
                        self.assertEqual(reader.read(str(small)), b'i' * 6)
                        reader.hash_tool(str(tool))
                    with self.assertRaises(obs.Invalid):
                        reader.read(str(small))
                    with self.assertRaises(obs.Invalid):
                        reader.hash_tool(str(tool))
            with self.assertRaises(obs.Invalid):
                obs.SafeReader([str(self.root)]).read(str(tool))

    def test_mutation_during_hash_is_rejected(self):
        path = self.file('tool', b'a' * 70000)
        original_read = os.read
        mutated = False
        def mutate(fd, size):
            nonlocal mutated
            data = original_read(fd, size)
            if data and not mutated:
                mutated = True
                path.write_bytes(b'b' * 70001)
            return data
        with mock.patch.object(obs.os, 'read', side_effect=mutate):
            with self.assertRaises(obs.Invalid):
                obs.SafeReader([str(self.root)]).hash_tool(str(path))
        self.assertTrue(mutated)

    def test_symlink_components_and_outside_root_are_rejected(self):
        approved = self.root / 'approved'; approved.mkdir()
        outside = self.root / 'approved-other'; outside.mkdir()
        target = outside / 'tool'; target.write_bytes(b'private tool')
        (approved / 'directory-link').symlink_to(outside, target_is_directory=True)
        (approved / 'file-link').symlink_to(target)
        reader = obs.SafeReader([str(approved)])
        for path in (target, approved / 'directory-link/tool', approved / 'file-link'):
            with self.subTest(path=path.name):
                with self.assertRaises(obs.Invalid):
                    reader.hash_tool(str(path))

    def test_directory_and_unix_socket_are_rejected(self):
        directory = self.root / 'directory'; directory.mkdir()
        sock_path = self.root / 'socket'
        with socket.socket(socket.AF_UNIX) as sock:
            sock.bind(str(sock_path))
            for path in (directory, sock_path):
                with self.subTest(path=path.name):
                    with self.assertRaises(obs.Invalid):
                        obs.SafeReader([str(self.root)]).hash_tool(str(path))

    def test_fifo_is_rejected_without_a_writer_or_hang(self):
        fifo = self.root / 'fifo'; os.mkfifo(fifo)
        script = ('import checksum_observer as o,sys\n'
                  'try: o.SafeReader([sys.argv[1]]).hash_tool(sys.argv[2])\n'
                  'except o.Invalid: raise SystemExit(0)\n'
                  'raise SystemExit(1)\n')
        try:
            result = subprocess.run([sys.executable, '-B', '-c', script, str(self.root), str(fifo)],
                                    cwd=ROOT, capture_output=True, timeout=1)
        except subprocess.TimeoutExpired:
            self.fail('Tool hash waited for a FIFO writer')
        self.assertEqual(result.returncode, 0)


if __name__ == '__main__':
    unittest.main()
