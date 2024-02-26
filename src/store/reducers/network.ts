import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AverageTxFeesByNetwork, ExchangeRates, HistoricalInisightData } from 'src/core/wallets/interfaces/';

const initialState: {
  exchangeRates: ExchangeRates;
  averageTxFees: AverageTxFeesByNetwork;
  defaultNodesSaved: Boolean;
  oneDayInsight: HistoricalInisightData[];
} = {
  exchangeRates: null,
  averageTxFees: null,
  defaultNodesSaved: false,
  oneDayInsight: [],
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
    setOneDayInsight: (state, action: PayloadAction<HistoricalInisightData[]>) => {
      state.oneDayInsight = action.payload;
    },
  },
});

export const { setExchangeRates, setAverageTxFee, setDefaultNodesSaved, setOneDayInsight } =
  networkSlice.actions;

export default networkSlice.reducer;
