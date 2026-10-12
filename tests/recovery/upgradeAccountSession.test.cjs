const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const semver = require('semver');
const { runSaga } = require('redux-saga');
const { call, put, select } = require('redux-saga/effects');

const file = 'src/store/sagas/upgrade.ts';
const source = ts.createSourceFile(
  file, fs.readFileSync(path.join(__dirname, '../..', file), 'utf8'), ts.ScriptTarget.Latest, true
);

function extract(names) {
  const selected = source.statements.filter((node) =>
    (ts.isFunctionDeclaration(node) && names.includes(node.name?.text)) ||
    (ts.isVariableStatement(node) && node.declarationList.declarations.some(
      (declaration) => declaration.name.getText(source) === 'upgradeAccountIsActive'
    ))
  );
  return ts.transpileModule(selected.map((node) => node.getText(source).replace(/^export /, '')).join('\n'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  }).outputText;
}

function fixture(names) {
  const state = { appId: 'A', session: 7, actions: [], relay: [], local: [] };
  const app = () => ({ id: state.appId, primarySeed: `seed-${state.appId}` });
  const dbManager = {
    getObjectByIndex: () => app(),
    getCollection: (schema) => {
      if (schema === 'UTXOInfo') return [{ walletId: 'wallet', txId: 'tx', vout: 0, labels: [{ name: 'note' }] }];
      if (schema === 'Wallet') return [{ id: 'wallet' }];
      if (schema === 'Signer') return [];
      if (schema === 'Vault') return [{ id: 'vault', archived: false }];
      return [];
    },
    createObject: (...args) => state.local.push(args),
    createObjectBulk: (...args) => state.local.push(args),
  };
  const scope = {
    call, put, select, semver, dbManager,
    console: { log() {} },
    RealmSchema: { KeeperApp: 'KeeperApp', UTXOInfo: 'UTXOInfo', Wallet: 'Wallet',
      Signer: 'Signer', Vault: 'Vault', Tags: 'Tags', VersionHistory: 'VersionHistory' },
    store: { getState: () => ({ storage: { appId: state.appId } }) },
    currentBackupAccountSession: () => state.session,
    LABELS_INTRODUCTION_VERSION: '1.0.4',
    BIP329_INTRODUCTION_VERSION: '1.0.7',
    KEY_MANAGEMENT_VERSION: '1.1.9',
    APP_KEY_UPGRADE_VERSION: '1.1.12',
    HEALTH_CHECK_TIMELINE_MIGRATION_VERSION: '1.2.6',
    SIGNER_POLICY_MIGRATION_VERSION: '2.1.0',
    migrateLabelsToBip329: (originAppId) => ({ type: 'MIGRATE_LABELS_329', originAppId }),
    updateVersionHistory: (previousVersion, newVersion, isRecovery, originAppId) => ({
      type: 'UPDATE_VERSION_HISTORY', payload: { previousVersion, newVersion, isRecovery }, originAppId,
    }),
    setAppVersion: (version) => ({ type: 'setAppVersion', version }),
    setPendingAllBackup: (payload) => ({ type: 'setPendingAllBackup', payload }),
    isAutomaticCloudBackupEnabled: () => true,
    Relay: {
      updateAppImage: async (...args) => { state.relay.push(['version', ...args]); return { updated: true }; },
      modifyLabels: async (...args) => { state.relay.push(['labels', ...args]); return { updated: true }; },
    },
    DeviceInfo: { getBuildNumber: () => '1' },
    getApp: () => ({}), getMessaging: () => ({}),
    unsubscribeFromTopic() {}, subscribeToTopic() {}, getReleaseTopic: (version) => version,
    generateAbbreviatedOutputDescriptors: () => 'disposable-origin',
    LabelRefType: { OUTPUT: 'OUTPUT' },
    generateEncryptionKey: (seed) => seed,
    hash256: (value) => `hash(${value})`,
    encrypt: (_key, content) => content,
    SignerType: { KEEPER: 'KEEPER', MOBILE_KEY: 'MOBILE_KEY', MY_KEEPER: 'MY_KEEPER' },
  };
  vm.runInNewContext(extract(names), scope);
  const run = (name, ...args) => runSaga(
    { getState: () => ({ storage: { appId: state.appId }, bhr: {} }),
      dispatch: (action) => state.actions.push(action) },
    scope[name], ...args
  ).toPromise();
  return { state, scope, dbManager, run };
}

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

test('upgrade sequence stamps its original session on nested migrations and dispatched actions', async () => {
  const f = fixture(['applyUpgradeSequence']);
  const nested = [];
  for (const name of [
    'migrateStructureforSignersInAppImage', 'migrateStructureforVaultInAppImage',
    'updateAppKeysToEnableSigning',
  ]) f.scope[name] = function* (...args) { nested.push([name, ...args]); };
  f.scope.healthCheckTimelineMigration = function* () {};
  f.scope.migrateServerKeyPolicy = function* () {};

  await f.run('applyUpgradeSequence', { previousVersion: '1.0.5', newVersion: '2.5.17' });

  assert.equal(nested.length, 3);
  assert.ok(nested.every(([, appId, session]) => appId === 'A' && session === 7));
  const backupActions = f.state.actions.filter((action) =>
    action.type === 'MIGRATE_LABELS_329' || action.type === 'UPDATE_VERSION_HISTORY'
  );
  assert.equal(backupActions.length, 2);
  assert.ok(backupActions.every((action) => action.originAppId === 'A' &&
    action.originBackupAccountSession === 7));
});

