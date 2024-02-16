import { call, put, select } from 'redux-saga/effects';
import semver from 'semver';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { Platform } from 'react-native';
import Relay from 'src/services/operations/Relay';
import DeviceInfo from 'react-native-device-info';
import { getReleaseTopic } from 'src/utils/releaseTopic';
import messaging from '@react-native-firebase/messaging';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { BIP329Label, UTXOInfo } from 'src/core/wallets/interfaces';
import { LabelRefType, SignerType } from 'src/core/wallets/enums';
import { genrateOutputDescriptors } from 'src/core/utils';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { setAppVersion, setPinHash } from '../reducers/storage';
import { createWatcher } from '../utilities';
import {
  updateVersionHistory,
  UPDATE_VERSION_HISTORY,
  migrateLabelsToBip329,
  MIGRATE_LABELS_329,
} from '../sagaActions/upgrade';
import { Vault } from 'src/core/wallets/interfaces/vault';
import SigningServer from 'src/services/operations/SigningServer';
import { generateCosignerMapUpdates } from 'src/core/wallets/factories/VaultFactory';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';
import { CosignersMapUpdate, IKSCosignersMapUpdate } from 'src/services/interfaces';
import { updateAppImageWorker, updateVaultImageWorker } from './bhr';

export const LABELS_INTRODUCTION_VERSION = '1.0.4';
export const BIP329_INTRODUCTION_VERSION = '1.0.7';
export const ASSISTED_KEYS_MIGRATION_VERSION = '1.1.9';
export const KEY_MANAGEMENT_VERSION = '1.1.9';

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
  )
    yield put(migrateLabelsToBip329());

  if (semver.lt(previousVersion, ASSISTED_KEYS_MIGRATION_VERSION)) yield call(migrateAssistedKeys);
  if (semver.lt(previousVersion, KEY_MANAGEMENT_VERSION)) {
    yield call(migrateStructureforSignersInAppImage);
    yield call(migrateStructureforVaultInAppImage);
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
        const origin = genrateOutputDescriptors(wallet, false);
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
    const vaults: Vault[] = yield call(dbManager.getCollection, RealmSchema.Vault);
    const activeVault: Vault = vaults.filter((vault) => !vault.archived)[0] || null;
    const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);

    const { signers } = activeVault;
    const signerMap = {};
    dbManager
      .getCollection(RealmSchema.Signer)
      .forEach((signer) => (signerMap[signer.masterFingerprint as string] = signer));

    for (let signer of signers) {
      const signerType = signerMap[signer.masterFingerprint].type;

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
