import * as bip39 from 'bip39';
import crypto from 'crypto';
import DeviceInfo from 'react-native-device-info';
import { SETUP_KEEPER_APP, updateKeeperApp } from '../actions/storage';
import { put } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import { updateRealm } from 'src/storage/realm/dbManager';
import { KeeperApp, UserTier } from 'src/common/data/models/interfaces/KeeperApp';
import { WalletShell } from 'src/core/wallets/interfaces/interface';
import { AppTierLevel } from 'src/common/data/enums/AppTierLevel';

function* setupWalletWorker({ payload }) {
  const { appName }: { appName: string } = payload;
  const primaryMnemonic = bip39.generateMnemonic(256);
  const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);
  const appId = crypto.createHash('sha256').update(primarySeed).digest('hex');

  const walletShell: WalletShell = {
    shellId: crypto.randomBytes(12).toString('hex'),
    walletInstanceCount: {},
    wallets: {},
  };

  const userTier: UserTier = {
    level: AppTierLevel.ONE,
  };

  const app: KeeperApp = {
    appId,
    appName,
    primaryMnemonic,
    primarySeed: primarySeed.toString('hex'),
    walletShell,
    userTier,
    version: DeviceInfo.getVersion(),
  };

  //Will be removed once Realm is integrated
  yield put(updateKeeperApp(app));

  //Update Realm // TODO: Update Database Schema
  // updateRealm('Wallet', app);
}

export const setupWalletWatcher = createWatcher(setupWalletWorker, SETUP_KEEPER_APP);
