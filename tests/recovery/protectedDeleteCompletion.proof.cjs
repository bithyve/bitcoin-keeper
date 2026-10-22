// Additional current-protocol Delete completion boundaries. Only disposable
// public recovery material is used. Actual Realm, store observers, worker,
// signed transport, router and transactional backend remain unchanged.
'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { test, beforeEach, afterEach, after } = require('node:test');
const { createProtectedServer, createProtectedRealmClient } = require('./protectedWriteRealmRelay.fixture.cjs');
const { declarations, evaluate, plain, Realm } = require('./automaticWriteRealmRelay.fixture.cjs');

const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const seed = require('bip39').mnemonicToSeedSync(mnemonic);
const appId = crypto.createHash('sha256').update(seed).digest('hex');
const builders = { assert };
evaluate(declarations('tests/recovery/automaticWriteRealmRelay.integration.cjs', [
  'wallet', 'signer', 'vault', 'persist', 'persistVault', 'vaultBody', 'labelBody', 'operations',
]), builders, 'shared-disposable-delete-record-builders.ts');
const { operations, persist, wallet } = builders;
const tick = () => new Promise(resolve => setImmediate(resolve));
let server;
beforeEach(async () => { server = await createProtectedServer(); });
afterEach(async () => { await server?.close(); server = undefined; });
after(() => { Realm.shutdown(); });
const mutations = () => server.trace.filter(event => event.path === '/backup/v3/mutate');

function barrier() {
  let release, entered;
  const waiting = new Promise(resolve => { release = resolve; });
  const arrived = new Promise(resolve => { entered = resolve; });
  return { release, entered, waiting, arrived };
}
async function bounded(promise) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(Error('Expected genuine Delete boundary was not reached')), 10000);
    })]);
  } finally { clearTimeout(timer); }
}
async function read(f) { return f.protected.readProtectedBackup(mnemonic, undefined, appId); }
async function setup(t) {
  await server.reset();
  const f = await createProtectedRealmClient(server.url, {
    appId, primarySeed: seed.toString('hex'), primaryMnemonic: mnemonic,
  });
  t.after(() => f.close());
  f.automatic = f.load('src/services/backup/automatic');
  f.installProductionStoreObservers(f.automatic);
  operations.updateAppImage.prepare(f);
  persist(f, f.RealmSchema.Wallet, wallet(f, 'retained-wallet', 'Retained disposable recovery record'));
  f.store.dispatch(f.bhr.setAutomaticCloudBackup({ appId, enabled: true }));
  await tick();
  f.sagas = f.productionSagas([
    'currentBackupAppId', 'backupInspectionOwners', 'runBackupInspection', 'deleteBackupWorker',
  ]);
  assert.equal(await f.sagas.run('runBackupInspection', true, appId, true), true);
  assert.ok(f.transport.captureBackupWriteIntent(appId)?.protectedBase);
  await server.seedLegacy(await f.payloadForCurrentImage());
  f.before = await f.repair.captureBackupImage();
  f.accountBefore = plain(f.dbManager.getObjectByIndex(f.RealmSchema.KeeperApp));
  f.olderBefore = await server.backend.mongoose.connection.db.collection('appimages').findOne({ appId });
  server.clearTrace();
  return f;
}
async function preserved(f) {
  assert.equal(await f.image.compareImages(f.before, await f.repair.captureBackupImage()), 'matched');
  const current = plain(f.dbManager.getObjectByIndex(f.RealmSchema.KeeperApp));
  for (const key of ['id', 'primaryMnemonic', 'primarySeed', 'subscription'])
    assert.deepEqual(current[key], f.accountBefore[key]);
  assert.deepEqual(await server.backend.mongoose.connection.db.collection('appimages').findOne({ appId }), f.olderBefore);
}
function consent(f) { return f.store.getState().bhr.automaticCloudBackupByAppId[appId]; }
function notVerified(f) {
  assert.notEqual(f.store.getState().bhr.backupRepairStateByAppId[appId], 'verified');
  assert.equal(f.automatic.isBackupVerificationCurrent(appId), false);
}
function holdDelete() {
  const gate = barrier();
  server.armFault({ path: '/backup/v3/mutate', operation: 'deleteBackup',
    async beforeReply({ event }) {
      assert.equal(event.committed, true, 'Hold only an actual committed backend acknowledgement');
      gate.entered(); await gate.waiting;
    } });
  return gate;
}

test('explicit protected Delete with saved automatic consent off retains local data and older copy without enrollment', { timeout: 30000 }, async t => {
  const f = await setup(t);
  f.store.dispatch(f.bhr.setAutomaticCloudBackup({ appId, enabled: false }));
  assert.equal(consent(f), false);
  assert.equal(await f.sagas.run('deleteBackupWorker', { appId }), true);
  assert.equal(mutations().length, 1);
  assert.equal(mutations()[0].operation, 'deleteBackup');
  assert.equal(mutations()[0].committed, true);
  assert.equal(server.trace.some(event => event.path === '/backup/v3/enroll'), false);
  const remote = await read(f);
  assert.equal(remote.state, 'deleted');
  assert.equal(remote.snapshot.suppressLegacyFallback, true);
  assert.equal(consent(f), false);
  assert.equal(f.store.getState().bhr.deleteBackupSuccessByAppId[appId], true);
  notVerified(f); await preserved(f);
});

