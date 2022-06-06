import * as bip39 from 'bip39';
import crypto from 'crypto';
import DeviceInfo from 'react-native-device-info';
import { SETUP_KEEPER_APP, setAppId } from '../actions/storage';
import { call, put } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import { KeeperApp, UserTier } from 'src/common/data/models/interfaces/KeeperApp';
import { AppTierLevel } from 'src/common/data/enums/AppTierLevel';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import { WalletShell } from 'src/core/wallets/interfaces/interface';

function* setupKeeperAppWorker({ payload }) {
  try {
    const { appName }: { appName: string } = payload;
    const primaryMnemonic = bip39.generateMnemonic();
    const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);

    const defaultWalletShell: WalletShell = {
      id: crypto.randomBytes(12).toString('hex'),
      walletInstances: {},
    };

    const userTier: UserTier = {
      level: AppTierLevel.ONE,
    };
    const id = crypto.createHash('sha256').update(primarySeed).digest('hex');
    const app: KeeperApp = {
      id,
      appName,
      primaryMnemonic,
      primarySeed: primarySeed.toString('hex'),
      walletShellInstances: {
        shells: [defaultWalletShell.id],
        activeShell: defaultWalletShell.id,
      },
      userTier,
      version: DeviceInfo.getVersion(),
    };
    yield call(dbManager.createObject, RealmSchema.KeeperApp, app);
    yield call(dbManager.createObject, RealmSchema.WalletShell, defaultWalletShell);
    yield put(setAppId(id));
  } catch (error) {
    console.log({ error });
  }
}

export const setupKeeperAppWatcher = createWatcher(setupKeeperAppWorker, SETUP_KEEPER_APP);
