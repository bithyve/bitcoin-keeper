import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import persistReducer from 'redux-persist/es/persistReducer';
import { KeyGenerationMode } from 'src/services/wallets/enums';
import { reduxStorage } from 'src/storage';

interface SignerState {
  lastUsedOptions: Record<string, KeyGenerationMode>;
  showBackupModal: boolean;
}

const initialState: SignerState = {
  lastUsedOptions: {},
  showBackupModal: false,
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
    setShowBackupModal(state, action: PayloadAction<boolean>) {
      state.showBackupModal = action.payload;
    },
  },
});

export const { setLastUsedOption, setShowBackupModal } = signerSlice.actions;

const signerPersistConfig = {
  key: 'signer',
  storage: reduxStorage,
  blacklist: [],
};

export default persistReducer(signerPersistConfig, signerSlice.reducer);
