import { ADD_NEW_VAULT, ADD_SIGINING_DEVICE } from '../sagaActions/vaults';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';

import _ from 'lodash';

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
};

const vaultSlice = createSlice({
  name: 'vault',
  initialState,
  reducers: {
    addSigningDevice: (state, action: PayloadAction<VaultSigner[]>) => {
      const newSigners = action.payload.filter((signer) => !!signer && !!signer.signerId);
      state.signers = _.uniqBy([...state.signers, ...newSigners], 'signerId');
    },
    removeSigningDevice: (state, action: PayloadAction<VaultSigner>) => {
      const signerToRemove = action.payload && action.payload.signerId ? action.payload : null;
      if (signerToRemove) {
        state.signers = state.signers.filter(
          (signer) => signer.signerId !== signerToRemove.signerId
        );
      }
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
    updateIntrimVault: (state, action: PayloadAction<Vault>) => {
      state.intrimVault = action.payload;
    },
    setIntroModal: (state, action: PayloadAction<boolean>) => {
      state.introModal = action.payload;
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
  },
  extraReducers: (builder) => {
    builder.addCase(ADD_SIGINING_DEVICE, (state) => {
      state.isGeneratingNewVault = true;
    });
    builder.addCase(ADD_NEW_VAULT, (state) => {
      state.isGeneratingNewVault = false;
      state.signers = [];
    });
  },
});

export const {
  addSigningDevice,
  vaultCreated,
  initiateVaultMigration,
  vaultMigrationCompleted,
  removeSigningDevice,
  updateIntrimVault,
  setIntroModal
} = vaultSlice.actions;

export default vaultSlice.reducer;
