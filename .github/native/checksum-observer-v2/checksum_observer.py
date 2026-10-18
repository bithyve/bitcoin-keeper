"""Bounded local evidence processor. No network, install, repair or acceptance path.

The Ruby adapter supplies actual compared objects over a private pipe. This module
exports only fixed fields. A trusted policy binds inputs/paths before it is used.
"""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import stat
import sys

ROOT = Path(__file__).resolve().parent
SOURCE = 'bccb63348754e7a7975ea140717d31be214f0801'
TREE = '3768d44eaa9005f56f564b1faeb2732bef2da1e8'
HARNESS = '0984c5b97e7e8326d6856ba662274ecf325e5e0f'
SECTIONS = ('PODS', 'DEPENDENCIES', 'SPEC REPOS', 'EXTERNAL SOURCES',
            'CHECKOUT OPTIONS', 'SPEC CHECKSUMS', 'PODFILE CHECKSUM', 'COCOAPODS')
GEMS = ('cocoapods', 'cocoapods-core', 'json', 'xcodeproj', 'activesupport', 'claide')
TOOLS = ('ruby', 'installer', 'json_ruby', 'json_backend')
MAX_FILE = 1024 * 1024
MAX_TOTAL = 16 * MAX_FILE
MAX_TOOL_FILE = 64 * MAX_FILE
MAX_TOOL_TOTAL = 256 * MAX_FILE
MAX_CAPTURE = 2 * MAX_FILE
MAX_RECORD = 8192
MAX_OUTPUT = 128 * 1024
VERSION = re.compile(r'[0-9]{1,3}(?:\.[0-9]{1,3}){1,3}\Z')
HEX40 = re.compile(r'[0-9a-f]{40}\Z')
HEX64 = re.compile(r'[0-9a-f]{64}\Z')
FIXTURE = {'array': [], 'object': {}, 'nested': [[], {}], 'text': '[] {} " \\'}


class Invalid(Exception):
    """Only fixed codes may leave the processor."""
    pass


def require(value, code='INVALID_CAPTURE'):
    if not value:
        raise Invalid(code)


def sha(data, algorithm='sha256'):
    return hashlib.new(algorithm, data).hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'),
                      ensure_ascii=True, allow_nan=False).encode('ascii')


def parse(data, limit=MAX_FILE):
    require(isinstance(data, bytes) and len(data) <= limit, 'INPUT_LIMIT')
    def pairs(values):
        result = {}
        for key, value in values:
            require(key not in result, 'INVALID_JSON')
            result[key] = value
        return result
    def constant(_):
        raise Invalid('INVALID_JSON')
    try:
        value = json.loads(data.decode('utf-8'), object_pairs_hook=pairs,
                           parse_constant=constant)
        pending, count = [(value, 0)], 0
        while pending:
            item, depth = pending.pop()
            count += 1
            require(depth <= 64 and count <= 100000, 'INPUT_LIMIT')
            if isinstance(item, dict):
                pending.extend((v, depth + 1) for v in item.values())
            elif isinstance(item, list):
                pending.extend((v, depth + 1) for v in item)
            elif isinstance(item, float):
                require(math.isfinite(item), 'INVALID_JSON')
        return value
    except Invalid:
        raise
    except (ValueError, TypeError, UnicodeError, RecursionError):
        raise Invalid('INVALID_JSON') from None


def empty_formats(data):
    """Change only known empty-container whitespace; preserve all other bytes."""
    original = parse(data)
    legacy, compact, stack = bytearray(), bytearray(), []
    i = 0
    while i < len(data):
        char = data[i:i + 1]
        if char == b'"':
            j = i + 1
            while j < len(data):
                if data[j:j + 1] == b'\\':
                    j += 2
                elif data[j:j + 1] == b'"':
                    j += 1
                    break
                else:
                    j += 1
            token = data[i:j]
            legacy.extend(token); compact.extend(token)
            i = j
            continue
        if char in (b'[', b'{'):
            end = b']' if char == b'[' else b'}'
            j = i + 1
            while j < len(data) and data[j:j + 1] in (b' ', b'\t', b'\n', b'\r'):
                j += 1
            if data[j:j + 1] == end:
                inside = (b'\n\n' if char == b'[' else b'\n') + b'  ' * len(stack)
                require(data[i + 1:j] in (b'', inside), 'UNSUPPORTED_FORMAT')
                legacy.extend(char + inside + end)
                compact.extend(char + end)
                i = j + 1
                continue
            stack.append(end)
        elif char in (b']', b'}'):
            require(stack and stack.pop() == char, 'INVALID_JSON')
        legacy.extend(char); compact.extend(char)
        i += 1
    require(not stack, 'INVALID_JSON')
    legacy, compact = bytes(legacy), bytes(compact)
    require(parse(legacy) == parse(compact) == original, 'INVALID_JSON')
    return legacy, compact


