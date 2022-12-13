import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AverageTxFeesByNetwork, ExchangeRates } from 'src/core/wallets/interfaces/';

const initialState: {
  exchangeRates: ExchangeRates;
  averageTxFees: AverageTxFeesByNetwork;
} = {
  exchangeRates: null,
  averageTxFees: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setExchangeRates: (state, action) => {
      state.exchangeRates = action.payload;
    },

    setAverageTxFee: (state, action: PayloadAction<AverageTxFeesByNetwork>) => {
      state.averageTxFees = action.payload;
    },
  },
});

export const { setExchangeRates, setAverageTxFee } = networkSlice.actions;

export default networkSlice.reducer;
