const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const driver = require('../native/canonical_native.cjs');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

function fixture() {
  const source = 'a'.repeat(40), repository = driver.REPOSITORY;
  const context = { eventName: 'workflow_dispatch', ref: 'refs/heads/sprint', sha: source, runId: 400,
    repo: { owner: 'KeeperCommunity', repo: 'bitcoin-keeper' } };
  const env = { KEEPER_SOURCE_SHA: source, GITHUB_WORKFLOW_SHA: source, KEEPER_CANONICAL_NATIVE_DRIVER_SHA: source,
    GITHUB_WORKFLOW_REF: `${repository}/${driver.WORKFLOW}@refs/heads/sprint`, GITHUB_RUN_ID: '400', GITHUB_RUN_ATTEMPT: '2' };
  const request = driver.requestFromEnvironment(context, env);
  const state = { context, env, request, calls: [], branchReads: 0,
    repository: { id: driver.REPOSITORY_ID, full_name: repository, default_branch: 'sprint' },
    pin: { name: 'KEEPER_CANONICAL_NATIVE_DRIVER_SHA', value: source },
    branch: { protected: true, commit: { sha: source } }, workflow: { id: 30, path: driver.WORKFLOW, state: 'active' },
    run: { id: 400, run_attempt: 2, workflow_id: 30, event: 'workflow_dispatch', path: driver.WORKFLOW,
      head_sha: source, head_branch: 'sprint', head_repository: { id: driver.REPOSITORY_ID, full_name: repository },
      pull_requests: [], status: 'in_progress', check_suite_id: 77 },
    suite: { id: 77, app: { id: 15368, slug: 'github-actions' }, head_sha: source }, active: [] };
  state.jobs = ['IOS', 'ANDROID'].map((platform, index) => ({
    name: `${platform.toLowerCase()} / Canonical ${platform} build and features`, run_id: 400, run_attempt: 2,
    head_sha: source, status: 'completed', conclusion: 'success',
    check_run_url: `https://api.github.com/repos/${repository}/check-runs/${90 + index}`,
    steps: driver.requiredSteps(platform).map(name => ({ name, status: 'completed', conclusion: 'success' })),
  }));
  state.metadata = Object.fromEntries(['IOS', 'ANDROID'].map(platform => [platform, {
    schema: 1, platform, source_sha: source, workflow_sha: source, workflow_ref: env.GITHUB_WORKFLOW_REF,
    run_id: '400', run_attempt: '2', diagnostic_only: false,
    app_id: platform === 'IOS' ? 'io.hexawallet.hexakeeper.dev' : 'io.hexawallet.keeper.development',
    build: 'PASS', smoke: 'PASS', native_probe: 'PASS', r5_features: 'PASS', private_field: 'PRIVATE_SENTINEL',
    product_ui: { status: 'PASS', requested_samples: 5, controlled_disconnect_retry: { status: 'PASS' },
      samples: [1, 2, 3, 4, 5].map(sample => ({ sample, status: 'PASS', create_new_app_calls: 1,
        visible_wallet_count_before_relaunch: 1, visible_wallet_count_after_relaunch: 1,
        raw_durations: { startup_to_passcode_ms: 120, start_new_to_ready_ms: 500 } })) },
  }]));
  state.archives = Object.values(state.metadata).map(value => Buffer.from(JSON.stringify(value)));
  state.artifacts = ['IOS', 'ANDROID'].map((platform, index) => ({ id: 101 + index,
    name: driver.artifactName(platform, request), expired: false, size_in_bytes: state.archives[index].length,
    digest: `sha256:${hash(state.archives[index])}`, workflow_run: { id: 400, head_sha: source } }));
  const wrap = (name, fn) => async args => { state.calls.push(name); return { data: await fn(args) }; };
  state.github = { rest: {
    repos: { get: wrap('repository', () => state.repository), getBranch: wrap('branch', () => {
      state.branchReads++; return state.moveAfterRead && state.branchReads > 1 ? { ...state.branch, commit: { sha: 'b'.repeat(40) } } : state.branch;
    }) },
    actions: { getWorkflow: wrap('workflow', args => {
      assert.equal(args.workflow_id, 'keeper-canonical-native.yml'); return state.workflow;
    }), getWorkflowRun: wrap('run', () => state.run),
      listWorkflowRuns: wrap('runs', () => ({ total_count: state.newerRun ? 2 : 1, workflow_runs: state.newerRun ? [state.run, { ...state.run, id: 401 }] : [state.run] })),
      getRepoVariable: wrap('pin', () => {
        if (state.pinUnavailable) throw new Error('API403');
        return state.pinAfterDownload && state.downloaded ? { ...state.pin, value: '' } : state.pin;
      }),
      listWorkflowRunsForRepo: wrap('capacity', args => {
        state.capacityStatuses ??= []; state.capacityStatuses.push(args.status);
        const selected = state.waitingOnly ? args.status === 'waiting' ? state.active : [] : state.active;
        return { total_count: selected.length, workflow_runs: selected };
      }),
      listJobsForWorkflowRunAttempt: () => {},
      listWorkflowRunArtifacts: wrap('artifacts', () => ({ total_count: state.artifacts.length, artifacts: state.artifacts })),
      getArtifact: wrap('artifact-current', args => ({ ...state.artifacts[args.artifact_id - 101],
        ...(state.expireAfterDownload ? { expired: true } : {}) })),
      downloadArtifact: wrap('download', args => {
        state.downloaded = true;
        if (state.staleAfterDownload) state.run = { ...state.run, run_attempt: 3 };
        return state.archives[args.artifact_id - 101];
      }) },
    checks: { getSuite: wrap('suite', () => state.suite), get: wrap('check', args => ({
      id: state.checkId ?? args.check_run_id,
      name: state.checkName ?? state.jobs[args.check_run_id - 90]?.name,
      app: state.checkApp || { id: 15368, slug: 'github-actions' }, head_sha: source,
      check_suite: { id: 77 }, status: 'completed', conclusion: 'success' })) },
    git: { getCommit: wrap('tree', () => ({ sha: source, tree: { sha: 'c'.repeat(40) } })) },
  }, paginate: async () => state.jobs };
  return state;
}

