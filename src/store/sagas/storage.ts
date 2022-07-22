import * as bip39 from 'bip39';
import DeviceInfo from 'react-native-device-info';
import { SETUP_KEEPER_APP } from '../sagaActions/storage';
import { setAppId } from '../reducers/storage';
import { call, put } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import { KeeperApp, UserTier } from 'src/common/data/models/interfaces/KeeperApp';
import { AppTierLevel } from 'src/common/data/enums/AppTierLevel';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import { WalletShell } from 'src/core/wallets/interfaces/wallet';
import { addNewWallets } from '../sagaActions/wallets';
import { newWalletInfo } from './wallets';
import { WalletType } from 'src/core/wallets/enums';
import { generateEncryptionKey, getRandomBytes } from 'src/core/services/operations/encryption';
import WalletUtilities from 'src/core/wallets/operations/utils';
import BIP85 from 'src/core/wallets/operations/BIP85';
import config from '../../core/config';

function* setupKeeperAppWorker({ payload }) {
  try {
    const { appName }: { appName: string } = payload;
    const primaryMnemonic = bip39.generateMnemonic();
    const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);

    const defaultWalletShell: WalletShell = {
      id: getRandomBytes(12),
      walletInstances: {},
    };

    const userTier: UserTier = {
      level: AppTierLevel.ONE,
    };
    const id = WalletUtilities.getFingerprintFromSeed(primarySeed);

    const entropy = yield call(
      BIP85.bip39MnemonicToEntropy,
      config.BIP85_IMAGE_ENCRYPTIONKEY_DERIVATION_PATH,
      primaryMnemonic
    );
    const imageEncryptionKey = generateEncryptionKey(entropy.toString('hex'));

    const app: KeeperApp = {
      id,
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
      userTier,
      version: DeviceInfo.getVersion(),
    };
    yield call(dbManager.createObject, RealmSchema.KeeperApp, app);
    yield call(dbManager.createObject, RealmSchema.WalletShell, defaultWalletShell);

    // create default wallet
    const defaultWallet: newWalletInfo = {
      walletType: WalletType.CHECKING,
      walletDetails: {
        name: 'Mobile Wallet',
        description: 'Single-sig bitcoin wallet',
      },
    };
    yield put(addNewWallets([defaultWallet]));

    yield put(setAppId(id));
  } catch (error) {
    console.log({ error });
  }
}

export const setupKeeperAppWatcher = createWatcher(setupKeeperAppWorker, SETUP_KEEPER_APP);
