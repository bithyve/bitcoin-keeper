import { UTXO } from 'src/core/wallets/interfaces';

import { Action } from 'redux';
import { Recipient } from 'src/models/interfaces/Recipient';
import { TxPriority } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { TransferType } from 'src/models/enums/TransferType';
import { Satoshis } from 'src/models/types/UnitAliases';

export const RESET_SEND_STATE = 'RESET_SEND_STATE';
export const SOURCE_WALLET_SELECTED_FOR_SENDING = 'SOURCE_WALLET_SELECTED_FOR_SENDING';
export const ADD_RECIPIENT_FOR_SENDING = 'ADD_RECIPIENT_FOR_SENDING';
export const RECIPIENT_REMOVED_FROM_SENDING = 'RECIPIENT_REMOVED_FROM_SENDING';
export const RECIPIENT_SELECTED_FOR_AMOUNT_SETTING = 'RECIPIENT_SELECTED_FOR_AMOUNT_SETTING';
export const AMOUNT_FOR_RECIPIENT_UPDATED = 'AMOUNT_FOR_RECIPIENT_UPDATED';
export const SET_BALANCE_FOR_SENDING_RECIPIENT = 'SET_BALANCE_FOR_SENDING_RECIPIENT';
export const FETCH_EXCHANGE_RATES = 'FETCH_EXCHANGE_RATES';
export const FETCH_FEE_RATES = 'FETCH_FEE_RATES';
export const AVERAGE_TX_FEE = 'AVERAGE_TX_FEE';
export const EXCHANGE_RATE_CALCULATED = 'EXCHANGE_RATE_CALCULATED';
export const SEND_PHASE_ONE = 'SEND_PHASE_ONE';
export const CROSS_TRANSFER = 'CROSS_TRANSFER';
export const RESET_SEND_PHASE_ONE = 'RESET_SEND_PHASE_ONE';
export const FEE_INTEL_MISSING = 'FEE_INTEL_MISSING';
export const SEND_PHASE_TWO = 'SEND_PHASE_TWO';
export const SEND_PHASE_THREE = 'SEND_PHASE_THREE';
export const SENDING_FAILED = 'SENDING_FAILED';
export const SENDING_SUCCEEDED = 'SENDING_SUCCEEDED';
export const SENDING_COMPLETED = 'SENDING_COMPLETED';
export const CALCULATE_SEND_MAX_FEE = 'CALCULATE_SEND_MAX_FEE';
export const CLEAR_SEND_MAX_FEE = 'CLEAR_SEND_MAX_FEE';
export const SEND_MAX_FEE_CALCULATED = 'SEND_MAX_FEE_CALCULATED';
export const CALCULATE_CUSTOM_FEE = 'CALCULATE_CUSTOM_FEE';
export const CUSTOM_SEND_MAX_CALCULATED = 'CUSTOM_SEND_MAX_CALCULATED';
export const SEND_TX_NOTIFICATION = 'SEND_TX_NOTIFICATION';

export interface ResetSendState extends Action {
  type: typeof RESET_SEND_STATE;
}

export const resetSendState = (): ResetSendState => ({
  type: RESET_SEND_STATE,
});

export interface SourceAccountSelectedForSendingAction extends Action {
  type: typeof SOURCE_WALLET_SELECTED_FOR_SENDING;
  payload: Wallet | Vault;
}

export const sourceAccountSelectedForSending = (
  payload: Wallet | Vault
): SourceAccountSelectedForSendingAction => ({
  type: SOURCE_WALLET_SELECTED_FOR_SENDING,
  payload,
});

export interface AddRecipientForSendingAction extends Action {
  type: typeof ADD_RECIPIENT_FOR_SENDING;
  payload: Recipient;
}

export const addRecipientForSending = (payload: Recipient): AddRecipientForSendingAction => ({
  type: ADD_RECIPIENT_FOR_SENDING,
  payload,
});

export interface RecipientSelectedForAmountSettingAction extends Action {
  type: typeof RECIPIENT_SELECTED_FOR_AMOUNT_SETTING;
  payload: Recipient;
}

export const recipientSelectedForAmountSetting = (
  payload: Recipient
): RecipientSelectedForAmountSettingAction => ({
  type: RECIPIENT_SELECTED_FOR_AMOUNT_SETTING,
  payload,
});

export interface RecipientRemovedFromSendingAction extends Action {
  type: typeof RECIPIENT_REMOVED_FROM_SENDING;
  payload: Recipient;
}

export const recipientRemovedFromSending = (
  payload: Recipient
): RecipientRemovedFromSendingAction => ({
  type: RECIPIENT_REMOVED_FROM_SENDING,
  payload,
});

export interface AmountForRecipientUpdatedAction extends Action {
  type: typeof AMOUNT_FOR_RECIPIENT_UPDATED;
  payload: {
    recipient: Recipient;
    amount: Satoshis;
  };
}

export const amountForRecipientUpdated = (payload: {
  recipient: Recipient;
  amount: Satoshis;
}): AmountForRecipientUpdatedAction => ({
  type: AMOUNT_FOR_RECIPIENT_UPDATED,
  payload,
});

export const fetchExchangeRates = () => ({
  type: FETCH_EXCHANGE_RATES,
});

export const fetchFeeRates = () => ({
  type: FETCH_FEE_RATES,
});

