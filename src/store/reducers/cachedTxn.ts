import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SendAndReceiveState } from './send_and_receive';
import { SendConfirmationRouteParams } from 'src/screens/Send/SendConfirmation';

export interface cachedTxSnapshot {
  state: SendAndReceiveState; // state snapshot
  routeParams: SendConfirmationRouteParams; // cached route params(for confirmation screen)
  options?: any; // extra data for post transaction action
  potentialTxId?: string;
}

const initialState: {
  snapshots: {
    [cachedTxid: string]: cachedTxSnapshot;
  };
} = {
  snapshots: {},
};

const cachedTxSlice = createSlice({
  name: 'cachedTxn',
  initialState,
  reducers: {
    setTransactionSnapshot: (
      state,
      action: PayloadAction<{
        cachedTxid: string;
        snapshot: {
          state: SendAndReceiveState;
          routeParams: SendConfirmationRouteParams;
          options: any;
          potentialTxId?: string;
        };
      }>
    ) => {
      state.snapshots = {
        ...state.snapshots,
        [action.payload.cachedTxid]: action.payload.snapshot,
      };
    },
    dropTransactionSnapshot: (state, action: PayloadAction<{ cachedTxid: string }>) => {
      delete state.snapshots[action.payload.cachedTxid];
    },
    updateCachedPsbtEnvelope: (state, action) => {
      const { xfp, cachedTxid, signedSerializedPSBT } = action.payload;
      const snapshot = state.snapshots[cachedTxid];
      if (!snapshot) throw new Error('Invalid Transaction.');
      const updatedEnvelops = snapshot.state.sendPhaseTwo.serializedPSBTEnvelops.map((envelope) => {
        if (envelope.xfp == xfp) {
          return {
            ...envelope,
            isSigned: true,
            serializedPSBT: signedSerializedPSBT,
          };
        } else return envelope;
      });
      const updatedSnapShot = {
        ...snapshot,
        state: {
          ...snapshot.state,
          sendPhaseTwo: {
            ...snapshot.state.sendPhaseTwo,
            serializedPSBTEnvelops: updatedEnvelops,
          },
        },
      };
      state.snapshots = {
        ...state.snapshots,
        [cachedTxid]: updatedSnapShot,
      };
    },
  },
});

export const { setTransactionSnapshot, dropTransactionSnapshot, updateCachedPsbtEnvelope } =
  cachedTxSlice.actions;

export default cachedTxSlice.reducer;
