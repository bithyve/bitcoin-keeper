import { AccountVisibility } from 'src/core/accounts/interfaces/enum';
import { Account, Accounts, Gift } from 'src/core/accounts/interfaces/interface';
import { newAccountDetails, newAccountsInfo } from '../sagas/accounts';

// types and action creators: dispatched by components and sagas
export const SYNC_ACCOUNTS = 'SYNC_ACCOUNTS';
export const GET_TESTCOINS = 'GET_TESTCOINS';
export const ADD_TRANSFER_DETAILS = 'ADD_TRANSFER_DETAILS';
export const REMOVE_TRANSFER_DETAILS = 'REMOVE_TRANSFER_DETAILS';
export const CLEAR_TRANSFER = 'CLEAR_TRANSFER';
export const ACCUMULATIVE_BAL_AND_TX = 'ACCUMULATIVE_BAL_AND_TX';
export const FETCH_FEE_AND_EXCHANGE_RATES = 'FETCH_FEE_AND_EXCHANGE_RATES';
export const CLEAR_ACCOUNT_SYNC_CACHE = 'CLEAR_ACCOUNT_SYNC_CACHE';
export const AUTO_SYNC_ACCOUNTS = 'AUTO_SYNC_ACCOUNTS';
export const SYNC_VIA_XPUB_AGENT = 'SYNC_VIA_XPUB_AGENT';
export const GENERATE_SECONDARY_XPRIV = 'GENERATE_SECONDARY_XPRIV';
export const RESET_TWO_FA = 'RESET_TWO_FA';
export const RUN_TEST = 'RUN_TEST';
export const FETCH_DERIVATIVE_ACC_BALANCE_TX = 'FETCH_DERIVATIVE_ACC_BALANCE_TX';
export const REMOVE_TWO_FA = 'REMOVE_TWO_FA';
export const VALIDATE_TWO_FA = 'VALIDATE_TWO_FA';
export const AVERAGE_TX_FEE = 'AVERAGE_TX_FEE';
export const SETUP_DONATION_ACCOUNT = 'SETUP_DONATION_ACCOUNT';
export const ADD_NEW_ACCOUNTS = 'ADD_NEW_ACCOUNTS';
export const IMPORT_NEW_ACCOUNT = 'IMPORT_NEW_ACCOUNT';
export const LOGIN_WITH_HEXA = 'LOGIN_WITH_HEXA';
export const UPDATE_ACCOUNT_SETTINGS = 'UPDATE_ACCOUNT_SETTINGS';
export const RECOMPUTE_NET_BALANCE = 'RECOMPUTE_NET_BALANCE';
export const REFRESH_ACCOUNTS = 'REFRESH_ACCOUNTS';
export const ACCOUNTS_REFRESH_STARTED = 'ACCOUNTS_REFRESH_STARTED';
export const ACCOUNTS_REFRESH_COMPLETED = 'ACCOUNTS_REFRESH_COMPLETED';
export const CLEAR_RECEIVE_ADDRESS = 'CLEAR_RECEIVE_ADDRESS';
export const READ_TRANSACTION = 'READ_TRANSACTION';
export const ACCOUNT_CHECKED = 'ACCOUNT_CHECKED';
export const SET_SHOW_ALL_ACCOUNT = 'SET_SHOW_ALL_ACCOUNT';
export const RESET_ACCOUNT_UPDATE_FLAG = 'RESET_ACCOUNT_UPDATE_FLAG';
export const RESET_TWO_FA_LOADER = 'RESET_TWO_FA_LOADER';

export const GENERATE_GIFTS = 'GENERATE_GIFTS';

export const syncAccounts = (
  accounts: Accounts,
  options: {
    hardRefresh?: boolean;
    blindRefresh?: boolean;
  } = {}
) => {
  return {
    type: SYNC_ACCOUNTS,
    payload: {
      accounts,
      options,
    },
  };
};

export const getTestcoins = (testAccount: Account) => {
  return {
    type: GET_TESTCOINS,
    payload: testAccount,
  };
};

export const addTransferDetails = (serviceType, recipientData) => {
  return {
    type: ADD_TRANSFER_DETAILS,
    payload: {
      serviceType,
      recipientData,
    },
  };
};

export const removeTransferDetails = (serviceType, recipientData) => {
  return {
    type: REMOVE_TRANSFER_DETAILS,
    payload: {
      serviceType,
      recipientData,
    },
  };
};

export const clearTransfer = (serviceType, stage?) => {
  return {
    type: CLEAR_TRANSFER,
    payload: {
      serviceType,
      stage,
    },
  };
};

export const accumulativeBalAndTx = () => {
  return {
    type: ACCUMULATIVE_BAL_AND_TX,
  };
};