_fixture_compact = (json.dumps(FIXTURE, indent=2, ensure_ascii=False) + '\n').encode()
_fixture_legacy, _fixture_compact = empty_formats(_fixture_compact)
FINGERPRINTS = {sha(_fixture_legacy): 'LEGACY_EMPTY', sha(_fixture_compact): 'COMPACT_EMPTY'}


class SafeReader:
    def __init__(self, roots):
        require(isinstance(roots, list) and 0 < len(roots) <= 16, 'INVALID_POLICY')
        self.roots = tuple(self.normal(p) for p in roots)
        self.total = 0
        self.tool_total = 0

    @staticmethod
    def normal(path):
        require(isinstance(path, str) and path.startswith('/') and len(path) <= 4096,
                'PATH_REJECTED')
        require('\x00' not in path and all(p not in ('.', '..', '') for p in path[1:].split('/')),
                'PATH_REJECTED')
        return path

    def read(self, path):
        return self._consume(path, tool=False)

    def hash_tool(self, path):
        """Hash approved executables/extensions without buffering their bytes.

        Tool limits are separate from the smaller podspec/input limits. Every
        call rereads the file so separate runtime snapshots detect mutations.
        """
        return self._consume(path, tool=True)

    def _consume(self, path, *, tool):
        path = self.normal(path)
        require(any(path == root or path.startswith(root + '/') for root in self.roots),
                'PATH_REJECTED')
        fd = None
        try:
            fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY)
            parts = path[1:].split('/')
            for part in parts[:-1]:
                child = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
                os.close(fd); fd = child
            child = os.open(parts[-1], os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=fd)
            os.close(fd); fd = child
            before = os.fstat(fd)
            require(stat.S_ISREG(before.st_mode), 'PATH_REJECTED')
            limit = MAX_TOOL_FILE if tool else MAX_FILE
            total = self.tool_total if tool else self.total
            aggregate_limit = MAX_TOOL_TOTAL if tool else MAX_TOTAL
            require(before.st_size <= limit and total + before.st_size <= aggregate_limit,
                    'INPUT_LIMIT')
            chunks, size = [], 0
            digest = hashlib.sha256() if tool else None
            while True:
                block = os.read(fd, min(65536, limit + 1 - size))
                if not block:
                    break
                size += len(block)
                require(size <= limit and total + size <= aggregate_limit, 'INPUT_LIMIT')
                if tool:
                    digest.update(block)
                else:
                    chunks.append(block)
            after = os.fstat(fd)
            fields = ('st_dev', 'st_ino', 'st_size', 'st_mtime_ns', 'st_ctime_ns')
            require(all(getattr(before, f) == getattr(after, f) for f in fields)
                    and size == before.st_size, 'INPUT_CHANGED')
            if tool:
                self.tool_total += size
                return digest.hexdigest()
            self.total += size
            return b''.join(chunks)
        except Invalid:
            raise
        except (OSError, ValueError, TypeError):
            raise Invalid('PATH_REJECTED') from None
        finally:
            if fd is not None:
                os.close(fd)


def load_inputs():
    allow = parse((ROOT / 'pod-allowlist.json').read_bytes())
    baseline = parse((ROOT / 'baseline-lock.json').read_bytes())
    require(allow['source_sha'] == SOURCE and allow['source_tree'] == TREE, 'INVALID_POLICY')
    rows = allow['pods']
    require(len(rows) == 142 and len(baseline['SPEC CHECKSUMS']) == 142, 'INVALID_POLICY')
    require([r['name'] for r in rows] == sorted(baseline['SPEC CHECKSUMS']), 'INVALID_POLICY')
    for i, row in enumerate(rows, 1):
        require(row['id'] == f'P{i:03d}' and HEX40.fullmatch(row['old_sha1'])
                and row['old_sha1'] == baseline['SPEC CHECKSUMS'][row['name']], 'INVALID_POLICY')
    return rows, baseline


