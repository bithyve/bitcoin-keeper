import { call, put, select } from 'redux-saga/effects';
import {
  cryptoRandom,
  decrypt,
  encrypt,
  generateEncryptionKey,
  hash512,
} from 'src/utils/service-utilities/encryption';
import DeviceInfo from 'react-native-device-info';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import LoginMethod from 'src/models/enums/LoginMethod';
import { RealmSchema } from 'src/storage/realm/enum';
import { getReleaseTopic } from 'src/utils/releaseTopic';
import messaging from '@react-native-firebase/messaging';
import Relay from 'src/services/backend/Relay';
import semver from 'semver';
import { uaiType } from 'src/models/interfaces/Uai';
import * as SecureStore from 'src/storage/secure-store';

import dbManager from 'src/storage/realm/dbManager';
import SubScription from 'src/models/interfaces/Subscription';
import { AppSubscriptionLevel, SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import {
  CHANGE_AUTH_CRED,
  CHANGE_LOGIN_METHOD,
  CREDS_AUTH,
  GENERATE_SEED_HASH,
  RESET_PIN,
  STORE_CREDS,
  SWITCH_APP_STATUS,
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
  setOfflineStatus,
  setStatusLoading,
  setStatusMessage,
  credsAuthenticatedError,
} from '../reducers/login';
import {
  resetPinFailAttempts,
  setAppVersion,
  setPinHash,
  setPinResetCreds,
} from '../reducers/storage';

import { RootState, store } from '../store';
import { createWatcher } from '../utilities';
import { fetchExchangeRates } from '../sagaActions/send_and_receive';
import { getMessages } from '../sagaActions/notifications';
import { setLoginMethod, setSubscription } from '../reducers/settings';
import { backupAllSignersAndVaults, setWarning } from '../sagaActions/bhr';
import { uaiChecks } from '../sagaActions/uai';
import { applyUpgradeSequence } from './upgrade';
import { resetSyncing } from '../reducers/wallets';
import { connectToNode } from '../sagaActions/network';
import { fetchSignedDelayedTransaction } from '../sagaActions/storage';
import { setAutomaticCloudBackup } from '../reducers/bhr';
import { manipulateIosProdProductId } from 'src/utils/utilities';

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

    yield put(fetchExchangeRates());
    yield put(
      uaiChecks([
        uaiType.SIGNING_DEVICES_HEALTH_CHECK,
        uaiType.SECURE_VAULT,
        uaiType.VAULT_TRANSFER,
        uaiType.RECOVERY_PHRASE_HEALTH_CHECK,
        uaiType.DEFAULT,
        uaiType.ZENDESK_TICKET,
      ])
    );

    messaging().subscribeToTopic(getReleaseTopic(DeviceInfo.getVersion()));
    yield call(dbManager.createObject, RealmSchema.VersionHistory, {
      version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
      releaseNote: '',
      date: new Date().toString(),
      title: 'Initially installed',
    });

    yield put(connectToNode());
  } catch (error) {
    console.log(error);
  }
}

export const credentialStorageWatcher = createWatcher(credentialsStorageWorker, STORE_CREDS);

