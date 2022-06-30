import { call, put } from 'redux-saga/effects';
import _ from 'lodash';
import { createWatcher } from 'src/store/utilities';
import {
  SYNC_WALLETS,
  UPDATE_WALLET_SETTINGS,
  walletSettingsUpdated,
  walletSettingsUpdateFailed,
  IMPORT_NEW_WALLET,
  refreshWallets,
  REFRESH_WALLETS,
  AUTO_SYNC_WALLETS,
  ADD_NEW_WALLETS,
  ADD_NEW_VAULT,
} from '../sagaActions/wallets';
import config, { APP_STAGE } from 'src/core/config';
import { setNetBalance } from 'src/store/reducers/wallets';
import WalletOperations from 'src/core/wallets/operations';
import crypto from 'crypto';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { generateWallet } from 'src/core/wallets/factories/WalletFactory';
import { Wallet, MultiSigWallet, WalletShell } from 'src/core/wallets/interfaces/wallet';
import { WalletType, NetworkType, VisibilityType, VaultType } from 'src/core/wallets/enums';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { Vault, VaultScheme, VaultShell, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { generateVault } from 'src/core/wallets/factories/VaultFactory';

export interface newWalletDetails {
  name?: string;
  description?: string;
}
export interface newWalletInfo {
  walletType: WalletType;
  walletDetails?: newWalletDetails;
  importDetails?: {
    primaryMnemonic?: string;
    xpub?: string;
  };
}

function* addNewWallet(
  walletType: WalletType,
  walletDetails: newWalletDetails,
  app: KeeperApp,
  walletShell: WalletShell,
  importDetails?: { primaryMnemonic?: string; xpub?: string }
) {
  const { primaryMnemonic } = app;
  const { walletInstances } = walletShell;
  const { name: walletName, description: walletDescription } = walletDetails;

  switch (walletType) {
    case WalletType.CHECKING:
      const checkingWallet: Wallet = yield call(generateWallet, {
        type: WalletType.CHECKING,
        instanceNum: walletInstances[WalletType.CHECKING] | 0,
        walletShellId: walletShell.id,
        walletName: walletName ? walletName : 'Checking Wallet',
        walletDescription: walletDescription ? walletDescription : 'Bitcoin Wallet',
        primaryMnemonic,
        networkType:
          config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      });
      return checkingWallet;

    case WalletType.LIGHTNING:
      const lnWallet: Wallet = yield call(generateWallet, {
        type: walletType,
        instanceNum: walletInstances[walletType] | 0,
        walletShellId: walletShell.id,
        walletName: walletName ? walletName : 'Lightning Wallet',
        walletDescription: walletDescription ? walletDescription : '',
        primaryMnemonic,
        networkType:
          config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      });
      return lnWallet;

    case WalletType.IMPORTED:
      const importedWallet: Wallet = yield call(generateWallet, {
        type: WalletType.IMPORTED,
        instanceNum: null, // bip-85 instance number is null for imported wallets
        walletShellId: walletShell.id,
        walletName: walletName ? walletName : 'Imported Wallet',
        walletDescription: walletDescription ? walletDescription : 'Bitcoin Wallet',
        importedMnemonic: importDetails.primaryMnemonic,
        networkType:
          config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      });
      return importedWallet;

    case WalletType.READ_ONLY:
      const readOnlyWallet: Wallet = yield call(generateWallet, {
        type: WalletType.READ_ONLY,
        instanceNum: null, // bip-85 instance number is null for read-only wallets
        walletShellId: walletShell.id,
        walletName: walletName ? walletName : 'Read-Only Wallet',
        walletDescription: walletDescription ? walletDescription : 'Bitcoin Wallet',
        importedXpub: importDetails.xpub,
        networkType:
          config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET,
      });
      return readOnlyWallet;
  }
}

export function* addNewWalletsWorker({ payload: newWalletInfo }: { payload: newWalletInfo[] }) {
  const wallets: (Wallet | MultiSigWallet)[] = [];
  const walletIds = [];

  const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);

  const { walletShellInstances } = app;
  const walletShell: WalletShell = yield call(
    dbManager.getObjectById,
    RealmSchema.WalletShell,
    walletShellInstances.activeShell
  );

  for (const { walletType, walletDetails, importDetails } of newWalletInfo) {
    const wallet: Wallet | MultiSigWallet = yield call(
      addNewWallet,
      walletType,
      walletDetails || {},
      app,
      walletShell,
      importDetails
    );
    walletIds.push(wallet.id);
    wallets.push(wallet);
  }

  let presentWalletInstances = { ...walletShell.walletInstances };

  wallets.forEach((wallet: Wallet | MultiSigWallet) => {
    if (presentWalletInstances[wallet.type]) presentWalletInstances[wallet.type]++;
    else presentWalletInstances = { [wallet.type]: 1 };
  });

  yield call(dbManager.updateObjectById, RealmSchema.WalletShell, walletShell.id, {
    walletInstances: presentWalletInstances,
  });

  for (const wallet of wallets) {
    yield call(dbManager.createObject, RealmSchema.Wallet, wallet);
  }
}

