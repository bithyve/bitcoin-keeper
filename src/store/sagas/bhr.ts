/* eslint-disable guard-for-in */
import * as bip39 from 'bip39';

import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { call, put } from 'redux-saga/effects';
import config, { APP_STAGE } from 'src/core/config';
import {
  decrypt,
  encrypt,
  generateEncryptionKey,
  hash256,
} from 'src/core/services/operations/encryption';
import BIP85 from 'src/core/wallets/operations/BIP85';
import DeviceInfo from 'react-native-device-info';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import Relay from 'src/core/services/operations/Relay';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { captureError } from 'src/core/services/sentry';
import crypto from 'crypto';
import dbManager from 'src/storage/realm/dbManager';
import moment from 'moment';
import { refreshWallets, updateSignerDetails } from '../sagaActions/wallets';
import { createWatcher } from '../utilities';
import {
  appImagerecoveryRetry,
  setAppImageError,
  setAppImageRecoverd,
  setAppRecoveryLoading,
  setBackupLoading,
  setBackupType,
  setBackupWarning,
  setCloudBackupCompleted,
  setCloudBackupConfirmed,
  setCloudData,
  setDownloadingBackup,
  setInvalidPassword,
  setSeedConfirmed,
} from '../reducers/bhr';
import {
  CLOUD_BACKUP_SKIPPED,
  CONFIRM_CLOUD_BACKUP,
  GET_APP_IMAGE,
  GET_CLOUD_DATA,
  INIT_CLOUD_BACKUP,
  RECOVER_BACKUP,
  SEED_BACKEDUP,
  SEED_BACKEDUP_CONFIRMED,
  SET_BACKUP_WARNING,
  UPADTE_HEALTH_CHECK_SIGNER,
  UPDATE_APP_IMAGE,
  UPDATE_VAULT_IMAGE,
  getAppImage,
} from '../sagaActions/bhr';
import { BackupAction, BackupHistory, BackupType } from '../../common/data/enums/BHR';
import { uaiActionedEntity } from '../sagaActions/uai';
import { setAppId } from '../reducers/storage';

export function* updateAppImageWorker({ payload }) {
  const { wallet } = payload;
  const { primarySeed, id, appID, subscription, networkType, version }: KeeperApp = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.KeeperApp
  );
  const walletObject = {};
  const encryptionKey = generateEncryptionKey(primarySeed);
  if (wallet) {
    const encrytedWallet = encrypt(encryptionKey, JSON.stringify(wallet));
    walletObject[wallet.id] = encrytedWallet;
  } else {
    const wallets: Wallet[] = yield call(dbManager.getCollection, RealmSchema.Wallet);
    for (const index in wallets) {
      const wallet = wallets[index];
      const encrytedWallet = encrypt(encryptionKey, JSON.stringify(wallet));
      walletObject[wallet.id] = encrytedWallet;
    }
  }
  try {
    const response = yield call(Relay.updateAppImage, {
      id,
      appID,
      walletObject,
      networkType,
      subscription: JSON.stringify(subscription),
      version,
    });
    return response;
  } catch (err) {
    console.log({ err });
    console.error('App image update failed', err);
  }
}

export function* updateVaultImageWorker({
  payload,
}: {
  payload: {
    vault: Vault;
    archiveVaultId?: String;
    isUpdate?: Boolean;
  };
}) {
  const { vault, archiveVaultId, isUpdate } = payload;
  const { primarySeed, id, subscription }: KeeperApp = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.KeeperApp
  );
  const encryptionKey = generateEncryptionKey(primarySeed);

  const vaultEncrypted = encrypt(encryptionKey, JSON.stringify(vault));

  if (isUpdate) {
    Relay.updateVaultImage({
      isUpdate,
      vaultId: vault.id,
      vault: vaultEncrypted,
    });
  }

  const signersData: Array<{
    signerId: String;
    xfpHash: String;
  }> = [];
  const signerIdXpubMap = {};
  for (const signer of vault.signers) {
    signerIdXpubMap[signer.signerId] = signer.xpub;
    signersData.push({
      signerId: signer.signerId,
      xfpHash: hash256(signer.masterFingerprint),
    });
  }
  // updating signerIdXpubMap if the signer was created through automated mock flow
  // const signerIdsToFilter = [];
  // for (const signer of vault.signers) {
  //   if (signer.amfData && signer.amfData.xpub) {
  //     signerIdXpubMap[signer.amfData.signerId] = signer.amfData.xpub;
  //     signersData.push({
  //       signerId: signer.amfData.signerId,
  //       xfpHash: hash256(signer.xpubInfo.xfp),
  //     });
  //     signerIdsToFilter.push(signer.signerId);
  //   }
  // }
  // signersData = signersData.filter((signer) => !signerIdsToFilter.includes(signer.signerId));

  // TO-DO to be removed
  const subscriptionStrings = JSON.stringify(subscription);

  try {
    if (archiveVaultId) {
      const response = yield call(Relay.updateVaultImage, {
        appID: id,
        vaultId: vault.id,
        scheme: vault.scheme,
        signersData,
        vault: vaultEncrypted,
        subscription: subscriptionStrings,
        archiveVaultId,
      });
      return response;
    }
    const response = yield call(Relay.updateVaultImage, {
      appID: id,
      vaultId: vault.id,
      scheme: vault.scheme,
      signersData,
      vault: vaultEncrypted,
      subscription: subscriptionStrings,
    });
    return response;
  } catch (err) {
    captureError(err);
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
      confirmed,
      subtitle: '',
    });
    yield put(setSeedConfirmed(confirmed));
  } catch (error) {}
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
      backup: {
        method: BackupType.SEED,
      },
    });
    yield put(setBackupType(BackupType.SEED));
  } catch (error) {
    console.log(error);
  }
}

