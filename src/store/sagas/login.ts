import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import * as SecureStore from '../../storage/secure-store';
import { Platform } from 'react-native';
import {
  CREDS_AUTH,
  STORE_CREDS,
  CHANGE_AUTH_CRED,
  RESET_PIN,
  CHANGE_LOGIN_METHOD,
  UPDATE_APPLICATION,
  updateApplication,
} from '../sagaActions/login';
import { setLoginMethod } from '../reducers/settings';
import {
  credsAuthenticated,
  credsChanged,
  setCredStored,
  pinChangedFailed,
  setupLoading,
  setKey,
} from '../reducers/login';
import dbManager from '../../storage/realm/dbManager';
import * as Cipher from '../../common/encryption';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import {
  setPinResetCreds,
  resetPinFailAttempts,
  setPinHash,
  setAppVersion,
} from '../reducers/storage';
import { setupKeeperApp } from '../sagaActions/storage';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { RootState } from '../store';
import { autoSyncWallets } from '../sagaActions/wallets';
import { fetchFeeAndExchangeRates } from '../sagaActions/send_and_receive';
import { getMessages } from '../sagaActions/notifications';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
import { getReleaseTopic } from 'src/utils/releaseTopic';
import Relay from 'src/core/services/operations/Relay';

function* credentialsStorageWorker({ payload }) {
  try {
    yield put(setupLoading('storingCreds'));
    const hash = yield call(Cipher.hash, payload.passcode);
    const AES_KEY = yield call(Cipher.generateKey);
    yield put(setKey(AES_KEY));
    const encryptedKey = yield call(Cipher.encrypt, AES_KEY, hash);
    if (!(yield call(SecureStore.store, hash, encryptedKey))) {
      return;
    }

    // initialize the database
    const uint8array = yield call(Cipher.stringToArrayBuffer, AES_KEY);
    yield call(dbManager.initializeRealm, uint8array);

    // setup the application
    yield put(setupKeeperApp());
    yield put(setPinHash(hash));

    yield put(setCredStored());
    yield put(setAppVersion(DeviceInfo.getVersion()));
    messaging().subscribeToTopic(getReleaseTopic(DeviceInfo.getVersion()));
    // fetch fee and exchange rates
    yield put(fetchFeeAndExchangeRates());
    // intial app installed version
    yield call(dbManager.createObject, RealmSchema.VersionHistory, {
      version: DeviceInfo.getVersion(),
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

    let hash, encryptedKey;
    if (method === LoginMethod.PIN) {
      hash = yield call(Cipher.hash, payload.passcode);
      encryptedKey = yield call(SecureStore.fetch, hash);
    } else if (method === LoginMethod.BIOMETRIC) {
      const appId = yield select((state: RootState) => state.storage.appId);
      const res = yield call(SecureStore.verifyBiometricAuth, payload.passcode, appId);
      if (!res.success) throw new Error('Biometric Auth Failed');
      hash = res.hash;
      encryptedKey = res.encryptedKey;
    }
    key = yield call(Cipher.decrypt, encryptedKey, hash);
    yield put(setKey(key));
    if (!key) throw new Error('Encryption key is missing');
    const uint8array = yield call(Cipher.stringToArrayBuffer, key);
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
  if (!payload.reLogin) {
    // case: login
    yield put(autoSyncWallets());
    yield put(fetchFeeAndExchangeRates());
    yield put(getMessages());
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
    const key = yield call(Cipher.decrypt, encryptedKey, hash);

    // setup new pin
    const newHash = yield call(Cipher.hash, newPasscode);
    const newencryptedKey = yield call(Cipher.encrypt, key, newHash);

    //store the AES key against the hash
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
    const hash = yield call(Cipher.hash, words[random]);
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
    const res = yield call(Relay.fetchReleaseNotes, '0.0.1');
    let notes = '';
    notes = res.release
      ? Platform.OS == 'ios'
        ? res.release.releaseNotes.ios
        : res.release.releaseNotes.android
      : '';
    yield call(dbManager.createObject, RealmSchema.VersionHistory, {
      version: newVersion,
      releaseNote: notes,
      date: new Date().toString(),
      title: 'Upgraded from ' + previousVersion,
    });
    messaging().unsubscribeFromTopic, getReleaseTopic(previousVersion);
    messaging().subscribeToTopic, getReleaseTopic(newVersion);
    yield put(setAppVersion(DeviceInfo.getVersion()));
  } catch (error) {
    console.log(error);
  }
}

export const applicationUpdateWatcher = createWatcher(applicationUpdateWorker, UPDATE_APPLICATION);
