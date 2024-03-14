import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AverageTxFeesByNetwork, ExchangeRates } from 'src/services/wallets/interfaces';

const initialState: {
  exchangeRates: ExchangeRates;
  averageTxFees: AverageTxFeesByNetwork;
  defaultNodesSaved: Boolean;
} = {
  exchangeRates: null,
  averageTxFees: null,
  defaultNodesSaved: false,
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

    setDefaultNodesSaved: (state, action: PayloadAction<Boolean>) => {
      state.defaultNodesSaved = action.payload;
    },
  },
});

export const { setExchangeRates, setAverageTxFee, setDefaultNodesSaved } = networkSlice.actions;

export default networkSlice.reducer;
