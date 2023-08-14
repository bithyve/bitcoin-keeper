import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import persistReducer from 'redux-persist/es/persistReducer';
import { Vault } from 'src/core/wallets/interfaces/vault';
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

  err: string;
  whirlpoolIntro: boolean;
  whirlpoolModal: boolean;

  whirlpoolWallets?: Wallet[];

  walletSyncing: {};
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

  err: '',
  whirlpoolIntro: true,
  whirlpoolModal: true,

  walletSyncing: {},
  walletPoolMap: {},
  whirlpoolWalletCreated: false,
};

export type WalletPoolPayload = {
  walletId: string;
  pool: PoolData;
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
    setSyncing: (state, action: PayloadAction<syncingPayload>) => {
      const { wallets, isSyncing } = action.payload;
      wallets.forEach((wallet) => {
        state.walletSyncing = { ...state.walletSyncing, [wallet.id]: isSyncing };
      });
    },
    resetSyncing: (state) => {
      state.walletSyncing = {};
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
  walletGenerationFailed,
  newWalletCreated,
  resetWalletStateFlags,
  setWhirlpoolIntro,
  setWhirlpoolModal,
  setWhirlpoolWallets,
  resetWhirlpoolWallets,
  resetSyncing,
  setSyncing,
  setWhirlpoolCreated,
  setWalletPoolMap,
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
    'whirlpoolWallets',
    'whirlpoolWalletCreated',
    'walletSyncing',
  ],
};
export default persistReducer(walletPersistConfig, walletSlice.reducer);
