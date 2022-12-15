import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { VisibilityType } from 'src/core/wallets/enums';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { SignerException, SignerPolicy, SignerRestriction } from 'src/core/services/interfaces';
import { newWalletDetails, newWalletInfo } from '../sagas/wallets';

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
export const REGISTER_WITH_SIGNING_SERVER = 'REGISTER_WITH_SIGNING_SERVER';
export const UPDATE_SIGNER_POLICY = 'UPDATE_SIGNER_POLICY';
export const VALIDATE_SIGNING_SERVER_REGISTRATION = 'VALIDATE_SIGNING_SERVER_REGISTRATION';
export const SETUP_DONATION_WALLET = 'SETUP_DONATION_WALLET';
export const ADD_NEW_WALLETS = 'ADD_NEW_WALLETS';
export const IMPORT_NEW_WALLET = 'IMPORT_NEW_WALLET';
export const LOGIN_WITH_HEXA = 'LOGIN_WITH_HEXA';
export const UPDATE_WALLET_SETTINGS = 'UPDATE_WALLET_SETTINGS';
export const REFRESH_WALLETS = 'REFRESH_WALLETS';
export const CLEAR_RECEIVE_ADDRESS = 'CLEAR_RECEIVE_ADDRESS';
export const RESET_WALLET_UPDATE_FLAG = 'RESET_WALLET_UPDATE_FLAG';
export const RESET_TWO_FA_LOADER = 'RESET_TWO_FA_LOADER';
export const TEST_SATS_RECIEVE = 'TEST_SATS_RECIEVE';
export const UAI_VAULT_TO_WALLET = 'UAI_VAULT_TO_WALLET';
export const UPDATE_WALLET_DETAILS = 'UPDATE_WALLET_DETAILS';
export const UPDATE_SIGNER_DETAILS = 'UPDATE_SIGNER_DETAILS';

export const syncWallets = (
  wallets: (Wallet | Vault)[],
  options: {
    hardRefresh?: boolean;
    blindRefresh?: boolean;
  } = {}
) => ({
  type: SYNC_WALLETS,
  payload: {
    wallets,
    options,
  },
});

export const getTestcoins = (testWallet: Wallet) => ({
  type: GET_TESTCOINS,
  payload: testWallet,
});

export const addTransferDetails = (serviceType, recipientData) => ({
  type: ADD_TRANSFER_DETAILS,
  payload: {
    serviceType,
    recipientData,
  },
});

export const removeTransferDetails = (serviceType, recipientData) => ({
  type: REMOVE_TRANSFER_DETAILS,
  payload: {
    serviceType,
    recipientData,
  },
});

export const clearTransfer = (serviceType, stage?) => ({
  type: CLEAR_TRANSFER,
  payload: {
    serviceType,
    stage,
  },
});

export const accumulativeBalAndTx = () => ({
  type: ACCUMULATIVE_BAL_AND_TX,
});

// To reset shell wallet sync status of all shells
export const clearWalletSyncCache = () => ({
  type: CLEAR_WALLET_SYNC_CACHE,
});

// This is called once per login to automatically sync balances and
// transactions of all shells
export const autoSyncWallets = (syncAll?: boolean, hardRefresh?: boolean) => ({
  type: AUTO_SYNC_WALLETS,
  payload: {
    syncAll,
    hardRefresh,
  },
});

export const registerWithSigningServer = (policy: SignerPolicy) => ({
  type: REGISTER_WITH_SIGNING_SERVER,
  payload: {
    policy,
  },
});

export const validateSigningServerRegistration = (verificationToken) => ({
  type: VALIDATE_SIGNING_SERVER_REGISTRATION,
  payload: {
    verificationToken,
  },
});

export const updateSignerPolicy = (
  signer: VaultSigner,
  updates: {
    restrictions?: SignerRestriction;
    exceptions?: SignerException;
  }
) => ({
  type: UPDATE_SIGNER_POLICY,
  payload: {
    signer,
    updates,
  },
});

// export const generateSecondaryXpriv = (wallet, secondaryMnemonic: string) => {
//   return {
//     type: GENERATE_SECONDARY_XPRIV,
//     payload: {
//       wallet,
//       secondaryMnemonic,
//     },
//   };
// };

export const resetTwoFA = (secondaryMnemonic) => ({
  type: RESET_TWO_FA,
  payload: {
    secondaryMnemonic,
  },
});

