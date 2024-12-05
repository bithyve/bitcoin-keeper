import { call, put } from 'redux-saga/effects';
import semver from 'semver';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { Platform } from 'react-native';
import Relay from 'src/services/backend/Relay';
import DeviceInfo from 'react-native-device-info';
import { getReleaseTopic } from 'src/utils/releaseTopic';
import messaging from '@react-native-firebase/messaging';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { BIP329Label, UTXOInfo } from 'src/services/wallets/interfaces';
import { LabelRefType, SignerType, WalletType, XpubTypes } from 'src/services/wallets/enums';
import { generateAbbreviatedOutputDescriptors } from 'src/utils/service-utilities/utils';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import {
  HealthCheckDetails,
  Signer,
  Vault,
  VaultSigner,
} from 'src/services/wallets/interfaces/vault';
import SigningServer from 'src/services/backend/SigningServer';
import { generateCosignerMapUpdates } from 'src/services/wallets/factories/VaultFactory';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import { CosignersMapUpdate, IKSCosignersMapUpdate } from 'src/models/interfaces/AssistedKeys';
import { generateExtendedKeysForCosigner } from 'src/services/wallets/factories/WalletFactory';
import { captureError } from 'src/services/sentry';
import { hash256 } from 'src/utils/service-utilities/encryption';
import {
  updateVersionHistory,
  UPDATE_VERSION_HISTORY,
  migrateLabelsToBip329,
  MIGRATE_LABELS_329,
} from '../sagaActions/upgrade';
import { deleteVaultImageWorker, updateAppImageWorker, updateVaultImageWorker } from './bhr';
import { createWatcher } from '../utilities';
import { setAppVersion } from '../reducers/storage';
import { addWhirlpoolWalletsWorker } from './wallets';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import { getKeyUID } from 'src/utils/utilities';

export const LABELS_INTRODUCTION_VERSION = '1.0.4';
export const BIP329_INTRODUCTION_VERSION = '1.0.7';
export const ASSISTED_KEYS_MIGRATION_VERSION = '1.1.9';
export const KEY_MANAGEMENT_VERSION = '1.1.9';
export const APP_KEY_UPGRADE_VERSION = '1.1.12';
export const WHIRLPOOL_WALLETS_RECREATION = '1.1.14';
export const ASSISTED_KEYS_COSIGNERSMAP_ENRICHMENT = '1.2.7';
export const ARCHIVE_ENABLED_VERSION = '1.2.7';
export const HEALTH_CHECK_TIMELINE_MIGRATION_VERSION = '1.2.6';

export function* applyUpgradeSequence({
  previousVersion,
  newVersion,
}: {
  previousVersion: string;
  newVersion: string;
}) {
  console.log(`applying upgrade sequence - from: ${previousVersion} to ${newVersion}`);

  if (
    semver.gte(previousVersion, LABELS_INTRODUCTION_VERSION) &&
    semver.lt(previousVersion, BIP329_INTRODUCTION_VERSION)
  ) {
    yield put(migrateLabelsToBip329());
  }

  if (semver.lt(previousVersion, ASSISTED_KEYS_MIGRATION_VERSION)) yield call(migrateAssistedKeys);
  if (semver.lt(previousVersion, KEY_MANAGEMENT_VERSION)) {
    yield call(migrateStructureforSignersInAppImage);
    yield call(migrateStructureforVaultInAppImage);
  }
  if (semver.lt(previousVersion, APP_KEY_UPGRADE_VERSION)) yield call(updateAppKeysToEnableSigning);
  if (semver.lt(previousVersion, WHIRLPOOL_WALLETS_RECREATION)) {
    yield call(whirlpoolWalletsCreation);
  }

  if (semver.lt(previousVersion, ASSISTED_KEYS_COSIGNERSMAP_ENRICHMENT)) {
    yield call(assistedKeysCosignersEnrichment);
  }
  if (semver.gt(newVersion, ARCHIVE_ENABLED_VERSION)) {
    yield call(cleanupArchivedVaults);
  }

  if (semver.lt(previousVersion, HEALTH_CHECK_TIMELINE_MIGRATION_VERSION)) {
    yield call(healthCheckTimelineMigration);
  }

  yield put(setAppVersion(newVersion));
  yield put(updateVersionHistory(previousVersion, newVersion));
}

