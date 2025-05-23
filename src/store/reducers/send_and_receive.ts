import {
  SerializedPSBTEnvelop,
  SigningPayload,
  TransactionPrerequisite,
  TransactionRecipients,
} from 'src/services/wallets/interfaces';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Satoshis } from 'src/models/types/UnitAliases';
import TransactionFeeSnapshot from 'src/models/types/TransactionFeeSnapshot';
import { TxPriority } from 'src/services/wallets/enums';
import idx from 'idx';

export interface SendPhaseOneExecutedPayload {
  successful: boolean;
  outputs?: {
    txPrerequisites?: TransactionPrerequisite;
    txRecipients?: TransactionRecipients;
  };
  err?: string;
}

export interface CustomFeeCalculatedPayload {
  successful: boolean;
  outputs?: {
    customTxPrerequisites: TransactionPrerequisite;
    customTxRecipients?: TransactionRecipients;
  };
  err?: string | null;
}

export interface SendPhaseTwoExecutedPayload {
  successful: boolean;
  serializedPSBTEnvelops?: SerializedPSBTEnvelop[];
  cachedTxid?: string;
  cachedTxPriority?: TxPriority;
  txid?: string;
  err?: string;
}

export interface UpdatePSBTPayload {
  signedSerializedPSBT?: string;
  signingPayload?: SigningPayload[];
  xfp: string;
  txHex?: string;
}

export interface SendPhaseThreeExecutedPayload {
  successful: boolean;
  txid?: string;
  err?: string;
}

export type TransactionFeeInfo = Record<TxPriority, TransactionFeeSnapshot>;

export interface SendAndReceiveState {
  sendPhaseOne: {
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    outputs: {
      txPrerequisites: TransactionPrerequisite;
      txRecipients: TransactionRecipients;
    } | null;
  };
  customPrioritySendPhaseOne: {
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    outputs: {
      customTxPrerequisites: TransactionPrerequisite;
      customTxRecipients: TransactionRecipients;
    } | null;
  };
  sendPhaseTwo: {
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    serializedPSBTEnvelops: SerializedPSBTEnvelop[];
    cachedTxid: string;
    cachedTxPriority: TxPriority;
    txid: string | null;
  };
  sendPhaseThree: {
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    txid: string | null;
  };
  sendMaxFee: number;
  transactionFeeInfo: TransactionFeeInfo;
}