test('upgrade sequence paused on its first app read stops after A to B to A', async () => {
  const f = fixture(['applyUpgradeSequence']);
  const entered = deferred();
  const resume = deferred();
  let first = true;
  f.dbManager.getObjectByIndex = () => {
    if (first) { first = false; entered.resolve(); return resume.promise; }
    return { id: f.state.appId };
  };
  f.scope.migrateStructureforSignersInAppImage = function* () { throw Error('stale migration'); };
  f.scope.migrateStructureforVaultInAppImage = function* () { throw Error('stale migration'); };

  const pending = f.run('applyUpgradeSequence', { previousVersion: '1.0.5', newVersion: '2.5.17' });
  await entered.promise;
  f.state.appId = 'B'; f.state.session = 8;
  f.state.appId = 'A'; f.state.session = 9;
  resume.resolve({ id: 'A' });
  await pending;

  assert.deepEqual(f.state.actions, []);
  assert.deepEqual(f.state.relay, []);
});

test('upgrade invoked after A to B to A rejects the caller original session before backup', async () => {
  const f = fixture(['applyUpgradeSequence']);
  f.state.appId = 'B'; f.state.session = 8;
  f.state.appId = 'A'; f.state.session = 9;
  f.scope.migrateStructureforSignersInAppImage = function* () { throw Error('stale upload'); };
  f.scope.migrateStructureforVaultInAppImage = function* () { throw Error('stale upload'); };
  await f.run('applyUpgradeSequence', {
    previousVersion: '1.0.5',
    newVersion: '2.5.17',
    originBackupAccountSession: 7,
  });
  assert.deepEqual(f.state.actions, []);
  assert.deepEqual(f.state.relay, []);
});

test('version update passes session to Relay and blocks stale A to B to A action', async () => {
  const f = fixture(['updateVersionHistoryWorker']);
  const action = { originAppId: 'A', originBackupAccountSession: 7,
    payload: { previousVersion: '2.5.16', newVersion: '2.5.17', isRecovery: true } };
  await f.run('updateVersionHistoryWorker', action);
  assert.equal(f.state.relay.length, 1);
  assert.equal(f.state.relay[0][2], 7);

  const entered = deferred();
  const resume = deferred();
  let first = true;
  f.dbManager.getObjectByIndex = () => {
    if (first) { first = false; entered.resolve(); return resume.promise; }
    return { id: f.state.appId };
  };
  const pending = f.run('updateVersionHistoryWorker', action);
  await entered.promise;
  f.state.appId = 'B'; f.state.session = 8;
  f.state.appId = 'A'; f.state.session = 9;
  resume.resolve({ id: 'A' });
  await pending;
  assert.equal(f.state.relay.length, 1);
  assert.deepEqual(f.state.local, []);
});

test('label migration passes session to Relay and blocks stale A to B to A action', async () => {
  const f = fixture(['migrateLablesWorker']);
  const action = { originAppId: 'A', originBackupAccountSession: 7 };
  await f.run('migrateLablesWorker', action);
  assert.equal(f.state.relay.length, 1);
  assert.equal(f.state.relay[0][4], 7);

  const entered = deferred();
  const resume = deferred();
  const getCollection = f.dbManager.getCollection;
  let first = true;
  f.dbManager.getCollection = (schema) => {
    if (schema === 'UTXOInfo' && first) {
      first = false; entered.resolve(); return resume.promise;
    }
    return getCollection(schema);
  };
  const pending = f.run('migrateLablesWorker', action);
  await entered.promise;
  f.state.appId = 'B'; f.state.session = 8;
  f.state.appId = 'A'; f.state.session = 9;
  resume.resolve(getCollection('UTXOInfo'));
  await pending;
  assert.equal(f.state.relay.length, 1);
  assert.equal(f.state.local.length, 1);
});

test('nested upgrade backup workers receive the original session', async () => {
  const f = fixture([
    'migrateStructureforSignersInAppImage', 'migrateStructureforVaultInAppImage',
    'updateAppKeysToEnableSigning',
  ]);
  const nested = [];
  f.scope.updateAppImageWorker = function* (action) { nested.push(['app', action]); return { updated: true }; };
  f.scope.updateVaultImageWorker = function* (action) { nested.push(['vault', action]); return { updated: true }; };
  f.scope.mapAppKeysToWallets = () => ({ appKeyWalletMap: {}, myAppKeySigners: [] });
  f.scope.generateExtendedKeysForSigners = () => ({});
  f.scope.updateVaultSigners = () => {};
  f.scope.updateSignerDetails = () => {};

  await f.run('migrateStructureforSignersInAppImage', 'A', 7);
  await f.run('migrateStructureforVaultInAppImage', 'A', 7);
  await f.run('updateAppKeysToEnableSigning', 'A', 7);
  assert.deepEqual(nested.map(([kind]) => kind), ['app', 'vault', 'app']);
  assert.ok(nested.every(([, action]) => action.originAppId === 'A' &&
    action.originBackupAccountSession === 7));
});