def versions(lock):
    result = {}
    require(isinstance(lock.get('PODS'), list), 'INVALID_CAPTURE')
    for entry in lock['PODS']:
        require(isinstance(entry, (str, dict)), 'INVALID_CAPTURE')
        if isinstance(entry, dict):
            require(len(entry) == 1, 'INVALID_CAPTURE')
            entry = next(iter(entry))
        match = re.fullmatch(r'([^ ()]+) \(([^()]+)\)', entry)
        require(match is not None, 'INVALID_CAPTURE')
        result.setdefault(match[1].split('/')[0], set()).add(match[2])
    return result


def runtime(snapshot, policy, reader):
    require(isinstance(snapshot, dict) and set(snapshot) ==
            {'ruby', 'engine', 'patchlevel', 'arch', 'gems', 'json_version', 'backend', 'fingerprint', 'files'},
            'RUNTIME_UNVERIFIED')
    require(isinstance(snapshot['ruby'], str) and VERSION.fullmatch(snapshot['ruby']), 'RUNTIME_UNVERIFIED')
    require(snapshot['engine'] in ('ruby', 'jruby', 'truffleruby'), 'RUNTIME_UNVERIFIED')
    require(type(snapshot['patchlevel']) is int and -1 <= snapshot['patchlevel'] <= 9999, 'RUNTIME_UNVERIFIED')
    require(snapshot['arch'] in ('X86_64', 'ARM64', 'OTHER'), 'RUNTIME_UNVERIFIED')
    require(snapshot['backend'] in ('C', 'PURE', 'OTHER'), 'RUNTIME_UNVERIFIED')
    require(isinstance(snapshot['gems'], dict) and set(snapshot['gems']) == set(GEMS), 'RUNTIME_UNVERIFIED')
    require(all(v is None or isinstance(v, str) and VERSION.fullmatch(v)
                for v in snapshot['gems'].values()), 'RUNTIME_UNVERIFIED')
    require(snapshot['gems']['cocoapods'] == snapshot['gems']['cocoapods-core'] == '1.16.2',
            'RUNTIME_UNVERIFIED')
    require(snapshot['json_version'] == snapshot['gems']['json'] and snapshot['json_version'] is not None,
            'RUNTIME_UNVERIFIED')
    require(isinstance(snapshot['fingerprint'], str) and HEX64.fullmatch(snapshot['fingerprint']),
            'RUNTIME_UNVERIFIED')
    require(set(snapshot['files']) == set(TOOLS) == set(policy['tool_files']), 'RUNTIME_UNVERIFIED')
    digests = {}
    for tool in TOOLS:
        item = policy['tool_files'][tool]
        require(set(item) == {'path', 'sha256'} and HEX64.fullmatch(item['sha256']), 'INVALID_POLICY')
        require(snapshot['files'][tool] == item['path'], 'PATH_REJECTED')
        digest = reader.hash_tool(item['path'])
        require(digest == item['sha256'], 'INPUT_CHANGED')
        digests[tool] = digest
    return {**{k: snapshot[k] for k in ('ruby', 'engine', 'patchlevel', 'arch', 'gems', 'json_version', 'backend')},
            'fingerprint': snapshot['fingerprint'],
            'format': FINGERPRINTS.get(snapshot['fingerprint'], 'OTHER'), 'implementation_sha256': digests}


def immutable_check(policy, reader):
    require(isinstance(policy.get('immutable_files'), dict) and 1 <= len(policy['immutable_files']) <= 32,
            'INVALID_POLICY')
    require({'package.json', 'yarn.lock', 'Podfile', 'Podfile.lock'} <=
            {Path(p).name for p in policy['immutable_files']}, 'INVALID_POLICY')
    for path, digest in policy['immutable_files'].items():
        require(isinstance(digest, str) and HEX64.fullmatch(digest), 'INVALID_POLICY')
        require(sha(reader.read(path)) == digest, 'INPUT_CHANGED')


def implementation_digest():
    return sha(canonical({name: sha((ROOT / name).read_bytes())
                          for name in ('checksum_observer.py', 'capture.rb')}))


def identity(policy):
    require(type(policy.get('attempt')) is int and 1 <= policy['attempt'] <= 10**15, 'INVALID_POLICY')
    require(isinstance(policy.get('cache_sha256'), str) and HEX64.fullmatch(policy['cache_sha256']), 'INVALID_POLICY')
    return {'attempt': policy['attempt'], 'policy_sha256': sha(canonical(policy)),
            'cache_sha256': policy['cache_sha256'], 'observer_sha256': implementation_digest(),
            'allowlist_sha256': sha((ROOT / 'pod-allowlist.json').read_bytes()),
            'baseline_sha256': sha((ROOT / 'baseline-lock.json').read_bytes())}


