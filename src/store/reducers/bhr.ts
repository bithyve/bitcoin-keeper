import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BackupType } from 'src/models/enums/BHR';
import _ from 'lodash';
import { reduxStorage } from 'src/storage';
import { persistReducer } from 'redux-persist';
import { VaultSigner } from 'src/services/wallets/interfaces/vault';
import { seedWordItem } from 'src/screens/Recovery/constants';
import { getKeyUID } from 'src/utils/utilities';

const initialState: {
  backupMethod: BackupType | null;
  isBackupError: boolean;
  backupError: string;
  seedConfirmed: boolean;
  loading: boolean;
  appRecoveryLoading: boolean;
  appImageRecoverd: boolean;
  appImageError: boolean;
  appImagerecoveryRetry: boolean;
  downloadingBackup: boolean;
  recoverBackupFailed: boolean;
  invalidPassword: boolean;
  backupWarning: boolean;
  signingDevices: VaultSigner[];
  vaultMetaData: Object;

  relayWalletUpdateLoading: boolean;
  relayWalletUpdate: boolean;
  relayWalletError: boolean;
  realyWalletErrorMessage: string;

  relaySignersUpdateLoading: boolean;
  relaySignersUpdate: boolean;
  relaySignerUpdateError: boolean;
  realySignersUpdateErrorMessage: string;
  realySignersAdded: boolean;

  relayVaultUpdateLoading: boolean;
  relayVaultUpdate: boolean;
  relayVaultError: boolean;
  realyVaultErrorMessage: string;
  vaultRecoveryDetails: Object;
  relayVaultReoveryShellId: string;
  isCloudBsmsBackupRequired: boolean;
  lastBsmsBackup?: number;
  encPassword?: string;

  deletingKeyModalVisible: boolean;
  keyDeletedSuccessModalVisible: boolean;

  seedWords: Array<seedWordItem>;

  backupAllLoading: boolean;
  backupAllSuccess: boolean;
  backupAllFailure: boolean;

  pendingAllBackup: boolean;
} = {
  backupMethod: null,
  isBackupError: false,
  backupError: '',
  seedConfirmed: false,
  loading: false,

  appRecoveryLoading: false,
  appImageRecoverd: false,
  appImageError: false,

  appImagerecoveryRetry: false,
  downloadingBackup: false,
  recoverBackupFailed: false,
  invalidPassword: false,
  backupWarning: false,
  signingDevices: [],
  vaultMetaData: {},
  vaultRecoveryDetails: {},
  relayWalletUpdateLoading: false,
  relayWalletUpdate: false,
  relayWalletError: false,
  realyWalletErrorMessage: null,
  relayVaultUpdateLoading: false,
  relayVaultUpdate: false,
  relayVaultError: false,
  realyVaultErrorMessage: null,
  relayVaultReoveryShellId: null,
  relaySignersUpdateLoading: false,
  relaySignersUpdate: false,
  relaySignerUpdateError: false,
  realySignersUpdateErrorMessage: null,
  isCloudBsmsBackupRequired: false,
  lastBsmsBackup: null,
  encPassword: '',
  deletingKeyModalVisible: false,
  keyDeletedSuccessModalVisible: false,
  seedWords: [],

  backupAllLoading: false,
  backupAllFailure: false,
  backupAllSuccess: false,

  pendingAllBackup: false,
};

