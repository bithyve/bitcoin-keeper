// Additive signed-v3 port of all nine automaticLabelProducers invariants.
// Actual selected label/spendability workers, native encrypted Realm, production
// authority/AES/HTTP/CAS/readback and the current transactional Relay remain real.
// Only public descriptor formatting is adapted for the intentionally unspendable
// wallet. Faults affect genuine replies or disposable database state, never forge
// a successful ACK. This is not rendered UI or broadcast/coin-control acceptance.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { test: nodeTest, beforeEach, afterEach, after } = require('node:test');
const { declarations, evaluate, plain, Realm } = require('./automaticWriteRealmRelay.fixture.cjs');
const { createProtectedServer, createProtectedRealmClient } = require('./protectedWriteRealmRelay.fixture.cjs');

const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const seed = require('bip39').mnemonicToSeedSync(mnemonic);
const appId = crypto.createHash('sha256').update(seed).digest('hex');
let server;
beforeEach(async () => { server = await createProtectedServer(); });
afterEach(async () => { await server?.close(); server = undefined; });
after(() => Realm.shutdown());
const test = (name, body) => nodeTest(name, { timeout: 20_000 }, body);
const label = (ref, name) => ({ id: `${ref}${name}`, ref, label: name, type: 'TXN', origin: 'disposable-public-origin', isSystem: false });
const writes = () => server.trace.filter(event => event.path === '/backup/v3/mutate');
const labelWrites = () => writes().filter(event => event.operation === 'modifyLabels');

async function setup(t, initialTags = []) {
  await server.reset();
  const f = await createProtectedRealmClient(server.url, {
    appId, primarySeed: seed.toString('hex'), primaryMnemonic: mnemonic,
  });
  t.after(() => f.close());
  f.automatic = f.load('src/services/backup/automatic');
  f.installProductionStoreObservers(f.automatic);
  f.store.dispatch(f.bhr.setAutomaticCloudBackup({ appId: f.appId, enabled: true }));
  const wallet = f.defaults(f.RealmSchema.Wallet, {
    id: 'producer-wallet', entityKind: f.enums.EntityKind.WALLET, type: f.enums.WalletType.DEFAULT,
    networkType: f.enums.NetworkType.TESTNET, scriptType: 'P2WPKH',
    derivationDetails: f.defaults(f.RealmSchema.WalletDerivationDetails, { instanceNum: 0, xDerivationPath: "m/84'/1'/0'" }),
    presentationData: f.defaults(f.RealmSchema.WalletPresentationData, { name: 'Producer fixture', visibility: 'DEFAULT' }),
    specs: f.defaults(f.RealmSchema.WalletSpecs, {
      xpub: 'disposable-public-wallet-xpub', nextFreeAddressIndex: 1,
      addresses: { external: {}, internal: { 0: 'change-address' } },
      confirmedUTXOs: [f.defaults(f.RealmSchema.UTXO, {
        txId: 'input', vout: 0, spendability: 'spendable', isManualOverride: false,
      })],
    }),
  });
  assert.equal(f.dbManager.createObject(f.RealmSchema.Wallet, wallet), true);
  for (const tag of initialTags) assert.equal(f.dbManager.createObject(f.RealmSchema.Tags, tag), true);
  const utxos = f.load('src/store/reducers/utxos');
  const sagas = f.productionSagas([
    'currentBackupAppId', 'setServerBackupFailed',
    'buildAutomaticAppMutation', 'buildAutomaticVaultMutation', 'queueCommittedBackupWorker',
    'updateAppImageWorker', 'updateVaultImageWorker', 'backupInspectionOwners', 'runBackupInspection',
  ], {
    ...f.automatic, ...utxos,
    // Public label metadata only; no fabricated wallet identity, encrypted
    // record, native commit, protected authority or network success.
    generateAbbreviatedOutputDescriptors: () => 'disposable-public-origin',
  });
  assert.equal(await sagas.run('runBackupInspection', true, f.appId, true), true,
    'Actual production opt-in must enroll, repair and verify the signed namespace');
  assert.ok(f.transport.captureBackupWriteIntent(f.appId)?.protectedBase);
  evaluate(declarations('src/store/sagas/utxos.ts', [
    'currentOriginApp', 'originUiAction', 'persistTagsForOrigin', 'persistSpendabilityForOrigin',
    'backupCommittedLabels', 'addLabelsWorker', 'bulkUpdateLabelsWorker', 'importLabelsWorker',
    'transactionLabelsWorker', 'markUTXOSpendabilityWorker',
  ]), sagas.scope, 'production-protected-label-producers.ts');
  f.run = (name, payload, metadata = {}) => sagas.run(name, {
    payload, originAppId: f.appId,
    originBackupAccountSession: f.transport.currentBackupAccountSession(),
    originBackupWriteIntent: f.transport.captureBackupWriteIntent(f.appId),
    ...metadata,
  });
  f.wallet = () => plain(f.dbManager.getObjectById(f.RealmSchema.Wallet, wallet.id));
  f.read = () => f.protected.readProtectedBackup(mnemonic, undefined, f.appId);
  f.remoteImage = async () => {
    const result = await f.read();
    assert.equal(result.state, 'present');
    return f.image.decodeImage(f.encryption.generateEncryptionKey(f.seed),
      result.snapshot, result.namespaceId, () => {}, true);
  };
  f.initial = (await f.read()).snapshot;
  server.clearTrace();
  return f;
}

