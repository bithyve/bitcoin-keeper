import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BackupType, SigningDeviceRecovery } from 'src/common/data/enums/BHR';
import { reduxStorage } from 'src/storage';
import { persistReducer } from 'redux-persist';

const initialState: {
  backupMethod: BackupType | null;
  isBackupError: boolean;
  backupError: string;
  seedConfirmed: boolean;
  loading: boolean;
  cloudBackupCompleted: boolean;
  cloudBackedConfirmed: boolean;
  appRecoveryLoading: boolean;
  appImageRecoverd: boolean;
  appRecreated: boolean;
  appImageError: boolean;
  appImagerecoveryRetry: boolean;
  cloudData: Array<any>;
  downloadingBackup: boolean;
  recoverBackupFailed: boolean;
  invalidPassword: boolean;
  backupWarning: boolean;
  signingDevices: SigningDeviceRecovery[];
  vaultMetaData: Object;

  relayWalletUpdateLoading: boolean;
  relayWalletUpdate: boolean;
  relayWalletError: boolean;
  realyWalletErrorMessage: string;

  relayVaultUpdateLoading: boolean;
  relayVaultUpdate: boolean;
  relayVaultError: boolean;
  realyVaultErrorMessage: string;
} = {
  backupMethod: null,
  isBackupError: false,
  backupError: '',
  seedConfirmed: false,
  loading: false,
  cloudBackupCompleted: false,
  cloudBackedConfirmed: false,
  appRecoveryLoading: false,
  appImageRecoverd: false,
  appRecreated: false,
  appImageError: false,
  appImagerecoveryRetry: false,
  cloudData: [],
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
    setCloudBackupConfirmed: (state, action: PayloadAction<boolean>) => {
      state.cloudBackedConfirmed = action.payload;
      if (action.payload) {
        state.backupError = '';
        state.isBackupError = false;
        state.loading = false;
      }
    },
    setBackupLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setBackupError: (state, action: PayloadAction<{ isError: boolean; error: string }>) => {
      state.backupError = action.payload.error;
      state.isBackupError = action.payload.isError;
    },
    setCloudBackupCompleted: (state) => {
      state.cloudBackupCompleted = true;
      state.backupError = '';
      state.isBackupError = false;
      state.loading = false;
    },
    setAppImageRecoverd: (state, action: PayloadAction<boolean>) => {
      state.appImageRecoverd = action.payload;
    },
    setAppRecreated: (state, action: PayloadAction<boolean>) => {
      state.appRecreated = action.payload;
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
    setCloudData: (state, action: PayloadAction<Array<any>>) => {
      state.cloudData = action.payload;
      state.downloadingBackup = false;
    },
    setInvalidPassword: (state, action: PayloadAction<boolean>) => {
      state.invalidPassword = action.payload;
    },
    setBackupWarning: (state, action: PayloadAction<boolean>) => {
      state.backupWarning = action.payload;
    },
    setSigningDevices: (state, action: PayloadAction<any>) => {
      state.signingDevices = [...state.signingDevices, action.payload];
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
  },
});

export const {
  setBackupType,
  setSeedConfirmed,
  setBackupError,
  setBackupLoading,
  setCloudBackupCompleted,
  setCloudBackupConfirmed,
  setAppRecoveryLoading,
  setAppImageRecoverd,
  setAppRecreated,
  setAppImageError,
  appImagerecoveryRetry,
  setDownloadingBackup,
  setRecoverBackupFailed,
  setCloudData,
  setInvalidPassword,
  setBackupWarning,
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
} = bhrSlice.actions;

const bhrPersistConfig = {
  key: 'bhr',
  storage: reduxStorage,
  blacklist: [
    'isBackupError',
    'backupError',
    'seedConfirmed',
    'loading',
    'cloudBackupCompleted',
    'cloudBackedConfirmed',
    'appImageError',
    'appRecoveryLoading',
    'appRecreated',
    'appImageRecoverd',
    'appImagerecoveryRetry',
    'cloudData',
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