test('a genuine held Delete ACK cannot overwrite a newer off-to-on consent choice', { timeout: 30000 }, async t => {
  const f = await setup(t), gate = holdDelete();
  const deleting = f.sagas.run('deleteBackupWorker', { appId });
  try {
    await bounded(gate.arrived);
    const originalEpoch = f.transport.backupConsentEpoch(appId);
    f.store.dispatch(f.bhr.setAutomaticCloudBackup({ appId, enabled: false }));
    f.store.dispatch(f.bhr.setAutomaticCloudBackup({ appId, enabled: true }));
    assert.ok(f.transport.backupConsentEpoch(appId) > originalEpoch);
  } finally { gate.release(); }
  assert.equal(await deleting, false);
  assert.equal(consent(f), true);
  assert.equal(f.store.getState().bhr.deleteBackupSuccessByAppId[appId], false);
  assert.equal(f.store.getState().bhr.pendingAllBackupByAppId[appId], true);
  assert.equal((await read(f)).state, 'deleted');
  assert.equal(mutations().length, 1);
  assert.equal(server.trace.some(event => event.path === '/backup/v3/enroll'), false);
  notVerified(f); await preserved(f);
});

test('a reentrant newer choice at actual Delete success dispatch keeps its pending state and consent', { timeout: 30000 }, async t => {
  const f = await setup(t);
  let changed = false;
  const unsubscribe = f.store.subscribe(() => {
    if (changed || f.store.getState().bhr.deleteBackupSuccessByAppId[appId] !== true) return;
    changed = true;
    f.store.dispatch(f.bhr.setAutomaticCloudBackup({ appId, enabled: false }));
    f.store.dispatch(f.bhr.setAutomaticCloudBackup({ appId, enabled: true }));
    f.store.dispatch(f.bhr.setPendingAllBackup({ appId, pending: true }));
  });
  t.after(unsubscribe);
  try {
    assert.equal(await f.sagas.run('deleteBackupWorker', { appId }), false);
  } finally { unsubscribe(); }
  assert.equal(changed, true, 'The real final completion dispatch must trigger the subscriber');
  assert.equal(consent(f), true);
  assert.equal(f.store.getState().bhr.pendingAllBackupByAppId[appId], true);
  assert.equal((await read(f)).state, 'deleted');
  assert.equal(mutations().length, 1);
  notVerified(f); await preserved(f);
});

test('an actual Delete ACK after encrypted Realm A-to-B-to-A cannot report success in the new session', { timeout: 30000 }, async t => {
  const f = await setup(t), gate = holdDelete();
  const originalSession = f.transport.currentBackupAccountSession();
  const deleting = f.sagas.run('deleteBackupWorker', { appId, originBackupAccountSession: originalSession });
  try {
    await bounded(gate.arrived);
    await f.selectAccount('disposable-distinct-account');
    await f.selectAccount(appId);
    assert.notEqual(f.transport.currentBackupAccountSession(), originalSession);
  } finally { gate.release(); }
  assert.equal(await deleting, false);
  assert.equal(consent(f), true);
  assert.equal(f.store.getState().bhr.deleteBackupSuccessByAppId[appId], false);
  assert.equal(f.store.getState().bhr.pendingAllBackupByAppId[appId], true);
  assert.equal((await read(f)).state, 'deleted');
  assert.equal(mutations().length, 1);
  notVerified(f); await preserved(f);
});

test('a lost real Delete ACK and later tombstone read cannot manufacture success, replay or recreate', { timeout: 30000 }, async t => {
  const f = await setup(t);
  server.armFault({ path: '/backup/v3/mutate', operation: 'deleteBackup', mode: 'lost-reply' });
  assert.equal(await f.sagas.run('deleteBackupWorker', { appId }), false);
  assert.equal(mutations().length, 1);
  assert.equal(mutations()[0].committed, true);
  assert.equal(f.store.getState().bhr.deleteBackupSuccessByAppId[appId], false);
  assert.equal(f.store.getState().bhr.pendingAllBackupByAppId[appId], true);
  assert.equal((await read(f)).state, 'deleted');
  assert.equal(await f.sagas.run('runBackupInspection', false, appId, true), false);
  assert.equal(await f.sagas.run('deleteBackupWorker', { appId }), false);
  assert.equal(mutations().length, 1, 'Status/tombstone reads and a consumed deletion cannot replay a CAS');
  assert.equal(server.trace.some(event => event.path === '/backup/v3/enroll'), false);
  assert.equal(f.store.getState().bhr.deleteBackupSuccessByAppId[appId], false);
  notVerified(f); await preserved(f);
});
