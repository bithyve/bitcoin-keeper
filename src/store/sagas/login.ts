import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import * as SecureStore from '../../storage/secure-store';
import {
  CREDS_AUTH,
  STORE_CREDS,
  CHANGE_AUTH_CRED,
  RESET_PIN,
  CHANGE_LOGIN_METHOD,
} from '../actions/login';
import { setLoginMethod } from '../reducers/settings'
import {
  credsAuthenticated,
  credsChanged,
  setCredStored,
  pinChangedFailed,
  setupLoading,
} from '../reducers/login'
import dbManager from '../../storage/realm/dbManager';
import * as Cipher from '../../common/encryption';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import {
  setPinResetCreds,
  resetPinFailAttempts,
  setKey
} from '../reducers/storage';
import { setupKeeperApp } from '../actions/storage';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { RootState } from '../store'

function* credentialsStorageWorker({ payload }) {
  try {
    yield put(setupLoading('storingCreds'));
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
    yield put(setKey(hash))

    yield put(setCredStored());
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
    if (method === LoginMethod.PIN) {
      const hash = yield call(Cipher.hash, payload.passcode);
      const encryptedKey = yield call(SecureStore.fetch, hash);
      key = yield call(Cipher.decrypt, encryptedKey, hash);
      const uint8array = yield call(Cipher.stringToArrayBuffer, key);
      yield call(dbManager.initializeRealm, uint8array);
      yield call(generateSeedHash)
    } else if (method === LoginMethod.BIOMETRIC) {
      const appId = yield select((state: RootState) => state.storage.appId);
      const { encryptedKey, hash, success } = yield call(
        SecureStore.verifyBiometricAuth,
        payload.passcode,
        appId
      );
      if (success) {
        key = yield call(Cipher.decrypt, encryptedKey, hash);
        const uint8array = yield call(Cipher.stringToArrayBuffer, key);
        yield call(dbManager.initializeRealm, uint8array);
        yield call(generateSeedHash)
      } else {
        put(credsAuthenticated(false));
      }
    }
  } catch (err) {
    if (payload.reLogin) {
      // yield put(switchReLogin(false));
    }
    else yield put(credsAuthenticated(false));
    return;
  }
  if (!key) throw new Error('Key is missing');

  if (payload.reLogin) {
    // yield put(switchReLogin(true));
  } else {
    yield put(credsAuthenticated(true));
    yield put(setKey(key))
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
    const key = yield select((state: RootState) => state.storage.key)
    // setup new pin
    const newHash = yield call(Cipher.hash, newPasscode)
    const encryptedKey = yield call(Cipher.encrypt, key, newHash)

    //store the AES key against the hash
    if (!(yield call(SecureStore.store, newHash, encryptedKey))) {
      throw new Error('Unable to access secure store')
    }
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

function* generateSeedHash() {
  try {
    const { primaryMnemonic }: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const words = primaryMnemonic.split(' ')
    const random = Math.floor(Math.random() * words.length)
    const hash = yield call(Cipher.hash, words[random])
    yield put(setPinResetCreds({ hash, index: random }))
    yield put(resetPinFailAttempts())
  } catch (error) {
    console.log('generateSeedHash error', error)
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
