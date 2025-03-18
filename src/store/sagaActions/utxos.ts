import { BIP329Label, UTXO } from 'src/services/wallets/interfaces';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';

// types and action creators: dispatched by components and sagas
export const ADD_LABELS = 'ADD_LABELS';
export const BULK_UPDATE_LABELS = 'BULK_UPDATE_LABELS';

export const addLabels = (payload: {
  txId: string;
  vout?: number;
  wallet: Wallet | Vault;
  labels: { name: string; isSystem: boolean }[];
  type;
}) => ({
  type: ADD_LABELS,
  payload,
});

export const bulkUpdateLabels = (payload: {
  labelChanges: {
    added: { isSystem: boolean; name: string }[];
    deleted: { isSystem: boolean; name: string }[];
  };
  UTXO?: UTXO;
  txId?: string;
  address?: string;
  wallet: Wallet;
}) => ({
  type: BULK_UPDATE_LABELS,
  payload,
});
