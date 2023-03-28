import { LabelType } from 'src/core/wallets/enums';
import { UTXO } from 'src/core/wallets/interfaces';

// types and action creators: dispatched by components and sagas
export const ADD_LABELS = 'ADD_LABELS';
export const BULK_UPDATE_LABELS = 'BULK_UPDATE_LABELS';
export const CREATE_UTXO_REFERENCE = 'CREATE_UTXO_REFERENCE';

export const addLabels = (payload: {
  labels: Array<{ name: string; type: LabelType }>;
  UTXO: UTXO;
}) => ({
  type: ADD_LABELS,
  payload,
});

export const bulkUpdateLabels = (payload: {
  labels: Array<{ name: string; type: LabelType }>;
  UTXO: UTXO;
}) => ({
  type: BULK_UPDATE_LABELS,
  payload,
});

export const createUTXOReference = (payload: {
  labels: Array<{ name: string; type: LabelType }>;
  txId: string;
  vout: number;
}) => ({
  type: CREATE_UTXO_REFERENCE,
  payload,
});
