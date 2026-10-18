"""Deterministic fixtures only: no request, installer or native execution."""
import contextlib
from email.message import Message
import io
import json
import os
from pathlib import Path
import types
import unittest
from unittest import mock
import urllib.error
import urllib.request

import diagnose
import http_evidence as evidence

ROOT = Path(__file__).resolve().parent
PRIVATE = 'synthetic-wallet-private-SECRET-123'


class Body(io.BytesIO):
    def __init__(self, value):
        super().__init__(value)
        self.read_sizes = []

    def read(self, size=-1):
        self.read_sizes.append(size)
        return super().read(size)


def response(body=b'', headers=(), status=403):
    fields = Message()
    for key, value in headers:
        fields[key] = value
    stream = Body(body)
    error = urllib.error.HTTPError('https://' + PRIVATE, status, PRIVATE, fields, stream)
    return error, stream


def json_response(message, **kwargs):
    return response(json.dumps({'message': message, 'documentation_url': 'https://' + PRIVATE,
                                'secret': PRIVATE}).encode(), **kwargs)


class HttpEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.network = mock.patch.object(urllib.request, 'urlopen', side_effect=AssertionError('NO_NETWORK'))
        self.network.start()
        self.addCleanup(self.network.stop)

    def assert_private(self, value):
        output = json.dumps(value)
        self.assertNotIn(PRIVATE, output)
        self.assertNotIn('https://', output)
        self.assertLess(len(output.encode()), 4096)
        self.assertFalse(value['issuer_verified'])

    def test_403_message_variants_are_fixed_declarations(self):
        fixtures = [
            ('API rate limit exceeded for ' + PRIVATE, 'PRIMARY_RATE_LIMIT_REPORTED'),
            ('You have exceeded a secondary rate limit. ' + PRIVATE, 'SECONDARY_RATE_LIMIT_REPORTED'),
            ('Resource not accessible by integration: ' + PRIVATE, 'INTEGRATION_PERMISSION_REPORTED'),
            ('Resource not accessible by personal access token. ' + PRIVATE, 'TOKEN_PERMISSION_REPORTED'),
            ('Requires authentication (' + PRIVATE + ')', 'AUTHENTICATION_REQUIRED_REPORTED'),
            ('Bad credentials. ' + PRIVATE, 'BAD_CREDENTIALS_REPORTED'),
            ('Service unavailable. ' + PRIVATE, 'SERVICE_UNAVAILABLE_REPORTED'),
            ('Internal Server Error: ' + PRIVATE, 'SERVER_ERROR_REPORTED'),
            ('Forbidden ' + PRIVATE, 'UNKNOWN'),
        ]
        for message, category in fixtures:
            with self.subTest(category=category):
                error, stream = json_response(message)
                result = evidence.extract(error)
                self.assertEqual(result['status'], 403)
                self.assertEqual(result['body']['message_category'], category)
                self.assert_private(result)
                self.assertEqual(stream.read_sizes, [evidence.MAX_BODY + 1])
                self.assertTrue(stream.closed)

    def test_private_prefix_suffix_and_lookalikes_never_export(self):
        for message in [PRIVATE, PRIVATE + ' API rate limit exceeded',
                        'API rate limit exceeded' + PRIVATE,
                        'Resource not accessible by integration' + PRIVATE,
                        'API rate limit exceeded\n' + PRIVATE,
                        'API rate limit exceeded\x00' + PRIVATE,
                        '\u212ayou have exceeded a secondary rate limit ' + PRIVATE]:
            result = evidence.extract(json_response(message)[0])
            self.assertEqual(result['body']['message_category'], 'UNKNOWN')
            self.assert_private(result)
        for category, canonical, _ in evidence.MESSAGES:
            self.assertIn('[details redacted]', canonical)
            self.assertRegex(category, r'^[A-Z_]+$')

    def test_numeric_headers_use_bounded_ascii_decimal_only(self):
        headers = [('retry-after', '60'), ('x-ratelimit-limit', '60'),
                   ('x-ratelimit-remaining', '0'), ('x-ratelimit-used', '60'),
                   ('x-ratelimit-reset', '1800000000'), ('x-ratelimit-resource', 'core'),
                   ('server', 'GitHub.com'), ('authorization', 'Bearer ' + PRIVATE),
                   ('set-cookie', PRIVATE), ('location', 'https://' + PRIVATE),
                   ('x-github-request-id', PRIVATE)]
        result = evidence.extract(response(headers=headers)[0])
        self.assertEqual(result['headers']['rate_remaining'], {'state': 'VALID', 'value': 0})
        self.assertEqual(result['headers']['retry_after_seconds']['value'], 60)
        self.assertEqual(result['headers']['rate_resource']['value'], 'core')
        self.assertEqual(result['declared_responder'], 'GITHUB_DECLARED')
        self.assert_private(result)
        for name, field, maximum in evidence.NUMERIC_HEADERS:
            for value in ['-1', '+1', '1.5', '1e5', '1, 2', ' 0 ', '０', '\t0',
                          '0\n' + PRIVATE, PRIVATE, str(maximum + 1), '9' * 129,
                          'Wed, 21 Oct 2015 07:28:00 GMT']:
                with self.subTest(header=name, value=value):
                    result = evidence.extract(response(headers=[(name, value)])[0])
                    self.assertEqual(result['headers'][field], {'state': 'INVALID'})
                    self.assert_private(result)
            result = evidence.extract(response(headers=[(name, str(maximum))])[0])
            self.assertEqual(result['headers'][field], {'state': 'VALID', 'value': maximum})

    def test_duplicate_and_conflicting_headers_rejected(self):
        for values in [('0', '0'), ('0', '60')]:
            result = evidence.extract(response(headers=[('X-RateLimit-Remaining', values[0]),
                                                        ('x-ratelimit-remaining', values[1])])[0])
            self.assertEqual(result['headers']['rate_remaining'], {'state': 'INVALID'})
        result = evidence.extract(response(headers=[('server', 'GitHub.com'), ('server', PRIVATE),
                                                    ('x-ratelimit-resource', PRIVATE)])[0])
        self.assertEqual(result['declared_responder'], 'UNKNOWN')
        self.assertEqual(result['server_header_state'], 'INVALID')
        self.assertEqual(result['headers']['rate_resource'], {'state': 'UNRECOGNIZED'})
        self.assert_private(result)

    def test_absent_fields_and_unknown_responder_remain_unknown(self):
        result = evidence.extract(response()[0])
        self.assertEqual(result['body']['state'], 'EMPTY')
        self.assertEqual(result['body']['message_category'], 'UNKNOWN')
        self.assertEqual(result['declared_responder'], 'UNKNOWN')
        self.assertTrue(all(row['state'] == 'ABSENT' for row in result['headers'].values()))
        for server in [PRIVATE, 'GitHub.com ' + PRIVATE, 'github.com', 'GitHub.com\n' + PRIVATE]:
            result = evidence.extract(response(headers=[('server', server)])[0])
            self.assertEqual(result['declared_responder'], 'UNKNOWN')
            self.assert_private(result)

    def test_rate_headers_do_not_infer_cause_or_overrule_message(self):
        for message, expected in [('Forbidden', 'UNKNOWN'),
                                  ('Resource not accessible by integration', 'INTEGRATION_PERMISSION_REPORTED')]:
            result = evidence.extract(json_response(message, headers=[('x-ratelimit-remaining', '0'),
                                                                       ('retry-after', '60')])[0])
            self.assertEqual(result['headers']['rate_remaining']['value'], 0)
            self.assertEqual(result['body']['message_category'], expected)
            self.assertNotIn('cause', result)

    def test_invalid_body_shapes_are_redacted(self):
        fixtures = [
            (b'<html>' + PRIVATE.encode(), 'INVALID_JSON'),
            (b'\xff' + PRIVATE.encode(), 'INVALID_JSON'),
            (b'{', 'INVALID_JSON'),
            (b'{"message":"API rate limit exceeded","message":"Forbidden"}', 'INVALID_JSON'),
            (b'{"message":"API rate limit exceeded","extra":{"a":1,"a":2}}', 'INVALID_JSON'),
            (b'{"message":"API rate limit exceeded","extra":NaN}', 'INVALID_JSON'),
            (b'[' * 2000 + b']' * 2000, 'NESTING_LIMIT_NOT_PARSED'),
            (b'[]', 'NON_OBJECT_JSON'), (b'null', 'NON_OBJECT_JSON'),
            (b'{}', 'MESSAGE_ABSENT'), (b'{"message":null}', 'MESSAGE_INVALID'),
            (b'{"message":{}}', 'MESSAGE_INVALID'),
            (json.dumps({'message': PRIVATE * 100}).encode(), 'MESSAGE_INVALID'),
        ]
        for body, state in fixtures:
            with self.subTest(state=state, size=len(body)):
                result = evidence.extract(response(body)[0])
                self.assertEqual(result['body']['state'], state)
                self.assertEqual(result['body']['message_category'], 'UNKNOWN')
                self.assert_private(result)

    def test_body_and_message_bounds(self):
        valid = b'{"message":"API rate limit exceeded"}'
        for size, state in [(evidence.MAX_BODY, 'MESSAGE_RECOGNIZED'),
                            (evidence.MAX_BODY + 1, 'OVERSIZED_NOT_PARSED'),
                            (evidence.MAX_BODY * 4, 'OVERSIZED_NOT_PARSED')]:
            error, stream = response(valid + b' ' * (size - len(valid)))
            result = evidence.extract(error)
            self.assertEqual(result['body']['state'], state)
            self.assertEqual(stream.read_sizes, [evidence.MAX_BODY + 1])
            self.assert_private(result)
        for size, state in [(evidence.MAX_MESSAGE, 'MESSAGE_RECOGNIZED'),
                            (evidence.MAX_MESSAGE + 1, 'MESSAGE_INVALID')]:
            prefix = 'API rate limit exceeded '
            result = evidence.extract(json_response(prefix + 'x' * (size - len(prefix)))[0])
            self.assertEqual(result['body']['state'], state)

    def test_read_and_header_errors_do_not_export_exceptions(self):
        error, stream = response()
        with mock.patch.object(error, 'read', side_effect=OSError(PRIVATE)) as read:
            result = evidence.extract(error)
        self.assertEqual(result['body']['state'], 'READ_FAILED')
        read.assert_called_once_with(evidence.MAX_BODY + 1)
        self.assertTrue(stream.closed)
        self.assert_private(result)

    def test_json_depth_bound_ignores_quoted_and_escaped_braces(self):
        for depth, state in [(evidence.MAX_JSON_DEPTH, 'NON_OBJECT_JSON'),
                              (evidence.MAX_JSON_DEPTH + 1, 'NESTING_LIMIT_NOT_PARSED')]:
            result = evidence.extract(response(b'[' * depth + b']' * depth)[0])
            self.assertEqual(result['body']['state'], state)
        error, _ = json_response('API rate limit exceeded ' + ('[\\\"{]' * 100))
        self.assertEqual(evidence.extract(error)['body']['state'], 'MESSAGE_RECOGNIZED')

    def test_close_error_and_invalid_read_type_never_export(self):
        error, _ = json_response('API rate limit exceeded ' + PRIVATE)
        with mock.patch.object(error, 'close', side_effect=OSError(PRIVATE)):
            result = evidence.extract(error)
        self.assertEqual(result['body']['state'], 'MESSAGE_RECOGNIZED')
        self.assert_private(result)
        error.close()
        error, _ = response()
        with mock.patch.object(error, 'read', return_value=PRIVATE):
            result = evidence.extract(error)
        self.assertEqual(result['body']['state'], 'INVALID_BODY_TYPE')
        self.assert_private(result)
        error, _ = response()
        error.headers = mock.Mock(get_all=mock.Mock(side_effect=RuntimeError(PRIVATE)))
        result = evidence.extract(error)
        self.assertTrue(all(row['state'] == 'UNAVAILABLE' for row in result['headers'].values()))
        self.assert_private(result)

    def test_status_is_bounded_and_never_inferred_from_body(self):
        for status, expected in [(403, 403), (429, 429), (500, 500), (599, 599),
                                 (True, 'UNKNOWN'), (600, 'UNKNOWN'), (PRIVATE, 'UNKNOWN')]:
            result = evidence.extract(response(status=status)[0])
            self.assertEqual(result['status'], expected)
            self.assert_private(result)


