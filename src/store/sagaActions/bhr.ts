import { BackupHistory } from 'src/common/data/enums/BHR';

export const UPDATE_APP_IMAGE = 'UPDATE_APP_IMAGE';
export const GET_APP_IMAGE = 'GET_APP_IMAGE';
export const SEED_BACKEDUP = 'SEED_BACKEDUP';
export const SEED_BACKEDUP_CONFIRMED = 'SEED_BACKEDUP_CONFIRMED';
export const INIT_CLOUD_BACKUP = 'INIT_CLOUD_BACKUP';
export const CLOUD_BACKUP_SKIPPED = 'CLOUD_BACKUP_SKIPPED';
export const CONFIRM_CLOUD_BACKUP = 'CONFIRM_CLOUD_BACKUP';
export const GET_CLOUD_DATA = 'GET_CLOUD_DATA';
export const RECOVER_BACKUP = 'RECOVER_BACKUP';
export const UPADTE_HEALTH_CHECK_SIGNER = 'UPADTE_HEALTH_CHECK_SIGNER';
export const SET_BACKUP_WARNING = 'SET_BACKUP_WARNING';
export const UPDATE_VAULT_IMAGE = 'UPDATE_VAULT_IMAGE';
export const RECOVER_VAULT = 'RECOVER_VAULT';

export const updateAppImage = (walletId?) => ({
    type: UPDATE_APP_IMAGE,
    payload: {
      walletId,
    },
  });

export const updatVaultImage = () => ({
    type: UPDATE_VAULT_IMAGE,
  });

export const getAppImage = (primaryMnemonic: string) => ({
    type: GET_APP_IMAGE,
    payload: {
      primaryMnemonic,
    },
  });

export const reoverVault = () => ({
    type: RECOVER_VAULT,
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

export const cloudBackupSkipped = () => ({
    type: CLOUD_BACKUP_SKIPPED,
  });

export const confirmCloudBackup = (password: boolean) => ({
    type: CONFIRM_CLOUD_BACKUP,
    payload: {
      password,
    },
  });

export const seedBackedConfirmed = (confirmed: boolean) => ({
    type: SEED_BACKEDUP_CONFIRMED,
    payload: {
      confirmed,
    },
  });

export const initCloudBackup = (password: string, hint?: string) => ({
    type: INIT_CLOUD_BACKUP,
    payload: {
      password,
      hint,
    },
  });

export const getCloudData = () => ({
    type: GET_CLOUD_DATA,
  });

export const recoverBackup = (password: string, encData: string) => ({
    type: RECOVER_BACKUP,
    payload: {
      password,
      encData,
    },
  });

// HealthChecks

export const healthCheckSigner = (vaultId: string, signerId: string) => ({
    type: UPADTE_HEALTH_CHECK_SIGNER,
    payload: {
      vaultId,
      signerId,
    },
  });
