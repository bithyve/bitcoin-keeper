const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadModule, harness, wallet } = require('./helpers.cjs');

const signerChanges = [{
  oldSignerId: 'fixture-old', newSignerId: 'fixture-new', newSignerDetails: 'fixture-ciphertext',
}];

function relay(transport, errors = []) {
  return loadModule('src/services/backend/Relay.ts', {
    '../backup/transport': transport,
    '../rest/RestClient': { post: () => assert.fail('Migration bypassed backup transport') },
    '../sentry': { captureError: (error) => errors.push(error) },
    'src/services/wallets/enums': {},
    'src/utils/service-utilities/config': { RELAY: 'fixture/' },
    'react-native': { Platform: { OS: 'fixture' } },
  }).default;
}

for (const repair of [false, true]) {
  test(`fingerprint migration fails closed during ${repair ? 'repair readback' : 'inspection'}`, async (t) => {
    let release, entered, reads = 0, armed = false;
    const gate = new Promise((resolve) => { release = resolve; });
    const started = new Promise((resolve) => { entered = resolve; });
    t.after(() => release());
    const f = harness({ post: async ({ path }) => {
      if (armed && path.endsWith('getBackupSnapshot') && ++reads === (repair ? 2 : 1)) {
        entered();
        await gate;
      }
    } });
    if (repair) f.local.Wallet.push(wallet());
    const reconciliation = [];
    f.transport.setBackupReconciliationHandler((id) => reconciliation.push(id));
    armed = true;
    const checking = f.run(repair);
    await started;
    const previousRevision = f.transport.backupRevision(f.app.id);
    await assert.rejects(
      relay(f.transport).migrateXfp(f.app.id, signerChanges),
      /Failed to do migrate the xfp/
    );
    assert.equal(f.transport.backupRevision(f.app.id), previousRevision + 1);
    assert.deepEqual(reconciliation, [f.app.id]);
    release();
    assert.equal(await checking, 'unverified');
    assert.equal(f.phases.includes('verified'), false);
    assert.equal(f.calls.some((path) => path === 'migrateXfps'), false);
    assert.equal(f.calls.filter((path) => path === 'revisionedBackupMutation').length, repair ? 1 : 0);
  });
}

test('direct migration attempts never send ciphertext and keep redacted errors', async () => {
  const errors = [];
  const transport = loadModule('src/services/backup/transport.ts', {
    '../rest/RestClient': { post: () => assert.fail('Migration reached Relay') },
  });
  transport.setBackupUploadGuard((appId) => appId === 'fixture-account');
  const pending = [];
  transport.setBackupReconciliationHandler((id) => pending.push(id));
  const service = relay(transport, errors);
  for (let index = 0; index < 2; index++) {
    await assert.rejects(service.migrateXfp('fixture-account', signerChanges),
      /Failed to do migrate the xfp/);
  }
  assert.equal(errors.length, 2);
  assert.equal(errors[0].category, 'protocol');
  assert.equal(errors[0].message, 'Backup request could not be completed');
  assert.equal(transport.backupRevision('fixture-account'), 2);
  assert.deepEqual(pending, ['fixture-account', 'fixture-account']);
});
