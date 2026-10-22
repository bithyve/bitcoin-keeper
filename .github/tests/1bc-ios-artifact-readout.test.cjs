'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { run } = require('../scripts/read-1bc-ios-artifact.cjs');
const SOURCE = '1bc34890cb8618b2fffd446a63924974e0fe15b5';
const WORKFLOW = '3c44ab6412a8118b183273c402dd08136db05b28';
const DIGEST = '550142809a0faf812741a586630b17d6f458b2b6c935b5bab4b00f84da67c84f';

function fixture() {
  const context = { repo: { owner: 'KeeperCommunity', repo: 'bitcoin-keeper' },
    eventName: 'push', ref: 'refs/heads/codex/r5-1bc-ios-artifact-readout' };
  const runData = { id: 39858617273, run_attempt: 1, repository: { id: 470904030 },
    head_repository: { id: 470904030 }, head_sha: SOURCE, event: 'pull_request',
    head_branch: 'codex/r5-ios-startup-diagnosis-20261022', path: '.github/workflows/keeper-native-diagnostic.yml',
    status: 'in_progress', conclusion: null, referenced_workflows: [{
      path: `KeeperCommunity/bitcoin-keeper/.github/workflows/keeper-native-platform.yml@${WORKFLOW}`,
      ref: 'refs/pull/7116/merge', sha: WORKFLOW }] };
  const jobData = { id: 120103187854, run_id: 39858617273, head_sha: SOURCE,
    name: 'ios / Native IOS build and probes', status: 'completed', conclusion: 'failure',
    steps: [['Check out exact app source', 'success'], ['Verify current diagnostic source', 'success'],
      ['Install immutable native dependencies', 'success'], ['Check disposable iOS driver readiness', 'success'],
      ['Build development app', 'success'], ['Run disposable startup smoke', 'failure'],
      ['Run disposable native persistence probe', 'skipped'], ['Run R5 production worker native scenarios', 'skipped'],
      ['Measure five full-product startup and first-wallet runs', 'skipped'], ['Retain safe Phase A evidence', 'success']]
      .map(([name, conclusion]) => ({ name, conclusion, status: 'completed' })) };
  const jobs = { total_count: 3, jobs: [{ id: 120103187854 }, { id: 120103189932 },
    { id: 120125972406, run_id: 39858617273, head_sha: SOURCE,
      name: 'android / Native ANDROID build and probes', status: 'in_progress', conclusion: null }] };
  const artifact = { id: 12462694619, name: `keeper-diagnostic-native-IOS-${SOURCE}-39858617273-1`,
    expired: false, size_in_bytes: 6884, digest: `sha256:${DIGEST}`, workflow_run: {
      id: 39858617273, head_sha: SOURCE, repository_id: 470904030, head_repository_id: 470904030,
      head_branch: 'codex/r5-ios-startup-diagnosis-20261022' } };
  const commit = { sha: SOURCE, commit: { tree: { sha: '2e9cd57bf9f78b92cac73e9343ddbd0eef25e86e' } } };
  const pr = { number: 7116, head: { sha: SOURCE, ref: runData.head_branch, repo: { id: 470904030 } },
    state: 'open', merged: false };
  const calls = [], output = [], actions = {};
  for (const [name, data] of [['getWorkflowRun', runData], ['getJobForWorkflowRun', jobData],
    ['getArtifact', artifact], ['listJobsForWorkflowRun', jobs]]) {
    actions[name] = async args => { calls.push([name, args]); return { data }; };
  }
  actions.downloadArtifact = async args => { calls.push(['downloadArtifact', args]); return { data: Buffer.alloc(6884) }; };
  const inputs = { github: { rest: { actions,
    repos: { getCommit: async args => { calls.push(['getCommit', args]); return { data: commit }; } },
    pulls: { get: async args => { calls.push(['getPR', args]); return { data: pr }; } } } }, context,
  core: { info: value => output.push(value), warning: value => output.push(value) } };
  return { context, runData, jobData, jobs, artifact, commit, pr, calls, output, inputs, invoke: () => run(inputs) };
}

