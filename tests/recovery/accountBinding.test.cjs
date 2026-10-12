const { test } = require('node:test');
const assert = require('node:assert/strict');
const { fixture, wallet, signer, enums, loadModule, functions } = require('./sagaHarness.cjs');
const { harness, loadModule: loadTransportModule } = require('./helpers.cjs');
const vm = require('node:vm');
const ts = require('typescript');

function switchToOptedInB(f) {
  f.app.id = 'B';
  f.app.primarySeed = 'cd'.repeat(32);
  f.state.storage.appId = 'B';
  f.state.bhr.automaticCloudBackupByAppId.B = true;
}

test('A wallet and vault actions queued before B login never use B key or destination', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  const aWallet = wallet('A-wallet', enums.NetworkType.MAINNET);
  switchToOptedInB(f);
  const walletResult = await f.run('updateAppImageWorker', {
    originAppId,
    payload: { wallets: [aWallet], updateNodes: true },
  });
  const vaultResult = await f.run('updateVaultImageWorker', {
    originAppId,
    payload: { vault: { id: 'A-vault', signers: [], archived: false } },
  });
  const createResult = await f.run('addNewWalletsWorker', {
    originAppId,
    payload: [{ walletType: enums.WalletType.DEFAULT, walletDetails: { fixture: aWallet } }],
  });
  assert.equal(walletResult.updated, false);
  assert.equal(vaultResult.updated, false);
  assert.equal(createResult, false);
  assert.equal(f.calls.length, 0, 'B must receive no A ciphertext or appId');
  assert.equal(f.collections.Wallet.length, 0, 'A wallet must not be persisted in B Realm');
});

test('selected B blocks stale A writes even before Realm finishes switching', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  const aWallet = wallet('same-wallet', enums.NetworkType.MAINNET);
  f.collections.Wallet.push({ ...aWallet, specs: { totalExternalAddresses: 4 } });
  f.state.storage.appId = 'B';
  f.state.bhr.automaticCloudBackupByAppId.B = true;
  const createResult = await f.run('addNewWalletsWorker', {
    originAppId,
    payload: [{ walletType: enums.WalletType.DEFAULT, walletDetails: { fixture: aWallet } }],
  });
  const backupResult = await f.run('updateAppImageWorker', {
    originAppId,
    payload: { wallets: [aWallet] },
  });
  const addressResult = await f.run('generateNewExternalAddressWorker', {
    originAppId,
    payload: { wallet: { ...aWallet, specs: { totalExternalAddresses: 7 } } },
  });
  assert.equal(createResult, false);
  assert.equal(backupResult.updated, false);
  assert.equal(addressResult, false);
  assert.equal(f.calls.length, 0);
  assert.equal(f.collections.Wallet.length, 1);
  assert.equal(f.collections.Wallet[0].specs.totalExternalAddresses, 4);
});

test('new receive address invalidates a verified backup after local persistence', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  const saved = wallet('receive-wallet', enums.NetworkType.MAINNET);
  saved.specs.totalExternalAddresses = 1;
  f.collections.Wallet.push(saved);
  const mutations = [];
  const invalidatedRevisions = [];
  f.scope.markBackupMutation = (appId) => mutations.push(appId);
  f.scope.clearVerifiedRemoteRevision = (appId) => invalidatedRevisions.push(appId);

  const updated = await f.run('generateNewExternalAddressWorker', {
    originAppId,
    payload: { wallet: saved },
  });

  assert.equal(updated, true);
  assert.equal(f.collections.Wallet[0].specs.totalExternalAddresses, 2);
  assert.deepEqual(mutations, [originAppId]);
  assert.deepEqual(invalidatedRevisions, [originAppId]);
  assert.ok(f.actions.some((action) => action.type === 'invalidateBackupRepair' &&
    action.payload === originAppId));
  assert.equal(f.state.bhr.pendingAllBackupByAppId[originAppId], true);
});

test('verified A backup completion after selected B switch cannot enable A or report success', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  f.state.bhr.automaticCloudBackupByAppId[originAppId] = false;
  f.scope.runBackupInspection = function* () {
    f.state.storage.appId = 'B';
    f.state.bhr.automaticCloudBackupByAppId.B = true;
    return true;
  };
  const result = await f.run('backupAllSignersAndVaultsWorker', { appId: originAppId });
  assert.equal(result, false);
  assert.ok(!f.actions.some((action) => action.type === 'setAutomaticCloudBackup' &&
    action.payload.enabled === true));
  assert.ok(!f.actions.some((action) => action.type === 'setBackupAllSuccess' &&
    action.payload.status === true));
});

