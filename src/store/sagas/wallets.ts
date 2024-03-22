/* eslint-disable no-continue */

/* eslint-disable no-case-declarations */
import {
  DerivationPurpose,
  EntityKind,
  SignerType,
  VaultType,
  VisibilityType,
  WalletType,
  XpubTypes,
} from 'src/services/wallets/enums';
import {
  InheritanceConfiguration,
  InheritanceKeyInfo,
  InheritancePolicy,
  SignerException,
  SignerRestriction,
} from 'src/models/interfaces/AssistedKeys';
import {
  Signer,
  Vault,
  VaultPresentationData,
  VaultScheme,
  VaultSigner,
} from 'src/services/wallets/interfaces/vault';
import {
  TransferPolicy,
  Wallet,
  WalletImportDetails,
  WalletPresentationData,
  WhirlpoolConfig,
  WalletDerivationDetails,
} from 'src/services/wallets/interfaces/wallet';
import { call, put, select } from 'redux-saga/effects';
import {
  setNetBalance,
  setSyncing,
  setTestCoinsFailed,
  setTestCoinsReceived,
  walletGenerationFailed,
  setWhirlpoolCreated,
} from 'src/store/reducers/wallets';

import { Alert } from 'react-native';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import Relay from 'src/services/backend/Relay';
import SigningServer from 'src/services/backend/SigningServer';
import WalletOperations from 'src/services/wallets/operations';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/service-utilities/config';
import { createWatcher } from 'src/store/utilities';
import dbManager from 'src/storage/realm/dbManager';
import { generateVault } from 'src/services/wallets/factories/VaultFactory';
import {
  generateWallet,
  generateWalletSpecsFromMnemonic,
} from 'src/services/wallets/factories/WalletFactory';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { generateKey, hash256 } from 'src/utils/service-utilities/encryption';
import { uaiType } from 'src/models/interfaces/Uai';
import { captureError } from 'src/services/sentry';
import ElectrumClient, {
  ELECTRUM_CLIENT,
  ELECTRUM_NOT_CONNECTED_ERR,
  ELECTRUM_NOT_CONNECTED_ERR_TOR,
} from 'src/services/electrum/client';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import { genrateOutputDescriptors } from 'src/utils/service-utilities/utils';
import idx from 'idx';
import _ from 'lodash';
import { RootState } from '../store';
import { initiateVaultMigration, vaultCreated, vaultMigrationCompleted } from '../reducers/vaults';
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
  UPDATE_KEY_DETAILS,
  UPDATE_VAULT_DETAILS,
} from '../sagaActions/wallets';
import {
  ADD_NEW_VAULT,
  ADD_SIGINING_DEVICE,
  DELETE_SIGINING_DEVICE,
  DELETE_VAULT,
  FINALISE_VAULT_MIGRATION,
  MIGRATE_VAULT,
} from '../sagaActions/vaults';
import { uaiChecks } from '../sagaActions/uai';
import {
  deleteAppImageEntityWorker,
  deleteVaultImageWorker,
  updateAppImageWorker,
  updateVaultImageWorker,
} from './bhr';
import {
  relaySignersUpdateFail,
  relaySignersUpdateSuccess,
  relayVaultUpdateFail,
  relayVaultUpdateSuccess,
  relayWalletUpdateFail,
  relayWalletUpdateSuccess,
  setRelaySignersUpdateLoading,
  setRelayVaultUpdateLoading,
  setRelayWalletUpdateLoading,
} from '../reducers/bhr';
import { setElectrumNotConnectedErr } from '../reducers/login';
import { connectToNodeWorker } from './network';
import { getSignerDescription } from 'src/hardware';

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
      payload: { walletId: depositWallet.id, key: 'whirlpoolConfig', value: whirlpoolConfig },
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
        walletDescription: walletDescription || '',
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
        walletDescription: walletDescription || '',
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
        walletDescription: '',
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
        walletDescription: '',
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
        walletDescription: '',
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

