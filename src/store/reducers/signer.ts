import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import persistReducer from 'redux-persist/es/persistReducer';
import { KeyGenerationMode } from 'src/services/wallets/enums';
import { reduxStorage } from 'src/storage';

interface SignerState {
  lastUsedOptions: Record<string, KeyGenerationMode>;
  seeds: Record<string, string>;
}

const initialState: SignerState = {
  lastUsedOptions: {},
  seeds: {},
};

const signerSlice = createSlice({
  name: 'signer',
  initialState,
  reducers: {
    setLastUsedOption(
      state,
      action: PayloadAction<{ signerType: string; option: KeyGenerationMode }>
    ) {
      state.lastUsedOptions[action.payload.signerType] = action.payload.option;
    },
    setSeed: (state, action) => {
      const { masterFingerprint, seed } = action.payload;
      if (!state.seeds) {
        state.seeds = {};
      }
      state.seeds[masterFingerprint] = seed;
    },
  },
});

export const { setLastUsedOption, setSeed } = signerSlice.actions;

const signerPersistConfig = {
  key: 'signer',
  storage: reduxStorage,
  blacklist: [],
};

export default persistReducer(signerPersistConfig, signerSlice.reducer);
