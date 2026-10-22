'use strict';

// A source receipt, not native acceptance or release authorization.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const SHA = /^[a-f0-9]{40}$/;
const PAIRED_RELAY_SHA = '838049e537e07eb646a2a0393eb969fba43d0739';

function verifySource({ root = process.cwd(), env = process.env, event, allowPairedRelay = false } = {}) {
  assert.ok(['pull_request', 'push'].includes(env.GITHUB_EVENT_NAME), 'Unsupported CI source event');
  const payload = event ?? JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
  const expected = env.GITHUB_EVENT_NAME === 'pull_request' ? payload.pull_request?.head?.sha : env.GITHUB_SHA;
  assert.match(expected ?? '', SHA, 'An exact event source commit is required');
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const actual = git('rev-parse', 'HEAD');
  assert.equal(actual, expected, 'Checked-out source differs from the event source commit');
  // Reject added source too. Only the matrix job owns a separate fixed Relay
  // checkout; it is independently checked rather than hidden by a broad ignore.
  const status = git('status', '--porcelain', '--untracked-files=normal');
  assert.equal(status.split('\n').filter(line => line &&
    !(allowPairedRelay && line === '?? .ci-relay/')).length, 0, 'Source changed during CI');
  if (allowPairedRelay) {
    const relay = path.join(root, '.ci-relay');
    assert.equal(fs.lstatSync(relay).isSymbolicLink(), false, 'Paired checkout alias rejected');
    assert.equal(fs.realpathSync(relay), path.resolve(relay), 'Paired checkout alias rejected');
    assert.equal(git('-C', relay, 'rev-parse', 'HEAD'), PAIRED_RELAY_SHA, 'Unexpected paired Relay source');
    assert.equal(git('-C', relay, 'status', '--porcelain', '--untracked-files=normal'), '', 'Paired Relay source changed');
  }
  const tree = git('rev-parse', 'HEAD^{tree}');
  assert.match(tree, SHA);
  return { schema: 1, source_sha: actual, source_tree: tree, event: env.GITHUB_EVENT_NAME,
    run_id: env.GITHUB_RUN_ID ?? null, run_attempt: env.GITHUB_RUN_ATTEMPT ?? null,
    workflow_sha: env.GITHUB_WORKFLOW_SHA ?? null,
    scope: 'Source identity only; no native, security or release acceptance.' };
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    assert.ok(args.length === 0 || (args.length === 1 && args[0] === '--paired-relay'), 'Unexpected source option');
    console.log(JSON.stringify(verifySource({ allowPairedRelay: args.length === 1 })));
  } catch (_) {
    console.error('CI_SOURCE_IDENTITY_FAILED');
    process.exitCode = 1;
  }
}
module.exports = { verifySource };