test('only pinned immutable manual canonical source is admitted', () => {
  const f = fixture(); assert.equal(f.request.sourceSha, f.context.sha);
  for (const change of [x => { x.env.KEEPER_CANONICAL_NATIVE_DRIVER_SHA = ''; },
    x => { x.context.eventName = 'pull_request'; }, x => { x.context.ref = 'refs/heads/untrusted'; },
    x => { x.env.GITHUB_WORKFLOW_SHA = 'b'.repeat(40); }, x => { x.env.GITHUB_RUN_ATTEMPT = '0'; },
    x => { x.env.GITHUB_WORKFLOW_REF = 'other'; }]) {
    const bad = fixture(); change(bad); assert.throws(() => driver.requestFromEnvironment(bad.context, bad.env));
  }
});
test('actual Actions app and exact current protected source/run/attempt are required', async () => {
  await driver.origin(fixture().github, fixture().context, fixture().request);
  for (const change of [x => { x.suite.app.id = 999; }, x => { x.run.id++; },
    x => { x.run.run_attempt--; }, x => { x.run.head_sha = 'b'.repeat(40); },
    x => { x.run.path = '.github/workflows/forged.yml'; }, x => { x.workflow.state = 'disabled_manually'; },
    x => { x.run.head_repository.id = 9; }, x => { x.branch.protected = false; },
    x => { x.branch.commit.sha = 'b'.repeat(40); }, x => { x.newerRun = true; },
    x => { x.run.event = 'pull_request'; }, x => { x.run.pull_requests.push({ number: 7058 }); }]) {
    const f = fixture(); change(f); await assert.rejects(driver.origin(f.github, f.context, f.request));
  }
});
test('capacity admission rejects other native runs without cancelling them', async () => {
  const f = fixture(); f.active = [{ id: 99, path: '.github/workflows/keeper-hosted-native.yml' }];
  await assert.rejects(driver.origin(f.github, f.context, f.request, { admission: true }), /ANOTHER_NATIVE/);
  assert.equal(f.active[0].id, 99);
  f.active = [{ id: 98, path: '.github/workflows/test.yml' }];
  await driver.origin(f.github, f.context, f.request, { admission: true });
  assert.deepEqual([...new Set(f.capacityStatuses)].sort(), ['in_progress', 'pending', 'queued', 'requested', 'waiting']);
});
test('waiting native capacity and revoked/unreadable live pin fail closed', async () => {
  for (const change of [x => { x.waitingOnly = true; x.active = [{ id: 99, path: driver.WORKFLOW }]; },
    x => { x.pin.value = ''; }, x => { x.pinUnavailable = true; }]) {
    const f = fixture(); change(f); await assert.rejects(driver.origin(f.github, f.context, f.request, { admission: true }));
  }
});
test('missing/skipped/duplicate/stale platform jobs or forged check apps cannot pass', async () => {
  for (const change of [x => { x.jobs.pop(); }, x => { x.jobs.push(x.jobs[0]); },
    x => { x.jobs[0].run_attempt = 1; }, x => { x.jobs[0].conclusion = 'skipped'; },
    x => { x.jobs[0].steps[0].conclusion = 'skipped'; }, x => { x.jobs[0].steps.pop(); },
    x => { x.checkApp = { id: 4, slug: 'github-actions' }; },
    x => { x.checkId = 999; }, x => { x.checkName = 'other job'; }]) {
    const f = fixture(); change(f); await assert.rejects(driver.platformJobs(f.github, f.context, f.request, f.run));
  }
});
test('receipt identity rejects another source/platform/app/workflow/run attempt', () => {
  for (const change of [x => { x.source_sha = 'b'.repeat(40); }, x => { x.platform = 'ANDROID'; },
    x => { x.app_id = 'io.production.app'; }, x => { x.workflow_ref = 'other'; },
    x => { x.run_attempt = '1'; }, x => { x.run_id = '401'; }, x => { x.diagnostic_only = true; }]) {
    const f = fixture(), metadata = structuredClone(f.metadata.IOS); change(metadata);
    assert.throws(() => driver.validateMetadata(metadata, f.request, 'IOS'));
  }
});
test('real implemented observations stay discoverable without clearing parent obligations', () => {
  const f = fixture(), result = driver.validateMetadata(f.metadata.IOS, f.request, 'IOS');
  assert.equal(result.executed_checks['five-product-observations'].status, 'PASS');
  assert.equal(result.executed_checks['production-worker-controls'].status, 'PASS');
  assert.equal(result.cases.filter(item => item.status === 'NOT IMPLEMENTED').length, 5);
});
test('artifact names, digests and current-attempt provenance are independently checked', async () => {
  for (const change of [x => { x.artifacts[0].name = x.artifacts[0].name.replace('-2', '-1'); },
    x => { x.artifacts[0].digest = `sha256:${'0'.repeat(64)}`; }, x => { x.artifacts[0].expired = true; },
    x => { x.artifacts[0].workflow_run.id = 399; }, x => { x.artifacts[0].size_in_bytes++; },
    x => { x.expireAfterDownload = true; }]) {
    const f = fixture(), output = fs.mkdtempSync(path.join(os.tmpdir(), 'canonical-test-'));
    try { change(f); await assert.rejects(driver.collect(f.github, f.context, f.request, output, raw => raw)); }
    finally { fs.rmSync(output, { recursive: true, force: true }); }
  }
});
test('complete native subsets emit bounded BLOCKED readiness and no reusable attestation', async () => {
  const f = fixture(), output = fs.mkdtempSync(path.join(os.tmpdir(), 'canonical-test-'));
  try {
    fs.writeFileSync(path.join(output, 'keeper-canonical-native-attestation.json'), 'stale');
    await assert.rejects(driver.collect(f.github, f.context, f.request, output, raw => raw), /MATRIX_INCOMPLETE/);
    assert.equal(fs.existsSync(path.join(output, 'keeper-canonical-native-attestation.json')), false);
    const raw = fs.readFileSync(path.join(output, 'keeper-canonical-native-readiness.json'), 'utf8');
    const result = JSON.parse(raw); assert.equal(result.feature_matrix_complete, false);
    assert.equal(result.platforms.IOS.receipt_sha256, hash(f.archives[0]));
    assert.equal(raw.includes('PRIVATE_SENTINEL'), false);
  } finally { fs.rmSync(output, { recursive: true, force: true }); }
});
test('head movement and stale rerun after platform artifact download invalidate collection', async () => {
  for (const change of [x => { x.moveAfterRead = true; }, x => { x.staleAfterDownload = true; },
    x => { x.pinAfterDownload = true; }]) {
    const f = fixture(), output = fs.mkdtempSync(path.join(os.tmpdir(), 'canonical-test-'));
    try { change(f); await assert.rejects(driver.collect(f.github, f.context, f.request, output, raw => raw));
      assert.equal(fs.existsSync(path.join(output, 'keeper-canonical-native-attestation.json')), false); }
    finally { fs.rmSync(output, { recursive: true, force: true }); }
  }
});
