"""Source-derived JSON model, not a captured podspec or Ruby execution."""
import copy
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest import mock
import yaml
import verify

ROOT = Path(__file__).resolve().parent
OLD = '30215ceafa12cccff41931253d1d52e5cbe9fd4a'
NEW = 'fc261b849ebacce25435593cde583acd48039bd0'


class HermesCheckoutTests(unittest.TestCase):
    def test_workflow_level_run_defaults_are_literal_and_workspace_relative(self):
        workflow = yaml.safe_load((ROOT/'diagnostic.proposed.yml').read_text())
        # GitHub rejects contexts/expressions at workflow-level defaults.run.
        # YAML parsing alone did not catch the rejected github.workspace value.
        defaults = workflow['defaults']['run']
        self.assertNotIn('${{', json.dumps(defaults))
        self.assertEqual(defaults, {'shell': 'bash', 'working-directory': '.'})
        with tempfile.TemporaryDirectory() as tmp:
            cwd = Path(tmp) / defaults['working-directory']
            actual = subprocess.check_output(['bash', '-c', 'pwd -P'], cwd=cwd, text=True).strip()
            self.assertEqual(Path(actual), Path(tmp).resolve())

    def test_pinned_checkout_order_has_no_app_input_path_collision(self):
        workflow = yaml.safe_load((ROOT/'diagnostic.proposed.yml').read_text())
        steps = workflow['jobs']['ios']['steps']
        checkouts = [step for step in steps if step.get('uses', '').startswith('actions/checkout@')]
        self.assertEqual(checkouts, steps[:3])
        self.assertEqual([step['with']['path'] for step in checkouts], ['.', 'harness', 'review'])
        self.assertEqual([step['with']['ref'] for step in checkouts],
                         [verify.SOURCE, verify.HARNESS, '${{ github.workflow_sha }}'])
        self.assertTrue(all(step['with']['persist-credentials'] is False for step in checkouts))
        self.assertEqual(subprocess.check_output(['git', 'ls-tree', '--name-only', verify.SOURCE,
                                                 '--', 'harness', 'review'], cwd=ROOT), b'')

    def test_exact_old_and_new_checksums_differ_only_in_checkout_component(self):
        raw = (ROOT / 'hermes-root-source-model.json').read_bytes()
        self.assertEqual(hashlib.sha1(raw).hexdigest(), OLD)
        baseline = json.loads(raw)
        current = copy.deepcopy(baseline)
        value = current['user_target_xcconfig']['HERMES_CLI_PATH']
        self.assertTrue(value.endswith('/node_modules/hermes-compiler/hermesc/osx-bin/hermesc'))
        current['user_target_xcconfig']['HERMES_CLI_PATH'] = value.replace('/node_modules/', '/app/node_modules/', 1)
        self.assertEqual(hashlib.sha1((json.dumps(current, indent=2)+'\n').encode()).hexdigest(), NEW)
        current['user_target_xcconfig']['HERMES_CLI_PATH'] = value
        self.assertEqual(current, baseline)
        self.assertEqual(baseline['version'], '0.14.1')
        self.assertEqual(baseline['subspecs'][0]['name'], 'Pre-built')
        self.assertIn('/0.14.1/', baseline['source']['http'])

    def test_model_has_no_empty_containers_for_json_whitespace_hypothesis(self):
        def walk(value):
            if isinstance(value, (list, dict)):
                self.assertTrue(value)
                for child in value.values() if isinstance(value, dict) else value:
                    walk(child)
        walk(json.loads((ROOT/'hermes-root-source-model.json').read_text()))

    def test_actual_workflow_relocation_preserves_clean_app_and_input_bytes(self):
        workflow = yaml.safe_load((ROOT/'diagnostic.proposed.yml').read_text())
        steps = workflow['jobs']['ios']['steps']
        self.assertEqual(steps[0]['with']['path'], '.')
        move = steps[3]
        self.assertEqual(move['name'], 'Move reviewed inputs outside application checkout')
        self.assertEqual(workflow['defaults']['run']['working-directory'], '.')
        for step in steps:
            if 'run' in step and step != move:
                self.assertIn('$RUNNER_TEMP/keeper-native-inputs/review/', step['run'])
        with tempfile.TemporaryDirectory() as tmp:
            app=Path(tmp)/'workspace'; temp=Path(tmp)/'runner-temp'
            app.mkdir(); temp.mkdir()
            subprocess.run(['git','init','-q',str(app)],check=True)
            for name in ('harness','review'):
                (app/name).mkdir(); (app/name/'identity').write_text(name)
            env=dict(os.environ,GITHUB_WORKSPACE=str(app),RUNNER_TEMP=str(temp))
            result=subprocess.run(['bash','--noprofile','--norc','-e','-o','pipefail','-c',move['run']],cwd=app,env=env,capture_output=True)
            self.assertEqual(result.returncode,0)
            with mock.patch.dict(os.environ,env):
                actual,harness,review=verify.roots()
            self.assertEqual(actual,app)
            self.assertEqual(harness.readlink() if harness.is_symlink() else harness, temp/'keeper-native-inputs/harness')
            self.assertEqual((harness/'identity').read_text(),'harness')
            self.assertEqual((review/'identity').read_text(),'review')
            self.assertEqual(subprocess.check_output(['git','status','--porcelain'],cwd=app),b'')
            # Existing destination cannot be overwritten on a repeated stage.
            again=subprocess.run(['bash','-e','-o','pipefail','-c',move['run']],cwd=app,env=env,capture_output=True)
            self.assertNotEqual(again.returncode,0)
            self.assertEqual((review/'identity').read_text(),'review')
