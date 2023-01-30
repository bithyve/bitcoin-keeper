import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BackupType } from 'src/common/data/enums/BHR';
import _ from 'lodash';
import { reduxStorage } from 'src/storage';
import { persistReducer } from 'redux-persist';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';

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

  relayVaultUpdateLoading: boolean;
  relayVaultUpdate: boolean;
  relayVaultError: boolean;
  realyVaultErrorMessage: string;

  relayVaultReoveryAppId: string;
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
  relayWalletUpdateLoading: false,
  relayWalletUpdate: false,
  relayWalletError: false,
  realyWalletErrorMessage: null,
  relayVaultUpdateLoading: false,
  relayVaultUpdate: false,
  relayVaultError: false,
  realyVaultErrorMessage: null,
  relayVaultReoveryAppId: null,
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
          (signer) => signer.masterFingerprint !== signerToRemove.masterFingerprint
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
      state.relayWalletUpdateLoading = false;
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
    setRelayVaultRecoveryAppId: (state, action: PayloadAction<string>) => {
      state.relayVaultReoveryAppId = action.payload;
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

  setRelayVaultUpdateLoading,
  relayVaultUpdateSuccess,
  relayVaultUpdateFail,
  resetRealyVaultState,

  setRelayVaultRecoveryAppId,
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
  ],
};

export default persistReducer(bhrPersistConfig, bhrSlice.reducer);
