import * as bip39 from 'bip39';

import { Wallet, WalletShell } from 'src/core/wallets/interfaces/wallet';
import { call, put, select } from 'redux-saga/effects';
import config, { APP_STAGE } from 'src/core/config';
import {
  decrypt,
  encrypt,
  generateEncryptionKey,
  hash256,
} from 'src/core/services/operations/encryption';
import { decryptVAC, encryptVAC, generateIDForVAC } from 'src/core/wallets/factories/VaultFactory';
import { getCloudBackupData, uploadData } from 'src/nativemodules/Cloud';

import BIP85 from 'src/core/wallets/operations/BIP85';
import DeviceInfo from 'react-native-device-info';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { Platform } from 'react-native';
import { RealmSchema } from 'src/storage/realm/enum';
import Relay from 'src/core/services/operations/Relay';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { captureError } from 'src/core/services/sentry';
import crypto from 'crypto';
import dbManager from 'src/storage/realm/dbManager';
import moment from 'moment';
import { translations } from 'src/common/content/LocContext';
import { refreshWallets, updateSignerDetails } from '../sagaActions/wallets';
import { setupKeeperAppVaultReovery } from '../sagaActions/storage';
import { createWatcher } from '../utilities';
import { RootState } from '../store';
import {
  appImagerecoveryRetry,
  setAppImageError,
  setAppImageRecoverd,
  setAppRecoveryLoading,
  setAppRecreated,
  setBackupError,
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
  RECOVER_VAULT,
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

const generateCombinations = (sourceArray, comboLength) => {
  const sourceLength = sourceArray.length;
  if (comboLength > sourceLength) return [];
  const combos = [];
  const makeNextCombos = (workingCombo, currentIndex, remainingCount) => {
    const oneAwayFromComboLength = remainingCount == 1;
    for (let sourceIndex = currentIndex; sourceIndex < sourceLength; sourceIndex++) {
      const next = [...workingCombo, sourceArray[sourceIndex]];
      if (oneAwayFromComboLength) {
        combos.push(next);
      } else {
        makeNextCombos(next, sourceIndex + 1, remainingCount - 1);
      }
    }
  };

  makeNextCombos([], 0, comboLength);
  return combos;
};

const createVACMap = (signerIds, signerIdXpubMap, m, vac) => {
  const vacMap: any = {};
  const allcombination = generateCombinations(signerIds, m);

  allcombination.forEach((signerIdsCombination) => {
    const xpubs = signerIdsCombination.map((signerId) => signerIdXpubMap[signerId]);
    const key = signerIdsCombination.sort().toString();
    const hashKey = generateIDForVAC(key);
    const encryptyVAC = encryptVAC(vac, xpubs);
    vacMap[hashKey] = encryptyVAC;
  });

  return vacMap;
};

export function* updateAppImageWorker({ payload }) {
  const { wallet } = payload;
  const { primarySeed, appID, walletShellInstances, subscription, networkType }: KeeperApp =
    yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);

  const walletShells: WalletShell[] = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.WalletShell,
    0,
    true
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
      appID,
      walletObject,
      networkType,
      walletShellInstances: JSON.stringify(walletShellInstances),
      walletShells: JSON.stringify(walletShells[0]),
      subscription: JSON.stringify(subscription),
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
  const { primarySeed, appID, vaultShellInstances, subscription }: KeeperApp = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.KeeperApp
  );

  // Vault Encrypted with VAC
  const vaultEncryptedVAC = encrypt(vault.VAC, JSON.stringify(vault));

  if (isUpdate) {
    Relay.updateVaultImage({
      isUpdate,
      vaultId: vault.id,
      vaultEncryptedVAC,
    });
  }
  const { m } = vault.scheme;

  let signersData: Array<{
    signerId: String;
    xfpHash: String;
  }> = [];
  const signerIdXpubMap = {};
  for (const signer of vault.signers) {
    signerIdXpubMap[signer.signerId] = signer.xpub;
    signersData.push({ signerId: signer.signerId, xfpHash: hash256(signer.xpubInfo.xfp) });
  }
  // updating signerIdXpubMap if the signer was created through automated mock flow
  const signerIdsToFilter = [];
  for (const signer of vault.signers) {
    if (signer.amfData && signer.amfData.xpub) {
      signerIdXpubMap[signer.amfData.signerId] = signer.amfData.xpub;
      signersData.push({
        signerId: signer.amfData.signerId,
        xfpHash: hash256(signer.xpubInfo.xfp),
      });
      signerIdsToFilter.push(signer.signerId);
    }
  }
  signersData = signersData.filter((signer) => !signerIdsToFilter.includes(signer.signerId));

  const signerIds = signersData.map((signer) => signer.signerId);
  const vaultShellInstancesString = JSON.stringify(vaultShellInstances);
  const subscriptionStrings = JSON.stringify(subscription);
  const encryptionKey = generateEncryptionKey(primarySeed);
  const vacEncryptedApp = encrypt(encryptionKey, vault.VAC);
  const vacMap = createVACMap(signerIds, signerIdXpubMap, m, vault.VAC);

  try {
    if (archiveVaultId) {
      const response = yield call(Relay.updateVaultImage, {
        appID,
        vaultId: vault.id,
        m,
        vacEncryptedApp,
        signersData,
        vaultEncryptedVAC,
        vaultShellInstances: vaultShellInstancesString,
        vacMap,
        subscription: subscriptionStrings,
        archiveVaultId,
      });
      return response;
    }
    const response = yield call(Relay.updateVaultImage, {
      appID,
      vaultId: vault.id,
      m,
      vacEncryptedApp,
      signersData,
      vaultEncryptedVAC,
      vaultShellInstances: vaultShellInstancesString,
      vacMap,
      subscription: subscriptionStrings,
    });
    return response;
  } catch (err) {
    captureError(err);
  }
}