test('current iOS provenance reaches only the fixed archive; unknown bytes supply no receipt', async () => {
  const f = fixture();
  await assert.rejects(f.invoke, /^Error: FIXED_IOS_ARTIFACT_READOUT_FAILED$/);
  assert.deepEqual(f.calls.at(-1), ['downloadArtifact', {
    owner: 'KeeperCommunity', repo: 'bitcoin-keeper', request: { timeout: 30000 },
    artifact_id: 12462694619, archive_format: 'zip' }]);
  assert.deepEqual(f.output, []);
});

test('foreign execution contexts cannot issue an API request', async () => {
  for (const change of [f => f.context.repo.owner = 'foreign', f => f.context.repo.repo = 'foreign',
    f => f.context.eventName = 'workflow_dispatch', f => f.context.ref = 'refs/heads/sprint']) {
    const f = fixture(); change(f); await assert.rejects(f.invoke, /FIXED_IOS_ARTIFACT_READOUT_FAILED/);
    assert.deepEqual(f.calls, []); assert.deepEqual(f.output, []);
  }
});

test('stale, contradictory or cross-source API evidence fails before download', async () => {
  for (const change of [
    f => f.runData.id++, f => f.runData.run_attempt++, f => f.runData.head_sha = WORKFLOW,
    f => f.runData.head_repository.id++, f => f.runData.event = 'push', f => f.runData.conclusion = 'failure',
    f => f.runData.path = 'other.yml', f => f.runData.referenced_workflows = [],
    f => f.runData.referenced_workflows[0].sha = SOURCE, f => f.runData.head_branch += '-other',
    f => f.jobData.id++, f => f.jobData.run_id++, f => f.jobData.head_sha = WORKFLOW,
    f => f.jobData.status = 'in_progress', f => f.jobData.steps[5].conclusion = 'success',
    f => f.jobData.steps[6].conclusion = 'success', f => f.jobData.steps[9].conclusion = 'failure',
    f => f.jobData.steps.push(f.jobData.steps[9]), f => f.jobs.total_count++,
    f => f.jobs.jobs[2].head_sha = WORKFLOW, f => f.jobs.jobs[2].id++,
    f => f.jobs.jobs[2].status = 'completed', f => f.artifact.id++, f => f.artifact.name += '-other',
    f => f.artifact.expired = true, f => f.artifact.size_in_bytes++,
    f => f.artifact.digest = 'sha256:' + '0'.repeat(64), f => f.artifact.workflow_run.id++,
    f => f.artifact.workflow_run.head_sha = WORKFLOW, f => f.artifact.workflow_run.repository_id++,
    f => f.commit.sha = WORKFLOW, f => f.commit.commit.tree.sha = '0'.repeat(40),
    f => f.pr.head.sha = WORKFLOW, f => f.pr.merged = true, f => f.pr.state = 'closed',
  ]) {
    const f = fixture(); change(f); await assert.rejects(f.invoke, /FIXED_IOS_ARTIFACT_READOUT_FAILED/);
    assert.equal(f.calls.some(([name]) => name === 'downloadArtifact'), false);
    assert.deepEqual(f.output, []);
  }
});

