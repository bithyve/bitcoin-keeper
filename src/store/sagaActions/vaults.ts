import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';

import { VaultMigrationType } from 'src/core/wallets/enums';
import { newVaultInfo } from '../sagas/wallets';

// types and action creators: dispatched by components and sagas
export const ADD_NEW_VAULT = 'ADD_NEW_VAULT';
export const ADD_SIGINING_DEVICE = 'ADD_SIGINING_DEVICE';
export const MIGRATE_VAULT = 'MIGRATE_VAULT';
export const FINALISE_VAULT_MIGRATION = 'FINALISE_VAULT_MIGRATION';

export const addNewVault = (payload: { newVaultInfo: newVaultInfo; payload?: Vault }) => {
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

export const migrateVault = (newVaultInfo: newVaultInfo, migrationType: VaultMigrationType) => {
  return {
    type: MIGRATE_VAULT,
    payload: { newVaultData: newVaultInfo, migrationType },
  };
};

export const finaliseVaultMigration = (payload: string) => {
  return {
    type: FINALISE_VAULT_MIGRATION,
    payload: { vaultId: payload },
  };
};