function getCloudErrorMessage(code) {
  try {
    const errorMessages = Platform.select({
      android: translations.driveErrors,
      ios: translations.iCloudErrors,
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
      confirmed,
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
      hint,
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
    yield put(setAppImageError(false));
    yield put(setAppRecoveryLoading(true));
    const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);
    const appId = WalletUtilities.getFingerprintFromSeed(primarySeed);
    const encryptionKey = generateEncryptionKey(primarySeed.toString('hex'));
    const { appImage, vaultImage } = yield call(Relay.getAppImage, appId);
    if (appImage) {
      yield put(setAppImageRecoverd(true));
      const entropy = yield call(
        BIP85.bip39MnemonicToEntropy,
        config.BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH,
        primaryMnemonic
      );
      const imageEncryptionKey = generateEncryptionKey(entropy.toString('hex'));

      const app: KeeperApp = {
        id: crypto.createHash('sha256').update(primarySeed).digest('hex'),
        appID: appImage.appId,
        primarySeed: primarySeed.toString('hex'),
        walletShellInstances: JSON.parse(appImage.walletShellInstances),
        primaryMnemonic,
        imageEncryptionKey,
        subscription: appImage.subscription,
        version: DeviceInfo.getVersion(),
        vaultShellInstances: appImage.vaultShellInstances
          ? JSON.parse(appImage.vaultShellInstances)
          : null,
        networkType: appImage.networkType,
      };
      console.log({ app });

      yield call(dbManager.createObject, RealmSchema.KeeperApp, app);
      yield call(
        dbManager.createObject,
        RealmSchema.WalletShell,
        JSON.parse(appImage.walletShells)
      );

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
        const vac = decrypt(encryptionKey, vaultImage.vac);
        const vault = JSON.parse(decrypt(vac, vaultImage.vault));
        yield call(dbManager.createObject, RealmSchema.Vault, vault);
      }
      yield put(setAppId(app.appID));
      yield put(setAppRecreated(true));
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

function* recoverVaultWorker() {
  const signingDevices = yield select((state: RootState) => state.bhr.signingDevices); // UI m
  const vaultMetaData = yield select((state: RootState) => state.bhr.vaultMetaData); // Api Call for 1st Vault
  const signerIds = [];
  const xpubs = [];
  for (const signer of signingDevices) {
    signerIds.push(signer.signerId);
    xpubs.push(signer.xpub);
  }
  const key = signerIds.sort().toString();
  const hashKey = generateIDForVAC(key);
  const encrytedVac = yield call(Relay.getVac, hashKey); // API encryted of m combination

  if (encrytedVac) {
    console.log({ xpubs, encrytedVac });
    const vac = decryptVAC(encrytedVac, xpubs);
    const vault = decrypt(vac, vaultMetaData.vault);
    yield put(
      setupKeeperAppVaultReovery(
        JSON.parse(vaultMetaData.vaultShellInstances),
        JSON.parse(vaultMetaData.subscription)
      )
    );
    yield call(dbManager.createObject, RealmSchema.Vault, JSON.parse(vault));
  }
}

export const updateAppImageWatcher = createWatcher(updateAppImageWorker, UPDATE_APP_IMAGE);
export const updateVaultImageWatcher = createWatcher(updateVaultImageWorker, UPDATE_VAULT_IMAGE);

export const getAppImageWatcher = createWatcher(getAppImageWorker, GET_APP_IMAGE);
export const seedBackedUpWatcher = createWatcher(seedBackedUpWorker, SEED_BACKEDUP);
export const initCloudBackupWatcher = createWatcher(initCloudBackupWorked, INIT_CLOUD_BACKUP);
export const backupWarningWatcher = createWatcher(isBackedUP, SET_BACKUP_WARNING);
export const recoverVaultWatcher = createWatcher(recoverVaultWorker, RECOVER_VAULT);

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