export const runTest = () => ({
  type: RUN_TEST,
});

export const setupDonationWallet = (
  serviceType: string,
  donee: string,
  subject: string,
  description: string,
  configuration: {
    displayBalance: boolean;
  },
  disableWallet?: boolean
) => ({
  type: SETUP_DONATION_WALLET,
  payload: {
    serviceType,
    donee,
    subject,
    description,
    configuration,
    disableWallet,
  },
});

export const refreshWallets = (
  wallets: (Wallet | Vault)[],
  options: { hardRefresh?: boolean }
) => ({
  type: REFRESH_WALLETS,
  payload: {
    wallets,
    options,
  },
});

export const addNewWallets = (payload: newWalletInfo[]) => ({
  type: ADD_NEW_WALLETS,
  payload,
});

export const importNewWallet = (mnemonic: string, walletDetails?: newWalletDetails) => ({
  type: IMPORT_NEW_WALLET,
  payload: {
    mnemonic,
    walletDetails,
  },
});

export const updateWalletSettings = (payload: {
  wallet: Wallet;
  settings: {
    walletName?: string;
    walletDescription?: string;
    visibility?: VisibilityType;
  };
}) => ({
  type: UPDATE_WALLET_SETTINGS,
  payload,
});

// types and action creators (saga): dispatched by saga workers
export const TESTCOINS_RECEIVED = 'TESTCOINS_RECEIVED';
export const TRANSACTIONS_FETCHED = 'TRANSACTIONS_FETCHED';
export const WALLETS_SYNCHED = 'WALLETS_SYNCHED';
export const SECONDARY_XPRIV_GENERATED = 'SECONDARY_XPRIV_GENERATED';
export const TWO_FA_RESETTED = 'TWO_FA_RESETTED';
export const SETTED_DONATION_WALLET = 'SETTED_DONATION_WALLET';
export const NEW_WALLET_ADD_FAILED = 'NEW_WALLET_ADD_FAILED';
export const WALLET_SETTINGS_UPDATED = 'WALLET_SETTINGS_UPDATED';
export const WALLET_SETTINGS_UPDATE_FAILED = 'WALLET_SETTINGS_UPDATE_FAILED';

export const testcoinsReceived = () => ({
  type: TESTCOINS_RECEIVED,
});

export const transactionsFetched = (serviceType, transactions) => ({
  type: TRANSACTIONS_FETCHED,
  payload: {
    serviceType,
    transactions,
  },
});

export const walletsSynched = (synched) => ({
  type: WALLETS_SYNCHED,
  payload: {
    synched,
  },
});

export const secondaryXprivGenerated = (generated) => ({
  type: SECONDARY_XPRIV_GENERATED,
  payload: {
    generated,
  },
});

export const twoFAResetted = (resetted) => ({
  type: TWO_FA_RESETTED,
  payload: {
    resetted,
  },
});

export const walletSettingsUpdateFailed = ({ error }: { error: Error }) => ({
  type: WALLET_SETTINGS_UPDATE_FAILED,
  payload: {
    error,
  },
});

export const walletSettingsUpdated = () => ({
  type: WALLET_SETTINGS_UPDATED,
});

export const clearReceiveAddress = () => ({
  type: CLEAR_RECEIVE_ADDRESS,
});

export const resetWalletUpdateFlag = () => ({
  type: RESET_WALLET_UPDATE_FLAG,
});

export const setResetTwoFALoader = (flag) => ({
  type: RESET_TWO_FA_LOADER,
  payload: {
    flag,
  },
});

export const loginWithHexa = (authToken, walletName) => ({
  type: LOGIN_WITH_HEXA,
  payload: {
    authToken,
    walletName,
  },
});

export const testSatsRecieve = (wallet: Wallet) => ({
  type: TEST_SATS_RECIEVE,
  payload: {
    wallet,
  },
});

export const updateWalletDetails = (
  wallet: Wallet,
  details: {
    name: string;
    description: string;
  }
) => ({
  type: UPDATE_WALLET_DETAILS,
  payload: {
    wallet,
    details,
  },
});

export const updateSignerDetails = (signer: VaultSigner, key: string, value: any) => ({
  type: UPDATE_SIGNER_DETAILS,
  payload: {
    signer,
    key,
    value,
  },
});
