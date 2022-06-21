import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import TransactionPriority from 'src/common/data/enums/TransactionPriority';
import TransactionFeeSnapshot from 'src/common/data/models/TransactionFeeSnapshot';
import {
  AverageTxFeesByNetwork,
  ExchangeRates,
  TransactionPrerequisite,
  TransactionPrerequisiteElements,
} from 'src/core/wallets/interfaces/interface';

export interface SendPhaseOneExecutedPayload {
  successful: boolean;
  outputs?: {
    txPrerequisites?: TransactionPrerequisite;
    recipients?: {
      address: string;
      amount: number;
      name?: string;
    }[];
  };
  err?: string;
}

export interface SendPhaseTwoExecutedPayload {
  successful: boolean;
  txid?: string;
  err?: string;
}

export type TransactionFeeInfo = Record<TransactionPriority, TransactionFeeSnapshot>;

const initialState: {
  exchangeRates: ExchangeRates;
  averageTxFees: AverageTxFeesByNetwork;
  sendPhaseOne: {
    inProgress: boolean;
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    outputs: {
      txPrerequisites: TransactionPrerequisite;
      recipients: { address: string; amount: number }[];
    } | null;
  };
  customPrioritySendPhaseOne: {
    inProgress: boolean;
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    outputs: { customTxPrerequisites: TransactionPrerequisiteElements } | null;
  };
  sendPhaseTwo: {
    inProgress: boolean;
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    txid: string | null;
  };
  sendMaxFee: number;
  feeIntelMissing: boolean;
  transactionFeeInfo: TransactionFeeInfo;
} = {
  exchangeRates: null,
  averageTxFees: null,
  sendPhaseOne: {
    inProgress: false,
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    outputs: null,
  },
  customPrioritySendPhaseOne: {
    inProgress: false,
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    outputs: null,
  },
  sendPhaseTwo: {
    inProgress: false,
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    txid: null,
  },
  sendMaxFee: 0,
  feeIntelMissing: false,
  transactionFeeInfo: {
    [TransactionPriority.LOW]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 50,
    },
    [TransactionPriority.MEDIUM]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 20,
    },
    [TransactionPriority.HIGH]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 4,
    },
    [TransactionPriority.CUSTOM]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 0,
    },
  },
};

const sendAndReceiveSlice = createSlice({
  name: 'sendAndReceive',
  initialState,
  reducers: {
    setExchangeRates: (state, action) => {
      state.exchangeRates = action.payload;
    },

    setAverageTxFee: (state, action: PayloadAction<AverageTxFeesByNetwork>) => {
      state.averageTxFees = action.payload;
    },

    sendPhaseOneExecuted: (state, action: PayloadAction<SendPhaseOneExecutedPayload>) => {
      const transactionFeeInfo: TransactionFeeInfo = state.transactionFeeInfo;
      let txPrerequisites: TransactionPrerequisite;
      let recipients;
      const { successful, outputs, err } = action.payload;
      if (successful) {
        txPrerequisites = outputs.txPrerequisites;
        recipients = outputs.recipients;
        Object.keys(txPrerequisites).forEach((priority) => {
          transactionFeeInfo[priority.toUpperCase()].amount = txPrerequisites[priority].fee;
          transactionFeeInfo[priority.toUpperCase()].estimatedBlocksBeforeConfirmation =
            txPrerequisites[priority].estimatedBlocks;
        });
      }
      return {
        ...state,
        sendPhaseOne: {
          inProgress: false,
          hasFailed: !successful,
          failedErrorMessage: !successful ? err : null,
          isSuccessful: successful,
          outputs: {
            txPrerequisites,
            recipients,
          },
        },
        transactionFeeInfo,
      };
    },

    sendPhaseTwoExecuted: (state, action: PayloadAction<SendPhaseTwoExecutedPayload>) => {
      const { successful, txid, err } = action.payload;
      return {
        ...state,
        sendPhaseTwo: {
          inProgress: false,
          hasFailed: !successful,
          failedErrorMessage: !successful ? err : null,
          isSuccessful: successful,
          txid: successful ? txid : null,
        },
      };
    },
  },
});

export const { setExchangeRates, setAverageTxFee, sendPhaseOneExecuted, sendPhaseTwoExecuted } =
  sendAndReceiveSlice.actions;
export default sendAndReceiveSlice.reducer;
