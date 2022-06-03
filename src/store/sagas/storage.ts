import * as bip39 from 'bip39';
import crypto from 'crypto';
import DeviceInfo from 'react-native-device-info';
import { SETUP_KEEPER_APP } from '../actions/storage';
import { call } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import { KeeperApp, UserTier } from 'src/common/data/models/interfaces/KeeperApp';
import { AppTierLevel } from 'src/common/data/enums/AppTierLevel';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import { WalletShell } from 'src/core/wallets/interfaces/interface';

function* setupKeeperAppWorker({ payload }) {
  const { appName }: { appName: string } = payload;
  const primaryMnemonic = bip39.generateMnemonic(256);
  const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);

  const defaultWalletShell: WalletShell = {
    id: crypto.randomBytes(12).toString('hex'),
    walletInstances: {},
  };

  const userTier: UserTier = {
    level: AppTierLevel.ONE,
  };

  const app: KeeperApp = {
    id: crypto.createHash('sha256').update(primarySeed).digest('hex'),
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

  // TODO: realm init takes places during the logic flow, w/ appropriate AES key
  yield call(dbManager.initializeRealm, Buffer.from('random'));
  yield call(dbManager.createObject, RealmSchema.KeeperApp, app);
  yield call(dbManager.createObject, RealmSchema.WalletShell, defaultWalletShell);
}

export const setupKeeperAppWatcher = createWatcher(setupKeeperAppWorker, SETUP_KEEPER_APP);
