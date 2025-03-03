import * as bip39 from 'bip39';
import { call, put, select } from 'redux-saga/effects';
import { generateEncryptionKey } from 'src/utils/service-utilities/encryption';
import { v4 as uuidv4 } from 'uuid';
import BIP85 from 'src/services/wallets/operations/BIP85';
import DeviceInfo from 'react-native-device-info';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { AppSubscriptionLevel, SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { WalletType } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import crypto from 'crypto';
import dbManager from 'src/storage/realm/dbManager';
import Relay from 'src/services/backend/Relay';
import config from 'src/utils/service-utilities/config';
import { setupRecoveryKeySigningKey } from 'src/hardware/signerSetup';
import { DelayedTransaction } from 'src/models/interfaces/AssistedKeys';
import SigningServer from 'src/services/backend/SigningServer';
import { createWatcher } from '../utilities';
import {
  FETCH_SIGNED_DELAYED_TRANSACTION,
  SETUP_KEEPER_APP,
  SETUP_KEEPER_APP_VAULT_RECOVERY,
} from '../sagaActions/storage';
import { addNewWalletsWorker, NewWalletInfo, addSigningDeviceWorker } from './wallets';
import { setAppId, updateDelayedTransaction } from '../reducers/storage';
import { setAppCreationError } from '../reducers/login';
import { resetRealyWalletState } from '../reducers/bhr';

export const defaultTransferPolicyThreshold = null;
export const maxTransferPolicyThreshold = 1e11;

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
          level: AppSubscriptionLevel.L1,
          icon: 'assets/ic_pleb.svg',
        },
        backup: {},
        version: DeviceInfo.getVersion(),
        networkType: config.NETWORK_TYPE,
        enableAnalytics: false,
      };
      yield call(dbManager.createObject, RealmSchema.KeeperApp, newAPP);

      const defaultWallet: NewWalletInfo = {
        walletType: WalletType.DEFAULT,
        walletDetails: {
          name: 'Mobile Wallet',
          description: '',
          transferPolicy: {
            id: uuidv4(),
            threshold: 0,
          },
          instanceNum: 0,
        },
      };

      const recoveryKeySigner = setupRecoveryKeySigningKey(primaryMnemonic);
      yield call(addNewWalletsWorker, { payload: [defaultWallet] });
      yield call(addSigningDeviceWorker, { payload: { signers: [recoveryKeySigner] } });
      yield put(setAppId(appID));
      yield put(resetRealyWalletState());
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
        level: subscription.level,
        icon: 'assets/ic_pleb.svg',
      },
      version: DeviceInfo.getVersion(),
      networkType: config.NETWORK_TYPE,
      enableAnalytics: false,
    };
    yield call(dbManager.createObject, RealmSchema.KeeperApp, app);

    // create default wallet
    const defaultWallet: NewWalletInfo = {
      walletType: WalletType.DEFAULT,
      walletDetails: {
        name: 'Mobile Wallet',
        description: '',
        transferPolicy: {
          id: uuidv4(),
          threshold: defaultTransferPolicyThreshold,
        },
        instanceNum: 0,
      },
    };
    yield call(addNewWalletsWorker, { payload: [defaultWallet] });

    yield put(setAppId(appID));
    yield put(resetRealyWalletState());
  } catch (error) {
    console.log({ error });
  }
}

export const setupKeeperVaultRecoveryAppWatcher = createWatcher(
  setupKeeperVaultRecoveryAppWorker,
  SETUP_KEEPER_APP_VAULT_RECOVERY
);

function* fetchSignedDelayedTransactionWorker() {
  const delayedTransactions: { [txid: string]: DelayedTransaction } = yield select(
    (state) => state.storage.delayedTransactions
  );

  for (const txid in delayedTransactions) {
    try {
      const { delayUntil, verificationToken, signedPSBT } = delayedTransactions[txid];
      if (!signedPSBT) {
        const now = Date.now();

        const shouldBeSigned = delayUntil - now <= 0; // delayed expired, transaction must be signed by the Server Key
        if (shouldBeSigned) {
          const { delayedTransaction }: { delayedTransaction: DelayedTransaction } = yield call(
            SigningServer.fetchSignedDelayedTransaction,
            txid,
            verificationToken.toString()
          );

          if (delayedTransaction.signedPSBT) {
            yield put(updateDelayedTransaction(delayedTransaction));
          }
        }
      }
    } catch (err) {
      console.log({ err });
    }
  }
}

export const fetchSignedDelayedTransactionWatcher = createWatcher(
  fetchSignedDelayedTransactionWorker,
  FETCH_SIGNED_DELAYED_TRANSACTION
);
