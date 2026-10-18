"""Synthetic credentials and in-memory transports only; no network or secrets."""
import contextlib
import io
import json
import os
from pathlib import Path
import unittest
from unittest import mock
import urllib.error
import urllib.request

import diagnose
import verify
import yaml

TOKEN = 'synthetic.header.payload-signature_DO_NOT_EXPORT~+/=='
ROOT = Path(__file__).resolve().parent


def trusted():
    return {
        'GITHUB_ACTIONS': 'true', 'GITHUB_REPOSITORY': verify.REPOSITORY,
        'GITHUB_SERVER_URL': 'https://github.com', 'GITHUB_API_URL': 'https://api.github.com',
        'GITHUB_EVENT_NAME': 'push', 'GITHUB_REF': 'refs/heads/' + verify.RUNNER_BRANCH,
        'GITHUB_WORKFLOW_REF': verify.REPOSITORY + '/.github/workflows/'
            'keeper-one-time-native-diagnostic.yml@refs/heads/' + verify.RUNNER_BRANCH,
        'GITHUB_RUN_ATTEMPT': '1', 'GITHUB_SHA': 'a' * 40, 'GITHUB_WORKFLOW_SHA': 'a' * 40,
        'KEEPER_PROVENANCE_TOKEN': TOKEN, 'RUNNER_TEMP': '/tmp',
    }


class Reply(io.BytesIO):
    status = 200


