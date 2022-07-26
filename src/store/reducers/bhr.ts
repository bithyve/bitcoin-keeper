import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BackupType } from 'src/common/data/enums/BHR';
import { reduxStorage } from 'src/storage';
import { persistReducer } from 'redux-persist';

const initialState: {
  backupMethod: BackupType | null;
  isBackupError: boolean;
  backupError: object;
  seedConfirmed: boolean;
} = {
  backupMethod: null,
  isBackupError: false,
  backupError: {},
  seedConfirmed: false,
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
    setBackupError: (state, action: PayloadAction<{ isError: boolean; error: object }>) => {
      state.backupError = action.payload.error;
      state.isBackupError = action.payload.isError;
    },
  },
});

export const { setBackupType, setSeedConfirmed, setBackupError } = bhrSlice.actions;

const bhrPersistConfig = {
  key: 'bhr',
  storage: reduxStorage,
  blacklist: ['isBackupError', 'backupError', 'seedConfirmed'],
};

export default persistReducer(bhrPersistConfig, bhrSlice.reducer);
