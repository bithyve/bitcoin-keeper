"""Static/pure-helper contracts only. No installer, build, runner or native command."""
import copy
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest import mock
import yaml
import verify
import provenance

ROOT = Path(__file__).resolve().parent
ENV = {'GITHUB_WORKFLOW_SHA': 'a' * 40, 'GITHUB_RUN_ID': '123', 'GITHUB_RUN_ATTEMPT': '1'}


class ProposalContracts(unittest.TestCase):
    def setUp(self):
        self.environment = mock.patch.dict(os.environ, ENV)
        self.environment.start()
        self.addCleanup(self.environment.stop)
        self.artifact = {'sha256': 'b' * 64, 'path': '/private/app.apk'}
        self.metadata = {'source_sha': verify.SOURCE, 'platform': 'ANDROID',
                         'workflow_sha': ENV['GITHUB_WORKFLOW_SHA'], 'run_id': '123', 'run_attempt': '1',
                         'build': 'PASS', 'smoke': 'PASS', 'smoke_test_cases': 1,
                         'device': {'fresh_disposable_state': True}, 'installed_artifact_verified': True,
                         'built_artifact': self.artifact}
        self.outcomes = {phase: 'success' for phase in verify.PHASES}

    def test_runner_is_first_push_only_read_only_and_bounded(self):
        workflow = yaml.safe_load((ROOT / 'runner.proposed.yml').read_text())
        events = workflow.get('on', workflow.get(True))
        self.assertEqual(events, {'push': {'branches': [verify.RUNNER_BRANCH]}})
        self.assertEqual(workflow['permissions'], {'contents': 'read'})
        self.assertEqual(set(workflow['jobs']), {'ios', 'android'})
        for platform, label, minutes in [('ios', 'macos-15', 65), ('android', 'ubuntu-24.04', 60)]:
            job = workflow['jobs'][platform]
            for required in ["github.event_name == 'push'", "github.event.created == true",
                             "github.event.deleted == false", "github.event.forced == false",
                             'github.run_attempt == 1', 'github.sha == github.workflow_sha',
                             'refs/heads/' + verify.RUNNER_BRANCH]:
                self.assertIn(required, job['if'])
            self.assertEqual(job['runs-on'], label)
            self.assertEqual(job['timeout-minutes'], minutes)
            self.assertNotIn('environment', job)
            for step in job['steps']:
                self.assertNotIn('continue-on-error', step)
                self.assertNotIn('cache', step.get('with', {}))
                if 'uses' in step:
                    self.assertRegex(step['uses'], r'^[A-Za-z0-9_./-]+@[0-9a-f]{40}$')
                    self.assertNotIn('upload-artifact', step['uses'])
            checkouts = [s for s in job['steps'] if s.get('uses', '').startswith('actions/checkout@')]
            self.assertEqual([s['with']['ref'] for s in checkouts],
                             [verify.SOURCE, verify.HARNESS, '${{ github.workflow_sha }}'])
            self.assertTrue(all(s['with']['persist-credentials'] is False for s in checkouts))
            summary = job['steps'][-1]
            self.assertEqual(summary['if'], '${{ always() }}')
            self.assertIn('verify.py" summary', summary['run'])

    def test_emulator_each_command_uses_app_working_directory(self):
        workflow = yaml.safe_load((ROOT / 'runner.proposed.yml').read_text())
        emulator = next(step for step in workflow['jobs']['android']['steps']
                        if step.get('uses', '').startswith('reactivecircus/android-emulator-runner@'))
        self.assertEqual(emulator['with']['working-directory'], 'app')
        commands = [line.strip() for line in emulator['with']['script'].splitlines() if line.strip()]
        self.assertEqual(len(commands), 5)
        self.assertTrue(all(line.startswith('python3 -B ') for line in commands))
        self.assertTrue(any('native_probe.py" startup' in command for command in commands))
        self.assertTrue(any('native_probe.py" bridge' in command for command in commands))

    def test_bootstrap_observation_never_becomes_acceptance(self):
        result = verify.evidence(self.metadata, self.outcomes, 1, self.artifact, 'ANDROID')
        self.assertEqual(result['bootstrap_observation'], 'PASS')
        self.assertEqual(result['acceptance'], 'NOT_ACCEPTED')
        self.assertEqual(result['full_phase_a'], 'NOT VERIFIED')

    def test_failed_skipped_cancelled_or_missing_steps_block(self):
        for phase in ['record', 'prepare', 'build', 'smoke', 'bridge']:
            for outcome in ['failure', 'cancelled', 'skipped', '']:
                with self.subTest(phase=phase, outcome=outcome):
                    outcomes = {**self.outcomes, phase: outcome}
                    result = verify.evidence(self.metadata, outcomes, 1, self.artifact, 'ANDROID')
                    self.assertEqual(result['bootstrap_observation'], 'BLOCKED')

    def test_missing_install_wrong_artifact_and_empty_junit_block(self):
        for field, value in [('installed_artifact_verified', False), ('smoke', 'FAIL'),
                             ('build', 'NOT RUN'), ('smoke_test_cases', 0)]:
            with self.subTest(field=field):
                metadata = {**self.metadata, field: value}
                self.assertEqual(verify.evidence(metadata, self.outcomes, 1, self.artifact,
                                                'ANDROID')['bootstrap_observation'], 'BLOCKED')
        for count, artifact in [(0, self.artifact), (1, {**self.artifact, 'sha256': 'c' * 64})]:
            self.assertEqual(verify.evidence(self.metadata, self.outcomes, count, artifact,
                                            'ANDROID')['bootstrap_observation'], 'BLOCKED')

    def test_wrong_source_platform_runner_or_attempt_rejected(self):
        for field, value in [('source_sha', 'd' * 40), ('platform', 'IOS'),
                             ('workflow_sha', 'e' * 40), ('run_id', '124'), ('run_attempt', '2')]:
            with self.subTest(field=field), self.assertRaises(RuntimeError):
                verify.evidence({**self.metadata, field: value}, self.outcomes, 1,
                                self.artifact, 'ANDROID')

    def test_arbitrary_diagnostics_and_private_paths_are_not_exported(self):
        marker = 'synthetic-private-wallet-text-and-recovery-material'
        metadata = {**self.metadata, 'diagnostics': marker, 'commands': [{'error': marker}],
                    'toolchain': {'node': marker}, 'device': {'fresh_disposable_state': True, 'id': marker}}
        artifact = {**self.artifact, 'path': marker}
        metadata['built_artifact'] = artifact
        result = verify.evidence(metadata, self.outcomes, 1, artifact, 'ANDROID')
        self.assertNotIn(marker, json.dumps(result))

    def test_native_failure_categories_stay_blocked_and_never_export_suffixes(self):
        marker = 'PRIVATE_SYNTHETIC_RECOVERY_TEXT'
        for category in [marker, 'IAP_STORE_UNAVAILABLE ' + marker, [marker], None]:
            result = verify.failure_record({'bridge_failure_category': category, 'error': marker})
            self.assertEqual(result['failure'], 'INCOMPLETE_OR_INVALID_EVIDENCE')
            self.assertNotIn(marker, json.dumps(result))
        result = verify.failure_record({'bridge_failure_category': 'IAP_STORE_UNAVAILABLE'})
        self.assertEqual(result['failure'], 'IAP_STORE_UNAVAILABLE')
        self.assertEqual(result['bootstrap_observation'], 'BLOCKED')
        self.assertEqual(result['acceptance'], 'NOT_ACCEPTED')

    def test_junit_must_have_real_successful_cases(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'result.xml'
            path.write_text('<testsuite><testcase/></testsuite>')
            self.assertEqual(verify.checked_junit(path), 1)
            for content in ['<testsuite/>', '<testsuite><testcase><failure/></testcase></testsuite>',
                            '<testsuite><testcase><error/></testcase></testsuite>',
                            '<testsuite><testcase><skipped/></testcase></testsuite>']:
                path.write_text(content)
                with self.subTest(content=content), self.assertRaises(RuntimeError):
                    verify.checked_junit(path)

    def test_live_source_checks_reject_private_changed_base_and_runner(self):
        valid = [{'full_name': verify.REPOSITORY, 'private': False, 'default_branch': 'sprint'},
                 {'commit': {'sha': verify.BASE}}, {'object': {'sha': ENV['GITHUB_WORKFLOW_SHA']}}]
        with mock.patch.object(verify, 'public_get', side_effect=valid):
            self.assertEqual(verify.current_source(), verify.BASE)
        for index, altered in [(0, {**valid[0], 'private': True}),
                               (0, {**valid[0], 'default_branch': 'changed'}),
                               (1, {'commit': {'sha': 'f' * 40}}),
                               (2, {'object': {'sha': 'f' * 40}})]:
            values = copy.deepcopy(valid)
            values[index] = altered
            with self.subTest(index=index), mock.patch.object(verify, 'public_get', side_effect=values):
                with self.assertRaises(RuntimeError):
                    verify.current_source()

    def test_toolchain_export_accepts_only_numeric_versions(self):
        data = {'toolchain': {'node': 'v22.22.0', 'java': 'openjdk version "17.0.18" 2026-01-20',
                             'xcode': 'Xcode 16.4\nBuild version 16F6', 'sdk': '18.5'}}
        self.assertEqual(verify.safe_versions(data, 'IOS'),
                         {'node': '22.22.0', 'java': '17.0.18', 'xcode': '16.4', 'sdk': '18.5'})
        data['toolchain']['node'] = 'private arbitrary text'
        with self.assertRaises(RuntimeError):
            verify.safe_versions(data, 'IOS')


if __name__ == '__main__':
    unittest.main()