export const addNewWalletsWatcher = createWatcher(addNewWalletsWorker, ADD_NEW_WALLETS);

export type newVaultDetails = newWalletDetails;
export interface newVaultInfo {
  vaultType: VaultType;
  vaultScheme: VaultScheme;
  vaultSigners: VaultSigner[];
  vaultDetails?: newVaultDetails;
}

function* addNewVaultWorker({ payload: newVaultInfo }: { payload: newVaultInfo }) {
  const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
  const { vaultShellInstances } = app;
  const { vaultType, vaultScheme, vaultSigners, vaultDetails } = newVaultInfo;

  if (vaultScheme.n !== vaultSigners.length)
    throw new Error('Vault schema(n) and signers mismatch');

  let vaultShell: VaultShell;
  let newVaultShell: boolean = false;
  if (vaultShellInstances.shells.length === 0) {
    vaultShell = {
      id: crypto.randomBytes(12).toString('hex'),
      vaultInstances: {},
    };
    newVaultShell = true;
  } else {
    vaultShell = yield call(
      dbManager.getObjectById,
      RealmSchema.VaultShell,
      vaultShellInstances.activeShell
    );
  }

  const networkType =
    config.APP_STAGE === APP_STAGE.DEVELOPMENT ? NetworkType.TESTNET : NetworkType.MAINNET;

  const vault: Vault = yield call(generateVault, {
    type: vaultType,
    vaultShellId: vaultShell.id,
    vaultName: vaultDetails.name,
    vaultDescription: vaultDetails.description,
    scheme: vaultScheme,
    signers: vaultSigners,
    networkType,
  });
  yield call(dbManager.createObject, RealmSchema.Vault, vault);

  if (!newVaultShell) {
    let presentVaultInstances = { ...vaultShell.vaultInstances };
    presentVaultInstances[vault.type] = (presentVaultInstances[vault.type] || 0) + 1;

    yield call(dbManager.updateObjectById, RealmSchema.WalletShell, vaultShell.id, {
      vaultInstances: presentVaultInstances,
    });
  } else {
    vaultShell.vaultInstances[vault.type] = 1;
    yield call(dbManager.createObject, RealmSchema.VaultShell, vaultShell);
    yield call(dbManager.updateObjectById, RealmSchema.KeeperApp, app.id, {
      vaultShellInstances: {
        shells: [vaultShell.id],
        activeShell: vaultShell.id,
      },
    });
  }
}

export const addNewVaultWatcher = createWatcher(addNewVaultWorker, ADD_NEW_VAULT);

export function* importNewWalletWorker({
  payload,
}: {
  payload: {
    mnemonic: string;
    walletDetails?: newWalletDetails;
  };
}) {
  const wallets: (Wallet | MultiSigWallet)[] = [];
  const walletIds = [];
  const newWalletInfo: newWalletInfo[] = [
    {
      walletType: WalletType.IMPORTED,
      walletDetails: payload.walletDetails,
      importDetails: {
        primaryMnemonic: payload.mnemonic,
      },
    },
  ];

  const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
  const { walletShellInstances } = app;
  const walletShell: WalletShell = yield call(
    dbManager.getObjectById,
    RealmSchema.WalletShell,
    walletShellInstances.activeShell
  );

  for (const { walletType, walletDetails, importDetails } of newWalletInfo) {
    const wallet: Wallet | MultiSigWallet = yield call(
      addNewWallet,
      walletType,
      walletDetails || {},
      app,
      walletShell,
      importDetails
    );
    walletIds.push(wallet.id);
    wallets.push(wallet);
  }

  let presentWalletInstances = { ...walletShell.walletInstances };
  wallets.forEach((wallet: Wallet | MultiSigWallet) => {
    if (presentWalletInstances[wallet.type]) presentWalletInstances[wallet.type]++;
    else presentWalletInstances = { [wallet.type]: 1 };
  });

  yield call(dbManager.updateObjectById, RealmSchema.WalletShell, walletShell.id, {
    walletInstances: presentWalletInstances,
  });

  for (const wallet of wallets) {
    yield call(dbManager.createObject, RealmSchema.Wallet, wallet);
  }

  yield put(
    refreshWallets(wallets, {
      hardRefresh: true,
    })
  );
}

