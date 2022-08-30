import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { newVaultInfo } from '../sagas/wallets';

// types and action creators: dispatched by components and sagas
export const ADD_NEW_VAULT = 'ADD_NEW_VAULT';
export const ADD_SIGINING_DEVICE = 'ADD_SIGINING_DEVICE';

export const addNewVault = (payload: newVaultInfo) => {
  return {
    type: ADD_NEW_VAULT,
    payload,
  };
};

export const addSigningDevice = (payload: VaultSigner) => {
  return {
    type: ADD_SIGINING_DEVICE,
    payload,
  };
};