function* getAppImageWorker({ payload }) {
  const { primaryMnemonic } = payload;
  try {
    yield put(setAppImageError(false));
    yield put(setAppRecoveryLoading(true));
    const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);
    const id = crypto.createHash('sha256').update(primarySeed).digest('hex');
    const encryptionKey = generateEncryptionKey(primarySeed.toString('hex'));
    const { appImage, vaultImage } = yield call(Relay.getAppImage, id);
    if (appImage) {
      yield put(setAppImageRecoverd(true));
      const entropy = yield call(
        BIP85.bip39MnemonicToEntropy,
        config.BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH,
        primaryMnemonic
      );
      const imageEncryptionKey = generateEncryptionKey(entropy.toString('hex'));
      const app: KeeperApp = {
        id,
        appID: appImage.appId,
        primarySeed: primarySeed.toString('hex'),
        primaryMnemonic,
        imageEncryptionKey,
        subscription: JSON.parse(appImage.subscription),
        backup: {},
        version: DeviceInfo.getVersion(),
        networkType: config.NETWORK_TYPE,
      };

      yield call(dbManager.createObject, RealmSchema.KeeperApp, app);

      // Wallet recreation
      if (appImage.wallets) {
        for (const [key, value] of Object.entries(appImage.wallets)) {
          const decrytpedWallet = JSON.parse(decrypt(encryptionKey, value));
          yield call(dbManager.createObject, RealmSchema.Wallet, decrytpedWallet);
          yield put(refreshWallets([decrytpedWallet], { hardRefresh: true }));
        }
      }

      // Vault recreation
      if (vaultImage) {
        const vault = JSON.parse(decrypt(encryptionKey, vaultImage.vault));
        yield call(dbManager.createObject, RealmSchema.Vault, vault);
      }
      yield put(setAppId(app.appID));
    }
  } catch (err) {
    console.log(err);
    yield put(setAppImageError(true));
  } finally {
    yield put(setAppRecoveryLoading(false));
    yield put(appImagerecoveryRetry());
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
    const vault: Vault = yield call(dbManager.getObjectById, RealmSchema.Vault, vaultId);
    for (const signer of vault.signers) {
      if (signer.signerId === signerId) {
        const date = new Date();
        yield put(updateSignerDetails(signer, 'lastHealthCheck', date));
        yield put(uaiActionedEntity(signer.signerId));
      }
    }
  } catch (err) {
    console.log(err);
  }
}

function* isBackedUP({
  payload,
}: {
  payload: {
    history: BackupHistory;
  };
}) {
  const { history } = payload;
  const lastRecord = history[history.length - 1];

  if (lastRecord) {
    const currentDate = new Date();
    const lastBackup = new Date(history[history.length - 1].date);
    const devWarning = currentDate.getTime() - lastBackup.getTime() > 30;
    const ProductionWarning =
      (currentDate.getTime() - lastBackup.getTime()) / (1000 * 3600 * 24) > 30;
    const selectedWarning =
      config.ENVIRONMENT === APP_STAGE.DEVELOPMENT ? devWarning : ProductionWarning;

    if (
      selectedWarning &&
      (lastRecord.title === BackupAction.SEED_BACKUP_CONFIRMATION_SKIPPED ||
        lastRecord.title === BackupAction.CLOUD_BACKUP_FAILED ||
        lastRecord.title === BackupAction.CLOUD_BACKUP_CONFIRMATION_FAILED ||
        lastRecord.title === BackupAction.CLOUD_BACKUP_CONFIRMATION_SKIPPED)
    ) {
      // UAI update here

      yield put(setBackupWarning(true));
    }
  }
  yield put(setBackupWarning(false));
}

export const updateAppImageWatcher = createWatcher(updateAppImageWorker, UPDATE_APP_IMAGE);
export const updateVaultImageWatcher = createWatcher(updateVaultImageWorker, UPDATE_VAULT_IMAGE);

export const getAppImageWatcher = createWatcher(getAppImageWorker, GET_APP_IMAGE);
export const seedBackedUpWatcher = createWatcher(seedBackedUpWorker, SEED_BACKEDUP);

export const backupWarningWatcher = createWatcher(isBackedUP, SET_BACKUP_WARNING);

export const seedBackeupConfirmedWatcher = createWatcher(
  seedBackeupConfirmedWorked,
  SEED_BACKEDUP_CONFIRMED
);

export const recoverBackupWatcher = createWatcher(recoverBackupWorker, RECOVER_BACKUP);
export const healthCheckSignerWatcher = createWatcher(
  healthCheckSignerWorker,
  UPADTE_HEALTH_CHECK_SIGNER
);
