import { GET_APP_IMAGE, UPDATE_APP_IMAGE } from '../sagaActions/bhr';
import { KeeperApp, UserTier } from 'src/common/data/models/interfaces/KeeperApp';
import { Wallet, WalletShell } from 'src/core/wallets/interfaces/wallet';
import { decrypt, encrypt, generateEncryptionKey } from 'src/core/services/operations/encryption';

import { AppTierLevel } from 'src/common/data/enums/AppTierLevel';
import DeviceInfo from 'react-native-device-info';
import { RealmSchema } from 'src/storage/realm/enum';
import Relay from 'src/core/services/operations/Relay';
import { call } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import dbManager from 'src/storage/realm/dbManager';

function* updateAppImageWorker({ payload }) {
  const { walletId } = payload;

  const { primarySeed, id, walletShellInstances, primaryMnemonic }: KeeperApp = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.KeeperApp
  );
  const walletShells: WalletShell[] = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.WalletShell,
    0,
    true
  );

  let walletObject = {};
  if (walletId) {
    const wallet: Wallet = yield call(dbManager.getObjectById, RealmSchema.Wallet, walletId);
    const encryptionKey = generateEncryptionKey(primarySeed);
    const encrytedWallet = encrypt(encryptionKey, JSON.stringify(wallet));
    walletObject[wallet.id] = encrytedWallet;
    try {
      Relay.updateAppImage({
        id,
        walletObject,
        walletShellInstances: JSON.stringify(walletShellInstances),
        walletShells: JSON.stringify(walletShells[0]),
      });
    } catch (err) {
      console.error('update failed', err);
    }
  }
}

function* getAppImageWorker({ payload }) {
  const { id, primarySeed } = payload;
  try {
    const encryptionKey = generateEncryptionKey(primarySeed);
    const appImage: any = yield Relay.getAppImage(id);

    //Keeper-App Reacreation
    const userTier: UserTier = {
      level: AppTierLevel.ONE,
    };
    const app = {
      id,
      primarySeed,
      walletShellInstances: JSON.parse(appImage.walletShellInstances),
      userTier,
      version: DeviceInfo.getVersion(),
    };
    yield call(dbManager.createObject, RealmSchema.KeeperApp, app);
    yield call(dbManager.createObject, RealmSchema.WalletShell, JSON.parse(appImage.walletShells));

    //Wallet recreation
    if (appImage) {
      if (appImage.wallets) {
        for (const [key, value] of Object.entries(appImage.wallets)) {
          yield call(
            dbManager.createObject,
            RealmSchema.Wallet,
            JSON.parse(decrypt(encryptionKey, value))
          );
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}

export const updateAppImageWatcher = createWatcher(updateAppImageWorker, UPDATE_APP_IMAGE);
export const getAppImageWatcher = createWatcher(getAppImageWorker, GET_APP_IMAGE);
