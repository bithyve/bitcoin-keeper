import { BackupHistory } from 'src/common/data/enums/BHR';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';

export const UPDATE_APP_IMAGE = 'UPDATE_APP_IMAGE';
export const GET_APP_IMAGE = 'GET_APP_IMAGE';
export const SEED_BACKEDUP = 'SEED_BACKEDUP';
export const SEED_BACKEDUP_CONFIRMED = 'SEED_BACKEDUP_CONFIRMED';
export const RECOVER_BACKUP = 'RECOVER_BACKUP';
export const UPADTE_HEALTH_CHECK_SIGNER = 'UPADTE_HEALTH_CHECK_SIGNER';
export const SET_BACKUP_WARNING = 'SET_BACKUP_WARNING';
export const UPDATE_VAULT_IMAGE = 'UPDATE_VAULT_IMAGE';

export const updateAppImage = (walletId?) => ({
  type: UPDATE_APP_IMAGE,
  payload: {
    walletId,
  },
});

export const updateVaultImage = (payload: {
  vault: Vault;
  archiveVaultId?: string;
  isUpdate?: boolean;
}) => ({
  type: UPDATE_VAULT_IMAGE,
  payload,
});

export const getAppImage = (primaryMnemonic: string) => ({
  type: GET_APP_IMAGE,
  payload: {
    primaryMnemonic,
  },
});

export const seedBackedUp = () => ({
  type: SEED_BACKEDUP,
});

export const setWarning = (history: BackupHistory = []) => ({
  type: SET_BACKUP_WARNING,
  payload: {
    history,
  },
});

export const seedBackedConfirmed = (confirmed: boolean) => ({
  type: SEED_BACKEDUP_CONFIRMED,
  payload: {
    confirmed,
  },
});

export const recoverBackup = (password: string, encData: string) => ({
  type: RECOVER_BACKUP,
  payload: {
    password,
    encData,
  },
});

// HealthChecks

export const healthCheckSigner = (signers: VaultSigner[]) => ({
  type: UPADTE_HEALTH_CHECK_SIGNER,
  payload: {
    signers,
  },
});
