import {
  SerializedPSBTEnvelop,
  SigningPayload,
  TransactionPrerequisite,
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
    recipients?: {
      address: string;
      amount: number;
      name?: string;
    }[];
  };
  err?: string;
}

export interface CustomFeeCalculatedPayload {
  successful: boolean;
  outputs: {
    customTxPrerequisites: TransactionPrerequisite;
    recipients?: {
      address: string;
      amount: number;
      name?: string;
    }[];
  };
  err?: string | null;
}

export interface SendPhaseTwoExecutedPayload {
  successful: boolean;
  serializedPSBTEnvelops?: SerializedPSBTEnvelop[];
  cachedTxid?: string;
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
    outputs: {
      customTxPrerequisites: TransactionPrerequisite;
      recipients: { address: string; amount: number }[];
    } | null;
  };
  sendPhaseTwo: {
    inProgress: boolean;
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    serializedPSBTEnvelops: SerializedPSBTEnvelop[];
    cachedTxid: string;
    txid: string | null;
  };
  sendPhaseThree: {
    inProgress: boolean;
    hasFailed: boolean;
    failedErrorMessage: string | null;
    isSuccessful: boolean;
    txid: string | null;
  };
  crossTransfer: {
    hasFailed: boolean;
    isSuccessful: boolean;
  };
  sendMaxFee: number;
  feeIntelMissing: boolean;
  transactionFeeInfo: TransactionFeeInfo;
  inheritanceSigningRequestId: string;
}

const initialState: SendAndReceiveState = {
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
    cachedTxid: null,
    txid: null,
  },
  sendPhaseThree: {
    inProgress: false,
    hasFailed: false,
    failedErrorMessage: null,
    isSuccessful: false,
    txid: null,
  },
  crossTransfer: {
    hasFailed: false,
    isSuccessful: false,
  },
  sendMaxFee: 0,
  feeIntelMissing: false,
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
  inheritanceSigningRequestId: '',
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

    customFeeCalculated: (state, action: PayloadAction<CustomFeeCalculatedPayload>) => {
      const { transactionFeeInfo } = state;
      let customTxPrerequisites: TransactionPrerequisite;
      let recipients;
      const { successful, outputs, err } = action.payload;
      if (successful) {
        customTxPrerequisites = outputs.customTxPrerequisites;
        Object.keys(customTxPrerequisites).forEach((priority) => {
          transactionFeeInfo[priority].amount = customTxPrerequisites[priority].fee;
          transactionFeeInfo[priority].estimatedBlocksBeforeConfirmation =
            customTxPrerequisites[priority].estimatedBlocks;
        });
        recipients = outputs.recipients;
      }
      state.customPrioritySendPhaseOne = {
        ...state.customPrioritySendPhaseOne,
        inProgress: false,
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        outputs: {
          customTxPrerequisites,
          recipients,
        },
      };
      state.transactionFeeInfo = transactionFeeInfo;
    },

    sendPhaseTwoExecuted: (state, action: PayloadAction<SendPhaseTwoExecutedPayload>) => {
      const { successful, txid, serializedPSBTEnvelops, cachedTxid, err } = action.payload;
      state.sendPhaseTwo = {
        inProgress: false,
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        serializedPSBTEnvelops: successful ? serializedPSBTEnvelops : null,
        cachedTxid: serializedPSBTEnvelops ? cachedTxid : null,
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
        inProgress: false,
        hasFailed: !successful,
        failedErrorMessage: !successful ? err : null,
        isSuccessful: successful,
        txid: successful ? txid : null,
      };
    },

    crossTransferFailed: (state) => {
      state.crossTransfer.hasFailed = true;
    },
    crossTransferExecuted: (state) => {
      state.crossTransfer.isSuccessful = true;
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
    sendPhaseTwoReset: (state) => {
      state.sendPhaseTwo = initialState.sendPhaseTwo;
      state.sendPhaseThree = initialState.sendPhaseThree;
    },
    sendPhaseThreeReset: (state) => {
      state.sendPhaseThree = initialState.sendPhaseThree;
    },
    crossTransferReset: (state) => {
      state.crossTransfer = initialState.crossTransfer;
    },
    sendPhaseTwoStarted: (state) => {
      state.sendPhaseTwo = { ...state.sendPhaseTwo, inProgress: true };
    },
    setStateFromSnapshot: (state, action: PayloadAction<SendAndReceiveState>) => {
      state = action.payload;
      return state;
    },
    setInheritanceSigningRequestId: (state, action: PayloadAction<string>) => {
      state.inheritanceSigningRequestId = action.payload;
    },
  },
});

export const {
  setSendMaxFee,
  sendPhaseOneExecuted,
  customFeeCalculated,
  sendPhaseTwoExecuted,
  sendPhaseThreeExecuted,
  crossTransferExecuted,
  crossTransferFailed,
  crossTransferReset,
  sendPhasesReset,
  sendPhaseOneReset,
  customPrioritySendPhaseOneReset,
  sendPhaseTwoReset,
  sendPhaseThreeReset,
  updatePSBTEnvelops,
  sendPhaseTwoStarted,
  setStateFromSnapshot,
  setInheritanceSigningRequestId,
} = sendAndReceiveSlice.actions;
export default sendAndReceiveSlice.reducer;
