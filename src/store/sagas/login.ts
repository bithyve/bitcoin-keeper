import { call, put, select } from 'redux-saga/effects';
import {
  decrypt,
  encrypt,
  generateEncryptionKey,
  hash512,
} from 'src/core/services/operations/encryption';
import DeviceInfo from 'react-native-device-info';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import { Platform } from 'react-native';
import { RealmSchema } from 'src/storage/realm/enum';
import Relay from 'src/core/services/operations/Relay';
import { getReleaseTopic } from 'src/utils/releaseTopic';
import messaging from '@react-native-firebase/messaging';
import ElectrumClient from 'src/core/services/electrum/client';
import * as SecureStore from '../../storage/secure-store';

import {
  CHANGE_AUTH_CRED,
  CHANGE_LOGIN_METHOD,
  CREDS_AUTH,
  RESET_PIN,
  STORE_CREDS,
  UPDATE_APPLICATION,
  updateApplication,
} from '../sagaActions/login';
import {
  credsAuthenticated,
  credsChanged,
  pinChangedFailed,
  setCredStored,
  setKey,
  setupLoading,
} from '../reducers/login';
import {
  resetPinFailAttempts,
  setAppVersion,
  setPinHash,
  setPinResetCreds,
} from '../reducers/storage';

import { RootState } from '../store';
import { autoSyncWallets } from '../sagaActions/wallets';
import { createWatcher } from '../utilities';
import dbManager from '../../storage/realm/dbManager';
import { fetchFeeAndExchangeRates } from '../sagaActions/send_and_receive';
import { getMessages } from '../sagaActions/notifications';
import { setLoginMethod } from '../reducers/settings';
import { setWarning } from '../sagaActions/bhr';
import { uaiChecks } from '../sagaActions/uai';

export const stringToArrayBuffer = (byteString: string): Uint8Array => {
  if (byteString) {
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.codePointAt(i);
    }
    return byteArray;
  }
  return null;
};

function* credentialsStorageWorker({ payload }) {
  try {
    yield put(setupLoading('storingCreds'));
    const hash = yield call(hash512, payload.passcode);
    const AES_KEY = yield call(generateEncryptionKey);
    yield put(setKey(AES_KEY));
    const encryptedKey = yield call(encrypt, hash, AES_KEY);

    if (!(yield call(SecureStore.store, hash, encryptedKey))) {
      return;
    }

    // initialize the database
    const uint8array = yield call(stringToArrayBuffer, AES_KEY);
    yield call(dbManager.initializeRealm, uint8array);

    // setup the application
    // yield put(setupKeeperApp());
    yield put(setPinHash(hash));

    yield put(setCredStored());
    yield put(setAppVersion(DeviceInfo.getVersion()));
    messaging().subscribeToTopic(getReleaseTopic(DeviceInfo.getVersion()));
    // fetch fee and exchange rates
    yield put(fetchFeeAndExchangeRates());
    yield call(dbManager.createObject, RealmSchema.VersionHistory, {
      version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
      releaseNote: '',
      date: new Date().toString(),
      title: 'Intial installed',
    });
  } catch (error) {
    console.log(error);
  }
}

export const credentialStorageWatcher = createWatcher(credentialsStorageWorker, STORE_CREDS);

function* credentialsAuthWorker({ payload }) {
  let key;
  try {
    const { method } = payload;
    yield put(setupLoading('authenticating'));

    let hash;
    let encryptedKey;
    if (method === LoginMethod.PIN) {
      hash = yield call(hash512, payload.passcode);
      encryptedKey = yield call(SecureStore.fetch, hash);
    } else if (method === LoginMethod.BIOMETRIC) {
      const appId = yield select((state: RootState) => state.storage.appId);
      const res = yield call(SecureStore.verifyBiometricAuth, payload.passcode, appId);
      if (!res.success) throw new Error('Biometric Auth Failed');
      hash = res.hash;
      encryptedKey = res.encryptedKey;
    }
    key = yield call(decrypt, hash, encryptedKey);
    yield put(setKey(key));
    if (!key) throw new Error('Encryption key is missing');
    const uint8array = yield call(stringToArrayBuffer, key);
    yield call(dbManager.initializeRealm, uint8array);
    yield call(generateSeedHash);
    yield put(setPinHash(hash));
  } catch (err) {
    if (payload.reLogin) {
      // yield put(switchReLogin(false));
    } else yield put(credsAuthenticated(false));
    return;
  }
  yield put(credsAuthenticated(true));
  yield put(setKey(key));
  yield call(ElectrumClient.connect);

  if (!payload.reLogin) {
    // case: login
    const history = yield call(dbManager.getCollection, RealmSchema.BackupHistory);

    yield put(autoSyncWallets());
    yield put(fetchFeeAndExchangeRates());
    yield put(getMessages());
    yield put(setWarning(history));
    yield put(uaiChecks());
  }
  // check if the app has been upgraded
  const appVersion = yield select((state: RootState) => state.storage.appVersion);
  const currentVersion = DeviceInfo.getVersion();
  if (currentVersion !== appVersion) yield put(updateApplication(currentVersion, appVersion));
}