function synthetic(f, options = {}) {
  const events = [];
  const receipt = { source_sha: SOURCE, workflow_sha: WORKFLOW, run_id: '39858617273', run_attempt: '1',
    artifact_id: '12462694619', readout_only: true, authorization_eligible: false, trusted_native_acceptance: false };
  const sandbox = { module: { exports: {} }, Buffer, process: { env: { RUNNER_TEMP: '/owned' } }, require(name) {
    if (name === 'node:assert/strict') return { ...assert, deepEqual(a, b) {
      assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
    } };
    if (name === 'node:path') return path;
    if (name === 'node:crypto') return { createHash: () => ({ update() { return this; }, digest: () => DIGEST }) };
    if (name === 'node:fs') return {
      realpathSync: x => x, openSync(filename, flags, mode) {
        assert.equal(filename, '/owned/r5-1bc-ios-fixed.zip'); assert.equal(flags, 'wx'); assert.equal(mode, 0o600);
        events.push('open'); return 42;
      }, fstatSync() { if (options.stat) throw new Error('PRIVATE_SENTINEL'); return { dev: 1, ino: 2 }; },
      writeFileSync() { events.push('write'); if (options.write) throw new Error('PRIVATE_SENTINEL'); },
      closeSync: () => events.push('close'),
      lstatSync: () => ({ dev: 1, ino: options.replaced ? 3 : 2, isFile: () => true, isSymbolicLink: () => false }),
      unlinkSync() { events.push('unlink'); if (options.unlink) throw new Error('PRIVATE_SENTINEL'); },
    };
    if (name === 'node:child_process') return { execFileSync(command, args) {
      assert.equal(command, 'python3'); assert.deepEqual(Array.from(args), ['-B', '.github/scripts/read-1bc-ios-artifact.py']);
      events.push('decoder'); if (options.decoder) throw new Error('PRIVATE_SENTINEL');
      return options.raw ? 'PRIVATE_SENTINEL' : 'SAFE_R5_IOS_READOUT ' + JSON.stringify(receipt);
    } };
    throw new Error('Unexpected synthetic import');
  } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/read-1bc-ios-artifact.cjs'), 'utf8'), sandbox);
  f.inputs.core = { info(value) { events.push('info'); f.output.push(value); }, warning(value) { events.push('warning'); f.output.push(value); } };
  return { events, invoke: () => sandbox.module.exports.run(f.inputs) };
}

test('post-download freshness rejects a later attempt before private write or decoding', async () => {
  const f = fixture(); f.inputs.github.rest.actions.downloadArtifact = async () => {
    f.runData.run_attempt++; return { data: Buffer.alloc(6884) };
  };
  const s = synthetic(f); await assert.rejects(s.invoke, /FIXED_IOS_ARTIFACT_READOUT_FAILED/);
  assert.deepEqual(s.events, []); assert.deepEqual(f.output, []);
});

test('owned bytes purge before output; errors stay fixed and inode replacements are preserved', async () => {
  for (const options of [{}, { decoder: true }, { write: true }, { raw: true }, { stat: true },
    { unlink: true }, { replaced: true }, { decoder: true, unlink: true }]) {
    const f = fixture(), s = synthetic(f, options);
    if (options.decoder || options.write || options.raw || options.stat) await assert.rejects(s.invoke, /^Error: FIXED_IOS_ARTIFACT_READOUT_FAILED$/);
    else if (options.unlink || options.replaced) await assert.rejects(s.invoke, /^Error: FIXED_IOS_ARTIFACT_PRIVATE_CLEANUP_FAILED$/);
    else await s.invoke();
    assert.equal(s.events.filter(x => x === 'unlink').length, options.replaced || options.stat ? 0 : 1);
    assert.ok(s.events.indexOf('close') > s.events.indexOf('open'));
    if (!Object.keys(options).length) assert.ok(s.events.indexOf('unlink') < s.events.indexOf('info'));
    else assert.equal(s.events.includes('info'), false);
    assert.equal(JSON.stringify(f.output).includes('PRIVATE_SENTINEL'), false);
  }
});

test('naturally completed failed parent run retains this artifact without borrowing Android acceptance', async () => {
  const f = fixture(); f.runData.status = 'completed'; f.runData.conclusion = 'failure';
  f.jobs.jobs[2].status = 'completed'; f.jobs.jobs[2].conclusion = 'failure';
  const s = synthetic(f); await s.invoke();
  assert.ok(f.output[0].startsWith('SAFE_R5_IOS_READOUT '));
  assert.equal(JSON.parse(f.output[0].slice('SAFE_R5_IOS_READOUT '.length)).trusted_native_acceptance, false);
});
