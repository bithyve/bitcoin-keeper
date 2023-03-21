import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { call } from 'redux-saga/effects';
import { UTXO } from 'src/core/wallets/interfaces';
import { LabelType } from 'src/core/wallets/enums';
import { createWatcher } from '../utilities';

import { ADD_LABELS, BULK_UPDATE_LABELS, CREATE_UTXO_REFERENCE } from '../sagaActions/utxos';

function* addLabelsWorker({
  payload,
}: {
  payload: { labels: Array<{ name: string; type: LabelType }>; UTXO: UTXO };
}) {
  const { UTXO, labels } = payload;
  const { txId, vout } = UTXO;
  const UTXOInfo = dbManager.getObjectById(RealmSchema.UTXOInfo, `${txId}${vout}`);
  const existingLabels = UTXOInfo.toJSON().labels;
  yield call(dbManager.updateObjectById, RealmSchema.UTXOInfo, `${txId}${vout}`, {
    labels: existingLabels.concat(labels),
  });
}

function* bulkUpdateLabelsWorker({
  payload,
}: {
  payload: { labels: Array<{ name: string; type: LabelType }>; UTXO: UTXO };
}) {
  const { UTXO, labels } = payload;
  const { txId, vout } = UTXO;
  yield call(dbManager.updateObjectById, RealmSchema.UTXOInfo, `${txId}${vout}`, {
    labels,
  });
}

export function* createUTXOReferenceWorker({
  payload,
}: {
  payload: { labels: Array<{ name: string; type: LabelType }>; txId: string; vout: number };
}) {
  const { txId, vout, labels } = payload;
  yield call(dbManager.createObject, RealmSchema.UTXOInfo, {
    id: `${txId}${vout}`,
    txId,
    vout,
    walletId: 'ABC123',
    labels,
  });
}

export const addLabelsWatcher = createWatcher(addLabelsWorker, ADD_LABELS);
export const bulkUpdateLabelWatcher = createWatcher(bulkUpdateLabelsWorker, BULK_UPDATE_LABELS);
export const createUTXOReferenceWatcher = createWatcher(
  createUTXOReferenceWorker,
  CREATE_UTXO_REFERENCE
);
