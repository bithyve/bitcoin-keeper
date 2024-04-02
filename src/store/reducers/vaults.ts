import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Vault } from 'src/services/wallets/interfaces/vault';

import _ from 'lodash';
import { reduxStorage } from 'src/storage';
import persistReducer from 'redux-persist/es/persistReducer';
import { ADD_NEW_VAULT } from '../sagaActions/vaults';

export interface VaultCreationPayload {
  hasNewVaultGenerationSucceeded: boolean;
  hasNewVaultGenerationFailed?: boolean;
  error?: string;
}

export interface VaultMigrationPayload {
  isMigratingNewVault: boolean;
  intrimVault: Vault;
}
export interface VaultMigrationCompletionPayload {
  isMigratingNewVault: boolean;
  hasMigrationSucceeded: boolean;
  hasMigrationFailed?: boolean;
  error?: string;
}

export type VaultState = {
  isGeneratingNewVault: boolean;
  hasNewVaultGenerationSucceeded: boolean;
  hasNewVaultGenerationFailed: boolean;
  isMigratingNewVault: boolean;
  hasMigrationSucceeded: boolean;
  hasMigrationFailed: boolean;
  intrimVault: Vault;
  error: string;
  introModal: boolean;
  sdIntroModal: boolean;
  whirlpoolIntro: boolean;
  tempShellId: string;
  backupBSMSForIKS: boolean;
};

export type SignerUpdatePayload = {
  key: string;
  value: any;
};

const initialState: VaultState = {
  isGeneratingNewVault: false,
  hasNewVaultGenerationSucceeded: false,
  hasNewVaultGenerationFailed: false,
  isMigratingNewVault: false,
  hasMigrationSucceeded: false,
  hasMigrationFailed: false,
  intrimVault: null,
  error: null,
  introModal: true,
  sdIntroModal: true,
  whirlpoolIntro: true,
  tempShellId: null,
  backupBSMSForIKS: false,
};

const vaultSlice = createSlice({
  name: 'vault',
  initialState,
  reducers: {
    vaultCreated: (state, action: PayloadAction<VaultCreationPayload>) => {
      const {
        hasNewVaultGenerationFailed = false,
        hasNewVaultGenerationSucceeded = true,
        error = null,
      } = action.payload;
      state.error = error;
      state.hasNewVaultGenerationFailed = hasNewVaultGenerationFailed;
      state.hasNewVaultGenerationSucceeded = hasNewVaultGenerationSucceeded;
    },
    initiateVaultMigration: (state, action: PayloadAction<VaultMigrationPayload>) => {
      const { isMigratingNewVault, intrimVault } = action.payload;
      state.isMigratingNewVault = isMigratingNewVault;
      state.intrimVault = intrimVault;
    },
    resetVaultMigration: (state) => {
      state.isMigratingNewVault = false;
      state.intrimVault = null;
      state.hasMigrationSucceeded = false;
      state.hasMigrationFailed = false;
      state.error = null;
    },
    setIntroModal: (state, action: PayloadAction<boolean>) => {
      state.introModal = action.payload;
    },
    setSdIntroModal: (state, action: PayloadAction<boolean>) => {
      state.sdIntroModal = action.payload;
    },
    setWhirlpoolIntro: (state, action: PayloadAction<boolean>) => {
      state.whirlpoolIntro = action.payload;
    },
    vaultMigrationCompleted: (state, action: PayloadAction<VaultMigrationCompletionPayload>) => {
      const { isMigratingNewVault, hasMigrationSucceeded, hasMigrationFailed, error } =
        action.payload;
      state.isMigratingNewVault = isMigratingNewVault;
      state.hasMigrationSucceeded = hasMigrationSucceeded;
      state.hasMigrationFailed = hasMigrationFailed;
      state.error = error;
      state.intrimVault = null;
    },
    resetVaultFlags: (state) => {
      state.isGeneratingNewVault = false;
      state.hasNewVaultGenerationSucceeded = false;
      state.hasNewVaultGenerationFailed = false;
      state.error = null;
    },
    setTempShellId: (state, action: PayloadAction<string>) => {
      state.tempShellId = action.payload;
    },
    setBackupBSMSForIKS: (state, action: PayloadAction<boolean>) => {
      state.backupBSMSForIKS = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(ADD_NEW_VAULT, (state) => {
      state.isGeneratingNewVault = false;
    });
  },
});

export const {
  vaultCreated,
  initiateVaultMigration,
  vaultMigrationCompleted,
  setIntroModal,
  setSdIntroModal,
  setWhirlpoolIntro,
  resetVaultMigration,
  setTempShellId,
  setBackupBSMSForIKS,
  resetVaultFlags,
} = vaultSlice.actions;

const vaultPersistConfig = {
  key: 'vault',
  storage: reduxStorage,
  blacklist: [
    'isMigratingNewVault',
    'intrimVault',
    'introModal',
    'sdIntroModal',
    'whirlpoolIntro',
    'tempShellId',
    'backupBSMSForIKS',
  ],
};

export default persistReducer(vaultPersistConfig, vaultSlice.reducer);
