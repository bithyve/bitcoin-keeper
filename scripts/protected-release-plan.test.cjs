'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { requestFromEnvironment, approvalBody, validateEvidence } = require('./protected-release-plan.cjs');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const now = Date.parse('2026-10-22T12:00:00Z');

function fixture() {
  const manifest = JSON.parse(read('release/version.json'));
  for (const baseline of Object.values(manifest.baselines)) baseline.verifiedAt = '2026-10-22T11:00:00Z';
  const env = {
    GITHUB_REPOSITORY: 'KeeperCommunity/bitcoin-keeper', GITHUB_REF: 'refs/heads/sprint',
    GITHUB_SHA: 'a'.repeat(40), KEEPER_SOURCE_SHA: 'b'.repeat(40),
    KEEPER_RELEASE_REF: `release/${manifest.version}`, KEEPER_OPERATION: 'testflight-upload',
    KEEPER_VERSION: manifest.version, KEEPER_BUILD: String(manifest.iosBuildNumber),
    KEEPER_ARTIFACT_SHA256: 'c'.repeat(64), KEEPER_APPROVAL_COMMENT_ID: '123',
  };
  const request = requestFromEnvironment(env);
  const evidence = {
    driver: { protected: true, commit: { sha: request.driverSha } },
    branch: { protected: true, commit: { sha: request.sourceSha } },
    comment: { user: { login: 'antuz123' }, body: approvalBody(request, '2026-10-22T13:00:00Z'), updated_at: '2026-10-22T11:30:00Z' },
    ownerPermission: { permission: 'write' },
    environment: { name: 'keeper-release-ios', can_admins_bypass: false,
      protection_rules: [{ type: 'required_reviewers', prevent_self_review: true, reviewers: [{ id: 1 }] }],
      deployment_branch_policy: { protected_branches: true, custom_branch_policies: false } },
    statuses: { sha: request.sourceSha, state: 'success', statuses: [{ context: 'keeper/local-validation', state: 'success' }] },
    checks: { total_count: 2, check_runs: ['Tests', 'CodeQL'].map(name => ({ name, head_sha: request.sourceSha, status: 'completed', conclusion: 'success' })) },
    manifest,
    sources: { packageText: read('package.json'), android: read('android/app/build.gradle'), ios: read('ios/hexa_keeper.xcodeproj/project.pbxproj'),
      iosPlists: ['ios/hexa_keeper/Info.plist', 'ios/hexa_keeper_dev-Info.plist'].map(read) },
  };
  return { env, request, evidence };
}

test('even complete synthetic evidence prepares only, never authorizes execution or artifact trust', () => {
  const { request, evidence } = fixture();
  const result = validateEvidence(request, evidence, now);
  assert.equal(result.execution_allowed, false);
  assert.equal(result.release_worker_implemented, false);
  assert.equal(result.artifact_bytes_and_signature_verified, false);
  assert.equal(result.sourceSha, request.sourceSha);
});

for (const [name, mutate] of [
  ['moving driver', e => { e.driver.commit.sha = 'd'.repeat(40); }],
  ['moving release source', e => { e.branch.commit.sha = 'd'.repeat(40); }],
  ['unprotected source', e => { e.branch.protected = false; }],
  ['author assertion', e => { e.comment.user.login = 'someone-else'; }],
  ['expired owner approval', e => { e.comment.body = e.comment.body.replace('13:00:00Z', '10:00:00Z'); }],
  ['wrong artifact approval', e => { e.comment.body = e.comment.body.replace('c'.repeat(64), 'd'.repeat(64)); }],
  ['administrative bypass', e => { e.environment.can_admins_bypass = true; }],
  ['unverified bypass', e => { delete e.environment.can_admins_bypass; }],
  ['self approval', e => { e.environment.protection_rules[0].prevent_self_review = false; }],
  ['missing environment', e => { e.environment = null; }],
  ['stale native status', e => { e.statuses.sha = 'd'.repeat(40); }],
  ['failed security check', e => { e.checks.check_runs[1].conclusion = 'failure'; }],
  ['skipped check', e => { e.checks.check_runs[0].conclusion = 'skipped'; }],
  ['wrong-SHA check', e => { e.checks.check_runs[0].head_sha = 'd'.repeat(40); }],
  ['incomplete check pagination', e => { e.checks.total_count = 101; }],
  ['missing required check', e => { e.checks.check_runs[1].name = 'Other'; }],
  ['stale store counter evidence', e => { e.manifest.baselines.ios.verifiedAt = '2026-10-20T11:00:00Z'; }],
  ['source version mismatch', e => { e.sources.packageText = '{"version":"0.0.0"}'; }],
]) test(`fails closed: ${name}`, () => {
  const { request, evidence } = fixture();
  mutate(evidence);
  assert.throws(() => validateEvidence(request, evidence, now));
});

test('rejects uninstalled/PR driver, injection, mutable source, invalid artifact and public operation', () => {
  for (const change of [
    { GITHUB_REF: 'refs/pull/1/merge' }, { GITHUB_REPOSITORY: 'other/repo' },
    { KEEPER_SOURCE_SHA: 'sprint' }, { KEEPER_VERSION: '2.6.5;echo secret' },
    { KEEPER_ARTIFACT_SHA256: 'pending' }, { KEEPER_OPERATION: 'public-release' },
  ]) {
    const { env } = fixture();
    assert.throws(() => requestFromEnvironment({ ...env, ...change }));
  }
});
