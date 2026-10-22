'use strict';
// No network: API doubles + optionally the authorized saved original ZIP.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createRequire } = require('node:module');
const { sdkDownloadArtifact } = require('./fixtures/github-script-sdk-shape.cjs');
const ROOT = path.resolve(__dirname, '../..');
const SCRIPT = '.github/scripts/probe-public-artifact-transport.cjs';
const FILES = [SCRIPT, '.github/native/actions_software_evidence.cjs', '.github/native/release_preflight.cjs',
  '.github/native/public_companion_receipts.cjs', '.github/native/strict_json.cjs', '.github/native/software_artifact_zip.py'];
const source = '1bc34890cb8618b2fffd446a63924974e0fe15b5', control = '3c44ab6412a8118b183273c402dd08136db05b28';
const originalPath = process.env.R5_ARTIFACT_FIXTURE;
const original = originalPath ? fs.readFileSync(originalPath) : null;
const needsOriginal = { skip: original ? false : 'NOT RUN: authorized R5_ARTIFACT_FIXTURE required' };
const repository = { id: 470904030, full_name: 'KeeperCommunity/bitcoin-keeper' };

async function fixture(action) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'r5-artifact-transport-'));
  const oldCwd = process.cwd(), oldSha = process.env.GITHUB_WORKFLOW_SHA;
  const git = args => execFileSync('git', args, { cwd: directory, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  try {
    for (const file of FILES) {
      const target = path.join(directory, file); fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(ROOT, file), target); fs.chmodSync(target, 0o644);
    }
    fs.writeFileSync(path.join(directory, '.gitignore'), '.github/native/json.py\n');
    git(['init', '-q']); git(['add', '.']);
    git(['-c', 'core.hooksPath=/dev/null', '-c', 'user.name=Disposable', '-c', 'user.email=disposable@example.invalid', 'commit', '-qm', 'fixed synthetic source']);
    const sha = git(['rev-parse', 'HEAD']); process.chdir(directory); process.env.GITHUB_WORKFLOW_SHA = sha;
    const probe = require(path.join(directory, SCRIPT));
    const state = { directory, git, probe, calls: [], sha, context: { sha, eventName: 'push',
      ref: 'refs/heads/codex/r5-public-artifact-transport-proof-20261022', repo: { owner: 'KeeperCommunity', repo: 'bitcoin-keeper' } },
      targetRun: { id: 39858617273, run_attempt: 1, workflow_id: 392538840, head_sha: source,
        head_branch: 'codex/r5-ios-startup-diagnosis-20261022', event: 'pull_request', path: '.github/workflows/keeper-native-diagnostic.yml',
        repository, head_repository: repository, status: 'in_progress', referenced_workflows: [{
          path: `KeeperCommunity/bitcoin-keeper/.github/workflows/keeper-native-platform.yml@${control}`, sha: control, ref: 'refs/pull/7116/merge' }] },
      artifact: { id: 12462694619, name: `keeper-diagnostic-native-IOS-${source}-39858617273-1`, expired: false,
        size_in_bytes: 6884, digest: 'sha256:550142809a0faf812741a586630b17d6f458b2b6c935b5bab4b00f84da67c84f',
        expires_at: '2099-01-01T00:00:00Z', workflow_run: { id: 39858617273, head_sha: source,
          head_branch: 'codex/r5-ios-startup-diagnosis-20261022', repository_id: 470904030,
          head_repository_id: 470904030 } }, location: 'https://fixture.blob.core.windows.net/fixed?sig=PRIVATE_TEST_URL' };
    state.github = { rest: { actions: {
      getWorkflowRun: async args => { assert.equal(args.run_id, 39858617273); state.calls.push('run'); return { status: 200, data: structuredClone(state.targetRun) }; },
      getArtifact: async args => { assert.equal(args.artifact_id, 12462694619); state.calls.push('artifact'); return { status: 200, data: structuredClone(state.artifact) }; },
      downloadArtifact: async args => { assert.equal(args.artifact_id, 12462694619); state.calls.push('download');
        return sdkDownloadArtifact(args, state.fetchImpl, state.sdkObservation); },
    } } };
    state.sdkObservation = {};
    state.fetchImpl = async (url, options) => {
      if (String(url) === 'https://api.github.com/repos/KeeperCommunity/bitcoin-keeper/actions/artifacts/12462694619/zip') {
        state.calls.push('manual-api'); assert.equal(options.redirect, 'manual'); assert.equal(options.method, 'GET');
        assert.equal(options.headers.authorization, 'Bearer DISPOSABLE_TEST_API_IDENTITY');
        return new Response(new ReadableStream({ cancel() { state.apiCancelled = (state.apiCancelled || 0) + 1; } }),
          { status: state.redirectStatus || 302, headers: { location: state.location } });
      }
      state.calls.push('stream'); assert.equal(String(url), state.location);
      assert.equal(options.headers, undefined); assert.equal(options.redirect, 'error'); assert.ok(options.signal instanceof AbortSignal);
      if (state.downloadMutation) state.downloadMutation();
      const bytes = state.bytes || original || Buffer.from('not the fixed archive');
      let at = 0;
      return new Response(new ReadableStream({ pull(controller) {
        if (at === bytes.length) controller.close();
        else { controller.enqueue(bytes.subarray(at, at + 1024)); at += Math.min(1024, bytes.length - at); }
      } }), { status: 200, headers: state.omitLength ? {} : { 'content-length': state.lengthHeader ?? String(bytes.length) } });
    };
    state.run = () => probe.run({ github: state.github, context: state.context, fetchImpl: state.fetchImpl });
    await action(state);
  } finally {
    process.chdir(oldCwd);
    if (oldSha === undefined) delete process.env.GITHUB_WORKFLOW_SHA; else process.env.GITHUB_WORKFLOW_SHA = oldSha;
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test('actual authorized original ZIP streams through production adapter and exposes only fixed safe facts', needsOriginal, async () => {
  await fixture(async f => {
    const result = await f.run();
    assert.equal(result.archive_bytes, 6884); assert.equal(result.member_bytes, 29150);
    assert.equal(result.original_smoke, 'FAIL'); assert.equal(result.original_native_probe, 'NOT RUN');
    for (const field of ['native_acceptance', 'installed_trust', 'release_ready', 'authorization_eligible', 'release_authorized', 'execution_allowed']) assert.equal(result[field], false);
    assert.equal(result.retained_raw_files, 0); assert.equal(result.source_fences, 2);
    assert.deepEqual(f.calls, ['run', 'artifact', 'download', 'manual-api', 'stream', 'run', 'artifact']);
    assert.equal(f.apiCancelled, 1); assert.equal(f.sdkObservation.parsedBodies || 0, 0);
    const output = JSON.stringify(result); assert.equal(output.includes('PRIVATE_TEST_URL'), false);
    assert.equal(output.includes('metadata.json'), false); assert.equal(output.includes('http'), false);
  });
});
for (const [name, mutate] of [
  ['wrong repository', f => { f.targetRun.repository = { ...repository, id: 1 }; }],
  ['wrong source', f => { f.targetRun.head_sha = 'a'.repeat(40); }],
  ['wrong run', f => { f.targetRun.id++; }], ['wrong attempt', f => { f.targetRun.run_attempt++; }],
  ['wrong workflow', f => { f.targetRun.path = '.github/workflows/other.yml'; }],
  ['wrong control', f => { f.targetRun.referenced_workflows[0].sha = source; }],
  ['wrong merge ref', f => { f.targetRun.referenced_workflows[0].ref = 'refs/heads/sprint'; }],
  ['wrong artifact owner', f => { f.artifact.workflow_run.repository_id = 1; }],
  ['wrong artifact run', f => { f.artifact.workflow_run.id++; }],
  ['wrong artifact id', f => { f.artifact.id++; }], ['wrong size', f => { f.artifact.size_in_bytes++; }],
  ['wrong digest', f => { f.artifact.digest = 'sha256:' + 'a'.repeat(64); }],
  ['expired flag', f => { f.artifact.expired = true; }], ['past expiry', f => { f.artifact.expires_at = '2000-01-01'; }],
]) test(`rejects fixed identity mismatch: ${name}`, async () => fixture(async f => {
  mutate(f); await assert.rejects(f.run(), /^Error: FIXED_ARTIFACT_(RUN|IDENTITY)_INVALID$/);
  assert.equal(f.calls.includes('download'), false);
}));
for (const location of ['http://fixture.blob.core.windows.net/fixed', 'https://fixture.evil.invalid/fixed',
  'https://fixture.blob.core.windows.net.evil.invalid/fixed', 'https://user:private@fixture.blob.core.windows.net/fixed',
  'https://fixture.blob.core.windows.net:444/fixed', 'https://fixture.blob.core.windows.net/fixed#private']) {
  test('rejects an untrusted redirect without sending headers or reading storage', async () => fixture(async f => {
    f.location = location; await assert.rejects(f.run(), /^Error: SOFTWARE_ARCHIVE_HOST_INVALID$/);
    assert.equal(f.calls.includes('stream'), false);
  }));
}
for (const [name, mutate, error] of [
  ['buffered SDK response', f => { f.redirectStatus = 200; }, 'SOFTWARE_ARCHIVE_REDIRECT_REQUIRED'],
  ['wrong streamed bytes', f => { f.bytes = Buffer.from('untrusted bytes'); }, 'FIXED_ARTIFACT_ARCHIVE_INVALID'],
  ['lying length', f => { f.lengthHeader = '1'; }, 'SOFTWARE_ARCHIVE_SIZE_MISMATCH'],
  ['oversized length', f => { f.lengthHeader = '1048577'; }, 'SOFTWARE_ARCHIVE_TOO_LARGE'],
  ['oversized stream', f => { f.bytes = Buffer.alloc(1048577); f.omitLength = true; }, 'SOFTWARE_ARCHIVE_TOO_LARGE'],
]) test(`fails closed on ${name}`, async () => fixture(async f => {
  mutate(f); await assert.rejects(f.run(), new RegExp('^Error: ' + error + '$'));
}));
test('post-download source and API changes revoke the result', needsOriginal, async () => {
  for (const mutate of [f => { f.targetRun.run_attempt = 2; }, f => { f.artifact.expired = true; },
    f => fs.appendFileSync(path.join(f.directory, '.github/native/strict_json.cjs'), '\n// hidden overlay\n'),
    f => fs.writeFileSync(path.join(f.directory, '.github/native/json.py'), '# ignored overlay\n')]) {
    await fixture(async f => { f.downloadMutation = () => mutate(f); await assert.rejects(f.run()); });
  }
});
for (const flag of ['--assume-unchanged', '--skip-worktree']) test(`raw source fence rejects ${flag} hidden overlays before API`, async () => fixture(async f => {
  const file = '.github/native/strict_json.cjs'; f.git(['update-index', flag, file]); fs.appendFileSync(path.join(f.directory, file), '\n// overlay\n');
  await assert.rejects(f.run(), /^Error: FIXED_ARTIFACT_SOURCE_INVALID$/); assert.deepEqual(f.calls, []);
}));
test('push branch and immutable workflow SHA pins reject another context before API', async () => {
  for (const mutate of [f => { f.context.eventName = 'pull_request'; }, f => { f.context.ref = 'refs/heads/sprint'; },
    f => { process.env.GITHUB_WORKFLOW_SHA = 'b'.repeat(40); }, f => { f.context.repo.owner = 'foreign'; }]) {
    await fixture(async f => { mutate(f); await assert.rejects(f.run(), /^Error: FIXED_ARTIFACT_CONTEXT_INVALID$/); assert.deepEqual(f.calls, []); });
  }
});
for (const name of ['base64.py', 'json.py']) test(`rejects untracked or ignored Python import shadow ${name}`, async () => fixture(async f => {
  const file = '.github/native/' + name;
  fs.writeFileSync(path.join(f.directory, file), '# unreviewed module\n');
  if (name === 'json.py') assert.equal(f.git(['check-ignore', file]), file);
  await assert.rejects(f.run(), /^Error: FIXED_ARTIFACT_SOURCE_INVALID$/); assert.deepEqual(f.calls, []);
}));
test('literal paths and actual owner executable mode are required', async () => {
  for (const mutate of [f => fs.chmodSync(path.join(f.directory, '.github/native/strict_json.cjs'), 0o744), f => {
    fs.renameSync(path.join(f.directory, '.github/native'), path.join(f.directory, 'saved-native'));
    fs.symlinkSync(path.join(f.directory, 'saved-native'), path.join(f.directory, '.github/native'));
  }]) await fixture(async f => { mutate(f); await assert.rejects(f.run(), /^Error: FIXED_ARTIFACT_SOURCE_INVALID$/); assert.deepEqual(f.calls, []); });
});
test('errors expose fixed vocabulary rather than API payloads or temporary storage URLs', async () => fixture(async f => {
  f.github.rest.actions.getArtifact = async () => { throw new Error('PRIVATE_TEST_URL https://private.invalid/signature'); };
  await assert.rejects(f.run(), /^Error: FIXED_ARTIFACT_TRANSPORT_PROBE_FAILED$/);
}));
test('inline bootstrap rejects changed, executable or symlinked script before requiring it', async () => {
  const yaml = fs.readFileSync(path.join(ROOT, '.github/workflows/r5-public-artifact-transport-proof.yml'), 'utf8');
  const source = yaml.split('          script: |\n')[1].split('\n').map(line => line.slice(12)).join('\n');
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  for (const mutate of [f => fs.appendFileSync(path.join(f.directory, SCRIPT), '\n// unreviewed\n'),
    f => { f.git(['config', 'core.filemode', 'false']); fs.chmodSync(path.join(f.directory, SCRIPT), 0o744); },
    f => { const file = path.join(f.directory, SCRIPT); fs.renameSync(file, file + '.saved'); fs.symlinkSync(file + '.saved', file); }]) {
    await fixture(async f => {
      mutate(f); let loaded = false;
      const local = createRequire(path.join(f.directory, 'bootstrap.cjs'));
      const guarded = name => { if (name.startsWith('./')) loaded = true; return local(name); };
      await assert.rejects(new AsyncFunction('require', 'context', 'github', 'core', source)(guarded, f.context, f.github, {}),
        /FIXED_ARTIFACT_BOOTSTRAP_INVALID/);
      assert.equal(loaded, false); assert.deepEqual(f.calls, []);
    });
  }
});
