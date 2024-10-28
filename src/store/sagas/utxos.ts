import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { call, put } from 'redux-saga/effects';
import { BIP329Label, UTXO } from 'src/services/wallets/interfaces';
import { LabelRefType } from 'src/services/wallets/enums';
import Relay from 'src/services/backend/Relay';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { genrateOutputDescriptors } from 'src/utils/service-utilities/utils';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { createWatcher } from '../utilities';

import { ADD_LABELS, BULK_UPDATE_LABELS, BULK_UPDATE_UTXO_LABELS } from '../sagaActions/utxos';
import { resetState, setSyncingUTXOError, setSyncingUTXOs } from '../reducers/utxos';

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
    const origin = genrateOutputDescriptors(wallet, false);
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
    const { id }: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const updated = yield call(Relay.modifyLabels, id, tags, []);
    if (updated) {
      yield call(dbManager.createObjectBulk, RealmSchema.Tags, tags);
      yield put(resetState());
    }
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
    UTXO?: UTXO;
    txId?: string;
    address?: string;
    wallet: Wallet;
  };
}) {
  try {
    yield put(setSyncingUTXOs(true));
    const { labelChanges, wallet, UTXO, txId, address } = payload;
    const origin = genrateOutputDescriptors(wallet, false);
    let addedTags: BIP329Label[] = [];
    let deletedTagIds: string[] = [];
    const idSuffix = txId || address || `${UTXO.txId}:${UTXO.vout}`;
    if (labelChanges.added) {
      const ref = txId || address || `${UTXO.txId}:${UTXO.vout}`;
      const type = txId ? LabelRefType.TXN : address ? LabelRefType.ADDR : LabelRefType.OUTPUT;
      addedTags = labelChanges.added.map((label) => ({
        id: `${idSuffix}${label.name}`,
        ref,
        type,
        label: label.name,
        origin,
        isSystem: label.isSystem,
      }));
    }
    if (labelChanges.deleted) {
      deletedTagIds = labelChanges.deleted.map((label) => `${idSuffix}${label.name}`);
    }
    const { id }: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const updated = yield call(
      Relay.modifyLabels,
      id,
      addedTags.length ? addedTags : [],
      deletedTagIds.length ? deletedTagIds : []
    );
    if (updated) {
      yield call(dbManager.createObjectBulk, RealmSchema.Tags, addedTags);
      for (const element of deletedTagIds) {
        yield call(dbManager.deleteObjectById, RealmSchema.Tags, element);
        yield put(resetState());
      }
    }
  } catch (e) {
    yield put(setSyncingUTXOError(e));
  } finally {
    yield put(setSyncingUTXOs(false));
  }
}

export function* bulkUpdateUTXOLabelsWorker({
  payload,
}: {
  payload: { addedTags?: BIP329Label[]; deletedTagIds?: string[] };
}) {
  try {
    yield put(setSyncingUTXOs(true));
    const { addedTags, deletedTagIds } = payload;
    const { id }: KeeperApp = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
    const updated = yield call(
      Relay.modifyLabels,
      id,
      addedTags.length ? addedTags : [],
      deletedTagIds.length ? deletedTagIds : []
    );
    if (updated) {
      if (addedTags) {
        yield call(dbManager.createObjectBulk, RealmSchema.Tags, addedTags);
      }
      if (deletedTagIds) {
        for (const element of deletedTagIds) {
          yield call(dbManager.deleteObjectById, RealmSchema.Tags, element);
        }
      }
      yield put(resetState());
    }
  } catch (e) {
    yield put(setSyncingUTXOError(e));
  } finally {
    yield put(setSyncingUTXOs(false));
  }
}

export const addLabelsWatcher = createWatcher(addLabelsWorker, ADD_LABELS);
export const bulkUpdateLabelWatcher = createWatcher(bulkUpdateLabelsWorker, BULK_UPDATE_LABELS);
export const bulkUpdateUTXOLabelWatcher = createWatcher(
  bulkUpdateUTXOLabelsWorker,
  BULK_UPDATE_UTXO_LABELS
);
