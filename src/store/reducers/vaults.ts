import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Vault } from 'src/services/wallets/interfaces/vault';

import _ from 'lodash';
import { reduxStorage } from 'src/storage';
import persistReducer from 'redux-persist/es/persistReducer';
import { COLLABORATIVE_SCHEME } from 'src/screens/SigningDevices/SetupCollaborativeWallet';
import { ADD_NEW_VAULT } from '../sagaActions/vaults';

export interface VaultCreationPayload {
  hasNewVaultGenerationSucceeded: boolean;
  hasNewVaultGenerationFailed?: boolean;
  error?: string;
}

export interface VaultMigrationPayload {
  intrimVault: Vault;
}
export interface VaultMigrationCompletionPayload {
  hasMigrationSucceeded: boolean;
  hasMigrationFailed?: boolean;
  error?: string;
}

export interface RemoteLinkDetails {
  xfp: string;
  cachedTxid: string;
}

export type VaultState = {
  isGeneratingNewVault: boolean;
  hasNewVaultGenerationSucceeded: boolean;
  hasNewVaultGenerationFailed: boolean;
  hasMigrationSucceeded: boolean;
  hasMigrationFailed: boolean;
  intrimVault: Vault;
  error: string;
  introModal: boolean;
  sdIntroModal: boolean;
  remoteLinkDetails: RemoteLinkDetails;
  collaborativeSession: {
    signers: { [fingerprint: string]: { keyDescriptor: string; keyAES: string } };
    isComplete: boolean;
    lastSynced: number;
  };
};

export type SignerUpdatePayload = {
  key: string;
  value: any;
};

const initialState: VaultState = {
  isGeneratingNewVault: false,
  hasNewVaultGenerationSucceeded: false,
  hasNewVaultGenerationFailed: false,
  hasMigrationSucceeded: false,
  hasMigrationFailed: false,
  intrimVault: null,
  error: null,
  introModal: true,
  sdIntroModal: true,
  remoteLinkDetails: null,
  collaborativeSession: {
    signers: {},
    isComplete: false,
    lastSynced: null,
  },
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
      const { intrimVault } = action.payload;
      state.intrimVault = intrimVault;
    },
    resetVaultMigration: (state) => {
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
    vaultMigrationCompleted: (state, action: PayloadAction<VaultMigrationCompletionPayload>) => {
      const { hasMigrationSucceeded, hasMigrationFailed, error } = action.payload;
      state.hasMigrationSucceeded = hasMigrationSucceeded;
      state.hasMigrationFailed = hasMigrationFailed;
      state.error = error;
    },
    resetVaultFlags: (state) => {
      state.isGeneratingNewVault = false;
      state.hasNewVaultGenerationSucceeded = false;
      state.hasNewVaultGenerationFailed = false;
      state.error = null;
    },

    setRemoteLinkDetails: (state, action: PayloadAction<RemoteLinkDetails>) => {
      state.remoteLinkDetails = action.payload;
    },
    setCollaborativeSessionSigners: (
      state,
      action: PayloadAction<{
        [fingerprint: string]: { keyDescriptor: string; keyAES: string };
      }>
    ) => {
      state.collaborativeSession.signers = {
        ...state.collaborativeSession.signers,
        ...action.payload,
      };

      if (Object.keys(state.collaborativeSession.signers).length === COLLABORATIVE_SCHEME.n) {
        state.collaborativeSession.isComplete = true;
      }
    },
    updateCollaborativeSessionLastSynched: (state) => {
      state.collaborativeSession.lastSynced = Date.now();
    },
    resetCollaborativeSession: (state) => {
      state.collaborativeSession = initialState.collaborativeSession;
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
  resetVaultMigration,
  resetVaultFlags,
  setRemoteLinkDetails,
  setCollaborativeSessionSigners,
  updateCollaborativeSessionLastSynched,
  resetCollaborativeSession,
} = vaultSlice.actions;

const vaultPersistConfig = {
  key: 'vault',
  storage: reduxStorage,
  blacklist: ['intrimVault', 'introModal', 'sdIntroModal', 'setRemoteLinkDetails'],
};

export default persistReducer(vaultPersistConfig, vaultSlice.reducer);
