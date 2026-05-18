import { createSlice } from '@reduxjs/toolkit';
import { reduxStorage } from 'src/storage';
import { persistReducer } from 'redux-persist';
import { UTXOInfo } from 'src/services/wallets/interfaces';

const initialState: {
  syncingUTXOs: boolean;
  apiError: any;
  spendability: { [walletId: string]: Record<string, UTXOInfo> };
} = {
  syncingUTXOs: false,
  apiError: null,
  spendability: {},
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
    setWalletSpendabilityMap: (
      state,
      action: { payload: { walletId: string; map: Record<string, UTXOInfo> } }
    ) => {
      state.spendability[action.payload.walletId] = action.payload.map;
    },
  },
});

export const { setSyncingUTXOs, setSyncingUTXOError, resetState, setWalletSpendabilityMap } =
  utxoSlice.actions;

const utxoPersistConfig = {
  key: 'utxos',
  storage: reduxStorage,
  blacklist: ['syncingUTXOs', 'apiError'],
};

export default persistReducer(utxoPersistConfig, utxoSlice.reducer);
