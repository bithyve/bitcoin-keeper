import { Action } from 'redux';
import { Satoshis } from '../../common/data/typealiases/UnitAliases';
import {
  MultiSigWallet,
  TransactionPrerequisite,
  TransactionPrerequisiteElements,
  Wallet,
} from 'src/core/wallets/interfaces/interface';
import { TxPriority } from 'src/core/wallets/interfaces/enum';
import { Recipient } from 'src/common/data/models/interfaces/Recipient';

export const RESET_SEND_STATE = 'RESET_SEND_STATE';
export const SOURCE_WALLET_SELECTED_FOR_SENDING = 'SOURCE_WALLET_SELECTED_FOR_SENDING';
export const ADD_RECIPIENT_FOR_SENDING = 'ADD_RECIPIENT_FOR_SENDING';
export const RECIPIENT_REMOVED_FROM_SENDING = 'RECIPIENT_REMOVED_FROM_SENDING';
export const RECIPIENT_SELECTED_FOR_AMOUNT_SETTING = 'RECIPIENT_SELECTED_FOR_AMOUNT_SETTING';
export const AMOUNT_FOR_RECIPIENT_UPDATED = 'AMOUNT_FOR_RECIPIENT_UPDATED';
export const SET_BALANCE_FOR_SENDING_RECIPIENT = 'SET_BALANCE_FOR_SENDING_RECIPIENT';
export const FETCH_FEE_AND_EXCHANGE_RATES = 'FETCH_FEE_AND_EXCHANGE_RATES';
export const AVERAGE_TX_FEE = 'AVERAGE_TX_FEE';
export const EXCHANGE_RATE_CALCULATED = 'EXCHANGE_RATE_CALCULATED';
export const SEND_PHASE_ONE = 'SEND_PHASE_ONE';
export const SEND_PHASE_ONE_EXECUTED = 'SEND_PHASE_ONE_EXECUTED';
export const CROSS_TRANSFER = 'CROSS_TRANSFER';
export const RESET_SEND_PHASE_ONE = 'RESET_SEND_PHASE_ONE';
export const FEE_INTEL_MISSING = 'FEE_INTEL_MISSING';
export const SEND_PHASE_TWO = 'SEND_PHASE_TWO';
export const SEND_PHASE_TWO_EXECUTED = 'SEND_PHASE_TWO_EXECUTED';
export const SENDING_FAILED = 'SENDING_FAILED';
export const SENDING_SUCCEEDED = 'SENDING_SUCCEEDED';
export const SENDING_COMPLETED = 'SENDING_COMPLETED';
export const CALCULATE_SEND_MAX_FEE = 'CALCULATE_SEND_MAX_FEE';
export const CLEAR_SEND_MAX_FEE = 'CLEAR_SEND_MAX_FEE';
export const SEND_MAX_FEE_CALCULATED = 'SEND_MAX_FEE_CALCULATED';
export const CALCULATE_CUSTOM_FEE = 'CALCULATE_CUSTOM_FEE';
export const CUSTOM_FEE_CALCULATED = 'CUSTOM_FEE_CALCULATED';
export const CUSTOM_SEND_MAX_CALCULATED = 'CUSTOM_SEND_MAX_CALCULATED';
export const SEND_TX_NOTIFICATION = 'SEND_TX_NOTIFICATION';

export interface ResetSendState extends Action {
  type: typeof RESET_SEND_STATE;
}

export const resetSendState = (): ResetSendState => {
  return {
    type: RESET_SEND_STATE,
  };
};

export interface SourceAccountSelectedForSendingAction extends Action {
  type: typeof SOURCE_WALLET_SELECTED_FOR_SENDING;
  payload: Wallet | MultiSigWallet;
}

export const sourceAccountSelectedForSending = (
  payload: Wallet | MultiSigWallet
): SourceAccountSelectedForSendingAction => {
  return {
    type: SOURCE_WALLET_SELECTED_FOR_SENDING,
    payload,
  };
};

export interface AddRecipientForSendingAction extends Action {
  type: typeof ADD_RECIPIENT_FOR_SENDING;
  payload: Recipient;
}

