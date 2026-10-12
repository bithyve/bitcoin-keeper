const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const workflowPath = path.join(__dirname, '..', 'workflows', 'keeper-local-validation.yml');
const lines = fs.readFileSync(workflowPath, 'utf8').split(/\r?\n/);
const scriptStart = lines.findIndex(line => line.trim() === 'script: |');
assert.notEqual(scriptStart, -1, 'workflow must contain an inline github-script');
const script = lines.slice(scriptStart + 1).map(line =>
  line.startsWith('            ') ? line.slice(12) : line
).join('\n');
const runWorkflow = new (Object.getPrototypeOf(async function () {}).constructor)(
  'github', 'context', 'core', script
);

const sha = 'b78b480eb4223390b2d17073387f9887d2e35f95';
const prNumber = 7045;
const comment = (body, login) => ({ body, user: { login } });
const handoff = (head = sha, checks = 'IOS, ANDROID, HARDWARE') => comment(
  `## Codex local handoff\nState: NEEDS_LOCAL\nHead commit: ${head}\nRequired local checks: ${checks}`,
  'cloud-writer'
);
const decision = (overrides = {}, login = 'antuz123') => comment(
  `## Codex local scope decision
State: ${overrides.state ?? 'OWNER_DEFERRED_PHYSICAL'}
PR: ${overrides.pr ?? '#7045'}
Head commit: ${overrides.head ?? sha}
Deferred local checks: ${overrides.checks ?? 'HARDWARE'}
Reason: ${overrides.reason ?? 'owner-directed post-release physical testing'}
Post-release follow-up: ${overrides.followup ?? 'owner tests physical phones and signers after release'}`,
  login
);
const report = (overrides = {}) => comment(
  `## Codex local validation
State: ${overrides.state || 'LOCAL_PASSED'}
Tested commit: ${overrides.head || sha}
iOS build/simulator: ${overrides.ios || 'PASS for tested development subset'}
Android build/emulator: ${overrides.android || 'PASS for tested development subset'}
Real devices/signers: ${overrides.hardware || 'NOT RUN / POST-RELEASE by owner decision'}`,
  'local-writer'
);

async function evaluate(comments, options = {}) {
  const filesRoute = () => {};
  const commentsRoute = () => {};
  const statuses = [];
  const failures = [];
  const github = {
    paginate: async route => {
      if (route === filesRoute) return options.files || [{ filename: 'src/App.tsx' }];
      if (route === commentsRoute) return comments;
      throw new Error('Unexpected paginate route');
    },
    rest: {
      pulls: {
        get: async () => ({ data: {
          base: { ref: 'sprint' },
          head: { sha: options.head || sha },
          body: '', user: { login: 'cloud-writer' },
          html_url: 'https://github.com/KeeperCommunity/bitcoin-keeper/pull/7045'
        } }),
        listFiles: filesRoute
      },
      issues: { listComments: commentsRoute },
      repos: {
        getCollaboratorPermissionLevel: async ({ username }) => ({ data: {
          permission: options.permissions?.[username] ??
            (['cloud-writer', 'local-writer', 'antuz123', 'other-writer']
              .includes(username) ? 'write' : 'read')
        } }),
        createCommitStatus: async status => { statuses.push(status); }
      }
    }
  };
  const context = { repo: { owner: 'KeeperCommunity', repo: 'bitcoin-keeper' },
    issue: { number: prNumber }, payload: {} };
  const core = { info: () => {}, warning: () => {}, setFailed: text => failures.push(text) };
  await runWorkflow(github, context, core);
  assert.equal(statuses.length, 1);
  return { status: statuses[0], failures };
}

test('current requirements still fail without an owner decision', async () => {
  const { status } = await evaluate([handoff(), report()]);
  assert.equal(status.state, 'failure');
  assert.equal(status.description, 'Missing local PASS: HARDWARE');
});

test('exact-SHA owner deferral passes only with a later honest local report', async () => {
  const { status, failures } = await evaluate([handoff(), decision(), report()]);
  assert.equal(status.state, 'success');
  assert.match(status.description, /Validated at current SHA: IOS, ANDROID; owner-deferred HARDWARE/);
  assert.equal(failures.length, 0);
});

test('a report before the scope decision must be refreshed', async () => {
  const { status } = await evaluate([handoff(), report(), decision()]);
  assert.equal(status.state, 'failure');
  assert.equal(status.description, 'Missing local PASS: HARDWARE');
});

test('a write collaborator other than the release owner cannot defer hardware', async () => {
  const { status } = await evaluate([handoff(), decision({}, 'other-writer'), report()]);
  assert.equal(status.state, 'failure');
  assert.equal(status.description, 'Missing local PASS: HARDWARE');
});

test('the release owner must still have repository write permission', async () => {
  const { status } = await evaluate([handoff(), decision(), report()],
    { permissions: { antuz123: 'read' } });
  assert.equal(status.state, 'failure');
  assert.equal(status.description, 'Missing local PASS: HARDWARE');
});

test('a stale or wrongly scoped owner decision cannot defer the current PR head', async () => {
  for (const change of [{ head: 'a'.repeat(40) }, { pr: '#7046' },
    { checks: 'IOS, ANDROID, HARDWARE' }, { reason: '' }, { followup: '' }]) {
    const { status } = await evaluate([handoff(), decision(change), report()]);
    assert.equal(status.state, 'failure');
    assert.equal(status.description, 'Missing local PASS: HARDWARE');
  }
});

test('a later handoff cannot erase an earlier HARDWARE requirement', async () => {
  const { status } = await evaluate([handoff(), handoff(sha, 'IOS, ANDROID'), report()]);
  assert.equal(status.state, 'failure');
  assert.equal(status.description, 'Missing local PASS: HARDWARE');
});

test('a later owner decision can revoke physical deferral', async () => {
  const { status } = await evaluate([handoff(), decision(),
    decision({ state: 'OWNER_REQUIRES_PRE_RELEASE' }), report()]);
  assert.equal(status.state, 'failure');
  assert.equal(status.description, 'Missing local PASS: HARDWARE');
});

test('failed hardware and missing iOS/Android PASS cannot be deferred', async () => {
  const failedHardware = await evaluate([handoff(), decision(),
    report({ hardware: 'FAIL: signer address mismatch' })]);
  assert.equal(failedHardware.status.state, 'failure');
  assert.equal(failedHardware.status.description, 'Missing local PASS: HARDWARE');
  const missingIos = await evaluate([handoff(), decision(),
    report({ ios: 'NOT RUN' })]);
  assert.equal(missingIos.status.state, 'failure');
  assert.equal(missingIos.status.description, 'Missing local PASS: IOS');
});

test('hardware-only handoff cannot turn into a no-test success', async () => {
  const { status } = await evaluate([handoff(sha, 'HARDWARE'), decision(), report()]);
  assert.equal(status.state, 'failure');
  assert.equal(status.description, 'IOS or ANDROID required before HARDWARE deferral');
});

test('a new PR head invalidates both handoff and owner decision', async () => {
  const { status } = await evaluate([handoff(), decision(), report()],
    { head: 'b'.repeat(40) });
  assert.equal(status.state, 'failure');
  assert.equal(status.description, 'Trusted Cloud handoff for current SHA required');
});