async function assertConfirmed(f, operation) {
  assert.equal(writes().length, 1);
  const write = writes()[0];
  assert.equal(write.operation, operation);
  assert.equal(write.committed, true);
  assert.equal(write.status, 200);
  const result = await f.read();
  assert.equal(result.state, 'present');
  assert.notEqual(result.snapshot.revision, f.initial.revision);
  assert.equal(result.snapshot.revision, write.serverRevision);
  assert.equal(result.snapshot.generation, write.serverGeneration);
  assert.equal(result.snapshot.authEpoch, write.serverAuthEpoch);
  assert.equal(await f.image.compareImages(await f.repair.captureBackupImage(), await f.remoteImage()), 'matched');
  assert.equal(f.automatic.isBackupVerificationCurrent(f.appId), true);
  assert.equal(f.store.getState().bhr.pendingAllBackupByAppId[f.appId], false);
  assert.equal(f.store.getState().bhr.backupRepairStateByAppId[f.appId], 'verified');
}

// Historical case 1: add/import/edit each has one committed mutation/readback.
test('protected native add/import/edit label producers each use one committed HTTP mutation and final readback', async t => {
  const f = await setup(t);
  await f.run('addLabelsWorker', {
    txId: 'first', wallet: f.wallet(), labels: [{ name: 'original', isSystem: false }], type: 'TXN',
  });
  await assertConfirmed(f, 'modifyLabels');
  assert.equal((await f.remoteImage()).labels.firstoriginal.label, 'original');
  server.clearTrace();
  await f.run('importLabelsWorker', { labels: [
    { type: 'tx', ref: 'second', label: 'import one', origin: 'disposable-public-origin' },
    { type: 'tx', ref: 'third', label: 'import two', origin: 'disposable-public-origin' },
  ] });
  await assertConfirmed(f, 'modifyLabels');
  assert.equal(Object.keys((await f.remoteImage()).labels).length, 3);
  server.clearTrace();
  await f.run('bulkUpdateLabelsWorker', {
    txId: 'first', wallet: f.wallet(),
    labelChanges: { added: [{ name: 'edited', isSystem: false }], deleted: [{ name: 'original', isSystem: false }] },
  });
  await assertConfirmed(f, 'modifyLabels');
  const image = await f.remoteImage();
  assert.equal(image.labels.firstoriginal, undefined);
  assert.equal(image.labels.firstedited.label, 'edited');
});

// Historical case 2: note plus every inherited change label is one operation.
test('protected native send labels group the transaction note and all change labels into one HTTP mutation', async t => {
  const f = await setup(t, [label('input:0', 'inherited')]);
  await f.run('transactionLabelsWorker', {
    txId: 'sent', wallet: f.wallet(), note: 'send note',
    finalOutputs: [{ address: 'recipient-address' }, { address: 'change-address' }], inputs: [{ txId: 'input', vout: 0 }],
  });
  await assertConfirmed(f, 'modifyLabels');
  const image = await f.remoteImage();
  for (const id of ['sentsend note', 'sent:1Change', 'sent:1inherited'])
    assert.deepEqual(plain(image.labels[id]), plain(f.dbManager.getObjectById(f.RealmSchema.Tags, id)));
});

// Historical case 3: the native transaction rolls back before any HTTP mutation.
test('protected native invalid second imported tag rolls back the first and generates no HTTP writes', async t => {
  const f = await setup(t);
  await f.run('importLabelsWorker', { labels: [
    { type: 'tx', ref: 'first', label: 'must roll back', origin: 'disposable-public-origin' },
    { type: 'tx', ref: 'second', label: null, origin: 'disposable-public-origin' },
  ] });
  assert.equal(f.dbManager.getCollection(f.RealmSchema.Tags).length, 0);
  assert.equal(writes().length, 0);
  assert.equal(Object.keys((await f.remoteImage()).labels).length, 0);
  assert.equal((await f.read()).snapshot.revision, f.initial.revision);
  assert.equal(f.store.getState().bhr.pendingAllBackupByAppId[f.appId], true);
  assert.equal(f.transport.captureBackupWriteIntent(f.appId), undefined);
});

