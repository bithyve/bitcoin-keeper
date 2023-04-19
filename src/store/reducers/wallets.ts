import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import persistReducer from 'redux-persist/es/persistReducer';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { PoolData } from 'src/nativemodules/interface';
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
  haswalletSettingsUpdateFailed: boolean;

  testCoinsReceived: boolean;
  testCoinsFailed: boolean;

  resetTwoFALoader: boolean;
  introModal: boolean;
  whirlpoolIntro: boolean;
  whirlpoolModal: boolean;

  whirlpoolWallets?: Wallet[];

  syncing: boolean;
  whirlpoolWalletCreated: boolean;
  walletPoolMap: any;
};

const initialState: WalletsState = {
  walletsSynched: false,
  netBalance: 0,
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
  whirlpoolIntro: true,
  whirlpoolModal: true,

  syncing: false,
  walletPoolMap: {},
  whirlpoolWalletCreated: false,
};

export type WalletPoolPayload = {
  walletId: string;
  pool: PoolData;
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
    setWhirlpoolIntro: (state, action: PayloadAction<boolean>) => {
      state.whirlpoolIntro = action.payload;
    },
    setWhirlpoolModal: (state, action: PayloadAction<boolean>) => {
      state.whirlpoolModal = action.payload;
    },
    setWhirlpoolWallets: (state, action: PayloadAction<Wallet[]>) => {
      state.whirlpoolWallets = action.payload;
    },

    resetWhirlpoolWallets: (state) => {
      state.whirlpoolWallets = null;
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.syncing = action.payload;
    },
    setWhirlpoolCreated: (state, action: PayloadAction<boolean>) => {
      state.whirlpoolWalletCreated = action.payload;
    },
    setWalletPoolMap: (state, action: PayloadAction<WalletPoolPayload>) => {
      const { walletId, pool } = action.payload;
      const prev = state.walletPoolMap;
      state.walletPoolMap = { ...prev, [walletId]: pool };
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
  setTestCoinsReceived,
  setTestCoinsFailed,
  setIntroModal,
  setWhirlpoolIntro,
  setWhirlpoolModal,
  setWhirlpoolWallets,
  resetWhirlpoolWallets,
  setSyncing,
  setWhirlpoolCreated,
  setWalletPoolMap,
} = walletSlice.actions;

const walletPersistConfig = {
  key: 'wallet',
  storage: reduxStorage,
  blacklist: ['testCoinsReceived', 'testCoinsFailed', 'whirlpoolWallets', 'whirlpoolWalletCreated'],
};
export default persistReducer(walletPersistConfig, walletSlice.reducer);
