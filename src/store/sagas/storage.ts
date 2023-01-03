import * as bip39 from 'bip39';

import { call, put } from 'redux-saga/effects';
import { generateEncryptionKey, getRandomBytes } from 'src/core/services/operations/encryption';

import BIP85 from 'src/core/wallets/operations/BIP85';
import DeviceInfo from 'react-native-device-info';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { WalletShell } from 'src/core/wallets/interfaces/wallet';
import { WalletType } from 'src/core/wallets/enums';
import WalletUtilities from 'src/core/wallets/operations/utils';
import crypto from 'crypto';
import dbManager from 'src/storage/realm/dbManager';
import Relay from 'src/core/services/operations/Relay';
import { addNewWallets } from '../sagaActions/wallets';
import config from '../../core/config';
import { createWatcher } from '../utilities';
import { SETUP_KEEPER_APP, SETUP_KEEPER_APP_VAULT_RECOVERY } from '../sagaActions/storage';
import { NewWalletInfo } from './wallets';
import { setAppId } from '../reducers/storage';

function* setupKeeperAppWorker({ payload }) {
  try {
    const { appName, fcmToken }: { appName: string; fcmToken: string } = payload;
    const primaryMnemonic = bip39.generateMnemonic();
    const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);

    const defaultWalletShell: WalletShell = {
      id: getRandomBytes(12),
      walletInstances: {},
    };

    const appID = WalletUtilities.getFingerprintFromSeed(primarySeed);
    const id = crypto.createHash('sha256').update(primarySeed).digest('hex');

    const entropy = yield call(
      BIP85.bip39MnemonicToEntropy,
      config.BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH,
      primaryMnemonic
    );
    const imageEncryptionKey = generateEncryptionKey(entropy.toString('hex'));
    const response = yield call(Relay.createNewApp, id, appID, fcmToken);
    if (response && response.created) {
      const app: KeeperApp = {
        id,
        appID,
        appName,
        primaryMnemonic,
        primarySeed: primarySeed.toString('hex'),
        imageEncryptionKey,
        walletShellInstances: {
          shells: [defaultWalletShell.id],
          activeShell: defaultWalletShell.id,
        },
        vaultShellInstances: {
          shells: [],
          activeShell: null,
        },
        subscription: {
          productId: SubscriptionTier.L1,
          name: SubscriptionTier.L1,
          level: 0,
        },
        version: DeviceInfo.getVersion(),
        networkType: config.NETWORK_TYPE,
      };
      yield call(dbManager.createObject, RealmSchema.KeeperApp, app);
      yield call(dbManager.createObject, RealmSchema.WalletShell, defaultWalletShell);

      // create default wallet
      const defaultWallet: NewWalletInfo = {
        walletType: WalletType.CHECKING,
        walletDetails: {
          name: 'Wallet 1',
          description: 'Single-sig bitcoin wallet',
          transferPolicy: 5000,
        },
      };
      yield put(addNewWallets([defaultWallet]));

      yield put(setAppId(appID));
    } else {
    }
  } catch (error) {
    console.log({ error });
  }
}

export const setupKeeperAppWatcher = createWatcher(setupKeeperAppWorker, SETUP_KEEPER_APP);

function* setupKeeperVaultRecoveryAppWorker({ payload }) {
  try {
    const { appName, vaultShellInstances, subscription } = payload;
    console.log({ appName, vaultShellInstances, subscription });
    const primaryMnemonic = bip39.generateMnemonic();
    const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);

    const defaultWalletShell: WalletShell = {
      id: getRandomBytes(12),
      walletInstances: {},
    };

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
      walletShellInstances: {
        shells: [defaultWalletShell.id],
        activeShell: defaultWalletShell.id,
      },
      vaultShellInstances,
      subscription: {
        productId: subscription.productId,
        name: subscription.name,
        level: 0,
      },
      version: DeviceInfo.getVersion(),
      networkType: config.NETWORK_TYPE,
    };
    yield call(dbManager.createObject, RealmSchema.KeeperApp, app);
    yield call(dbManager.createObject, RealmSchema.WalletShell, defaultWalletShell);

    // create default wallet
    const defaultWallet: NewWalletInfo = {
      walletType: WalletType.CHECKING,
      walletDetails: {
        name: 'Mobile Wallet',
        description: 'Single-sig bitcoin wallet',
        transferPolicy: 5000,
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