// Historical case 4: the encrypted backup reflects the committed coin choice.
test('protected native manual coin choice is committed before the encrypted wallet reaches HTTP', async t => {
  const f = await setup(t);
  await f.run('markUTXOSpendabilityWorker', {
    wallet: f.wallet(), txId: 'input', vout: 0, spendability: 'doNotSpend',
  });
  assert.equal(f.wallet().specs.confirmedUTXOs[0].spendability, 'doNotSpend');
  await assertConfirmed(f, 'updateAppImage');
  const image = await f.remoteImage();
  assert.equal(image.wallets['producer-wallet'].specs.confirmedUTXOs[0].spendability, 'doNotSpend');
  assert.equal(image.wallets['producer-wallet'].specs.confirmedUTXOs[0].isManualOverride, true);
});

// Historical cases 5–8: one label mutation; local data survives uncertainty.
for (const mode of ['409', '404', 'malformed', 'lost-reply'])
  test(`protected native combined send labels survive ${mode} and keep backup pending after one request`, async t => {
    const f = await setup(t);
    const base = f.transport.captureBackupWriteIntent(f.appId).protectedBase;
    if (mode === '409') {
      server.armFault({ path: '/backup/v3/snapshot', async beforeReply() {
        // Actual competing signed CAS after the original snapshot, no fake409.
        await f.protected.protectedBackupMutation(mnemonic, base, 'updateAppImage', {
          nodes: [], replaceNodes: true,
        });
      } });
    } else if (mode === '404') {
      server.armFault({ path: '/backup/v3/snapshot', async beforeReply() {
        // Model disappearance only in this task-owned disposable database after
        // the real read. The unchanged signed mutation route must return404.
        const database = server.backend.connection.db;
        await database.collection('protectedBackupRecords').deleteMany({ namespaceId: base.namespaceId });
        const removed = await database.collection('protectedBackupNamespaces').deleteOne({ _id: base.namespaceId });
        assert.equal(removed.deletedCount, 1);
      } });
    } else server.armFault({ path: '/backup/v3/mutate', operation: 'modifyLabels',
      mode: mode === 'malformed' ? 'malformed-json' : mode });
    await f.run('transactionLabelsWorker', {
      txId: 'sent', wallet: f.wallet(), note: 'send note',
      finalOutputs: [{ address: 'change-address' }], inputs: [],
    });
    assert.equal(labelWrites().length, 1, 'The label producer must not retry or borrow new authority');
    if (mode === '409') {
      assert.equal(writes().length, 2, 'One independently committed peer CAS plus one original label request');
      assert.equal(writes()[0].operation, 'updateAppImage');
      assert.equal(writes()[0].committed, true);
      assert.equal(labelWrites()[0].status, 409);
      assert.equal(labelWrites()[0].committed, false);
      assert.equal(labelWrites()[0].expectedRevision, base.revision);
      assert.notEqual(labelWrites()[0].expectedRevision, writes()[0].serverRevision);
    } else {
      assert.equal(writes().length, 1);
      assert.equal(labelWrites()[0].committed, mode !== '404');
      assert.equal(labelWrites()[0].status, mode === '404' ? 404 : 200);
    }
    for (const id of ['sentsend note', 'sent:0Change'])
      assert.ok(f.dbManager.getObjectById(f.RealmSchema.Tags, id));
    assert.equal(f.store.getState().bhr.pendingAllBackupByAppId[f.appId], true);
    assert.equal(f.automatic.isBackupVerificationCurrent(f.appId), false);
    assert.equal(f.transport.captureBackupWriteIntent(f.appId), undefined);
  });

// Historical case 9: stale A→B→A work cannot touch the new session or namespace.
test('protected native old-session transaction labels cannot commit after A to B to A', async t => {
  const f = await setup(t);
  const old = {
    originBackupAccountSession: f.transport.currentBackupAccountSession(),
    originBackupWriteIntent: f.transport.captureBackupWriteIntent(f.appId),
  };
  const originalWallet = f.wallet();
  await f.selectAccount('disposable-other-account');
  await f.selectAccount(f.appId);
  await f.run('transactionLabelsWorker', { txId: 'sent', wallet: originalWallet, note: 'old session' }, old);
  assert.equal(f.dbManager.getCollection(f.RealmSchema.Tags).length, 0);
  assert.equal(writes().length, 0);
});