// To reset shell account sync status of all shells
export const clearAccountSyncCache = () => {
  return {
    type: CLEAR_ACCOUNT_SYNC_CACHE,
  };
};

// This is called once per login to automatically sync balances and
// transactions of all shells
export const autoSyncAccounts = (syncAll?: boolean, hardRefresh?: boolean) => {
  return {
    type: AUTO_SYNC_ACCOUNTS,
    payload: {
      syncAll,
      hardRefresh,
    },
  };
};

export const syncViaXpubAgent = (serviceType, derivativeAccountType, accountNumber) => {
  return {
    type: SYNC_VIA_XPUB_AGENT,
    payload: {
      serviceType,
      derivativeAccountType,
      accountNumber,
    },
  };
};

export const validateTwoFA = (token: number) => {
  return {
    type: VALIDATE_TWO_FA,
    payload: {
      token,
    },
  };
};

export const fetchFeeAndExchangeRates = () => {
  return {
    type: FETCH_FEE_AND_EXCHANGE_RATES,
  };
};

export const generateSecondaryXpriv = (account: Account, secondaryMnemonic: string) => {
  return {
    type: GENERATE_SECONDARY_XPRIV,
    payload: {
      account,
      secondaryMnemonic,
    },
  };
};

export const resetTwoFA = (secondaryMnemonic) => {
  return {
    type: RESET_TWO_FA,
    payload: {
      secondaryMnemonic,
    },
  };
};

export const runTest = () => {
  return {
    type: RUN_TEST,
  };
};

export const fetchDerivativeAccBalTx = (
  serviceType: string,
  accountType: string,
  accountNumber?: number,
  hardRefresh?: boolean,
  blindRefresh?: boolean
) => {
  return {
    type: FETCH_DERIVATIVE_ACC_BALANCE_TX,
    payload: {
      serviceType,
      accountType,
      accountNumber,
      hardRefresh,
      blindRefresh,
    },
  };
};

export const setAverageTxFee = (averageTxFees) => {
  return {
    type: AVERAGE_TX_FEE,
    payload: {
      averageTxFees,
    },
  };
};

export const setupDonationAccount = (
  serviceType: string,
  donee: string,
  subject: string,
  description: string,
  configuration: {
    displayBalance: boolean;
  },
  disableAccount?: boolean
) => {
  return {
    type: SETUP_DONATION_ACCOUNT,
    payload: {
      serviceType,
      donee,
      subject,
      description,
      configuration,
      disableAccount,
    },
  };
};

export const recomputeNetBalance = () => {
  return {
    type: RECOMPUTE_NET_BALANCE,
  };
};

export const refreshAccounts = (
  accounts: Account[],
  options: { hardRefresh?: boolean; syncDonationAccount?: boolean }
) => {
  return {
    type: REFRESH_ACCOUNTS,
    payload: {
      accounts,
      options,
    },
  };
};

export const accountsRefreshStarted = (payload: Account[]) => {
  return {
    type: ACCOUNTS_REFRESH_STARTED,
    payload,
  };
};

export const accountsRefreshCompleted = (payload: Account[]) => {
  return {
    type: ACCOUNTS_REFRESH_COMPLETED,
    payload,
  };
};

export const addNewAccounts = (payload: newAccountsInfo[]) => {
  return {
    type: ADD_NEW_ACCOUNTS,
    payload,
  };
};

export const importNewAccount = (mnemonic: string, accountDetails?: newAccountDetails) => {
  return {
    type: IMPORT_NEW_ACCOUNT,
    payload: {
      mnemonic,
      accountDetails,
    },
  };
};

export const updateAccountSettings = (payload: {
  account: Account;
  settings: {
    accountName?: string;
    accountDescription?: string;
    visibility?: AccountVisibility;
  };
}) => {
  return {
    type: UPDATE_ACCOUNT_SETTINGS,
    payload,
  };
};

export const generateGifts = ({
  amounts,
  accountId,
  includeFee,
  exclusiveGifts,
  validity,
}: {
  amounts: number[];
  accountId?: string;
  includeFee?: boolean;
  exclusiveGifts?: boolean;
  validity?: number;
}) => {
  return {
    type: GENERATE_GIFTS,
    payload: {
      accountId,
      amounts,
      includeFee,
      exclusiveGifts,
      validity,
    },
  };
};

