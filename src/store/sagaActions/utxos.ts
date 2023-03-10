import { UTXO } from 'src/core/wallets/interfaces';

// types and action creators: dispatched by components and sagas
export const ADD_LABELS = 'ADD_LABELS';

export const addLabels = (payload: { walletId: string; names: string[]; UTXO: UTXO }) => ({
  type: ADD_LABELS,
  payload,
});