export const importNewWalletWatcher = createWatcher(importNewWalletWorker, IMPORT_NEW_WALLET);

function* syncWalletsWorker({
  payload,
}: {
  payload: {
    wallets: (Wallet | Vault)[];
    options: {
      hardRefresh?: boolean;
    };
  };
}) {
  const { wallets, options } = payload;
  const network = WalletUtilities.getNetworkByType(wallets[0].networkType);
  const { synchedWallets, txsFound, activeAddressesWithNewTxsMap } = yield call(
    WalletOperations.syncWallets,
    wallets,
    network,
    options.hardRefresh
  );

  return {
    synchedWallets,
    txsFound,
    activeAddressesWithNewTxsMap,
  };
}

export const syncWalletsWatcher = createWatcher(syncWalletsWorker, SYNC_WALLETS);

function* refreshWalletsWorker({
  payload,
}: {
  payload: {
    wallets: (Wallet | Vault)[];
    options: { hardRefresh?: boolean };
  };
}) {
  const { wallets } = payload;
  const options: { hardRefresh?: boolean } = payload.options;
  const { synchedWallets, activeAddressesWithNewTxsMap } = yield call(syncWalletsWorker, {
    payload: {
      wallets,
      options,
    },
  });

  let computeNetBalance = false;
  for (const synchedWallet of synchedWallets) {
    yield call(dbManager.updateObjectById, RealmSchema.Wallet, synchedWallet.id, {
      specs: synchedWallet.specs,
    });

    if ((synchedWallet as Wallet).specs.hasNewTxn) computeNetBalance = true;
  }

  if (computeNetBalance) {
    const wallets: Wallet[] = yield call(
      dbManager.getObjectByIndex,
      RealmSchema.Wallet,
      null,
      true
    );
    let netBalance = 0;
    wallets.forEach((wallet) => {
      const { confirmed, unconfirmed } = wallet.specs.balances;
      const { type } = wallet;
      netBalance = netBalance + (type === WalletType.READ_ONLY ? 0 : confirmed + unconfirmed);
    });

    yield put(setNetBalance(netBalance));
  }

  // update F&F channels if any new txs found on an assigned address
  // if( Object.keys( activeAddressesWithNewTxsMap ).length )  yield call( updatePaymentAddressesToChannels, activeAddressesWithNewTxsMap, synchedWallets )
}

export const refreshWalletsWatcher = createWatcher(refreshWalletsWorker, REFRESH_WALLETS);

function* autoWalletsSyncWorker({
  payload,
}: {
  payload: { syncAll?: boolean; hardRefresh?: boolean };
}) {
  const { syncAll, hardRefresh } = payload;
  const wallets: Wallet[] = yield call(dbManager.getObjectByIndex, RealmSchema.Wallet, null, true);
  const vault: Vault[] = yield call(dbManager.getObjectByIndex, RealmSchema.Vault, null, true);

  const walletsToSync: (Wallet | Vault)[] = [];
  for (const wallet of [...wallets, ...vault]) {
    if (syncAll || wallet.presentationData.visibility === VisibilityType.DEFAULT) {
      if (!wallet.isUsable) continue;
      walletsToSync.push(getJSONFromRealmObject(wallet));
    }
  }

  if (walletsToSync.length) {
    yield call(refreshWalletsWorker, {
      payload: {
        wallets: walletsToSync,
        options: {
          hardRefresh,
        },
      },
    });
  }
}

export const autoWalletsSyncWatcher = createWatcher(autoWalletsSyncWorker, AUTO_SYNC_WALLETS);

function* updateWalletSettingsWorker({
  payload,
}: {
  payload: {
    wallet: Wallet | Vault;
    settings: {
      walletName?: string;
      walletDescription?: string;
      visibility?: VisibilityType;
    };
  };
}) {
  const { wallet, settings } = payload;
  const { walletName, walletDescription, visibility } = settings;

  try {
    if (walletName) wallet.presentationData.name = walletName;
    if (walletDescription) wallet.presentationData.description = walletDescription;
    if (visibility) wallet.presentationData.visibility = visibility;

    yield call(dbManager.updateObjectById, RealmSchema.Wallet, wallet.id, {
      presentationData: wallet.presentationData,
    });
    yield put(walletSettingsUpdated());
  } catch (error) {
    yield put(
      walletSettingsUpdateFailed({
        error,
      })
    );
  }
}

export const updateWalletSettingsWatcher = createWatcher(
  updateWalletSettingsWorker,
  UPDATE_WALLET_SETTINGS
);
