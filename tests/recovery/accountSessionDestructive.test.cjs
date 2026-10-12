const assert = require('node:assert/strict');
const { test } = require('node:test');
const { fixture, enums, wallet } = require('./sagaHarness.cjs');
const { loadModule } = require('./helpers.cjs');

async function waitForPause(getResume) {
  for (let attempt = 0; attempt < 20 && !getResume(); attempt++) await new Promise(setImmediate);
  assert.equal(typeof getResume(), 'function', 'the action must pause before its backup write');
}

function accountRoundTrip(fixtureState, originalAppId, advanceSession) {
  fixtureState.app.id = 'other-disposable-account';
  fixtureState.state.storage.appId = fixtureState.app.id;
  advanceSession();
  fixtureState.app.id = originalAppId;
  fixtureState.state.storage.appId = originalAppId;
  advanceSession();
}

test('wallet deletion paused at connectivity cannot delete newer A data after A to B to A', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  let session = 1;
  f.scope.currentBackupAccountSession = () => session;
  const walletId = 'disposable-wallet';
  f.collections.Wallet.push(wallet(walletId, enums.NetworkType.MAINNET));
  f.remote.wallets[walletId] = 'initial-A-ciphertext';
  let resumeConnectivity;
  f.scope.NetInfo.fetch = () => new Promise((resolve) => { resumeConnectivity = resolve; });
  const relayDeletes = [];
  f.scope.Relay.deleteAppImageEntity = async ({ appId, walletIds }) => {
    relayDeletes.push({ appId, walletIds });
    walletIds.forEach((id) => delete f.remote.wallets[id]);
    return { updated: true };
  };

  const deleting = f.run('deleteAppImageEntityWorker', {
    originAppId,
    originBackupAccountSession: session,
    payload: { walletIds: [walletId] },
  });
  await waitForPause(() => resumeConnectivity);
  accountRoundTrip(f, originAppId, () => { session++; });
  f.remote.wallets[walletId] = 'newer-A-ciphertext';
  resumeConnectivity({ isConnected: true });

  assert.equal((await deleting).updated, false);
  assert.deepEqual(relayDeletes, []);
  assert.equal(f.remote.wallets[walletId], 'newer-A-ciphertext');
  assert.deepEqual(f.collections.Wallet.map(({ id }) => id), [walletId]);
});

test('vault deletion paused at connectivity cannot delete newer A data after A to B to A', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  let session = 1;
  f.scope.currentBackupAccountSession = () => session;
  const vaultId = 'disposable-vault';
  const remoteVaults = { [vaultId]: 'initial-A-ciphertext' };
  let resumeConnectivity;
  f.scope.NetInfo.fetch = () => new Promise((resolve) => { resumeConnectivity = resolve; });
  const relayDeletes = [];
  f.scope.Relay.deleteVaultImage = async ({ appId, vaults }) => {
    relayDeletes.push({ appId, vaults });
    vaults.forEach((id) => delete remoteVaults[id]);
    return { updated: true };
  };

  const deleting = f.run('deleteVaultImageWorker', {
    originAppId,
    originBackupAccountSession: session,
    payload: { vaultIds: [vaultId] },
  });
  await waitForPause(() => resumeConnectivity);
  accountRoundTrip(f, originAppId, () => { session++; });
  remoteVaults[vaultId] = 'newer-A-ciphertext';
  resumeConnectivity({ isConnected: true });

  assert.equal((await deleting).updated, false);
  assert.deepEqual(relayDeletes, []);
  assert.equal(remoteVaults[vaultId], 'newer-A-ciphertext');
});

