const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadModule } = require('./helpers.cjs');

const revision = (generation) => generation.toString(16).padStart(64, '0');

function fixture(post) {
  const calls = [];
  const reconciliations = [];
  const transport = loadModule('src/services/backup/transport.ts', {
    '../rest/RestClient': {
      post: async (path, body) => {
        calls.push({ path, body });
        return post(path, body);
      },
    },
  });
  transport.setBackupUploadGuard((appId) => appId === 'A');
  transport.setBackupReconciliationHandler((appId) => reconciliations.push(appId));
  transport.observeBackupAccount('A');
  return { transport, calls, reconciliations };
}

test('all active incremental operations use the revisioned route and a fresh queued snapshot', async () => {
  let generation = 1;
  const f = fixture(async (path, body) => {
    if (path === 'fixture/getBackupSnapshot') return { data: { revision: revision(generation) } };
    assert.equal(path, 'fixture/revisionedBackupMutation');
    assert.equal(body.appId, 'A');
    assert.equal(body.expectedRevision, revision(generation));
    generation += 1;
    return { data: { updated: true, preconditionApplied: true } };
  });
  const operations = [
    'updateAppImage', 'migrateXfps', 'deleteAppImageEntity', 'deleteVaults',
    'updateVaultImage', 'modifyLabels', 'deleteBackup',
  ];
  for (const operation of operations) {
    // updateVaultImage still has a legacy appID-only caller. The new route
    // needs a canonical top-level appId in addition to the old payload.
    const body = operation === 'updateVaultImage' ? { appID: 'A' } : { appId: 'A' };
    const response = await f.transport.backupPost(`fixture/${operation}`, body);
    assert.equal(response.data.preconditionApplied, true);
  }
  assert.deepEqual(
    f.calls.map(({ path }) => path),
    operations.flatMap(() => ['fixture/getBackupSnapshot', 'fixture/revisionedBackupMutation'])
  );
  assert.deepEqual(f.calls.filter(({ path }) => path.endsWith('revisionedBackupMutation'))
    .map(({ body }) => body.operation), operations);
  assert.deepEqual(f.reconciliations, []);
});

test('409 reports a conflict and never retries stale encrypted payload', async () => {
  const f = fixture(async (path) => {
    if (path.endsWith('getBackupSnapshot')) return { data: { revision: revision(1) } };
    throw { response: { status: 409, data: { error: 'BACKUP_CHANGED' } } };
  });
  await assert.rejects(
    f.transport.backupPost('fixture/updateAppImage', { appId: 'A', walletsObject: { w: 'old' } }),
    (error) => error.category === 'conflict' && !error.message.includes('old')
  );
  assert.deepEqual(f.calls.map(({ path }) => path), [
    'fixture/getBackupSnapshot', 'fixture/revisionedBackupMutation',
  ]);
  assert.deepEqual(f.reconciliations, ['A']);
});

test('a mixed or old relay rejects the new route without an old-route fallback', async () => {
  const f = fixture(async (path) => {
    if (path.endsWith('getBackupSnapshot')) return { data: { revision: revision(1) } };
    assert.equal(path, 'fixture/revisionedBackupMutation');
    throw { response: { status: 404 } };
  });
  await assert.rejects(
    f.transport.backupPost('fixture/deleteBackup', { appId: 'A' }, true),
    (error) => error.category === 'http-4xx'
  );
  assert.equal(f.calls.some(({ path }) => path === 'fixture/deleteBackup'), false);
  assert.deepEqual(f.reconciliations, ['A']);
});

test('missing revision or acknowledgement fails closed and requests reconciliation', async () => {
  const missingRevision = fixture(async () => ({ data: {} }));
  await assert.rejects(
    missingRevision.transport.backupPost('fixture/updateAppImage', { appId: 'A' }),
    (error) => error.category === 'protocol'
  );
  assert.deepEqual(missingRevision.calls.map(({ path }) => path), ['fixture/getBackupSnapshot']);
  assert.deepEqual(missingRevision.reconciliations, ['A']);

  const missingAck = fixture(async (path) => path.endsWith('getBackupSnapshot')
    ? { data: { revision: revision(1) } }
    : { data: { updated: true } });
  await assert.rejects(
    missingAck.transport.backupPost('fixture/updateAppImage', { appId: 'A' }),
    (error) => error.category === 'protocol'
  );
  assert.deepEqual(missingAck.reconciliations, ['A']);

  const rejected = fixture(async (path) => path.endsWith('getBackupSnapshot')
    ? { data: { revision: revision(1) } }
    : { data: { updated: false, preconditionApplied: true } });
  await assert.rejects(
    rejected.transport.backupPost('fixture/updateAppImage', { appId: 'A' }),
    (error) => error.category === 'protocol'
  );
  assert.deepEqual(rejected.reconciliations, ['A']);
});

test('A to B to A during the revision read never sends an old-session mutation', async () => {
  let releaseSnapshot, enteredSnapshot;
  const waiting = new Promise((resolve) => { releaseSnapshot = resolve; });
  const entered = new Promise((resolve) => { enteredSnapshot = resolve; });
  const f = fixture(async (path) => {
    assert.equal(path, 'fixture/getBackupSnapshot');
    enteredSnapshot();
    await waiting;
    return { data: { revision: revision(1) } };
  });
  const pending = f.transport.backupPost('fixture/updateAppImage', { appId: 'A' });
  await entered;
  f.transport.observeBackupAccount('B');
  f.transport.observeBackupAccount('A');
  releaseSnapshot();
  await assert.rejects(pending, /Backup account session changed/);
  assert.deepEqual(f.calls.map(({ path }) => path), ['fixture/getBackupSnapshot']);
});

test('A to B to A during an acknowledged write still requires readback', async () => {
  let releaseMutation, enteredMutation;
  const waiting = new Promise((resolve) => { releaseMutation = resolve; });
  const entered = new Promise((resolve) => { enteredMutation = resolve; });
  const f = fixture(async (path) => {
    if (path.endsWith('getBackupSnapshot')) return { json: { revision: revision(1) } };
    enteredMutation();
    await waiting;
    return { json: { updated: true, preconditionApplied: true } };
  });
  const pending = f.transport.backupPost('fixture/updateAppImage', { appId: 'A' });
  await entered;
  f.transport.observeBackupAccount('B');
  f.transport.observeBackupAccount('A');
  releaseMutation();
  await assert.rejects(pending, /Backup account session changed/);
  assert.deepEqual(f.calls.map(({ path }) => path), [
    'fixture/getBackupSnapshot', 'fixture/revisionedBackupMutation',
  ]);
  assert.deepEqual(f.reconciliations, ['A']);
});

test('unused legacy full writer is not sent through either route', async () => {
  const f = fixture(async () => assert.fail('Legacy writer must not use the network'));
  await assert.rejects(
    f.transport.backupPost('fixture/backupAllSignersAndVaults', { appId: 'A' }),
    (error) => error.category === 'protocol'
  );
  assert.deepEqual(f.calls, []);
  assert.deepEqual(f.reconciliations, ['A']);
});
