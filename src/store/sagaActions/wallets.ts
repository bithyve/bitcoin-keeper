import { VisibilityType } from 'src/core/wallets/enums';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { newVaultInfo, newWalletDetails, newWalletInfo } from '../sagas/wallets';

// types and action creators: dispatched by components and sagas
export const SYNC_WALLETS = 'SYNC_WALLETS';
export const GET_TESTCOINS = 'GET_TESTCOINS';
export const ADD_TRANSFER_DETAILS = 'ADD_TRANSFER_DETAILS';
export const REMOVE_TRANSFER_DETAILS = 'REMOVE_TRANSFER_DETAILS';
export const CLEAR_TRANSFER = 'CLEAR_TRANSFER';
export const ACCUMULATIVE_BAL_AND_TX = 'ACCUMULATIVE_BAL_AND_TX';
export const CLEAR_WALLET_SYNC_CACHE = 'CLEAR_WALLET_SYNC_CACHE';
export const AUTO_SYNC_WALLETS = 'AUTO_SYNC_WALLETS';
export const GENERATE_SECONDARY_XPRIV = 'GENERATE_SECONDARY_XPRIV';
export const RESET_TWO_FA = 'RESET_TWO_FA';
export const RUN_TEST = 'RUN_TEST';
export const REMOVE_TWO_FA = 'REMOVE_TWO_FA';
export const VALIDATE_TWO_FA = 'VALIDATE_TWO_FA';
export const SETUP_DONATION_WALLET = 'SETUP_DONATION_WALLET';
export const ADD_NEW_WALLETS = 'ADD_NEW_WALLETS';
export const ADD_NEW_VAULT = 'ADD_NEW_VAULT';
export const IMPORT_NEW_WALLET = 'IMPORT_NEW_WALLET';
export const LOGIN_WITH_HEXA = 'LOGIN_WITH_HEXA';
export const UPDATE_WALLET_SETTINGS = 'UPDATE_WALLET_SETTINGS';
export const REFRESH_WALLETS = 'REFRESH_WALLETS';
export const CLEAR_RECEIVE_ADDRESS = 'CLEAR_RECEIVE_ADDRESS';
export const RESET_WALLET_UPDATE_FLAG = 'RESET_WALLET_UPDATE_FLAG';
export const RESET_TWO_FA_LOADER = 'RESET_TWO_FA_LOADER';

export const syncWallets = (
  wallets: (Wallet | Vault)[],
  options: {
    hardRefresh?: boolean;
    blindRefresh?: boolean;
  } = {}
) => {
  return {
    type: SYNC_WALLETS,
    payload: {
      wallets,
      options,
    },
  };
};

export const getTestcoins = (testWallet: Wallet) => {
  return {
    type: GET_TESTCOINS,
    payload: testWallet,
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

// To reset shell wallet sync status of all shells
export const clearWalletSyncCache = () => {
  return {
    type: CLEAR_WALLET_SYNC_CACHE,
  };
};

// This is called once per login to automatically sync balances and
// transactions of all shells
export const autoSyncWallets = (syncAll?: boolean, hardRefresh?: boolean) => {
  return {
    type: AUTO_SYNC_WALLETS,
    payload: {
      syncAll,
      hardRefresh,
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

// export const generateSecondaryXpriv = (wallet, secondaryMnemonic: string) => {
//   return {
//     type: GENERATE_SECONDARY_XPRIV,
//     payload: {
//       wallet,
//       secondaryMnemonic,
//     },
//   };
// };

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

export const setupDonationWallet = (
  serviceType: string,
  donee: string,
  subject: string,
  description: string,
  configuration: {
    displayBalance: boolean;
  },
  disableWallet?: boolean
) => {
  return {
    type: SETUP_DONATION_WALLET,
    payload: {
      serviceType,
      donee,
      subject,
      description,
      configuration,
      disableWallet,
    },
  };
};

export const refreshWallets = (wallets: (Wallet | Vault)[], options: { hardRefresh?: boolean }) => {
  return {
    type: REFRESH_WALLETS,
    payload: {
      wallets,
      options,
    },
  };
};

export const addNewWallets = (payload: newWalletInfo[]) => {
  return {
    type: ADD_NEW_WALLETS,
    payload,
  };
};

export const addNewVault = (payload: newVaultInfo) => {
  return {
    type: ADD_NEW_VAULT,
    payload,
  };
};

export const importNewWallet = (mnemonic: string, walletDetails?: newWalletDetails) => {
  return {
    type: IMPORT_NEW_WALLET,
    payload: {
      mnemonic,
      walletDetails,
    },
  };
};

export const updateWalletSettings = (payload: {
  wallet: Wallet;
  settings: {
    walletName?: string;
    walletDescription?: string;
    visibility?: VisibilityType;
  };
}) => {
  return {
    type: UPDATE_WALLET_SETTINGS,
    payload,
  };
};

// types and action creators (saga): dispatched by saga workers
export const TESTCOINS_RECEIVED = 'TESTCOINS_RECEIVED';
export const TRANSACTIONS_FETCHED = 'TRANSACTIONS_FETCHED';
export const WALLETS_SYNCHED = 'WALLETS_SYNCHED';
export const SECONDARY_XPRIV_GENERATED = 'SECONDARY_XPRIV_GENERATED';
export const TWO_FA_VALID = 'TWO_FA_VALID';
export const TWO_FA_RESETTED = 'TWO_FA_RESETTED';
export const SETTED_DONATION_WALLET = 'SETTED_DONATION_WALLET';
export const NEW_WALLET_ADD_FAILED = 'NEW_WALLET_ADD_FAILED';
export const WALLET_SETTINGS_UPDATED = 'WALLET_SETTINGS_UPDATED';
export const WALLET_SETTINGS_UPDATE_FAILED = 'WALLET_SETTINGS_UPDATE_FAILED';

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

export const walletsSynched = (synched) => {
  return {
    type: WALLETS_SYNCHED,
    payload: {
      synched,
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

export const walletSettingsUpdateFailed = ({ error }: { error: Error }) => {
  return {
    type: WALLET_SETTINGS_UPDATE_FAILED,
    payload: {
      error,
    },
  };
};

export const walletSettingsUpdated = () => {
  return {
    type: WALLET_SETTINGS_UPDATED,
  };
};

export const clearReceiveAddress = () => {
  return {
    type: CLEAR_RECEIVE_ADDRESS,
  };
};

export const resetWalletUpdateFlag = () => {
  return {
    type: RESET_WALLET_UPDATE_FLAG,
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

export const loginWithHexa = (authToken, walletName) => {
  return {
    type: LOGIN_WITH_HEXA,
    payload: {
      authToken,
      walletName,
    },
  };
};