function* updateVersionHistoryWorker({
  payload,
}: {
  payload: { previousVersion: string; newVersion: string };
}) {
  const { previousVersion, newVersion } = payload;
  try {
    const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const response = yield call(Relay.updateAppImage, {
      appId: app.id,
      version: newVersion,
    });
    if (response.updated) {
      yield call(dbManager.createObject, RealmSchema.VersionHistory, {
        version: `${newVersion}(${DeviceInfo.getBuildNumber()})`,
        releaseNote: '',
        date: new Date().toString(),
        title: `Upgraded from ${previousVersion} to ${newVersion}`,
      });
      messaging().unsubscribeFromTopic(getReleaseTopic(previousVersion));
      messaging().subscribeToTopic(getReleaseTopic(newVersion));

      const res = yield call(Relay.fetchReleaseNotes, newVersion);

      let notes = '';
      if (res.release) {
        if (Platform.OS === 'ios') notes = res.release.releaseNotes.ios;
        else notes = res.release.releaseNotes.android;
      }
      yield call(
        dbManager.updateObjectById,
        RealmSchema.VersionHistory,
        `${newVersion}(${DeviceInfo.getBuildNumber()})`,
        {
          version: `${newVersion}(${DeviceInfo.getBuildNumber()})`,
          releaseNote: notes,
          date: new Date().toString(),
          title: `Upgraded from ${previousVersion} to ${newVersion}`,
        }
      );
    }
  } catch (error) {
    console.log({ error });
  }
}

export const updateVersionHistoryWatcher = createWatcher(
  updateVersionHistoryWorker,
  UPDATE_VERSION_HISTORY
);

function* migrateLablesWorker() {
  try {
    const UTXOLabels: UTXOInfo[] = yield call(dbManager.getCollection, RealmSchema.UTXOInfo);
    const tags = [];
    const wallets: Wallet[] = yield call(dbManager.getCollection, RealmSchema.Wallet);

    UTXOLabels.forEach((utxo) => {
      if (utxo.labels.length) {
        const wallet = wallets.find((w) => w.id === utxo.walletId);
        const origin = generateAbbreviatedOutputDescriptors(wallet);
        utxo.labels.forEach((label) => {
          const ref = `${utxo.txId}:${utxo.vout}`;
          const labelName = label.name;
          const tag: BIP329Label = {
            id: `${ref}${labelName}`,
            type: LabelRefType.OUTPUT,
            isSystem: false,
            label: labelName,
            ref,
            origin,
          };
          tags.push(tag);
        });
      }
    });
    if (tags.length) {
      const { id }: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
      const updated = yield call(Relay.modifyLabels, id, tags.length ? tags : [], []);
      if (updated) {
        const labelsmigrated = yield call(dbManager.createObjectBulk, RealmSchema.Tags, tags);
        console.log('Labels migrated: ', labelsmigrated);
      }
    }
  } catch (error) {
    console.log({ error });
  }
}

export const migrateLablesWatcher = createWatcher(migrateLablesWorker, MIGRATE_LABELS_329);

function* migrateAssistedKeys() {
  try {
    const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const vaults: Vault[] = yield call(dbManager.getCollection, RealmSchema.Vault);
    const activeVault: Vault = vaults.filter((vault) => !vault.archived)[0] || null;

    if (!activeVault) throw new Error('No active vault found');

    const { signers } = activeVault;
    const signerMap = {};
    dbManager
      .getCollection(RealmSchema.Signer)
      .forEach((signer) => (signerMap[getKeyUID(signer as Signer)] = signer));

    for (const signer of signers) {
      const signerType = signerMap[getKeyUID(signer)].type;

      if (signerType === SignerType.POLICY_SERVER) {
        const cosignersMapUpdates: CosignersMapUpdate[] = yield call(
          generateCosignerMapUpdates,
          signerMap,
          signers,
          signer
        );
        const { migrationSuccessful } = yield call(
          SigningServer.migrateSignersV2ToV3,
          activeVault.shellId,
          app.id,
          cosignersMapUpdates
        );

        if (!migrationSuccessful) throw new Error('Failed to migrate assisted keys(SS)');
      } else if (signerType === SignerType.INHERITANCEKEY) {
        const cosignersMapUpdates: IKSCosignersMapUpdate[] = yield call(
          generateCosignerMapUpdates,
          signerMap,
          signers,
          signer
        );
        const { migrationSuccessful } = yield call(
          InheritanceKeyServer.migrateSignersV2ToV3,
          activeVault.shellId,
          cosignersMapUpdates
        );

        if (!migrationSuccessful) throw new Error('Failed to migrate assisted keys(IKS)');
      }
    }
  } catch (error) {
    console.log({ error });
  }
}

