import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SendAndReceiveState } from './send_and_receive';

const initialState: {
  snapshots: {
    [cachedTxid: string]: SendAndReceiveState;
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
      action: PayloadAction<{ cachedTxid: string; snapshot: SendAndReceiveState }>
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
