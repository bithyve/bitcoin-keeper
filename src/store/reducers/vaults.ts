import { ADD_NEW_VAULT, ADD_SIGINING_DEVICE } from '../sagaActions/vaults';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import _ from 'lodash';

export type VaultState = {
  signers: VaultSigner[];
  isGeneratingNewVault: boolean;
  hasNewVaultGenerationSucceeded: boolean;
  hasNewVaultGenerationFailed: boolean;
};

const initialState: VaultState = {
  signers: [],
  isGeneratingNewVault: false,
  hasNewVaultGenerationSucceeded: false,
  hasNewVaultGenerationFailed: false,
};

const vaultSlice = createSlice({
  name: 'vault',
  initialState,
  reducers: {
    addSigningDevice: (state, action: PayloadAction<VaultSigner[]>) => {
      const newSigners = action.payload.filter((signer) => !!signer && !!signer.signerId);
      state.signers = _.uniqBy([...state.signers, ...newSigners], 'signerId');
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

export const { addSigningDevice } = vaultSlice.actions;

export default vaultSlice.reducer;