function* credentialsAuthWorker({ payload }) {
  let key;
  const appId = yield select((state: RootState) => state.storage.appId);
  yield put(credsAuthenticatedError(''));
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
    yield put(setPinHash(hash));

    if (!key) throw new Error('Encryption key is missing');
    // case: login
    if (!payload.reLogin) {
      const uint8array = yield call(stringToArrayBuffer, key);
      const { success, error } = yield call(dbManager.initializeRealm, uint8array);

      if (!success) {
        throw Error(`Failed to load the database:${error}`);
      }

      const previousVersion = yield select((state) => state.storage.appVersion);
      const newVersion = DeviceInfo.getVersion();
      const versionCollection = yield call(dbManager.getCollection, RealmSchema.VersionHistory);
      const lastElement = versionCollection[versionCollection.length - 1];
      const lastVersionCode = lastElement.version.split(/[()]/);
      const currentVersionCode = DeviceInfo.getBuildNumber();
      if (semver.lt(previousVersion, newVersion)) {
        yield call(applyUpgradeSequence, { previousVersion, newVersion });
      } else if (currentVersionCode !== lastVersionCode[1]) {
        yield call(dbManager.createObject, RealmSchema.VersionHistory, {
          version: `${newVersion}(${currentVersionCode})`,
          releaseNote: '',
          date: new Date().toString(),
          title: `Upgraded from ${lastVersionCode[1]} to ${currentVersionCode}`,
        });
      }
      if (appId) {
        try {
          const { id, publicId, subscription }: KeeperApp = yield call(
            dbManager.getObjectByIndex,
            RealmSchema.KeeperApp
          );
          yield put(connectToNode());
          const response = yield call(Relay.verifyReceipt, id, publicId);
          yield put(credsAuthenticated(true));
          yield put(credsAuthenticatedError(''));
          yield put(setKey(key));

          const history = yield call(dbManager.getCollection, RealmSchema.BackupHistory);
          yield put(setWarning(history));

          yield put(fetchExchangeRates());
          yield put(getMessages());
          yield put(fetchSignedDelayedTransaction());

          yield put(
            uaiChecks([
              uaiType.SIGNING_DEVICES_HEALTH_CHECK,
              uaiType.SECURE_VAULT,
              uaiType.VAULT_TRANSFER,
              uaiType.RECOVERY_PHRASE_HEALTH_CHECK,
              uaiType.FEE_INISGHT,
              uaiType.DEFAULT,
              uaiType.ZENDESK_TICKET,
            ])
          );

          yield put(resetSyncing());
          yield call(generateSeedHash);
          yield put(setRecepitVerificationFailed(!response.isValid));
          if (!response.isValid) {
            if (
              (subscription.level > 1 && ['Hodler', 'Diamond Hands'].includes(subscription.name)) ||
              subscription.level !== response.level
            ) {
              yield call(downgradeToPleb);
              yield put(setRecepitVerificationFailed(true));
            }
          } else if (
            response?.paymentType == 'btc_payment' &&
            response?.level != subscription?.level
          )
            yield call(updateSubscriptionFromRelayData, response);

          const { pendingAllBackup, automaticCloudBackup } = yield select(
            (state: RootState) => state.bhr
          );
          if (pendingAllBackup && automaticCloudBackup) yield put(backupAllSignersAndVaults());
        } catch (error) {
          yield put(setRecepitVerificationError(true));
          // yield put(credsAuthenticated(false));
          yield put(credsAuthenticatedError(error));
          console.log(error);
        }
      } else yield put(credsAuthenticated(true));
    } else yield put(credsAuthenticated(true));
  } catch (err) {
    yield put(credsAuthenticatedError(err));
    yield put(credsAuthenticated(false));
  }
}

async function downgradeToPleb() {
  const app: KeeperApp = await dbManager.getObjectByIndex(RealmSchema.KeeperApp);
  const updatedSubscription: SubScription = {
    receipt: '',
    productId: SubscriptionTier.L1,
    name: SubscriptionTier.L1,
    level: AppSubscriptionLevel.L1,
    icon: 'assets/ic_pleb.svg',
  };
  dbManager.updateObjectById(RealmSchema.KeeperApp, app.id, {
    subscription: updatedSubscription,
  });
  store.dispatch(setSubscription(updatedSubscription.name));
  store.dispatch(setAutomaticCloudBackup(false));
  await Relay.updateSubscription(app.id, app.publicId, {
    productId: SubscriptionTier.L1.toLowerCase(),
  });
}

async function updateSubscriptionFromRelayData(data) {
  const app: KeeperApp = await dbManager.getObjectByIndex(RealmSchema.KeeperApp);
  const updatedSubscription: SubScription = {
    receipt: data.transactionReceipt,
    productId: manipulateIosProdProductId(data.productId),
    name: data.plan,
    level: data.level,
    icon: data.icon,
    isDesktopPurchase: true,
  };
  dbManager.updateObjectById(RealmSchema.KeeperApp, app.id, {
    subscription: updatedSubscription,
  });
  store.dispatch(setSubscription(updatedSubscription.name));
}

