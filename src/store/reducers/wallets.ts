import {
  TESTCOINS_RECEIVED,
  WALLETS_SYNCHED,
  EXCHANGE_RATE_CALCULATED,
  SECONDARY_XPRIV_GENERATED,
  TWO_FA_RESETTED,
  AVERAGE_TX_FEE,
  NEW_WALLET_ADD_FAILED,
  WALLET_SETTINGS_UPDATED,
  WALLET_SETTINGS_UPDATE_FAILED,
  TWO_FA_VALID,
  CLEAR_RECEIVE_ADDRESS,
  GENERATE_SECONDARY_XPRIV,
  RESET_TWO_FA,
  VALIDATE_TWO_FA,
  RESET_WALLET_UPDATE_FLAG,
  RESET_TWO_FA_LOADER,
  UPDATE_WALLETS,
  READ_TRANSACTION,
  WALLET_CHECKED,
  RECOMPUTE_NET_BALANCE,
  UPDATE_GIFT,
  GENERATE_GIFTS,
  SET_GIFTS,
  GIFT_ACCEPTED,
  GIFT_ADDED,
  GIFT_CREATION_STATUS,
  ADD_NEW_WALLETS,
  NEW_WALLET_ADDED,
} from '../actions/wallets';
import { Wallet, Wallets, Gift } from 'src/core/wallets/interfaces/interface';
import { WalletType } from 'src/core/wallets/interfaces/enum';

export type WalletsState = {
  walletsSynched: boolean;
  wallets: Wallets;
  netBalance: number;
  exchangeRates?: any;
  averageTxFees: any;
  twoFAHelpFlags: {
    xprivGenerated: boolean | null;
    twoFAValid: boolean | null;
    twoFAResetted: boolean | null;
  };
  gifts: {
    [id: string]: Gift;
  };
  exclusiveGiftCodes: {
    [exclusiveGiftCode: string]: boolean;
  };
  selectedGiftId: string;
  giftCreationStatus: boolean;
  acceptedGiftId: string;
  addedGift: string;
  isGeneratingNewWallet: boolean;
  hasNewWalletsGenerationSucceeded: boolean;
  hasNewWalletsGenerationFailed: boolean;

  isUpdatingWalletSettings: boolean;
  hasWalletSettingsUpdateSucceeded: boolean;
  haswalletSettingsUpdateFailed: boolean;

  isTransactionReassignmentInProgress: boolean;
  hasTransactionReassignmentSucceeded: boolean;
  hasTransactionReassignmentFailed: boolean;
  transactionReassignmentDestinationID: string | null;

  refreshed: boolean;
  testCoinsReceived: boolean;

  receiveAddress: string | null;
  hasReceiveAddressSucceeded: boolean | null;
  resetTwoFALoader: boolean;
};

const initialState: WalletsState = {
  walletsSynched: false,
  exchangeRates: null,

  averageTxFees: null,
  wallets: {},
  netBalance: 0,
  twoFAHelpFlags: {
    xprivGenerated: null,
    twoFAValid: null,
    twoFAResetted: null,
  },
  gifts: {},
  exclusiveGiftCodes: {},
  selectedGiftId: null,
  giftCreationStatus: null,
  acceptedGiftId: '',
  addedGift: '',
  isGeneratingNewWallet: false,
  hasNewWalletsGenerationSucceeded: false,
  hasNewWalletsGenerationFailed: false,

  isUpdatingWalletSettings: false,
  hasWalletSettingsUpdateSucceeded: false,
  haswalletSettingsUpdateFailed: false,

  isTransactionReassignmentInProgress: false,
  hasTransactionReassignmentSucceeded: false,
  hasTransactionReassignmentFailed: false,
  transactionReassignmentDestinationID: null,

  refreshed: false,
  testCoinsReceived: false,

  receiveAddress: null,
  hasReceiveAddressSucceeded: false,
  resetTwoFALoader: false,
};

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

    case NEW_WALLET_ADDED:
      return {
        ...state,
        isGeneratingNewWallet: false,
        hasNewWalletsGenerationSucceeded: true,
        wallets: {
          ...state.wallets,
          ...action.payload.wallets,
        },
      };

    case NEW_WALLET_ADD_FAILED:
      return {
        ...state,
        isGeneratingNewWallet: false,
        hasNewWalletsGenerationSucceeded: false,
        hasNewWalletsGenerationFailed: true,
      };

    case UPDATE_WALLETS:
      return {
        ...state,
        wallets: {
          ...state.wallets,
          ...action.payload.wallets,
        },
      };

    case READ_TRANSACTION: {
      const { wallets } = action.payload;
      return {
        ...state,
        wallets: wallets,
      };
    }

    case WALLET_CHECKED: {
      const { wallets } = action.payload;
      return {
        ...state,
        wallets: wallets,
      };
    }

    case RECOMPUTE_NET_BALANCE:
      let netBalance = 0;
      Object.values(state.wallets).forEach((wallets: Wallet) => {
        if (wallets.type !== WalletType.TEST) {
          const balances = wallets.specs.balances;
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

    case CLEAR_RECEIVE_ADDRESS:
      return {
        ...state,
        receiveAddress: null,
        hasReceiveAddressSucceeded: null,
      };

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

    case GENERATE_GIFTS:
      return {
        ...state,
        selectedGiftId: null,
        giftCreationStatus: null,
      };

    case GIFT_CREATION_STATUS:
      return {
        ...state,
        giftCreationStatus: action.payload.flag,
      };

    case UPDATE_GIFT:
      const gift: Gift = action.payload.gift;
      const exclusiveGiftCodes = state.exclusiveGiftCodes
        ? {
            ...state.exclusiveGiftCodes,
          }
        : {};
      if (gift.exclusiveGiftCode) exclusiveGiftCodes[gift.exclusiveGiftCode] = true;

      return {
        ...state,
        gifts: {
          ...state.gifts,
          [gift.id]: gift,
        },
        exclusiveGiftCodes,
        selectedGiftId: gift.id,
      };

    case GIFT_ACCEPTED:
      return {
        ...state,
        acceptedGiftId: action.payload,
      };

    case GIFT_ADDED:
      return {
        ...state,
        addedGift: action.payload,
      };

    case SET_GIFTS:
      return {
        ...state,
        gifts: action.payload.gifts,
      };

    default:
      return state;
  }
};
