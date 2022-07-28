import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BackupType } from 'src/common/data/enums/BHR';
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
    'setAppImageRecoverd',
    'setAppRecreated',
  ],
};

export default persistReducer(bhrPersistConfig, bhrSlice.reducer);
