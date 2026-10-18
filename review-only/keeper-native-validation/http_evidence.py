"""Bounded observations from an existing HTTPError; never request or retry a URL."""
import json
import re

MAX_BODY = 8192
MAX_MESSAGE = 2048
MAX_HEADER = 128
MAX_JSON_DEPTH = 32
NUMERIC_HEADERS = (
    ('retry-after', 'retry_after_seconds', 604800),
    ('x-ratelimit-limit', 'rate_limit', 1000000000),
    ('x-ratelimit-remaining', 'rate_remaining', 1000000000),
    ('x-ratelimit-used', 'rate_used', 1000000000),
    ('x-ratelimit-reset', 'rate_reset_epoch', 99999999999),
)
RESOURCES = {'core', 'search', 'code_search', 'graphql', 'integration_manifest'}
MESSAGES = (
    ('PRIMARY_RATE_LIMIT_REPORTED', 'API rate limit exceeded. [details redacted]',
     r'api rate limit exceeded(?=$|[ .:(])'),
    ('SECONDARY_RATE_LIMIT_REPORTED', 'Secondary rate limit reported. [details redacted]',
     r'you have exceeded a secondary rate limit(?=$|[ .:(])'),
    ('INTEGRATION_PERMISSION_REPORTED', 'Resource not accessible by integration. [details redacted]',
     r'resource not accessible by integration(?=$|[ .:(])'),
    ('TOKEN_PERMISSION_REPORTED', 'Resource not accessible by personal access token. [details redacted]',
     r'resource not accessible by personal access token(?=$|[ .:(])'),
    ('AUTHENTICATION_REQUIRED_REPORTED', 'Authentication required. [details redacted]',
     r'requires authentication(?=$|[ .:(])'),
    ('BAD_CREDENTIALS_REPORTED', 'Bad credentials reported. [details redacted]',
     r'bad credentials(?=$|[ .:(])'),
    ('SERVICE_UNAVAILABLE_REPORTED', 'Service unavailable reported. [details redacted]',
     r'service unavailable(?=$|[ .:(])'),
    ('SERVER_ERROR_REPORTED', 'Internal server error reported. [details redacted]',
     r'internal server error(?=$|[ .:(])'),
)


def header_value(headers, name):
    """Inspect only one named field. Reject duplicates, controls and large values."""
    try:
        if headers is None:
            return 'ABSENT', None
        if hasattr(headers, 'get_all'):
            values = headers.get_all(name)
            if values is None:
                return 'ABSENT', None
            if not isinstance(values, list) or len(values) != 1:
                return 'INVALID', None
            value = values[0]
        else:
            value = headers.get(name)
            if value is None:
                return 'ABSENT', None
        if (not isinstance(value, str) or not value or len(value) > MAX_HEADER
                or any(ord(char) < 32 or ord(char) > 126 for char in value)):
            return 'INVALID', None
        return 'PRESENT', value
    except Exception:
        return 'UNAVAILABLE', None


def header_observations(headers):
    observations = {}
    for name, field, maximum in NUMERIC_HEADERS:
        state, value = header_value(headers, name)
        entry = {'state': state}
        if state == 'PRESENT':
            if re.fullmatch(r'[0-9]{1,11}', value) and int(value) <= maximum:
                entry = {'state': 'VALID', 'value': int(value)}
            else:
                entry = {'state': 'INVALID'}
        observations[field] = entry
    state, value = header_value(headers, 'x-ratelimit-resource')
    observations['rate_resource'] = ({'state': 'VALID', 'value': value} if value in RESOURCES
                                     else {'state': 'UNRECOGNIZED' if state == 'PRESENT' else state})
    state, value = header_value(headers, 'server')
    responder = 'GITHUB_DECLARED' if value == 'GitHub.com' else 'UNKNOWN'
    return observations, responder, state


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('DUPLICATE_KEY')
        result[key] = value
    return result


def reject_constant(_):
    raise ValueError('NON_JSON_CONSTANT')


def within_depth_limit(text):
    depth = 0
    quoted = escaped = False
    for char in text:
        if quoted:
            if escaped:
                escaped = False
            elif char == '\\':
                escaped = True
            elif char == '"':
                quoted = False
        elif char == '"':
            quoted = True
        elif char in '[{':
            depth += 1
            if depth > MAX_JSON_DEPTH:
                return False
        elif char in ']}':
            depth -= 1
    return True


def body_observation(error):
    result = {'state': 'UNAVAILABLE', 'message_category': 'UNKNOWN',
              'redacted_message': '[redacted: no recognized response message]'}
    try:
        # This consumes the existing denied response once, without another request.
        body = error.read(MAX_BODY + 1)
    except Exception:
        result['state'] = 'READ_FAILED'
        return result
    finally:
        try:
            error.close()
        except Exception:
            pass
    if not isinstance(body, bytes):
        result['state'] = 'INVALID_BODY_TYPE'
        return result
    if len(body) > MAX_BODY:
        result['state'] = 'OVERSIZED_NOT_PARSED'
        return result
    if not body:
        result['state'] = 'EMPTY'
        return result
    try:
        text = body.decode('utf-8')
        if not within_depth_limit(text):
            result['state'] = 'NESTING_LIMIT_NOT_PARSED'
            return result
        document = json.loads(text, object_pairs_hook=unique_object,
                              parse_constant=reject_constant)
    except (ValueError, RecursionError):
        result['state'] = 'INVALID_JSON'
        return result
    if not isinstance(document, dict):
        result['state'] = 'NON_OBJECT_JSON'
        return result
    if 'message' not in document:
        result['state'] = 'MESSAGE_ABSENT'
        return result
    message = document['message']
    if (not isinstance(message, str) or len(message) > MAX_MESSAGE
            or any(ord(char) < 32 or ord(char) == 127 for char in message)):
        result['state'] = 'MESSAGE_INVALID'
        return result
    result['state'] = 'MESSAGE_UNRECOGNIZED'
    for category, canonical, pattern in MESSAGES:
        if re.match(pattern, message, flags=re.I | re.ASCII):
            result.update(state='MESSAGE_RECOGNIZED', message_category=category,
                          redacted_message=canonical)
            break
    return result


def extract(error):
    """Report declarations/observations, never verified issuer or inferred cause."""
    status = error.code if type(error.code) is int and 400 <= error.code <= 599 else 'UNKNOWN'
    headers, responder, server_state = header_observations(error.headers)
    return {'schema_version': 1, 'status': status, 'issuer_verified': False,
            'declared_responder': responder, 'server_header_state': server_state,
            'headers': headers, 'body': body_observation(error)}
