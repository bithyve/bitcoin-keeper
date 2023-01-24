/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-case-declarations */
import {
  EntityKind,
  VaultMigrationType,
  VaultType,
  VisibilityType,
  WalletType,
} from 'src/core/wallets/enums';
import {
  SignerException,
  SignerRestriction,
  SingerVerification,
  VerificationType,
} from 'src/core/services/interfaces';
import { Vault, VaultScheme, VaultShell, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { Wallet, WalletPresentationData, WalletShell } from 'src/core/wallets/interfaces/wallet';
import { call, put, select } from 'redux-saga/effects';
import {
  setNetBalance,
  setTestCoinsFailed,
  setTestCoinsReceived,
  signingServerRegistrationVerified,
} from 'src/store/reducers/wallets';

import { Alert } from 'react-native';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import Relay from 'src/core/services/operations/Relay';
import SigningServer from 'src/core/services/operations/SigningServer';
import { TwoFADetails } from 'src/core/wallets/interfaces/';
import WalletOperations from 'src/core/wallets/operations';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';
import { createWatcher } from 'src/store/utilities';
import dbManager from 'src/storage/realm/dbManager';
import { generateVault } from 'src/core/wallets/factories/VaultFactory';
import { generateWallet } from 'src/core/wallets/factories/WalletFactory';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getRandomBytes } from 'src/core/services/operations/encryption';
import { uaiType } from 'src/common/data/models/interfaces/Uai';
import { RootState } from '../store';
import { updateVaultImage, updateAppImage } from '../sagaActions/bhr';
import {
  addSigningDevice,
  initiateVaultMigration,
  vaultCreated,
  vaultMigrationCompleted,
} from '../reducers/vaults';
import {
  ADD_NEW_WALLETS,
  AUTO_SYNC_WALLETS,
  IMPORT_NEW_WALLET,
  REFRESH_WALLETS,
  REGISTER_WITH_SIGNING_SERVER,
  SYNC_WALLETS,
  TEST_SATS_RECIEVE,
  UPDATE_SIGNER_POLICY,
  UPDATE_WALLET_DETAILS,
  UPDATE_WALLET_SETTINGS,
  VALIDATE_SIGNING_SERVER_REGISTRATION,
  refreshWallets,
  walletSettingsUpdateFailed,
  walletSettingsUpdated,
  UPDATE_SIGNER_DETAILS,
  UPDATE_WALLET_PROPERTY,
} from '../sagaActions/wallets';
import {
  ADD_NEW_VAULT,
  ADD_SIGINING_DEVICE,
  FINALISE_VAULT_MIGRATION,
  MIGRATE_VAULT,
} from '../sagaActions/vaults';
import { uaiChecks } from '../sagaActions/uai';
import { updateAppImageWorker, updateVaultImageWorker } from './bhr';
import {
  relayVaultUpdateFail,
  relayVaultUpdateSuccess,
  relayWalletUpdateFail,
  relayWalletUpdateSuccess,
  setRelayVaultUpdateLoading,
  setRelayWalletUpdateLoading,
} from '../reducers/bhr';

export interface NewWalletDetails {
  name?: string;
  description?: string;
  transferPolicy?: number;
}
export interface NewWalletInfo {
  walletType: WalletType;
  walletDetails?: NewWalletDetails;
  importDetails?: {
    primaryMnemonic?: string;
    xpub?: string;
  };
}

