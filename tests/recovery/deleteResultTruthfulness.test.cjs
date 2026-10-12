const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { fixture, enums, wallet } = require('./sagaHarness.cjs');

test('BTC wallet delete completion is false when the relay rejects the delete', async () => {
  const f = fixture();
  f.collections.Wallet.push(wallet('keep', enums.NetworkType.MAINNET));
  f.scope.Relay.deleteAppImageEntity = async () => ({ updated: false, error: 'rejected' });
  const completed = [];

  const result = await f.run('deleteAppImageEntityRequestWorker', {
    originAppId: f.app.id,
    payload: { walletIds: ['keep'] },
    onComplete: (deleted) => completed.push(deleted),
  });

  assert.equal(result, false);
  assert.deepEqual(completed, [false]);
  assert.deepEqual(f.collections.Wallet.map((row) => row.id), ['keep']);
});

test('BTC wallet delete completion is true only after the Realm object is gone', async () => {
  const f = fixture();
  f.collections.Wallet.push(wallet('remove', enums.NetworkType.MAINNET));
  const completed = [];

  const result = await f.run('deleteAppImageEntityRequestWorker', {
    originAppId: f.app.id,
    payload: { walletIds: ['remove'] },
    onComplete: (deleted) => completed.push(deleted),
  });

  assert.equal(result, true);
  assert.deepEqual(completed, [true]);
  assert.deepEqual(f.collections.Wallet, []);
});

test('BTC wallet delete completion is false if Realm reports success but retains the object', async () => {
  const f = fixture();
  f.collections.Wallet.push(wallet('keep', enums.NetworkType.MAINNET));
  f.scope.dbManager.deleteObjectById = () => true;
  const completed = [];

  const result = await f.run('deleteAppImageEntityRequestWorker', {
    originAppId: f.app.id,
    payload: { walletIds: ['keep'] },
    onComplete: (deleted) => completed.push(deleted),
  });

  assert.equal(result, false);
  assert.deepEqual(completed, [false]);
  assert.deepEqual(f.collections.Wallet.map((row) => row.id), ['keep']);
  assert.equal(f.state.bhr.pendingAllBackupByAppId[f.app.id], true);
});

test('vault delete reports failure if Realm reports success but retains the object', async () => {
  const f = fixture();
  f.collections.Vault.push({ id: 'keep' });
  f.scope.deleteVaultImageWorker = function* () { return { updated: true }; };
  f.scope.dbManager.deleteObjectById = () => true;

  await f.run('deleteVaultWorker', {
    originAppId: f.app.id,
    payload: { vaultId: 'keep' },
  });

  assert.ok(f.actions.some((action) => action.type === 'relayVaultUpdateFail'));
  assert.ok(!f.actions.some((action) => action.type === 'relayVaultUpdateSuccess'));
  assert.deepEqual(f.collections.Vault.map((row) => row.id), ['keep']);
});

test('signer delete completion is false if Realm reports success but retains the signer', async () => {
  const f = fixture();
  f.collections.Signer.push({ id: 'keep' });
  f.scope.dbManager.deleteObjectByPrimaryKey = () => true;
  const completed = [];

  const result = await f.run('deleteAppImageEntityRequestWorker', {
    originAppId: f.app.id,
    payload: { signerIds: ['keep'], walletIds: [] },
    onComplete: (deleted) => completed.push(deleted),
  });

  assert.equal(result, false);
  assert.deepEqual(completed, [false]);
  assert.deepEqual(f.collections.Signer.map((row) => row.id), ['keep']);
});

const screenFile = path.join(__dirname, '../../src/screens/AppSettings/ManageWallets.tsx');
const screen = ts.createSourceFile(screenFile, fs.readFileSync(screenFile, 'utf8'),
  ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let deleteDeclaration;
function findDelete(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(screen) === 'deleteSelectedEntity')
    deleteDeclaration = node;
  ts.forEachChild(node, findDelete);
}
findDelete(screen);
assert.ok(deleteDeclaration, 'production ManageWallets delete handler must exist');
const deleteHandlerCode = ts.transpileModule(
  `const ${deleteDeclaration.getText(screen)}; globalThis.deleteSelectedEntity = deleteSelectedEntity;`,
  { compilerOptions: { target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React } }
).outputText;

