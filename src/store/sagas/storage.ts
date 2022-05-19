import * as bip39 from 'bip39';
import crypto from 'crypto';
import DeviceInfo from 'react-native-device-info';
import { SETUP_WALLET, updateWallet } from '../actions/storage';
import { put } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import { realmConfig, RealmContext } from 'src/storage/realm/AppRealmProvider';
import Realm from 'realm';
import { updateRealm } from 'src/storage/realm/dbManager';
import { Wallet } from 'src/common/data/models/interfaces/Wallet';

function* setupWalletWorker({ payload }) {
  const {
    walletName,
    security,
  }: { walletName: string; security: { questionId: string; question: string; answer: string } } =
    payload;
  const primaryMnemonic = bip39.generateMnemonic(256);
  const primarySeed = bip39.mnemonicToSeedSync(primaryMnemonic);
  const walletId = crypto.createHash('sha256').update(primarySeed).digest('hex');

  const wallet: Wallet = {
    walletId,
    walletName,
    userName: walletName,
    security,
    primaryMnemonic,
    primarySeed: primarySeed.toString('hex'),
    accounts: {},
    version: DeviceInfo.getVersion(),
  };

  //Will be removed once Realm is integrated
  yield put(updateWallet(wallet));

  //Update Realm
  updateRealm('Wallet', wallet);
}

export const setupWalletWatcher = createWatcher(setupWalletWorker, SETUP_WALLET);