export function* addNewVaultWorker({
  payload,
}: {
  payload: {
    newVaultInfo?: NewVaultInfo;
    vault?: Vault;
    isMigrated?: boolean;
    oldVaultId?: string;
    isRecreation?: boolean;
  };
}) {
  try {
    const { newVaultInfo, isMigrated, oldVaultId, isRecreation = false } = payload;
    let { vault } = payload;
    const signerMap = {};
    const signingDevices: Signer[] = yield call(dbManager.getCollection, RealmSchema.Signer);
    signingDevices.forEach((signer) => (signerMap[signer.masterFingerprint as string] = signer));

    let isNewVault = false;
    // When the vault is passed directly during upgrade/downgrade process
    if (!vault) {
      const {
        vaultType = VaultType.DEFAULT,
        vaultScheme,
        vaultSigners,
        vaultDetails,
      } = newVaultInfo;

      if (vaultScheme.n !== vaultSigners.length) {
        throw new Error('Vault schema(n) and signers mismatch');
      }

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
        signerMap,
      });
      isNewVault = true;
    }

    if (isNewVault || isMigrated) {
      // update IKS, if inheritance key has been added(new Vault) or needs an update(vault migration)
      const [ikVaultKey] = vault.signers.filter(
        (vaultKey) => signerMap[vaultKey.masterFingerprint]?.type === SignerType.INHERITANCEKEY
      );
      if (ikVaultKey) {
        const ikSigner: Signer = signerMap[ikVaultKey.masterFingerprint];
        yield call(finaliseIKSetupWorker, { payload: { ikSigner, ikVaultKey, vault } });
      }
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

function* addSigningDeviceWorker({ payload: { signers } }: { payload: { signers: Signer[] } }) {
  if (!signers.length) return;

  try {
    const existingSigners: Signer[] = yield call(dbManager.getCollection, RealmSchema.Signer);
    const signerMap = Object.fromEntries(
      existingSigners.map((signer) => [signer.masterFingerprint, signer])
    );
    const signersToUpdate = [];

    try {
      // update signers with signer count
      let incrementForCurrentSigners = 0;
      signers = signers.map((signer) => {
        if (signer.type === SignerType.MY_KEEPER) {
          const myAppKeys = existingSigners.filter((s) => s.type === SignerType.MY_KEEPER);
          const currentInstanceNumber = WalletUtilities.getInstanceNumberForSigners(myAppKeys);
          const instanceNumberToSet = currentInstanceNumber + incrementForCurrentSigners;
          signer.extraData = { instanceNumber: instanceNumberToSet + 1 };
          signer.signerDescription = getSignerDescription(signer.type, instanceNumberToSet + 1);
          incrementForCurrentSigners += 1;
          return signer;
        } else {
          return signer;
        }
      });
    } catch (e) {
      captureError(e);
      return;
    }

    const keysMatch = (type, newSigner, existingSigner) =>
      !!newSigner.signerXpubs[type]?.[0] &&
      !!existingSigner.signerXpubs[type]?.[0] &&
      newSigner.signerXpubs[type]?.[0]?.xpub === existingSigner.signerXpubs[type]?.[0]?.xpub;

    const keysDifferent = (type, newSigner, existingSigner) =>
      !!newSigner.signerXpubs[type]?.[0] &&
      !!existingSigner.signerXpubs[type]?.[0] &&
      newSigner.signerXpubs[type][0].xpub !== existingSigner.signerXpubs[type][0].xpub;

    for (const newSigner of signers) {
      const existingSigner = signerMap[newSigner.masterFingerprint];
      if (!existingSigner) {
        signersToUpdate.push(newSigner);
        continue;
      }

      const singleSigMatch = keysMatch(XpubTypes.P2WPKH, newSigner, existingSigner);
      const multiSigMatch = keysMatch(XpubTypes.P2WSH, newSigner, existingSigner);

      // if the new signer has the same xpubs as the existing signer, then update the type and xpubs
      if (singleSigMatch || multiSigMatch) {
        signersToUpdate.push({
          ...existingSigner,
          type:
            existingSigner.type === SignerType.UNKOWN_SIGNER ? newSigner.type : existingSigner.type,
          signerXpubs: _.merge(existingSigner.signerXpubs, newSigner.signerXpubs),
        });
        continue;
      }

      const singleSigDifferent = keysDifferent(XpubTypes.P2WPKH, newSigner, existingSigner);
      const multiSigDifferent = keysDifferent(XpubTypes.P2WSH, newSigner, existingSigner);

      // if the new signer has multiple accounts of the same type, then let the user know and skip the update
      if (singleSigDifferent || multiSigDifferent) {
        yield put(
          relaySignersUpdateFail(
            `A different account has already been added. Please use the existing key for the signer ${newSigner.masterFingerprint}`
          )
        );
        continue;
      }
    }
    if (signersToUpdate.length) {
      yield put(setRelaySignersUpdateLoading(true));
      const response = yield call(updateAppImageWorker, { payload: { signers: signersToUpdate } });
      if (response.updated) {
        dbManager.createObjectBulk(RealmSchema.Signer, signersToUpdate, Realm.UpdateMode.Modified);
      } else {
        yield put(relaySignersUpdateFail(response.error));
      }
    }
  } catch (error) {
    captureError(error);
    yield put(relaySignersUpdateFail('An error occurred while updating signers.'));
  }
}

export const addSigningDeviceWatcher = createWatcher(addSigningDeviceWorker, ADD_SIGINING_DEVICE);

function* deleteSigningDeviceWorker({ payload: { signers } }: { payload: { signers: Signer[] } }) {
  try {
    const existingSigners: Signer[] = yield call(dbManager.getCollection, RealmSchema.Signer);
    const signerMap = Object.fromEntries(
      existingSigners.map((signer) => [signer.masterFingerprint, signer])
    );
    const signersToDelete = [];

    for (const signer of signers) {
      const existingSigner = signerMap[signer.masterFingerprint];
      if (!existingSigner) {
        continue;
      }
      signersToDelete.push(signer);
    }

    let signersToDeleteIds = [];
    for (const signer of signersToDelete) {
      signersToDeleteIds.push(signer.masterFingerprint);
    }

    if (signersToDelete.length) {
      yield put(setRelaySignersUpdateLoading(true));
      const response = yield call(deleteAppImageEntityWorker, {
        payload: { signerIds: signersToDeleteIds },
      });
      if (response.updated) {
        for (const signer of signersToDelete) {
          yield call(
            dbManager.deleteObjectByPrimaryKey,
            RealmSchema.Signer,
            'masterFingerprint',
            signer.masterFingerprint
          );
        }
      } else {
        yield put(relaySignersUpdateFail(response.error));
      }
    }
  } catch (error) {
    captureError(error);
    yield put(relaySignersUpdateFail('An error occurred while deleting signers.'));
  }
}

export const deleteSigningDeviceWatcher = createWatcher(
  deleteSigningDeviceWorker,
  DELETE_SIGINING_DEVICE
);

function* migrateVaultWorker({
  payload,
}: {
  payload: { newVaultData: NewVaultInfo; vaultShellId: string };
}) {
  try {
    const {
      vaultType = VaultType.DEFAULT,
      vaultScheme,
      vaultSigners,
      vaultDetails,
    } = payload.newVaultData;
    const { vaultShellId } = payload;

    if (vaultScheme.n !== vaultSigners.length) {
      throw new Error('Vault schema(n) and signers mismatch');
    }

    const networkType = config.NETWORK_TYPE;

    const signerMap = {};
    const signingDevices: Signer[] = yield call(dbManager.getCollection, RealmSchema.Signer);
    signingDevices.forEach((signer) => (signerMap[signer.masterFingerprint as string] = signer));

    const vault: Vault = yield call(generateVault, {
      type: vaultType,
      vaultName: vaultDetails.name,
      vaultDescription: vaultDetails.description,
      scheme: vaultScheme,
      signers: vaultSigners,
      networkType,
      vaultShellId,
      signerMap,
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

function* finaliseIKSetupWorker({
  payload,
}: {
  payload: { ikSigner: Signer; ikVaultKey: VaultSigner; vault: Vault };
}) {
  // finalise the IK setup
  const { ikSigner, ikVaultKey, vault } = payload; // vault here is the new vault
  const backupBSMSForIKS = yield select((state: RootState) => state.vault.backupBSMSForIKS);
  let updatedInheritanceKeyInfo: InheritanceKeyInfo = null;

  if (ikSigner.inheritanceKeyInfo) {
    // case I: updating config for this new vault which already had IKS as one of its signers
    // case II: updating config for the first time for a recovered IKS(doesn't belong to a vault yet on this device)
    let existingConfiguration: InheritanceConfiguration = idx(
      // thresholds are constructed using an already existing configuration for IKS
      ikSigner,
      (_) => _.inheritanceKeyInfo.configurations[0]
    );

    const newIKSConfiguration: InheritanceConfiguration = yield call(
      InheritanceKeyServer.generateInheritanceConfiguration,
      vault,
      backupBSMSForIKS
    );

    if (!existingConfiguration) {
      // note: a pre-present inheritanceKeyInfo w/ an empty configurations array is also used as a key to identify that it is a recovered inheritance key
      const restoredIKSConfigLength = idx(
        ikSigner,
        (_) => _.inheritanceKeyInfo.configurations.length
      ); // will be undefined if this is not a restored IKS(which is an error case)
      if (restoredIKSConfigLength === 0) {
        // case II: recovered IKS synching for the first time
        existingConfiguration = newIKSConfiguration; // as two signer fingerprints(at least) are required to fetch IKS, the new config will indeed contain a registered threshold number of signer fingerprints to pass validation on the backend and therefore can be taken as the existing configuration
      } else throw new Error('Failed to find the existing configuration for IKS');
    }

    const { updated } = yield call(
      InheritanceKeyServer.updateInheritanceConfig,
      ikVaultKey.xfp,
      existingConfiguration,
      newIKSConfiguration
    );

    if (updated) {
      updatedInheritanceKeyInfo = {
        ...ikSigner.inheritanceKeyInfo,
        configurations: [...ikSigner.inheritanceKeyInfo.configurations, newIKSConfiguration],
      };
    } else throw new Error('Failed to update the inheritance key configuration');
  } else {
    // case: setting up a vault w/ IKS for the first time
    const config: InheritanceConfiguration = yield call(
      InheritanceKeyServer.generateInheritanceConfiguration,
      vault,
      backupBSMSForIKS
    );

    const fcmToken = yield select((state: RootState) => state.notifications.fcmToken);
    const policy: InheritancePolicy = {
      notification: { targets: [fcmToken] },
    };

    const { setupSuccessful } = yield call(
      InheritanceKeyServer.finalizeIKSetup,
      ikVaultKey.xfp,
      config,
      policy
    );

    if (setupSuccessful) {
      updatedInheritanceKeyInfo = {
        configurations: [config],
        policy,
      };
    } else throw new Error('Failed to finalise the inheritance key setup');
  }

  if (updatedInheritanceKeyInfo) {
    // send updates to realm
    yield call(
      dbManager.updateObjectByPrimaryId,
      RealmSchema.Signer,
      'masterFingerprint',
      ikSigner.masterFingerprint,
      {
        inheritanceKeyInfo: updatedInheritanceKeyInfo,
      }
    );
  }
}

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
    if (!ELECTRUM_CLIENT.isClientConnected) {
      ElectrumClient.resetCurrentPeerIndex();
      yield call(connectToNodeWorker);
    }

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
      // if (!synchedWallet.specs.hasNewUpdates) continue; // no new updates found

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
      if (wallet.presentationData.visibility !== VisibilityType.HIDDEN) {
        const { confirmed, unconfirmed } = wallet.specs.balances;
        netBalance = netBalance + confirmed + unconfirmed;
      }
    });

    yield put(uaiChecks([uaiType.VAULT_TRANSFER]));
    yield put(setNetBalance(netBalance));
  } catch (err) {
    if ([ELECTRUM_NOT_CONNECTED_ERR, ELECTRUM_NOT_CONNECTED_ERR_TOR].includes(err?.message)) {
      yield put(
        setElectrumNotConnectedErr(
          'Network error: please check your network/ node connection and try again'
        )
      );
    } else captureError(err);
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

export function* updateSignerPolicyWorker({
  payload,
}: {
  payload: { signer; signingKey; updates; verificationToken };
}) {
  const vaults: Vault[] = yield call(dbManager.getCollection, RealmSchema.Vault);
  const activeVault: Vault = vaults.filter((vault) => !vault.archived)[0] || null;

  const {
    signer,
    signingKey,
    updates,
    verificationToken,
  }: {
    signer: Signer;
    signingKey: VaultSigner;
    updates: {
      restrictions?: SignerRestriction;
      exceptions?: SignerException;
    };
    verificationToken;
  } = payload;
  const { updated } = yield call(
    SigningServer.updatePolicy,
    signingKey.xfp,
    verificationToken,
    updates
  );
  if (!updated) {
    Alert.alert('Failed to update signer policy, try again.');
    throw new Error('Failed to update the policy');
  }

  const { signers } = activeVault;
  for (const current of signers) {
    if (current.xfp === signingKey.xfp) {
      const updatedSignerPolicy = {
        ...signer.signerPolicy,
        restrictions: updates.restrictions,
        exceptions: updates.exceptions,
      };

      yield call(
        dbManager.updateObjectByPrimaryId,
        RealmSchema.Signer,
        'masterFingerprint',
        signer.masterFingerprint,
        {
          signerPolicy: updatedSignerPolicy,
        }
      );
      break;
    }
  }
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
    // API-TODO: based on response call the DB
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

function* updateVaultDetailsWorker({ payload }) {
  const {
    vault,
    details,
  }: {
    vault: Vault;
    details: {
      name: string;
      description: string;
    };
  } = payload;
  try {
    const presentationData: VaultPresentationData = {
      name: details.name,
      description: details.description,
      visibility: vault.presentationData.visibility,
      shell: vault.presentationData.shell,
    };
    yield put(setRelayVaultUpdateLoading(true));
    // API-TODO: based on response call the DB
    vault.presentationData = presentationData;

    console.log(vault.presentationData);
    const response = yield call(updateVaultImageWorker, {
      payload: { vault },
    });
    if (response.updated) {
      yield put(relayVaultUpdateSuccess());
      yield call(dbManager.updateObjectById, RealmSchema.Vault, vault.id, {
        presentationData,
      });
    } else {
      yield put(relayVaultUpdateFail(response.error));
    }
  } catch (err) {
    console.log('err', err);
    yield put(relayVaultUpdateFail('Something went wrong!'));
  }
}

export const updateVaultDetailsWatcher = createWatcher(
  updateVaultDetailsWorker,
  UPDATE_VAULT_DETAILS
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
    const specs = generateWalletSpecsFromMnemonic(
      derivationDetails.mnemonic,
      WalletUtilities.getNetworkByType(wallet.networkType),
      derivationDetails.xDerivationPath
    ); // recreate the specs

    yield put(setRelayWalletUpdateLoading(true));
    // API-TODO: based on response call the DB
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

export function* updateSignerDetailsWorker({ payload }) {
  const {
    signer,
    key,
    value,
  }: {
    signer: Signer;
    key: string;
    value: any;
  } = payload;

  yield put(setRelaySignersUpdateLoading(true));
  try {
    const response = yield call(updateAppImageWorker, { payload: { signers: [signer] } });
    if (response.updated) {
      yield call(
        dbManager.updateObjectByPrimaryId,
        RealmSchema.Signer,
        'masterFingerprint',
        signer.masterFingerprint,
        {
          [key]: value,
        }
      );
      yield put(relaySignersUpdateSuccess());
    } else {
      yield put(relaySignersUpdateFail(response.error));
    }
  } catch (err) {
    console.error(err);
    yield put(relaySignersUpdateFail('Something went wrong'));
  }
}

export const updateSignerDetails = createWatcher(updateSignerDetailsWorker, UPDATE_SIGNER_DETAILS);

function* updateKeyDetailsWorker({ payload }) {
  const {
    signer,
    key,
    value,
  }: {
    signer: VaultSigner;
    key: string;
    value: any;
  } = payload;

  const vaultSigner = dbManager.getObjectByPrimaryId(RealmSchema.VaultSigner, 'xpub', signer.xpub);
  const vaultSignerJSON: VaultSigner = vaultSigner.toJSON();
  if (key === 'registered') {
    let updatedFlag = false;
    const updatedRegsteredVaults = vaultSignerJSON.registeredVaults.map((info) => {
      if (info.vaultId === value.vaultId) {
        updatedFlag = true;
        return { ...info, ...value };
      } else {
        return info;
      }
    });
    if (!updatedFlag) {
      updatedRegsteredVaults.push(value);
    }
    yield call(dbManager.updateObjectByPrimaryId, RealmSchema.VaultSigner, 'xpub', signer.xpub, {
      registeredVaults: updatedRegsteredVaults,
    });
    return;
  }

  yield call(dbManager.updateObjectByPrimaryId, RealmSchema.VaultSigner, 'xpub', signer.xpub, {
    [key]: value,
  });
}

export const updateKeyDetails = createWatcher(updateKeyDetailsWorker, UPDATE_KEY_DETAILS);

function* updateWalletsPropertyWorker({
  payload,
}: {
  payload: {
    walletId: string;
    key: string;
    value: any;
  };
}) {
  const {
    walletId,
    key,
    value,
  }: {
    walletId: string;
    key: string;
    value: any;
  } = payload;
  try {
    const walletObjectRealm = yield call(dbManager.getObjectById, RealmSchema.Wallet, walletId);
    const updatedWallet = getJSONFromRealmObject(walletObjectRealm);
    updatedWallet[key] = value;
    yield put(setRelayWalletUpdateLoading(true));
    const response = yield call(updateAppImageWorker, { payload: { wallets: [updatedWallet] } });
    if (response.updated) {
      yield call(dbManager.updateObjectById, RealmSchema.Wallet, walletId, { [key]: value });
      yield put(relayWalletUpdateSuccess());
    } else {
      yield put(relayWalletUpdateFail(response.error));
    }
  } catch (err) {
    captureError(err);
    yield put(relayWalletUpdateFail('Something went wrong!'));
  }
}
export const updateWalletsPropertyWatcher = createWatcher(
  updateWalletsPropertyWorker,
  UPDATE_WALLET_PROPERTY
);

function* deleteVaultWorker({ payload }) {
  const { vaultId } = payload;
  try {
    yield put(setRelayVaultUpdateLoading(true));
    const response = yield call(deleteVaultImageWorker, { payload: { vaultIds: [vaultId] } });
    if (response.updated) {
      yield call(dbManager.deleteObjectById, RealmSchema.Vault, vaultId);
      yield put(relayVaultUpdateSuccess());
    } else {
      yield put(relayVaultUpdateFail(response.error));
    }
  } catch (err) {
    yield put(relayVaultUpdateFail('Something went wrong while deleting the vault!'));
  }
}

export const deleteVaultyWatcher = createWatcher(deleteVaultWorker, DELETE_VAULT);
