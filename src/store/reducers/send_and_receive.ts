import {
  AverageTxFeesByNetwork,
  ExchangeRates,
  SerializedPSBTEnvelop,
  SigningPayload,
  TransactionPrerequisite,
  TransactionPrerequisiteElements,
} from 'src/core/wallets/interfaces/';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Satoshis } from 'src/common/data/typealiases/UnitAliases';
import TransactionFeeSnapshot from 'src/common/data/models/TransactionFeeSnapshot';
import { TxPriority } from 'src/core/wallets/enums';

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
  serializedPSBTEnvelops?: SerializedPSBTEnvelop[];
  txid?: string;
  err?: string;
}

export interface UpdatePSBTPayload {
  signedSerializedPSBT?: string;
  signingPayload?: SigningPayload[];
  signerId: string;
  txHex?: string;
}

export interface SendPhaseThreeExecutedPayload {
  successful: boolean;
  txid?: string;
  err?: string;
}

export type TransactionFeeInfo = Record<TxPriority, TransactionFeeSnapshot>;

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
    serializedPSBTEnvelops: SerializedPSBTEnvelop[];
    txid: string | null;
  };
  sendPhaseThree: {
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
    serializedPSBTEnvelops: null,
    txid: null,
  },
  sendPhaseThree: {
    inProgress: false,
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    txid: null,
  },
  sendMaxFee: 0,
  feeIntelMissing: false,
  transactionFeeInfo: {
    [TxPriority.LOW]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 50,
    },
    [TxPriority.MEDIUM]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 20,
    },
    [TxPriority.HIGH]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 4,
    },
    [TxPriority.CUSTOM]: {
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

    setSendMaxFee: (state, action: PayloadAction<Satoshis>) => {
      state.sendMaxFee = action.payload;
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
          transactionFeeInfo[priority].amount = txPrerequisites[priority].fee;
          transactionFeeInfo[priority].estimatedBlocksBeforeConfirmation =
            txPrerequisites[priority].estimatedBlocks;
        });
      }
      state.sendPhaseOne = {
        ...state.sendPhaseOne,
        inProgress: false,
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        outputs: {
          txPrerequisites,
          recipients,
        },
      };
      state.transactionFeeInfo = transactionFeeInfo;
    },

    sendPhaseTwoExecuted: (state, action: PayloadAction<SendPhaseTwoExecutedPayload>) => {
      const { successful, txid, serializedPSBTEnvelops, err } = action.payload;
      state.sendPhaseTwo = {
        inProgress: false,
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        serializedPSBTEnvelops: successful ? serializedPSBTEnvelops : null,
        txid: successful ? txid : null,
      };
    },

    updatePSBTEnvelops: (state, action: PayloadAction<UpdatePSBTPayload>) => {
      const { signerId, signingPayload, signedSerializedPSBT, txHex } = action.payload;
      state.sendPhaseTwo = {
        ...state.sendPhaseTwo,
        serializedPSBTEnvelops: state.sendPhaseTwo.serializedPSBTEnvelops.map((envelop) => {
          if (envelop.signerId === signerId) {
            envelop.serializedPSBT = signedSerializedPSBT
              ? signedSerializedPSBT
              : envelop.serializedPSBT;
            envelop.isSigned = signedSerializedPSBT || txHex ? true : envelop.isSigned;
            envelop.signingPayload = signingPayload ? signingPayload : envelop.signingPayload;
            envelop.txHex = txHex ? txHex : envelop.txHex;
          }
          return envelop;
        }),
      };
    },

    sendPhaseThreeExecuted: (state, action: PayloadAction<SendPhaseThreeExecutedPayload>) => {
      const { successful, txid, err } = action.payload;
      state.sendPhaseThree = {
        inProgress: false,
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        txid: successful ? txid : null,
      };
    },

    sendPhasesReset: (state) => {
      state.sendMaxFee = 0;
      state.sendPhaseOne = initialState.sendPhaseOne;
      state.sendPhaseTwo = initialState.sendPhaseTwo;
      state.sendPhaseThree = initialState.sendPhaseThree;
    },
    sendPhaseOneReset: (state) => {
      state.sendPhaseOne = initialState.sendPhaseOne;
      state.sendPhaseTwo = initialState.sendPhaseTwo;
      state.sendPhaseThree = initialState.sendPhaseThree;
    },
    sendPhaseTwoReset: (state) => {
      state.sendPhaseTwo = initialState.sendPhaseTwo;
      state.sendPhaseThree = initialState.sendPhaseThree;
    },
    sendPhaseThreeReset: (state) => {
      state.sendPhaseThree = initialState.sendPhaseThree;
    },
  },
});

export const {
  setExchangeRates,
  setAverageTxFee,
  setSendMaxFee,
  sendPhaseOneExecuted,
  sendPhaseTwoExecuted,
  sendPhaseThreeExecuted,
  sendPhasesReset,
  sendPhaseOneReset,
  sendPhaseTwoReset,
  sendPhaseThreeReset,
  updatePSBTEnvelops,
} = sendAndReceiveSlice.actions;
export default sendAndReceiveSlice.reducer;