test('dispatch gate drops stale enable and success actions while preserving account-specific resets', () => {
  let session = 1;
  const scope = {
    Set,
    RealmSchema: { KeeperApp: 'KeeperApp' },
    dbManager: { getObjectByIndex: () => ({ id: realmAppId }) },
    currentBackupAccountSession: () => session,
    captureBackupWriteIntent: (appId) => appId === selectedAppId ? {
      appId, accountSession: session, baseRevision: 'a'.repeat(64), baselineEpoch: 1,
    } : undefined,
  };
  let selectedAppId = 'B';
  let realmAppId = 'A';
  vm.runInNewContext(ts.transpileModule(
    functions('src/store/store.ts', [
      'accountOwnedActions', 'accountOwnedUtxoUiActions', 'bindActionOrigin',
    ]),
    { compilerOptions: { target: ts.ScriptTarget.ES2020 } }
  ).outputText, scope);
  const seen = [];
  const middleware = scope.bindActionOrigin({
    getState: () => ({ storage: { appId: selectedAppId } }),
  })((action) => { seen.push(action); return action; });
  const enableA = { type: 'bhr/setAutomaticCloudBackup', payload: { appId: 'A', enabled: true } };
  middleware(enableA);
  assert.equal(seen.length, 0, 'selected B blocks A enable even while Realm still A');
  middleware({ type: 'bhr/setBackupAllSuccess', payload: { appId: 'A', status: true } });
  assert.equal(seen.length, 0, 'selected B blocks A success even while Realm still A');
  selectedAppId = 'A';
  realmAppId = 'B';
  middleware(enableA);
  assert.equal(seen.length, 0, 'Realm B blocks A enable even while Redux still A');
  middleware({ type: 'bhr/setBackupAllSuccess', payload: { appId: 'A', status: true } });
  assert.equal(seen.length, 0, 'Realm B blocks A success even while Redux still A');
  realmAppId = 'A';
  middleware(enableA);
  assert.equal(seen.length, 1);
  middleware({ type: 'bhr/setBackupAllSuccess', payload: { appId: 'A', status: true } });
  assert.equal(seen.length, 2);
  selectedAppId = 'B';
  middleware({ type: 'bhr/setAutomaticCloudBackup', payload: { appId: 'A', enabled: false } });
  middleware({ type: 'bhr/setBackupAllSuccess', payload: { appId: 'A', status: false } });
  assert.equal(seen.length, 4, 'A disable and success reset remain account-specific after switch');
  selectedAppId = 'A';
  realmAppId = 'A';
  middleware({ type: 'UPDATE_APP_IMAGE', payload: {} });
  assert.equal(seen.at(-1).originAppId, 'A');
  assert.equal(seen.at(-1).originBackupAccountSession, 1);
  assert.equal(seen.at(-1).originBackupWriteIntent.accountSession, 1);
  const firstIntent = seen.at(-1).originBackupWriteIntent;
  session += 2;
  middleware({ type: 'UPDATE_APP_IMAGE', payload: {}, originAppId: 'A' });
  assert.equal(seen.at(-1).originBackupAccountSession, 3);
  assert.equal(seen.at(-1).originBackupWriteIntent.accountSession, 3);
  middleware({ type: 'UPDATE_APP_IMAGE', payload: {}, originAppId: 'A',
    originBackupAccountSession: 1,
    originBackupWriteIntent: firstIntent });
  assert.equal(seen.at(-1).originBackupAccountSession, 1,
    'redispatch must retain the original session instead of adopting the new A session');
  assert.strictEqual(seen.at(-1).originBackupWriteIntent, firstIntent,
    'redispatch must retain its immutable source intent');
  middleware({ type: 'DELETE_BACKUP', appId: 'A' });
  assert.equal(seen.at(-1).originBackupAccountSession, 3);
  middleware({ type: 'UPDATE_VERSION_HISTORY', originAppId: 'A' });
  assert.equal(seen.at(-1).originBackupAccountSession, 3);
});

