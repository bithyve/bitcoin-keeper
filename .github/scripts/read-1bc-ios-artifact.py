#!/usr/bin/env python3
"""Read one immutable iOS diagnostic artifact; this does not grant acceptance."""
import hashlib
import io
import json
import math
import os
from pathlib import Path
import re
import stat
import sys
import zipfile

SOURCE = '1bc34890cb8618b2fffd446a63924974e0fe15b5'
WORKFLOW = '3c44ab6412a8118b183273c402dd08136db05b28'
WORKFLOW_REF = 'KeeperCommunity/bitcoin-keeper/.github/workflows/keeper-native-diagnostic.yml@refs/pull/7116/merge'
RUN, ATTEMPT, ARTIFACT = '39858617273', '1', '12462694619'
ZIP_SIZE, LIMIT = 6884, 1024 * 1024
ZIP_SHA256 = '550142809a0faf812741a586630b17d6f458b2b6c935b5bab4b00f84da67c84f'
ERROR_TYPES = ('ValueError', 'TypeError', 'OSError', 'FileNotFoundError', 'PermissionError',
               'TimeoutExpired', 'JSONDecodeError', 'RuntimeError', 'OTHER_ERROR')
IOS_CATEGORIES = ('JS_TYPE', 'JS_REFERENCE', 'JS_SYNTAX', 'JS_RANGE', 'JS_INVARIANT',
                  'REACT_FATAL', 'OBJC_EXCEPTION', 'NATIVE_MODULE', 'NATIVE_LIBRARY',
                  'HERMES_EXCEPTION', 'BUNDLE_LOAD', 'ATS_BLOCKED', 'CONNECTION')
HIERARCHY = ('credential_error', 'retry', 'logbox_controls', 'redbox_resource', 'loading',
             'login', 'welcome_back', 'logbox_error_header', 'logbox_warning_header',
             'logbox_syntax_footer', 'logbox_counter')
PREFLIGHT = ('runner_install_started', 'runner_install_launch_returned', 'status_check_started',
             'status_response_received', 'status_check_failed', 'driver_startup_timeout',
             'prebuilt_driver_selected', 'xcodebuild_driver_selected', 'xctestrun_config_missing',
             'ui_test_runner_missing', 'xcode_test_execute_failed', 'xcode_test_failed',
             'xcode_testing_failed', 'host_port_unavailable', 'requested_device_disconnected',
             'log_limit_reached')
DRIVER_TYPES = ('IOSDriverTimeoutException', 'FileNotFoundException', 'CliError',
                'IllegalStateException', 'IOException', 'ConnectException', 'SocketTimeoutException',
                'TimeoutException', 'RuntimeException', 'UnknownHostException', 'SSLHandshakeException')
METRO_ERRORS = ('SyntaxError', 'TypeError', 'ReferenceError', 'RangeError', 'TransformError',
                'UnableToResolveError', 'ResolutionError', 'AmbiguousModuleResolutionError',
                'NotFoundError', 'ResourceNotFoundError', 'GraphNotFoundError', 'RevisionNotFoundError', 'OTHER')
METRO_CATEGORIES = ('MODULE_RESOLUTION', 'SYNTAX', 'TYPE', 'REFERENCE', 'MEMORY', 'TRANSFORM', 'CONNECTION')
CLEANUP = ('startup_capture', 'metro_process', 'metro_output', 'device_shutdown', 'device_delete',
           'private_startup-logcat', 'private_startup-observer', 'private_startup-foreground', 'metadata')


def obj(value):
    return value if type(value) is dict else {}


def enum(value, allowed=('PASS', 'FAIL', 'NOT RUN', 'RUNNING')):
    return value if type(value) is str and value in allowed else 'UNKNOWN'


def boolean(value):
    return value if type(value) is bool else None


def number(value, maximum=1000000):
    return value if type(value) in (int, float) and 0 <= value <= maximum and math.isfinite(value) else None


def count(value, maximum=1000000):
    return value if type(value) is int and 0 <= value <= maximum else None


def digest(value):
    return value if type(value) is str and re.fullmatch('[a-f0-9]{64}', value) else None


def fixed_list(value, vocabulary):
    selected = {item for item in value[:1024] if type(item) is str and item in vocabulary} if type(value) is list else set()
    return [item for item in vocabulary if item in selected]