function* addNewWallet(
  walletType: WalletType,
  walletDetails: NewWalletDetails,
  app: KeeperApp,
  walletShell: WalletShell,
  importDetails?: { primaryMnemonic?: string; xpub?: string }
) {
  const { primaryMnemonic } = app;
  const { walletInstances } = walletShell;
  const { name: walletName, description: walletDescription, transferPolicy } = walletDetails;

  switch (walletType) {
    case WalletType.CHECKING:
      const checkingWallet: Wallet = yield call(generateWallet, {
        type: WalletType.CHECKING,
        instanceNum: walletInstances[WalletType.CHECKING] || 0,
        walletShellId: walletShell.id,
        walletName: walletName || 'Checking Wallet',
        walletDescription: walletDescription || 'Bitcoin Wallet',
        primaryMnemonic,
        networkType: config.NETWORK_TYPE,
        transferPolicy,
      });
      return checkingWallet;

    case WalletType.LIGHTNING:
      const lnWallet: Wallet = yield call(generateWallet, {
        type: walletType,
        instanceNum: walletInstances[walletType] || 0,
        walletShellId: walletShell.id,
        walletName: walletName || 'Lightning Wallet',
        walletDescription: walletDescription || '',
        primaryMnemonic,
        networkType: config.NETWORK_TYPE,
        transferPolicy,
      });
      return lnWallet;

    case WalletType.IMPORTED:
      const importedWallet: Wallet = yield call(generateWallet, {
        type: WalletType.IMPORTED,
        instanceNum: null, // bip-85 instance number is null for imported wallets
        walletShellId: walletShell.id,
        walletName: walletName || 'Imported Wallet',
        walletDescription: walletDescription || 'Bitcoin Wallet',
        importedMnemonic: importDetails.primaryMnemonic,
        networkType: config.NETWORK_TYPE,
        transferPolicy,
      });
      return importedWallet;

    case WalletType.READ_ONLY:
      const readOnlyWallet: Wallet = yield call(generateWallet, {
        type: WalletType.READ_ONLY,
        instanceNum: null, // bip-85 instance number is null for read-only wallets
        walletShellId: walletShell.id,
        walletName: walletName || 'Read-Only Wallet',
        walletDescription: walletDescription || 'Bitcoin Wallet',
        importedXpub: importDetails.xpub,
        networkType: config.NETWORK_TYPE,
        transferPolicy,
      });
      return readOnlyWallet;

    default:
      throw new Error(`Unsupported wallet-type ${walletType}`);
  }
}

