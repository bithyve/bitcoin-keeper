import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CoinDetailsType = {
  btc: any;
  usdt: any;
};

const initialState: {
  coinDetails: CoinDetailsType;
} = {
  coinDetails: null,
};

const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    setCoinDetails: (state, action: PayloadAction<CoinDetailsType>) => {
      state.coinDetails = action.payload;
    },
  },
});

export const { setCoinDetails } = swapSlice.actions;

export default swapSlice.reducer;
