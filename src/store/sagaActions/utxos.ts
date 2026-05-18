import { UTXO, UTXOSpendabilityReason, UTXOSpendabilityStatus } from 'src/services/wallets/interfaces';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';

// types and action creators: dispatched by components and sagas
export const ADD_LABELS = 'ADD_LABELS';
export const BULK_UPDATE_LABELS = 'BULK_UPDATE_LABELS';
export const IMPORT_LABELS = 'IMPORT_LABELS';
export const UPDATE_UTXO_SPENDABILITY = 'UPDATE_UTXO_SPENDABILITY';

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

export const importLabels = (payload: {
  labels: [
    {
      type: string;
      ref: string;
      label: string;
      origin: string;
    }
  ];
}) => ({
  type: IMPORT_LABELS,
  payload,
});

export const updateUTXOSpendability = (payload: {
  walletId: string;
  utxo: { txId: string; vout: number };
  spendabilityStatus: UTXOSpendabilityStatus;
  spendabilityReason?: UTXOSpendabilityReason;
  isUserOverride?: boolean;
  dustToastShown?: boolean;
}) => ({
  type: UPDATE_UTXO_SPENDABILITY,
  payload,
});

export const markDoNotSpendUTXO = (payload: {
  walletId: string;
  utxo: { txId: string; vout: number };
}) =>
  updateUTXOSpendability({
    walletId: payload.walletId,
    utxo: payload.utxo,
    spendabilityStatus: UTXOSpendabilityStatus.DO_NOT_SPEND,
    spendabilityReason: UTXOSpendabilityReason.MARKED_MANUALLY,
    isUserOverride: true,
  });

export const markSpendableUTXO = (payload: {
  walletId: string;
  utxo: { txId: string; vout: number };
}) =>
  updateUTXOSpendability({
    walletId: payload.walletId,
    utxo: payload.utxo,
    spendabilityStatus: UTXOSpendabilityStatus.SPENDABLE,
    isUserOverride: true,
  });
