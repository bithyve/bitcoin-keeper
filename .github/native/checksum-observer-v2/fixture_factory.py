"""Synthetic fixture inputs; never app/native validation evidence."""
import copy
from pathlib import Path
import checksum_observer as obs


def make_case(directory, changed=103):
    root = Path(directory)
    root.mkdir(parents=True, exist_ok=True)
    allow, specs, paths, old_checksums, new_checksums, pods = [], [], {}, {}, {}, []
    for i in range(1, 143):
        name = f'Fixture{i:03d}'
        compact = ('{\n  "name": "' + name + '",\n  "dependencies": []\n}\n').encode()
        legacy, compact = obs.empty_formats(compact)
        old = legacy if i <= changed else compact
        file = root / (name + '.json')
        file.write_bytes(compact)
        old_checksums[name], new_checksums[name] = obs.sha(old, 'sha1'), obs.sha(compact, 'sha1')
        allow.append({'id': f'P{i:03d}', 'name': name, 'old_sha1': old_checksums[name]})
        specs.append({'name': name, 'path': str(file)})
        paths[name] = str(file)
        pods.append(name + ' (1.0.0)')
    baseline = {'PODS': pods, 'DEPENDENCIES': sorted(paths), 'SPEC REPOS': {}, 'EXTERNAL SOURCES': {},
                'CHECKOUT OPTIONS': {}, 'SPEC CHECKSUMS': old_checksums, 'PODFILE CHECKSUM': 'a' * 40,
                'COCOAPODS': '1.16.2'}
    new = copy.deepcopy(baseline)
    new['SPEC CHECKSUMS'] = new_checksums
    immutable_files = {}
    for name in ('package.json', 'yarn.lock', 'Podfile', 'Podfile.lock'):
        immutable = root / name
        immutable.write_bytes(obs.canonical(baseline))
        immutable_files[str(immutable)] = obs.sha(immutable.read_bytes())
    tool_files = {}
    for tool in obs.TOOLS:
        file = root / (tool + '.fixture')
        file.write_text('synthetic tool file: ' + tool + '\n')
        tool_files[tool] = {'path': str(file), 'sha256': obs.sha(file.read_bytes())}
    policy = {'source_sha': obs.SOURCE, 'source_tree': obs.TREE, 'harness_sha': obs.HARNESS,
              'roots': [str(root)], 'spec_paths': paths, 'tool_files': tool_files,
              'immutable_files': immutable_files, 'attempt': 1, 'cache_sha256': 'c' * 64}
    snapshot = {'ruby': '3.3.8', 'engine': 'ruby', 'patchlevel': 0, 'arch': 'ARM64',
                'gems': {g: '1.16.2' if g.startswith('cocoapods') else '2.8.0' if g == 'json' else '1.0.0' for g in obs.GEMS},
                'json_version': '2.8.0', 'backend': 'C', 'fingerprint': obs.sha(obs._fixture_compact),
                'files': {k: v['path'] for k, v in tool_files.items()}}
    capture = {'source_sha': obs.SOURCE, 'old_lock': baseline, 'new_lock': new, 'specs': specs,
               'runtime': [copy.deepcopy(snapshot), copy.deepcopy(snapshot)],
               'comparison': 'FAILED' if changed else 'EQUAL', 'identity': obs.identity(policy)}
    return capture, policy, allow, baseline
