'use strict';
const { test } = require('node:test'), assert = require('node:assert/strict');
const actual = require('../native/installed_parent_window.cjs');
const { canonicalFixture, withWindow, loadWindow } = require('./fixtures/installed-parent.cjs');
const auth = (driver, f) => driver.authenticateInstalledParentWindow(f.github, f.context, f.request, { pinReader: f.pinReader });
test('actual empty installed policy blocks before any public/private API access', async () => {
  const f = withWindow(canonicalFixture());
  await assert.rejects(auth(actual, f), /^Error: INSTALLED_PARENT_PROFILE_REQUIRED$/);
  assert.deepEqual(f.calls, []); assert.equal(f.windowReads, 0);
  for (const value of [undefined, {}, { kind: 'installed-reviewed-private-window', status: 'PASS' }])
    assert.equal(actual.isInstalledParentWindow(value), false);
});
test('simulated installed profile admits only fresh actual public origin and exact atomic descriptor', async () => {
  const driver = loadWindow(), f = withWindow(canonicalFixture()), cap = await auth(driver, f);
  assert.equal(driver.isInstalledParentWindow(cap), true); assert.equal(actual.isInstalledParentWindow(cap), false);
  assert.equal(Object.isFrozen(cap.expectedPerPlatform.IOS.execution), true);
  assert.notEqual(cap.expectedPerPlatform.IOS.control.sha, cap.expectedPerPlatform.ANDROID.control.sha);
  for (const key of ['release_ready', 'authorization_eligible', 'release_authorized', 'execution_allowed']) assert.equal(cap[key], false);
  assert.equal(await driver.revalidateInstalledParentWindow(f.github, f.context, f.request, cap, { pinReader: f.pinReader }), true);
  for (const fake of [{ ...cap }, JSON.parse(JSON.stringify(cap)), { status: 'PASS' }])
    await assert.rejects(driver.revalidateInstalledParentWindow(f.github, f.context, f.request, fake, { pinReader: f.pinReader }), /CAPABILITY_REQUIRED/);
});
for (const [name, mutate] of Object.entries({
  unprotected: f => f.branch.protected = false, moved: f => f.branch.commit.sha = 'f'.repeat(40),
  publicPin: f => f.pin.value = '', officialApp: f => f.suite.app.id = 42,
  event: f => f.context.eventName = 'push', contextSha: f => f.context.sha = 'f'.repeat(40),
  revokedReader: f => f.pinUnavailable = 403, missingReader: f => f.pinReader = undefined,
  unavailableWindow: f => f.windowUnavailable = true,
  unsupportedProfile: f => f.window.profile = 'payload-owned-profile', unknown: f => f.window.approved = true,
  app: f => f.window.app.sha = 'f'.repeat(40), tree: f => f.window.app.tree = 'f'.repeat(40),
  backend: f => f.window.backend.sha = 'f'.repeat(40), publicAttempt: f => f.window.public.runAttempt++,
  publicRun: f => f.window.public.runId++, publicWorkflow: f => f.window.public.workflowPath = 'test.yml',
  sameController: f => f.window.private.ANDROID.control.sha = f.window.private.IOS.control.sha,
  sameRun: f => f.window.private.ANDROID.execution.runId = f.window.private.IOS.execution.runId,
  wrongPrivateApp: f => f.window.private.IOS.app.sha = 'f'.repeat(40),
  unknownDescriptor: f => f.window.private.IOS.status = 'PASS',
  wrongRepository: f => f.window.private.IOS.control.repository = 'attacker/repo',
  missingTree: f => delete f.window.private.IOS.control.tree,
  wrongRef: f => f.window.private.IOS.execution.ref = 'refs/heads/sprint',
  wrongWorkflow: f => f.window.private.IOS.execution.workflowSha = 'f'.repeat(40),
  invalidRun: f => f.window.private.IOS.execution.runId = '123',
  malformed: f => f.rawWindow = '{', oversized: f => f.rawWindow = ' '.repeat(16385),
  duplicate: f => f.rawWindow = '{"schema":0,' + JSON.stringify(f.window).slice(1),
  escapedDuplicate: f => f.rawWindow = '{"\\u0073chema":0,' + JSON.stringify(f.window).slice(1),
})) test(`installed window rejects ${name} without private collection`, async () => {
  const driver = loadWindow(), f = withWindow(canonicalFixture()); mutate(f);
  await assert.rejects(auth(driver, f), /^Error: INSTALLED_PARENT_[A-Z_]+$/);
});
test('live manifest bytes, public pin and protected source are rechecked and revocation never falls back', async () => {
  for (const change of [f => f.window.public.runAttempt++, f => f.rawWindow = JSON.stringify(f.window) + ' ',
    f => f.windowUnavailable = true, f => f.pin.value = '', f => f.branch.protected = false]) {
    const driver = loadWindow(), f = withWindow(canonicalFixture()), cap = await auth(driver, f); change(f);
    await assert.rejects(driver.revalidateInstalledParentWindow(f.github, f.context, f.request, cap, { pinReader: f.pinReader }));
  }
});