export const addRecipientForSending = (payload: Recipient): AddRecipientForSendingAction => {
  return {
    type: ADD_RECIPIENT_FOR_SENDING,
    payload,
  };
};

export interface RecipientSelectedForAmountSettingAction extends Action {
  type: typeof RECIPIENT_SELECTED_FOR_AMOUNT_SETTING;
  payload: Recipient;
}

export const recipientSelectedForAmountSetting = (
  payload: Recipient
): RecipientSelectedForAmountSettingAction => {
  return {
    type: RECIPIENT_SELECTED_FOR_AMOUNT_SETTING,
    payload,
  };
};

export interface RecipientRemovedFromSendingAction extends Action {
  type: typeof RECIPIENT_REMOVED_FROM_SENDING;
  payload: Recipient;
}

export const recipientRemovedFromSending = (
  payload: Recipient
): RecipientRemovedFromSendingAction => {
  return {
    type: RECIPIENT_REMOVED_FROM_SENDING,
    payload,
  };
};

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
}): AmountForRecipientUpdatedAction => {
  return {
    type: AMOUNT_FOR_RECIPIENT_UPDATED,
    payload,
  };
};

export const fetchFeeAndExchangeRates = () => {
  return {
    type: FETCH_FEE_AND_EXCHANGE_RATES,
  };
};

export interface SendPhaseOneAction extends Action {
  type: typeof SEND_PHASE_ONE;
  payload: {
    wallet: Wallet | MultiSigWallet;
    recipients: {
      address: string;
      amount: number;
    }[];
  };
}

export const sendPhaseOne = (payload: { wallet: Wallet; recipients }): SendPhaseOneAction => {
  return {
    type: SEND_PHASE_ONE,
    payload,
  };
};

export interface SendStage1ExecutedAction extends Action {
  type: typeof SEND_PHASE_ONE_EXECUTED;
  payload: {
    successful: boolean;
    carryOver?: {
      txPrerequisites?: TransactionPrerequisite;
      recipients?: {
        address: string;
        amount: number;
        name?: string;
      }[];
    };
    err?: string;
  };
}

export const sendStage1Executed = (payload: {
  successful: boolean;
  carryOver?: {
    txPrerequisites?: TransactionPrerequisite;
    recipients: {
      address: string;
      amount: number;
      name?: string;
    }[];
  };
  err?: string;
}): SendStage1ExecutedAction => {
  return {
    type: SEND_PHASE_ONE_EXECUTED,
    payload,
  };
};

export interface ResetSendStage1Action extends Action {
  type: typeof RESET_SEND_PHASE_ONE;
}

export const resetSendStage1 = (): ResetSendStage1Action => {
  return {
    type: RESET_SEND_PHASE_ONE,
  };
};

export interface FeeIntelMissingAction extends Action {
  type: typeof FEE_INTEL_MISSING;
  payload: {
    intelMissing: boolean;
  };
}

export const feeIntelMissing = (payload: { intelMissing: boolean }): FeeIntelMissingAction => {
  return {
    type: FEE_INTEL_MISSING,
    payload,
  };
};

export interface SendPhaseTwoAction extends Action {
  type: typeof SEND_PHASE_TWO;
  payload: {
    wallet: Wallet | MultiSigWallet;
    txnPriority: TxPriority;
    token?: number;
    note?: string;
  };
}

export const sendPhaseTwo = (payload: {
  wallet: Wallet | MultiSigWallet;
  txnPriority: TxPriority;
  token?: number;
  note?: string;
}): SendPhaseTwoAction => {
  return {
    type: SEND_PHASE_TWO,
    payload,
  };
};

export interface SendStage2ExecutedAction extends Action {
  type: typeof SEND_PHASE_TWO_EXECUTED;
  payload: { successful: boolean; txid?: string; err?: string };
}

export const sendStage2Executed = (payload: {
  successful: boolean;
  txid?: string;
  err?: string;
}): SendStage2ExecutedAction => {
  return {
    type: SEND_PHASE_TWO_EXECUTED,
    payload,
  };
};

