import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { reduxStorage } from 'src/storage';
import { persistReducer } from 'redux-persist';
import { UAI } from 'src/models/interfaces/Uai';

const initialState: {
  refreshUai: boolean;
  uaiActionMap: { [key: string]: boolean };
} = {
  refreshUai: true,
  uaiActionMap: {},
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
  },
});

export const { setRefreshUai, createUaiMap, updateUaiActionMap } = uaiSlice.actions;

const uaiPersistConfig = {
  key: 'uai',
  storage: reduxStorage,
  blacklist: ['refreshUai', 'uaiActionMap'],
};

export default persistReducer(uaiPersistConfig, uaiSlice.reducer);