test('A to opted-in B during connectivity wait blocks upload and preserves B local wallet', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  const sharedId = 'same-id-in-both-accounts';
  f.collections.Wallet.push(wallet(sharedId, enums.NetworkType.MAINNET));
  let resumeConnectivity;
  f.scope.NetInfo.fetch = () => new Promise((resolve) => { resumeConnectivity = resolve; });
  const deleting = f.run('deleteAppImageEntityWorker', {
    originAppId,
    payload: { walletIds: [sharedId] },
  });
  for (let i = 0; i < 20 && !resumeConnectivity; i++) await new Promise(setImmediate);
  assert.ok(resumeConnectivity, 'test must switch while the original account is waiting');
  switchToOptedInB(f);
  resumeConnectivity({ isConnected: true });
  const result = await deleting;
  assert.equal(result.updated, false);
  assert.equal(f.calls.length, 0, 'no remote delete may target either account');
  assert.deepEqual(f.collections.Wallet.map(({ id }) => id), [sharedId]);

  let resumeSecondCheck;
  f.scope.NetInfo.fetch = () => new Promise((resolve) => { resumeSecondCheck = resolve; });
  f.app.id = originAppId;
  f.app.primarySeed = 'ab'.repeat(32);
  f.state.storage.appId = originAppId;
  const updating = f.run('updateAppImageWorker', {
    originAppId,
    payload: { wallets: [wallet('A-wallet', enums.NetworkType.MAINNET)], updateNodes: true },
  });
  for (let i = 0; i < 20 && !resumeSecondCheck; i++) await new Promise(setImmediate);
  assert.ok(resumeSecondCheck);
  switchToOptedInB(f);
  resumeSecondCheck({ isConnected: true });
  assert.equal((await updating).updated, false);
  assert.equal(f.calls.length, 0, 'A payload must never be encrypted with B seed or sent to B');
});

test('queued A transport cannot execute after opted-in B becomes active', async () => {
  const calls = [];
  const transport = loadModule('src/services/backup/transport.ts', {
    '../rest/RestClient': { post: async (_path, body) => { calls.push(body); return { data: { updated: true } }; } },
  });
  let active = 'A';
  const consent = { A: true, B: true };
  transport.setBackupUploadGuard((id, explicitChoice) => id === active && (consent[id] || explicitChoice));
  let release;
  const busy = transport.withBackupSession('A', () => new Promise((resolve) => { release = resolve; }));
  for (let i = 0; i < 20 && !release; i++) await new Promise(setImmediate);
  assert.ok(release);
  const pending = transport.backupPost('fixture/updateAppImage', { appId: 'A', walletsObject: { secret: 'A-ciphertext' } });
  active = 'B';
  release();
  await busy;
  await assert.rejects(pending, (error) => error.category === 'protocol');
  assert.deepEqual(calls, [], 'the queued request must never reach the network');
});

test('queued A ciphertext cannot replace a newer server wallet after A to B to A', async () => {
  const remote = { wallets: { shared: 'initial-A-ciphertext' } };
  const calls = [];
  const transport = loadTransportModule('src/services/backup/transport.ts', {
    '../rest/RestClient': { post: async (_path, body) => {
      calls.push(body);
      Object.assign(remote.wallets, body.walletsObject);
      return { data: { updated: true } };
    } },
  });
  let active = 'A';
  transport.setBackupUploadGuard((id) => id === active);
  transport.observeBackupAccount?.(active);
  let release;
  const busy = transport.withBackupSession('A', () => new Promise((resolve) => { release = resolve; }));
  for (let i = 0; i < 20 && !release; i++) await new Promise(setImmediate);
  assert.ok(release);
  const pending = transport.backupPost('fixture/updateAppImage', {
    appId: 'A', walletsObject: { shared: 'stale-A-ciphertext' },
  });
  active = 'B';
  transport.observeBackupAccount?.(active);
  remote.wallets.shared = 'newer-A-ciphertext';
  active = 'A';
  transport.observeBackupAccount?.(active);
  release();
  await busy;
  await assert.rejects(pending, (error) => error.category === 'protocol');
  assert.equal(remote.wallets.shared, 'newer-A-ciphertext');
  assert.equal(calls.length, 0, 'stale ciphertext must never reach Relay');
});

