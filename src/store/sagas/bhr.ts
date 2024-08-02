import * as bip39 from 'bip39';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { call, put, select } from 'redux-saga/effects';
import config, { APP_STAGE } from 'src/utils/service-utilities/config';
import {
  decrypt,
  encrypt,
  generateEncryptionKey,
  hash256,
} from 'src/utils/service-utilities/encryption';
import BIP85 from 'src/services/wallets/operations/BIP85';
import DeviceInfo from 'react-native-device-info';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import Relay from 'src/services/backend/Relay';
import {
  HealthCheckDetails,
  Signer,
  Vault,
  VaultSigner,
} from 'src/services/wallets/interfaces/vault';
import { captureError } from 'src/services/sentry';
import crypto from 'crypto';
import dbManager from 'src/storage/realm/dbManager';
import moment from 'moment';
import WalletUtilities from 'src/services/wallets/operations/utils';
import semver from 'semver';
import { NodeDetail } from 'src/services/wallets/interfaces';
import { AppSubscriptionLevel, SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { BackupAction, BackupHistory, BackupType, CloudBackupAction } from 'src/models/enums/BHR';
import { getSignerNameFromType } from 'src/hardware';
import { NetworkType, SignerType, VaultType } from 'src/services/wallets/enums';
import { uaiType } from 'src/models/interfaces/Uai';
import { Platform } from 'react-native';
import CloudBackupModule from 'src/nativemodules/CloudBackup';
import { genrateOutputDescriptors } from 'src/utils/service-utilities/utils';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
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
  setBackupLoading,
  setBackupType,
  setBackupWarning,
  setEncPassword,
  setInvalidPassword,
  setIsCloudBsmsBackupRequired,
  setLastBsmsBackup,
  setSeedConfirmed,
} from '../reducers/bhr';
import {
  BACKUP_BSMS_ON_CLOUD,
  BSMS_CLOUD_HEALTH_CHECK,
  DELETE_APP_IMAGE_ENTITY,
  GET_APP_IMAGE,
  HEALTH_CHECK_STATUS_UPDATE,
  RECOVER_BACKUP,
  SEED_BACKEDUP,
  SEED_BACKEDUP_CONFIRMED,
  SET_BACKUP_WARNING,
  UPADTE_HEALTH_CHECK_SIGNER,
  UPDATE_APP_IMAGE,
  UPDATE_VAULT_IMAGE,
  getAppImage,
  healthCheckSigner,
} from '../sagaActions/bhr';
import { uaiActioned } from '../sagaActions/uai';
import { setAppId } from '../reducers/storage';
import { applyRestoreSequence } from './restoreUpgrade';
import { KEY_MANAGEMENT_VERSION } from './upgrade';
import { RootState } from '../store';

