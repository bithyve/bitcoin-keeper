#!/usr/bin/env python3
"""Review-only diagnostics; fixed outputs and original failing checks preserved."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import urllib.error
import http_evidence

HERE = Path(__file__).resolve().parent
MAX_METADATA = 1024 * 1024
WINDOW = 64 * 1024
PHASES = {'stage', 'record', 'prepare'}
POD_PATTERNS = (
    ('PODFILE_CHANGED_IN_DEPLOYMENT', r'there were changes to the podfile in deployment mode'),
    ('LOCKFILE_CHANGED_IN_DEPLOYMENT', r'there were changes to the lockfile in deployment mode'),
    ('DEPLOYMENT_TARGET_TOO_LOW', r'require[sd]? a higher minimum deployment target'),
    ('COMPATIBLE_VERSION_NOT_FOUND', r'could not find compatible versions'),
    ('SPECIFICATION_NOT_FOUND', r'unable to find a specification|none of your spec sources contain a spec satisfying'),
    ('INVALID_PODFILE', r'invalid .{0,30}podfile.{0,10} file|error in the post.install hook'),
    ('CODEGEN_FAILURE_MARKER', r'\[codegen\].{0,80}error|codegen.{0,40}(?:failed|failure)'),
    ('DOWNLOAD_FAILURE_MARKER', r'error installing|failed to download|could not resolve host|ssl certificate problem|connection timed out'),
    ('INTEGRITY_FAILURE_MARKER', r'verification checksum was incorrect|checksum mismatch'),
    ('UTF8_FAILURE_MARKER', r'invalid byte sequence in utf.8'),
    ('COCOAPODS_ERROR_MARKER', r'^\s*\[!\]'),
    ('BUNDLE_GEMS_MISSING', r'Bundler::GemNotFound|could not find [^\n]{0,4096} in locally installed gems'),
    ('BUNDLE_EXECUTABLE_NOT_IN_BUNDLE', r'not currently included in the bundle|bundler: command not found: pod|can.t find executable pod'),
    ('BUNDLE_FROZEN_LOCK_MISMATCH', r'Bundler::ProductionError|lockfile needs to be updated|deployment mode after changing your Gemfile|frozen mode is set'),
    ('BUNDLE_VERSION_CONFLICT', r'Bundler::VersionConflict|version solving has failed|could not resolve dependencies'),
    ('RUBY_LOAD_FAILURE', r'LoadError|cannot load such file|failed to load command'),
    ('RUBY_GEM_ACTIVATION_CONFLICT', r'Gem::LoadError|already activated [^\n]{0,256} but your Gemfile requires'),
    ('RUBY_NATIVE_EXTENSION_FAILURE', r'incompatible library version|incompatible architecture|missing compatible arch|symbol not found|extensions are not built'),
    ('RUBY_SYNTAX_FAILURE', r'SyntaxError|syntax error, unexpected'),
    ('RUBY_METHOD_OR_NAME_FAILURE', r'NoMethodError|NameError|undefined (?:method|local variable or method)'),
    ('CDN_RESPONSE_FAILURE', r'CDN:[^\n]{0,4096}(?:couldn.t be downloaded|failed|error)|HTTP[^\n]{0,40}(?:403|404|429|500|502|503|504)'),
    ('TLS_FAILURE', r'certificate verify failed|SSL_connect|OpenSSL::SSL::SSLError'),
    ('DNS_FAILURE', r'could not resolve host|getaddrinfo|SocketError'),
    ('TRANSPORT_TIMEOUT', r'Net::(?:OpenTimeout|ReadTimeout)|execution expired|operation timed out|connection timed out'),
    ('CONNECTION_FAILURE', r'connection (?:refused|reset)|unexpected EOF|end of file reached'),
    ('FILESYSTEM_PERMISSION_FAILURE', r'Permission denied|Errno::EACCES'),
    ('DISK_SPACE_FAILURE', r'No space left on device|Errno::ENOSPC'),
)
RUBY_ERROR_CLASSES = ('Bundler::GemNotFound', 'Bundler::GemRequireError', 'Bundler::VersionConflict',
                      'Bundler::ProductionError', 'Gem::LoadError', 'LoadError', 'SyntaxError',
                      'NoMethodError', 'NameError', 'RuntimeError', 'OpenSSL::SSL::SSLError',
                      'Net::OpenTimeout', 'Net::ReadTimeout', 'SocketError', 'Errno::EACCES', 'Errno::ENOSPC')
LOCK_SECTIONS = ('PODS', 'DEPENDENCIES', 'SPEC REPOS', 'EXTERNAL SOURCES',
                 'CHECKOUT OPTIONS', 'SPEC CHECKSUMS', 'PODFILE CHECKSUM', 'COCOAPODS')


def fixed_record(phase, outcome):
    return {'acceptance': 'NOT_ACCEPTED', 'scope': 'INPUTS_AND_PODS_DIAGNOSIS_ONLY',
            'phase': phase if phase in PHASES else 'UNKNOWN',
            'outcome': outcome if outcome in {'COMPLETED', 'FAILED'} else 'FAILED',
            'native_build': 'NOT_RUN', 'native_probes': 'NOT_RUN'}


def emit(record):
    # Fixed vocabularies/booleans plus bounded HTTP and command numeric fields.
    payload = json.dumps(record, sort_keys=True)
    if len(payload.encode()) > 8192:
        payload = json.dumps(fixed_record('UNKNOWN', 'FAILED'))
    print('KEEPER_DIAGNOSTIC ' + payload, flush=True)


def error_kind(error):
    if isinstance(error, urllib.error.HTTPError):
        return {401: 'PUBLIC_HTTP_401', 403: 'PUBLIC_HTTP_403', 404: 'PUBLIC_HTTP_404',
                408: 'PUBLIC_HTTP_408', 429: 'PUBLIC_HTTP_429', 500: 'PUBLIC_HTTP_500',
                502: 'PUBLIC_HTTP_502', 503: 'PUBLIC_HTTP_503', 504: 'PUBLIC_HTTP_504'}.get(error.code, 'PUBLIC_HTTP_OTHER')
    for kind, cls in [('PUBLIC_NETWORK_ERROR', urllib.error.URLError),
                      ('TIMEOUT', TimeoutError), ('FILE_MISSING', FileNotFoundError),
                      ('FILESYSTEM_PERMISSION', PermissionError), ('JSON_INVALID', json.JSONDecodeError),
                      ('GIT_COMMAND_FAILED', subprocess.CalledProcessError),
                      ('KEY_MISSING', KeyError), ('TYPE_ERROR', TypeError),
                      ('VALUE_ERROR', ValueError), ('CHECK_OR_COMMAND_FAILED', RuntimeError)]:
        if isinstance(error, cls):
            return kind
    return 'UNCLASSIFIED_EXCEPTION'


def verifier_sites(error, verifier_path, site_map):
    sites = []
    tb = error.__traceback__
    while tb:
        if Path(tb.tb_frame.f_code.co_filename).resolve() == verifier_path.resolve():
            row = site_map.get(str(tb.tb_lineno))
            if row and re.fullmatch(r'V[0-9]{3}', row.get('code', '')):
                sites.append(row['code'])
        tb = tb.tb_next
    return sites[-6:]


def capture_http(error):
    # Diagnostic extraction cannot replace the original error class or exit code.
    try:
        return http_evidence.extract(error)
    except Exception:
        return {'state': 'EXTRACTION_FAILED', 'issuer_verified': False}


def classify_pod_text(text):
    # Categories identify pattern matches; they are not raw text or acceptance.
    text = re.sub(r'\x1b\[[0-9;]*[A-Za-z]', '', text)
    categories = [name for name, pattern in POD_PATTERNS
                  if re.search(pattern, text, re.I | re.M)]
    if not categories:
        categories = ['UNCLASSIFIED_POD_FAILURE']
    sections = []
    header = re.search(r'there were changes to the lockfile in deployment mode', text, re.I)
    if header:
        remainder = text[header.end():]
        for section in LOCK_SECTIONS:
            if re.search(r'(?m)^\s*[-+]?\s*' + re.escape(section) + r':(?:\s|$)', remainder):
                sections.append(section)
    classes = [name for name in RUBY_ERROR_CLASSES
               if re.search(r'(?<![A-Za-z0-9_:])' + re.escape(name) + r'(?![A-Za-z0-9_:])', text)]
    return {'matched_categories': categories, 'lock_section_mentions': sections,
            'ruby_error_classes': classes,
            'classification': 'KNOWN_MARKER' if categories != ['UNCLASSIFIED_POD_FAILURE'] else 'UNKNOWN',
            'output_state': 'EMPTY' if not text.strip() else 'NONEMPTY'}


def bundle_context(app, command_gemfile=None):
    """Predict Bundler 2.5.6 search selection; never execute Ruby/read arbitrary paths.

    This is source/environment evidence, not a claim of observed Ruby activation.
    Only filenames and path relationships are tested; no manifest text is exported.
    """
    app = Path(os.path.abspath(app))
    def label(path):
        if path.is_symlink() or not path.is_file():
            return 'OTHER_OR_UNAVAILABLE'
        for name, value in [('Gemfile', 'APP_ROOT'), ('ios/Gemfile', 'IOS')]:
            if path.absolute() == (app / name).absolute():
                return value
        return 'OTHER_OR_UNAVAILABLE'

    given = command_gemfile if command_gemfile is not None else os.environ.get('BUNDLE_GEMFILE')
    def selection(cwd):
        if given:
            path = Path(given)
            if not path.is_absolute():
                path = cwd / path
            # Do not stat, resolve, or open an arbitrary environment-provided path.
            path = Path(os.path.abspath(path))
            allowed = [Path(os.path.abspath(app / name)) for name in ('Gemfile', 'ios/Gemfile')]
            return label(path) if path in allowed else 'OTHER_OR_UNAVAILABLE'
        current = cwd
        while current == app or app in current.parents:
            for name in ('gems.rb', 'Gemfile'):
                path = current / name
                if path.is_symlink() or path.is_file():
                    return label(path)
            if current == app:
                break
            current = current.parent
        return 'OTHER_OR_UNAVAILABLE'

    return {'method': 'STATIC_BUNDLER_2_5_SEARCH',
            'gemfile_override': 'PRESENT' if given else 'ABSENT_OR_EMPTY',
            'install_selection': selection(app), 'pod_selection': selection(app / 'ios')}


def pod_observation(app, private):
    result = {'schema_version': 2, 'capture_stream': 'STDOUT_STDERR_COMBINED',
              'command': 'POD_INSTALL_DEPLOYMENT', 'status': 'NOT_OBSERVED',
              'log_window': 'UNAVAILABLE', 'matched_categories': [], 'lock_section_mentions': [],
              'exit_code': None, 'ruby_error_classes': [], 'classification': 'NOT_OBSERVED',
              'output_state': 'UNAVAILABLE', 'log_bytes_capped': None}
    result['bundle_context'] = {'method': 'UNAVAILABLE'}
    try:
        result['bundle_context'] = bundle_context(app)
        metadata = app / 'artifacts/native/ios/metadata.json'
        if metadata.is_symlink() or not metadata.is_file() or metadata.stat().st_size > MAX_METADATA:
            return result
        commands = json.loads(metadata.read_text()).get('commands', [])
        if not isinstance(commands, list) or len(commands) > 256:
            return result
        matches = [(i, entry) for i, entry in enumerate(commands, 1)
                   if isinstance(entry, dict) and entry.get('command') == ['env', 'BUNDLE_FROZEN=true', 'BUNDLE_GEMFILE=' + str(app / 'Gemfile'), 'bundle', 'exec', 'pod', 'install', '--deployment']]
        if len(matches) != 1:
            return result
        number, entry = matches[0]
        result['bundle_context'] = bundle_context(app, str(app / 'Gemfile'))
        code = entry.get('exit_code')
        result['exit_code'] = code if type(code) is int and -128 <= code <= 255 else None
        result['status'] = ('COMPLETED' if type(code) is int and code == 0 else
                            'TIMEOUT' if type(code) is int and code == 124 else
                            'SIGNALED' if type(code) is int and -128 <= code < 0 else
                            'FAILED' if type(code) is int and 0 < code < 256 else 'INCOMPLETE')
        path = private / ('command-%03d.log' % number)
        # Only the fixed private command filename is read, never a metadata path.
        if path.is_symlink() or not path.is_file():
            return result
        with path.open('rb') as stream:
            first = stream.read(WINDOW)
            size = path.stat().st_size
            result['log_bytes_capped'] = min(size, 2147483647)
            if size > WINDOW:
                stream.seek(max(WINDOW, size - WINDOW))
                first += b'\n' + stream.read(WINDOW)
        result['log_window'] = 'TRUNCATED' if size > WINDOW * 2 else 'COMPLETE'
        result['output_state'] = 'EMPTY' if not first.strip() else 'NONEMPTY'
        if result['status'] != 'COMPLETED':
            result.update(classify_pod_text(first.decode(errors='replace')))
        else:
            result['classification'] = 'NOT_APPLICABLE'
    except Exception:
        result['log_window'] = 'UNAVAILABLE'
    return result


def load_modules():
    verifier_path = HERE / 'verify.py'
    site_document = json.loads((HERE / 'verifier-sites.json').read_text())
    if hashlib.sha256(verifier_path.read_bytes()).hexdigest() != site_document['verify_sha256']:
        raise RuntimeError('VERIFIER_MAP_MISMATCH')
    import verify
    return verify, site_document['sites']


def run(phase, verify, sites):
    app, _, _ = verify.roots()
    private = Path(os.environ['RUNNER_TEMP']) / 'keeper-native-private'
    record = fixed_record(phase, 'FAILED')
    result = 1
    guard_failed = False
    request_failed = False

    def checked_guard():
        nonlocal guard_failed
        try:
            verify.guard()
        except BaseException:
            guard_failed = True
            raise

    try:
        if phase == 'stage':
            verify.stage()
        else:
            if os.environ.get('KEEPER_NATIVE_PLATFORM') != 'IOS':
                raise RuntimeError('IOS_ONLY')
            checked_guard()
            spec = importlib.util.spec_from_file_location('diagnostic_reviewed_harness',
                                                        app / '.github/native/hosted_native.py')
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            # Use the pinned entry point so its environment setup is identical.
            previous_argv = sys.argv
            try:
                sys.argv = [str(app / '.github/native/hosted_native.py'), phase]
                module.main()
            finally:
                sys.argv = previous_argv
            checked_guard()
        record['outcome'] = 'COMPLETED'
        result = 0
    except Exception as error:
        record['error_category'] = error_kind(error)
        record['verifier_sites'] = verifier_sites(error, HERE / 'verify.py', sites)
        request_failed = isinstance(error, (urllib.error.URLError, TimeoutError, ConnectionError))
        if isinstance(error, urllib.error.HTTPError):
            record['http_response'] = capture_http(error)
    finally:
        if phase == 'prepare':
            record['pod'] = pod_observation(app, private)
            # Never repeat a failed guard/request, including denial and timeout.
            if guard_failed or request_failed:
                record['post_prepare_guard'] = ('NOT_RUN_AFTER_GUARD_FAILURE' if guard_failed
                                                else 'NOT_RUN_AFTER_NETWORK_FAILURE')
                record['outcome'] = 'FAILED'
                result = 1
            else:
                # Still check after ordinary command failure; never turn it into success.
                try:
                    checked_guard()
                    record['post_prepare_guard'] = 'COMPLETED'
                except Exception as error:
                    record['post_prepare_guard'] = 'FAILED'
                    record['post_prepare_guard_error'] = error_kind(error)
                    record['post_prepare_guard_sites'] = verifier_sites(error, HERE / 'verify.py', sites)
                    if isinstance(error, urllib.error.HTTPError):
                        record['post_prepare_http_response'] = capture_http(error)
                    record['outcome'] = 'FAILED'
                    result = 1
        emit(record)
    return result


def main():
    phase = sys.argv[1] if len(sys.argv) == 2 else 'UNKNOWN'
    if phase not in PHASES:
        emit(fixed_record('UNKNOWN', 'FAILED'))
        return 1
    verify, sites = load_modules()
    return run(phase, verify, sites)


if __name__ == '__main__':
    try:
        exit_code = main()
    except BaseException:
        emit(fixed_record('UNKNOWN', 'FAILED'))
        exit_code = 1
    raise SystemExit(exit_code)
