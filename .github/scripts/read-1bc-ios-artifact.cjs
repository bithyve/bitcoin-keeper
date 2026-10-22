'use strict';
// One existing iOS diagnostic artifact. This never starts native or release work.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const OWNER = 'KeeperCommunity', REPO = 'bitcoin-keeper', REPOSITORY = 470904030;
const RUN = 39858617273, JOB = 120103187854, ANDROID = 120125972406, ARTIFACT = 12462694619;
const SOURCE = '1bc34890cb8618b2fffd446a63924974e0fe15b5';
const TREE = '2e9cd57bf9f78b92cac73e9343ddbd0eef25e86e';
const WORKFLOW = '3c44ab6412a8118b183273c402dd08136db05b28';
const DIGEST = '550142809a0faf812741a586630b17d6f458b2b6c935b5bab4b00f84da67c84f';
const NAME = `keeper-diagnostic-native-IOS-${SOURCE}-${RUN}-1`;
const BRANCH = 'codex/r5-ios-startup-diagnosis-20261022';

function validateRun(value, jobs) {
  assert.equal(value.id, RUN); assert.equal(value.run_attempt, 1);
  assert.equal(value.repository.id, REPOSITORY); assert.equal(value.head_repository.id, REPOSITORY);
  assert.equal(value.head_sha, SOURCE); assert.equal(value.event, 'pull_request');
  assert.equal(value.head_branch, BRANCH);
  assert.equal(value.path, '.github/workflows/keeper-native-diagnostic.yml');
  assert.ok((value.status === 'in_progress' && value.conclusion === null) ||
    (value.status === 'completed' && value.conclusion === 'failure'));
  assert.deepEqual(value.referenced_workflows, [{
    path: `${OWNER}/${REPO}/.github/workflows/keeper-native-platform.yml@${WORKFLOW}`,
    ref: 'refs/pull/7116/merge', sha: WORKFLOW,
  }]);
  assert.equal(jobs.total_count, 3); assert.equal(jobs.jobs.length, 3);
  assert.deepEqual(jobs.jobs.map(row => row.id).sort((a, b) => a - b),
    [JOB, 120103189932, ANDROID].sort((a, b) => a - b));
  const android = jobs.jobs.find(row => row.id === ANDROID);
  assert.equal(android.run_id, RUN); assert.equal(android.head_sha, SOURCE);
  assert.equal(android.name, 'android / Native ANDROID build and probes');
  if (value.status === 'in_progress') {
    // Only this already allocated serialized Android continuation may be active.
    assert.ok(['queued', 'in_progress'].includes(android.status)); assert.equal(android.conclusion, null);
  } else {
    assert.equal(android.status, 'completed');
    assert.ok(['success', 'failure', 'cancelled', 'timed_out'].includes(android.conclusion));
  }
}

function validateJob(value) {
  assert.equal(value.id, JOB); assert.equal(value.run_id, RUN); assert.equal(value.head_sha, SOURCE);
  assert.equal(value.name, 'ios / Native IOS build and probes');
  assert.equal(value.status, 'completed'); assert.equal(value.conclusion, 'failure');
  for (const [name, conclusion] of [
    ['Check out exact app source', 'success'], ['Verify current diagnostic source', 'success'],
    ['Install immutable native dependencies', 'success'], ['Check disposable iOS driver readiness', 'success'],
    ['Build development app', 'success'], ['Run disposable startup smoke', 'failure'],
    ['Run disposable native persistence probe', 'skipped'], ['Run R5 production worker native scenarios', 'skipped'],
    ['Measure five full-product startup and first-wallet runs', 'skipped'], ['Retain safe Phase A evidence', 'success'],
  ]) {
    const rows = value.steps.filter(step => step.name === name);
    assert.equal(rows.length, 1); assert.equal(rows[0].status, 'completed');
    assert.equal(rows[0].conclusion, conclusion);
  }
}

function validateArtifact(value) {
  assert.equal(value.id, ARTIFACT); assert.equal(value.name, NAME);
  assert.equal(value.expired, false); assert.equal(value.size_in_bytes, 6884);
  assert.equal(value.digest, `sha256:${DIGEST}`);
  assert.equal(value.workflow_run.id, RUN); assert.equal(value.workflow_run.head_sha, SOURCE);
  assert.equal(value.workflow_run.repository_id, REPOSITORY);
  assert.equal(value.workflow_run.head_repository_id, REPOSITORY);
  assert.equal(value.workflow_run.head_branch, BRANCH);
}