test('incremental worker rejects an A payload prepared before A to B to A', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  let session = 1;
  f.scope.currentBackupAccountSession = () => session;
  let resumeConnectivity;
  f.scope.NetInfo.fetch = () => new Promise((resolve) => { resumeConnectivity = resolve; });
  const updating = f.run('updateAppImageWorker', {
    originAppId,
    originBackupAccountSession: session,
    payload: { wallets: [wallet('shared', enums.NetworkType.MAINNET)] },
  });
  for (let i = 0; i < 20 && !resumeConnectivity; i++) await new Promise(setImmediate);
  assert.ok(resumeConnectivity);
  f.app.id = 'B';
  f.state.storage.appId = 'B';
  session += 1;
  f.app.id = originAppId;
  f.state.storage.appId = originAppId;
  session += 1;
  f.remote.wallets.shared = 'newer-A-ciphertext';
  resumeConnectivity({ isConnected: true });
  assert.equal((await updating).updated, false);
  assert.equal(f.remote.wallets.shared, 'newer-A-ciphertext');
  assert.equal(f.calls.length, 0);
});

test('wallet creation paused before backup cannot upload a stale A wallet after A to B to A', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  let session = 1;
  f.scope.currentBackupAccountSession = () => session;
  let finishCreation;
  f.scope.addNewWallet = () => new Promise((resolve) => { finishCreation = resolve; });
  const creating = f.run('addNewWalletsWorker', {
    originAppId,
    originBackupAccountSession: session,
    payload: [{ walletType: enums.WalletType.DEFAULT, walletDetails: {} }],
  });
  for (let i = 0; i < 20 && !finishCreation; i++) await new Promise(setImmediate);
  assert.ok(finishCreation);
  f.app.id = 'B'; f.state.storage.appId = 'B'; session++;
  f.app.id = originAppId; f.state.storage.appId = originAppId; session++;
  f.remote.wallets.shared = 'newer-A-ciphertext';
  finishCreation(wallet('shared', enums.NetworkType.MAINNET));
  assert.equal(await creating, false);
  assert.equal(f.remote.wallets.shared, 'newer-A-ciphertext');
  assert.equal(f.calls.length, 0);
  assert.equal(f.collections.Wallet.length, 0);
});

test('vault update paused at connectivity cannot upload stale A vault after A to B to A', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  let session = 1;
  f.scope.currentBackupAccountSession = () => session;
  let finishConnectivity;
  f.scope.NetInfo.fetch = () => new Promise((resolve) => { finishConnectivity = resolve; });
  const updating = f.run('updateVaultImageWorker', {
    originAppId,
    originBackupAccountSession: session,
    payload: { vault: { id: 'shared', signers: [], archived: false } },
  });
  for (let i = 0; i < 20 && !finishConnectivity; i++) await new Promise(setImmediate);
  assert.ok(finishConnectivity);
  f.app.id = 'B'; f.state.storage.appId = 'B'; session++;
  f.app.id = originAppId; f.state.storage.appId = originAppId; session++;
  finishConnectivity({ isConnected: true });
  assert.equal((await updating).updated, false);
  assert.equal(f.calls.length, 0);
});

test('queued session rejection cannot report a successful incremental backup', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  let session = 1;
  f.scope.currentBackupAccountSession = () => session;
  let rejectQueued;
  f.scope.Relay.updateAppImage = () => new Promise((_resolve, reject) => { rejectQueued = reject; });
  const updating = f.run('updateAppImageWorker', {
    originAppId,
    originBackupAccountSession: session,
    payload: { wallets: [wallet('shared', enums.NetworkType.MAINNET)] },
  });
  for (let i = 0; i < 20 && !rejectQueued; i++) await new Promise(setImmediate);
  assert.ok(rejectQueued);
  f.app.id = 'B'; f.state.storage.appId = 'B'; session++;
  f.app.id = originAppId; f.state.storage.appId = originAppId; session++;
  rejectQueued(new Error('Backup account session changed'));
  assert.equal((await updating).updated, false);
});

