import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { reduxStorage } from 'src/storage';
import { persistReducer } from 'redux-persist';
import { UAI } from 'src/models/interfaces/Uai';

const initialState: {
  refreshUai: boolean;
  uaiActionMap: { [key: string]: boolean };
  canaryBalanceCache: { [key: string]: number };
} = {
  refreshUai: true,
  uaiActionMap: {},
  canaryBalanceCache: {},
};

const uaiSlice = createSlice({
  name: 'uai',
  initialState,
  reducers: {
    setRefreshUai: (state) => {
      state.refreshUai = !state.refreshUai;
    },
    createUaiMap: (state, action: PayloadAction<UAI[]>) => {
      const uaiActionMap = action.payload.reduce((acc, uai) => {
        acc[uai.id] = false;
        return acc;
      }, {});
      state.uaiActionMap = uaiActionMap;
    },
    updateUaiActionMap: (state, action: PayloadAction<string>) => {
      const uaiActionMap = { ...state.uaiActionMap, [action.payload]: true };
      state.uaiActionMap = uaiActionMap;
    },
    updateCanaryBalanceCache: (state, action) => {
      const canaryBalanceCache = {
        ...state.canaryBalanceCache,
        [action.payload.id]: action.payload.balance,
      };
      state.canaryBalanceCache = canaryBalanceCache;
    },
  },
});

export const { setRefreshUai, createUaiMap, updateUaiActionMap, updateCanaryBalanceCache } =
  uaiSlice.actions;

const uaiPersistConfig = {
  key: 'uai',
  storage: reduxStorage,
  blacklist: ['refreshUai', 'uaiActionMap'],
};

export default persistReducer(uaiPersistConfig, uaiSlice.reducer);
