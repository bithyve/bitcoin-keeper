/* eslint-disable no-continue */

/* eslint-disable no-case-declarations */
import {
  DerivationPurpose,
  EntityKind,
  MiniscriptTypes,
  MultisigScriptType,
  SignerType,
  VaultType,
  VisibilityType,
  WalletType,
  XpubTypes,
} from 'src/services/wallets/enums';
import {
  DelayedPolicyUpdate,
  InheritanceConfiguration,
  InheritanceKeyInfo,
  InheritancePolicy,
  SignerException,
  SignerRestriction,
} from 'src/models/interfaces/AssistedKeys';
import {
  MiniscriptElements,
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
  WalletDerivationDetails,
} from 'src/services/wallets/interfaces/wallet';
import { call, delay, fork, put, select } from 'redux-saga/effects';
import {
  setNetBalance,
  setSyncing,
  setTestCoinsFailed,
  setTestCoinsReceived,
  setSignerPolicyError,
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
  getCosignerDetails,
} from 'src/services/wallets/factories/WalletFactory';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import {
  decrypt,
  encrypt,
  generateEncryptionKey,
  generateKey,
  hash512,
} from 'src/utils/service-utilities/encryption';
import { uaiType } from 'src/models/interfaces/Uai';
import { captureError } from 'src/services/sentry';
import ElectrumClient, {
  ELECTRUM_CLIENT,
  ELECTRUM_NOT_CONNECTED_ERR,
  ELECTRUM_NOT_CONNECTED_ERR_TOR,
} from 'src/services/electrum/client';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import idx from 'idx';
import _ from 'lodash';
import { SyncedWallet } from 'src/services/wallets/interfaces';
import { checkSignerAccountsMatch, getAccountFromSigner, getKeyUID } from 'src/utils/utilities';
import { COLLABORATIVE_SCHEME } from 'src/screens/SigningDevices/SetupCollaborativeWallet';
import { RootState } from '../store';

import {
  initiateVaultMigration,
  setCollaborativeSessionSigners,
  setKeyHealthCheckError,
  setKeyHealthCheckLoading,
  setKeyHealthCheckSuccess,
  updateCollaborativeSessionLastSynched,
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
  refreshWallets,
  UPDATE_SIGNER_DETAILS,
  UPDATE_WALLET_PROPERTY,
  UPDATE_KEY_DETAILS,
  UPDATE_VAULT_DETAILS,
  GENERATE_NEW_ADDRESS,
} from '../sagaActions/wallets';
import {
  ADD_NEW_VAULT,
  ADD_SIGINING_DEVICE,
  DELETE_SIGINING_DEVICE,
  ARCHIVE_SIGINING_DEVICE,
  DELETE_VAULT,
  FINALISE_VAULT_MIGRATION,
  MERGER_SIMILAR_KEYS,
  MIGRATE_VAULT,
  REFILL_MOBILEKEY,
  REFRESH_CANARY_VAULT,
  REINSTATE_VAULT,
  UPDATE_COLLABORATIVE_CHANNEL,
  FETCH_COLLABORATIVE_CHANNEL,
  updateCollaborativeChannel,
} from '../sagaActions/vaults';
import { addToUaiStack, uaiChecks } from '../sagaActions/uai';
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
  setIsCloudBsmsBackupRequired,
  setRelaySignersUpdateLoading,
  setRelayVaultUpdateLoading,
  setRelayWalletUpdateLoading,
  showDeletingKeyModal,
  hideDeletingKeyModal,
  showKeyDeletedSuccessModal,
} from '../reducers/bhr';
import { setElectrumNotConnectedErr } from '../reducers/login';
import { connectToNodeWorker } from './network';
import { backupBsmsOnCloud } from '../sagaActions/bhr';
import { bulkUpdateLabelsWorker } from './utxos';
import { updateDelayedPolicyUpdate } from '../reducers/storage';

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
      const defaultWallet: Wallet = yield call(generateWallet, {
        type: WalletType.DEFAULT,
        instanceNum, // zero-indexed
        walletName: walletName || 'Default Wallet',
        walletDescription: walletDescription || '',
        derivationConfig,
        primaryMnemonic,
        networkType: config.NETWORK_TYPE,
        transferPolicy,
        wallets,
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
        wallets,
      });
      return importedWallet;
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
        yield call(dbManager.createObjectBulk, RealmSchema.Wallet, wallets);
        yield put(relayWalletUpdateSuccess());
        return true;
      }
      const errorMsg = response.error?.message
        ? response.error.message.toString()
        : response.error.toString();
      yield put(relayWalletUpdateFail(errorMsg));
      return false;
    }
  } catch (err) {
    console.log(err);
    yield put(relayWalletUpdateFail(err.message ? err.message : err.toString()));
    return false;
  }
}

