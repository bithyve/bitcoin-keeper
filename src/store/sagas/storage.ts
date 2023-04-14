import * as bip39 from 'bip39';
import { call, put } from 'redux-saga/effects';
import { generateEncryptionKey } from 'src/core/services/operations/encryption';
import { v4 as uuidv4 } from 'uuid';
import BIP85 from 'src/core/wallets/operations/BIP85';
import DeviceInfo from 'react-native-device-info';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { NetworkType, WalletType } from 'src/core/wallets/enums';
import WalletUtilities from 'src/core/wallets/operations/utils';
import crypto from 'crypto';
import dbManager from 'src/storage/realm/dbManager';
import Relay from 'src/core/services/operations/Relay';
import config from '../../core/config';
import { createWatcher } from '../utilities';
import { SETUP_KEEPER_APP, SETUP_KEEPER_APP_VAULT_RECOVERY } from '../sagaActions/storage';
import { addNewWalletsWorker, NewWalletInfo } from './wallets';
import { setAppId } from '../reducers/storage';
import { setAppCreationError } from '../reducers/login';

export const defaultTransferPolicyThreshold =
  config.NETWORK_TYPE === NetworkType.MAINNET ? 1000000 : 5000;

export function* setupKeeperAppWorker({ payload }) {
  try {
    const { appName, fcmToken }: { appName: string; fcmToken: string } = payload;
    let primaryMnemonic;
    let primarySeed;
    let appID;
    let publicId;
    let imageEncryptionKey;
    const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    if (app) {
      primaryMnemonic = app.primaryMnemonic;
      primarySeed = app.primarySeed;
      appID = app.id;
      publicId = app.publicId;
      imageEncryptionKey = app.imageEncryptionKey;
    } else {
      primaryMnemonic = bip39.generateMnemonic();
      primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);
      appID = crypto.createHash('sha256').update(primarySeed).digest('hex');
      publicId = WalletUtilities.getFingerprintFromSeed(primarySeed);
      const entropy = yield call(
        BIP85.bip39MnemonicToEntropy,
        config.BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH,
        primaryMnemonic
      );
      imageEncryptionKey = generateEncryptionKey(entropy.toString('hex'));
    }
    const response = yield call(Relay.createNewApp, publicId, appID, fcmToken);

    if (response && response.created) {
      const newAPP: KeeperApp = {
        id: appID,
        publicId,
        appName,
        primaryMnemonic,
        primarySeed: primarySeed.toString('hex'),
        imageEncryptionKey,
        subscription: {
          productId: SubscriptionTier.L1,
          name: SubscriptionTier.L1,
          level: 0,
          icon: 'assets/ic_pleb.svg',
        },
        backup: {},
        version: DeviceInfo.getVersion(),
        networkType: config.NETWORK_TYPE,
      };
      yield call(dbManager.createObject, RealmSchema.KeeperApp, newAPP);

      const defaultWallet: NewWalletInfo = {
        walletType: WalletType.DEFAULT,
        walletDetails: {
          name: 'Wallet 1',
          description: 'Single-sig bitcoin wallet',
          transferPolicy: {
            id: uuidv4(),
            threshold: defaultTransferPolicyThreshold,
          },
        },
      };
      yield call(addNewWalletsWorker, { payload: [defaultWallet] });
      yield put(setAppId(appID));
    } else {
      yield put(setAppCreationError(true));
    }
  } catch (error) {
    yield put(setAppCreationError(true));
    console.log({ error });
    yield put(setAppCreationError(true));
  }
}

export const setupKeeperAppWatcher = createWatcher(setupKeeperAppWorker, SETUP_KEEPER_APP);

function* setupKeeperVaultRecoveryAppWorker({ payload }) {
  try {
    const { appName, subscription } = payload;
    const primaryMnemonic = bip39.generateMnemonic();
    const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);

    const publicId = WalletUtilities.getFingerprintFromSeed(primarySeed);
    const appID = crypto.createHash('sha256').update(primarySeed).digest('hex');

    const entropy = yield call(
      BIP85.bip39MnemonicToEntropy,
      config.BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH,
      primaryMnemonic
    );
    const imageEncryptionKey = generateEncryptionKey(entropy.toString('hex'));

    const app: KeeperApp = {
      id: appID,
      publicId,
      appName,
      primaryMnemonic,
      primarySeed: primarySeed.toString('hex'),
      imageEncryptionKey,
      backup: {},
      subscription: {
        productId: subscription.productId,
        name: subscription.name,
        level: 0,
        icon: 'assets/ic_pleb.svg',
      },
      version: DeviceInfo.getVersion(),
      networkType: config.NETWORK_TYPE,
    };
    yield call(dbManager.createObject, RealmSchema.KeeperApp, app);

    // create default wallet
    const defaultWallet: NewWalletInfo = {
      walletType: WalletType.DEFAULT,
      walletDetails: {
        name: 'Mobile Wallet',
        description: 'Single-sig bitcoin wallet',
        transferPolicy: {
          id: uuidv4(),
          threshold: defaultTransferPolicyThreshold,
        },
      },
    };
    yield call(addNewWalletsWorker, { payload: [defaultWallet] });

    yield put(setAppId(appID));
  } catch (error) {
    console.log({ error });
  }
}

export const setupKeeperVaultRecoveryAppWatcher = createWatcher(
  setupKeeperVaultRecoveryAppWorker,
  SETUP_KEEPER_APP_VAULT_RECOVERY
);
