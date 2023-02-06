/* eslint-disable no-nested-ternary */
/* eslint-disable no-plusplus */
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
import { RealmSchema } from 'src/storage/realm/enum';
import { getReleaseTopic } from 'src/utils/releaseTopic';
import messaging from '@react-native-firebase/messaging';
import ElectrumClient from 'src/core/services/electrum/client';
import Relay from 'src/core/services/operations/Relay';
import semver from 'semver';
import { uaiType } from 'src/common/data/models/interfaces/Uai';
import * as SecureStore from '../../storage/secure-store';

import {
  CHANGE_AUTH_CRED,
  CHANGE_LOGIN_METHOD,
  CREDS_AUTH,
  GENERATE_SEED_HASH,
  RESET_PIN,
  STORE_CREDS,
} from '../sagaActions/login';
import {
  credsAuthenticated,
  credsChanged,
  pinChangedFailed,
  setCredStored,
  setKey,
  setupLoading,
  setRecepitVerificationError,
  setRecepitVerificationFailed,
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
import { fetchFeeRates, fetchExchangeRates } from '../sagaActions/send_and_receive';
import { getMessages } from '../sagaActions/notifications';
import { setLoginMethod } from '../reducers/settings';
import { setWarning } from '../sagaActions/bhr';
import { uaiChecks } from '../sagaActions/uai';
import { applyUpgradeSequence } from './upgrade';

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

    // connect electrum-client
    const privateNodes = yield call(dbManager.getCollection, RealmSchema.NodeConnect);
    ElectrumClient.setActivePeer(privateNodes);
    yield call(ElectrumClient.connect);

    // fetch fee and exchange rates
    yield put(fetchFeeRates());
    yield put(fetchExchangeRates());

    yield put(
      uaiChecks([uaiType.SIGNING_DEVICES_HEALTH_CHECK, uaiType.SECURE_VAULT, uaiType.DEFAULT])
    );

    messaging().subscribeToTopic(getReleaseTopic(DeviceInfo.getVersion()));
    yield call(dbManager.createObject, RealmSchema.VersionHistory, {
      version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
      releaseNote: '',
      date: new Date().toString(),
      title: 'Initially installed',
    });
  } catch (error) {
    console.log(error);
  }
}

export const credentialStorageWatcher = createWatcher(credentialsStorageWorker, STORE_CREDS);

function* credentialsAuthWorker({ payload }) {
  let key;
  const appId = yield select((state: RootState) => state.storage.appId);
  try {
    yield put(setRecepitVerificationError(false));
    yield put(setRecepitVerificationFailed(false));
    const { method } = payload;
    yield put(setupLoading('authenticating'));
    let hash;
    let encryptedKey;
    if (method === LoginMethod.PIN) {
      hash = yield call(hash512, payload.passcode);
      encryptedKey = yield call(SecureStore.fetch, hash);
    } else if (method === LoginMethod.BIOMETRIC) {
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
    yield put(setPinHash(hash));

    const previousVersion = yield select((state) => state.storage.appVersion);
    const newVersion = DeviceInfo.getVersion();
    if (semver.lt(previousVersion, newVersion)) {
      yield call(applyUpgradeSequence, { previousVersion, newVersion });
    }
  } catch (err) {
    if (payload.reLogin) {
      // yield put(switchReLogin(false));
    } else yield put(credsAuthenticated(false));
    return;
  }

  yield put(setKey(key));

  // connect electrum-client
  const privateNodes = yield call(dbManager.getCollection, RealmSchema.NodeConnect);
  ElectrumClient.setActivePeer(privateNodes);
  yield call(ElectrumClient.connect);

  if (!payload.reLogin) {
    if (appId !== '') {
      try {
        const { id, publicId }: KeeperApp = yield call(
          dbManager.getObjectByIndex,
          RealmSchema.KeeperApp
        );
        const response = yield call(Relay.verifyReceipt, id, publicId);
        if (response.isValid) {
          yield put(credsAuthenticated(true));
          yield put(setKey(key));
          // case: login
          const history = yield call(dbManager.getCollection, RealmSchema.BackupHistory);
          yield put(autoSyncWallets());
          // fetch fee and exchange rates
          yield put(fetchFeeRates());
          yield put(fetchExchangeRates());
          yield put(getMessages());
          yield put(setWarning(history));
          yield put(fetchExchangeRates());
          yield put(
            uaiChecks([
              uaiType.SIGNING_DEVICES_HEALTH_CHECK,
              uaiType.SECURE_VAULT,
              uaiType.VAULT_MIGRATION,
              uaiType.DEFAULT,
            ])
          );
          yield call(generateSeedHash);
          // connect electrum-client
          const privateNodes = yield select((state: RootState) => state.settings.nodeDetails);
          ElectrumClient.setActivePeer(privateNodes);
          yield call(ElectrumClient.connect);
        } else {
          yield put(setRecepitVerificationFailed(true));
        }
      } catch (error) {
        yield put(setRecepitVerificationError(true));
        // yield put(credsAuthenticated(false));
        console.log(error);
      }
    } else {
      yield put(credsAuthenticated(true));
      const privateNodes = yield select((state: RootState) => state.settings.nodeDetails);
      ElectrumClient.setActivePeer(privateNodes);
    }
  } else {
    yield put(credsAuthenticated(true));
  }
}

export const credentialsAuthWatcher = createWatcher(credentialsAuthWorker, CREDS_AUTH);

function* changeAuthCredWorker({ payload }) {
  const { oldPasscode, newPasscode } = payload;
  console.log({ oldPasscode, newPasscode });
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
export const changeAuthCredWatcher = createWatcher(changeAuthCredWorker, CHANGE_AUTH_CRED);

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
export const resetPinCredWatcher = createWatcher(resetPinWorker, RESET_PIN);

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

export const generateSeedHashWatcher = createWatcher(generateSeedHash, GENERATE_SEED_HASH);

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