def preflight(policy):
    """Verify approved local policy files before loading the Ruby/toolchain code.

    This does not verify remote provenance, cache completeness, runtime activation
    or offline containment. Those existing integration gates remain mandatory.
    """
    allow, _ = load_inputs()
    require(isinstance(policy, dict) and set(policy) ==
            {'source_sha', 'source_tree', 'harness_sha', 'roots', 'spec_paths', 'tool_files',
             'immutable_files', 'attempt', 'cache_sha256'}, 'INVALID_POLICY')
    require((policy['source_sha'], policy['source_tree'], policy['harness_sha']) ==
            (SOURCE, TREE, HARNESS), 'INVALID_POLICY')
    require(set(policy['spec_paths']) == {r['name'] for r in allow}
            and set(policy['tool_files']) == set(TOOLS), 'INVALID_POLICY')
    ident = identity(policy)
    reader = SafeReader(policy['roots'])
    immutable_check(policy, reader)
    for tool in TOOLS:
        item = policy['tool_files'][tool]
        require(set(item) == {'path', 'sha256'} and isinstance(item['sha256'], str)
                and HEX64.fullmatch(item['sha256']), 'INVALID_POLICY')
        require(reader.hash_tool(item['path']) == item['sha256'], 'INPUT_CHANGED')
    return ident


