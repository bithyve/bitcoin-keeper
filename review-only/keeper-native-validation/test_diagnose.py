"""Pure host tests. No network, installer, workflow or native process is invoked."""
import ast
import contextlib
import hashlib
import io
import json
import os
from pathlib import Path
import tempfile
import types
import unittest
from unittest import mock
import urllib.error
import yaml
import diagnose

ROOT = Path(__file__).resolve().parent
PRIVATE = 'synthetic-wallet-recovery-private-text'


class DiagnosticTests(unittest.TestCase):
    def test_source_map_has_exact_digest_and_known_source_sites(self):
        doc = json.loads((ROOT / 'verifier-sites.json').read_text())
        source = (ROOT / 'verify.py').read_bytes()
        self.assertEqual(doc['verify_sha256'], hashlib.sha256(source).hexdigest())
        lines = source.decode().splitlines()
        for line, row in doc['sites'].items():
            self.assertEqual(row['source'], lines[int(line)-1].strip())
            self.assertRegex(row['code'], r'^V[0-9]{3}$')
        self.assertTrue(any("RUNNER_ARCH" in row['source'] for row in doc['sites'].values()))
        self.assertTrue(any("urlopen" in row['source'] for row in doc['sites'].values()))

    def test_error_messages_and_urls_never_exported(self):
        errors = [RuntimeError(PRIVATE), KeyError(PRIVATE), ValueError(PRIVATE),
                  urllib.error.URLError(PRIVATE),
                  urllib.error.HTTPError('https://' + PRIVATE, 403, PRIVATE, {}, None),
                  urllib.error.HTTPError('https://' + PRIVATE, 599, PRIVATE, {}, None)]
        for error in errors:
            value = diagnose.error_kind(error)
            self.assertNotIn(PRIVATE, value)
            self.assertRegex(value, r'^[A-Z_0-9]+$')
        self.assertEqual(diagnose.error_kind(errors[-2]), 'PUBLIC_HTTP_403')
        self.assertEqual(diagnose.error_kind(errors[-1]), 'PUBLIC_HTTP_OTHER')

    def test_pod_patterns_emit_only_enums(self):
        text = '\x1b[31m[!] There were changes to the lockfile in deployment mode:\nSPEC CHECKSUMS:\n ' + PRIVATE
        value = diagnose.classify_pod_text(text)
        self.assertIn('LOCKFILE_CHANGED_IN_DEPLOYMENT', value['matched_categories'])
        self.assertEqual(value['lock_section_mentions'], ['SPEC CHECKSUMS'])
        self.assertNotIn(PRIVATE, json.dumps(value))
        self.assertEqual(diagnose.classify_pod_text(PRIVATE)['matched_categories'], ['UNCLASSIFIED_POD_FAILURE'])

    def test_higher_target_both_upstream_spellings(self):
        for tense in ['requires', 'required']:
            result = diagnose.classify_pod_text('[!] ' + PRIVATE + ' ' + tense + ' a higher minimum deployment target')
            self.assertIn('DEPLOYMENT_TARGET_TOO_LOW', result['matched_categories'])
            self.assertNotIn(PRIVATE, json.dumps(result))

    def test_section_names_without_lock_diff_header_not_exported(self):
        self.assertEqual(diagnose.classify_pod_text('SPEC CHECKSUMS:\n' + PRIVATE)['lock_section_mentions'], [])

    def test_private_pod_files_select_bounded_fixed_record(self):
        with tempfile.TemporaryDirectory() as tmp:
            app = Path(tmp) / 'app'; private = Path(tmp) / 'private'; private.mkdir()
            path = app / 'artifacts/native/ios/metadata.json'; path.parent.mkdir(parents=True)
            path.write_text(json.dumps({'commands': [{'command': ['env', 'BUNDLE_FROZEN=true', 'bundle', 'exec', 'pod', 'install', '--deployment'],
                'exit_code': 1, 'error': PRIVATE, 'path': PRIVATE}], 'wallet': PRIVATE}))
            (private / 'command-001.log').write_text('[!] ' + PRIVATE + ' required a higher minimum deployment target')
            result = diagnose.pod_observation(app, private)
            self.assertEqual(result['status'], 'FAILED')
            self.assertEqual(result['log_window'], 'COMPLETE')
            self.assertIn('DEPLOYMENT_TARGET_TOO_LOW', result['matched_categories'])
            self.assertNotIn(PRIVATE, json.dumps(result))
            (private / 'command-001.log').write_text(PRIVATE * 20000)
            self.assertEqual(diagnose.pod_observation(app, private)['log_window'], 'TRUNCATED')

    def test_unexpected_or_duplicate_command_not_read(self):
        with tempfile.TemporaryDirectory() as tmp:
            app = Path(tmp); path = app / 'artifacts/native/ios/metadata.json'; path.parent.mkdir(parents=True)
            for commands in [[{'command': PRIVATE}], [{'command':['env','BUNDLE_FROZEN=true','bundle','exec','pod','install','--deployment']}]*2]:
                path.write_text(json.dumps({'commands':commands}))
                result = diagnose.pod_observation(app, app)
                self.assertEqual(result['status'],'NOT_OBSERVED')
                self.assertNotIn(PRIVATE,json.dumps(result))

    def test_unknown_phase_cannot_invoke_harness(self):
        with mock.patch('sys.argv', ['diagnose.py', 'build']), contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(diagnose.main(), 1)
        self.assertIn('NOT_ACCEPTED', output.getvalue())

    def test_failed_stage_remains_failed_and_exception_text_is_private(self):
        fake = types.SimpleNamespace(roots=lambda: (ROOT,ROOT,ROOT), stage=mock.Mock(side_effect=RuntimeError(PRIVATE)))
        with mock.patch.dict(os.environ, {'RUNNER_TEMP':'/tmp'}), contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(diagnose.run('stage',fake,{}),1)
        self.assertNotIn(PRIVATE,output.getvalue())
        self.assertIn('NOT_ACCEPTED',output.getvalue())
        self.assertIn('FAILED',output.getvalue())

    def test_passing_stage_still_no_acceptance(self):
        fake = types.SimpleNamespace(roots=lambda: (ROOT,ROOT,ROOT), stage=mock.Mock())
        with mock.patch.dict(os.environ, {'RUNNER_TEMP':'/tmp'}), contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(diagnose.run('stage',fake,{}),0)
        value=json.loads(output.getvalue().split(' ',1)[1])
        self.assertEqual(value['acceptance'],'NOT_ACCEPTED')
        self.assertEqual(value['native_build'],'NOT_RUN')

    def test_real_verifier_trace_is_mapped_without_exception_text(self):
        verify, sites = diagnose.load_modules()
        error = urllib.error.HTTPError('https://' + PRIVATE,403,PRIVATE,{},None)
        with mock.patch.object(verify,'public_get',side_effect=error):
            try:
                verify.current_source()
            except Exception as caught:
                codes=diagnose.verifier_sites(caught,ROOT/'verify.py',sites)
        rows=[row for row in sites.values() if row['code'] in codes]
        self.assertTrue(any(row['function']=='current_source' for row in rows))
        self.assertNotIn(PRIVATE,json.dumps(codes))

    def test_prepare_command_failure_stays_failed_after_successful_guard(self):
        fake=types.SimpleNamespace(roots=lambda:(ROOT,ROOT,ROOT),guard=mock.Mock())
        harness=types.SimpleNamespace(main=mock.Mock(side_effect=RuntimeError(PRIVATE)))
        spec=types.SimpleNamespace(loader=types.SimpleNamespace(exec_module=mock.Mock()))
        with mock.patch.dict(os.environ,{'RUNNER_TEMP':'/tmp','KEEPER_NATIVE_PLATFORM':'IOS'}), \
             mock.patch.object(diagnose.importlib.util,'spec_from_file_location',return_value=spec), \
             mock.patch.object(diagnose.importlib.util,'module_from_spec',return_value=harness), \
             mock.patch.object(diagnose,'pod_observation',return_value={'status':'FAILED'}), \
             contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(diagnose.run('prepare',fake,{}),1)
        value=json.loads(output.getvalue().split(' ',1)[1])
        self.assertEqual(value['outcome'],'FAILED')
        self.assertEqual(value['post_prepare_guard'],'COMPLETED')
        self.assertEqual(fake.guard.call_count,2)
        self.assertNotIn(PRIVATE,output.getvalue())

    def test_successful_prepare_with_failed_final_guard_cannot_pass(self):
        fake=types.SimpleNamespace(roots=lambda:(ROOT,ROOT,ROOT),guard=mock.Mock(
            side_effect=[None,RuntimeError(PRIVATE),RuntimeError(PRIVATE)]))
        harness=types.SimpleNamespace(main=mock.Mock())
        spec=types.SimpleNamespace(loader=types.SimpleNamespace(exec_module=mock.Mock()))
        with mock.patch.dict(os.environ,{'RUNNER_TEMP':'/tmp','KEEPER_NATIVE_PLATFORM':'IOS'}), \
             mock.patch.object(diagnose.importlib.util,'spec_from_file_location',return_value=spec), \
             mock.patch.object(diagnose.importlib.util,'module_from_spec',return_value=harness), \
             mock.patch.object(diagnose,'pod_observation',return_value={'status':'COMPLETED'}), \
             contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(diagnose.run('prepare',fake,{}),1)
        value=json.loads(output.getvalue().split(' ',1)[1])
        self.assertEqual(value['post_prepare_guard'],'NOT_RUN_AFTER_GUARD_FAILURE')
        self.assertEqual(value['outcome'],'FAILED')
        self.assertEqual(fake.guard.call_count,2)
        self.assertNotIn(PRIVATE,output.getvalue())

    def test_pinned_harness_entrypoint_and_phase_arguments_are_used(self):
        fake=types.SimpleNamespace(roots=lambda:(ROOT,ROOT,ROOT),guard=mock.Mock())
        called=[]
        def pinned_main():
            self.assertEqual(diagnose.sys.argv,[str(ROOT/'.github/native/hosted_native.py'),'record'])
            called.append(True)
        harness=types.SimpleNamespace(main=pinned_main)
        spec=types.SimpleNamespace(loader=types.SimpleNamespace(exec_module=mock.Mock()))
        before=diagnose.sys.argv
        with mock.patch.dict(os.environ,{'RUNNER_TEMP':'/tmp','KEEPER_NATIVE_PLATFORM':'IOS'}), \
             mock.patch.object(diagnose.importlib.util,'spec_from_file_location',return_value=spec), \
             mock.patch.object(diagnose.importlib.util,'module_from_spec',return_value=harness), \
             contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(diagnose.run('record',fake,{}),0)
        self.assertEqual(called,[True])
        self.assertIs(diagnose.sys.argv,before)

    def test_workflow_is_bounded_first_push_and_diagnostic_only(self):
        w=yaml.safe_load((ROOT/'diagnostic.proposed.yml').read_text())
        self.assertEqual(w['on'],{'push':{'branches':['codex/native-runtime-prepare-once-bccb6334']}})
        self.assertEqual(w['permissions'],{'contents':'read'})
        self.assertEqual(w['concurrency'],{'group':'keeper-one-time-native-prerequisite','cancel-in-progress':False})
        for platform,cap,count in [('ios',30,9)]:
            job=w['jobs'][platform]; self.assertEqual(job['timeout-minutes'],cap);self.assertEqual(len(job['steps']),count)
            for clause in ['github.event.created == true','github.run_attempt == 1','github.sha == github.workflow_sha',
                           'github.event.repository.private == false','github.event.forced == false']:
                self.assertIn(clause,job['if'])
            for step in job['steps']:
                self.assertNotIn('continue-on-error',step)
                if 'uses' in step:
                    self.assertRegex(step['uses'],r'@[0-9a-f]{40}$')
                    self.assertNotIn('emulator',step['uses']);self.assertNotIn('upload-artifact',step['uses'])
                if 'run' in step:
                    self.assertRegex(step['run'],r'diagnose.py" (stage|record|prepare)$')
                if step.get('uses','').startswith('actions/checkout@'):
                    self.assertFalse(step['with']['persist-credentials'])
        self.assertEqual(w['jobs']['ios']['steps'][-1]['id'],'prepare')
        self.assertEqual(set(w['jobs']), {'ios'})
        self.assertEqual(w['jobs']['ios']['runs-on'], 'macos-15')
        self.assertEqual(w['jobs']['ios']['steps'][-1]['timeout-minutes'], 24)
        self.assertEqual(w['env']['KEEPER_POD_LOCK_REPAIR'], '0')
        self.assertEqual(w['env']['BUNDLE_RETRY'], '0')
        self.assertEqual((ROOT/'diagnostic.proposed.yml').read_bytes(), (ROOT.parents[1]/'.github/workflows/keeper-one-time-native-diagnostic.yml').read_bytes())


if __name__ == '__main__':
    unittest.main()
