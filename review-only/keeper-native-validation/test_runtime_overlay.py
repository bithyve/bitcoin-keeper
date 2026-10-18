"""Local git/text fixtures only; no dependency, network, or native execution."""
import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest import mock
import verify

HERE=Path(__file__).resolve().parent
REVIEW=HERE.parents[1]

class RuntimeOverlayTests(unittest.TestCase):
    def make_fixture(self, root):
        app=root/'app';app.mkdir()
        subprocess.run(['git','init','-q',str(app)],check=True)
        for name in ['Gemfile','Gemfile.lock','ios/Podfile.lock','yarn.lock']:
            target=app/name;target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(verify.git(REVIEW,'show',verify.SOURCE+':'+name))
        target=app/'.github/native';target.mkdir(parents=True)
        for name in verify.HARNESS_FILES:
            (target/name).write_bytes(verify.git(REVIEW,'show',verify.HARNESS+':.github/native/'+name))
        return app
    def test_exact_patches_apply_and_lock_inputs_remain_unchanged(self):
        with tempfile.TemporaryDirectory() as tmp:
            app=self.make_fixture(Path(tmp))
            before={name:(app/name).read_bytes() for name in ['ios/Podfile.lock','yarn.lock']}
            verify.apply_runtime_patches(app,REVIEW)
            verify.runtime_file_guard(app)
            for name,expected in verify.STAGED_HARNESS_FILES.items():
                self.assertEqual(verify.digest(app/'.github/native'/name),expected)
            for name,data in before.items():self.assertEqual((app/name).read_bytes(),data)
            self.assertFalse((app/'.github/tests/test_frozen_ruby_bundle.py').exists())
    def test_tampered_patch_stops_before_git_mutation(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);patches=root/verify.PROPOSAL_PATH;patches.mkdir(parents=True)
            for name in verify.RUNTIME_PATCHES:shutil.copyfile(HERE/name,patches/name)
            with (patches/'app-runtime.patch').open('ab') as f:f.write(b'\n')
            with mock.patch.object(verify,'git') as git:
                with self.assertRaises(RuntimeError):verify.apply_runtime_patches(root,root)
                git.assert_not_called()
    def test_modified_candidate_gem_lock_fails_closed(self):
        with tempfile.TemporaryDirectory() as tmp:
            app=self.make_fixture(Path(tmp));verify.apply_runtime_patches(app,REVIEW)
            with (app/'Gemfile.lock').open('ab') as f:f.write(b'\n')
            with self.assertRaises(RuntimeError):verify.runtime_file_guard(app)
    def test_source_harness_runner_parent_and_ios_pins_are_explicit(self):
        self.assertEqual(verify.SOURCE,'bccb63348754e7a7975ea140717d31be214f0801')
        self.assertEqual(verify.HARNESS,'0984c5b97e7e8326d6856ba662274ecf325e5e0f')
        source=(HERE/'verify.py').read_text()
        self.assertIn("== '3535a34109c10b7baba310a41d4a277da359c064'",source)
        self.assertIn("require(os.environ.get('KEEPER_NATIVE_PLATFORM') == 'IOS')",source)
        self.assertIn("require(not git(app, 'diff', 'HEAD', '--', 'yarn.lock', 'ios/Podfile.lock'))",source)

if __name__=='__main__':unittest.main()
