"""Bounded, pure compact-log markers; no raw text or startup-cause inference.

Only a complete compact prefix naming the exact validated executable attributes
a record. Continuations are never attached to another record. Rendered log text
is not authenticated evidence; callers must retain command/truncation outcomes.
"""

from datetime import datetime
import io
import re


MAX_INPUT_BYTES = 1024 * 1024
MAX_RECORD_BYTES = 16 * 1024
MAX_SCAN_LINES = 4096
MAX_OWN_RECORDS = 4096

# Counts are records containing a marker, not exception counts or causes. One
# record may contain several fixed categories; no dynamic names are exported.
CATEGORIES = {
    'JS_TYPE_ERROR': r'\bTypeError\b|\bundefined is not a function\b',
    'JS_REFERENCE_ERROR': r'\bReferenceError\b',
    'JS_SYNTAX_ERROR': r'\bSyntaxError\b',
    'JS_RANGE_ERROR': r'\bRangeError\b',
    'JS_EXCEPTION': r'\bUnhandled (?:JS|JavaScript) Exception\b|\bJavaScript exception\b|\bUnhandled promise rejection\b',
    'JS_INVARIANT': r'\bInvariant Violation\b|\bhas not been registered\b',
    'SCRIPT_URL_MISSING': r'\bNo script URL provided\b|\bNo bundle URL present\b',
    'SCRIPT_LOAD_ERROR': r'\bUnable to load script\b|\bCould not connect to development server\b|\bdevelopment server returned response error\b|\b(?:Could not|Failed to) load bundle\b',
    'MODULE_RESOLUTION_ERROR': r'\bUnable to resolve module\b|\bCannot find module\b|\bUnableToResolveError\b',
    'NATIVE_MODULE_UNAVAILABLE': r'\bNative module cannot be null\b|\bCannot find native module\b|\bTurboModuleRegistry(?:\.getEnforcing)?\b.{0,256}\b(?:could not be found|not found|missing|null|unavailable|failed|failure)\b',
    'NATIVE_LIBRARY_LOAD_ERROR': r'\bLibrary not loaded\b|\bSymbol not found\b|\bdlopen(?:\([^\n]{0,256}\))? failed\b|\bincompatible architecture\b|\bdyld\b.{0,256}\b(?:not found|failed|error)\b',
    'CONNECTION_ERROR': r'\b(?:ECONNREFUSED|ECONNRESET|NSURLErrorDomain)\b|\bConnection refused\b|\bCould not connect\b',
    'NATIVE_EXCEPTION': r'\bNS[A-Za-z0-9_]*Exception\b|\bRCTFatal\b|\bRCTExceptionsManager\b|\bException in HostFunction\b',
    'EXCEPTION_MARKER': r'\b[A-Za-z_$][A-Za-z0-9_.$]*Exception\b|\buncaught exception\b|\bunhandled exception\b',
    'FATAL_MARKER': r'\bfatal(?: error| exception| signal)?\b|\bSIG(?:ABRT|SEGV|BUS|ILL|TRAP)\b',
    'HERMES_ERROR': r'\bhermes\b.{0,256}\b(?:exception|fatal|error|failed)\b|\b(?:exception|fatal|error)\b.{0,256}\bhermes\b',
    'ATS_BLOCKED': r'\bApp Transport Security\b.{0,256}\b(?:blocked|requires)\b|\bNSURLErrorDomain\b.{0,256}-1022\b',
}
_CATEGORY_PATTERNS = {name: re.compile(pattern, re.IGNORECASE)
                      for name, pattern in CATEGORIES.items()}
_RECORD = re.compile(
    r'(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?'
    r'(?:[+-]\d{2}:?\d{2}|Z)?)\s+(?P<severity>[A-Za-z]+)\s+'
    r'(?P<process>[A-Za-z0-9_.-]{1,128})\[(?P<pid>[1-9]\d{0,9}):'
    r'(?:0x)?[A-Fa-f0-9]{1,16}\]\s+(?P<message>.*)')
_SEVERITIES = {'a', 'd', 'db', 'df', 'i', 'info', 'default', 'debug',
               'e', 'er', 'error', 'f', 'ft', 'fault'}
_ERROR_SEVERITIES = {'e', 'er', 'error', 'f', 'ft', 'fault'}
_ERROR_MARKER = re.compile(
    r'\b(?:error|exception|fatal)\b|\b[\w.$]*(?:Exception|Error)\b', re.IGNORECASE)
STARTUP_STAGES = ('READ_CALL', 'STATE_READ', 'SERVICE_SELECT', 'KEYCHAIN_READ',
                  'CREDENTIAL_PARSE', 'NAVIGATE_LOGIN', 'NAVIGATE_CREATE_PIN')
STARTUP_CATEGORIES = ('NATIVE_CODE_NEG34018', 'NATIVE_CODE_NEG25308', 'NATIVE_CODE_NEG25291',
                      'NATIVE_CODE_NEG25293', 'NATIVE_CODE_NEG26275', 'NATIVE_CODE_NEG50',
                      'ERROR', 'TYPE_ERROR', 'SYNTAX_ERROR', 'RANGE_ERROR', 'REFERENCE_ERROR', 'UNKNOWN')
