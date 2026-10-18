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
)
LOCK_SECTIONS = ('PODS', 'DEPENDENCIES', 'SPEC REPOS', 'EXTERNAL SOURCES',
                 'CHECKOUT OPTIONS', 'SPEC CHECKSUMS', 'PODFILE CHECKSUM', 'COCOAPODS')


def fixed_record(phase, outcome):
    return {'acceptance': 'NOT_ACCEPTED', 'scope': 'INPUTS_AND_PODS_DIAGNOSIS_ONLY',
            'phase': phase if phase in PHASES else 'UNKNOWN',
            'outcome': outcome if outcome in {'COMPLETED', 'FAILED'} else 'FAILED',
            'native_build': 'NOT_RUN', 'native_probes': 'NOT_RUN'}


def emit(record):
    # All callers construct this object solely from fixed vocabularies/booleans.
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
    return {'matched_categories': categories, 'lock_section_mentions': sections}


def pod_observation(app, private):
    result = {'command': 'POD_INSTALL_DEPLOYMENT', 'status': 'NOT_OBSERVED',
              'log_window': 'UNAVAILABLE', 'matched_categories': [], 'lock_section_mentions': []}
    try:
        metadata = app / 'artifacts/native/ios/metadata.json'
        if not metadata.is_file() or metadata.stat().st_size > MAX_METADATA:
            return result
        commands = json.loads(metadata.read_text()).get('commands', [])
        if not isinstance(commands, list) or len(commands) > 256:
            return result
        matches = [(i, entry) for i, entry in enumerate(commands, 1)
                   if isinstance(entry, dict) and entry.get('command') == ['pod', 'install', '--deployment']]
        if len(matches) != 1:
            return result
        number, entry = matches[0]
        code = entry.get('exit_code')
        result['status'] = ('COMPLETED' if type(code) is int and code == 0 else
                            'TIMEOUT' if type(code) is int and code == 124 else
                            'FAILED' if type(code) is int and 0 < code < 256 else 'INCOMPLETE')
        path = private / ('command-%03d.log' % number)
        # Only the fixed private command filename is read, never a metadata path.
        if path.is_symlink() or not path.is_file():
            return result
        with path.open('rb') as stream:
            first = stream.read(WINDOW)
            size = path.stat().st_size
            if size > WINDOW:
                stream.seek(max(WINDOW, size - WINDOW))
                first += b'\n' + stream.read(WINDOW)
        result['log_window'] = 'TRUNCATED' if size > WINDOW * 2 else 'COMPLETE'
        if result['status'] != 'COMPLETED':
            result.update(classify_pod_text(first.decode(errors='replace')))
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
    try:
        if phase == 'stage':
            verify.stage()
        else:
            if os.environ.get('KEEPER_NATIVE_PLATFORM') != 'IOS':
                raise RuntimeError('IOS_ONLY')
            verify.guard()
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
            verify.guard()
        record['outcome'] = 'COMPLETED'
        result = 0
    except Exception as error:
        record['error_category'] = error_kind(error)
        record['verifier_sites'] = verifier_sites(error, HERE / 'verify.py', sites)
    finally:
        if phase == 'prepare':
            record['pod'] = pod_observation(app, private)
            # This additional check never replaces a command failure with success.
            try:
                verify.guard()
                record['post_prepare_guard'] = 'COMPLETED'
            except Exception as error:
                record['post_prepare_guard'] = 'FAILED'
                record['post_prepare_guard_error'] = error_kind(error)
                record['post_prepare_guard_sites'] = verifier_sites(error, HERE / 'verify.py', sites)
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