export function* updateAppImageWorker({
  payload,
}: {
  payload: {
    wallets?: Wallet[];
    signers?: Signer[];
  };
}) {
  const { wallets, signers } = payload;
  const { primarySeed, id, publicId, subscription, networkType, version }: KeeperApp = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.KeeperApp
  );
  const walletObject = {};
  const signersObjects = {};
  const encryptionKey = generateEncryptionKey(primarySeed);
  if (wallets) {
    for (const wallet of wallets) {
      const encrytedWallet = encrypt(encryptionKey, JSON.stringify(wallet));
      walletObject[wallet.id] = encrytedWallet;
    }
  } else if (signers) {
    for (const signer of signers) {
      const encrytedSigner = encrypt(encryptionKey, JSON.stringify(signer));
      signersObjects[signer.masterFingerprint] = encrytedSigner;
    }
  } else {
    // update all wallets and signers
    const wallets: Wallet[] = yield call(dbManager.getCollection, RealmSchema.Wallet);
    for (const index in wallets) {
      const wallet = wallets[index];
      const encrytedWallet = encrypt(encryptionKey, JSON.stringify(wallet));
      walletObject[wallet.id] = encrytedWallet;
    }
    const signers: Signer[] = yield call(dbManager.getCollection, RealmSchema.Signer);
    for (const index in signers) {
      const signer = signers[index];
      const encrytedSigner = encrypt(encryptionKey, JSON.stringify(signer));
      signersObjects[signer.masterFingerprint] = encrytedSigner;
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

  // API call to Relay to do modular updates
  try {
    const response = yield call(Relay.updateAppImage, {
      appId: id,
      publicId,
      walletObject,
      signersObjects,
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
    const response = yield call(Relay.updateVaultImage, {
      isUpdate,
      vaultId: vault.id,
      vault: vaultEncrypted,
    });
    return response;
  }

  const signersData: Array<{
    signerId: string;
    xfpHash: string;
  }> = [];
  const signerIdXpubMap = {};
  for (const signer of vault.signers) {
    signerIdXpubMap[signer.xfp] = signer.xpub;
    signersData.push({
      signerId: signer.xfp,
      xfpHash: hash256(signer.masterFingerprint),
    });
  }

  // TODO to be removed
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

export function* deleteAppImageEntityWorker({
  payload,
}: {
  payload: {
    signerIds?: string[];
    walletIds?: string[];
  };
}) {
  try {
    const { signerIds, walletIds } = payload;
    const { id }: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const response = yield call(Relay.deleteAppImageEntity, {
      appId: id,
      signers: signerIds,
      walletIds,
    });
    if (walletIds?.length > 0) {
      for (const walletId of walletIds) {
        yield call(dbManager.deleteObjectById, RealmSchema.Wallet, walletId);
      }
    }
    if (signerIds?.length > 0) {
      for (const signerId of signerIds) {
        yield call(
          dbManager.deleteObjectByPrimaryKey,
          RealmSchema.Signer,
          'masterFingerprint',
          signerId
        );
      }
    }
    return response;
  } catch (err) {
    captureError(err);
  }
}

export function* deleteVaultImageWorker({
  payload,
}: {
  payload: {
    vaultIds: string[];
  };
}) {
  try {
    const { vaultIds } = payload;
    const { id }: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const response = yield call(Relay.deleteVaultImage, {
      appId: id,
      vaults: vaultIds,
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
    confirmed
      ? yield put(uaiActioned({ uaiType: uaiType.RECOVERY_PHRASE_HEALTH_CHECK, action: true }))
      : null;
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
    yield uaiActioned({ uaiType: uaiType.RECOVERY_PHRASE_HEALTH_CHECK, action: true });
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
    const { appImage, subscription, UTXOinfos, vaultImage, labels, allVaultImages } = yield call(
      Relay.getAppImage,
      appID
    );

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
          allVaultImages,
          UTXOinfos,
          labels,
          previousVersion
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
          allVaultImages,
          UTXOinfos,
          labels,
          previousVersion
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
  allVaultImages,
  UTXOinfos,
  labels,
  previousVersion
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

  // Signers recreatin
  if (appImage.signers) {
    for (const [key, value] of Object.entries(appImage.signers)) {
      const decrytpedSigner: Signer = JSON.parse(decrypt(encryptionKey, value));
      yield call(dbManager.createObject, RealmSchema.Signer, decrytpedSigner);
    }
  }

  // Vault recreation
  if (allVaultImages.length > 0) {
    for (const vaultImage of allVaultImages) {
      const vault = JSON.parse(decrypt(encryptionKey, vaultImage.vault));

      if (semver.lt(previousVersion, KEY_MANAGEMENT_VERSION)) {
        if (vault?.signers?.length) {
          vault.signers.forEach((signer, index) => {
            signer.xfp = signer.signerId;
            signer.registeredVaults = [
              {
                vaultId: vault.id,
                registered: signer.registered,
                registrationInfo: signer.deviceInfo ? JSON.stringify(signer.deviceInfo) : '',
              },
            ];
          });
        }

        if (vault.signers.length) {
          for (const signer of vault.signers) {
            const signerXpubs = {};
            Object.keys(signer.xpubDetails).forEach((type) => {
              if (signer.xpubDetails[type].xpub) {
                if (signerXpubs[type]) {
                  signerXpubs[type].push({
                    xpub: signer.xpubDetails[type].xpub,
                    xpriv: signer.xpubDetails[type].xpriv,
                    derivationPath: signer.xpubDetails[type].derivationPath,
                  });
                } else {
                  signerXpubs[type] = [
                    {
                      xpub: signer.xpubDetails[type].xpub,
                      xpriv: signer.xpubDetails[type].xpriv,
                      derivationPath: signer.xpubDetails[type].derivationPath,
                    },
                  ];
                }
              }
            });
            const isAMF =
              signer.type === SignerType.TAPSIGNER &&
              config.NETWORK_TYPE === NetworkType.TESTNET &&
              !signer.isMock;
            const signerObject = {
              masterFingerprint: signer.masterFingerprint,
              type: signer.type,
              signerName: getSignerNameFromType(signer.type, signer.isMock, isAMF),
              signerDescription: signer.signerDescription,
              lastHealthCheck: signer.lastHealthCheck,
              addedOn: signer.addedOn,
              isMock: signer.isMock,
              storageType: signer.storageType,
              signerPolicy: signer.signerPolicy,
              inheritanceKeyInfo: signer.inheritanceKeyInfo,
              hidden: false,
              signerXpubs,
            };
            yield call(dbManager.createObject, RealmSchema.Signer, signerObject);
          }
        }

        yield call(dbManager.createObject, RealmSchema.Vault, vault);
      }
      yield call(dbManager.createObject, RealmSchema.Vault, vault);
    }
  }

  // UTXOinfo restore
  if (UTXOinfos) {
    yield call(dbManager.createObjectBulk, RealmSchema.UTXOInfo, UTXOinfos);
  }
  yield put(setAppId(appID));

  // Labels Restore
  if (labels) {
    yield call(dbManager.createObjectBulk, RealmSchema.Tags, labels);
  }

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

function* healthCheckSatutsUpdateWorker({
  payload,
}: {
  payload: {
    signerUpdates: { signerId: string; status: hcStatusType }[];
  };
}) {
  try {
    const HcSuccessTypes = [
      hcStatusType.HEALTH_CHECK_MANAUAL,
      hcStatusType.HEALTH_CHECK_SD_ADDITION,
      hcStatusType.HEALTH_CHECK_SUCCESSFULL,
      hcStatusType.HEALTH_CHECK_SIGNING,
    ];
    const { signerUpdates } = payload;
    for (const signerUpdate of signerUpdates) {
      const signerRealm: Signer = dbManager.getObjectByPrimaryId(
        RealmSchema.Signer,
        'masterFingerprint',
        signerUpdate.signerId
      );
      const signer: Signer = getJSONFromRealmObject(signerRealm);
      if (signer) {
        const date = new Date();
        const newHealthCheckDetails: HealthCheckDetails = {
          type: signerUpdate.status,
          actionDate: date,
        };

        const oldDetialsArray = [...signer.healthCheckDetails];
        const oldDetails = oldDetialsArray.map((details) => {
          return { ...details, date: new Date(details.actionDate) };
        });

        const updatedDetailsArray: HealthCheckDetails[] = [...oldDetails, newHealthCheckDetails];

        yield put(updateSignerDetails(signer, 'healthCheckDetails', updatedDetailsArray));
        if (HcSuccessTypes.includes(signerUpdate.status)) yield put(healthCheckSigner([signer]));
      }
    }
  } catch (err) {
    console.log(err);
  }
}

export const healthCheckSatutsUpdateWatcher = createWatcher(
  healthCheckSatutsUpdateWorker,
  HEALTH_CHECK_STATUS_UPDATE
);

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
      yield put(uaiActioned({ entityId: signer.masterFingerprint, action: true }));
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

function* backupBsmsOnCloudWorker({
  payload,
}: {
  payload?: {
    password: string;
  };
}) {
  const { lastBsmsBackup } = yield select((state: RootState) => state.bhr);
  if (!lastBsmsBackup) return;
  const { password } = payload;
  if (password || password === '') yield put(setEncPassword(password));
  const excludeVaultTypesForBackup = [VaultType.CANARY];
  try {
    const bsmsToBackup = [];
    const vaultsCollection = yield call(dbManager.getCollection, RealmSchema.Vault);
    const vaults = vaultsCollection.filter((vault) => vault.archived === false);
    if (vaults.length === 0) {
      yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
        title: CloudBackupAction.CLOUD_BACKUP_FAILED,
        confirmed: false,
        subtitle: 'No vaults found.',
        date: Date.now(),
      });
      return;
    }
    vaults.forEach((vault) => {
      if (!excludeVaultTypesForBackup.includes(vault.type)) {
        const bsms = genrateOutputDescriptors(vault);
        bsmsToBackup.push({
          bsms,
          name: vault.presentationData.name,
        });
      }
    });
    const { encPassword } = yield select((state: RootState) => state.bhr);

    if (Platform.OS === 'android') {
      yield put(setBackupLoading(true));
      const setup = yield call(CloudBackupModule.setup);
      if (setup) {
        const login = yield call(CloudBackupModule.login);
        if (login.status) {
          const response = yield call(
            CloudBackupModule.backupBsms,
            JSON.stringify(bsmsToBackup),
            password || encPassword || ''
          );
          if (response.status) {
            yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
              title: CloudBackupAction.CLOUD_BACKUP_CREATED,
              confirmed: true,
              subtitle: response.data,
              date: Date.now(),
            });
            yield put(setIsCloudBsmsBackupRequired(false));
            yield put(setLastBsmsBackup(Date.now()));
          } else {
            yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
              title: CloudBackupAction.CLOUD_BACKUP_FAILED,
              confirmed: false,
              subtitle: response.error,
              date: Date.now(),
            });
          }
        } else {
          yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
            title: CloudBackupAction.CLOUD_BACKUP_FAILED,
            confirmed: false,
            subtitle: login.error,
            date: Date.now(),
          });
        }
      } else {
        yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
          title: CloudBackupAction.CLOUD_BACKUP_FAILED,
          confirmed: false,
          subtitle: 'Unable to initialize Google Drive',
          date: Date.now(),
        });
      }
    } else {
      yield put(setBackupLoading(true));
      const response = yield call(
        CloudBackupModule.backupBsms,
        JSON.stringify(bsmsToBackup),
        password || encPassword || ''
      );
      if (response.status) {
        yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
          title: CloudBackupAction.CLOUD_BACKUP_CREATED,
          confirmed: true,
          subtitle: response.data,
          date: Date.now(),
        });
        yield put(setIsCloudBsmsBackupRequired(false));
        yield put(setLastBsmsBackup(Date.now()));
      } else {
        yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
          title: CloudBackupAction.CLOUD_BACKUP_FAILED,
          confirmed: false,
          subtitle: response.error,
          date: Date.now(),
        });
      }
    }
  } catch (error) {
    console.log(error);
    yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
      title: CloudBackupAction.CLOUD_BACKUP_FAILED,
      confirmed: false,
      subtitle: `${error}`,
      date: Date.now(),
    });
  }
}

