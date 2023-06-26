/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-case-declarations */
import {
  DerivationPurpose,
  EntityKind,
  NetworkType,
  VaultMigrationType,
  VaultType,
  VisibilityType,
  WalletType,
} from 'src/core/wallets/enums';
import { SignerException, SignerRestriction } from 'src/core/services/interfaces';
import { Vault, VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import {
  TransferPolicy,
  Wallet,
  WalletImportDetails,
  WalletPresentationData,
  WhirlpoolConfig,
  WalletDerivationDetails,
} from 'src/core/wallets/interfaces/wallet';
import { call, put, select } from 'redux-saga/effects';
import {
  newWalletCreated,
  setNetBalance,
  setSyncing,
  setTestCoinsFailed,
  setTestCoinsReceived,
  signingServerRegistrationVerified,
  walletGenerationFailed,
  setWhirlpoolCreated,
} from 'src/store/reducers/wallets';

import { Alert } from 'react-native';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import Relay from 'src/core/services/operations/Relay';
import SigningServer from 'src/core/services/operations/SigningServer';
import WalletOperations from 'src/core/wallets/operations';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';
import { createWatcher } from 'src/store/utilities';
import dbManager from 'src/storage/realm/dbManager';
import { generateVault } from 'src/core/wallets/factories/VaultFactory';
import { generateWallet, generateWalletSpecs } from 'src/core/wallets/factories/WalletFactory';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import {
  encrypt,
  generateEncryptionKey,
  getRandomBytes,
  generateKey,
  hash256,
} from 'src/core/services/operations/encryption';
import { uaiType } from 'src/common/data/models/interfaces/Uai';
import { UTXOInfo } from 'src/core/wallets/interfaces';
import { captureError } from 'src/core/services/sentry';
import {
  ELECTRUM_NOT_CONNECTED_ERR,
  ELECTRUM_NOT_CONNECTED_ERR_TOR,
} from 'src/core/services/electrum/client';
import { RootState } from '../store';
import {
  addSigningDevice,
  initiateVaultMigration,
  vaultCreated,
  vaultMigrationCompleted,
} from '../reducers/vaults';
import {
  ADD_NEW_WALLETS,
  AUTO_SYNC_WALLETS,
  REFRESH_WALLETS,
  SYNC_WALLETS,
  TEST_SATS_RECIEVE,
  UPDATE_SIGNER_POLICY,
  UPDATE_WALLET_DETAILS,
  UPDATE_WALLET_SETTINGS,
  refreshWallets,
  walletSettingsUpdateFailed,
  walletSettingsUpdated,
  UPDATE_SIGNER_DETAILS,
  UPDATE_WALLET_PROPERTY,
  ADD_WHIRLPOOL_WALLETS,
  ADD_WHIRLPOOL_WALLETS_LOCAL,
  UPDATE_WALLET_PATH_PURPOSE_DETAILS,
  INCREMENT_ADDRESS_INDEX,
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
import { setElectrumNotConnectedErr } from '../reducers/login';

export interface NewVaultDetails {
  name?: string;
  description?: string;
}

export interface DerivationConfig {
  purpose: DerivationPurpose;
  path: string;
}

export interface NewWalletDetails {
  name?: string;
  description?: string;
  derivationConfig?: DerivationConfig;
  transferPolicy?: TransferPolicy;
  instanceNum?: number;
  parentMnemonic?: string;
}

export interface NewWalletInfo {
  walletType: WalletType;
  walletDetails?: NewWalletDetails;
  importDetails?: WalletImportDetails;
}

export function* addWhirlpoolWalletsLocalWorker({
  payload,
}: {
  payload: {
    depositWallet: Wallet;
  };
}) {
  try {
    const { depositWallet } = payload;
    const { instanceNum } = depositWallet.derivationDetails;

    const preMixWalletInfo: NewWalletInfo = {
      walletType: WalletType.PRE_MIX,
      walletDetails: {
        parentMnemonic: depositWallet.derivationDetails.mnemonic,
        instanceNum,
        derivationConfig: {
          purpose: DerivationPurpose.BIP84,
          path: WalletUtilities.getDerivationPath(
            EntityKind.WALLET,
            config.NETWORK_TYPE,
            2147483645
          ),
        },
      },
    };
    const postMixWalletInfo: NewWalletInfo = {
      walletType: WalletType.POST_MIX,
      walletDetails: {
        parentMnemonic: depositWallet.derivationDetails.mnemonic,
        instanceNum,
        derivationConfig: {
          purpose: DerivationPurpose.BIP84,
          path: WalletUtilities.getDerivationPath(
            EntityKind.WALLET,
            config.NETWORK_TYPE,
            2147483646
          ),
        },
      },
    };
    const badBankWalletInfo: NewWalletInfo = {
      walletType: WalletType.BAD_BANK,
      walletDetails: {
        parentMnemonic: depositWallet.derivationDetails.mnemonic,
        instanceNum,
        derivationConfig: {
          purpose: DerivationPurpose.BIP84,
          path: WalletUtilities.getDerivationPath(
            EntityKind.WALLET,
            config.NETWORK_TYPE,
            2147483644
          ),
        },
      },
    };

    const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const newWalletsInfo: NewWalletInfo[] = [
      preMixWalletInfo,
      postMixWalletInfo,
      badBankWalletInfo,
    ];

    const wallets = [];
    for (const { walletType, walletDetails, importDetails } of newWalletsInfo) {
      const wallet: Wallet = yield call(
        addNewWallet,
        walletType,
        walletDetails,
        app,
        importDetails
      );
      wallets.push(wallet);
    }
  } catch (err) {
    console.log('Error in Whirlpool Wallets generations:', err);
  }
}

export const addWhirlpoolWalletsLocalWatcher = createWatcher(
  addWhirlpoolWalletsLocalWorker,
  ADD_WHIRLPOOL_WALLETS_LOCAL
);

export function* addWhirlpoolWalletsWorker({
  payload,
}: {
  payload: {
    depositWallet: Wallet;
  };
}) {
  try {
    const { depositWallet } = payload;
    const { instanceNum } = depositWallet.derivationDetails;

    const preMixWalletInfo: NewWalletInfo = {
      walletType: WalletType.PRE_MIX,
      walletDetails: {
        parentMnemonic: depositWallet.derivationDetails.mnemonic,
        instanceNum,
        derivationConfig: {
          purpose: DerivationPurpose.BIP84,
          path: WalletUtilities.getDerivationPath(
            EntityKind.WALLET,
            config.NETWORK_TYPE,
            2147483645
          ),
        },
      },
    };
    const postMixWalletInfo: NewWalletInfo = {
      walletType: WalletType.POST_MIX,
      walletDetails: {
        parentMnemonic: depositWallet.derivationDetails.mnemonic,
        instanceNum,
        derivationConfig: {
          purpose: DerivationPurpose.BIP84,
          path: WalletUtilities.getDerivationPath(
            EntityKind.WALLET,
            config.NETWORK_TYPE,
            2147483646
          ),
        },
      },
    };
    const badBankWalletInfo: NewWalletInfo = {
      walletType: WalletType.BAD_BANK,
      walletDetails: {
        parentMnemonic: depositWallet.derivationDetails.mnemonic,
        instanceNum,
        derivationConfig: {
          purpose: DerivationPurpose.BIP84,
          path: WalletUtilities.getDerivationPath(
            EntityKind.WALLET,
            config.NETWORK_TYPE,
            2147483644
          ),
        },
      },
    };

    const whirlpoolConfig: WhirlpoolConfig = {
      whirlpoolWalletDetails: [
        {
          walletId: hash256(`${depositWallet.id}${WalletType.PRE_MIX}`),
          walletType: WalletType.PRE_MIX,
        },
        {
          walletId: hash256(`${depositWallet.id}${WalletType.POST_MIX}`),
          walletType: WalletType.POST_MIX,
        },
        {
          walletId: hash256(`${depositWallet.id}${WalletType.BAD_BANK}`),
          walletType: WalletType.BAD_BANK,
        },
      ],
    };

    yield call(updateWalletsPropertyWorker, {
      payload: { wallet: depositWallet, key: 'whirlpoolConfig', value: whirlpoolConfig },
    });
    const newWalletsInfo: NewWalletInfo[] = [
      preMixWalletInfo,
      postMixWalletInfo,
      badBankWalletInfo,
    ];
    const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const wallets = [];
    for (const { walletType, walletDetails, importDetails } of newWalletsInfo) {
      const wallet: Wallet = yield call(
        addNewWallet,
        walletType,
        walletDetails,
        app,
        importDetails
      );
      wallets.push(wallet);
    }
    yield call(dbManager.createObjectBulk, RealmSchema.Wallet, wallets);
    yield put(setWhirlpoolCreated(true));
  } catch (err) {
    console.log(err);
  }
}

export const addWhirlpoolWalletsWatcher = createWatcher(
  addWhirlpoolWalletsWorker,
  ADD_WHIRLPOOL_WALLETS
);

function* addNewWallet(
  walletType: WalletType,
  walletDetails: NewWalletDetails,
  app: KeeperApp,
  importDetails?: WalletImportDetails
) {
  const { primaryMnemonic } = app;
  const {
    name: walletName,
    description: walletDescription,
    derivationConfig,
    transferPolicy,
    instanceNum,
    parentMnemonic,
  } = walletDetails;
  const wallets: Wallet[] = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.Wallet,
    null,
    true
  ) || [];

  switch (walletType) {
    case WalletType.DEFAULT:
      const defaultWalletInstacnes = wallets.filter(
        (wallet) => wallet.type === WalletType.DEFAULT
      ).length;

      const defaultWallet: Wallet = yield call(generateWallet, {
        type: WalletType.DEFAULT,
        instanceNum: defaultWalletInstacnes, // zero-indexed
        walletName: walletName || 'Default Wallet',
        walletDescription: walletDescription || 'Bitcoin Wallet',
        derivationConfig,
        primaryMnemonic,
        networkType: config.NETWORK_TYPE,
        transferPolicy,
      });
      return defaultWallet;

    case WalletType.IMPORTED:
      const importedWallet: Wallet = yield call(generateWallet, {
        type: WalletType.IMPORTED,
        instanceNum: null, // bip-85 instance number is null for imported wallets
        walletName: walletName || 'Imported Wallet',
        walletDescription: walletDescription || 'Bitcoin Wallet',
        importDetails,
        networkType: config.NETWORK_TYPE,
        transferPolicy,
      });
      return importedWallet;

    // Whirpool wallet types premix,postmix, badbank
    case WalletType.PRE_MIX:
      const preMixWallet: Wallet = yield call(generateWallet, {
        type: WalletType.PRE_MIX,
        instanceNum, // deposit account's index
        walletName: 'Pre mix Wallet',
        walletDescription: 'Bitcoin Wallet',
        derivationConfig,
        networkType: config.NETWORK_TYPE,
        parentMnemonic,
      });
      return preMixWallet;

    case WalletType.POST_MIX:
      const postMixWallet: Wallet = yield call(generateWallet, {
        type: WalletType.POST_MIX,
        instanceNum, // deposit account's index
        walletName: 'Post mix Wallet',
        walletDescription: 'Bitcoin Wallet',
        derivationConfig,
        networkType: config.NETWORK_TYPE,
        parentMnemonic,
      });
      return postMixWallet;

    case WalletType.BAD_BANK:
      const badBankWallet: Wallet = yield call(generateWallet, {
        type: WalletType.BAD_BANK,
        instanceNum, // deposit account's index
        walletName: 'Bad Bank Wallet',
        walletDescription: 'Bitcoin Wallet',
        derivationConfig,
        networkType: config.NETWORK_TYPE,
        parentMnemonic,
      });
      return badBankWallet;

    default:
      throw new Error(`Unsupported wallet-type ${walletType}`);
  }
}

export function* addNewWalletsWorker({ payload: newWalletInfo }: { payload: NewWalletInfo[] }) {
  try {
    const wallets: Wallet[] = [];
    const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);

    for (const { walletType, walletDetails, importDetails } of newWalletInfo) {
      const wallet: Wallet = yield call(
        addNewWallet,
        walletType,
        walletDetails,
        app,
        importDetails
      );
      wallets.push(wallet);
    }

    if (wallets.length > 0) {
      yield put(setRelayWalletUpdateLoading(true));
      const response = yield call(updateAppImageWorker, { payload: { wallets } });
      if (response.updated) {
        yield put(relayWalletUpdateSuccess());
        yield call(dbManager.createObjectBulk, RealmSchema.Wallet, wallets);
        return true;
      }
      yield put(relayWalletUpdateFail(response.error));
      return false;
    }
    for (const wallet of wallets) {
      yield put(setRelayWalletUpdateLoading(true));
      const response = yield call(updateAppImageWorker, { payload: { wallets: [wallet] } });
      if (response.updated) {
        yield put(relayWalletUpdateSuccess());
        yield call(dbManager.createObject, RealmSchema.Wallet, wallet);

        if (wallet.type === WalletType.IMPORTED) {
          yield put(
            refreshWallets([wallet], {
              hardRefresh: true,
            })
          );
        }
      } else {
        yield put(walletGenerationFailed(response.error));
        yield put(relayWalletUpdateFail(response.error));
      }
      yield put(relayWalletUpdateFail(response.error));
      return false;
    }
  } catch (err) {
    console.log(err);
    yield put(relayWalletUpdateFail(''));
    return false;
  }
}