export interface SendPhaseOneAction extends Action {
  type: typeof SEND_PHASE_ONE;
  payload: {
    wallet: Wallet | Vault;
    recipients: {
      address: string;
      amount: number;
    }[];
    selectedUTXOs?: UTXO[];
  };
}

export const sendPhaseOne = (payload: {
  wallet: Wallet | Vault;
  recipients: {
    address: string;
    amount: number;
  }[];
  selectedUTXOs?: UTXO[];
}): SendPhaseOneAction => ({
  type: SEND_PHASE_ONE,
  payload,
});

export interface ResetSendStage1Action extends Action {
  type: typeof RESET_SEND_PHASE_ONE;
}

export const resetSendStage1 = (): ResetSendStage1Action => ({
  type: RESET_SEND_PHASE_ONE,
});

export interface FeeIntelMissingAction extends Action {
  type: typeof FEE_INTEL_MISSING;
  payload: {
    intelMissing: boolean;
  };
}

export const feeIntelMissing = (payload: { intelMissing: boolean }): FeeIntelMissingAction => ({
  type: FEE_INTEL_MISSING,
  payload,
});

export interface SendPhaseTwoAction extends Action {
  type: typeof SEND_PHASE_TWO;
  payload: {
    wallet: Wallet | Vault;
    txnPriority: TxPriority;
    transferType: TransferType;
    note?: string;
    label?: { name: string; isSystem: boolean }[];
  };
}

export const sendPhaseTwo = (payload: {
  wallet: Wallet | Vault;
  txnPriority: TxPriority;
  transferType: TransferType;
  token?: number;
  note?: string;
  label?: { name: string; isSystem: boolean }[];
}): SendPhaseTwoAction => ({
  type: SEND_PHASE_TWO,
  payload,
});

export interface SendPhaseThreeAction extends Action {
  type: typeof SEND_PHASE_THREE;
  payload: {
    wallet: Wallet | Vault;
    txnPriority: TxPriority;
    note?: string;
    label?: { name: string; isSystem: boolean }[];
  };
}

export const sendPhaseThree = (payload: {
  wallet: Wallet | Vault;
  txnPriority: TxPriority;
  note: string;
  label: { name: string; isSystem: boolean }[];
}): SendPhaseThreeAction => ({
  type: SEND_PHASE_THREE,
  payload,
});

export interface CrossTransferAction extends Action {
  type: typeof CROSS_TRANSFER;
  payload: {
    sender: Wallet | Vault;
    recipient: Wallet | Vault;
    amount: number;
  };
}

export const crossTransfer = (payload: {
  sender: Wallet | Vault;
  recipient: Wallet | Vault;
  amount: number;
}): CrossTransferAction => ({
  type: CROSS_TRANSFER,
  payload,
});
export interface SendingFailureAction extends Action {
  type: typeof SENDING_FAILED;
}

export const sendingFailed = (): SendingFailureAction => ({
  type: SENDING_FAILED,
});

export interface SendingSuccessAction extends Action {
  type: typeof SENDING_SUCCEEDED;
}

export const sendingSucceeded = (): SendingSuccessAction => ({
  type: SENDING_SUCCEEDED,
});

export interface SendingCompletionAction extends Action {
  type: typeof SENDING_COMPLETED;
}

export const sendingCompleted = (): SendingCompletionAction => ({
  type: SENDING_COMPLETED,
});

export interface CalculateSendMaxFeeAction extends Action {
  type: typeof CALCULATE_SEND_MAX_FEE;
  payload: {
    numberOfRecipients: number;
    wallet: Wallet | Vault;
    selectedUTXOs?: UTXO[];
  };
}

export const calculateSendMaxFee = (payload: {
  numberOfRecipients: number;
  wallet: Wallet | Vault;
  selectedUTXOs?: UTXO[];
}): CalculateSendMaxFeeAction => ({
  type: CALCULATE_SEND_MAX_FEE,
  payload,
});

export const clearSendMaxFee = () => ({
  type: CLEAR_SEND_MAX_FEE,
});

export interface CalculateCustomFeeAction extends Action {
  type: typeof CALCULATE_CUSTOM_FEE;
  payload: {
    wallet: Wallet | Vault;
    recipients: {
      address: string;
      amount: number;
    }[];
    feePerByte: string;
    customEstimatedBlocks: string;
    selectedUTXOs?: UTXO[];
  };
}

export const calculateCustomFee = (payload: {
  wallet: Wallet | Vault;
  recipients: {
    address: string;
    amount: number;
  }[];
  feePerByte: string;
  customEstimatedBlocks: string;
  selectedUTXOs?: UTXO[];
}): CalculateCustomFeeAction => ({
  type: CALCULATE_CUSTOM_FEE,
  payload,
});
export interface CustomSendMaxCalculatedAction extends Action {
  type: typeof CUSTOM_SEND_MAX_CALCULATED;
  payload: {
    recipients: Recipient[];
  };
}

export const customSendMaxUpdated = (payload: {
  recipients: Recipient[];
}): CustomSendMaxCalculatedAction => ({
  type: CUSTOM_SEND_MAX_CALCULATED,
  payload,
});

export interface SendTxNotificationAction extends Action {
  type: typeof SEND_TX_NOTIFICATION;
  payload?: {
    txid: string;
  };
}

export const sendTxNotification = (txid?): SendTxNotificationAction => ({
  type: SEND_TX_NOTIFICATION,
  payload: {
    txid,
  },
});