class ApiAuthTests(unittest.TestCase):
    def setUp(self):
        self.env = mock.patch.dict(os.environ, {}, clear=True)
        self.env.start(); self.addCleanup(self.env.stop)
        self.cache = mock.patch.object(verify, '_API_TOKEN', None)
        self.cache.start(); self.addCleanup(self.cache.stop)
        self.net = mock.patch.object(urllib.request.OpenerDirector, 'open')
        self.open = self.net.start(); self.addCleanup(self.net.stop)
        self.open.return_value = Reply(b'{"ok":true}')

    def test_bearer_grammar_accepts_opaque_formats_without_decoding(self):
        for token in ('synthetic.header.signature', 'synthetic-opaque~+/==', 'a' * 4096):
            with mock.patch.dict(os.environ, trusted(), clear=True), \
                 mock.patch.object(verify, '_API_TOKEN', None):
                os.environ['KEEPER_PROVENANCE_TOKEN'] = token
                self.open.return_value = Reply(b'{"ok":true}')
                verify.public_get('')
                self.assertEqual(self.open.call_args.args[0].get_header('Authorization'), 'Bearer ' + token)

    def test_bearer_grammar_rejects_controls_spacing_and_invalid_padding(self):
        invalid = ['=', '=abc', 'abc=def', 'abc:def', 'abc,def', 'abc;def', 'é', 'a' * 4097]
        invalid += ['abc' + chr(i) + 'def' for i in list(range(33)) + [127]]
        for token in invalid:
            with mock.patch.object(verify.os, 'environ', dict(trusted(), KEEPER_PROVENANCE_TOKEN=token)), \
                 mock.patch.object(verify, '_API_TOKEN', None):
                with self.assertRaisesRegex(RuntimeError, '^INPUT_OR_EVIDENCE_CHECK_FAILED$'):
                    verify.public_get('')
        self.open.assert_not_called()

    def test_exact_origin_and_step_token_consumed_and_reused(self):
        with mock.patch.dict(os.environ, trusted()):
            for endpoint in ['', '/branches/sprint', '/git/ref/heads/' + verify.RUNNER_BRANCH]:
                self.open.return_value = Reply(b'{"ok":true}')
                self.assertEqual(verify.public_get(endpoint), {'ok': True})
                request = self.open.call_args.args[0]
                self.assertEqual(request.full_url, 'https://api.github.com/repos/' + verify.REPOSITORY + endpoint)
                self.assertEqual(request.get_method(), 'GET')
                self.assertEqual(request.unredirected_hdrs['Authorization'], 'Bearer ' + TOKEN)
                self.assertNotIn('Authorization', request.headers)
                self.assertEqual(self.open.call_args.kwargs, {'timeout': 20})
                self.assertNotIn('KEEPER_PROVENANCE_TOKEN', os.environ)

    def test_token_removed_before_input_git_subprocess(self):
        with mock.patch.dict(os.environ, trusted()), mock.patch.object(verify, 'roots') as roots:
            def stop_before_git():
                self.assertNotIn('KEEPER_PROVENANCE_TOKEN', os.environ)
                raise RuntimeError('STOP_FIXTURE')
            roots.side_effect = stop_before_git
            with self.assertRaisesRegex(RuntimeError, 'STOP_FIXTURE'):
                verify.verify_inputs()
        self.open.assert_not_called()

    def test_untrusted_or_missing_actions_context_never_sends_token(self):
        for key in trusted():
            if key in ('KEEPER_PROVENANCE_TOKEN', 'RUNNER_TEMP'):
                continue
            for value in (None, 'wrong'):
                with self.subTest(key=key, value=value), mock.patch.dict(os.environ, trusted(), clear=True):
                    if value is None: os.environ.pop(key)
                    else: os.environ[key] = value
                    with self.assertRaisesRegex(RuntimeError, '^INPUT_OR_EVIDENCE_CHECK_FAILED$'):
                        verify.public_get('')
                    self.assertNotIn('KEEPER_PROVENANCE_TOKEN', os.environ)
        self.open.assert_not_called()

    def test_missing_invalid_or_replaced_token_fails_closed(self):
        for token in (None, '', 'bad\r\nHeader: injected', 'a' * 4097):
            with self.subTest(token=bool(token)), mock.patch.dict(os.environ, trusted(), clear=True):
                if token is None: os.environ.pop('KEEPER_PROVENANCE_TOKEN')
                else: os.environ['KEEPER_PROVENANCE_TOKEN'] = token
                with self.assertRaisesRegex(RuntimeError, '^INPUT_OR_EVIDENCE_CHECK_FAILED$'):
                    verify.public_get('')
        with mock.patch.dict(os.environ, trusted()):
            verify.api_token()
            os.environ['KEEPER_PROVENANCE_TOKEN'] = 'replacement'
            with self.assertRaises(RuntimeError): verify.public_get('')
        self.open.assert_not_called()

    def test_outside_actions_is_public_and_ignores_unrelated_credentials(self):
        with mock.patch.dict(os.environ, {'GITHUB_TOKEN': TOKEN, 'GH_TOKEN': TOKEN}):
            verify.public_get('')
        self.assertIsNone(self.open.call_args.args[0].get_header('Authorization'))

    def test_workflow_grants_unchanged_and_token_is_only_in_verifier_steps(self):
        workflow = yaml.safe_load((ROOT / 'diagnostic.proposed.yml').read_text())
        self.assertEqual(workflow['permissions'], {'contents': 'read'})
        self.assertNotIn('KEEPER_PROVENANCE_TOKEN', workflow['env'])
        job = workflow['jobs']['ios']
        self.assertNotIn('permissions', job)
        self.assertNotIn('KEEPER_PROVENANCE_TOKEN', job['env'])
        for step in job['steps']:
            if 'diagnose.py' in step.get('run', ''):
                self.assertEqual(step['env'], {'KEEPER_PROVENANCE_TOKEN': '${{ github.token }}'})
            else:
                self.assertNotIn('KEEPER_PROVENANCE_TOKEN', step.get('env', {}))

    def test_cached_token_cannot_survive_context_change(self):
        with mock.patch.dict(os.environ, trusted()):
            verify.api_token()
            os.environ['GITHUB_ACTIONS'] = 'false'
            with self.assertRaises(RuntimeError): verify.public_get('')
        self.open.assert_not_called()

    def test_authenticated_transport_failure_has_no_fallback(self):
        for error in (TimeoutError('fixture'), urllib.error.URLError('fixture')):
            with mock.patch.dict(os.environ, trusted(), clear=True), \
                 mock.patch.object(verify, '_API_TOKEN', None):
                self.open.reset_mock(); self.open.side_effect = error
                with self.assertRaises(type(error)) as caught: verify.public_get('')
                self.assertIs(caught.exception, error)
                self.open.assert_called_once()

    def test_invalid_endpoints_never_send_request(self):
        for endpoint in ('https://evil.invalid', '//evil.invalid', '/../../', '?x=1',
                         '/branches/sprint?x=1', '/git/ref/heads/other'):
            with self.assertRaises(RuntimeError): verify.public_get(endpoint)
        self.open.assert_not_called()

    def test_public_quota_exhaustion_preserves_original_error_without_retry(self):
        error = urllib.error.HTTPError('https://api.github.com/repos/' + verify.REPOSITORY,
            403, 'Forbidden', {'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '0'},
            io.BytesIO(b'{"message":"API rate limit exceeded."}'))
        self.open.side_effect = error
        with self.assertRaises(urllib.error.HTTPError) as caught: verify.current_source()
        self.assertIs(caught.exception, error)
        self.open.assert_called_once()
        self.assertIsNone(self.open.call_args.args[0].get_header('Authorization'))
        self.assertEqual(diagnose.error_kind(error), 'PUBLIC_HTTP_403')

    def test_authenticated_errors_are_redacted_fail_closed_and_not_retried(self):
        _, sites = diagnose.load_modules()
        for status in (401, 403, 429, 500):
            with self.subTest(status=status), mock.patch.dict(os.environ, trusted(), clear=True), \
                 mock.patch.object(verify, '_API_TOKEN', None), \
                 mock.patch.object(verify, 'roots', return_value=(ROOT, ROOT, ROOT)), \
                 mock.patch.object(verify, 'stage', side_effect=verify.current_source), \
                 contextlib.redirect_stdout(io.StringIO()) as output:
                self.open.reset_mock()
                self.open.side_effect = urllib.error.HTTPError('https://api.github.com/' + TOKEN,
                    status, TOKEN, {'Authorization': TOKEN, 'Set-Cookie': TOKEN},
                    io.BytesIO(json.dumps({'message': 'Bad credentials. ' + TOKEN}).encode()))
                self.assertEqual(diagnose.run('stage', verify, sites), 1)
                self.open.assert_called_once()
                self.assertNotIn(TOKEN, output.getvalue())
                self.assertIn('NOT_ACCEPTED', output.getvalue())
                self.assertIn('FAILED', output.getvalue())

    def test_repository_and_branch_checks_remain_fail_closed(self):
        valid = [{'full_name': verify.REPOSITORY, 'private': False, 'default_branch': 'sprint'},
                 {'commit': {'sha': verify.BASE}}, {'object': {'sha': 'a' * 40}}]
        variants = [(0, 'full_name', 'other/repo'), (0, 'private', True),
                    (0, 'default_branch', 'other'), (1, 'commit', {'sha': 'b' * 40}),
                    (2, 'object', {'sha': 'b' * 40})]
        for index, key, value in variants:
            data = json.loads(json.dumps(valid)); data[index][key] = value
            with mock.patch.dict(os.environ, {'GITHUB_WORKFLOW_SHA': 'a' * 40}), \
                 mock.patch.object(verify, 'public_get', side_effect=data):
                with self.assertRaises(RuntimeError): verify.current_source()

    def test_redirects_never_replay_even_same_origin_and_proxies_disabled(self):
        # Exercise the real opener redirect chain using an in-memory HTTPS handler.
        self.net.stop()
        seen = []
        class Transport(urllib.request.HTTPSHandler):
            def https_open(self, request):
                seen.append(request)
                response = urllib.response.addinfourl(io.BytesIO(b''), {'Location': self.target}, request.full_url, self.code)
                response.msg = 'Redirect'
                return response
        transport = Transport()
        build = urllib.request.build_opener
        def fake_build(*handlers):
            proxies = [h for h in handlers if isinstance(h, urllib.request.ProxyHandler)]
            self.assertEqual(proxies[0].proxies, {})
            return build(*handlers, transport)
        for target in ('https://evil.invalid/' + TOKEN, 'http://api.github.com/',
                       'https://api.github.com/repos/' + verify.REPOSITORY):
            for status in (301, 302, 303, 307, 308):
                seen.clear(); transport.target = target; transport.code = status
                with mock.patch.dict(os.environ, trusted(), clear=True), \
                     mock.patch.object(verify, '_API_TOKEN', None), \
                     mock.patch.object(urllib.request, 'build_opener', side_effect=fake_build):
                    with self.assertRaises(urllib.error.HTTPError) as caught: verify.public_get('')
                    self.assertEqual(caught.exception.code, status)
                    self.assertEqual(len(seen), 1)
                    self.assertEqual(seen[0].host, 'api.github.com')


if __name__ == '__main__':
    unittest.main()
