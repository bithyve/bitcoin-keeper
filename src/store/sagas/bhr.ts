import { call, put } from 'redux-saga/effects';
import _ from 'lodash';
import * as bip39 from 'bip39';
import { AppTierLevel } from 'src/common/data/enums/AppTierLevel';
import { KeeperApp, UserTier } from 'src/common/data/models/interfaces/KeeperApp';
import { Wallet, WalletShell } from 'src/core/wallets/interfaces/wallet';
import { decrypt, encrypt, generateEncryptionKey } from 'src/core/services/operations/encryption';
import DeviceInfo from 'react-native-device-info';
import { RealmSchema } from 'src/storage/realm/enum';
import {
  GET_APP_IMAGE,
  UPDATE_APP_IMAGE,
  SEED_BACKEDUP,
  SEED_BACKEDUP_CONFIRMED,
  INIT_CLOUD_BACKUP,
  CLOUD_BACKUP_SKIPPED,
  CONFIRM_CLOUD_BACKUP,
  GET_CLOUD_DATA,
  RECOVER_BACKUP,
  getAppImage,
  UPADTE_HEALTH_CHECK_SIGNER,
} from '../sagaActions/bhr';
import { createWatcher } from '../utilities';
import { BackupAction, BackupType } from '../../common/data/enums/BHR';
import moment from 'moment';
import WalletUtilities from 'src/core/wallets/operations/utils';
import {
  appImagerecoveryRetry,
  setAppImageError,
  setAppImageRecoverd,
  setAppRecoveryLoading,
  setAppRecreated,
  setBackupError,
  setBackupLoading,
  setBackupType,
  setCloudBackupCompleted,
  setCloudBackupConfirmed,
  setCloudData,
  setDownloadingBackup,
  setInvalidPassword,
  setSeedConfirmed,
} from '../reducers/bhr';
import { uploadData, getCloudBackupData } from 'src/nativemodules/Cloud';
import { Platform } from 'react-native';
import { translations } from 'src/common/content/LocContext';
import BIP85 from 'src/core/wallets/operations/BIP85';
import config from 'src/core/config';
import { refreshWallets } from '../sagaActions/wallets';
import Relay from 'src/core/services/operations/Relay';
import dbManager from 'src/storage/realm/dbManager';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';

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

function getCloudErrorMessage(code) {
  try {
    const errorMessages = Platform.select({
      android: translations['driveErrors'],
      ios: translations['iCloudErrors'],
    });
    return errorMessages[code] || '';
  } catch (error) {
    return '';
  }
}

function* cloudBackupSkippedWorked() {
  try {
    yield call(dbManager.createObject, RealmSchema.BackupHistory, {
      title: BackupAction.CLOUD_BACKUP_CONFIRMATION_SKIPPED,
      date: moment().unix(),
      confirmed: false,
      subtitle: '',
    });
  } catch (error) {}
}