test('whole-backup deletion paused before request cannot clear newer A data after A to B to A', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  let session = 1;
  f.scope.currentBackupAccountSession = () => session;
  f.remote.wallets.shared = 'initial-A-ciphertext';
  const originalRead = f.scope.dbManager.getObjectByIndex;
  let appReads = 0;
  let resumePreflight;
  f.scope.dbManager.getObjectByIndex = (schema, ...args) => {
    if (schema === 'KeeperApp' && ++appReads === 2)
      return new Promise((resolve) => { resumePreflight = () => resolve(f.app); });
    return originalRead(schema, ...args);
  };
  const relayDeletes = [];
  f.scope.Relay.deleteBackup = async ({ appId }) => {
    relayDeletes.push(appId);
    f.remote.wallets = {};
    return { updated: true };
  };

  const deleting = f.run('deleteBackupWorker', {
    appId: originAppId,
    originBackupAccountSession: session,
  });
  await waitForPause(() => resumePreflight);
  accountRoundTrip(f, originAppId, () => { session++; });
  f.remote.wallets.shared = 'newer-A-ciphertext';
  resumePreflight();

  assert.equal(await deleting, false);
  assert.deepEqual(relayDeletes, []);
  assert.equal(f.remote.wallets.shared, 'newer-A-ciphertext');
  assert.ok(!f.actions.some((action) =>
    action.type === 'setDeleteBackupSuccess' && action.payload?.status === true));
});

test('queued explicit whole-backup delete cannot clear newer A data after A to B to A', async () => {
  let active = 'A';
  const remote = { wallets: { shared: 'initial-A-ciphertext' } };
  const requests = [];
  const transport = loadModule('src/services/backup/transport.ts', {
    '../rest/RestClient': { post: async (path, body) => {
      requests.push({ path, body });
      remote.wallets = {};
      return { data: { updated: true } };
    } },
  });
  transport.setBackupUploadGuard((appId, explicitChoice) => appId === active && explicitChoice);
  transport.observeBackupAccount(active);
  let release;
  const busy = transport.withBackupSession('A', () => new Promise((resolve) => { release = resolve; }));
  await waitForPause(() => release);

  const deleting = transport.backupPost('fixture/deleteBackup', { appId: 'A' }, true);
  active = 'B';
  transport.observeBackupAccount(active);
  remote.wallets.shared = 'newer-A-ciphertext';
  active = 'A';
  transport.observeBackupAccount(active);
  release();
  await busy;

  await assert.rejects(deleting, (error) => error.category === 'protocol');
  assert.deepEqual(requests, []);
  assert.equal(remote.wallets.shared, 'newer-A-ciphertext');
});

test('in-flight whole-backup deletion after A to B to A marks A for readback', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  let session = 1;
  f.scope.currentBackupAccountSession = () => session;
  let finishDelete;
  f.scope.Relay.deleteBackup = () => new Promise((resolve) => { finishDelete = resolve; });
  const deleting = f.run('deleteBackupWorker', {
    appId: originAppId, originBackupAccountSession: session,
  });
  await waitForPause(() => finishDelete);
  accountRoundTrip(f, originAppId, () => { session++; });
  finishDelete({ updated: true });
  assert.equal(await deleting, false);
  assert.equal(f.state.bhr.pendingAllBackupByAppId[originAppId], true);
  assert.ok(f.actions.some((action) => action.type === 'invalidateBackupRepair'));
  assert.ok(!f.actions.some((action) => action.type === 'setDeleteBackupSuccess' && action.payload?.status));
});

test('in-flight wallet deletion after A to B to A preserves local A and marks readback', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  let session = 1;
  f.scope.currentBackupAccountSession = () => session;
  const walletId = 'disposable-wallet';
  f.collections.Wallet.push(wallet(walletId, enums.NetworkType.MAINNET));
  let finishDelete;
  f.scope.Relay.deleteAppImageEntity = () => new Promise((resolve) => { finishDelete = resolve; });
  const deleting = f.run('deleteAppImageEntityWorker', {
    originAppId,
    originBackupAccountSession: session,
    payload: { walletIds: [walletId] },
  });
  await waitForPause(() => finishDelete);
  accountRoundTrip(f, originAppId, () => { session++; });
  finishDelete({ updated: true });
  assert.equal((await deleting).updated, false);
  assert.equal(f.state.bhr.pendingAllBackupByAppId[originAppId], true);
  assert.deepEqual(f.collections.Wallet.map(({ id }) => id), [walletId]);
});
