import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SendAndReceiveState } from './send_and_receive';
import { SendConfirmationRouteParams } from 'src/screens/Send/SendConfirmation';

const initialState: {
  snapshots: {
    [cachedTxid: string]: {
      state: SendAndReceiveState;
      routeParams: any;
    };
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
        snapshot: { state: SendAndReceiveState; routeParams: SendConfirmationRouteParams };
      }>
    ) => {
      state.snapshots = {
        ...state.snapshots,
        [action.payload.cachedTxid]: action.payload.snapshot,
      };
      console.log('Setting snapshot for: ', action.payload.cachedTxid);
      console.log({ snap: state.snapshots });
    },
    dropTransactionSnapshot: (state, action: PayloadAction<{ cachedTxid: string }>) => {
      delete state.snapshots[action.payload.cachedTxid];
    },
  },
});

export const { setTransactionSnapshot, dropTransactionSnapshot } = cachedTxSlice.actions;

export default cachedTxSlice.reducer;