// types and action creators (saga): dispatched by saga workers
export const TESTCOINS_RECEIVED = 'TESTCOINS_RECEIVED';
export const TRANSACTIONS_FETCHED = 'TRANSACTIONS_FETCHED';
export const ACCOUNTS_SYNCHED = 'ACCOUNTS_SYNCHED';
export const EXCHANGE_RATE_CALCULATED = 'EXCHANGE_RATE_CALCULATED';
export const SECONDARY_XPRIV_GENERATED = 'SECONDARY_XPRIV_GENERATED';
export const TWO_FA_VALID = 'TWO_FA_VALID';
export const TWO_FA_RESETTED = 'TWO_FA_RESETTED';
export const SETTED_DONATION_ACC = 'SETTED_DONATION_ACC';
export const UPDATE_ACCOUNTS = 'UPDATE_ACCOUNTS';
export const UPDATE_ACCOUNT_SHELLS = 'UPDATE_ACCOUNT_SHELLS';
export const NEW_ACCOUNT_ADDED = 'NEW_ACCOUNT_ADDED';
export const NEW_ACCOUNT_ADD_FAILED = 'NEW_ACCOUNT_ADD_FAILED';
export const ACCOUNT_SETTINGS_UPDATED = 'ACCOUNT_SETTINGS_UPDATED';
export const ACCOUNT_SETTINGS_UPDATE_FAILED = 'ACCOUNT_SETTINGS_UPDATE_FAILED';
export const UPDATE_GIFT = 'UPDATE_GIFT';
export const GIFT_ACCEPTED = 'GIFT_ACCEPTED';
export const GIFT_ADDED = 'GIFT_ADDED';
export const SET_GIFTS = 'SET_GIFTS';
export const GIFT_CREATION_STATUS = 'GIFT_CREATION_STATUS';

export const testcoinsReceived = () => {
  return {
    type: TESTCOINS_RECEIVED,
  };
};

export const transactionsFetched = (serviceType, transactions) => {
  return {
    type: TRANSACTIONS_FETCHED,
    payload: {
      serviceType,
      transactions,
    },
  };
};

export const accountsSynched = (synched) => {
  return {
    type: ACCOUNTS_SYNCHED,
    payload: {
      synched,
    },
  };
};

export const exchangeRatesCalculated = (exchangeRates) => {
  return {
    type: EXCHANGE_RATE_CALCULATED,
    payload: {
      exchangeRates,
    },
  };
};

export const secondaryXprivGenerated = (generated) => {
  return {
    type: SECONDARY_XPRIV_GENERATED,
    payload: {
      generated,
    },
  };
};

export const twoFAValid = (isValid: boolean) => {
  return {
    type: TWO_FA_VALID,
    payload: {
      isValid,
    },
  };
};

export const twoFAResetted = (resetted) => {
  return {
    type: TWO_FA_RESETTED,
    payload: {
      resetted,
    },
  };
};

export const newAccountsAdded = ({ accounts }: { accounts: Accounts }) => {
  return {
    type: NEW_ACCOUNT_ADDED,
    payload: {
      accounts,
    },
  };
};

export const updateAccounts = ({ accounts }: { accounts: Accounts }) => {
  return {
    type: UPDATE_ACCOUNTS,
    payload: {
      accounts,
    },
  };
};

export const accountSettingsUpdateFailed = ({ error }: { error: Error }) => {
  return {
    type: ACCOUNT_SETTINGS_UPDATE_FAILED,
    payload: {
      error,
    },
  };
};

export const accountSettingsUpdated = () => {
  return {
    type: ACCOUNT_SETTINGS_UPDATED,
  };
};

export const clearReceiveAddress = () => {
  return {
    type: CLEAR_RECEIVE_ADDRESS,
  };
};

export const setShowAllAccount = (showAllAccount) => {
  return {
    type: SET_SHOW_ALL_ACCOUNT,
    payload: {
      showAllAccount,
    },
  };
};

export const resetAccountUpdateFlag = () => {
  return {
    type: RESET_ACCOUNT_UPDATE_FLAG,
  };
};

export const setResetTwoFALoader = (flag) => {
  return {
    type: RESET_TWO_FA_LOADER,
    payload: {
      flag,
    },
  };
};

export const updateGift = (gift: Gift) => {
  return {
    type: UPDATE_GIFT,
    payload: {
      gift,
    },
  };
};
export const giftAccepted = (channelAddress) => {
  return {
    type: GIFT_ACCEPTED,
    payload: channelAddress,
  };
};
export const giftAddedToAccount = (channelAddress) => {
  return {
    type: GIFT_ADDED,
    payload: channelAddress,
  };
};

export const setGifts = (gifts: { [id: string]: Gift }) => {
  return {
    type: SET_GIFTS,
    payload: {
      gifts,
    },
  };
};

export const giftCreationSuccess = (flag) => {
  return {
    type: GIFT_CREATION_STATUS,
    payload: {
      flag,
    },
  };
};

export const loginWithHexa = (authToken, walletName) => {
  return {
    type: LOGIN_WITH_HEXA,
    payload: {
      authToken,
      walletName,
    },
  };
};
