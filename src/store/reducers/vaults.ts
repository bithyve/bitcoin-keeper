import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Signer, Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';

import _ from 'lodash';
import { reduxStorage } from 'src/storage';
import persistReducer from 'redux-persist/es/persistReducer';
import { ADD_NEW_VAULT, ADD_SIGINING_DEVICE } from '../sagaActions/vaults';

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
  signers: VaultSigner[];
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
  signer: Signer;
  key: string;
  value: any;
};

const initialState: VaultState = {
  signers: [],
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
    addSigningDevice: (state, action: PayloadAction<VaultSigner[]>) => {
      const newSigners = action.payload.filter((signer) => signer && signer.xfp);
      if (newSigners.length === 0) {
        return state;
      }
      let updatedSigners = [...state.signers];
      updatedSigners.push(...newSigners);
      updatedSigners = _.uniqBy(updatedSigners, 'xfp');
      return { ...state, signers: updatedSigners };
    },
    removeSigningDevice: (state, action: PayloadAction<VaultSigner>) => {
      const signerToRemove = action.payload && action.payload.xpub ? action.payload : null;
      if (signerToRemove) {
        state.signers = state.signers.filter((signer) => signer.xpub !== signerToRemove.xpub);
      }
    },
    clearSigningDevice: (state) => {
      state.signers = [];
    },
    updateSigningDevice: (state, action: PayloadAction<SignerUpdatePayload>) => {
      const { signer, key, value } = action.payload;
      signer[key] = value;
      // state.signers = state.signers.map((item) => {
      //   if (item && item.signerId === signer.signerId) {
      //     item[key] = value;
      //     return item;
      //   }
      //   return item;
      // });
    },
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
    builder.addCase(ADD_SIGINING_DEVICE, (state) => {
      state.isGeneratingNewVault = true;
    });
    builder.addCase(ADD_NEW_VAULT, (state) => {
      state.isGeneratingNewVault = false;
    });
  },
});

export const {
  addSigningDevice,
  vaultCreated,
  initiateVaultMigration,
  vaultMigrationCompleted,
  removeSigningDevice,
  setIntroModal,
  setSdIntroModal,
  setWhirlpoolIntro,
  updateSigningDevice,
  clearSigningDevice,
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
