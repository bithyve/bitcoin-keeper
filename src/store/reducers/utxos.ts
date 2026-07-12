import { createSlice } from '@reduxjs/toolkit';
import { reduxStorage } from 'src/storage';
import { persistReducer } from 'redux-persist';

const initialState: {
  syncingUTXOs: boolean;
  apiError: any;
  pendingDustToast: string | null;
} = {
  syncingUTXOs: false,
  apiError: null,
  pendingDustToast: null,
};

const utxoSlice = createSlice({
  name: 'utxos',
  initialState,
  reducers: {
    setSyncingUTXOs: (state, action) => {
      state.syncingUTXOs = action.payload;
    },
    setSyncingUTXOError: (state, action) => {
      state.apiError = action.payload;
    },
    resetState: (state) => {
      state = initialState;
    },
    setPendingDustToast: (state, action: { payload: string }) => {
      state.pendingDustToast = action.payload;
    },
    clearDustToast: (state) => {
      state.pendingDustToast = null;
    },
  },
});

export const { setSyncingUTXOs, setSyncingUTXOError, resetState, setPendingDustToast, clearDustToast } = utxoSlice.actions;

const utxoPersistConfig = {
  key: 'utxos',
  storage: reduxStorage,
  blacklist: ['syncingUTXOs', 'apiError', 'pendingDustToast'],
};

export default persistReducer(utxoPersistConfig, utxoSlice.reducer);