test('vault signer xpriv refresh cannot write an old key after A to B to A', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  let session = 1;
  f.scope.currentBackupAccountSession = () => session;
  const key = signer('AABBCCDD', enums.NetworkType.MAINNET, enums.SignerType.SEED_WORDS);
  key.id = 'AABBCCDD0M';
  key.signerXpubs[enums.XpubTypes.P2WPKH][0].xpriv = 'old-secret';
  key.signerXpubs[enums.XpubTypes.P2WSH] = [{ xpub: 'vault-xpub', xpriv: 'old-secret' }];
  let finishVaultRead;
  const originalRead = f.scope.dbManager.getObjectByIndex;
  f.scope.dbManager.getObjectByIndex = (schema, ...args) => schema === 'Vault'
    ? new Promise((resolve) => { finishVaultRead = resolve; })
    : originalRead(schema, ...args);
  f.scope.WalletUtilities.getSignerPurposeFromPath = () => enums.DerivationPurpose.BIP84;
  let writes = 0;
  f.scope.dbManager.updateObjectByPrimaryId = () => { writes++; return true; };
  const updating = f.run('updateVaultSignerXprivWorker', {
    signers: [key], originAppId, originBackupAccountSession: session,
  });
  for (let i = 0; i < 20 && !finishVaultRead; i++) await new Promise(setImmediate);
  assert.ok(finishVaultRead);
  f.app.id = 'B'; f.state.storage.appId = 'B'; session++;
  f.app.id = originAppId; f.state.storage.appId = originAppId; session++;
  finishVaultRead([{ networkType: enums.NetworkType.MAINNET,
    signers: [{ ...key.signerXpubs[enums.XpubTypes.P2WSH][0],
    id: key.id, masterFingerprint: key.masterFingerprint, derivationPath: "m/84'/0'/0'" }],
  }]);
  await assert.rejects(updating, /Account changed/);
  assert.equal(writes, 0);
});

test('per-account consent starts off, survives switches, and legacy consent needs attribution', () => {
  const reducer = loadModule('src/store/reducers/bhr.ts', {
    'src/models/enums/BHR': loadModule('src/models/enums/BHR.ts'),
    'src/storage': { reduxStorage: {} },
    'redux-persist': { persistReducer: (_settings, fn) => fn },
  });
  let state = reducer.default(undefined, { type: 'init' });
  assert.equal(reducer.isAutomaticCloudBackupEnabled(state, 'A'), false);
  assert.equal(reducer.isAutomaticCloudBackupEnabled(state, 'B'), false);
  state = reducer.default(state, reducer.setAutomaticCloudBackup({ appId: 'A', enabled: true }));
  assert.equal(reducer.isAutomaticCloudBackupEnabled(state, 'A'), true);
  assert.equal(reducer.isAutomaticCloudBackupEnabled(state, 'B'), false);
  state = reducer.default(state, reducer.setBackupAllSuccess({ appId: 'A', status: true }));
  state = reducer.default(state, reducer.setAutomaticCloudBackup({ appId: 'A', enabled: false }));
  assert.equal(state.backupAllSuccessByAppId.A, false, 'stale UI success cannot reenable A');
  assert.equal(reducer.isAutomaticCloudBackupEnabled(state, 'A'), false);
  const legacy = { ...state, automaticCloudBackup: true, automaticCloudBackupByAppId: {} };
  const ambiguous = reducer.default(legacy, reducer.migrateLegacyAutomaticCloudBackup({ appId: 'A', canAttributeConsent: false }));
  assert.equal(reducer.isAutomaticCloudBackupEnabled(ambiguous, 'A'), false);
  assert.equal(ambiguous.automaticCloudBackup, false);
  const attributable = reducer.default(legacy, reducer.migrateLegacyAutomaticCloudBackup({ appId: 'A', canAttributeConsent: true }));
  assert.equal(reducer.isAutomaticCloudBackupEnabled(attributable, 'A'), true);
  assert.equal(reducer.isAutomaticCloudBackupEnabled(attributable, 'B'), false);
});

test('explicit backup can repair an off account only while that account stays active', async () => {
  const f = harness();
  f.local.Wallet.push(wallet('explicit', enums.NetworkType.MAINNET));
  f.transport.setBackupUploadGuard((id, explicitChoice) => id === f.app.id && explicitChoice);
  assert.equal(await f.repair.inspectBackup(f.app.id, true, () => {}, true), 'verified');
  assert.deepEqual(f.calls, ['getBackupSnapshot', 'revisionedBackupMutation', 'getBackupSnapshot']);
});

test('unconfirmed server deletion retains account consent and reports failure', async () => {
  const f = fixture();
  f.scope.Relay.deleteBackup = async () => ({ updated: false });
  assert.equal(await f.run('deleteBackupWorker', { appId: f.app.id }), false);
  assert.equal(f.state.bhr.automaticCloudBackupByAppId[f.app.id], true);
  assert.ok(f.actions.some((action) => action.type === 'setDeleteBackupFailure' &&
    action.payload.appId === f.app.id && action.payload.status === true));
  assert.ok(!f.actions.some((action) => action.type === 'setAutomaticCloudBackup' &&
    action.payload.enabled === false));
});