async function run({ github, context, core }) {
  let owned, primary = false, output;
  try {
    assert.equal(context.repo.owner, OWNER); assert.equal(context.repo.repo, REPO);
    assert.equal(context.eventName, 'push');
    assert.equal(context.ref, 'refs/heads/codex/r5-1bc-ios-artifact-readout');
    const args = { owner: OWNER, repo: REPO, request: { timeout: 30000 } };
    async function snapshot() {
      const [r, j, a, jobs] = await Promise.all([
        github.rest.actions.getWorkflowRun({ ...args, run_id: RUN }),
        github.rest.actions.getJobForWorkflowRun({ ...args, job_id: JOB }),
        github.rest.actions.getArtifact({ ...args, artifact_id: ARTIFACT }),
        github.rest.actions.listJobsForWorkflowRun({ ...args, run_id: RUN, filter: 'latest', per_page: 100 }),
      ]);
      validateRun(r.data, jobs.data); validateJob(j.data); validateArtifact(a.data);
    }
    await snapshot();
    const [commit, pr] = await Promise.all([
      github.rest.repos.getCommit({ ...args, ref: SOURCE }),
      github.rest.pulls.get({ ...args, pull_number: 7116 }),
    ]);
    assert.equal(commit.data.sha, SOURCE); assert.equal(commit.data.commit.tree.sha, TREE);
    assert.equal(pr.data.number, 7116); assert.equal(pr.data.head.sha, SOURCE);
    assert.equal(pr.data.head.ref, BRANCH); assert.equal(pr.data.head.repo.id, REPOSITORY);
    assert.equal(pr.data.state, 'open'); assert.equal(pr.data.merged, false);
    const download = await github.rest.actions.downloadArtifact({ ...args, artifact_id: ARTIFACT, archive_format: 'zip' });
    const bytes = Buffer.from(download.data);
    assert.equal(bytes.length, 6884);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), DIGEST);
    await snapshot(); // A later attempt or replacement cannot supply this readout.
    const temp = process.env.RUNNER_TEMP;
    assert.ok(temp && path.isAbsolute(temp)); assert.equal(fs.realpathSync(temp), path.resolve(temp));
    const filename = path.join(temp, 'r5-1bc-ios-fixed.zip');
    const descriptor = fs.openSync(filename, 'wx', 0o600);
    owned = { filename }; // A failed stat still reports unresolved private cleanup.
    try {
      const info = fs.fstatSync(descriptor); Object.assign(owned, { dev: info.dev, ino: info.ino });
      fs.writeFileSync(descriptor, bytes);
    } finally { fs.closeSync(descriptor); }
    output = execFileSync('python3', ['-B', '.github/scripts/read-1bc-ios-artifact.py'],
      { encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
    const tag = 'SAFE_R5_IOS_READOUT ';
    assert.ok(output.startsWith(tag));
    const result = JSON.parse(output.slice(tag.length));
    assert.equal(result.source_sha, SOURCE); assert.equal(result.workflow_sha, WORKFLOW);
    assert.equal(result.run_id, String(RUN)); assert.equal(result.run_attempt, '1');
    assert.equal(result.artifact_id, String(ARTIFACT));
    assert.equal(result.readout_only, true); assert.equal(result.authorization_eligible, false);
    assert.equal(result.trusted_native_acceptance, false);
    output = tag + JSON.stringify(result);
  } catch (_) {
    primary = true;
    throw new Error('FIXED_IOS_ARTIFACT_READOUT_FAILED');
  } finally {
    if (owned) {
      try {
        const info = fs.lstatSync(owned.filename);
        assert.ok(info.isFile() && !info.isSymbolicLink());
        assert.equal(info.dev, owned.dev); assert.equal(info.ino, owned.ino);
        fs.unlinkSync(owned.filename);
      } catch (_) {
        try { core.warning('FIXED_IOS_ARTIFACT_PRIVATE_CLEANUP_FAILED'); } catch (_) { /* retain primary */ }
        if (!primary) throw new Error('FIXED_IOS_ARTIFACT_PRIVATE_CLEANUP_FAILED');
      }
    }
  }
  try { core.info(output); }
  catch (_) { throw new Error('FIXED_IOS_ARTIFACT_READOUT_FAILED'); }
}

module.exports = { run };
