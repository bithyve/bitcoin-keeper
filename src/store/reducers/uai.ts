import { createSlice } from '@reduxjs/toolkit';
import { reduxStorage } from 'src/storage';
import { persistReducer } from 'redux-persist';

const initialState: {
  refreshUai: Boolean;
} = {
  refreshUai: true,
};

const uaiSlice = createSlice({
  name: 'uai',
  initialState,
  reducers: {
    setRefreshUai: (state) => {
      state.refreshUai = !state.refreshUai;
    },
  },
});

export const { setRefreshUai } = uaiSlice.actions;

const uaiPersistConfig = {
  key: 'uai',
  storage: reduxStorage,
  blacklist: ['refreshUai'],
};

export default persistReducer(uaiPersistConfig, uaiSlice.reducer);
