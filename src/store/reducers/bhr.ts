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
} = {
  backupMethod: null,
  isBackupError: false,
  backupError: '',
  seedConfirmed: false,
  loading: false,
  cloudBackupCompleted: false,
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
    setCloudBackupCompleted: (state) => {
      state.cloudBackupCompleted = true;
      state.backupError = '';
      state.isBackupError = false;
      state.loading = false;
    },
  },
});

export const {
  setBackupType,
  setSeedConfirmed,
  setBackupError,
  setBackupLoading,
  setCloudBackupCompleted,
} = bhrSlice.actions;

const bhrPersistConfig = {
  key: 'bhr',
  storage: reduxStorage,
  blacklist: ['isBackupError', 'backupError', 'seedConfirmed', 'loading'],
};

export default persistReducer(bhrPersistConfig, bhrSlice.reducer);