def flags(value, vocabulary):
    return {key: boolean(obj(value).get(key)) for key in vocabulary}


def commands(value):
    labels = {'build_ios': 'Build unsigned development simulator app',
              'install_ios': 'Install unsigned development app',
              'startup_ui': 'Assert startup and disposable passcode transition',
              'persistence_ui': 'Assert native persistence across process launches',
              'workers_ui': 'Assert R5 production workers over native storage'}
    rows = value[:1000] if type(value) is list else []
    return {key: [{'exit_code': count(row.get('exit_code'), 255),
                   'duration_seconds': number(row.get('duration_seconds'), 7200),
                   'timeout_seconds': number(row.get('timeout_seconds'), 7200)}
                  for row in rows if type(row) is dict and row.get('label') == label][:5]
            for key, label in labels.items()}


def metro_row(value):
    value = obj(value)
    result = {'stage': enum(value.get('stage'), ('BEFORE_APP', 'APP_WINDOW', 'UNKNOWN')),
              'kind': enum(value.get('kind'), ('BUILD', 'ERROR', 'REQUEST', 'RESPONSE'))}
    if result['kind'] in ('BUILD', 'ERROR'):
        allowed = (('bundle_build_started', 'bundle_build_done', 'bundle_build_failed')
                   if result['kind'] == 'BUILD' else
                   ('bundling_error', 'initialize_failed', 'transformer_load_failed', 'hmr_client_error',
                    'cache_read_error', 'cache_write_error', 'worker_stderr_chunk'))
        result.update(event=enum(value.get('event'), allowed),
                      error_type=enum(value.get('error_type'), METRO_ERRORS),
                      categories=fixed_list(value.get('categories'), METRO_CATEGORIES))
        if result['kind'] == 'BUILD':
            result.update(platform=enum(value.get('platform'), ('ios', 'android', 'OTHER')),
                          **flags(value, ('dev', 'minify')))
    elif result['kind'] in ('REQUEST', 'RESPONSE'):
        result['request'] = enum(value.get('request'), ('ENTRY_BUNDLE', 'SPLIT_BUNDLE', 'SYMBOLICATE'))
        if result['kind'] == 'RESPONSE':
            code = count(value.get('outer_http_status'), 599)
            result['outer_http_status'] = code if code is not None and code >= 100 else None
        else:
            options = obj(value.get('options'))
            result['options'] = {name: options.get(name) if type(options.get(name)) is bool else
                                 None if options.get(name) is None else 'OTHER'
                                 for name in ('dev', 'lazy', 'minify', 'modulesOnly', 'runModule', 'excludeSource')}
            for name, allowed in {'platform': ('ios', 'android', 'OTHER'),
                                  'sourcePaths': ('url-server', 'absolute', 'OTHER'),
                                  'engine': ('hermes', 'jsc', 'OTHER'), 'app': ('EXPECTED', 'OTHER')}.items():
                result['options'][name] = enum(options.get(name), allowed)
    return result


def observations(value):
    value = obj(value)
    metro, hierarchy = obj(value.get('metro')), obj(value.get('hierarchy'))
    rows = metro.get('rows')
    result = {'collection_errors': fixed_list(value.get('collection_errors'), ('metro', 'hierarchy', 'collector')),
              'process_state': 'UNKNOWN',
              'hierarchy': {**flags(hierarchy, HIERARCHY),
                            'snapshot_count': count(hierarchy.get('snapshot_count'), 8),
                            'observation_state': enum(hierarchy.get('observation_state'), ('UNKNOWN', 'SNAPSHOTS_PARSED'))},
              'hierarchy_scope': 'ANY_RETAINED_SNAPSHOT_NOT_CURRENT_ROUTE_OR_TAP_DELIVERY',
              'metro': {'observation_state': enum(metro.get('observation_state'), ('UNKNOWN', 'ROWS_OBSERVED')),
                        'coverage': enum(metro.get('coverage'), ('UNKNOWN', 'PARTIAL_OR_CAPPED', 'BOUNDED_INPUT_ONLY')),
                        'rows': [metro_row(row) for row in rows[:512]] if type(rows) is list else [],
                        **flags(metro, ('input_truncated', 'producer_limit_may_be_reached', 'export_truncated', 'line_scan_truncated')),
                        **{key: count(metro.get(key), 1024) for key in
                           ('invalid_rows', 'producer_row_limit', 'export_row_limit', 'line_scan_limit',
                            'lines_scanned', 'valid_rows_in_scanned_input', 'exported_rows')},
                        'scope': 'OUTER_HTTP_STATUS_NOT_BUNDLE_EXECUTION_OR_UI_ACCEPTANCE'}}
    return result