const bhrSlice = createSlice({
  name: 'bhr',
  initialState,
  reducers: {
    setBackupType: (state, action: PayloadAction<BackupType>) => {
      state.backupMethod = action.payload;
    },
    setSeedConfirmed: (state, action: PayloadAction<boolean>) => {
      state.seedConfirmed = action.payload;
    },
    setBackupLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setBackupError: (state, action: PayloadAction<{ isError: boolean; error: string }>) => {
      state.backupError = action.payload.error;
      state.isBackupError = action.payload.isError;
    },
    setVaultRecoveryDetails: (state, action: PayloadAction<Object>) => {
      state.vaultRecoveryDetails = action.payload;
    },
    setAppImageRecoverd: (state, action: PayloadAction<boolean>) => {
      state.appImageRecoverd = action.payload;
    },
    setAppRecoveryLoading: (state, action: PayloadAction<boolean>) => {
      state.appRecoveryLoading = action.payload;
    },
    setAppImageError: (state, action: PayloadAction<boolean>) => {
      state.appImageError = action.payload;
    },
    appImagerecoveryRetry: (state) => {
      state.appImagerecoveryRetry = !state.appImagerecoveryRetry;
    },
    setDownloadingBackup: (state, action: PayloadAction<boolean>) => {
      state.downloadingBackup = action.payload;
    },
    setRecoverBackupFailed: (state, action: PayloadAction<boolean>) => {
      state.recoverBackupFailed = action.payload;
    },
    setInvalidPassword: (state, action: PayloadAction<boolean>) => {
      state.invalidPassword = action.payload;
    },
    setBackupWarning: (state, action: PayloadAction<boolean>) => {
      state.backupWarning = action.payload;
    },
    setSigningDevices: (state, action: PayloadAction<any>) => {
      state.signingDevices = _.uniqBy([...state.signingDevices, action.payload], 'signerId');
    },
    removeSigningDeviceBhr: (state, action: PayloadAction<VaultSigner>) => {
      const signerToRemove = action.payload;
      if (signerToRemove) {
        state.signingDevices = state.signingDevices.filter(
          (signer) => getKeyUID(signer) !== getKeyUID(signerToRemove)
        );
      }
    },
    setVaultMetaData: (state, action: PayloadAction<any>) => {
      state.vaultMetaData = action.payload;
    },
    setRelayWalletUpdateLoading: (state, action: PayloadAction<boolean>) => {
      state.relayWalletUpdateLoading = action.payload;
    },
    relayWalletUpdateSuccess: (state) => {
      state.relayWalletUpdate = true;
      state.relayWalletError = false;
      state.relayWalletUpdateLoading = false;
      state.realyWalletErrorMessage = null;
    },
    relayWalletUpdateFail: (state, action: PayloadAction<string>) => {
      state.relayWalletError = true;
      state.realyWalletErrorMessage = action.payload;
      state.relayWalletUpdateLoading = false;
    },
    resetRealyWalletState: (state) => {
      state.relayWalletError = false;
      state.relayWalletUpdate = false;
      state.relayWalletUpdateLoading = false;
      state.realyWalletErrorMessage = null;
    },

    setRelaySignersUpdateLoading: (state, action: PayloadAction<boolean>) => {
      state.relaySignersUpdateLoading = action.payload;
    },

    // Action payload is whether a new signer has been added
    relaySignersUpdateSuccess: (state, action: PayloadAction<boolean>) => {
      state.relaySignersUpdate = true;
      state.relaySignerUpdateError = false;
      state.relaySignersUpdateLoading = false;
      state.realySignersUpdateErrorMessage = null;
      state.realySignersAdded = action.payload;
    },
    relaySignersUpdateFail: (state, action: PayloadAction<string>) => {
      state.relaySignerUpdateError = true;
      state.relaySignersUpdateLoading = false;
      state.realySignersUpdateErrorMessage = action.payload;
      state.realySignersAdded = false;
    },
    resetSignersUpdateState: (state) => {
      state.relaySignersUpdate = false;
      state.relaySignerUpdateError = false;
      state.relaySignersUpdateLoading = false;
      state.realySignersUpdateErrorMessage = null;
      state.realySignersAdded = false;
    },

    setRelayVaultUpdateLoading: (state, action: PayloadAction<boolean>) => {
      state.relayVaultUpdateLoading = action.payload;
    },
    relayVaultUpdateSuccess: (state) => {
      state.relayVaultUpdate = true;
      state.relayVaultUpdateLoading = false;
    },
    relayVaultUpdateFail: (state, action: PayloadAction<string>) => {
      state.relayVaultError = true;
      state.realyVaultErrorMessage = action.payload;
      state.relayVaultUpdateLoading = false;
    },
    resetRealyVaultState: (state) => {
      state.relayVaultError = false;
      state.relayVaultUpdate = false;
      state.relayVaultUpdateLoading = false;
      state.realyVaultErrorMessage = null;
    },
    setRelayVaultRecoveryShellId: (state, action: PayloadAction<string>) => {
      state.relayVaultReoveryShellId = action.payload;
    },
    setIsCloudBsmsBackupRequired: (state, action: PayloadAction<boolean>) => {
      state.isCloudBsmsBackupRequired = action.payload;
    },
    setLastBsmsBackup: (state, action: PayloadAction<number>) => {
      state.lastBsmsBackup = action.payload;
    },
    setEncPassword: (state, action: PayloadAction<string>) => {
      state.encPassword = action.payload;
    },
    showDeletingKeyModal: (state) => {
      state.deletingKeyModalVisible = true;
    },
    hideDeletingKeyModal: (state) => {
      state.deletingKeyModalVisible = false;
    },
    showKeyDeletedSuccessModal: (state) => {
      state.keyDeletedSuccessModalVisible = true;
    },
    hideKeyDeletedSuccessModal: (state) => {
      state.keyDeletedSuccessModalVisible = false;
    },
    setSeedWord: (state, action: PayloadAction<{ index: number; wordItem: seedWordItem }>) => {
      const { index, wordItem } = action.payload;
      if (state.seedWords[index]) {
        state.seedWords[index] = wordItem;
      } else {
        state.seedWords.push(wordItem);
      }
    },

    setSeedWords: (state, action: PayloadAction<seedWordItem[]>) => {
      state.seedWords = action.payload;
    },

    resetSeedWords: (state) => {
      state.seedWords = [];
    },
    setBackupAllLoading: (state, action: PayloadAction<boolean>) => {
      state.backupAllLoading = action.payload;
    },
    setBackupAllSuccess: (state, action: PayloadAction<boolean>) => {
      state.backupAllSuccess = action.payload;
      state.backupAllLoading = false;
    },
    setBackupAllFailure: (state, action: PayloadAction<boolean>) => {
      state.backupAllFailure = action.payload;
      state.backupAllLoading = false;
    },
    setPendingAllBackup: (state, action: PayloadAction<boolean>) => {
      state.pendingAllBackup = action.payload;
    },
  },
});