export const addNewWalletsWatcher = createWatcher(addNewWalletsWorker, ADD_NEW_WALLETS);

export interface NewVaultInfo {
  vaultType: VaultType;
  vaultScheme: VaultScheme;
  vaultSigners: VaultSigner[];
  miniscriptElements?: MiniscriptElements;
  vaultDetails?: NewVaultDetails;
  miniscriptTypes?: MiniscriptTypes[];
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
    signingDevices.forEach((signer) => (signerMap[getKeyUID(signer)] = signer));

    let isNewVault = false; // When the vault is passed directly during upgrade/downgrade process
    if (!vault) {
      const {
        vaultType = VaultType.DEFAULT,
        vaultScheme,
        vaultSigners,
        vaultDetails,
      } = newVaultInfo;

      if (vaultScheme.multisigScriptType !== MultisigScriptType.MINISCRIPT_MULTISIG) {
        if (vaultScheme.n !== vaultSigners.length) {
          throw new Error('Vault schema(n) and signers mismatch');
        }
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
        (vaultKey) => signerMap[getKeyUID(vaultKey)]?.type === SignerType.INHERITANCEKEY
      );
      if (ikVaultKey) {
        const ikSigner: Signer = signerMap[getKeyUID(ikVaultKey)];
        yield call(finaliseIKSetupWorker, { payload: { ikSigner, ikVaultKey, vault } });
      }
    }
    yield put(setRelayVaultUpdateLoading(true));
    const newVaultResponse = yield call(updateVaultImageWorker, { payload: { vault } });
    if (newVaultResponse.updated) {
      yield call(dbManager.createObject, RealmSchema.Vault, vault);
      yield put(uaiChecks([uaiType.SECURE_VAULT]));

      if (isMigrated) {
        const oldVault = dbManager.getObjectById(RealmSchema.Vault, oldVaultId).toJSON() as Vault;
        const isWalletEmpty =
          oldVault.specs.balances.confirmed === 0 && oldVault.specs.balances.unconfirmed === 0;
        const updatedParams = {
          archived: isWalletEmpty,
          isMigrating: !isWalletEmpty,
          archivedId: oldVault.archivedId ? oldVault.archivedId : oldVault.id,
        };
        const archivedVaultresponse = yield call(updateVaultImageWorker, {
          payload: {
            vault: {
              ...oldVault,
              ...updatedParams,
            },
          },
        });
        if (archivedVaultresponse.updated) {
          yield call(dbManager.updateObjectById, RealmSchema.Vault, oldVaultId, updatedParams);
        }
      }

      yield put(vaultCreated({ hasNewVaultGenerationSucceeded: true }));
      yield put(relayVaultUpdateSuccess());
      yield put(setIsCloudBsmsBackupRequired(true));
      yield put(backupBsmsOnCloud(null));
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
    captureError(err);
    yield put(
      relayVaultUpdateFail(
        'Failed to create the vault. Please check your internet connection and try again'
      )
    );
    return false;
  }
}

export const addNewVaultWatcher = createWatcher(addNewVaultWorker, ADD_NEW_VAULT);

