'use strict';

// A source receipt, not native acceptance or release authorization.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const SHA = /^[a-f0-9]{40}$/;
const PAIRED_RELAY_SHA = '838049e537e07eb646a2a0393eb969fba43d0739';
const MANUAL_CONTRACTS = /^KeeperCommunity\/bitcoin-keeper\/\.github\/workflows\/keeper-(?:release-preparation-contracts|ruby-lock-contracts)\.yml@refs\/(?:heads|tags)\/[^\s]+$/;

function verifySource({ root = process.cwd(), env = process.env, event, allowPairedRelay = false,
  allowContractDispatch = false } = {}) {
  const manual = env.GITHUB_EVENT_NAME === 'workflow_dispatch' && allowContractDispatch === true;
  assert.ok(['pull_request', 'push'].includes(env.GITHUB_EVENT_NAME) || manual, 'Unsupported CI source event');
  if (manual) {
    // This opt-in checks source only on two existing offline contract routes.
    // It does not admit native/canonical dispatch or authorize any operation.
    assert.ok(!allowPairedRelay && MANUAL_CONTRACTS.test(env.GITHUB_WORKFLOW_REF || ''), 'Unsupported manual contract route');
  }
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
    assert.ok(args.length === 0 || (args.length === 1 && ['--paired-relay', '--contract-dispatch'].includes(args[0])), 'Unexpected source option');
    console.log(JSON.stringify(verifySource({ allowPairedRelay: args[0] === '--paired-relay',
      allowContractDispatch: args[0] === '--contract-dispatch' })));
  } catch (_) {
    console.error('CI_SOURCE_IDENTITY_FAILED');
    process.exitCode = 1;
  }
}
module.exports = { verifySource };