export const {
  setBackupType,
  setSeedConfirmed,
  setBackupError,
  setBackupLoading,
  setAppRecoveryLoading,
  setAppImageRecoverd,
  setAppImageError,
  appImagerecoveryRetry,
  setDownloadingBackup,
  setRecoverBackupFailed,
  setInvalidPassword,
  setBackupWarning,

  removeSigningDeviceBhr,
  setSigningDevices,
  setVaultMetaData,

  setRelayWalletUpdateLoading,
  relayWalletUpdateSuccess,
  relayWalletUpdateFail,
  resetRealyWalletState,

  setRelaySignersUpdateLoading,
  relaySignersUpdateSuccess,
  relaySignersUpdateFail,
  resetSignersUpdateState,

  setRelayVaultUpdateLoading,
  relayVaultUpdateSuccess,
  relayVaultUpdateFail,
  resetRealyVaultState,

  setRelayVaultRecoveryShellId,
  setVaultRecoveryDetails,
  setIsCloudBsmsBackupRequired,
  setLastBsmsBackup,
  setEncPassword,

  showDeletingKeyModal,
  hideDeletingKeyModal,
  showKeyDeletedSuccessModal,
  hideKeyDeletedSuccessModal,

  setSeedWord,
  resetSeedWords,

  setBackupAllLoading,
  setBackupAllSuccess,
  setBackupAllFailure,

  setPendingAllBackup,
} = bhrSlice.actions;

const bhrPersistConfig = {
  key: 'bhr',
  storage: reduxStorage,
  blacklist: [
    'isBackupError',
    'backupError',
    'seedConfirmed',
    'loading',
    'appImageError',
    'appRecoveryLoading',
    'appImageRecoverd',
    'appImagerecoveryRetry',
    'recoverBackupFailed',
    'invalidPassword',
    'backupWarning',

    'relayWalletUpdateLoading',
    'relayWalletUpdate',
    'relayWalletError',
    'realyWalletErrorMessage',

    'relayVaultUpdateLoading',
    'relayVaultUpdate',
    'relayVaultError',
    'realyVaultErrorMessage',

    'relaySignersUpdateLoading',
    'relaySignersUpdate',
    'relaySignerUpdateError',
    'realySignersUpdateErrorMessage',
    'cloudBsmsBackupError',

    'seedWords',

    'backupAllLoading',
    'backupAllFailure',
    'backupAllSuccess',
  ],
};

export default persistReducer(bhrPersistConfig, bhrSlice.reducer);