async function updateSubscription(level: AppSubscriptionLevel) {
  const app: KeeperApp = await dbManager.getObjectByIndex(RealmSchema.KeeperApp);

  const subscriptionDetails = {
    [AppSubscriptionLevel.L1]: {
      productId: SubscriptionTier.L1,
      name: SubscriptionTier.L1,
      icon: 'assets/ic_pleb.svg',
    },
    [AppSubscriptionLevel.L2]: {
      productId: SubscriptionTier.L2,
      name: SubscriptionTier.L2,
      icon: 'assets/ic_hodler.svg',
    },
    [AppSubscriptionLevel.L3]: {
      productId: SubscriptionTier.L3,
      name: SubscriptionTier.L3,
      icon: 'assets/ic_diamond.svg',
    },
  };

  const selectedSubscription = subscriptionDetails[level];

  if (!selectedSubscription) {
    console.error('Invalid subscription level:', level);
    return;
  }

  const updatedSubscription: SubScription = {
    receipt: '',
    productId: selectedSubscription.productId,
    name: selectedSubscription.name,
    level,
    icon: selectedSubscription.icon,
  };

  await dbManager.updateObjectById(RealmSchema.KeeperApp, app.id, {
    subscription: updatedSubscription,
  });

  await Relay.updateSubscription(app.id, app.publicId, {
    productId: selectedSubscription.productId.toLowerCase(),
  });
}

export const credentialsAuthWatcher = createWatcher(credentialsAuthWorker, CREDS_AUTH);

function* changeAuthCredWorker({ payload }) {
  const { oldPasscode, newPasscode } = payload;
  try {
    const hash = yield call(hash512, oldPasscode);
    const encryptedKey = yield call(SecureStore.fetch, hash);
    const decryptedKey = yield call(decrypt, hash, encryptedKey);
    const newHash = yield call(hash512, newPasscode);
    const newEncryptedKey = yield call(encrypt, newHash, decryptedKey);
    if (!(yield call(SecureStore.store, newHash, newEncryptedKey))) {
      return;
    }
    const removedOldKey = yield call(SecureStore.remove, hash);
    yield put(credsChanged('changed'));

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
    const random = Math.floor(cryptoRandom() * words.length);
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

export function* switchAppStatusWorker() {
  yield put(setStatusLoading(true));
  const appId = yield select((state: RootState) => state.storage.appId);

  if (appId) {
    try {
      const { id, publicId }: KeeperApp = yield call(
        dbManager.getObjectByIndex,
        RealmSchema.KeeperApp
      );

      const response = yield call(Relay.verifyReceipt, id, publicId);

      if (response.isValid) {
        yield call(updateSubscription, response.level);
        yield put(setOfflineStatus(false));
        yield put(
          setStatusMessage({
            message: 'Connection successful! Keeper is online now.',
            status: true,
          })
        );
      } else {
        yield put(setOfflineStatus(true));
        yield put(
          setStatusMessage({
            message: 'App status update failed: Invalid receipt',
            status: false,
          })
        );
      }

      yield put(setRecepitVerificationFailed(!response.isValid));
      yield put(connectToNode());
    } catch (error) {
      yield put(
        setStatusMessage({
          message: 'It seems there’s a network issue. Please check your connection and try again.',
          status: false,
        })
      );
      yield put(setRecepitVerificationError(true));
      yield put(setOfflineStatus(true));
      yield put(setStatusLoading(false));
      console.error('App status update error:', error);
    }
  } else {
    yield put(setRecepitVerificationFailed(true));
    yield put(setRecepitVerificationError(true));
    yield put(
      setStatusMessage({
        message: 'App ID not found. Verification failed.',
        status: false,
      })
    );
  }
  yield put(setStatusLoading(false));
}

export const switchAppStatusWatcher = createWatcher(switchAppStatusWorker, SWITCH_APP_STATUS);