def build_report(capture, policy):
    """All failures become finite output; original process failure is adapter-owned."""
    result = {'schema': 1, 'source_sha': SOURCE, 'source_tree': TREE, 'harness_sha': HARNESS,
              'comparison': 'INCOMPLETE', 'attribution': 'INCOMPLETE', 'integrity': 'UNVERIFIED',
              'deployment': 'NOT_OBSERVED', 'acceptance': 'NOT_ACCEPTED', 'reasons': [],
              'identity': {}, 'runtime': [], 'sections': {}, 'counts': {}, 'rows': []}
    try:
        allow, baseline = load_inputs()
        require(isinstance(policy, dict) and set(policy) ==
                {'source_sha', 'source_tree', 'harness_sha', 'roots', 'spec_paths', 'tool_files', 'immutable_files', 'attempt', 'cache_sha256'},
                'INVALID_POLICY')
        require((policy['source_sha'], policy['source_tree'], policy['harness_sha']) ==
                (SOURCE, TREE, HARNESS), 'INVALID_POLICY')
        require(set(policy['spec_paths']) == {r['name'] for r in allow}, 'INVALID_POLICY')
        result['identity'] = identity(policy)
        reader = SafeReader(policy['roots'])
        immutable_check(policy, reader)
        require(isinstance(capture, dict) and set(capture) ==
                {'source_sha', 'old_lock', 'new_lock', 'specs', 'runtime', 'comparison', 'identity'}, 'INVALID_CAPTURE')
        require(capture['source_sha'] == SOURCE, 'SOURCE_MISMATCH')
        require(capture['identity'] == result['identity'], 'IDENTITY_MISMATCH')
        require(capture['comparison'] in ('FAILED', 'EQUAL'), 'INVALID_CAPTURE')
        result['deployment'] = capture['comparison']
        require(capture['old_lock'] == baseline, 'BASELINE_MISMATCH')
        new = capture['new_lock']
        require(isinstance(new, dict) and set(new) == set(SECTIONS), 'LOCK_SECTIONS_CHANGED')
        require((capture['comparison'] == 'EQUAL') == (baseline == new), 'COMPARISON_CONTRADICTION')
        checksums = new['SPEC CHECKSUMS']
        require(isinstance(checksums, dict) and len(checksums) <= 4096, 'INPUT_LIMIT')
        require(all(isinstance(v, str) and HEX40.fullmatch(v) for v in checksums.values()), 'INVALID_CHECKSUM')
        require(isinstance(capture['runtime'], list) and len(capture['runtime']) == 2, 'RUNTIME_UNVERIFIED')
        result['runtime'] = [runtime(s, policy, reader) for s in capture['runtime']]
        require(isinstance(capture['specs'], list) and len(capture['specs']) <= 4096, 'INPUT_LIMIT')
        specs = {}
        for spec in capture['specs']:
            require(isinstance(spec, dict) and set(spec) == {'name', 'path'}, 'INVALID_CAPTURE')
            require(isinstance(spec['name'], str) and spec['name'] not in specs, 'DUPLICATE_SPEC')
            specs[spec['name']] = spec['path']
        names = {r['name'] for r in allow}
        unexpected = (set(checksums) | set(specs)) - names
        old_versions, new_versions = versions(baseline), versions(new)
        result['sections'] = {s: 'SAME' if baseline[s] == new[s] else 'CHANGED' for s in SECTIONS}
        reasons = set()
        if unexpected:
            reasons.add('UNEXPECTED_SPEC')
        for expected in allow:
            name = expected['name']
            observed = checksums.get(name)
            row = {'id': expected['id'], 'old_sha1': expected['old_sha1'], 'new_sha1': observed,
                   'state': 'MISSING' if observed is None else 'SAME' if observed == expected['old_sha1'] else 'CHANGED',
                   'version': 'MISSING' if name not in new_versions else
                   'SAME' if old_versions.get(name) == new_versions[name] else 'CHANGED',
                   'file_kind': 'MISSING', 'file_sha1': None, 'file_sha256': None,
                   'matches_new': False, 'legacy_sha1': None, 'compact_sha1': None,
                   'semantic_equal': False, 'cause': 'OTHER_OR_UNRESOLVED'}
            try:
                require(observed is not None and name in specs, 'MISSING_SPEC')
                require(specs[name] == policy['spec_paths'][name], 'PATH_REJECTED')
                data = reader.read(specs[name])
                row['file_kind'] = 'JSON' if specs[name].endswith('.json') else 'RUBY' if specs[name].endswith('.podspec') else 'OTHER'
                row['file_sha1'], row['file_sha256'] = sha(data, 'sha1'), sha(data)
                row['matches_new'] = row['file_sha1'] == observed
                require(row['matches_new'], 'SPEC_FILE_MISMATCH')
                if row['state'] == 'SAME':
                    row['cause'] = 'UNCHANGED'
                elif row['file_kind'] == 'JSON':
                    legacy, compact = empty_formats(data)
                    row.update(legacy_sha1=sha(legacy, 'sha1'), compact_sha1=sha(compact, 'sha1'), semantic_equal=True)
                    if data in (legacy, compact) and expected['old_sha1'] in (row['legacy_sha1'], row['compact_sha1']):
                        row['cause'] = 'FORMAT_ONLY_PROVEN'
                else:
                    row['cause'] = 'NOT_JSON'
            except Invalid as error:
                reasons.add(str(error))
            result['rows'].append(row)
        counts = {state.lower(): sum(r['state'] == state for r in result['rows']) for state in ('SAME', 'CHANGED', 'MISSING')}
        result['counts'] = dict(expected=142, observed=len(checksums), unexpected=len(unexpected), **counts)
        # Comparison completeness is distinct from evidence needed for attribution.
        if not counts['missing'] and not unexpected:
            result['comparison'] = 'COMPLETE'
        immutable_check(policy, reader)
        result['integrity'] = 'VERIFIED'
        if (not reasons and result['comparison'] == 'COMPLETE'
                and all(v == 'SAME' for k, v in result['sections'].items() if k != 'SPEC CHECKSUMS')
                and all(r['cause'] in ('UNCHANGED', 'FORMAT_ONLY_PROVEN') and r['version'] == 'SAME'
                        for r in result['rows'])
                and result['runtime'][-1]['format'] != 'OTHER'):
            result['attribution'] = 'COMPLETE'
        result['reasons'] = sorted(reasons)
    except Invalid as error:
        result['reasons'] = [str(error)]
    except Exception:
        result['reasons'] = ['INVALID_CAPTURE']
    return result


def pack(report):
    validate_report(report)
    require(len(report['rows']) in (0, 142), 'INVALID_REPORT')
    chunks = [report['rows'][i:i + 12] for i in range(0, len(report['rows']), 12)]
    header = {k: v for k, v in report.items() if k != 'rows'}
    records = [{'kind': 'HEADER', 'data': header}]
    for i, rows in enumerate(chunks):
        records.append({'kind': 'ROWS', 'sequence': i, 'rows': rows, 'sha256': sha(canonical(rows))})
    records.append({'kind': 'END', 'chunks': len(chunks), 'rows': len(report['rows']),
                    'sha256': sha(canonical(report))})
    encoded = [canonical(r) + b'\n' for r in records]
    require(all(len(r) <= MAX_RECORD for r in encoded) and sum(map(len, encoded)) <= MAX_OUTPUT,
            'OUTPUT_LIMIT')
    return b''.join(encoded)