_STARTUP_MARKER = re.compile(
    # Exact RN0.83.9 OSLog subsystem/category in the compact message envelope.
    r'(?:\[com\.facebook\.react\.log:javascript\] )?KEEPER_STARTUP_ERROR stage=(' + '|'.join(STARTUP_STAGES) +
    r') category=(' + '|'.join(STARTUP_CATEGORIES) + r')')


def classify(payload, executable):
    """Return fixed positive observations only; an empty result proves no pass.

    Invalid selectors/types raise fixed errors. Oversized input is classified
    only through its complete bounded prefix; long or malformed records are
    skipped. A supplied prefix cannot reveal truncation done by an earlier read.
    """
    if (not isinstance(executable, str) or
            not re.fullmatch(r'[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}', executable)):
        raise ValueError('Unsafe iOS executable selector.')
    if not isinstance(payload, str):
        raise TypeError('Expected compact log text.')

    # Slice characters before encoding so even an arbitrarily large argument
    # creates at most a bounded four-byte-per-character temporary buffer.
    encoded = payload[:MAX_INPUT_BYTES + 1].encode('utf-8', errors='replace')
    truncated = len(payload) > MAX_INPUT_BYTES or len(encoded) > MAX_INPUT_BYTES
    prefix = encoded[:MAX_INPUT_BYTES].decode('utf-8', errors='replace')
    if truncated:
        prefix = prefix.rsplit('\n', 1)[0] + '\n' if '\n' in prefix else ''
    result = {
        'format': 'compact', 'matching_process_records': 0, 'errors': [],
        'error_records': 0, 'category_record_counts': {name: 0 for name in CATEGORIES},
        'unclassified_error_records': 0, 'malformed_record_lines': 0,
        'oversized_record_lines': 0, 'input_truncated': truncated,
        'replacement_character_observed': '\ufffd' in prefix,
        'scan_limit_reached': False, 'record_limit_reached': False,
        'parse_status': 'UNKNOWN', 'cause': 'UNDETERMINED',
        'scope': 'PREFIXED_OWN_PROCESS_MARKERS_ONLY_NOT_CAUSE_OR_ACCEPTANCE',
        'startup_failure_facts': [], 'startup_failure_fact_limit_reached': False,
        'startup_failure_scope': 'FIXED_DEVELOPMENT_STAGE_MARKERS_NOT_AUTHENTICATED_CAUSE',
    }
    for index, raw in enumerate(io.StringIO(prefix)):
        if index >= MAX_SCAN_LINES:
            result['scan_limit_reached'] = True
            break
        if result['matching_process_records'] >= MAX_OWN_RECORDS:
            result['record_limit_reached'] = True
            break
        line = raw.removesuffix('\n').removesuffix('\r')
        if len(line) > MAX_RECORD_BYTES or len(line.encode('utf-8')) > MAX_RECORD_BYTES:
            result['oversized_record_lines'] += 1
            continue
        match = _RECORD.fullmatch(line)
        if not match:
            # Headers, notices and unprefixed multiline continuations are not
            # attributed. Timestamp-shaped malformed records remain visible.
            result['malformed_record_lines'] += int(bool(re.match(r'^\d{4}-', line)))
            continue
        try:
            datetime.fromisoformat(match['timestamp'].replace('Z', '+00:00'))
            valid = (match['severity'].lower() in _SEVERITIES and
                     int(match['pid']) <= 2147483647 and
                     not any(ord(char) < 32 and char != '\t' for char in line))
        except ValueError:
            valid = False
        if not valid:
            result['malformed_record_lines'] += 1
            continue
        if match['process'] != executable:
            continue
        result['matching_process_records'] += 1
        marker = _STARTUP_MARKER.fullmatch(match['message'])
        if marker:
            if len(result['startup_failure_facts']) < 32:
                result['startup_failure_facts'].append({'stage': marker[1], 'category': marker[2]})
            else:
                result['startup_failure_fact_limit_reached'] = True
        categories = [name for name, pattern in _CATEGORY_PATTERNS.items()
                      if pattern.search(match['message'])]
        error = (bool(marker) or bool(categories) or match['severity'].lower() in _ERROR_SEVERITIES or
                 bool(_ERROR_MARKER.search(match['message'])))
        if error:
            result['error_records'] += 1
            for category in categories:
                result['category_record_counts'][category] += 1
            result['unclassified_error_records'] += int(not categories)
    if result['error_records']:
        result['errors'] = ['IOS_STARTUP_ERROR']
    if result['matching_process_records']:
        partial = any(result[name] for name in (
            'input_truncated', 'scan_limit_reached', 'record_limit_reached',
            'malformed_record_lines', 'oversized_record_lines',
            'replacement_character_observed'))
        result['parse_status'] = 'PARTIAL' if partial else 'PARSED'
    return result
