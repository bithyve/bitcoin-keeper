import * as bip39 from 'bip39';
import crypto from 'crypto';
import DeviceInfo from 'react-native-device-info';
import { SETUP_KEEPER_APP, updateKeeperApp } from '../actions/storage';
import { put } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import { updateRealm } from 'src/storage/realm/dbManager';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';

function* setupWalletWorker({ payload }) {
  const { appName }: { appName: string } = payload;
  const primaryMnemonic = bip39.generateMnemonic(256);
  const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);
  const appId = crypto.createHash('sha256').update(primarySeed).digest('hex');

  const app: KeeperApp = {
    appId,
    appName,
    userName: appName,
    primaryMnemonic,
    primarySeed: primarySeed.toString('hex'),
    wallets: {},
    version: DeviceInfo.getVersion(),
  };

  //Will be removed once Realm is integrated
  yield put(updateKeeperApp(app));

  //Update Realm // TODO: Update Database Schema
  // updateRealm('Wallet', app);
}

export const setupWalletWatcher = createWatcher(setupWalletWorker, SETUP_KEEPER_APP);
