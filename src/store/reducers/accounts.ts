import {
  TESTCOINS_RECEIVED,
  ACCOUNTS_SYNCHED,
  EXCHANGE_RATE_CALCULATED,
  SECONDARY_XPRIV_GENERATED,
  TWO_FA_RESETTED,
  AVERAGE_TX_FEE,
  NEW_ACCOUNT_ADD_FAILED,
  ACCOUNT_SETTINGS_UPDATED,
  ACCOUNT_SETTINGS_UPDATE_FAILED,
  TWO_FA_VALID,
  CLEAR_RECEIVE_ADDRESS,
  GENERATE_SECONDARY_XPRIV,
  RESET_TWO_FA,
  VALIDATE_TWO_FA,
  SET_SHOW_ALL_ACCOUNT,
  RESET_ACCOUNT_UPDATE_FLAG,
  RESET_TWO_FA_LOADER,
  UPDATE_ACCOUNT_SHELLS,
  UPDATE_ACCOUNTS,
  READ_TRANSACTION,
  ACCOUNT_CHECKED,
  RECOMPUTE_NET_BALANCE,
  UPDATE_GIFT,
  GENERATE_GIFTS,
  SET_GIFTS,
  GIFT_ACCEPTED,
  GIFT_ADDED,
  GIFT_CREATION_STATUS,
  ADD_NEW_ACCOUNTS,
  NEW_ACCOUNT_ADDED,
} from '../actions/accounts';
import { Account, Accounts, Gift } from 'src/core/accounts/interfaces/interface';
import { AccountType } from 'src/core/accounts/interfaces/enum';

export type AccountsState = {
  accountsSynched: boolean;
  accounts: Accounts;
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
  isGeneratingNewAccount: boolean;
  hasNewAccountsGenerationSucceeded: boolean;
  hasNewAccountsGenerationFailed: boolean;

  isUpdatingAccountSettings: boolean;
  hasAccountSettingsUpdateSucceeded: boolean;
  hasAccountSettingsUpdateFailed: boolean;

  isTransactionReassignmentInProgress: boolean;
  hasTransactionReassignmentSucceeded: boolean;
  hasTransactionReassignmentFailed: boolean;
  transactionReassignmentDestinationID: string | null;

  refreshed: boolean;
  testCoinsReceived: boolean;

  receiveAddress: string | null;
  hasReceiveAddressSucceeded: boolean | null;
  showAllAccount: boolean | null;
  resetTwoFALoader: boolean;
};

const initialState: AccountsState = {
  accountsSynched: false,
  exchangeRates: null,

  averageTxFees: null,
  accounts: {},
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
  isGeneratingNewAccount: false,
  hasNewAccountsGenerationSucceeded: false,
  hasNewAccountsGenerationFailed: false,

  isUpdatingAccountSettings: false,
  hasAccountSettingsUpdateSucceeded: false,
  hasAccountSettingsUpdateFailed: false,

  isTransactionReassignmentInProgress: false,
  hasTransactionReassignmentSucceeded: false,
  hasTransactionReassignmentFailed: false,
  transactionReassignmentDestinationID: null,

  refreshed: false,
  testCoinsReceived: false,

  receiveAddress: null,
  hasReceiveAddressSucceeded: false,
  showAllAccount: false,
  resetTwoFALoader: false,
};

export default (state: AccountsState = initialState, action): AccountsState => {
  switch (action.type) {
    case TESTCOINS_RECEIVED:
      return {
        ...state,
        testCoinsReceived: true,
      };

    case ACCOUNTS_SYNCHED:
      return {
        ...state,
        accountsSynched: action.payload.synched,
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

    case ADD_NEW_ACCOUNTS:
      return {
        ...state,
        isGeneratingNewAccount: true,
        hasNewAccountsGenerationSucceeded: false,
        hasNewAccountsGenerationFailed: false,
      };

    case NEW_ACCOUNT_ADDED:
      return {
        ...state,
        isGeneratingNewAccount: false,
        hasNewAccountsGenerationSucceeded: true,
        accounts: {
          ...state.accounts,
          ...action.payload.accounts,
        },
      };

    case NEW_ACCOUNT_ADD_FAILED:
      return {
        ...state,
        isGeneratingNewAccount: false,
        hasNewAccountsGenerationSucceeded: false,
        hasNewAccountsGenerationFailed: true,
      };

    case UPDATE_ACCOUNTS:
      return {
        ...state,
        accounts: {
          ...state.accounts,
          ...action.payload.accounts,
        },
      };

    case READ_TRANSACTION: {
      const { accounts } = action.payload;
      return {
        ...state,
        accounts: accounts,
      };
    }

    case ACCOUNT_CHECKED: {
      const { accounts } = action.payload;
      return {
        ...state,
        accounts: accounts,
      };
    }

    case RECOMPUTE_NET_BALANCE:
      let netBalance = 0;
      Object.values(state.accounts).forEach((account: Account) => {
        if (account.type !== AccountType.TEST_ACCOUNT) {
          const balances = account.specs.balances;
          netBalance = netBalance + (balances.confirmed + balances.unconfirmed);
        }
      });
      return {
        ...state,
        netBalance,
      };

    case ACCOUNT_SETTINGS_UPDATED:
      // TODO: Implement Logic for updating the list of account payloads
      return {
        ...state,
        isUpdatingAccountSettings: false,
        hasAccountSettingsUpdateSucceeded: true,
        hasAccountSettingsUpdateFailed: false,
      };

    case ACCOUNT_SETTINGS_UPDATE_FAILED:
      return {
        ...state,
        isUpdatingAccountSettings: false,
        hasAccountSettingsUpdateSucceeded: false,
        hasAccountSettingsUpdateFailed: true,
      };

    // case ACCOUNT_SHELLS_REFRESH_STARTED:
    //   const shellsRefreshing: AccountShell[] = action.payload;
    //   shellsRefreshing.forEach((refreshingShell) => {
    //     state.accountShells.forEach((shell) => {
    //       if (shell.id == refreshingShell.id) shell.syncStatus = SyncStatus.IN_PROGRESS;
    //       else shell.syncStatus = SyncStatus.COMPLETED;
    //     });
    //   });
    //   return {
    //     ...state,
    //   };

    // case ACCOUNT_SHELLS_REFRESH_COMPLETED:
    //   // Updating Account Sync State to shell data model
    //   // This will be used to display sync icon on Home Screen
    //   const shellsRefreshed: AccountShell[] = action.payload;
    //   shellsRefreshed.forEach((refreshedShell) => {
    //     state.accountShells.find((shell) => shell.id == refreshedShell.id).syncStatus =
    //       SyncStatus.COMPLETED;
    //   });
    //   return {
    //     ...state,
    //   };

    // case CLEAR_ACCOUNT_SYNC_CACHE:
    //   // This will clear the sync state at the start of each login session
    //   // This is required in order to ensure sync icon is shown again for each session
    //   state.accountShells.map(
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

    case SET_SHOW_ALL_ACCOUNT:
      return {
        ...state,
        showAllAccount: action.payload.showAllAccount,
      };

    case RESET_ACCOUNT_UPDATE_FLAG:
      return {
        ...state,
        isUpdatingAccountSettings: false,
        hasAccountSettingsUpdateSucceeded: false,
        hasAccountSettingsUpdateFailed: false,
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