def diagnostics(value):
    value = obj(value)
    ios, driver, maestro = (obj(value.get(key)) for key in ('ios_errors', 'maestro_preflight', 'maestro'))
    hierarchy = obj(value.get('hierarchy_signals'))
    errors = value.get('collection_errors')
    return {'collection_errors': [
        {'stage': enum(obj(row).get('stage'), ('maestro', 'maestro_preflight', 'hierarchy_signals',
                                             'metro_errors', 'metro_progress', 'ios_errors', 'collector')),
         'error_type': enum(obj(row).get('error_type'), ERROR_TYPES)}
        for row in errors[:32]] if type(errors) is list else [],
        'ios_errors': {
        'cause': 'UNDETERMINED', 'query_status': enum(ios.get('query_status'), ('SUCCESS', 'FAILED', 'TIMEOUT')),
        'parse_status': enum(ios.get('parse_status'), ('PARSED', 'PARTIAL', 'UNKNOWN')),
        'observation_state': enum(ios.get('observation_state'), ('OWN_RECORDS_OBSERVED', 'UNKNOWN')),
        **flags(ios, ('input_truncated', 'replacement_character_observed', 'scan_limit_reached', 'record_limit_reached')),
        **{key: count(ios.get(key)) for key in ('matching_process_records', 'malformed_record_lines',
           'oversized_record_lines', 'error_records', 'classified_error_records', 'unclassified_error_records')},
        'categories': fixed_list(ios.get('categories'), IOS_CATEGORIES),
        'category_record_counts': {key: count(obj(ios.get('category_record_counts')).get(key)) for key in IOS_CATEGORIES}},
        'maestro_preflight': {**flags(driver, PREFLIGHT),
            **{key: count(driver.get(key), 6) for key in ('logs_read', 'truncated_logs')},
            'exception_types': fixed_list(driver.get('exception_types'), DRIVER_TYPES),
            'collection_error_types': fixed_list(driver.get('collection_error_types'), ERROR_TYPES)},
        'maestro': {'report': enum(maestro.get('report'), ('PRESENT', 'MISSING')),
                    'testcase_statuses': fixed_list(maestro.get('testcase_statuses'), ('PASS', 'FAIL', 'ERROR', 'SKIPPED')),
                    'first_create_passcode_assertion_reported': None if type(maestro.get('testcase_failures')) is not list else
                        'Maestro assertion failed: Create a passcode' in
                        fixed_list(maestro.get('testcase_failures'), ('Maestro assertion failed: Create a passcode',))},
        'hierarchy': {**flags(hierarchy, ('createPIN', 'confirmPIN', 'RNredbox', 'noScriptURL',
                                        'developmentServerError', 'unableLoadScript')),
                      'snapshot_count': count(hierarchy.get('snapshot_count'), 9),
                      'parse_error_types': fixed_list(hierarchy.get('parse_error_types'), ERROR_TYPES)},
        'metro_progress': {**flags(value.get('metro_progress'), ('bundle_marker_observed',)),
                           **{key: count(obj(value.get('metro_progress')).get(key)) for key in
                              ('bundle_marker_count', 'prebundle_marker_count')}}}