class FailClosedTests(unittest.TestCase):
    def fixture(self, phase, guards=(), harness_error=None, stage_error=None, extractor_error=None):
        fake = types.SimpleNamespace(roots=lambda: (ROOT, ROOT, ROOT),
                                     guard=mock.Mock(side_effect=list(guards)),
                                     stage=mock.Mock(side_effect=stage_error))
        harness = types.SimpleNamespace(main=mock.Mock(side_effect=harness_error))
        spec = types.SimpleNamespace(loader=types.SimpleNamespace(exec_module=mock.Mock()))
        with contextlib.ExitStack() as stack:
            stack.enter_context(mock.patch.dict(os.environ, {'RUNNER_TEMP': '/tmp', 'KEEPER_NATIVE_PLATFORM': 'IOS'}))
            stack.enter_context(mock.patch.object(urllib.request, 'urlopen', side_effect=AssertionError('NO_NETWORK')))
            stack.enter_context(mock.patch.object(diagnose.importlib.util, 'spec_from_file_location', return_value=spec))
            stack.enter_context(mock.patch.object(diagnose.importlib.util, 'module_from_spec', return_value=harness))
            stack.enter_context(mock.patch.object(diagnose, 'pod_observation', return_value={'status': 'NOT_OBSERVED'}))
            if extractor_error:
                stack.enter_context(mock.patch.object(evidence, 'extract', side_effect=extractor_error))
            output = stack.enter_context(contextlib.redirect_stdout(io.StringIO()))
            stderr = stack.enter_context(contextlib.redirect_stderr(io.StringIO()))
            code = diagnose.run(phase, fake, {})
        self.assertNotIn(PRIVATE, output.getvalue() + stderr.getvalue())
        self.assertEqual(len(output.getvalue().splitlines()), 1)
        value = json.loads(output.getvalue().split(' ', 1)[1])
        self.assertEqual(value['acceptance'], 'NOT_ACCEPTED')
        self.assertEqual(value['native_build'], 'NOT_RUN')
        self.assertEqual(value['native_probes'], 'NOT_RUN')
        self.assertLessEqual(len(output.getvalue().split(' ', 1)[1].encode()), 8193)
        return code, value, fake, harness

    def test_stage_denial_stops_and_captures_only_existing_response(self):
        error, stream = json_response('Resource not accessible by integration ' + PRIVATE)
        code, value, fake, harness = self.fixture('stage', stage_error=error)
        self.assertEqual(code, 1)
        self.assertEqual(value['outcome'], 'FAILED')
        self.assertEqual(value['error_category'], 'PUBLIC_HTTP_403')
        self.assertEqual(value['http_response']['body']['message_category'], 'INTEGRATION_PERMISSION_REPORTED')
        fake.stage.assert_called_once_with()
        fake.guard.assert_not_called()
        harness.main.assert_not_called()
        self.assertEqual(stream.read_sizes, [evidence.MAX_BODY + 1])

    def test_initial_prepare_guard_failure_never_calls_network_or_harness_again(self):
        for error in [response()[0], urllib.error.URLError(PRIVATE), TimeoutError(PRIVATE),
                      ConnectionError(PRIVATE), RuntimeError(PRIVATE)]:
            code, value, fake, harness = self.fixture('prepare', guards=[error])
            self.assertEqual(code, 1)
            self.assertEqual(value['outcome'], 'FAILED')
            self.assertEqual(value['post_prepare_guard'], 'NOT_RUN_AFTER_GUARD_FAILURE')
            self.assertEqual(fake.guard.call_count, 1)
            harness.main.assert_not_called()

    def test_post_harness_guard_denial_never_calls_guard_again(self):
        error, stream = json_response('API rate limit exceeded for ' + PRIVATE)
        code, value, fake, harness = self.fixture('prepare', guards=[None, error])
        self.assertEqual(code, 1)
        self.assertEqual(value['error_category'], 'PUBLIC_HTTP_403')
        self.assertEqual(value['post_prepare_guard'], 'NOT_RUN_AFTER_GUARD_FAILURE')
        self.assertEqual(fake.guard.call_count, 2)
        harness.main.assert_called_once_with()
        self.assertEqual(stream.read_sizes, [evidence.MAX_BODY + 1])

    def test_command_failure_and_final_guard_denial_both_retained(self):
        code, value, fake, _ = self.fixture('prepare', guards=[None, response()[0]],
                                           harness_error=RuntimeError(PRIVATE))
        self.assertEqual(code, 1)
        self.assertEqual(value['outcome'], 'FAILED')
        self.assertEqual(value['error_category'], 'CHECK_OR_COMMAND_FAILED')
        self.assertEqual(value['post_prepare_guard_error'], 'PUBLIC_HTTP_403')
        self.assertEqual(value['post_prepare_guard'], 'FAILED')
        self.assertEqual(value['post_prepare_http_response']['status'], 403)
        self.assertEqual(fake.guard.call_count, 2)

    def test_final_guard_denial_after_success_still_fails(self):
        code, value, fake, _ = self.fixture('prepare', guards=[None, None, response()[0]])
        self.assertEqual(code, 1)
        self.assertEqual(value['outcome'], 'FAILED')
        self.assertEqual(value['post_prepare_guard'], 'FAILED')
        self.assertEqual(fake.guard.call_count, 3)

    def test_harness_network_failure_suppresses_final_network_guard(self):
        for error in [response()[0], urllib.error.URLError(PRIVATE), TimeoutError(PRIVATE), ConnectionError(PRIVATE)]:
            code, value, fake, _ = self.fixture('prepare', guards=[None], harness_error=error)
            self.assertEqual(code, 1)
            self.assertEqual(value['outcome'], 'FAILED')
            self.assertEqual(value['post_prepare_guard'], 'NOT_RUN_AFTER_NETWORK_FAILURE')
            self.assertEqual(fake.guard.call_count, 1)

    def test_extractor_failure_preserves_primary_denial_and_exit_code(self):
        code, value, fake, _ = self.fixture('prepare', guards=[response()[0]],
                                           extractor_error=RuntimeError(PRIVATE))
        self.assertEqual(code, 1)
        self.assertEqual(value['outcome'], 'FAILED')
        self.assertEqual(value['error_category'], 'PUBLIC_HTTP_403')
        self.assertEqual(value['http_response'], {'state': 'EXTRACTION_FAILED', 'issuer_verified': False})
        self.assertEqual(fake.guard.call_count, 1)

    def test_record_denial_preserves_nonzero(self):
        code, value, fake, harness = self.fixture('record', guards=[response()[0]])
        self.assertEqual(code, 1)
        self.assertEqual(value['error_category'], 'PUBLIC_HTTP_403')
        self.assertEqual(fake.guard.call_count, 1)
        harness.main.assert_not_called()

    def test_success_preserves_all_existing_guards_and_not_accepted(self):
        code, value, fake, harness = self.fixture('prepare', guards=[None, None, None])
        self.assertEqual(code, 0)
        self.assertEqual(value['outcome'], 'COMPLETED')
        self.assertEqual(value['post_prepare_guard'], 'COMPLETED')
        self.assertEqual(fake.guard.call_count, 3)
        harness.main.assert_called_once_with()


if __name__ == '__main__':
    unittest.main()
