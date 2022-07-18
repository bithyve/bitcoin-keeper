import { call } from 'redux-saga/effects';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { encrypt, generateEncryptionKey } from 'src/core/services/operations/encryption';
import Relay from 'src/core/services/operations/Relay';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { UPDATE_APP_IMAGE } from '../sagaActions/bhr';
import { createWatcher } from '../utilities';

function* updateAppImageWorker({ payload }) {
  const { walletId } = payload;

  const { primarySeed, id }: KeeperApp = yield call(
    dbManager.getObjectByIndex,
    RealmSchema.KeeperApp
  );
  let walletObject = {};
  if (walletId) {
    const wallet: Wallet = yield call(dbManager.getObjectById, RealmSchema.Wallet, walletId);
    const encryptionKey = generateEncryptionKey(primarySeed);
    const encrytedWallet = encrypt(encryptionKey, wallet);
    walletObject[wallet.id] = encrytedWallet.encryptedData;
    try {
      Relay.updateAppImage({ id, walletObject });
    } catch (err) {
      console.error('update failed', err);
    }
  }
}

export const updateAppImageWatcher = createWatcher(updateAppImageWorker, UPDATE_APP_IMAGE);
