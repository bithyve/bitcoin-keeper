import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AverageTxFeesByNetwork, ExchangeRates } from 'src/services/wallets/interfaces';
import { HistoricalInisightData } from 'src/nativemodules/interface';

const initialState: {
  exchangeRates: ExchangeRates;
  averageTxFees: AverageTxFeesByNetwork;
  initialNodesSaved: Boolean;
  oneDayInsight: HistoricalInisightData[];
} = {
  exchangeRates: null,
  averageTxFees: null,
  initialNodesSaved: false,
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

    setInitialNodesSaved: (state, action: PayloadAction<Boolean>) => {
      state.initialNodesSaved = action.payload;
    },
    setOneDayInsight: (state, action: PayloadAction<HistoricalInisightData[]>) => {
      state.oneDayInsight = action.payload;
    },
  },
});

export const { setExchangeRates, setAverageTxFee, setInitialNodesSaved, setOneDayInsight } =
  networkSlice.actions;

export default networkSlice.reducer;
