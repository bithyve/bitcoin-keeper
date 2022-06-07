import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import * as SecureStore from '../../storage/secure-store';
import {
  CREDS_AUTH,
  STORE_CREDS,
  credsStored,
  credsAuthenticated,
  switchSetupLoader,
  switchReLogin,
  CHANGE_AUTH_CRED,
  RESET_PIN,
  credsChanged,
  pinChangedFailed,
  updateApplication,
  CHANGE_LOGIN_METHOD,
  setLoginMethod,
} from '../actions/login';
import dbManager from '../../storage/realm/dbManager';
import * as Cipher from '../../common/encryption';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import { setupKeeperApp } from '../actions/storage';

function* credentialsStorageWorker({ payload }) {
  try {
    yield put(switchSetupLoader('storingCreds'));
    const hash = yield call(Cipher.hash, payload.passcode);
    const AES_KEY = yield call(Cipher.generateKey);
    const encryptedKey = yield call(Cipher.encrypt, AES_KEY, hash);
    if (!(yield call(SecureStore.store, hash, encryptedKey))) {
      return;
    }

    // initialize the database
    const uint8array = yield call(Cipher.stringToArrayBuffer, AES_KEY);
    yield call(dbManager.initializeRealm, uint8array);

    // setup the application
    yield put(setupKeeperApp());

    yield put(credsStored());
  } catch (error) {
    console.log(error);
  }
}

export const credentialStorageWatcher = createWatcher(credentialsStorageWorker, STORE_CREDS);

function* credentialsAuthWorker({ payload }) {
  let key;
  try {
    const { method } = payload;
    yield put(switchSetupLoader('authenticating'));
    if (method === LoginMethod.PIN) {
      const hash = yield call(Cipher.hash, payload.passcode);
      const encryptedKey = yield call(SecureStore.fetch, hash);
      key = yield call(Cipher.decrypt, encryptedKey, hash);
      const uint8array = yield call(Cipher.stringToArrayBuffer, key);
      yield call(dbManager.initializeRealm, uint8array);
    } else if (method === LoginMethod.BIOMETRIC) {
      const appId = yield select((state) => state.storage.appId);
      const { encryptedKey, hash, success } = yield call(
        SecureStore.verifyBiometricAuth,
        payload.passcode,
        appId
      );
      if (success) {
        key = yield call(Cipher.decrypt, encryptedKey, hash);
        const uint8array = yield call(Cipher.stringToArrayBuffer, key);
        yield call(dbManager.initializeRealm, uint8array);
      } else {
        put(credsAuthenticated(false));
      }
    }
  } catch (err) {
    if (payload.reLogin) yield put(switchReLogin(false));
    else yield put(credsAuthenticated(false));
    return;
  }
  if (!key) throw new Error('Key is missing');

  if (payload.reLogin) {
    yield put(switchReLogin(true));
  } else {
    yield put(credsAuthenticated(true));
    // check if the app has been upgraded
  }
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
    // Alert.alert('Pin change failed!', err.message);
    yield put(credsChanged('not-changed'));
  }
}

function* resetPinWorker({ payload }) {
  const { newPasscode } = payload;
  try {
    yield put(credsChanged('changed'));
  } catch (err) {
    console.log({
      err,
    });
    yield put(pinChangedFailed(true));
    // Alert.alert('Pin change failed!', err.message);
    yield put(credsChanged('not-changed'));
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
