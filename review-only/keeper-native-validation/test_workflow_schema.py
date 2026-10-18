"""Actual actionlint validation; supply the verified upstream tool explicitly."""
import hashlib
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent
BINARY_SHA256 = 'c872d6db8c6bf83a8eaa704fc93999f027d55dffbc63b8a6abdccb47df5f4cd4'


@unittest.skipUnless(os.environ.get('KEEPER_ACTIONLINT'), 'Requires verified actionlint1.7.12; schema validation NOT RUN')
class WorkflowSchemaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tool = Path(os.environ['KEEPER_ACTIONLINT'])
        if not cls.tool.is_absolute() or hashlib.sha256(cls.tool.read_bytes()).hexdigest() != BINARY_SHA256:
            raise RuntimeError('ACTIONLINT_IDENTITY_MISMATCH')

    def test_entire_candidate_and_proposed_workflow_pass_real_linter(self):
        files = [ROOT.parents[1]/'.github/workflows/keeper-one-time-native-diagnostic.yml',
                 ROOT/'diagnostic.proposed.yml']
        result = subprocess.run([str(self.tool), '-color=false', *map(str, files)],
                                cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_rejected_published_defaults_expression_fails_real_linter(self):
        source = subprocess.check_output(['git', 'show',
            '210fb5768d21ce2a0294e369155a9a6968429e43:.github/workflows/keeper-one-time-native-diagnostic.yml'], cwd=ROOT)
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/'rejected.yml'; path.write_bytes(source)
            result = subprocess.run([str(self.tool), '-color=false', str(path)],
                                    cwd=ROOT, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('context "github" is not allowed here', result.stdout + result.stderr)
        self.assertIn('[expression]', result.stdout + result.stderr)