export function* addSigningDeviceWorker({
  payload: { signers },
  callback,
}: {
  payload: { signers: Signer[] };
  callback: () => void;
}) {
  if (!signers.length) return;
  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i];
    yield call(mergeSimilarKeysWorker, { payload: { signer } });
  }
  try {
    const existingSigners: Signer[] = yield call(dbManager.getCollection, RealmSchema.Signer);
    const filteredSigners = existingSigners.filter((s) => !s.archived);
    const signerMap = Object.fromEntries(
      filteredSigners.map((signer) => [getKeyUID(signer), signer])
    );
    let signersToUpdate = [];

    try {
      // update signers with signer count
      signers = signers.map((signer) => {
        if (signer.type === SignerType.MY_KEEPER) {
          if (!signer.extraData?.instanceNumber) {
            const myAppKeys = filteredSigners.filter((s) => s.type === SignerType.MY_KEEPER);
            const currentInstanceNumber = WalletUtilities.getInstanceNumberForSigners(myAppKeys);
            signer.extraData = { instanceNumber: currentInstanceNumber + 1 };
          }
        }
        return signer;
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
      if (!checkSignerAccountsMatch(newSigner)) {
        yield put(
          relaySignersUpdateFail(
            'Cannot add multiple accounts in the same signer, please import each account separately'
          )
        );
        continue;
      }
      const existingSigner = signerMap[getKeyUID(newSigner)];
      if (!existingSigner) {
        const signerAccount = getAccountFromSigner(newSigner);
        if (signerAccount !== 0 && !newSigner.signerDescription) {
          newSigner.signerDescription = `Account #${signerAccount}`;
        }
        signersToUpdate.push(newSigner);
        continue;
      }
      const newSsKey = idx(newSigner, (_) => _.signerXpubs[XpubTypes.P2WPKH][0].xpub);
      const existingSsKey = idx(existingSigner, (_) => _.signerXpubs[XpubTypes.P2WPKH][0].xpub);
      const newMsKey = idx(newSigner, (_) => _.signerXpubs[XpubTypes.P2WSH][0].xpub);
      const existingMsKey = idx(existingSigner, (_) => _.signerXpubs[XpubTypes.P2WSH][0].xpub);
      const newTrKey = idx(newSigner, (_) => _.signerXpubs[XpubTypes.P2TR][0].xpub);
      const existingTrKey = idx(existingSigner, (_) => _.signerXpubs[XpubTypes.P2TR][0].xpub);
      const missingMsKey = (existingSsKey || existingTrKey) && !existingMsKey;
      const missingSsKey = (existingMsKey || existingTrKey) && !existingSsKey;
      const missingTrKey = (existingSsKey || existingMsKey) && !existingTrKey;

      const singleSigMatch = keysMatch(XpubTypes.P2WPKH, newSigner, existingSigner);
      const multiSigMatch = keysMatch(XpubTypes.P2WSH, newSigner, existingSigner);
      const taprootMatch = keysMatch(XpubTypes.P2TR, newSigner, existingSigner);
      const signerMergeCondition = // if the new signer has one of the keys missing or has the same xpubs as the existing signer, then update the type and xpubs
        (missingMsKey && newMsKey) ||
        (missingSsKey && newSsKey) ||
        (missingTrKey && newTrKey) ||
        singleSigMatch ||
        multiSigMatch ||
        taprootMatch;

      if (signerMergeCondition) {
        signersToUpdate.push({
          ...existingSigner,
          type: [SignerType.UNKOWN_SIGNER, SignerType.OTHER_SD].includes(existingSigner.type)
            ? newSigner.type
            : existingSigner.type,
          signerXpubs: _.merge(existingSigner.signerXpubs, newSigner.signerXpubs),
        });
        continue;
      }

      const singleSigDifferent = keysDifferent(XpubTypes.P2WPKH, newSigner, existingSigner);
      const multiSigDifferent = keysDifferent(XpubTypes.P2WSH, newSigner, existingSigner);
      const taprootDifferent = keysDifferent(XpubTypes.P2TR, newSigner, existingSigner);

      // if the new signer has multiple accounts of the same type, then let the user know and skip the update
      if (singleSigDifferent || multiSigDifferent || taprootDifferent) {
        yield put(
          relaySignersUpdateFail(
            `Signer with the same account and fingerprint (${newSigner.masterFingerprint}) already exists with different xpubs. Please check your device and verify the keys are correct.`
          )
        );
        continue;
      }
    }
    if (signersToUpdate.length) {
      const signerMap = Object.fromEntries(
        existingSigners.map((signer) => [getKeyUID(signer), signer])
      );
      signersToUpdate = signersToUpdate.map((s) => {
        const isSignerArchived = signerMap[getKeyUID(s)]?.archived || false;
        return isSignerArchived ? { ...s, archived: false, hidden: false } : s;
      });
      signersToUpdate = signersToUpdate.map((signer) => ({
        ...signer,
        id: getKeyUID(signer),
      }));
      yield put(setRelaySignersUpdateLoading(true));
      const response = yield call(updateAppImageWorker, { payload: { signers: signersToUpdate } });
      if (response.updated) {
        yield call(
          dbManager.createObjectBulk,
          RealmSchema.Signer,
          signersToUpdate,
          Realm.UpdateMode.Modified
        );

        yield put(
          relaySignersUpdateSuccess(
            signersToUpdate.length !== 1 ||
              (signersToUpdate[0]?.extraData?.instanceNumber !== 1 && !signersToUpdate[0]?.hidden)
          )
        );
      } else {
        const errorMsg = response.error?.message
          ? response.error.message.toString()
          : response.error.toString();
        yield put(relaySignersUpdateFail(errorMsg));
      }
    } else if (signers.length === 1) {
      yield put(relaySignersUpdateFail('The signer already exists.'));
    }
    if (callback) callback();
  } catch (error) {
    captureError(error);
    yield put(relaySignersUpdateFail('An error occurred while updating signers.'));
  }
}

export const addSigningDeviceWatcher = createWatcher(addSigningDeviceWorker, ADD_SIGINING_DEVICE);

function* deleteSigningDeviceWorker({ payload: { signers } }: { payload: { signers: Signer[] } }) {
  try {
    if (signers.length) {
      yield put(showDeletingKeyModal());
      const signersToDeleteIds = [];
      for (const signer of signers) {
        signersToDeleteIds.push(getKeyUID(signer));
      }
      for (let i = 0; i < signers.length; i++) {
        yield call(deleteAppImageEntityWorker, {
          payload: {
            signerIds: signersToDeleteIds,
          },
        });
      }
      yield put(uaiChecks([uaiType.SIGNING_DEVICES_HEALTH_CHECK]));
      yield put(hideDeletingKeyModal());
      yield put(showKeyDeletedSuccessModal());
    }
  } catch (error) {
    captureError(error);
    yield put(hideDeletingKeyModal());
    yield put(relaySignersUpdateFail('An error occurred while deleting signers.'));
  }
}

export const deleteSigningDeviceWatcher = createWatcher(
  deleteSigningDeviceWorker,
  DELETE_SIGINING_DEVICE
);

function* archiveSigningDeviceWorker({ payload: { signers } }: { payload: { signers: Signer[] } }) {
  try {
    const signersToArchiveIds = [];
    for (const signer of signers) {
      signersToArchiveIds.push(getKeyUID(signer));
    }
    if (signers.length) {
      for (let i = 0; i < signers.length; i++) {
        yield call(updateSignerDetailsWorker, {
          payload: {
            signer: signers[i],
            key: 'archived',
            value: true,
          },
        });
      }
      yield put(uaiChecks([uaiType.SIGNING_DEVICES_HEALTH_CHECK]));
    }
  } catch (error) {
    captureError(error);
    yield put(relaySignersUpdateFail('An error occurred while archiving signers.'));
  }
}

export const archiveSigningDeviceWatcher = createWatcher(
  archiveSigningDeviceWorker,
  ARCHIVE_SIGINING_DEVICE
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

    if (vaultScheme.multisigScriptType !== MultisigScriptType.MINISCRIPT_MULTISIG) {
      if (vaultScheme.n !== vaultSigners.length) {
        throw new Error('Vault schema(n) and signers mismatch');
      }
    }

    const networkType = config.NETWORK_TYPE;

    const signerMap = {};
    const signingDevices: Signer[] = yield call(dbManager.getCollection, RealmSchema.Signer);
    signingDevices.forEach((signer) => (signerMap[getKeyUID(signer)] = signer));

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
    const oldVault = dbManager.getObjectById(RealmSchema.Vault, vaultId).toJSON() as Vault;
    let migratedVault = yield select((state: RootState) => state.vault.intrimVault);
    if (!migratedVault) {
      return;
    }
    migratedVault = {
      ...migratedVault,
      archivedId: oldVault.archivedId ? oldVault.archivedId : oldVault.id,
    };
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

    let isRecoveredInheritanceKey = false;
    if (!existingConfiguration) {
      // note: a pre-present inheritanceKeyInfo w/ an empty configurations array is also used as a key to identify that it is a recovered inheritance key
      const restoredIKSConfigLength = idx(
        ikSigner,
        (_) => _.inheritanceKeyInfo.configurations.length
      ); // will be undefined if this is not a restored IKS(which is an error case)
      if (restoredIKSConfigLength === 0) {
        // case II: recovered IKS synching for the first time
        isRecoveredInheritanceKey = true;
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

    if (isRecoveredInheritanceKey) {
      // update inheritance key w/ the FCM token of heir's device
      const fcmToken = yield select((state: RootState) => state.notifications.fcmToken);

      if (fcmToken) {
        const existingPolicy = idx(ikSigner, (_) => _.inheritanceKeyInfo.policy) || {};
        const existingTargets =
          idx(existingPolicy, (_) => (_ as InheritancePolicy).notification.targets) || [];
        const updatedPolicy: InheritancePolicy = {
          ...existingPolicy,
          notification: {
            targets: [...existingTargets, fcmToken],
          },
        };

        const { updated } = yield call(
          InheritanceKeyServer.updateInheritancePolicy,
          ikVaultKey.xfp,
          updatedPolicy,
          existingConfiguration
        );
        if (updated) updatedInheritanceKeyInfo.policy = updatedPolicy;
        else console.log('Failed to update the inheritance key policy w/ FCM of the heir');
      }
    }
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
    const signerKeyUID = getKeyUID(ikSigner);
    yield call(
      dbManager.updateObjectByQuery,
      RealmSchema.Signer,
      (realmSigner) => getKeyUID(realmSigner) === signerKeyUID,
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
  const { wallets, options } = payload;
  const network = WalletUtilities.getNetworkByType(wallets[0].networkType);

  const { synchedWallets }: { synchedWallets: SyncedWallet[] } = yield call(
    WalletOperations.syncWalletsViaElectrumClient,
    wallets,
    network,
    options.hardRefresh
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
    options: { hardRefresh?: boolean; addNotifications?: boolean };
  };
}) {
  const { wallets, options } = payload;
  try {
    if (!ELECTRUM_CLIENT.isClientConnected) {
      ElectrumClient.resetCurrentPeerIndex();
      yield call(connectToNodeWorker);
    }

    yield put(setSyncing({ wallets, isSyncing: true }));
    const { synchedWallets }: { synchedWallets: SyncedWallet[] } = yield call(syncWalletsWorker, {
      payload: {
        wallets,
        options,
      },
    });

    let labels: { ref: string; label: string; isSystem: boolean }[];

    if (synchedWallets && synchedWallets.some((wallet) => wallet.newUTXOs.length > 0)) {
      labels = yield call(dbManager.getCollection, RealmSchema.Tags);
    }
    for (const synchedWalletWithUTXOs of synchedWallets) {
      const { synchedWallet } = synchedWalletWithUTXOs;
      if (!synchedWallet.specs.hasNewUpdates && !options.hardRefresh) continue; // no new updates found

      for (const utxo of synchedWalletWithUTXOs.newUTXOs) {
        const labelChanges = {
          added: [],
          deleted: [],
        };

        const utxoLabels = labels ? labels.filter((label) => label.ref === utxo.address) : [];
        if (utxoLabels.length > 0) {
          labelChanges.added.push(
            ...utxoLabels.map((label) => ({
              name: label.label,
              isSystem: label.isSystem,
            }))
          );
        }

        yield fork(bulkUpdateLabelsWorker, {
          payload: { labelChanges, UTXO: utxo, wallet: synchedWallet as any },
        });

        if (options.addNotifications) {
          if (synchedWallet.type !== VaultType.CANARY) {
            if (!Object.values(synchedWallet.specs.addresses.internal).includes(utxo.address)) {
              yield put(
                addToUaiStack({
                  uaiType: uaiType.INCOMING_TRANSACTION,
                  entityId: synchedWallet.entityKind + '_' + synchedWallet.id + '_' + utxo.txId,
                  uaiDetails: {
                    heading: 'New Transaction Received',
                    body: 'Click to view the transaction details',
                  },
                })
              );
            }
          }
        }
      }

      if (synchedWallet.entityKind === EntityKind.VAULT) {
        yield call(dbManager.updateObjectById, RealmSchema.Vault, synchedWallet.id, {
          specs: synchedWallet.specs,
        });
        if (synchedWallet.type === VaultType.CANARY) {
          yield put(uaiChecks([uaiType.CANARAY_WALLET]));
        }
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
    } else {
      yield put(
        setElectrumNotConnectedErr(
          'Wallet sync failed: ' + (err.message ? err.message : err.toString())
        )
      );
      captureError(err);
    }
  } finally {
    yield put(setSyncing({ wallets, isSyncing: false }));
  }
}

export const refreshWalletsWatcher = createWatcher(refreshWalletsWorker, REFRESH_WALLETS);

export function* autoWalletsSyncWorker({
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
      if (wallet.entityKind === EntityKind.VAULT && (wallet as Vault).archived) continue;
      walletsToSync.push(getJSONFromRealmObject(wallet));
    }
  }

  if (walletsToSync.length) {
    yield call(refreshWalletsWorker, {
      payload: {
        wallets: walletsToSync,
        options: {
          hardRefresh,
          addNotifications: true,
        },
      },
    });
  }
}

export const autoWalletsSyncWatcher = createWatcher(autoWalletsSyncWorker, AUTO_SYNC_WALLETS);

export function* updateSignerPolicyWorker({
  payload,
}: {
  payload: {
    signer: Signer;
    signingKey: VaultSigner;
    updates: {
      restrictions: SignerRestriction;
      exceptions: SignerException;
      signingDelay: number;
    };
    verificationToken: number;
  };
}) {
  const fcmToken = yield select((state: RootState) => state.notifications.fcmToken);

  const { signer, signingKey, updates, verificationToken } = payload;
  try {
    const signerId =
      signingKey?.xfp ||
      WalletUtilities.getFingerprintFromExtendedKey(
        signer.signerXpubs[XpubTypes.P2WSH][0].xpub,
        config.NETWORK
      );

    const {
      updated,
      delayedPolicyUpdate,
    }: { updated: boolean; delayedPolicyUpdate: DelayedPolicyUpdate } = yield call(
      SigningServer.updatePolicy,
      signerId,
      verificationToken,
      updates,
      fcmToken
    );

    if (delayedPolicyUpdate) {
      yield put(updateDelayedPolicyUpdate(delayedPolicyUpdate));
    } else {
      if (!updated) {
        Alert.alert('Failed to update signer policy, try again.');
        throw new Error('Failed to update the policy');
      }

      const updatedSignerPolicy = {
        ...signer.signerPolicy,
        ...updates,
      };
      dbManager.updateObjectByPrimaryId(
        RealmSchema.Signer,
        'masterFingerprint',
        signer.masterFingerprint,
        {
          signerPolicy: updatedSignerPolicy,
        }
      );
    }
    yield put(setSignerPolicyError('success'));
  } catch (err) {
    yield put(setSignerPolicyError('failure'));
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
    wallet.presentationData = presentationData;

    yield put(setRelayWalletUpdateLoading(true));
    const response = yield call(updateAppImageWorker, { payload: { wallets: [wallet] } });
    if (response.updated) {
      yield call(dbManager.updateObjectById, RealmSchema.Wallet, wallet.id, {
        presentationData,
      });
      yield put(relayWalletUpdateSuccess());
    } else {
      const errorMsg = response.error?.message
        ? response.error.message.toString()
        : response.error.toString();
      yield put(relayWalletUpdateFail(errorMsg));
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

    const response = yield call(updateVaultImageWorker, {
      payload: { vault },
    });
    if (response.updated) {
      yield put(relayVaultUpdateSuccess());
      yield call(dbManager.updateObjectById, RealmSchema.Vault, vault.id, {
        presentationData,
      });
    } else {
      const errorMsg = response.error?.message
        ? response.error.message.toString()
        : response.error.toString();
      yield put(relayVaultUpdateFail(errorMsg));
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
      const signerKeyUID = getKeyUID(signer);
      yield call(
        dbManager.updateObjectByQuery,
        RealmSchema.Signer,
        (realmSigner) => getKeyUID(realmSigner) === signerKeyUID,
        {
          [key]: value,
        }
      );
      yield put(relaySignersUpdateSuccess(false));
    } else {
      const errorMsg = response.error?.message
        ? response.error.message.toString()
        : response.error.toString();
      yield put(relaySignersUpdateFail(errorMsg));
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
      const errorMsg = response.error?.message
        ? response.error.message.toString()
        : response.error.toString();
      yield put(relayWalletUpdateFail(errorMsg));
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
      const errorMsg = response.error?.message
        ? response.error.message.toString()
        : response.error.toString();
      yield put(relayVaultUpdateFail(errorMsg));
    }
  } catch (err) {
    yield put(relayVaultUpdateFail('Something went wrong while deleting the vault!'));
  }
}

export const deleteVaultyWatcher = createWatcher(deleteVaultWorker, DELETE_VAULT);

function* reinstateVaultWorker({ payload }) {
  const { vaultId } = payload;
  try {
    yield put(setRelayVaultUpdateLoading(true));
    const vault: Vault = dbManager.getObjectById(RealmSchema.Vault, vaultId).toJSON();
    const updatedParams = {
      archived: false,
      isMigrating: false,
      archivedId: null,
      presentationData: {
        ...vault.presentationData,
        visibility: VisibilityType.DEFAULT,
      },
    };
    const response = yield call(updateVaultImageWorker, {
      payload: {
        vault: {
          ...vault,
          ...updatedParams,
        },
        isUpdate: true,
      },
    });
    const signerMap = {};
    const signingDevices: Signer[] = yield call(dbManager.getCollection, RealmSchema.Signer);
    signingDevices.forEach((signer) => (signerMap[getKeyUID(signer)] = signer));

    if (response.updated) {
      yield call(dbManager.updateObjectById, RealmSchema.Vault, vaultId, updatedParams);
      for (let i = 0; i < vault.signers.length; i++) {
        yield call(updateSignerDetailsWorker, {
          payload: {
            signer: signerMap[getKeyUID(vault.signers[i])],
            key: 'archived',
            value: false,
          },
        });
      }
      yield put(relayVaultUpdateSuccess());
    } else {
      const errorMsg = response.error?.message
        ? response.error.message.toString()
        : response.error.toString();
      yield put(relayVaultUpdateFail(errorMsg));
    }
  } catch (err) {
    yield put(relayVaultUpdateFail('Something went wrong while deleting the vault!'));
  }
}

export const reinstateVaultWatcher = createWatcher(reinstateVaultWorker, REINSTATE_VAULT);

function* refillMobileKeyWorker({ payload }) {
  const { vaultKey } = payload;
  try {
    yield put(setKeyHealthCheckLoading(true));
    const { xpriv } = vaultKey;
    if (!xpriv) {
      const signerMap = {};
      const signingDevices: Signer[] = yield call(dbManager.getCollection, RealmSchema.Signer);
      signingDevices.forEach((signer) => (signerMap[getKeyUID(signer)] = signer));
      const keeper: KeeperApp = dbManager.getCollection(RealmSchema.KeeperApp)[0];
      const { primaryMnemonic } = keeper;
      const signer = signerMap[getKeyUID(vaultKey)];
      const details = yield call(
        getCosignerDetails,
        primaryMnemonic,
        signer.extraData.instanceNumber - 1
      );
      const xpub = idx(details, (_) => _.xpubDetails[XpubTypes.P2WSH].xpub);
      const signerXpub = idx(signer, (_) => _.signerXpubs[XpubTypes.P2WSH][0].xpub);
      if (xpub === signerXpub) {
        const { xpriv } = details.xpubDetails[XpubTypes.P2WSH];
        yield call(updateKeyDetailsWorker, {
          payload: { signer: signer.signerXpubs[XpubTypes.P2WSH][0], key: 'xpriv', value: xpriv },
        });
        yield put(setKeyHealthCheckLoading(false));
        yield put(setKeyHealthCheckSuccess(true));
      } else {
        yield put(setKeyHealthCheckLoading(false));
        yield put(
          setKeyHealthCheckError('Key seems to be corrupted, please delete and re-add it.')
        );
      }
    } else {
      yield put(setKeyHealthCheckLoading(false));
    }
  } catch (err) {
    yield put(setKeyHealthCheckLoading(false));
    captureError(err);
  }
}

export const refillMobileKeyWatcher = createWatcher(refillMobileKeyWorker, REFILL_MOBILEKEY);
function* refreshCanaryWalletsWorker() {
  try {
    const vaults: Vault[] = yield call(dbManager.getCollection, RealmSchema.Vault);
    const canaryWallets = vaults.filter((vault) => vault.type === VaultType.CANARY);
    if (canaryWallets.length) {
      yield call(refreshWalletsWorker, {
        payload: {
          wallets: canaryWallets,
          options: {
            hardRefresh: true,
          },
        },
      });
    }
  } catch (err) {
    yield put(relayVaultUpdateFail('Something went wrong while deleting the vault!'));
  }
}

export const refreshCanaryWalletsWatcher = createWatcher(
  refreshCanaryWalletsWorker,
  REFRESH_CANARY_VAULT
);

function* mergeSimilarKeysWorker({ payload }: { payload: { signer: Signer } }) {
  try {
    const { signer } = payload;
    const signers: Signer[] = yield call(dbManager.getCollection, RealmSchema.Signer);
    for (let i = 0; i < signers.length; i++) {
      const s = signers[i];
      const p2wpkh = idx(s, (_) => _.signerXpubs[XpubTypes.P2WPKH][0].xpub);
      const p2wsh = idx(s, (_) => _.signerXpubs[XpubTypes.P2WSH][0].xpub);
      const signerp2wpkh = idx(signer, (_) => _.signerXpubs[XpubTypes.P2WPKH][0].xpub);
      const signerp2wsh = idx(signer, (_) => _.signerXpubs[XpubTypes.P2WSH][0].xpub);
      if (
        p2wpkh === signerp2wpkh &&
        p2wsh === signerp2wsh &&
        s.masterFingerprint !== signer.masterFingerprint
      ) {
        const signerKeyUID = getKeyUID(s);
        yield call(
          dbManager.updateObjectByQuery,
          RealmSchema.Signer,
          (realmSigner) => getKeyUID(realmSigner) === signerKeyUID,
          {
            masterFingerprint: signer.masterFingerprint,
          }
        );
        // get all keys that have the same masterFingerprint
        const keys = yield call(
          dbManager.getObjectByQuery,
          RealmSchema.VaultSigner,
          (obj) => getKeyUID(obj) === getKeyUID(s),
          true // get all matching objects
        );
        for (let i = 0; i < keys.length; i++) {
          yield call(
            dbManager.updateObjectByPrimaryId,
            RealmSchema.VaultSigner,
            'xpub',
            keys[i].xpub,
            {
              masterFingerprint: signer.masterFingerprint,
            }
          );
        }
        const { primarySeed, id } = dbManager.getCollection(RealmSchema.KeeperApp)[0];
        const encryptionKey = generateEncryptionKey(primarySeed);
        const encrytedSigner = encrypt(encryptionKey, JSON.stringify(signer));
        const updated = yield call(Relay.migrateXfp, id, [
          {
            oldSignerId: s.masterFingerprint,
            newSignerId: signer.masterFingerprint,
            newSignerDetails: encrytedSigner,
          },
        ]);
        if (updated) {
          console.log(
            `Signer ${s.masterFingerprint} has been merged with ${signer.masterFingerprint}`
          );
        }
        return true;
      }
    }
    return false;
  } catch (err) {
    captureError(err);
  }
}

export const mergeSimilarKeysWatcher = createWatcher(mergeSimilarKeysWorker, MERGER_SIMILAR_KEYS);

function* generateNewExternalAddressWorker({
  payload,
}: {
  payload: {
    wallet: Wallet | Vault;
  };
}) {
  const { wallet } = payload;
  wallet.specs.totalExternalAddresses += 1;

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

export const generateNewExternalAddressWatcher = createWatcher(
  generateNewExternalAddressWorker,
  GENERATE_NEW_ADDRESS
);

function* updateCollaborativeChannelWorker({ payload }: { payload: { self: Signer } }) {
  try {
    const collaborativeSession = yield select(
      (state: RootState) => state.vault.collaborativeSession
    );

    for (const fingerprint in collaborativeSession.signers) {
      const { keyAES } = collaborativeSession.signers[fingerprint];
      if (payload.self.masterFingerprint === fingerprint) continue;

      const channelId = hash512(keyAES);
      const encryptedCollaborativeSession = encrypt(keyAES, JSON.stringify(collaborativeSession));
      const res = yield call(
        Relay.updateCollaborativeChannel,
        channelId,
        encryptedCollaborativeSession
      );
      if (!(res && res.updated)) {
        Alert.alert(`Failed to update collaborative channel for ${fingerprint}`);
      }
    }
  } catch (err) {
    console.log({ err });
  }
}

export const updateCollaborativeChannelWatcher = createWatcher(
  updateCollaborativeChannelWorker,
  UPDATE_COLLABORATIVE_CHANNEL
);

function* fetchCollaborativeChannelWorker({ payload }: { payload: { self: Signer } }) {
  try {
    const collaborativeSession = yield select(
      (state: RootState) => state.vault.collaborativeSession
    );

    const { keyAES } = collaborativeSession.signers[payload.self.masterFingerprint];
    const channelId = hash512(keyAES);
    const res = yield call(Relay.fetchCollaborativeChannel, channelId);
    yield put(updateCollaborativeSessionLastSynched());

    if (res && res.encryptedData) {
      const synchedCollaborativeSession = JSON.parse(decrypt(keyAES, res.encryptedData));
      yield put(setCollaborativeSessionSigners(synchedCollaborativeSession.signers));

      // check if this fetch completes the quorum(by combining incomplete remote and local state) and upload the complete collaborative state
      if (!synchedCollaborativeSession.isComplete && !collaborativeSession.isComplete) {
        const uniqueSigners = {};
        for (const fingerprint in synchedCollaborativeSession.signers) {
          uniqueSigners[fingerprint] = true;
        }
        for (const fingerprint in collaborativeSession.signers) {
          uniqueSigners[fingerprint] = true;
        }

        if (Object.keys(uniqueSigners).length === COLLABORATIVE_SCHEME.n) {
          yield delay(1000); // ensures that the reducer state is updated via setCollaborativeSessionSigners before we upload the final state
          yield put(updateCollaborativeChannel(payload.self));
        }
      }
    }
  } catch (err) {
    console.log('Failed to fetch collaborative channel: ', err);
  }
}

export const fetchCollaborativeChannelWatcher = createWatcher(
  fetchCollaborativeChannelWorker,
  FETCH_COLLABORATIVE_CHANNEL
);
