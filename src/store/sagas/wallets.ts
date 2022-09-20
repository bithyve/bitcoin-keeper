import { ADD_NEW_VAULT, FINALISE_VAULT_MIGRATION, MIGRATE_VAULT } from '../sagaActions/vaults';
import {
  ADD_NEW_WALLETS,
  AUTO_SYNC_WALLETS,
  IMPORT_NEW_WALLET,
  REFRESH_WALLETS,
  REGISTER_WITH_SIGNING_SERVER,
  SYNC_WALLETS,
  UPDATE_WALLET_SETTINGS,
  VALIDATE_SIGNING_SERVER_REGISTRATION,
  refreshWallets,
  walletSettingsUpdateFailed,
  walletSettingsUpdated,
} from '../sagaActions/wallets';
import {
  EntityKind,
  NetworkType,
  VaultMigrationType,
  VaultType,
  VisibilityType,
  WalletType,
} from 'src/core/wallets/enums';
import { Storage, getString, setItem } from 'src/storage';
import { Vault, VaultScheme, VaultShell, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { Wallet, WalletShell } from 'src/core/wallets/interfaces/wallet';
import {
  addSigningDevice,
  initiateVaultMigration,
  vaultCreated,
  vaultMigrationCompleted,
} from '../reducers/vaults';
import { call, put, select } from 'redux-saga/effects';
import { setNetBalance, signingServerRegistrationVerified } from 'src/store/reducers/wallets';
import { updatVaultImage, updateAppImage } from '../sagaActions/bhr';

import { ADD_SIGINING_DEVICE } from '../sagaActions/vaults';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { RootState } from '../store';
import SigningServer from 'src/core/services/operations/SigningServer';
import { TwoFADetails } from 'src/core/wallets/interfaces/';
import WalletOperations from 'src/core/wallets/operations';
import WalletUtilities from 'src/core/wallets/operations/utils';
import _ from 'lodash';
import config from 'src/core/config';
import { createWatcher } from 'src/store/utilities';
import dbManager from 'src/storage/realm/dbManager';
import { generateVault } from 'src/core/wallets/factories/VaultFactory';
import { generateWallet } from 'src/core/wallets/factories/WalletFactory';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getRandomBytes } from 'src/core/services/operations/encryption';

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
        networkType: config.NETWORK_TYPE,
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
        networkType: config.NETWORK_TYPE,
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
        networkType: config.NETWORK_TYPE,
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
        networkType: config.NETWORK_TYPE,
      });
      return readOnlyWallet;
  }
}

