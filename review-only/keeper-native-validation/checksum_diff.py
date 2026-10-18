"""Read only CocoaPods 1.16.2 deployment-error checksum pairs; never parse YAML."""
import hashlib
import json
from pathlib import Path
import re

ALLOWLIST_SHA256 = '028a68bee6cf3354e9e942def5e3d7f1163527cade48b9e41630429bbc7b2099'
HEADER = '[!] There were changes to the lockfile in deployment mode:'
FOLLOWING_SECTIONS = ('PODFILE CHECKSUM', 'COCOAPODS')
MAX_LOG = 128 * 1024
CHUNK_ROWS = 20


def allowlist():
    path = Path(__file__).with_name('pod-allowlist.json')
    if path.is_symlink() or path.stat().st_size > 64 * 1024:
        raise ValueError('ALLOWLIST_INVALID')
    raw = path.read_bytes()
    if hashlib.sha256(raw).hexdigest() != ALLOWLIST_SHA256:
        raise ValueError('ALLOWLIST_INVALID')
    return {row['name']: row['old_sha1'] for row in json.loads(raw)['pods']}


def extract(text, complete):
    """All-or-nothing checksum subsection, not a claim about other lock sections.

    Source format: Installer#verify_no_lockfile_changes! -> Differ.hash_diff
    (Old/New Lockfile) -> YAMLHelper.convert_hash. No aliases, tags, escapes,
    arbitrary names, paths, other sections' values, or exception text exported.
    """
    result = {'state': 'UNAVAILABLE', 'complete': False, 'changed_roots': None, 'chunks': 0}
    try:
        if not complete or len(text.encode()) > MAX_LOG:
            return dict(result, state='INCOMPLETE_LOG')
        text = re.sub(r'\x1b\[[0-9;]*m', '', text)
        lines = text.splitlines()
        headers = [i for i, line in enumerate(lines) if line == HEADER]
        if not headers:
            return dict(result, state='NOT_OBSERVED')
        if len(headers) != 1:
            return dict(result, state='UNRECOGNIZED')
        lines = lines[headers[0] + 1:]
        starts = [i for i, line in enumerate(lines) if line == 'SPEC CHECKSUMS:']
        if len(starts) != 1:
            return dict(result, state='UNRECOGNIZED')
        allowed = allowlist()
        rows = []
        seen = set()
        i = starts[0] + 1
        while i < len(lines):
            line = lines[i]
            if not line:
                i += 1
                continue
            if any(line == section + ':' for section in FOLLOWING_SECTIONS):
                break
            # Command.run's ensure prints queued warnings after the error via
            # UI.print_warnings: a blank line then a top-level [!] message.
            # None of that warning text belongs to the YAML checksum section.
            if rows and i > 0 and lines[i - 1] == '' and line.startswith('[!] '):
                break
            name_match = re.fullmatch(r'  ([A-Za-z0-9_.-]+):', line)
            if not name_match or i + 2 >= len(lines):
                return dict(result, state='UNRECOGNIZED')
            name = name_match[1]
            if name not in allowed or name in seen:
                return dict(result, state='UNRECOGNIZED')
            pair = {}
            for value in lines[i + 1:i + 3]:
                match = re.fullmatch(r'    (Old|New) Lockfile: ([\'\"]?)([0-9a-f]{40})\2', value)
                if not match or match[1] in pair:
                    return dict(result, state='UNRECOGNIZED')
                pair[match[1]] = match[3]
            if set(pair) != {'Old', 'New'} or pair['Old'] != allowed[name] or pair['Old'] == pair['New']:
                return dict(result, state='UNRECOGNIZED')
            seen.add(name)
            rows.append({'name': name, 'old_sha1': pair['Old'], 'new_sha1': pair['New']})
            i += 3
        if not rows or not text.endswith('\n'):
            return dict(result, state='UNRECOGNIZED')
        rows.sort(key=lambda row: row['name'])
        return {'state': 'COMPLETE_CHECKSUM_SECTION', 'complete': True, 'changed_roots': len(rows),
                'chunks': (len(rows) + CHUNK_ROWS - 1) // CHUNK_ROWS, 'rows': rows}
    except Exception:
        return result


def records(evidence):
    """Pre-serialize every chunk before emitting any; preserve the 8 KiB cap."""
    rows = evidence.get('rows', [])
    if evidence.get('state') != 'COMPLETE_CHECKSUM_SECTION' or not 1 <= len(rows) <= 142:
        return []
    payloads = []
    for start in range(0, len(rows), CHUNK_ROWS):
        record = {'schema_version': 1, 'acceptance': 'NOT_ACCEPTED',
                  'scope': 'DEPLOYMENT_ERROR_CHECKSUM_SECTION_ONLY',
                  'chunk': start // CHUNK_ROWS + 1, 'chunks': evidence['chunks'],
                  'changed_roots': len(rows), 'rows': rows[start:start + CHUNK_ROWS]}
        payload = json.dumps(record, sort_keys=True)
        if len(payload.encode()) > 8192:
            raise ValueError('CHECKSUM_RECORD_TOO_LARGE')
        payloads.append(payload)
    return payloads