export const credentialsAuthWatcher = createWatcher(credentialsAuthWorker, CREDS_AUTH);

function* changeAuthCredWorker({ payload }) {
  const { oldPasscode, newPasscode } = payload;
  try {
    // todo
  } catch (err) {
    console.log({
      err,
    });
    yield put(pinChangedFailed(true));
    yield put(credsChanged('not-changed'));
  }
}

function* resetPinWorker({ payload }) {
  const { newPasscode } = payload;
  try {
    const hash = yield select((state: RootState) => state.storage.pinHash);
    const encryptedKey = yield call(SecureStore.fetch, hash);
    const key = yield call(decrypt, hash, encryptedKey);

    // setup new pin
    const newHash = yield call(hash512, newPasscode);
    const newencryptedKey = yield call(encrypt, newHash, key);

    // store the AES key against the hash
    if (!(yield call(SecureStore.store, newHash, newencryptedKey))) {
      throw new Error('Unable to access secure store');
    }
    yield put(credsChanged('changed'));
    yield put(setPinHash(newHash));
  } catch (err) {
    console.log({
      err,
    });
    yield put(pinChangedFailed(true));
    yield put(credsChanged('not-changed'));
  }
}

function* generateSeedHash() {
  try {
    const { primaryMnemonic }: KeeperApp = yield call(
      dbManager.getObjectByIndex,
      RealmSchema.KeeperApp
    );
    const words = primaryMnemonic.split(' ');
    const random = Math.floor(Math.random() * words.length);
    const hash = yield call(hash512, words[random]);
    yield put(setPinResetCreds({ hash, index: random }));
    yield put(resetPinFailAttempts());
  } catch (error) {
    console.log('generateSeedHash error', error);
  }
}

export const resetPinCredWatcher = createWatcher(resetPinWorker, RESET_PIN);

export const changeAuthCredWatcher = createWatcher(changeAuthCredWorker, CHANGE_AUTH_CRED);

function* changeLoginMethodWorker({
  payload,
}: {
  payload: { method: LoginMethod; pubKey: string };
}) {
  try {
    const { method, pubKey } = payload;
    if (method === LoginMethod.BIOMETRIC) {
      const savePubKey = yield call(SecureStore.storeBiometricPubKey, pubKey);
      if (savePubKey) {
        yield put(setLoginMethod(method));
      }
    } else {
      yield put(setLoginMethod(method));
    }
  } catch (err) {
    console.log({
      err,
    });
  }
}

export const changeLoginMethodWatcher = createWatcher(changeLoginMethodWorker, CHANGE_LOGIN_METHOD);

function* applicationUpdateWorker({
  payload,
}: {
  payload: { newVersion: string; previousVersion: string };
}) {
  const { newVersion, previousVersion } = payload;
  try {
    yield call(dbManager.createObject, RealmSchema.VersionHistory, {
      version: `${newVersion}(${DeviceInfo.getBuildNumber()})`,
      releaseNote: '',
      date: new Date().toString(),
      title: `Upgraded from ${previousVersion}`,
    });
    messaging().unsubscribeFromTopic(getReleaseTopic(previousVersion));
    messaging().subscribeToTopic(getReleaseTopic(newVersion));
    yield put(setAppVersion(DeviceInfo.getVersion()));
    const res = yield call(Relay.fetchReleaseNotes, newVersion);
    let notes = '';
    notes = res.release
      ? Platform.OS == 'ios'
        ? res.release.releaseNotes.ios
        : res.release.releaseNotes.android
      : '';
    yield call(dbManager.createObject, RealmSchema.VersionHistory, {
      version: `${newVersion}(${DeviceInfo.getBuildNumber()})`,
      releaseNote: notes,
      date: new Date().toString(),
      title: `Upgraded from ${previousVersion}`,
    });
  } catch (error) {
    console.log(error);
  }
}

export const applicationUpdateWatcher = createWatcher(applicationUpdateWorker, UPDATE_APPLICATION);