function* confirmCloudBackupWorked({
  payload,
}: {
  payload: {
    password: string;
  };
}) {
  try {
    const { password } = payload;
    const { id, primaryMnemonic }: KeeperApp = yield call(
      dbManager.getObjectByIndex,
      RealmSchema.KeeperApp
    );
    const response = yield call(getCloudBackupData);
    if (response.status) {
      let backup;
      if (Platform.OS === 'android') {
        backup = JSON.parse(response.data).find((backup) => backup.appID === id);
      } else {
        backup = response.data.find((backup) => backup?.appID === id);
      }
      if (backup) {
        const dec = decrypt(password, backup.encData);
        const obj = JSON.parse(dec);
        if (obj.seed && obj.seed === primaryMnemonic) {
          yield call(dbManager.createObject, RealmSchema.BackupHistory, {
            title: BackupAction.CLOUD_BACKUP_CONFIRMED,
            date: moment().unix(),
            confirmed: true,
            subtitle: '',
          });
          yield put(setCloudBackupConfirmed(true));
        }
      } else {
        // backup does not exists
        yield call(dbManager.createObject, RealmSchema.BackupHistory, {
          title: BackupAction.CLOUD_BACKUP_FAILED,
          date: moment().unix(),
          confirmed: false,
          subtitle: 'Unable to access cloud backup',
        });
        yield put(setCloudBackupConfirmed(false));
      }
    } else {
      const errMsg = getCloudErrorMessage(response.code) || '';
      yield call(dbManager.createObject, RealmSchema.BackupHistory, {
        title: BackupAction.CLOUD_BACKUP_FAILED,
        date: moment().unix(),
        confirmed: false,
        subtitle: `${errMsg} ${response.code ? `(code ${response.code}` : ''})`,
      });
      yield put(setCloudBackupConfirmed(false));
    }
    yield call(dbManager.createObject, RealmSchema.BackupHistory, {
      title: BackupAction.CLOUD_BACKUP_CONFIRMED,
      date: moment().unix(),
      confirmed: true,
      subtitle: '',
    });
    yield put(setCloudBackupConfirmed(false));

    yield put(setCloudBackupConfirmed(true));
  } catch (error) {
    console.log(error);
    yield put(setCloudBackupConfirmed(false));
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
      const errMsg = getCloudErrorMessage(response.code) || '';
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
    yield put(setBackupError({ isError: true, error: `${error}` }));
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
  const { primaryMnemonic } = payload;
  try {
    setAppImageError(false);
    setAppRecoveryLoading(true);
    const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);
    const id = WalletUtilities.getFingerprintFromSeed(primarySeed);
    const encryptionKey = generateEncryptionKey(primarySeed.toString('hex'));
    const appImage: any = yield call(Relay.getAppImage, id);
    console.log('appImage', appImage);
    if (appImage) {
      yield put(setAppImageRecoverd(true));
      const userTier: UserTier = {
        level: AppTierLevel.ONE,
      };
      const entropy = yield call(
        BIP85.bip39MnemonicToEntropy,
        config.BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH,
        primaryMnemonic
      );
      const imageEncryptionKey = generateEncryptionKey(entropy.toString('hex'));
      const app = {
        id,
        primarySeed: primarySeed.toString('hex'),
        walletShellInstances: JSON.parse(appImage.walletShellInstances),
        primaryMnemonic: primaryMnemonic,
        imageEncryptionKey,
        userTier,
        version: DeviceInfo.getVersion(),
      };
      yield call(dbManager.createObject, RealmSchema.KeeperApp, app);
      yield call(
        dbManager.createObject,
        RealmSchema.WalletShell,
        JSON.parse(appImage.walletShells)
      );

      //Wallet recreation
      if (appImage) {
        if (appImage.wallets) {
          for (const [key, value] of Object.entries(appImage.wallets)) {
            const decrytpedWallet = JSON.parse(decrypt(encryptionKey, value));
            yield call(dbManager.createObject, RealmSchema.Wallet, decrytpedWallet);
            yield put(refreshWallets([decrytpedWallet], { hardRefresh: true }));
          }
        }
        yield put(setAppRecreated(true));
      }
    }
  } catch (err) {
    console.log(err);
    yield put(setAppImageError(true));
  } finally {
    yield put(setAppRecoveryLoading(false));
    yield put(appImagerecoveryRetry());
  }
}

function* getCloudDataWorker() {
  try {
    yield put(setDownloadingBackup(true));
    const response = yield call(getCloudBackupData);
    console.log('response', response);
    if (response.status) {
      let backup;
      if (Platform.OS === 'android') {
        backup = JSON.parse(response.data);
      } else {
        backup = response.data;
      }
      yield put(setCloudData(backup));
    } else {
      yield put(setDownloadingBackup(false));
      const errMsg = getCloudErrorMessage(response.code) || '';
      yield put(setBackupError({ isError: true, error: errMsg }));
    }
  } catch (error) {
    console.log(error);
    yield put(setBackupError({ isError: true, error: 'Unknown error' }));
    yield put(setDownloadingBackup(false));
  }
}

function* recoverBackupWorker({
  payload,
}: {
  payload: {
    password: string;
    encData: string;
  };
}) {
  try {
    const { password, encData } = payload;
    const dec = decrypt(password, encData);
    console.log(dec);
    const obj = JSON.parse(dec);
    if (obj.seed) {
      yield put(getAppImage(obj.seed));
      yield put(setInvalidPassword(false));
    } else {
      yield put(setInvalidPassword(true));
    }
  } catch (error) {
    yield put(setInvalidPassword(true));
    console.log(error);
  }
}

function* healthCheckSignerWorker({
  payload,
}: {
  payload: {
    vaultId: string;
    signerId: string;
  };
}) {
  try {
    const { vaultId, signerId } = payload;
    console.log(vaultId, signerId);
    const vault: Vault = yield call(dbManager.getObjectById, RealmSchema.Vault, vaultId);
    const signers = vault.signers.map((signer: VaultSigner) => {
      if (signer.signerId === signerId) {
        let updatedSigner = JSON.parse(JSON.stringify(signer));
        updatedSigner.lastHealthCheck = new Date();
        return updatedSigner;
      }
      return signer;
    });
    let updatedVault: Vault = JSON.parse(JSON.stringify(vault));
    updatedVault.signers = signers;
    yield call(dbManager.updateObjectById, RealmSchema.Vault, vaultId, vault);
  } catch (err) {
    console.log(err);
  }
}

export const updateAppImageWatcher = createWatcher(updateAppImageWorker, UPDATE_APP_IMAGE);
export const getAppImageWatcher = createWatcher(getAppImageWorker, GET_APP_IMAGE);
export const seedBackedUpWatcher = createWatcher(seedBackedUpWorker, SEED_BACKEDUP);
export const initCloudBackupWatcher = createWatcher(initCloudBackupWorked, INIT_CLOUD_BACKUP);
export const cloudBackupSkippedWatcher = createWatcher(
  cloudBackupSkippedWorked,
  CLOUD_BACKUP_SKIPPED
);
export const confirmCloudBackupWatcher = createWatcher(
  confirmCloudBackupWorked,
  CONFIRM_CLOUD_BACKUP
);
export const seedBackeupConfirmedWatcher = createWatcher(
  seedBackeupConfirmedWorked,
  SEED_BACKEDUP_CONFIRMED
);
export const getCloudDataWatcher = createWatcher(getCloudDataWorker, GET_CLOUD_DATA);
export const recoverBackupWatcher = createWatcher(recoverBackupWorker, RECOVER_BACKUP);
export const healthCheckSignerWatcher = createWatcher(
  healthCheckSignerWorker,
  UPADTE_HEALTH_CHECK_SIGNER
);