function screenFixture(entityKind, usdtResult = false) {
  const state = { active: 'A', session: 1, present: true, actions: [], toasts: [] };
  const scope = {
    React: { createElement: (component) => component },
    TickIcon: 'tick', ToastErrorIcon: 'error',
    EntityKind: { WALLET: 'WALLET', VAULT: 'VAULT', USDT_WALLET: 'USDT_WALLET' },
    RealmSchema: { KeeperApp: 'KeeperApp', Wallet: 'Wallet', Vault: 'Vault', USDTWallet: 'USDTWallet' },
    selectedWallet: { id: 'keep', entityKind },
    pendingVaultDeleteRef: { current: null },
    dbManager: {
      getObjectByIndex: () => ({ id: state.active }),
      getObjectById: () => state.present ? { id: 'keep' } : undefined,
    },
    activeRealmAppId: () => state.active,
    currentBackupAccountSession: () => state.session,
    deleteAppImageEntity: (request) => ({ type: 'DELETE_BTC', ...request }),
    deleteVault: (id) => ({ type: 'DELETE_VAULT', id }),
    resetRealyVaultState: () => ({ type: 'RESET_VAULT' }),
    deleteUSDTWallet: async () => usdtResult,
    dispatch: (action) => state.actions.push(action),
    showToast: (message, icon) => state.toasts.push({ message, icon }),
    errorText: {
      waletDeleted: 'Wallet deleted',
      vaultDeleted: 'Vault deleted',
      failedToDeleteVault: 'Failed to delete vault',
    },
  };
  vm.runInNewContext(deleteHandlerCode, scope);
  return { state, scope, deleteSelectedEntity: scope.deleteSelectedEntity };
}

test('ManageWallets waits for the BTC delete outcome before showing a toast', async () => {
  const f = screenFixture('WALLET');
  await f.deleteSelectedEntity();
  assert.equal(f.state.actions.length, 1);
  assert.deepEqual(f.state.toasts, []);

  f.state.actions[0].onComplete(false);
  assert.equal(f.state.toasts[0].message, 'Failed to delete wallet');
});

test('ManageWallets refuses a BTC success toast while the Realm wallet still exists', async () => {
  const f = screenFixture('WALLET');
  await f.deleteSelectedEntity();
  f.state.actions[0].onComplete(true);
  assert.equal(f.state.toasts[0].message, 'Failed to delete wallet');

  const removed = screenFixture('WALLET');
  await removed.deleteSelectedEntity();
  removed.state.present = false;
  removed.state.actions[0].onComplete(true);
  assert.equal(removed.state.toasts[0].message, 'Wallet deleted');
});

test('ManageWallets does not show an old account delete result after account switch', async () => {
  const f = screenFixture('WALLET');
  await f.deleteSelectedEntity();
  f.state.active = 'B';
  f.state.session = 2;
  f.state.actions[0].onComplete(false);
  assert.deepEqual(f.state.toasts, []);
});

test('ManageWallets does not report USDT deletion success while Realm retains it', async () => {
  const f = screenFixture('USDT_WALLET', true);
  await f.deleteSelectedEntity();
  assert.equal(f.state.toasts[0].message, 'Failed to delete USDT wallet');
});

test('ManageWallets leaves the vault delete result pending until the saga finishes', async () => {
  const f = screenFixture('VAULT');
  await f.deleteSelectedEntity();
  assert.deepEqual(f.state.toasts, []);
  assert.equal(f.scope.pendingVaultDeleteRef.current.id, 'keep');
  assert.deepEqual(f.state.actions.map((action) => action.type), ['RESET_VAULT', 'DELETE_VAULT']);
});