def _decode(blob):
    if type(blob) is not bytes or len(blob) > LIMIT + 4096:
        raise ValueError('Artifact rejected.')
    with zipfile.ZipFile(io.BytesIO(blob)) as archive:
        entries = archive.infolist()
        if len(entries) != 1:
            raise ValueError('Artifact rejected.')
        entry = entries[0]
        if (entry.filename != 'ios/metadata.json' or entry.orig_filename != entry.filename or
                entry.flag_bits & 1 or stat.S_IFMT(entry.external_attr >> 16) not in (0, stat.S_IFREG) or
                entry.file_size > LIMIT or entry.compress_type not in (zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED)):
            raise ValueError('Artifact rejected.')
        with archive.open(entry) as source:
            raw = source.read(LIMIT + 1)
        if len(raw) != entry.file_size or len(raw) > LIMIT:
            raise ValueError('Artifact rejected.')
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError('Artifact rejected.')
            result[key] = value
        return result
    def finite(value):
        result = float(value)
        if not math.isfinite(result):
            raise ValueError('Artifact rejected.')
        return result
    def reject(_):
        raise ValueError('Artifact rejected.')
    data = json.loads(raw, object_pairs_hook=pairs, parse_float=finite, parse_constant=reject)
    expected = {'schema': 1, 'source_sha': SOURCE, 'workflow_sha': WORKFLOW, 'workflow_ref': WORKFLOW_REF,
                'run_id': RUN, 'run_attempt': ATTEMPT, 'platform': 'IOS', 'diagnostic_only': True}
    if type(data) is not dict or any(type(data.get(key)) is not type(value) or data.get(key) != value for key, value in expected.items()):
        raise ValueError('Artifact rejected.')
    built, installed = obj(data.get('built_artifact')), obj(data.get('installed_artifact'))
    built_sha, installed_sha = digest(built.get('executable_sha256')), digest(installed.get('executable_sha256'))
    method = enum(installed.get('method'), ('FULL_SIMULATOR_BUNDLE_TREE_AND_EXECUTABLE_SHA256',))
    reported = boolean(data.get('installed_artifact_verified'))
    matches = (built_sha == installed_sha) if reported is True and built_sha and installed_sha and method != 'UNKNOWN' else None
    return {'tag': 'SAFE_R5_IOS_READOUT', 'source_sha': SOURCE, 'workflow_sha': WORKFLOW,
        'run_id': RUN, 'run_attempt': ATTEMPT, 'artifact_id': ARTIFACT,
        'diagnostic_only': True, 'readout_only': True, 'authorization_eligible': False,
        'trusted_native_acceptance': False, 'release_acceptance': 'NOT ESTABLISHED', 'cause': 'UNDETERMINED',
        'reported_phases': {key: enum(data.get(key)) for key in ('build', 'smoke', 'native_probe', 'r5_features', 'hardware', 'signing')},
        'fixed_command_receipts': commands(data.get('commands')),
        'installed_artifact': {'reported_verified': reported, 'method': method,
            'built_executable_sha256': built_sha, 'installed_executable_matches_built': matches,
            'reported_inventory_sha256': digest(installed.get('inventory_sha256')),
            'inventory_digest_scope': 'REPORTED_FULL_INVENTORY_NOT_COMPARABLE_TO_BUILT_TREE_DIGEST',
            'scope': 'PRE_UI_REPORTED_PROOF_NOT_POST_FAILURE_OR_PROTECTED_ACCEPTANCE'},
        'startup_diagnostics': diagnostics(data.get('startup_diagnostics')),
        'startup_observation': observations(data.get('startup_observation')),
        'cleanup': {'reported_errors': fixed_list(data.get('startup_cleanup_errors'), CLEANUP),
            'status': 'FAIL' if data.get('startup_cleanup_errors') else 'UNKNOWN',
            'observation_status': enum(data.get('startup_observation_cleanup'), ('FAIL',)),
            'scope': 'ABSENT_ERROR_FIELD_DOES_NOT_ESTABLISH_DISPOSAL'}}


def decode(blob):
    try:
        return _decode(blob)
    except Exception:
        raise ValueError('Artifact rejected.') from None


def main(argv=None):
    try:
        arguments = sys.argv[1:] if argv is None else argv
        if arguments:
            raise ValueError('Artifact rejected.')
        temp = Path(os.environ['RUNNER_TEMP'])
        if not temp.is_absolute() or temp.resolve(strict=True) != temp:
            raise ValueError('Artifact rejected.')
        path = temp / 'r5-1bc-ios-fixed.zip'
        with os.fdopen(os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK), 'rb') as source:
            info = os.fstat(source.fileno())
            if (not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o600 or
                    info.st_size != ZIP_SIZE or info.st_uid != os.getuid() or info.st_nlink != 1):
                raise ValueError('Artifact rejected.')
            blob = source.read(ZIP_SIZE + 1)
        if len(blob) != ZIP_SIZE or hashlib.sha256(blob).hexdigest() != ZIP_SHA256:
            raise ValueError('Artifact rejected.')
        result = decode(blob)
    except Exception:
        print('FIXED_IOS_ARTIFACT_READOUT_FAILED')
        return 1
    print('SAFE_R5_IOS_READOUT ' + json.dumps(result, sort_keys=True, allow_nan=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
