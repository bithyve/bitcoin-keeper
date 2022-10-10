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
  introModal: boolean
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
  introModal: false
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
  setIntroModal
} = walletSlice.actions;

const walletPersistConfig = {
  key: 'wallet',
  storage: reduxStorage,
  blacklist: ['testCoinsReceived', 'testCoinsFailed'],
};
export default persistReducer(walletPersistConfig, walletSlice.reducer);

/*
export default (state: WalletsState = initialState, action): WalletsState => {
  switch (action.type) {
    case TESTCOINS_RECEIVED:
      return {
        ...state,
        testCoinsReceived: true,
      };

    case WALLETS_SYNCHED:
      return {
        ...state,
        walletsSynched: action.payload.synched,
      };

    case EXCHANGE_RATE_CALCULATED:
      return {
        ...state,
        exchangeRates: action.payload.exchangeRates,
      };

    case GENERATE_SECONDARY_XPRIV:
      return {
        ...state,
        twoFAHelpFlags: {
          ...state.twoFAHelpFlags,
          xprivGenerated: null,
        },
      };

    case SECONDARY_XPRIV_GENERATED:
      return {
        ...state,
        twoFAHelpFlags: {
          ...state.twoFAHelpFlags,
          xprivGenerated: action.payload.generated,
        },
      };

    case VALIDATE_TWO_FA:
      return {
        ...state,
        twoFAHelpFlags: {
          ...state.twoFAHelpFlags,
          twoFAValid: null,
        },
      };

    case TWO_FA_VALID:
      return {
        ...state,
        twoFAHelpFlags: {
          ...state.twoFAHelpFlags,
          twoFAValid: action.payload.isValid,
        },
      };

    case RESET_TWO_FA:
      return {
        ...state,
        twoFAHelpFlags: {
          ...state.twoFAHelpFlags,
          twoFAResetted: null,
        },
      };

    case TWO_FA_RESETTED:
      return {
        ...state,
        twoFAHelpFlags: {
          ...state.twoFAHelpFlags,
          twoFAResetted: action.payload.resetted,
          twoFAValid: false,
        },
      };

    case AVERAGE_TX_FEE:
      return {
        ...state,
        averageTxFees: action.payload.averageTxFees,
      };

    case ADD_NEW_WALLETS:
      return {
        ...state,
        isGeneratingNewWallet: true,
        hasNewWalletsGenerationSucceeded: false,
        hasNewWalletsGenerationFailed: false,
      };

    case NEW_WALLET_ADD_FAILED:
      return {
        ...state,
        isGeneratingNewWallet: false,
        hasNewWalletsGenerationSucceeded: false,
        hasNewWalletsGenerationFailed: true,
      };

    case RECOMPUTE_NET_BALANCE:
      let netBalance = 0;
      action.payload.wallets.forEach((wallet: Wallet ) => {
        if (wallet.type !== WalletType.TEST) {
          const balances = wallet.specs.balances;
          netBalance = netBalance + (balances.confirmed + balances.unconfirmed);
        }
      });
      return {
        ...state,
        netBalance,
      };

    case WALLET_SETTINGS_UPDATED:
      // TODO: Implement Logic for updating the list of wallets payloads
      return {
        ...state,
        isUpdatingWalletSettings: false,
        hasWalletSettingsUpdateSucceeded: true,
        haswalletSettingsUpdateFailed: false,
      };

    case WALLET_SETTINGS_UPDATE_FAILED:
      return {
        ...state,
        isUpdatingWalletSettings: false,
        hasWalletSettingsUpdateSucceeded: false,
        haswalletSettingsUpdateFailed: true,
      };

    // case Wallet_SHELLS_REFRESH_STARTED:
    //   const shellsRefreshing: WalletShell[] = action.payload;
    //   shellsRefreshing.forEach((refreshingShell) => {
    //     state.WalletShells.forEach((shell) => {
    //       if (shell.id == refreshingShell.id) shell.syncStatus = SyncStatus.IN_PROGRESS;
    //       else shell.syncStatus = SyncStatus.COMPLETED;
    //     });
    //   });
    //   return {
    //     ...state,
    //   };

    // case Wallet_SHELLS_REFRESH_COMPLETED:
    //   // Updating Wallet Sync State to shell data model
    //   // This will be used to display sync icon on Home Screen
    //   const shellsRefreshed: WalletShell[] = action.payload;
    //   shellsRefreshed.forEach((refreshedShell) => {
    //     state.WalletShells.find((shell) => shell.id == refreshedShell.id).syncStatus =
    //       SyncStatus.COMPLETED;
    //   });
    //   return {
    //     ...state,
    //   };

    // case CLEAR_WALLET_SYNC_CACHE:
    //   // This will clear the sync state at the start of each login session
    //   // This is required in order to ensure sync icon is shown again for each session
    //   state.WalletShells.map(
    //     ( shell ) => shell.syncStatus = SyncStatus.PENDING )
    //   return {
    //     ...state,
    //   }

    case RESET_WALLET_UPDATE_FLAG:
      return {
        ...state,
        isUpdatingWalletSettings: false,
        hasWalletSettingsUpdateSucceeded: false,
        haswalletSettingsUpdateFailed: false,
      };

    case RESET_TWO_FA_LOADER:
      return {
        ...state,
        resetTwoFALoader: action.payload.flag,
      };

    default:
      return state;
  }
};
*/
