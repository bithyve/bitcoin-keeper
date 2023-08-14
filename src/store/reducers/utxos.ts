import { createSlice } from '@reduxjs/toolkit';
import { reduxStorage } from 'src/storage';
import { persistReducer } from 'redux-persist';

const initialState: {
  syncingUTXOs: boolean;
  apiError: any;
} = {
  syncingUTXOs: false,
  apiError: null,
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
  },
});

export const { setSyncingUTXOs, setSyncingUTXOError, resetState } = utxoSlice.actions;

const utxoPersistConfig = {
  key: 'utxos',
  storage: reduxStorage,
  blacklist: ['syncingUTXOs', 'apiError'],
};

export default persistReducer(utxoPersistConfig, utxoSlice.reducer);