function* assistedKeysCosignersEnrichment() {
  try {
    const vaults: Vault[] = yield call(dbManager.getCollection, RealmSchema.Vault);
    const signerMap = {};
    dbManager
      .getCollection(RealmSchema.Signer)
      .forEach((signer) => (signerMap[getKeyUID(signer as Signer)] = signer));

    for (const vault of vaults) {
      const { signers: keys } = vault;

      // identical logic to VaultFactory's updateCosignersMapForAssistedKeys, different API calls(enrichment) tho
      for (const key of keys) {
        const assistedKeyType = signerMap[getKeyUID(key)]?.type;
        if (
          assistedKeyType === SignerType.POLICY_SERVER ||
          assistedKeyType === SignerType.INHERITANCEKEY
        ) {
          // creates maps per signer type
          const cosignersMapUpdates = generateCosignerMapUpdates(signerMap, keys, key);

          // updates our backend with the cosigners map
          if (assistedKeyType === SignerType.POLICY_SERVER) {
            const { updated } = yield call(
              SigningServer.enrichCosignersToSignerMap,
              key.xfp,
              cosignersMapUpdates as CosignersMapUpdate[]
            );

            if (!updated) {
              console.log('Failed to migrate/enrich cosigners-map for SS Assisted Keys');
            }
          } else if (assistedKeyType === SignerType.INHERITANCEKEY) {
            const { updated } = yield call(
              InheritanceKeyServer.enrichCosignersToSignerMapIKS,
              key.xfp,
              cosignersMapUpdates as IKSCosignersMapUpdate[]
            );

            if (!updated) {
              console.log('Failed to migrate/enrich cosigners-map for IKS Assisted Keys');
            }
          }
        }
      }
    }
  } catch (error) {
    console.log({ error });
  }
}

function* migrateStructureforSignersInAppImage() {
  try {
    const response = yield call(updateAppImageWorker, { payload: {} });
    if (response.updated) {
      console.log('Updated the Signers in app image');
    } else {
      console.log('Failed to update the update the app image with the updated the structure');
    }
  } catch (err) {}
}

function* migrateStructureforVaultInAppImage() {
  try {
    const vaults: Vault[] = yield call(dbManager.getCollection, RealmSchema.Vault);
    const activeVault: Vault = vaults.filter((vault) => !vault.archived)[0] || null;

    console.log('updating vault');
    const vaultResponse = yield call(updateVaultImageWorker, {
      payload: { isUpdate: true, vault: activeVault },
    });
  } catch (err) {
    console.log('Something went wrong in updating the vault image', err);
  }
}

// This function updates app keys/mobile keys to enable signing by generating and associating extended keys.
function* updateAppKeysToEnableSigning() {
  try {
    const wallets = yield call(dbManager.getCollection, RealmSchema.Wallet);
    const signers = yield call(dbManager.getCollection, RealmSchema.Signer);
    const keeperSigners = signers.filter((signer) => signer.type === SignerType.KEEPER);
    const { appKeyWalletMap, myAppKeySigners } = mapAppKeysToWallets(wallets, keeperSigners);
    const extendedKeyMap = generateExtendedKeysForSigners(myAppKeySigners, appKeyWalletMap);
    updateVaultSigners(extendedKeyMap, signers);
    updateSignerDetails(myAppKeySigners, extendedKeyMap);
    const response = yield call(updateAppImageWorker, { payload: { signers } });
    if (response.updated) {
      console.log('Updated the Signers in app image');
    } else {
      console.log('Failed to update the update the app image with the updated the structure');
    }
  } catch (err) {
    console.log('Error updating mobile keys', err);
    captureError(err);
  }
}

function mapAppKeysToWallets(wallets, keeperSigners) {
  const appKeyWalletMap = {};
  const myAppKeySigners = keeperSigners.filter((signer) => {
    const walletMatch = wallets.find((wallet) => wallet.id === signer.masterFingerprint);
    if (walletMatch) {
      appKeyWalletMap[signer.masterFingerprint] = walletMatch;
      return true;
    }
    return false;
  });

  return { appKeyWalletMap, myAppKeySigners };
}

function generateExtendedKeysForSigners(signers, appKeyWalletMap) {
  const extendedKeyMap = {};
  signers.forEach((signer) => {
    const { mnemonic } = appKeyWalletMap[signer.masterFingerprint].derivationDetails;
    const { extendedKeys } = generateExtendedKeysForCosigner(mnemonic);
    extendedKeyMap[signer.masterFingerprint] = extendedKeys;
  });

  return extendedKeyMap;
}

