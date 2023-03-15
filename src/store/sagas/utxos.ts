import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { call } from 'redux-saga/effects';
import { UTXO } from 'src/core/wallets/interfaces';
import { LabelType } from 'src/core/wallets/enums';
import { createWatcher } from '../utilities';

import { ADD_LABELS } from '../sagaActions/utxos';

function* addLabelsWorker({
  payload,
}: {
  payload: { walletId: string; names: string[]; UTXO: UTXO };
}) {
  const { UTXO, walletId, names } = payload;
  const { txId, vout } = UTXO;
  // console.log('skk inside name', JSON.stringify(names))
  yield call(dbManager.createObject, RealmSchema.UTXOInfo, {
    id: `${txId}${vout}`,
    txId,
    vout,
    walletId,
    labels: names.map((name) => ({ name, type: LabelType.USER })),
  });
}

export const addLabelsWatcher = createWatcher(addLabelsWorker, ADD_LABELS);
