import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import persistReducer from 'redux-persist/es/persistReducer';
import { KeyGenerationMode } from 'src/services/wallets/enums';
import { reduxStorage } from 'src/storage';

interface SignerState {
  lastUsedOptions: Record<string, KeyGenerationMode>;
}

const initialState: SignerState = {
  lastUsedOptions: {},
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
  },
});

export const { setLastUsedOption } = signerSlice.actions;

const vaultPersistConfig = {
  key: 'signer',
  storage: reduxStorage,
  blacklist: [],
};

export default persistReducer(vaultPersistConfig, signerSlice.reducer);
