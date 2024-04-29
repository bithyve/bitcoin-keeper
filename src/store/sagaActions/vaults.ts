import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import { NewVaultInfo } from '../sagas/wallets';

// types and action creators: dispatched by components and sagas
export const ADD_NEW_VAULT = 'ADD_NEW_VAULT';
export const ADD_SIGINING_DEVICE = 'ADD_SIGINING_DEVICE';
export const DELETE_SIGINING_DEVICE = 'DELETE_SIGINING_DEVICE';
export const MIGRATE_VAULT = 'MIGRATE_VAULT';
export const FINALISE_VAULT_MIGRATION = 'FINALISE_VAULT_MIGRATION';
export const DELETE_VAULT = 'DELETE_VAULT';

export const addNewVault = (payload: {
  newVaultInfo: NewVaultInfo;
  payload?: Vault;
  isMigrated?: Boolean;
  oldVaultId?: String;
  isRecreation?: Boolean;
}) => ({
  type: ADD_NEW_VAULT,
  payload,
});

export const addSigningDevice = (signers: Signer[]) => ({
  type: ADD_SIGINING_DEVICE,
  payload: { signers },
});

export const deleteSigningDevice = (signers: Signer[]) => ({
  type: DELETE_SIGINING_DEVICE,
  payload: { signers },
});

export const migrateVault = (newVaultInfo: NewVaultInfo, vaultShellId: string) => ({
  type: MIGRATE_VAULT,
  payload: { newVaultData: newVaultInfo, vaultShellId },
});

export const finaliseVaultMigration = (payload: string) => ({
  type: FINALISE_VAULT_MIGRATION,
  payload: { vaultId: payload },
});

export const deleteVault = (payload: string) => ({
  type: DELETE_VAULT,
  payload: { vaultId: payload },
});