test('rejected entity deletion retains local wallet and queues an account repair', async () => {
  const f = fixture();
  const id = f.app.id;
  f.collections.Wallet.push(wallet('keep', enums.NetworkType.MAINNET));
  f.scope.Relay.deleteAppImageEntity = async () => ({ updated: false, error: 'rejected' });
  const result = await f.run('deleteAppImageEntityWorker', {
    originAppId: id,
    payload: { walletIds: ['keep'] },
  });
  assert.equal(result.updated, false);
  assert.deepEqual(f.collections.Wallet.map((w) => w.id), ['keep']);
  assert.equal(f.state.bhr.pendingAllBackupByAppId[id], true);
});

test('remote entity deletion followed by local failure reports partial deletion', async () => {
  const f = fixture();
  const id = f.app.id;
  f.collections.Wallet.push(wallet('keep', enums.NetworkType.MAINNET));
  f.scope.dbManager.deleteObjectById = () => false;
  const result = await f.run('deleteAppImageEntityWorker', {
    originAppId: id,
    payload: { walletIds: ['keep'] },
  });
  assert.equal(result.updated, false);
  assert.deepEqual(f.collections.Wallet.map((w) => w.id), ['keep']);
  assert.equal(f.state.bhr.pendingAllBackupByAppId[id], true);
});

test('signer delete reports failure and never shows success after rejected remote delete', async () => {
  const f = fixture();
  const key = signer('AABBCCDD', enums.NetworkType.MAINNET);
  f.scope.deleteAppImageEntityWorker = function* () { return { updated: false, error: 'rejected' }; };
  const result = await f.run('deleteSigningDeviceWorker', {
    originAppId: f.app.id,
    payload: { signers: [key] },
  });
  assert.equal(result, false);
  assert.ok(f.actions.some((action) => action.type === 'relaySignersUpdateFail'));
  assert.ok(!f.actions.some((action) => action.type === 'showKeyDeletedSuccessModal'));
});

test('remote vault deletion followed by failed local delete reports failure and pending repair', async () => {
  const f = fixture();
  f.scope.deleteVaultImageWorker = function* () { return { updated: true }; };
  f.scope.dbManager.deleteObjectById = () => false;
  await f.run('deleteVaultWorker', { originAppId: f.app.id, payload: { vaultId: 'keep-vault' } });
  assert.ok(f.actions.some((action) => action.type === 'relayVaultUpdateFail'));
  assert.ok(!f.actions.some((action) => action.type === 'relayVaultUpdateSuccess'));
  assert.equal(f.state.bhr.pendingAllBackupByAppId[f.app.id], true);
});

test('queued A address action cannot change B wallet with the same ID', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  const aWallet = { ...wallet('same-wallet', enums.NetworkType.MAINNET),
    specs: { totalExternalAddresses: 7 } };
  f.collections.Wallet.push({ ...wallet('same-wallet', enums.NetworkType.MAINNET),
    specs: { totalExternalAddresses: 4 } });
  switchToOptedInB(f);
  assert.equal(await f.run('generateNewExternalAddressWorker', {
    originAppId, payload: { wallet: aWallet },
  }), false);
  assert.equal(f.collections.Wallet[0].specs.totalExternalAddresses, 4);
  assert.equal(aWallet.specs.totalExternalAddresses, 7);
});

test('A policy response after B login cannot change B signer or policy UI state', async () => {
  const f = fixture();
  const originAppId = f.app.id;
  let completePolicy;
  f.scope.SigningServer.updatePolicy = () => new Promise((resolve) => { completePolicy = resolve; });
  let writes = 0;
  f.scope.dbManager.updateObjectByPrimaryId = () => { writes++; return true; };
  const policy = f.run('updateSignerPolicyWorker', {
    originAppId,
    payload: {
      signer: { masterFingerprint: 'AABBCCDD', signerPolicy: {} },
      signingKey: { xfp: 'AABBCCDD' },
      updates: { restrictions: {}, signingDelay: 0 },
      verificationToken: 123456,
    },
  });
  for (let i = 0; i < 20 && !completePolicy; i++) await new Promise(setImmediate);
  assert.ok(completePolicy);
  switchToOptedInB(f);
  completePolicy({ updated: true, delayedPolicyUpdate: { id: 'A-policy' } });
  await policy;
  assert.equal(writes, 0);
  assert.ok(!f.actions.some((action) =>
    action.type === 'updateDelayedPolicyUpdate' ||
    (action.type === 'setSignerPolicyError' && action.payload === 'success')));
});
