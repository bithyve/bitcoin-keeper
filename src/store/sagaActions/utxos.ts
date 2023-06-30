import { LabelType } from 'src/core/wallets/enums';
import { UTXO } from 'src/core/wallets/interfaces';
import { Wallet } from 'src/core/wallets/interfaces/wallet';

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
  labelChanges: {
    added: { isSystem: boolean; name: string }[];
    deleted: { isSystem: boolean; name: string }[];
  };
  UTXO: UTXO;
  wallet: Wallet;
}) => ({
  type: BULK_UPDATE_LABELS,
  payload,
});

export const createUTXOReference = (
  payload: {
    labels: Array<{ name: string; type: LabelType }>;
    txId: string;
    vout: number;
  }[]
) => ({
  type: CREATE_UTXO_REFERENCE,
  payload,
});