const initialState: SendAndReceiveState = {
  sendPhaseOne: {
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    outputs: null,
  },
  customPrioritySendPhaseOne: {
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    outputs: null,
  },
  sendPhaseTwo: {
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    serializedPSBTEnvelops: null,
    cachedTxid: null,
    cachedTxPriority: null,
    txid: null,
  },
  sendPhaseThree: {
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    txid: null,
  },
  sendMaxFee: 0,
  transactionFeeInfo: {
    [TxPriority.LOW]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 0,
    },
    [TxPriority.MEDIUM]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 0,
    },
    [TxPriority.HIGH]: {
      amount: 0,
      estimatedBlocksBeforeConfirmation: 0,
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
    setSendMaxFee: (state, action: PayloadAction<Satoshis>) => {
      state.sendMaxFee = action.payload;
    },

    sendPhaseOneExecuted: (state, action: PayloadAction<SendPhaseOneExecutedPayload>) => {
      const { transactionFeeInfo } = state;
      let txPrerequisites: TransactionPrerequisite;
      let txRecipients;
      const { successful, outputs, err } = action.payload;
      if (successful) {
        txPrerequisites = outputs.txPrerequisites;
        txRecipients = outputs.txRecipients;
        Object.keys(txPrerequisites).forEach((priority) => {
          transactionFeeInfo[priority].amount = txPrerequisites[priority].fee;
          transactionFeeInfo[priority].estimatedBlocksBeforeConfirmation =
            txPrerequisites[priority].estimatedBlocks;
        });
      }
      state.sendPhaseOne = {
        ...state.sendPhaseOne,
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        outputs: {
          txPrerequisites,
          txRecipients,
        },
      };
      state.transactionFeeInfo = transactionFeeInfo;
    },

    customFeeCalculated: (state, action: PayloadAction<CustomFeeCalculatedPayload>) => {
      const { transactionFeeInfo } = state;
      let customTxPrerequisites: TransactionPrerequisite;
      let customTxRecipients;
      const { successful, outputs, err } = action.payload;
      if (successful) {
        customTxPrerequisites = outputs.customTxPrerequisites;
        Object.keys(customTxPrerequisites).forEach((priority) => {
          transactionFeeInfo[priority].amount = customTxPrerequisites[priority].fee;
          transactionFeeInfo[priority].estimatedBlocksBeforeConfirmation =
            customTxPrerequisites[priority].estimatedBlocks;
        });
        customTxRecipients = outputs.customTxRecipients;
      }
      state.customPrioritySendPhaseOne = {
        ...state.customPrioritySendPhaseOne,
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        outputs: {
          customTxPrerequisites:
            customTxPrerequisites ||
            state.customPrioritySendPhaseOne?.outputs?.customTxPrerequisites,
          customTxRecipients:
            customTxRecipients || state.customPrioritySendPhaseOne?.outputs?.customTxRecipients,
        },
      };
      state.transactionFeeInfo = transactionFeeInfo;
    },

    sendPhaseTwoExecuted: (state, action: PayloadAction<SendPhaseTwoExecutedPayload>) => {
      const { successful, txid, serializedPSBTEnvelops, cachedTxid, cachedTxPriority, err } =
        action.payload;
      state.sendPhaseTwo = {
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        serializedPSBTEnvelops: successful ? serializedPSBTEnvelops : null,
        cachedTxid: serializedPSBTEnvelops ? cachedTxid : null,
        cachedTxPriority: serializedPSBTEnvelops ? cachedTxPriority : null,
        txid: successful ? txid : null,
      };
    },

    updatePSBTEnvelops: (state, action: PayloadAction<UpdatePSBTPayload>) => {
      const { xfp, signingPayload, signedSerializedPSBT, txHex } = action.payload;
      state.sendPhaseTwo = {
        ...state.sendPhaseTwo,
        serializedPSBTEnvelops: state.sendPhaseTwo.serializedPSBTEnvelops.map((envelop) => {
          if (envelop.xfp === xfp) {
            envelop.serializedPSBT = signedSerializedPSBT || envelop.serializedPSBT;
            envelop.isSigned =
              signedSerializedPSBT ||
              txHex || // for coldcard and keystone
              !!idx(signingPayload, (_) => _[0].inputsToSign[0].signature) // for tapsigner
                ? true
                : envelop.isSigned;
            envelop.signingPayload = signingPayload || envelop.signingPayload;
            envelop.txHex = txHex || envelop.txHex;
          }
          return envelop;
        }),
      };
    },

    sendPhaseThreeExecuted: (state, action: PayloadAction<SendPhaseThreeExecutedPayload>) => {
      const { successful, txid, err } = action.payload;
      state.sendPhaseThree = {
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        txid: successful ? txid : null,
      };
    },

    sendPhasesReset: (state) => {
      state = initialState;
      return state;
    },
    sendPhaseOneReset: (state) => {
      state.sendPhaseOne = initialState.sendPhaseOne;
      state.customPrioritySendPhaseOne = initialState.customPrioritySendPhaseOne;
      state.sendPhaseTwo = initialState.sendPhaseTwo;
      state.sendPhaseThree = initialState.sendPhaseThree;
      state.transactionFeeInfo = initialState.transactionFeeInfo;
    },
    customPrioritySendPhaseOneReset: (state) => {
      state.customPrioritySendPhaseOne = initialState.customPrioritySendPhaseOne;
      state.sendPhaseTwo = initialState.sendPhaseTwo;
      state.sendPhaseThree = initialState.sendPhaseThree;
      state.transactionFeeInfo = {
        ...state.transactionFeeInfo,
        [TxPriority.CUSTOM]: {
          amount: 0,
          estimatedBlocksBeforeConfirmation: 0,
        },
      };
    },
    customPrioritySendPhaseOneStatusReset: (state) => {
      state.customPrioritySendPhaseOne.failedErrorMessage =
        initialState.customPrioritySendPhaseOne.failedErrorMessage;
      state.customPrioritySendPhaseOne.hasFailed =
        initialState.customPrioritySendPhaseOne.hasFailed;
      state.customPrioritySendPhaseOne.isSuccessful =
        initialState.customPrioritySendPhaseOne.isSuccessful;
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
    setStateFromSnapshot: (state, action: PayloadAction<SendAndReceiveState>) => {
      state = action.payload;
      return state;
    },
  },
});

export const {
  setSendMaxFee,
  sendPhaseOneExecuted,
  customFeeCalculated,
  sendPhaseTwoExecuted,
  sendPhaseThreeExecuted,
  sendPhasesReset,
  sendPhaseOneReset,
  customPrioritySendPhaseOneReset,
  customPrioritySendPhaseOneStatusReset,
  sendPhaseTwoReset,
  sendPhaseThreeReset,
  updatePSBTEnvelops,
  setStateFromSnapshot,
} = sendAndReceiveSlice.actions;
export default sendAndReceiveSlice.reducer;