def _unpack(data, expected_identity=None):
    require(isinstance(data, bytes) and len(data) <= MAX_OUTPUT, 'OUTPUT_LIMIT')
    lines = data.splitlines(keepends=True)
    require(2 <= len(lines) <= 14 and all(l.endswith(b'\n') and len(l) <= MAX_RECORD for l in lines),
            'INCOMPLETE_STREAM')
    records = [parse(l, MAX_RECORD) for l in lines]
    require(set(records[0]) == {'kind', 'data'} and records[0]['kind'] == 'HEADER', 'INCOMPLETE_STREAM')
    require(set(records[-1]) == {'kind', 'chunks', 'rows', 'sha256'} and records[-1]['kind'] == 'END', 'INCOMPLETE_STREAM')
    require(type(records[-1]['chunks']) is int and type(records[-1]['rows']) is int
            and isinstance(records[-1]['sha256'], str) and HEX64.fullmatch(records[-1]['sha256']), 'INCOMPLETE_STREAM')
    report = records[0]['data']
    require(isinstance(report, dict) and 'rows' not in report, 'INCOMPLETE_STREAM')
    rows = []
    for i, record in enumerate(records[1:-1]):
        require(set(record) == {'kind', 'sequence', 'rows', 'sha256'} and record['kind'] == 'ROWS'
                and type(record['sequence']) is int and record['sequence'] == i, 'INCOMPLETE_STREAM')
        require(isinstance(record['rows'], list) and len(record['rows']) == (10 if i == 11 else 12), 'INCOMPLETE_STREAM')
        require(record['sha256'] == sha(canonical(record['rows'])), 'INCOMPLETE_STREAM')
        rows.extend(record['rows'])
    require(len(rows) in (0, 142) and records[-1]['chunks'] == len(records) - 2
            and records[-1]['rows'] == len(rows), 'INCOMPLETE_STREAM')
    if rows:
        require([r['id'] for r in rows] == [f'P{i:03d}' for i in range(1, 143)], 'INCOMPLETE_STREAM')
    report['rows'] = rows
    require(records[-1]['sha256'] == sha(canonical(report)), 'INCOMPLETE_STREAM')
    require(expected_identity is not None and report.get('identity') == expected_identity, 'IDENTITY_MISMATCH')
    # Reconstruct through the producer's schema validator (implemented below).
    validate_report(report)
    return report


def unpack(data, expected_identity=None):
    try:
        return _unpack(data, expected_identity)
    except Invalid:
        raise
    except Exception:
        raise Invalid('INCOMPLETE_STREAM') from None