export const addNewWalletsWatcher = createWatcher(addNewWalletsWorker, ADD_NEW_WALLETS);

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
    isMigrated?: boolean;
    oldVaultId?: string;
  };
}) {
  try {
    const { newVaultInfo, isMigrated, oldVaultId } = payload;
    let { vault } = payload;

    // When the vault is passed directly during upgrade/downgrade process
    if (!vault) {
      const { vaultType, vaultScheme, vaultSigners, vaultDetails } = newVaultInfo;
      if (vaultScheme.n !== vaultSigners.length)
        throw new Error('Vault schema(n) and signers mismatch');

      const tempShellId = yield select((state: RootState) => state.vault.tempShellId);
      const vaultShellId = tempShellId || generateKey(12);

      const networkType = config.NETWORK_TYPE;
      vault = yield call(generateVault, {
        type: vaultType,
        vaultName: vaultDetails.name,
        vaultDescription: vaultDetails.description,
        scheme: vaultScheme,
        signers: vaultSigners,
        networkType,
        vaultShellId,
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
  payload: { newVaultData: NewVaultInfo; migrationType: VaultMigrationType; vaultShellId: string };
}) {
  try {
    const { vaultType, vaultScheme, vaultSigners, vaultDetails } = payload.newVaultData;
    const { vaultShellId } = payload;

    if (vaultScheme.n !== vaultSigners.length)
      throw new Error('Vault schema(n) and signers mismatch');

    const networkType = config.NETWORK_TYPE;

    const vault: Vault = yield call(generateVault, {
      type: vaultType,
      vaultName: vaultDetails.name,
      vaultDescription: vaultDetails.description,
      scheme: vaultScheme,
      signers: vaultSigners,
      networkType,
      vaultShellId,
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

  const { synchedWallets }: { synchedWallets: (Wallet | Vault)[] } = yield call(
    WalletOperations.syncWalletsViaElectrumClient,
    wallets,
    network
  );
  const UTXOInfos: UTXOInfo[] = [];
  for (const wallet of synchedWallets) {
    const allUTXOs = wallet.specs.confirmedUTXOs.concat(wallet.specs.unconfirmedUTXOs);
    for (const utxo of allUTXOs) {
      const utxoId = `${utxo.txId}${utxo.vout}`;
      const utxoInfo: UTXOInfo = {
        id: utxoId,
        txId: utxo.txId,
        vout: utxo.vout,
        walletId: wallet.id,
      };
      UTXOInfos.push(utxoInfo);
    }
  }
  const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
  yield call(Relay.addUTXOinfos, app.id, UTXOInfos);
  dbManager.createObjectBulk(RealmSchema.UTXOInfo, UTXOInfos);
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
  const { wallets, options } = payload;
  try {
    yield put(setSyncing({ wallets, isSyncing: true }));
    const { synchedWallets }: { synchedWallets: (Wallet | Vault)[] } = yield call(
      syncWalletsWorker,
      {
        payload: {
          wallets,
          options,
        },
      }
    );
    for (const synchedWallet of synchedWallets) {
      if (!synchedWallet.specs.hasNewUpdates) continue; // no new updates found

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
  } catch (err) {
    if ([ELECTRUM_NOT_CONNECTED_ERR, ELECTRUM_NOT_CONNECTED_ERR_TOR].includes(err?.message))
      yield put(setElectrumNotConnectedErr(err?.message));
    else captureError(err);
  } finally {
    yield put(setSyncing({ wallets, isSyncing: false }));
  }
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

function* addressIndexIncrementWorker({
  payload,
}: {
  payload: {
    wallet: Wallet | Vault;
    options: {
      external?: { incrementBy: number };
      internal?: { incrementBy: number };
    };
  };
}) {
  // increments the address index(external/internal chain)
  // usage: resolves the address reuse issues(during whirlpool) due to a slight delay in fetching updates from Fulcrum
  const { wallet } = payload;
  const { external, internal } = payload.options;

  if (external) {
    wallet.specs.nextFreeAddressIndex += external.incrementBy;
    wallet.specs.receivingAddress = WalletOperations.getNextFreeExternalAddress({
      entity: wallet.entityKind,
      isMultiSig: (wallet as Vault).isMultiSig,
      specs: wallet.specs,
      networkType: wallet.networkType,
      scheme: (wallet as Vault).scheme,
      derivationPath: (wallet as Wallet)?.derivationDetails?.xDerivationPath,
    }).receivingAddress;
  }

  if (internal) wallet.specs.nextFreeChangeAddressIndex += internal.incrementBy;

  if (wallet.entityKind === EntityKind.VAULT) {
    yield call(dbManager.updateObjectById, RealmSchema.Vault, wallet.id, {
      specs: wallet.specs,
    });
  } else {
    yield call(dbManager.updateObjectById, RealmSchema.Wallet, wallet.id, {
      specs: wallet.specs,
    });
  }
}

export const addressIndexIncrementWatcher = createWatcher(
  addressIndexIncrementWorker,
  INCREMENT_ADDRESS_INDEX
);

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

export function* updateSignerPolicyWorker({ payload }: { payload: { signer; updates } }) {
  const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
  const vaults: Vault[] = yield call(dbManager.getCollection, RealmSchema.Vault);
  const activeVault: Vault = vaults.filter((vault) => !vault.archived)[0] || null;

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
  const vaultId = activeVault.shellId;
  const appId = app.id;
  const { updated } = yield call(SigningServer.updatePolicy, vaultId, appId, updates);
  if (!updated) {
    Alert.alert('Failed to update signer policy, try again.');
    throw new Error('Failed to update the policy');
  }

  const { signers } = activeVault;
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
  yield call(dbManager.updateObjectById, RealmSchema.Vault, activeVault.id, {
    signers,
  });
}

export const updateSignerPolicyWatcher = createWatcher(
  updateSignerPolicyWorker,
  UPDATE_SIGNER_POLICY
);

function* testcoinsWorker({ payload }) {
  const { wallet } = payload;
  const receivingAddress = WalletOperations.getNextFreeAddress(wallet);
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
      shell: wallet.presentationData.shell,
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

function* updateWalletPathAndPuposeDetailsWorker({ payload }) {
  const {
    wallet,
    details,
  }: {
    wallet: Wallet;
    details: {
      path: string;
      purpose: string;
    };
  } = payload;
  try {
    const derivationDetails: WalletDerivationDetails = {
      ...wallet.derivationDetails,
      xDerivationPath: details.path,
    };
    const specs = generateWalletSpecs(
      derivationDetails.mnemonic,
      WalletUtilities.getNetworkByType(wallet.networkType),
      derivationDetails.xDerivationPath
    ); // recreate the specs

    yield put(setRelayWalletUpdateLoading(true));
    // API-TO-DO: based on response call the DB
    wallet.derivationDetails = derivationDetails;
    wallet.specs = specs;

    const response = yield call(updateAppImageWorker, { payload: { walletId: wallet.id } });
    if (response.updated) {
      yield put(relayWalletUpdateSuccess());
      yield call(dbManager.updateObjectById, RealmSchema.Wallet, wallet.id, {
        derivationDetails,
        specs,
      });
    } else {
      yield put(relayWalletUpdateFail(response.error));
    }
  } catch (err) {
    yield put(relayWalletUpdateFail('Something went wrong!'));
  }
}
export const updateWalletPathAndPuposeDetailWatcher = createWatcher(
  updateWalletPathAndPuposeDetailsWorker,
  UPDATE_WALLET_PATH_PURPOSE_DETAILS
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

function* updateWalletsPropertyWorker({
  payload,
}: {
  payload: {
    wallet: Wallet;
    key: string;
    value: any;
  };
}) {
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
    const response = yield call(updateAppImageWorker, { payload: { wallets: [wallet] } });
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