function* bsmsCloudHealthCheckWorker() {
  if (Platform.OS === 'android') {
    yield put(setBackupLoading(true));
    const setup = yield call(CloudBackupModule.setup);
    if (setup) {
      const login = yield call(CloudBackupModule.login);
      if (login.status) {
        const response = yield call(CloudBackupModule.bsmsHealthCheck);
        if (response.status) {
          yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
            title: CloudBackupAction.CLOUD_BACKUP_HEALTH,
            confirmed: true,
            subtitle: response.data,
            date: Date.now(),
          });
          yield put(setIsCloudBsmsBackupRequired(false));
        } else {
          yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
            title: CloudBackupAction.CLOUD_BACKUP_HEALTH_FAILED,
            confirmed: false,
            subtitle: response.error,
            date: Date.now(),
          });
        }
      } else {
        yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
          title: CloudBackupAction.CLOUD_BACKUP_HEALTH_FAILED,
          confirmed: false,
          subtitle: login.error,
          date: Date.now(),
        });
      }
    } else {
      yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
        title: CloudBackupAction.CLOUD_BACKUP_HEALTH_FAILED,
        confirmed: false,
        subtitle: 'Unable to initialize Google Drive',
        date: Date.now(),
      });
    }
  } else {
    yield call(dbManager.createObject, RealmSchema.CloudBackupHistory, {
      title: CloudBackupAction.CLOUD_BACKUP_HEALTH,
      confirmed: true,
      subtitle: '',
      date: Date.now(),
    });
    yield put(setIsCloudBsmsBackupRequired(false));
  }
}

export const backupBsmsOnCloudWatcher = createWatcher(
  backupBsmsOnCloudWorker,
  BACKUP_BSMS_ON_CLOUD
);
export const bsmsCloudHealthCheckWatcher = createWatcher(
  bsmsCloudHealthCheckWorker,
  BSMS_CLOUD_HEALTH_CHECK
);

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

export const deleteAppImageEntityWatcher = createWatcher(
  deleteAppImageEntityWorker,
  DELETE_APP_IMAGE_ENTITY
);
