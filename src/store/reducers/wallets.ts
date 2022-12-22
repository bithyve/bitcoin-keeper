import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import persistReducer from 'redux-persist/es/persistReducer';
import { reduxStorage } from 'src/storage';
import { ADD_NEW_WALLETS } from '../sagaActions/wallets';

export type WalletsState = {
  walletsSynched: boolean;
  netBalance: number;
  signingServer: {
    verified: boolean | null;
    resetted: boolean | null;
  };

  isGeneratingNewWallet: boolean;
  hasNewWalletsGenerationSucceeded: boolean;
  hasNewWalletsGenerationFailed: boolean;

  isUpdatingWalletSettings: boolean;
  hasWalletSettingsUpdateSucceeded: boolean;
  haswalletSettingsUpdateFailed: boolean;

  testCoinsReceived: boolean;
  testCoinsFailed: boolean;

  resetTwoFALoader: boolean;
  introModal: boolean;
};

const initialState: WalletsState = {
  walletsSynched: false,
  netBalance: 0,
  signingServer: {
    verified: null,
    resetted: null,
  },
  isGeneratingNewWallet: false,
  hasNewWalletsGenerationSucceeded: false,
  hasNewWalletsGenerationFailed: false,

  isUpdatingWalletSettings: false,
  hasWalletSettingsUpdateSucceeded: false,
  haswalletSettingsUpdateFailed: false,

  testCoinsReceived: false,
  testCoinsFailed: false,

  resetTwoFALoader: false,
  introModal: true,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    walletsSynched: (state, action: PayloadAction<boolean>) => {
      state.walletsSynched = action.payload;
    },
    setNetBalance: (state, action: PayloadAction<number>) => {
      state.netBalance = action.payload;
    },
    signingServerRegistrationVerified: (state, action: PayloadAction<boolean>) => {
      state.signingServer.verified = action.payload;
    },
    setTestCoinsReceived: (state, action: PayloadAction<boolean>) => {
      state.testCoinsReceived = action.payload;
    },
    setTestCoinsFailed: (state, action: PayloadAction<boolean>) => {
      state.testCoinsFailed = action.payload;
    },
    setIntroModal: (state, action: PayloadAction<boolean>) => {
      state.introModal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(ADD_NEW_WALLETS, (state) => {
      state.isGeneratingNewWallet = true;
      state.hasNewWalletsGenerationSucceeded = false;
      state.hasNewWalletsGenerationFailed = false;
    });
  },
});

export const {
  walletsSynched,
  setNetBalance,
  signingServerRegistrationVerified,
  setTestCoinsReceived,
  setTestCoinsFailed,
  setIntroModal,
} = walletSlice.actions;

const walletPersistConfig = {
  key: 'wallet',
  storage: reduxStorage,
  blacklist: ['testCoinsReceived', 'testCoinsFailed'],
};
export default persistReducer(walletPersistConfig, walletSlice.reducer);