def validate_report(report):
    """Reject injected fields/values even if an attacker recomputes stream digests."""
    require(set(report) == {'schema', 'source_sha', 'source_tree', 'harness_sha', 'comparison', 'attribution',
                           'integrity', 'deployment', 'acceptance', 'reasons', 'identity', 'runtime', 'sections', 'counts', 'rows'}, 'INVALID_REPORT')
    require(type(report['schema']) is int and report['schema'] == 1 and (report['source_sha'], report['source_tree'], report['harness_sha']) ==
            (SOURCE, TREE, HARNESS) and report['acceptance'] == 'NOT_ACCEPTED', 'INVALID_REPORT')
    require(report['comparison'] in ('COMPLETE', 'INCOMPLETE') and report['attribution'] in ('COMPLETE', 'INCOMPLETE')
            and report['integrity'] in ('VERIFIED', 'UNVERIFIED') and report['deployment'] in ('FAILED', 'EQUAL', 'NOT_OBSERVED'), 'INVALID_REPORT')
    allowed_reasons = {'INVALID_CAPTURE', 'INVALID_POLICY', 'INPUT_LIMIT', 'INVALID_JSON', 'UNSUPPORTED_FORMAT',
                       'PATH_REJECTED', 'INPUT_CHANGED', 'RUNTIME_UNVERIFIED', 'SOURCE_MISMATCH', 'BASELINE_MISMATCH',
                       'LOCK_SECTIONS_CHANGED', 'INVALID_CHECKSUM', 'DUPLICATE_SPEC', 'UNEXPECTED_SPEC', 'MISSING_SPEC', 'SPEC_FILE_MISMATCH',
                       'IDENTITY_MISMATCH', 'COMPARISON_CONTRADICTION'}
    require(isinstance(report['reasons'], list) and len(report['reasons']) <= len(allowed_reasons)
            and all(r in allowed_reasons for r in report['reasons']), 'INVALID_REPORT')
    require(set(report['sections']) <= set(SECTIONS) and all(v in ('SAME', 'CHANGED') for v in report['sections'].values()), 'INVALID_REPORT')
    require(set(report['counts']) <= {'expected', 'observed', 'unexpected', 'same', 'changed', 'missing'}
            and all(type(v) is int and 0 <= v <= 4096 for v in report['counts'].values()), 'INVALID_REPORT')
    require(isinstance(report['rows'], list) and len(report['rows']) in (0, 142), 'INVALID_REPORT')
    if report['identity']:
        ident = report['identity']
        require(set(ident) == {'attempt', 'policy_sha256', 'cache_sha256', 'observer_sha256', 'allowlist_sha256', 'baseline_sha256'}, 'INVALID_REPORT')
        require(type(ident['attempt']) is int and 1 <= ident['attempt'] <= 10**15, 'INVALID_REPORT')
        require(all(isinstance(v, str) and HEX64.fullmatch(v) for k, v in ident.items() if k != 'attempt'), 'INVALID_REPORT')
        require(ident['observer_sha256'] == implementation_digest()
                and ident['allowlist_sha256'] == sha((ROOT / 'pod-allowlist.json').read_bytes())
                and ident['baseline_sha256'] == sha((ROOT / 'baseline-lock.json').read_bytes()), 'INVALID_REPORT')
    if report['comparison'] == 'COMPLETE' or report['attribution'] == 'COMPLETE' or report['integrity'] == 'VERIFIED':
        require(bool(report['identity']) and len(report['rows']) == 142 and len(report['runtime']) == 2
                and set(report['sections']) == set(SECTIONS), 'INVALID_REPORT')
    if report['rows']:
        allow, _ = load_inputs()
        require([r.get('id') for r in report['rows']] == [r['id'] for r in allow], 'INVALID_REPORT')
        require([r.get('old_sha1') for r in report['rows']] == [r['old_sha1'] for r in allow], 'INVALID_REPORT')
        require(set(report['counts']) == {'expected', 'observed', 'unexpected', 'same', 'changed', 'missing'}
                and report['counts']['expected'] == 142, 'INVALID_REPORT')
        for state in ('SAME', 'CHANGED', 'MISSING'):
            require(report['counts'][state.lower()] == sum(r.get('state') == state for r in report['rows']), 'INVALID_REPORT')
        if report['comparison'] == 'COMPLETE':
            require(report['counts']['missing'] == report['counts']['unexpected'] == 0
                    and report['counts']['observed'] == 142, 'INVALID_REPORT')
    for row in report['rows']:
        require(set(row) == {'id', 'old_sha1', 'new_sha1', 'state', 'version', 'file_kind', 'file_sha1', 'file_sha256',
                            'matches_new', 'legacy_sha1', 'compact_sha1', 'semantic_equal', 'cause'}, 'INVALID_REPORT')
        require(row['state'] in ('MISSING', 'SAME', 'CHANGED') and row['version'] in ('MISSING', 'SAME', 'CHANGED')
                and row['file_kind'] in ('MISSING', 'JSON', 'RUBY', 'OTHER')
                and row['cause'] in ('OTHER_OR_UNRESOLVED', 'UNCHANGED', 'FORMAT_ONLY_PROVEN', 'NOT_JSON'), 'INVALID_REPORT')
        require(type(row['matches_new']) is bool and type(row['semantic_equal']) is bool, 'INVALID_REPORT')
        for key in ('old_sha1', 'new_sha1', 'file_sha1', 'legacy_sha1', 'compact_sha1', 'file_sha256'):
            value = row[key]
            require(value is None or isinstance(value, str) and (HEX64 if key == 'file_sha256' else HEX40).fullmatch(value), 'INVALID_REPORT')
        expected_state = 'MISSING' if row['new_sha1'] is None else 'SAME' if row['new_sha1'] == row['old_sha1'] else 'CHANGED'
        require(row['state'] == expected_state and row['old_sha1'] is not None, 'INVALID_REPORT')
        require(row['matches_new'] == (row['file_sha1'] is not None and row['file_sha1'] == row['new_sha1']), 'INVALID_REPORT')
        require((row['file_sha1'] is None) == (row['file_sha256'] is None)
                and (row['file_kind'] == 'MISSING') == (row['file_sha1'] is None), 'INVALID_REPORT')
        if row['semantic_equal']:
            require(row['file_kind'] == 'JSON' and row['legacy_sha1'] is not None and row['compact_sha1'] is not None, 'INVALID_REPORT')
        if row['cause'] == 'UNCHANGED':
            require(row['state'] == 'SAME' and row['matches_new'], 'INVALID_REPORT')
        if row['cause'] == 'FORMAT_ONLY_PROVEN':
            require(row['state'] == 'CHANGED' and row['file_kind'] == 'JSON' and row['matches_new'] and row['semantic_equal']
                    and row['old_sha1'] in (row['legacy_sha1'], row['compact_sha1'])
                    and row['new_sha1'] in (row['legacy_sha1'], row['compact_sha1']), 'INVALID_REPORT')
    require(isinstance(report['runtime'], list) and len(report['runtime']) in (0, 2), 'INVALID_REPORT')
    for row in report['runtime']:
        require(set(row) == {'ruby', 'engine', 'patchlevel', 'arch', 'gems', 'json_version', 'backend', 'fingerprint', 'format', 'implementation_sha256'}, 'INVALID_REPORT')
        require(row['engine'] in ('ruby', 'jruby', 'truffleruby') and row['arch'] in ('X86_64', 'ARM64', 'OTHER')
                and row['backend'] in ('C', 'PURE', 'OTHER') and row['format'] in ('LEGACY_EMPTY', 'COMPACT_EMPTY', 'OTHER'), 'INVALID_REPORT')
        require(type(row['patchlevel']) is int and -1 <= row['patchlevel'] <= 9999, 'INVALID_REPORT')
        require(set(row['gems']) == set(GEMS) and set(row['implementation_sha256']) == set(TOOLS), 'INVALID_REPORT')
        require(all(v is None or isinstance(v, str) and VERSION.fullmatch(v) for v in row['gems'].values()), 'INVALID_REPORT')
        require(all(isinstance(v, str) and VERSION.fullmatch(v) for v in (row['ruby'], row['json_version'])), 'INVALID_REPORT')
        require(all(isinstance(v, str) and HEX64.fullmatch(v) for v in [row['fingerprint'], *row['implementation_sha256'].values()]), 'INVALID_REPORT')
        require(row['format'] == FINGERPRINTS.get(row['fingerprint'], 'OTHER')
                and row['gems']['json'] == row['json_version']
                and row['gems']['cocoapods'] == row['gems']['cocoapods-core'] == '1.16.2', 'INVALID_REPORT')
    if report['deployment'] == 'EQUAL' and report['sections']:
        require(all(v == 'SAME' for v in report['sections'].values()), 'INVALID_REPORT')
    if report['attribution'] == 'COMPLETE':
        require(report['comparison'] == 'COMPLETE' and report['integrity'] == 'VERIFIED' and not report['reasons']
                and all(v == 'SAME' for k, v in report['sections'].items() if k != 'SPEC CHECKSUMS')
                and all(r['cause'] in ('UNCHANGED', 'FORMAT_ONLY_PROVEN') and r['version'] == 'SAME' for r in report['rows'])
                and report['runtime'][-1]['format'] != 'OTHER', 'INVALID_REPORT')
    if 'INPUT_CHANGED' in report['reasons']:
        require(report['integrity'] == 'UNVERIFIED', 'INVALID_REPORT')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--policy', required=True)
    parser.add_argument('--preflight', action='store_true')
    args = parser.parse_args()
    try:
        policy_path = os.path.abspath(args.policy)
        policy = parse(SafeReader([str(Path(policy_path).parent)]).read(policy_path))
        if args.preflight:
            record = {'kind': 'PREFLIGHT', 'status': 'LOCAL_POLICY_FILES_VERIFIED',
                      'identity': preflight(policy), 'acceptance': 'NOT_ACCEPTED'}
            sys.stdout.buffer.write(canonical(record) + b'\n')
            return 0
        capture = parse(sys.stdin.buffer.read(MAX_CAPTURE + 1), MAX_CAPTURE)
        report = build_report(capture, policy)
        validate_report(report)
        sys.stdout.buffer.write(pack(report))
        return 0 if report['comparison'] == 'COMPLETE' else 2
    except Exception:
        # Never echo an exception, argument, source path or malformed input.
        sys.stdout.write('{"kind":"OBSERVER_ERROR","status":"INCOMPLETE","acceptance":"NOT_ACCEPTED"}\n')
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
