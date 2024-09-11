import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SendAndReceiveState } from './send_and_receive';
import { SendConfirmationRouteParams } from 'src/screens/Send/SendConfirmation';

export interface cachedTxSnapshot {
  state: SendAndReceiveState; // state snapshot
  routeParams: SendConfirmationRouteParams; // cached route params(for confirmation screen)
  options?: any; // extra data for post transaction action
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
  },
});

export const { setTransactionSnapshot, dropTransactionSnapshot } = cachedTxSlice.actions;

export default cachedTxSlice.reducer;
