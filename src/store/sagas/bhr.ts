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
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { captureError } from 'src/core/services/sentry';
import crypto from 'crypto';
import dbManager from 'src/storage/realm/dbManager';
import moment from 'moment';
import WalletUtilities from 'src/core/wallets/operations/utils';
import semver from 'semver';
import { NodeDetail } from 'src/core/wallets/interfaces';
import { AppSubscriptionLevel, SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import {
  refreshWallets,
  updateSignerDetails,
  addNewWhirlpoolWallets,
} from '../sagaActions/wallets';
import { createWatcher } from '../utilities';
import {
  appImagerecoveryRetry,
  setAppImageError,
  setAppImageRecoverd,
  setAppRecoveryLoading,
  setBackupType,
  setBackupWarning,
  setInvalidPassword,
  setSeedConfirmed,
} from '../reducers/bhr';
import {
  GET_APP_IMAGE,
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
import { applyRestoreSequence } from './restoreUpgrade';
import { UAI } from 'src/common/data/models/interfaces/Uai';

export function* updateAppImageWorker({ payload }) {
  const { wallets } = payload;
  const { primarySeed, id, publicId, subscription, networkType, version }: KeeperApp = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.KeeperApp
  );
  const walletObject = {};
  const encryptionKey = generateEncryptionKey(primarySeed);
  if (wallets) {
    for (const wallet of wallets) {
      const encrytedWallet = encrypt(encryptionKey, JSON.stringify(wallet));
      walletObject[wallet.id] = encrytedWallet;
    }
  } else {
    const wallets: Wallet[] = yield call(dbManager.getCollection, RealmSchema.Wallet);
    for (const index in wallets) {
      const wallet = wallets[index];
      const encrytedWallet = encrypt(encryptionKey, JSON.stringify(wallet));
      walletObject[wallet.id] = encrytedWallet;
    }
  }

  const nodes: NodeDetail[] = yield call(dbManager.getCollection, RealmSchema.NodeConnect);
  const nodesToUpdate = [];
  if (nodes && nodes.length > 0) {
    for (const index in nodes) {
      const node = nodes[index];
      node.isConnected = false;
      const encrytedNode = encrypt(encryptionKey, JSON.stringify(node));
      nodesToUpdate.push(encrytedNode);
    }
  }
  try {
    const response = yield call(Relay.updateAppImage, {
      appId: id,
      publicId,
      walletObject,
      networkType,
      subscription: JSON.stringify(subscription),
      version,
      nodes: nodesToUpdate,
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
    archiveVaultId?: string;
    isUpdate?: boolean;
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
    signerId: string;
    xfpHash: string;
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
        vaultShellId: vault.shellId,
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
      vaultShellId: vault.shellId,
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
  } catch (error) {
    //
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
    const appID = crypto.createHash('sha256').update(primarySeed).digest('hex');
    const encryptionKey = generateEncryptionKey(primarySeed.toString('hex'));
    const { appImage, vaultImage, subscription, UTXOinfos } = yield call(Relay.getAppImage, appID);

    // applying the restore upgrade sequence if required
    const previousVersion = appImage.version;
    const newVersion = DeviceInfo.getVersion();
    if (semver.lt(previousVersion, newVersion)) {
      yield call(applyRestoreSequence, {
        previousVersion,
        newVersion,
        appImage,
        vaultImage,
        encryptionKey,
      });
    }
    if (appImage && subscription) {
      if (subscription.isValid) {
        yield put(setAppImageRecoverd(true));
        yield call(
          recoverApp,
          primaryMnemonic,
          primarySeed,
          encryptionKey,
          appID,
          subscription,
          appImage,
          vaultImage,
          UTXOinfos
        );
      } else {
        const plebSubscription = {
          productId: SubscriptionTier.L1,
          name: SubscriptionTier.L1,
          level: AppSubscriptionLevel.L1,
          icon: 'assets/ic_pleb.svg',
          receipt: '',
        };
        yield call(
          recoverApp,
          primaryMnemonic,
          primarySeed,
          encryptionKey,
          appID,
          plebSubscription,
          appImage,
          vaultImage,
          UTXOinfos
        );
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

function* recoverApp(
  primaryMnemonic,
  primarySeed,
  encryptionKey,
  appID,
  subscription,
  appImage,
  vaultImage,
  UTXOinfos
) {
  const entropy = yield call(
    BIP85.bip39MnemonicToEntropy,
    config.BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH,
    primaryMnemonic
  );
  const imageEncryptionKey = generateEncryptionKey(entropy.toString('hex'));
  const publicId = WalletUtilities.getFingerprintFromSeed(primarySeed);
  const app: KeeperApp = {
    id: appID,
    publicId,
    primarySeed: primarySeed.toString('hex'),
    primaryMnemonic,
    imageEncryptionKey,
    subscription: {
      level: subscription.level,
      name: subscription.name,
      productId: subscription.productId,
      receipt: subscription.receipt,
      icon: subscription.icon,
    },
    backup: {
      method: BackupType.SEED,
    },
    version: DeviceInfo.getVersion(),
    networkType: config.NETWORK_TYPE,
  };

  yield call(dbManager.createObject, RealmSchema.KeeperApp, app);
  // Wallet recreation
  if (appImage.wallets) {
    for (const [key, value] of Object.entries(appImage.wallets)) {
      const decrytpedWallet: Wallet = JSON.parse(decrypt(encryptionKey, value));
      yield call(dbManager.createObject, RealmSchema.Wallet, decrytpedWallet);
      if (decrytpedWallet?.whirlpoolConfig?.whirlpoolWalletDetails) {
        yield put(addNewWhirlpoolWallets({ depositWallet: decrytpedWallet }));
      }
      yield put(refreshWallets([decrytpedWallet], { hardRefresh: true }));
    }
  }

  // Vault recreation
  if (vaultImage) {
    const vault = JSON.parse(decrypt(encryptionKey, vaultImage.vault));
    yield call(dbManager.createObject, RealmSchema.Vault, vault);
  }

  // UTXOinfo restore
  if (UTXOinfos) {
    yield call(dbManager.createObjectBulk, RealmSchema.UTXOInfo, UTXOinfos);
  }
  yield put(setAppId(appID));
  // seed confirm for recovery
  yield call(dbManager.createObject, RealmSchema.BackupHistory, {
    title: BackupAction.SEED_BACKUP_CONFIRMED,
    date: moment().unix(),
    confirmed: true,
    subtitle: 'Recovered using backup phrase',
  });
  yield put(setSeedConfirmed(true));
  yield put(setBackupType(BackupType.SEED));
  // create/add restored object for version
  yield call(dbManager.createObject, RealmSchema.VersionHistory, {
    version: `${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`,
    releaseNote: '',
    date: new Date().toString(),
    title: 'Restored version',
  });

  if (appImage.nodes) {
    for (const node of appImage.nodes) {
      const decrptedNode = JSON.parse(decrypt(encryptionKey, node));
      yield call(dbManager.createObject, RealmSchema.NodeConnect, decrptedNode);
    }
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
    signers: VaultSigner[];
  };
}) {
  try {
    const { signers } = payload;
    for (const signer of signers) {
      const date = new Date();
      yield put(updateSignerDetails(signer, 'lastHealthCheck', date));
      yield put(uaiActionedEntity(signer.signerId, true));
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

    if (selectedWarning && lastRecord.title === BackupAction.SEED_BACKUP_CONFIRMATION_SKIPPED) {
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