function updateVaultSigners(extendedKeyMap, signers) {
  const signerMap = {};
  signers.forEach((signer) => (signerMap[getKeyUID(signer)] = signer));
  const vaultKeys: VaultSigner[] = dbManager.getCollection(RealmSchema.VaultSigner);
  for (const vaultKey of vaultKeys) {
    const signer = signerMap[getKeyUID(vaultKey)];
    if (signer && signer.type === SignerType.KEEPER && extendedKeyMap[vaultKey.masterFingerprint]) {
      dbManager.updateObjectByPrimaryId(RealmSchema.VaultSigner, 'xpub', vaultKey.xpub, {
        xpriv: extendedKeyMap[vaultKey.masterFingerprint].xpriv,
      });
    }
  }
}

function updateSignerDetails(signers: Signer[], extendedKeyMap) {
  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i];
    // Update the signer type to MY_KEEPER and the extended keys
    dbManager.updateObjectByPrimaryId(
      RealmSchema.Signer,
      'masterFingerprint',
      signer.masterFingerprint,
      {
        type: SignerType.MY_KEEPER,
      }
    );
    dbManager.updateObjectByPrimaryId(
      RealmSchema.Signer,
      'masterFingerprint',
      signer.masterFingerprint,
      {
        signerXpubs: updateSignerXpubs(signer, extendedKeyMap[signer.masterFingerprint].xpriv),
      }
    );
    if (!signer.extraData?.instanceNumber) {
      try {
        // Update the signer instance number for MY_KEEPER
        dbManager.updateObjectByPrimaryId(
          RealmSchema.Signer,
          'masterFingerprint',
          signer.masterFingerprint,
          {
            extraData: { instanceNumber: i + 1 },
          }
        );
      } catch (err) {
        captureError(err);
        // ignore since instance number is not mandatory
      }
    }
  }
}

function updateSignerXpubs(signer, xpriv) {
  // This function would update the signerXpubs structure with the new xpriv, example provided
  return {
    ...signer.signerXpubs,
    [XpubTypes.P2WSH]: [
      {
        ...signer.signerXpubs[XpubTypes.P2WSH][0],
        xpriv,
      },
    ],
  };
}

function* whirlpoolWalletsCreation() {
  try {
    const Wallets: Wallet[] = dbManager.getCollection(RealmSchema.Wallet);
    let depositWalletId; // undefined
    const garbageIDs = [
      hash256(`${depositWalletId}${WalletType.PRE_MIX}`),
      hash256(`${depositWalletId}${WalletType.POST_MIX}`),
      hash256(`${depositWalletId}${WalletType.BAD_BANK}`),
    ];
    for (const wallet of Wallets) {
      // create new whirlpool wallets for missing config
      if (wallet?.whirlpoolConfig?.whirlpoolWalletDetails ?? false) {
        const whirlpoolWalletIds = wallet.whirlpoolConfig.whirlpoolWalletDetails.map(
          (detail) => detail.walletId
        );
        const whirlpoolWallets = Wallets.filter((walletItem) =>
          whirlpoolWalletIds.includes(walletItem.id)
        );
        if (whirlpoolWallets.length < 3) {
          yield call(addWhirlpoolWalletsWorker, { payload: { depositWallet: wallet } });
        }
      }
      if (garbageIDs.includes(wallet.id)) {
        dbManager.deleteObjectById(RealmSchema.Wallet, wallet.id);
      }
    }
  } catch (err) {
    console.log('Error in whirlpoolWalletsCreation:', err);
  }
}

function* healthCheckTimelineMigration() {
  try {
    const signers: Signer[] = dbManager.getCollection(RealmSchema.Signer);
    for (const signer of signers) {
      const healthCheckDetails: HealthCheckDetails = {
        type: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
        actionDate: signer.lastHealthCheck,
      };
      dbManager.updateObjectByPrimaryId(
        RealmSchema.Signer,
        'masterFingerprint',
        signer.masterFingerprint,
        {
          healthCheckDetails: [healthCheckDetails],
        }
      );
    }
  } catch (err) {
    console.log('Error in health check timeline migration:', err);
  }
}

function* cleanupArchivedVaults() {
  try {
    const vaults: Vault[] = yield call(dbManager.getCollection, RealmSchema.Vault);
    const archivedVaults = vaults.filter((vault) => vault.archived);
    const deletedVaultIds = archivedVaults.map((vault) => vault.id);
    const response = yield call(deleteVaultImageWorker, { payload: { vaultIds: deletedVaultIds } });
    if (response.updated) {
      for (const vault of archivedVaults) {
        dbManager.deleteObjectById(RealmSchema.Vault, vault.id);
      }
    }
  } catch (err) {
    console.log('Error in cleanupArchivedVaults:', err);
  }
}
