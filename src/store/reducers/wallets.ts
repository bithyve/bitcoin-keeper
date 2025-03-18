import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import persistReducer from 'redux-persist/es/persistReducer';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { reduxStorage } from 'src/storage';
import { ADD_NEW_WALLETS } from '../sagaActions/wallets';

export type WalletsState = {
  walletsSynched: boolean;
  netBalance: number;

  isGeneratingNewWallet: boolean;
  hasNewWalletsGenerationSucceeded: boolean;
  hasNewWalletsGenerationFailed: boolean;

  isUpdatingWalletSettings: boolean;
  hasWalletSettingsUpdateSucceeded: boolean;

  testCoinsReceived: boolean;
  testCoinsFailed: boolean;

  introModal: boolean;
  cosignerModal: boolean;
  err: string;
  walletSyncing: {};
  signerPolicyError?: string;
};

const initialState: WalletsState = {
  walletsSynched: false,
  netBalance: 0,
  signerPolicyError: 'idle',
  isGeneratingNewWallet: false,
  hasNewWalletsGenerationSucceeded: false,
  hasNewWalletsGenerationFailed: false,

  isUpdatingWalletSettings: false,
  hasWalletSettingsUpdateSucceeded: false,

  testCoinsReceived: false,
  testCoinsFailed: false,

  introModal: true,
  cosignerModal: true,

  err: '',
  walletSyncing: {},
};

export type syncingPayload = {
  wallets: (Wallet | Vault)[];
  isSyncing: boolean;
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
    setTestCoinsReceived: (state, action: PayloadAction<boolean>) => {
      state.testCoinsReceived = action.payload;
    },
    setTestCoinsFailed: (state, action: PayloadAction<boolean>) => {
      state.testCoinsFailed = action.payload;
    },
    setIntroModal: (state, action: PayloadAction<boolean>) => {
      state.introModal = action.payload;
    },
    setCosginerModal: (state, action: PayloadAction<boolean>) => {
      state.cosignerModal = action.payload;
    },
    walletGenerationFailed: (state, action: PayloadAction<string>) => {
      state.hasNewWalletsGenerationFailed = true;
      state.isGeneratingNewWallet = false;
      state.err = action.payload;
    },
    newWalletCreated: (state) => {
      state.isGeneratingNewWallet = false;
      state.hasNewWalletsGenerationSucceeded = true;
      state.hasNewWalletsGenerationFailed = false;
      state.err = '';
    },
    resetWalletStateFlags: (state) => {
      state.isGeneratingNewWallet = false;
      state.hasNewWalletsGenerationSucceeded = false;
      state.hasNewWalletsGenerationFailed = false;
      state.err = '';
    },
    setSyncing: (state, action: PayloadAction<syncingPayload>) => {
      const { wallets, isSyncing } = action.payload;
      wallets.forEach((wallet) => {
        state.walletSyncing = { ...state.walletSyncing, [wallet.id]: isSyncing };
      });
    },
    resetSyncing: (state) => {
      state.walletSyncing = {};
    },
    setSignerPolicyError: (state, action: PayloadAction<string>) => {
      state.signerPolicyError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(ADD_NEW_WALLETS, (state) => {
      state.isGeneratingNewWallet = true;
      state.hasNewWalletsGenerationSucceeded = false;
      state.hasNewWalletsGenerationFailed = false;
      state.err = '';
    });
  },
});

export const {
  walletsSynched,
  setNetBalance,
  setTestCoinsReceived,
  setTestCoinsFailed,
  setIntroModal,
  setCosginerModal,
  walletGenerationFailed,
  newWalletCreated,
  resetWalletStateFlags,
  resetSyncing,
  setSyncing,
  setSignerPolicyError,
} = walletSlice.actions;

const walletPersistConfig = {
  key: 'wallet',
  storage: reduxStorage,
  blacklist: [
    'testCoinsReceived',
    'testCoinsFailed',
    'hasNewWalletsGenerationFailed',
    'hasNewWalletsGenerationSucceeded',
    'isGeneratingNewWallet',
    'walletSyncing',
    'setSignerPolicyError',
  ],
};
export default persistReducer(walletPersistConfig, walletSlice.reducer);
