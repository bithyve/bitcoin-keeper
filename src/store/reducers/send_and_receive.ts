import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AverageTxFeesByNetwork, ExchangeRates } from 'src/core/wallets/interfaces/interface';

const initialState: {
  exchangeRates: ExchangeRates;
  averageTxFees: AverageTxFeesByNetwork;
} = {
  exchangeRates: null,
  averageTxFees: null,
};

const sendAndReceiveSlice = createSlice({
  name: 'sendAndReceive',
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

export const { setExchangeRates, setAverageTxFee } = sendAndReceiveSlice.actions;
export default sendAndReceiveSlice.reducer;
