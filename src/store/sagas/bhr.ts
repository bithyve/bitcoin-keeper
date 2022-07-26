import { call, put } from 'redux-saga/effects';
import { AppTierLevel } from 'src/common/data/enums/AppTierLevel';
import { KeeperApp, UserTier } from 'src/common/data/models/interfaces/KeeperApp';
import { decrypt, encrypt, generateEncryptionKey } from 'src/core/services/operations/encryption';
import Relay from 'src/core/services/operations/Relay';
import { Wallet, WalletShell } from 'src/core/wallets/interfaces/wallet';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import {
  GET_APP_IMAGE,
  UPDATE_APP_IMAGE,
  SEED_BACKEDUP,
  SEED_BACKEDUP_CONFIRMED,
  INIT_CLOUD_BACKUP,
} from '../sagaActions/bhr';
import { createWatcher } from '../utilities';
import DeviceInfo from 'react-native-device-info';
import { BackupAction, BackupType } from 'src/common/data/enums/BHR';
import moment from 'moment';
import {
  setBackupError,
  setBackupLoading,
  setBackupType,
  setCloudBackupCompleted,
  setSeedConfirmed,
} from '../reducers/bhr';
import { uploadData } from 'src/nativemodules/Cloud';
import { Platform } from 'react-native';
import { translations } from 'src/common/content/LocContext';

function* updateAppImageWorker({ payload }) {
  const { walletId } = payload;

  const { primarySeed, id, walletShellInstances, primaryMnemonic }: KeeperApp = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.KeeperApp
  );
  const walletShells: WalletShell[] = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.WalletShell,
    0,
    true
  );

  let walletObject = {};
  if (walletId) {
    const wallet: Wallet = yield call(dbManager.getObjectById, RealmSchema.Wallet, walletId);
    const encryptionKey = generateEncryptionKey(primarySeed);
    console.log('primary Seed', primarySeed);
    console.log('nmeomeon', primaryMnemonic);
    console.log('encryptionKey', encryptionKey);
    const encrytedWallet = encrypt(encryptionKey, JSON.stringify(wallet));
    walletObject[wallet.id] = encrytedWallet;
    try {
      Relay.updateAppImage({
        id,
        walletObject,
        walletShellInstances: JSON.stringify(walletShellInstances),
        walletShells: JSON.stringify(walletShells[0]),
      });
    } catch (err) {
      console.error('update failed', err);
    }
  }
}

function* seedBackeupConfirmedWorked({
  payload,
}: {
  payload: {
    confirmed: boolean;
  };
}) {
  try {
    const { confirmed } = payload;
    yield call(dbManager.createObject, RealmSchema.BackupHistory, {
      title: confirmed
        ? BackupAction.SEED_BACKUP_CONFIRMED
        : BackupAction.SEED_BACKUP_CONFIRMATION_SKIPPED,
      date: moment().unix(),
      confirmed: confirmed,
      subtitle: '',
    });
    yield put(setSeedConfirmed(confirmed));
  } catch (error) {}
}

function* initCloudBackupWorked({
  payload,
}: {
  payload: {
    password: string;
    hint?: string;
  };
}) {
  try {
    yield put(setBackupLoading(true));
    const { password, hint } = payload;
    const { id, primaryMnemonic }: KeeperApp = yield call(
      dbManager.getObjectByIndex,
      RealmSchema.KeeperApp
    );
    yield call(dbManager.updateObjectById, RealmSchema.KeeperApp, id, {
      backupMethod: BackupType.CLOUD,
      backupPassword: password,
      backupPasswordHint: hint,
    });
    const data = {
      seed: primaryMnemonic,
    };
    const response = yield call(uploadData, id, {
      encData: encrypt(password, JSON.stringify(data)),
      hint: hint,
    });
    console.log(response);
    if (response.status) {
      yield put(setBackupType(BackupType.CLOUD));
      yield call(dbManager.createObject, RealmSchema.BackupHistory, {
        title: BackupAction.CLOUD_BACKUP_CREATED,
        date: moment().unix(),
        confirmed: true,
        subtitle: '',
      });
      yield put(setCloudBackupCompleted());
    } else {
      const errorMessages = Platform.select({
        android: translations['driveErrors'],
        ios: translations['iCloudErrors'],
      });
      const errMsg = errorMessages[response.code] || '';
      yield call(dbManager.createObject, RealmSchema.BackupHistory, {
        title: BackupAction.CLOUD_BACKUP_FAILED,
        date: moment().unix(),
        confirmed: true,
        subtitle: `${errMsg} ${response.code ? `(code ${response.code}` : ''})`,
      });
      yield put(setBackupError({ isError: true, error: errMsg }));
      yield put(setBackupLoading(false));
    }
  } catch (error) {
    yield put(setBackupError({ isError: true, error: 'Unknown error' }));
    yield put(setBackupLoading(false));
    console.log(error);
  }
}

function* seedBackedUpWorker() {
  try {
    const { id }: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    yield call(dbManager.createObject, RealmSchema.BackupHistory, {
      title: BackupAction.SEED_BACKUP_CREATED,
      date: moment().unix(),
      confirmed: true,
      subtitle: '',
    });
    yield call(dbManager.updateObjectById, RealmSchema.KeeperApp, id, {
      backupMethod: BackupType.SEED,
    });
    yield put(setBackupType(BackupType.SEED));
  } catch (error) {
    console.log(error);
  }
}

function* getAppImageWorker({ payload }) {
  const { id, primarySeed } = payload;
  try {
    const encryptionKey = generateEncryptionKey(primarySeed);
    const appImage: any = yield Relay.getAppImage(id);

    //Keeper-App Reacreation
    const userTier: UserTier = {
      level: AppTierLevel.ONE,
    };
    const app = {
      id,
      primarySeed,
      walletShellInstances: JSON.parse(appImage.walletShellInstances),
      userTier,
      version: DeviceInfo.getVersion(),
    };
    yield call(dbManager.createObject, RealmSchema.KeeperApp, app);
    yield call(dbManager.createObject, RealmSchema.WalletShell, JSON.parse(appImage.walletShells));

    //Wallet recreation
    if (appImage) {
      if (appImage.wallets) {
        for (const [key, value] of Object.entries(appImage.wallets)) {
          yield call(
            dbManager.createObject,
            RealmSchema.Wallet,
            JSON.parse(decrypt(encryptionKey, value))
          );
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}

export const updateAppImageWatcher = createWatcher(updateAppImageWorker, UPDATE_APP_IMAGE);
export const getAppImageWatcher = createWatcher(getAppImageWorker, GET_APP_IMAGE);
export const seedBackedUpWatcher = createWatcher(seedBackedUpWorker, SEED_BACKEDUP);
export const initCloudBackupWatcher = createWatcher(initCloudBackupWorked, INIT_CLOUD_BACKUP);
export const seedBackeupConfirmedWatcher = createWatcher(
  seedBackeupConfirmedWorked,
  SEED_BACKEDUP_CONFIRMED
);