export interface CrossTransferAction extends Action {
  type: typeof CROSS_TRANSFER;
  payload: {
    sender: Wallet | MultiSigWallet;
    recipient: Wallet | MultiSigWallet;
    amount: number;
  };
}

export const crossTransfer = (payload: {
  sender: Wallet | MultiSigWallet;
  recipient: Wallet | MultiSigWallet;
  amount: number;
}): CrossTransferAction => {
  return {
    type: CROSS_TRANSFER,
    payload,
  };
};
export interface SendingFailureAction extends Action {
  type: typeof SENDING_FAILED;
}

export const sendingFailed = (): SendingFailureAction => {
  return {
    type: SENDING_FAILED,
  };
};

export interface SendingSuccessAction extends Action {
  type: typeof SENDING_SUCCEEDED;
}

export const sendingSucceeded = (): SendingSuccessAction => {
  return {
    type: SENDING_SUCCEEDED,
  };
};

export interface SendingCompletionAction extends Action {
  type: typeof SENDING_COMPLETED;
}

export const sendingCompleted = (): SendingCompletionAction => {
  return {
    type: SENDING_COMPLETED,
  };
};

export interface CalculateSendMaxFeeAction extends Action {
  type: typeof CALCULATE_SEND_MAX_FEE;
  payload: {
    numberOfRecipients: number;
    wallet: Wallet | MultiSigWallet;
  };
}

export const calculateSendMaxFee = (payload: {
  numberOfRecipients: number;
  wallet: Wallet | MultiSigWallet;
}): CalculateSendMaxFeeAction => {
  return {
    type: CALCULATE_SEND_MAX_FEE,
    payload,
  };
};

export const clearSendMaxFee = () => {
  return {
    type: CLEAR_SEND_MAX_FEE,
  };
};

export interface SendMaxFeeCalculatedAction extends Action {
  type: typeof SEND_MAX_FEE_CALCULATED;
  payload: Satoshis;
}

export const sendMaxFeeCalculated = (payload: Satoshis): SendMaxFeeCalculatedAction => {
  return {
    type: SEND_MAX_FEE_CALCULATED,
    payload,
  };
};

export interface CalculateCustomFeeAction extends Action {
  type: typeof CALCULATE_CUSTOM_FEE;
  payload: {
    wallet: Wallet | MultiSigWallet;
    recipients: {
      address: string;
      amount: number;
    }[];
    feePerByte: string;
    customEstimatedBlocks: string;
  };
}

export const calculateCustomFee = (payload: {
  wallet: Wallet | MultiSigWallet;
  recipients: {
    address: string;
    amount: number;
  }[];
  feePerByte: string;
  customEstimatedBlocks: string;
}): CalculateCustomFeeAction => {
  return {
    type: CALCULATE_CUSTOM_FEE,
    payload,
  };
};

export interface CustomFeeCalculatedAction extends Action {
  type: typeof CUSTOM_FEE_CALCULATED;
  payload: {
    successful: boolean;
    carryOver?: { customTxPrerequisites: TransactionPrerequisiteElements };
    err?: string | null;
  };
}

export const customFeeCalculated = (payload: {
  successful: boolean;
  carryOver?: { customTxPrerequisites: TransactionPrerequisiteElements };
  err?: string | null;
}): CustomFeeCalculatedAction => {
  return {
    type: CUSTOM_FEE_CALCULATED,
    payload,
  };
};

export interface CustomSendMaxCalculatedAction extends Action {
  type: typeof CUSTOM_SEND_MAX_CALCULATED;
  payload: {
    recipients: Recipient[];
  };
}

export const customSendMaxUpdated = (payload: {
  recipients: Recipient[];
}): CustomSendMaxCalculatedAction => {
  return {
    type: CUSTOM_SEND_MAX_CALCULATED,
    payload,
  };
};

export interface SendTxNotificationAction extends Action {
  type: typeof SEND_TX_NOTIFICATION;
  payload?: {
    txid: string;
  };
}

export const sendTxNotification = (txid?): SendTxNotificationAction => {
  return {
    type: SEND_TX_NOTIFICATION,
    payload: {
      txid,
    },
  };
};
