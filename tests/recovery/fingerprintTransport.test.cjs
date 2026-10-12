const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { loadModule, harness, wallet } = require('./helpers.cjs');

const signerChanges = [{
  oldSignerId: 'fixture-old', newSignerId: 'fixture-new', newSignerDetails: 'fixture-ciphertext',
}];

function relay(transport, rest = { post: () => assert.fail('Migration bypassed backup transport') }, errors = []) {
  return loadModule('src/services/backend/Relay.ts', {
    '../backup/transport': transport,
    '../rest/RestClient': rest,
    '../sentry': { captureError: (error) => errors.push(error) },
    'src/services/wallets/enums': {},
    'src/utils/service-utilities/config': { RELAY: 'fixture/' },
    'react-native': { Platform: { OS: 'fixture' } },
  }).default;
}

for (const repair of [false, true]) {
  test(`fingerprint migration waits for ${repair ? 'repair readback' : 'inspection'} and invalidates its completion`, async (t) => {
    let armed = false, reads = 0, release, entered;
    const events = [];
    const readGate = new Promise((resolve) => { release = resolve; });
    const readStarted = new Promise((resolve) => { entered = resolve; });
    t.after(() => release());
    let f;
    let vaults = [], labels = [];
    const revision = () => crypto.createHash('sha256')
      .update(JSON.stringify({ remote: f.remote, vaults, labels })).digest('hex');
    f = harness({
      post: async ({ path }) => {
        if (armed && path.endsWith('getBackupSnapshot')) {
          events.push(`snapshot-request:${++reads}`);
          if (reads === (repair ? 2 : 1)) {
            entered();
            await readGate;
          }
        }
      },
      adapter: (path, payload, config) => {
        assert.ok(config.signal, 'Every backup request must use bounded transport');
        if (path === 'getBackupSnapshot') {
          if (armed) events.push(`snapshot-response:${reads}`);
          return { data: {
            appImage: f.remote, allVaultImages: vaults, labels, revision: revision(),
          } };
        }
        if (path === 'revisionedBackupMutation') {
          assert.equal(payload.operation, 'migrateXfps');
          assert.equal(payload.appId, f.app.id);
          assert.equal(payload.expectedRevision, revision());
          assert.deepEqual(JSON.parse(JSON.stringify(payload.signerChanges)), signerChanges);
          events.push('migration-acknowledged');
          return { data: { updated: true, preconditionApplied: true } };
        }
        assert.equal(path, 'repairAppBackup');
        assert.equal(payload.expectedRevision, revision());
        f.remote.wallets = { ...payload.walletObject };
        f.remote.signers = { ...payload.signersObject };
        f.remote.nodes = payload.nodes;
        vaults = Object.values(payload.vaultObject);
        labels = payload.labels;
        f.remote.vaults = vaults.map((record) => record.vaultId);
        f.remote.labels = labels.map((record) => record.id);
        return { data: { updated: true } };
      },
    });
    f.local.Wallet.push(wallet());
    assert.equal(await f.run(true), 'verified');
    if (repair) f.local.Wallet[0].presentationData.name = 'Updated fixture wallet';
    f.calls.length = 0;
    f.phases.length = 0;
    armed = true;
    const checking = f.repair.inspectBackup(f.app.id, repair, (phase) => {
      f.phases.push(phase);
      events.push(`phase:${phase}`);
    });
    await readStarted;
    const previousRevision = f.transport.backupRevision(f.app.id);
    const migration = relay(f.transport).migrateXfp(f.app.id, signerChanges);
    const completed = Promise.allSettled([checking, migration]);
    const requestedRevision = f.transport.backupRevision(f.app.id);
    const migrationStartedDuringCheck = f.calls.includes('revisionedBackupMutation');
    release();
    const [checked, migrated] = await completed;
    assert.equal(requestedRevision, previousRevision + 1);
    assert.equal(migrationStartedDuringCheck, false);
    assert.equal(checked.status, 'fulfilled');
    assert.equal(migrated.status, 'fulfilled');
    assert.equal(migrated.value.updated, true);
    const heldResponse = events.indexOf(`snapshot-response:${repair ? 2 : 1}`);
    const acknowledged = events.indexOf('migration-acknowledged');
    assert.ok(heldResponse >= 0 && acknowledged > heldResponse,
      'Fingerprint migration must wait for the held backup response');
    if (!repair && checked.value === 'verified') {
      // A read-only retry may verify a new snapshot after queued writes drain.
      // The invalidated first attempt must never publish verified completion.
      assert.deepEqual(f.calls, [
        'getBackupSnapshot', 'getBackupSnapshot', 'revisionedBackupMutation', 'getBackupSnapshot',
      ]);
      assert.equal(reads, 3);
      assert.equal(f.phases.filter((phase) => phase === 'verified').length, 1);
      const freshRequest = events.indexOf('snapshot-request:3');
      const freshResponse = events.indexOf('snapshot-response:3');
      const verified = events.indexOf('phase:verified');
      assert.ok(acknowledged >= 0 && freshRequest > acknowledged);
      assert.ok(freshResponse > freshRequest && verified > freshResponse);
    } else {
      assert.equal(checked.value, 'unverified');
      assert.equal(f.phases.includes('verified'), false);
      assert.deepEqual(f.calls, repair
        ? [
            'getBackupSnapshot', 'repairAppBackup', 'getBackupSnapshot',
            'getBackupSnapshot', 'revisionedBackupMutation',
          ]
        : ['getBackupSnapshot', 'getBackupSnapshot', 'revisionedBackupMutation']);
    }
  });
}

test('migration conflict and transport failure fail closed, invalidate checks, and release the queue', async () => {
  let mode = 'conflict';
  const errors = [];
  const rest = { post: async (path, body, _headers, config) => {
    assert.ok(config.signal);
    if (path.endsWith('getBackupSnapshot')) return { json: { revision: 'a'.repeat(64) } };
    assert.equal(path, 'fixture/revisionedBackupMutation');
    assert.equal(body.operation, 'migrateXfps');
    if (mode === 'conflict') throw { response: { status: 409, data: { err: 'fixture-rejection' } } };
    if (mode === 'network') throw Error('fixture request body must stay redacted');
    return { json: { updated: true, preconditionApplied: true } };
  } };
  const transport = loadModule('src/services/backup/transport.ts', { '../rest/RestClient': rest });
  transport.setBackupUploadGuard((appId) => appId === 'fixture-account');
  const service = relay(transport, rest, errors);
  await assert.rejects(service.migrateXfp('fixture-account', signerChanges),
    /^Error: Failed to do migrate the xfp$/);
  assert.equal(errors[0].category, 'conflict');
  assert.equal(transport.backupRevision('fixture-account'), 1);
  mode = 'network';
  await assert.rejects(service.migrateXfp('fixture-account', signerChanges),
    /^Error: Failed to do migrate the xfp$/);
  assert.equal(errors.length, 2);
  assert.equal(errors[1].message, 'Backup request could not be completed');
  assert.equal(transport.backupRevision('fixture-account'), 2);
  mode = 'success';
  assert.equal((await service.migrateXfp('fixture-account', signerChanges)).updated, true);
  assert.equal(transport.backupRevision('fixture-account'), 3);
});
