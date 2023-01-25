import * as bip39 from 'bip39';

import { call, put } from 'redux-saga/effects';
import { generateEncryptionKey } from 'src/core/services/operations/encryption';

import BIP85 from 'src/core/wallets/operations/BIP85';
import DeviceInfo from 'react-native-device-info';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { WalletType } from 'src/core/wallets/enums';
import WalletUtilities from 'src/core/wallets/operations/utils';
import crypto from 'crypto';
import dbManager from 'src/storage/realm/dbManager';
import Relay from 'src/core/services/operations/Relay';
import { addNewWallets } from '../sagaActions/wallets';
import config from '../../core/config';
import { createWatcher } from '../utilities';
import { SETUP_KEEPER_APP, SETUP_KEEPER_APP_VAULT_RECOVERY } from '../sagaActions/storage';
import { addNewWalletsWorker, NewWalletInfo } from './wallets';
import { setAppId } from '../reducers/storage';
import { setAppCreationError } from '../reducers/login';

function* setupKeeperAppWorker({ payload }) {
  try {
    yield put(setAppCreationError(false));
    let primaryMnemonic;
    let primarySeed;
    let appID;
    let id;
    let imageEncryptionKey;
    const { appName, fcmToken }: { appName: string; fcmToken: string } = payload;
    const app: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    if (app) {
      primaryMnemonic = app.primaryMnemonic;
      primarySeed = app.primarySeed;
      appID = app.appID;
      id = app.id;
      imageEncryptionKey = app.imageEncryptionKey;
    } else {
      primaryMnemonic = bip39.generateMnemonic();
      primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);
      appID = WalletUtilities.getFingerprintFromSeed(primarySeed);
      id = crypto.createHash('sha256').update(primarySeed).digest('hex');
      const entropy = yield call(
        BIP85.bip39MnemonicToEntropy,
        config.BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH,
        primaryMnemonic
      );
      imageEncryptionKey = generateEncryptionKey(entropy.toString('hex'));
    }

    const response = yield call(Relay.createNewApp, id, appID, fcmToken);
    if (response && response.created) {
      const newApp: KeeperApp = {
        id,
        appID,
        appName,
        primaryMnemonic,
        primarySeed: primarySeed.toString('hex'),
        imageEncryptionKey,
        subscription: {
          productId: SubscriptionTier.L1,
          name: SubscriptionTier.L1,
          level: 1,
          icon: 'assets/ic_pleb.svg',
        },
        version: DeviceInfo.getVersion(),
        networkType: config.NETWORK_TYPE,
      };
      yield call(dbManager.createObject, RealmSchema.KeeperApp, newApp);

      // create default wallet
      const defaultWallet: NewWalletInfo = {
        walletType: WalletType.DEFAULT,
        walletDetails: {
          name: 'Wallet 1',
          description: 'Single-sig bitcoin wallet',
          transferPolicy: {
            threshold: 5000,
          },
        },
      };
      const { created, err } = yield call(addNewWalletsWorker, { payload: [defaultWallet] });
      if (created) {
        yield put(setAppCreationError(false));
        yield put(setAppId(appID));
      } else {
        yield put(setAppCreationError(true));
      }
    } else {
      yield put(setAppCreationError(true));
    }
  } catch (error) {
    yield put(setAppCreationError(true));
    console.log({ error });
  }
}

export const setupKeeperAppWatcher = createWatcher(setupKeeperAppWorker, SETUP_KEEPER_APP);

function* setupKeeperVaultRecoveryAppWorker({ payload }) {
  try {
    const { appName, subscription } = payload;
    const primaryMnemonic = bip39.generateMnemonic();
    const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);

    const appID = WalletUtilities.getFingerprintFromSeed(primarySeed);
    const id = crypto.createHash('sha256').update(primarySeed).digest('hex');

    const entropy = yield call(
      BIP85.bip39MnemonicToEntropy,
      config.BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH,
      primaryMnemonic
    );
    const imageEncryptionKey = generateEncryptionKey(entropy.toString('hex'));

    const app: KeeperApp = {
      id,
      appID,
      appName,
      primaryMnemonic,
      primarySeed: primarySeed.toString('hex'),
      imageEncryptionKey,
      backup: {},
      subscription: {
        productId: subscription.productId,
        name: subscription.name,
        level: 0,
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
          threshold: 5000,
        },
      },
    };
    yield put(addNewWallets([defaultWallet]));

    yield put(setAppId(appID));
  } catch (error) {
    console.log({ error });
  }
}

export const setupKeeperVaultRecoveryAppWatcher = createWatcher(
  setupKeeperVaultRecoveryAppWorker,
  SETUP_KEEPER_APP_VAULT_RECOVERY
);
