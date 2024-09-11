import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { NewVaultInfo } from '../sagas/wallets';

// types and action creators: dispatched by components and sagas
export const ADD_NEW_VAULT = 'ADD_NEW_VAULT';
export const ADD_SIGINING_DEVICE = 'ADD_SIGINING_DEVICE';
export const DELETE_SIGINING_DEVICE = 'DELETE_SIGINING_DEVICE';
export const ARCHIVE_SIGINING_DEVICE = 'ARCHIVE_SIGINING_DEVICE';
export const MIGRATE_VAULT = 'MIGRATE_VAULT';
export const FINALISE_VAULT_MIGRATION = 'FINALISE_VAULT_MIGRATION';
export const DELETE_VAULT = 'DELETE_VAULT';
export const REINSTATE_VAULT = 'REINSTATE_VAULT';
export const REFILL_MOBILEKEY = 'REFILL_MOBILEKEY';
export const REFRESH_CANARY_VAULT = 'REFRESH_CANARY_VAULT';
export const MERGER_SIMILAR_KEYS = 'MERGER_SIMILAR_KEYS';

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

export const archiveSigningDevice = (signers: Signer[]) => ({
  type: ARCHIVE_SIGINING_DEVICE,
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

export const reinstateVault = (payload: string) => ({
  type: REINSTATE_VAULT,
  payload: { vaultId: payload },
});

export const refillMobileKey = (payload: VaultSigner) => ({
  type: REFILL_MOBILEKEY,
  payload: { vaultKey: payload },
});

export const refreshCanaryWallets = () => ({
  type: REFRESH_CANARY_VAULT,
});

export const mergeSimilarKeys = (signer: Signer) => ({
  type: MERGER_SIMILAR_KEYS,
  payload: { signer },
});
