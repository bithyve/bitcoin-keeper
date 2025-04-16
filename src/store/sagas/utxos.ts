import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { call, delay, fork, put } from 'redux-saga/effects';
import { BIP329Label, UTXO } from 'src/services/wallets/interfaces';
import { LabelRefType } from 'src/services/wallets/enums';
import Relay from 'src/services/backend/Relay';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { generateAbbreviatedOutputDescriptors } from 'src/utils/service-utilities/utils';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { createWatcher } from '../utilities';

import { ADD_LABELS, BULK_UPDATE_LABELS, IMPORT_LABELS } from '../sagaActions/utxos';
import { resetState, setSyncingUTXOError, setSyncingUTXOs } from '../reducers/utxos';
import { checkBackupCondition, setServerBackupFailed } from './bhr';
import { encrypt, generateEncryptionKey, hash256 } from 'src/utils/service-utilities/encryption';

export function* addLabelsWorker({
  payload,
}: {
  payload: {
    txId: string;
    vout?: number;
    wallet: Wallet | Vault;
    labels: { name: string; isSystem: boolean }[];
    type;
  };
}) {
  try {
    yield put(setSyncingUTXOs(true));
    const { txId, vout, wallet, labels, type } = payload;
    const origin = generateAbbreviatedOutputDescriptors(wallet);
    const tags = [];
    labels.forEach((label) => {
      const ref = vout !== undefined ? `${txId}:${vout}` : txId;
      const tag = {
        id: `${ref}${label.name}`,
        label: label.name,
        isSystem: label.isSystem,
        ref,
        type,
        origin,
      };
      tags.push(tag);
    });
    const { id, primarySeed }: KeeperApp = yield call(
      dbManager.getObjectByIndex,
      RealmSchema.KeeperApp
    );
    yield call(dbManager.createObjectBulk, RealmSchema.Tags, tags);
    try {
      const backupResponse = yield call(checkBackupCondition);
      if (!backupResponse) {
        const encryptionKey = generateEncryptionKey(primarySeed);
        const tagsToBackup = tags.map((tag) => ({
          id: hash256(hash256(encryptionKey + tag.id)),
          content: encrypt(encryptionKey, JSON.stringify(tag)),
        }));
        yield call(Relay.modifyLabels, id, tagsToBackup, []);
      } else yield delay(100);
    } catch (error) {
      console.log('🚀 ~ addLabelsWorker error:', error);
      yield call(setServerBackupFailed);
    }
    yield put(resetState());
  } catch (e) {
    yield put(setSyncingUTXOError(e));
  } finally {
    yield put(setSyncingUTXOs(false));
  }
}

export function* bulkUpdateLabelsWorker({
  payload,
}: {
  payload: {
    labelChanges: {
      added: { isSystem: boolean; name: string }[];
      deleted: { isSystem: boolean; name: string }[];
    };
    UTXO?: { txId: string; vout: number };
    txId?: string;
    address?: string;
    wallet: Wallet;
  };
}) {
  try {
    yield put(setSyncingUTXOs(true));
    const { labelChanges, wallet, UTXO, txId, address } = payload;
    const origin = generateAbbreviatedOutputDescriptors(wallet);
    let addedTags: BIP329Label[] = [];
    let deletedTagIds: string[] = [];
    const ref = txId || address || `${UTXO.txId}:${UTXO.vout}`;

    if (labelChanges.added) {
      const type = txId ? LabelRefType.TXN : address ? LabelRefType.ADDR : LabelRefType.OUTPUT;
      addedTags = labelChanges.added.map((label) => ({
        id: `${ref}${label.name}`,
        ref,
        type,
        label: label.name,
        origin,
        isSystem: label.isSystem,
      }));
    }
    if (labelChanges.deleted) {
      deletedTagIds = labelChanges.deleted.map((label) => `${ref}${label.name}`);
    }
    const { primarySeed, id }: KeeperApp = yield call(
      dbManager.getObjectByIndex,
      RealmSchema.KeeperApp
    );
    yield call(dbManager.createObjectBulk, RealmSchema.Tags, addedTags);
    for (const element of deletedTagIds) {
      yield call(dbManager.deleteObjectById, RealmSchema.Tags, element);
    }
    try {
      const backupResponse = yield call(checkBackupCondition);
      if (!backupResponse) {
        const encryptionKey = generateEncryptionKey(primarySeed);
        const tagsToBackup = addedTags.map((tag) => ({
          id: hash256(hash256(encryptionKey + tag.id)),
          content: encrypt(encryptionKey, JSON.stringify(tag)),
        }));
        const tagsToDelete = deletedTagIds.map((tag) => hash256(hash256(encryptionKey + tag)));
        yield fork(
          Relay.modifyLabels,
          id,
          tagsToBackup.length ? tagsToBackup : [],
          tagsToDelete.length ? tagsToDelete : []
        );
      } else yield delay(100);
    } catch (error) {
      yield call(setServerBackupFailed);
    }
    yield put(resetState());
  } catch (e) {
    yield put(setSyncingUTXOError(e));
  } finally {
    yield put(setSyncingUTXOs(false));
  }
}

export function* importLabelsWorker({
  payload,
}: {
  payload: {
    labels: [
      {
        type: string;
        ref: string;
        label: string;
        origin: string;
      }
    ];
  };
}) {
  try {
    yield put(setSyncingUTXOs(true));
    const { labels } = payload;
    let addedTags: BIP329Label[] = [];
    if (labels) {
      addedTags = labels.map((label) => ({
        id: `${label.ref}${label.label}`,
        ref: label.ref,
        type: label.type.toUpperCase() as LabelRefType,
        label: label.label,
        origin: label.origin,
        isSystem: false,
      }));
    }

    console.log('addedTags');
    console.log(addedTags);

    const { primarySeed, id }: KeeperApp = yield call(
      dbManager.getObjectByIndex,
      RealmSchema.KeeperApp
    );
    yield call(dbManager.createObjectBulk, RealmSchema.Tags, addedTags);

    try {
      const backupResponse = yield call(checkBackupCondition);
      if (!backupResponse) {
        const encryptionKey = generateEncryptionKey(primarySeed);
        const tagsToBackup = addedTags.map((tag) => ({
          id: hash256(hash256(encryptionKey + tag.id)),
          content: encrypt(encryptionKey, JSON.stringify(tag)),
        }));
        yield fork(Relay.modifyLabels, id, tagsToBackup.length ? tagsToBackup : [], []);
      } else yield delay(100);
    } catch (error) {
      yield call(setServerBackupFailed);
    }
    yield put(resetState());
  } catch (e) {
    yield put(setSyncingUTXOError(e));
  } finally {
    yield put(setSyncingUTXOs(false));
  }
}

export const addLabelsWatcher = createWatcher(addLabelsWorker, ADD_LABELS);
export const bulkUpdateLabelWatcher = createWatcher(bulkUpdateLabelsWorker, BULK_UPDATE_LABELS);
export const importLabelsWatcher = createWatcher(importLabelsWorker, IMPORT_LABELS);