export function* addNewWalletsWorker({ payload: newWalletInfo }: { payload: newWalletInfo[] }) {
  const wallets: Wallet[] = [];
  const walletIds = [];

  const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);

  const { walletShellInstances } = app;
  const walletShell: WalletShell = yield call(
    dbManager.getObjectById,
    RealmSchema.WalletShell,
    walletShellInstances.activeShell
  );

  for (const { walletType, walletDetails, importDetails } of newWalletInfo) {
    const wallet: Wallet = yield call(
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

  wallets.forEach((wallet: Wallet) => {
    if (presentWalletInstances[wallet.type]) presentWalletInstances[wallet.type]++;
    else presentWalletInstances = { [wallet.type]: 1 };
  });

  yield call(dbManager.updateObjectById, RealmSchema.WalletShell, walletShell.id, {
    walletInstances: presentWalletInstances,
  });

  for (const wallet of wallets) {
    yield call(dbManager.createObject, RealmSchema.Wallet, wallet);
    yield put(updateAppImage(wallet.id));
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

function* addNewVaultWorker({
  payload,
}: {
  payload: { newVaultInfo?: newVaultInfo; vault?: Vault };
}) {
  try {
    let { newVaultInfo, vault } = payload;
    let vaultShell: VaultShell;
    let newVaultShell: boolean = false;
    const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const { vaultShellInstances } = app;
    vaultShell = yield call(
      dbManager.getObjectById,
      RealmSchema.VaultShell,
      vaultShellInstances.activeShell
    );
    // When the vault is passed directly during upgrade/downgrade process
    if (!vault) {
      const { vaultType, vaultScheme, vaultSigners, vaultDetails } = newVaultInfo;
      if (vaultScheme.n !== vaultSigners.length)
        throw new Error('Vault schema(n) and signers mismatch');

      if (vaultShellInstances.shells.length === 0) {
        vaultShell = {
          id: getRandomBytes(12),
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
      const networkType = config.NETWORK_TYPE;
      vault = yield call(generateVault, {
        type: vaultType,
        vaultShellId: vaultShell.id,
        vaultName: vaultDetails.name,
        vaultDescription: vaultDetails.description,
        scheme: vaultScheme,
        signers: vaultSigners,
        networkType,
      });
    }

    yield call(dbManager.createObject, RealmSchema.Vault, vault);

    if (!newVaultShell) {
      let presentVaultInstances = { ...vaultShell.vaultInstances };
      presentVaultInstances[vault.type] = (presentVaultInstances[vault.type] || 0) + 1;

      yield call(dbManager.updateObjectById, RealmSchema.VaultShell, vaultShell.id, {
        vaultInstances: presentVaultInstances,
      });
      yield put(vaultCreated({ hasNewVaultGenerationSucceeded: true }));
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
    yield put(vaultCreated({ hasNewVaultGenerationSucceeded: true }));

    yield call(updatVaultImage);
  } catch (err) {
    yield put(
      vaultCreated({
        hasNewVaultGenerationFailed: true,
        hasNewVaultGenerationSucceeded: false,
        error: err.toString(),
      })
    );
  }
}

export const addNewVaultWatcher = createWatcher(addNewVaultWorker, ADD_NEW_VAULT);

function* addSigningDeviceWorker({ payload: signer }: { payload: VaultSigner }) {
  yield put(addSigningDevice([signer]));
}

export const addSigningDeviceWatcher = createWatcher(addSigningDeviceWorker, ADD_SIGINING_DEVICE);

function* migrateVaultWorker({
  payload,
}: {
  payload: { newVaultData: newVaultInfo; migrationType: VaultMigrationType };
}) {
  try {
    const { vaultType, vaultScheme, vaultSigners, vaultDetails } = payload.newVaultData;
    const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const { vaultShellInstances } = app;

    if (vaultScheme.n !== vaultSigners.length)
      throw new Error('Vault schema(n) and signers mismatch');

    let vaultShell: VaultShell = yield call(
      dbManager.getObjectById,
      RealmSchema.VaultShell,
      vaultShellInstances.activeShell
    );
    const networkType = config.NETWORK_TYPE;

    const vault: Vault = yield call(generateVault, {
      type: vaultType,
      vaultShellId: vaultShell.id,
      vaultName: vaultDetails.name,
      vaultDescription: vaultDetails.description,
      scheme: vaultScheme,
      signers: vaultSigners,
      networkType,
    });
    yield put(initiateVaultMigration({ isMigratingNewVault: true, intrimVault: vault }));
  } catch (error) {
    yield put(
      vaultMigrationCompleted({
        isMigratingNewVault: true,
        hasMigrationSucceeded: false,
        hasMigrationFailed: true,
        error: error.toString(),
      })
    );
  }
}

export const migrateVaultWatcher = createWatcher(migrateVaultWorker, MIGRATE_VAULT);

function* finaliseVaultMigrationWorker({ payload }: { payload: { vaultId: string } }) {
  try {
    const { vaultId } = payload;
    yield call(dbManager.updateObjectById, RealmSchema.Vault, vaultId, {
      archived: true,
    });
    const migratedVault = yield select((state: RootState) => state.vault.intrimVault);
    yield call(addNewVaultWorker, { payload: { vault: migratedVault } });
    yield put(
      vaultMigrationCompleted({
        isMigratingNewVault: false,
        hasMigrationSucceeded: true,
        hasMigrationFailed: false,
        error: null,
      })
    );
  } catch (error) {
    yield put(
      vaultMigrationCompleted({
        isMigratingNewVault: true,
        hasMigrationSucceeded: false,
        hasMigrationFailed: true,
        error: error.toString(),
      })
    );
  }
}

export const finaliseVaultMigrationWatcher = createWatcher(
  finaliseVaultMigrationWorker,
  FINALISE_VAULT_MIGRATION
);

export function* importNewWalletWorker({
  payload,
}: {
  payload: {
    mnemonic: string;
    walletDetails?: newWalletDetails;
  };
}) {
  const wallets: Wallet[] = [];
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
    const wallet: Wallet = yield call(
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
  wallets.forEach((wallet: Wallet) => {
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
  const { synchedWallets }: { synchedWallets: (Wallet | Vault)[] } = yield call(syncWalletsWorker, {
    payload: {
      wallets,
      options,
    },
  });

  let computeNetBalance = false;
  for (const synchedWallet of synchedWallets) {
    if (synchedWallet.entityKind === EntityKind.VAULT) {
      yield call(dbManager.updateObjectById, RealmSchema.Vault, synchedWallet.id, {
        specs: synchedWallet.specs,
      });
    } else {
      yield call(dbManager.updateObjectById, RealmSchema.Wallet, synchedWallet.id, {
        specs: synchedWallet.specs,
      });
      if ((synchedWallet as Wallet).specs.hasNewTxn) computeNetBalance = true;
    }
  }

  if (computeNetBalance) {
    const wallets: Wallet[] = yield call(
      dbManager.getObjectByIndex,
      RealmSchema.Wallet,
      null,
      true
    );
    // const vaults: Vault[] = yield call(dbManager.getObjectByIndex, RealmSchema.Vault, null, true);

    let netBalance = 0;
    wallets.forEach((wallet) => {
      const { confirmed, unconfirmed } = wallet.specs.balances;
      netBalance = netBalance + confirmed + unconfirmed;
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

export function* registerWithSigningServerWorker() {
  const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
  if (app.twoFADetails && app.twoFADetails.signingServerXpub)
    throw new Error('registration already in progress');

  const { setupData } = yield call(SigningServer.register, app.id);
  const twoFADetails: TwoFADetails = {
    signingServerXpub: setupData.bhXpub,
    twoFAKey: setupData.secret,
  };
  yield call(dbManager.updateObjectById, RealmSchema.KeeperApp, app.id, { twoFADetails });
}

export const registerWithSigningServerWatcher = createWatcher(
  registerWithSigningServerWorker,
  REGISTER_WITH_SIGNING_SERVER
);

function* validateSigningServerRegistrationWorker({ payload }: { payload: { token: number } }) {
  const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
  const { token } = payload;
  try {
    const { valid } = yield call(SigningServer.validate, app.id, token);
    if (valid) {
      yield put(signingServerRegistrationVerified(true));
      const twoFADetails = { ...app.twoFADetails };
      twoFADetails.twoFAValidated = true;
      yield call(dbManager.updateObjectById, RealmSchema.KeeperApp, app.id, { twoFADetails });
    } else yield put(signingServerRegistrationVerified(false));
  } catch (error) {
    yield put(signingServerRegistrationVerified(false));
  }
}

export const validateSigningServerRegistrationWatcher = createWatcher(
  validateSigningServerRegistrationWorker,
  VALIDATE_SIGNING_SERVER_REGISTRATION
);