export function* addNewWalletsWorker({ payload: newWalletInfo }: { payload: NewWalletInfo[] }) {
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

export type NewVaultDetails = NewWalletDetails;
export interface NewVaultInfo {
  vaultType: VaultType;
  vaultScheme: VaultScheme;
  vaultSigners: VaultSigner[];
  vaultDetails?: NewVaultDetails;
}

function* addNewVaultWorker({
  payload,
}: {
  payload: {
    newVaultInfo?: NewVaultInfo;
    vault?: Vault;
    isMigrated?: Boolean;
    oldVaultId?: string;
  };
}) {
  try {
    const { newVaultInfo, isMigrated, oldVaultId } = payload;
    let { vault } = payload;
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
    yield put(setRelayVaultUpdateLoading(true));
    const response = isMigrated
      ? yield call(updateVaultImageWorker, { payload: { vault, archiveVaultId: oldVaultId } })
      : yield call(updateVaultImageWorker, { payload: { vault } });

    if (response.updated) {
      yield call(dbManager.createObject, RealmSchema.Vault, vault);
      yield put(uaiChecks([uaiType.SECURE_VAULT]));

      if (isMigrated) {
        yield call(dbManager.updateObjectById, RealmSchema.Vault, oldVaultId, {
          archived: true,
        });
      }

      if (!newVaultShell) {
        const presentVaultInstances = { ...vaultShell.vaultInstances };
        presentVaultInstances[vault.type] = (presentVaultInstances[vault.type] || 0) + 1;
        yield call(dbManager.updateObjectById, RealmSchema.VaultShell, vaultShell.id, {
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
      yield put(vaultCreated({ hasNewVaultGenerationSucceeded: true }));
      yield put(relayVaultUpdateSuccess());
      return true;
    }
    throw new Error('Relay updation failed');
  } catch (err) {
    yield put(
      vaultCreated({
        hasNewVaultGenerationFailed: true,
        hasNewVaultGenerationSucceeded: false,
        error: err.toString(),
      })
    );
    yield put(relayVaultUpdateFail(err));
    return false;
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
  payload: { newVaultData: NewVaultInfo; migrationType: VaultMigrationType };
}) {
  try {
    const { vaultType, vaultScheme, vaultSigners, vaultDetails } = payload.newVaultData;
    const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const { vaultShellInstances } = app;

    if (vaultScheme.n !== vaultSigners.length)
      throw new Error('Vault schema(n) and signers mismatch');

    const vaultShell: VaultShell = yield call(
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
    const migratedVault = yield select((state: RootState) => state.vault.intrimVault);
    const migrated = yield call(addNewVaultWorker, {
      payload: { vault: migratedVault, isMigrated: true, oldVaultId: vaultId },
    });
    if (migrated) {
      yield put(
        vaultMigrationCompleted({
          isMigratingNewVault: false,
          hasMigrationSucceeded: true,
          hasMigrationFailed: false,
          error: null,
        })
      );
      yield put(uaiChecks([uaiType.VAULT_MIGRATION]));
    }
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
    walletDetails?: NewWalletDetails;
  };
}) {
  const wallets: Wallet[] = [];
  const newWalletInfo: NewWalletInfo[] = [
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
  const { wallets } = payload;
  const network = WalletUtilities.getNetworkByType(wallets[0].networkType);

  const { synchedWallets } = yield call(
    WalletOperations.syncWalletsViaElectrumClient,
    wallets,
    network
  );

  return {
    synchedWallets,
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
  const { options } = payload;
  const { synchedWallets }: { synchedWallets: (Wallet | Vault)[] } = yield call(syncWalletsWorker, {
    payload: {
      wallets,
      options,
    },
  });

  for (const synchedWallet of synchedWallets) {
    if (synchedWallet.entityKind === EntityKind.VAULT) {
      yield call(dbManager.updateObjectById, RealmSchema.Vault, synchedWallet.id, {
        specs: synchedWallet.specs,
      });
    } else {
      yield call(dbManager.updateObjectById, RealmSchema.Wallet, synchedWallet.id, {
        specs: synchedWallet.specs,
      });
    }
  }

  const existingWallets: Wallet[] = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.Wallet,
    null,
    true
  );
  // const vaults: Vault[] = yield call(dbManager.getObjectByIndex, RealmSchema.Vault, null, true);

  let netBalance = 0;
  existingWallets.forEach((wallet) => {
    const { confirmed, unconfirmed } = wallet.specs.balances;
    netBalance = netBalance + confirmed + unconfirmed;
  });

  yield put(uaiChecks([uaiType.VAULT_TRANSFER]));
  yield put(setNetBalance(netBalance));
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
      // eslint-disable-next-line no-continue
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

export function* registerWithSigningServerWorker({ payload }: { payload: { policy } }) {
  const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
  if (app.twoFADetails && app.twoFADetails.signingServerXpub)
    throw new Error('registration already in progress');

  const { policy } = payload;
  const {
    setupData,
  }: {
    setupData: {
      verification: SingerVerification;
      bhXpub: string;
      derivationPath: string;
      masterFingerprint: string;
    };
  } = yield call(SigningServer.register, app.id, policy);

  const twoFADetails: TwoFADetails = {
    signingServerXpub: setupData.bhXpub,
    derivationPath: setupData.derivationPath,
    masterFingerprint: setupData.masterFingerprint,
  };

  if (setupData.verification.method === VerificationType.TWO_FA)
    twoFADetails.twoFAKey = setupData.verification.verifier;

  yield call(dbManager.updateObjectById, RealmSchema.KeeperApp, app.id, {
    twoFADetails,
  });
}

export const registerWithSigningServerWatcher = createWatcher(
  registerWithSigningServerWorker,
  REGISTER_WITH_SIGNING_SERVER
);

function* validateSigningServerRegistrationWorker({ payload }: { payload: { verificationToken } }) {
  const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
  const { verificationToken } = payload;
  try {
    const { valid } = yield call(SigningServer.validate, app.id, verificationToken);
    if (valid) {
      yield put(signingServerRegistrationVerified(true));
      const twoFADetails = getJSONFromRealmObject(app.twoFADetails);
      twoFADetails.twoFAValidated = true;
      yield call(dbManager.updateObjectById, RealmSchema.KeeperApp, app.id, {
        twoFADetails,
      });
    } else yield put(signingServerRegistrationVerified(false));
  } catch (error) {
    yield put(signingServerRegistrationVerified(false));
  }
}

export const validateSigningServerRegistrationWatcher = createWatcher(
  validateSigningServerRegistrationWorker,
  VALIDATE_SIGNING_SERVER_REGISTRATION
);

export function* updateSignerPolicyWorker({ payload }: { payload: { signer; updates } }) {
  const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);

  const {
    signer,
    updates,
  }: {
    signer: VaultSigner;
    updates: {
      restrictions?: SignerRestriction;
      exceptions?: SignerException;
    };
  } = payload;
  // TO_DO_VAULT_API
  const { updated } = yield call(SigningServer.updatePolicy, app.id, updates);

  if (!updated) {
    Alert.alert('Failed to update signer policy, try again.');
    throw new Error('Failed to update the policy');
  }

  const defaultVault: Vault = yield call(dbManager.getObjectByIndex, RealmSchema.Vault);
  const signers: VaultSigner[] = getJSONFromRealmObject(defaultVault.signers);
  for (const current of signers) {
    if (current.signerId === signer.signerId) {
      current.signerPolicy = {
        ...current.signerPolicy,
        restrictions: updates.restrictions,
        exceptions: updates.exceptions,
      };
      break;
    }
  }
  yield call(dbManager.updateObjectById, RealmSchema.Vault, defaultVault.id, {
    signers,
  });
}

export const updateSignerPolicyWatcher = createWatcher(
  updateSignerPolicyWorker,
  UPDATE_SIGNER_POLICY
);

function* testcoinsWorker({ payload }) {
  const { wallet } = payload;
  const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(wallet);
  const network = WalletUtilities.getNetworkByType(wallet.networkType);

  const { txid } = yield call(Relay.getTestcoins, receivingAddress, network);

  if (!txid) {
    yield put(setTestCoinsFailed(true));
  } else {
    yield put(setTestCoinsReceived(true));
    yield put(refreshWallets([wallet], { hardRefresh: true }));
  }
}

export const testcoinsWatcher = createWatcher(testcoinsWorker, TEST_SATS_RECIEVE);

function* updateWalletDetailsWorker({ payload }) {
  const {
    wallet,
    details,
  }: {
    wallet: Wallet;
    details: {
      name: string;
      description: string;
    };
  } = payload;
  try {
    const presentationData: WalletPresentationData = {
      name: details.name,
      description: details.description,
      visibility: wallet.presentationData.visibility,
    };
    yield put(setRelayWalletUpdateLoading(true));
    // API-TO-DO: based on response call the DB
    wallet.presentationData = presentationData;
    const response = yield call(updateAppImageWorker, { payload: { walletId: wallet.id } });
    if (response.updated) {
      yield put(relayWalletUpdateSuccess());
      yield call(dbManager.updateObjectById, RealmSchema.Wallet, wallet.id, {
        presentationData,
      });
    } else {
      yield put(relayWalletUpdateFail(response.error));
    }
  } catch (err) {
    yield put(relayWalletUpdateFail('Something went wrong!'));
  }
}

export const updateWalletDetailWatcher = createWatcher(
  updateWalletDetailsWorker,
  UPDATE_WALLET_DETAILS
);

function* updateSignerDetailsWorker({ payload }) {
  const {
    signer,
    key,
    value,
  }: {
    signer: VaultSigner;
    key: string;
    value: any;
  } = payload;
  // TO_DO_VAULT_API
  const activeVault: Vault = dbManager
    .getCollection(RealmSchema.Vault)
    .filter((vault: Vault) => !vault.archived)[0];

  const updatedSigners = activeVault.signers.map((item) => {
    if (item.signerId === signer.signerId) {
      item[key] = value;
      return item;
    }
    return item;
  });

  yield call(dbManager.updateObjectById, RealmSchema.Vault, activeVault.id, {
    signers: updatedSigners,
  });
}

export const updateSignerDetails = createWatcher(updateSignerDetailsWorker, UPDATE_SIGNER_DETAILS);

function* updateWalletsPropertyWorker({ payload }) {
  const {
    wallet,
    key,
    value,
  }: {
    wallet: Wallet;
    key: string;
    value: any;
  } = payload;
  try {
    wallet[key] = value;
    yield put(setRelayWalletUpdateLoading(true));
    const response = yield call(updateAppImageWorker, { payload: { wallet } });
    if (response.updated) {
      yield call(dbManager.updateObjectById, RealmSchema.Wallet, wallet.id, { [key]: value });
      yield put(relayWalletUpdateSuccess());
    } else {
      yield put(relayWalletUpdateFail(response.error));
    }
  } catch (err) {
    yield put(relayWalletUpdateFail('Something went wrong!'));
  }
}
export const updateWalletsPropertyWatcher = createWatcher(
  updateWalletsPropertyWorker,
  UPDATE_WALLET_PROPERTY
);
