import { call, put, select } from 'redux-saga/effects';
import semver from 'semver';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { Platform } from 'react-native';
import Relay from 'src/core/services/operations/Relay';
import DeviceInfo from 'react-native-device-info';
import { getReleaseTopic } from 'src/utils/releaseTopic';
import messaging from '@react-native-firebase/messaging';
import { setAppVersion, setPinHash } from '../reducers/storage';
import { stringToArrayBuffer } from './login';
import { createWatcher } from '../utilities';
import {
  resetReduxStore,
  updateVersionHistory,
  UPDATE_VERSION_HISTORY,
} from '../sagaActions/upgrade';
import { RootState } from '../store';
import { generateSeedHash } from '../sagaActions/login';
import { setupKeeperAppWorker } from './storage';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { encrypt, generateEncryptionKey } from 'src/core/services/operations/encryption';

export const SWITCH_TO_MAINNET_VERSION = '0.0.99';
export const ADDITION_OF_VAULTSHELL_VERSION = '1.0.1';

export function* applyUpgradeSequence({
  previousVersion,
  newVersion,
}: {
  previousVersion: string;
  newVersion: string;
}) {
  console.log(`applying upgrade sequence - from: ${previousVersion} to ${newVersion}`);
  if (semver.lt(previousVersion, SWITCH_TO_MAINNET_VERSION)) yield call(switchToMainnet);
  if (semver.lte(previousVersion, ADDITION_OF_VAULTSHELL_VERSION))
    yield call(additionOfVaultShellId);
  yield put(setAppVersion(newVersion));
  yield put(updateVersionHistory(previousVersion, newVersion));
}

function* switchToMainnet() {
  const AES_KEY = yield select((state) => state.login.key);
  const uint8array = yield call(stringToArrayBuffer, AES_KEY);

  // remove existing realm database
  const deleted = yield call(dbManager.deleteRealm, uint8array);
  if (!deleted) throw new Error('failed to switch to mainnet');

  // reset redux store
  const pinHash = yield select((state: RootState) => state.storage.pinHash); // capture pinhash before resetting redux
  yield put(resetReduxStore());

  // re-initialise a fresh instance of realm
  yield call(dbManager.initializeRealm, uint8array);
  // setup the keeper app
  yield call(setupKeeperAppWorker, { payload: {} });

  // saturate the reducer w/ pin
  yield put(setPinHash(pinHash));
  yield put(generateSeedHash());
}

function* additionOfVaultShellId() {
  const { id, primarySeed }: KeeperApp = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.KeeperApp
  );
  const vaults: Vault[] = yield call(dbManager.getCollection, RealmSchema.Vault);
  try {
    for (const vault of vaults) {
      vault.shellId = id;
      const encryptionKey = generateEncryptionKey(primarySeed);
      const vaultEncrypted = encrypt(encryptionKey, JSON.stringify(vault));
      //updating the vault image on relay
      const response = yield call(Relay.updateVaultImage, {
        vaultShellId: vault.shellId,
        vaultId: vault.id,
        vault: vaultEncrypted,
      });
      if (response.updated) {
        yield call(dbManager.updateObjectById, RealmSchema.Vault, vault.id, { shellId: id });
      }
    }
  } catch (err) {
    console.log(err);
  }
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
        title: `Upgraded from ${previousVersion}`,
      });
      messaging().unsubscribeFromTopic(getReleaseTopic(previousVersion));
      messaging().subscribeToTopic(getReleaseTopic(newVersion));

      const res = yield call(Relay.fetchReleaseNotes, newVersion);

      let notes = '';
      if (res.release) {
        if (Platform.OS === 'ios') notes = res.release.releaseNotes.ios;
        else notes = res.release.releaseNotes.android;
      }

      yield call(dbManager.createObject, RealmSchema.VersionHistory, {
        version: `${newVersion}(${DeviceInfo.getBuildNumber()})`,
        releaseNote: notes,
        date: new Date().toString(),
        title: `Upgraded from ${previousVersion}`,
      });
    }
  } catch (error) {
    console.log({ error });
  }
}

export const updateVersionHistoryWatcher = createWatcher(
  updateVersionHistoryWorker,
  UPDATE_VERSION_HISTORY
);
