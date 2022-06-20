import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import * as SecureStore from '../../storage/secure-store';
import {
  CREDS_AUTH,
  STORE_CREDS,
  CHANGE_AUTH_CRED,
  RESET_PIN,
  CHANGE_LOGIN_METHOD,
} from '../sagaActions/login';
import { setLoginMethod } from '../reducers/settings';
import {
  credsAuthenticated,
  credsChanged,
  setCredStored,
  pinChangedFailed,
  setupLoading,
} from '../reducers/login';
import dbManager from '../../storage/realm/dbManager';
import * as Cipher from '../../common/encryption';
import LoginMethod from 'src/common/data/enums/LoginMethod';
import { setPinResetCreds, resetPinFailAttempts, setPinHash } from '../reducers/storage';
import { setupKeeperApp } from '../sagaActions/storage';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { RootState } from '../store';
import { autoSyncWallets } from '../sagaActions/wallets';
import { fetchFeeAndExchangeRates } from '../sagaActions/send_and_receive';

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
    yield put(setPinHash(hash));

    yield put(setCredStored());

    // fetch fee and exchange rates
    yield put(fetchFeeAndExchangeRates());
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
  if (!payload.reLogin) {
    // case: login
    yield put(autoSyncWallets());
    yield put(fetchFeeAndExchangeRates());
  }
  // check if the app has been upgraded
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
    // Alert.alert('Pin change failed!', err.message);
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
