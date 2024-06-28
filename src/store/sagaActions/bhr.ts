import { BackupHistory } from 'src/models/enums/BHR';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';

export const UPDATE_APP_IMAGE = 'UPDATE_APP_IMAGE';
export const GET_APP_IMAGE = 'GET_APP_IMAGE';
export const SEED_BACKEDUP = 'SEED_BACKEDUP';
export const SEED_BACKEDUP_CONFIRMED = 'SEED_BACKEDUP_CONFIRMED';
export const RECOVER_BACKUP = 'RECOVER_BACKUP';
export const UPADTE_HEALTH_CHECK_SIGNER = 'UPADTE_HEALTH_CHECK_SIGNER';
export const SET_BACKUP_WARNING = 'SET_BACKUP_WARNING';
export const UPDATE_VAULT_IMAGE = 'UPDATE_VAULT_IMAGE';
export const BACKUP_BSMS_ON_CLOUD = 'BACKUP_BSMS_ON_CLOUD';
export const BSMS_CLOUD_HEALTH_CHECK = 'BSMS_CLOUD_HEALTH_CHECK';
export const DELETE_APP_IMAGE_ENTITY = 'DELETE_APP_IMAGE_ENTITY';
export const HEALTH_CHECK_STATUS_UPDATE = 'HEALTH_CHECK_STATUS_UPDATE';

export const updateAppImage = ({ wallets, signers }) => ({
  type: UPDATE_APP_IMAGE,
  payload: {
    wallets,
    signers,
  },
});

export const deleteAppImageEntity = ({
  walletIds,
  signerIds,
}: {
  walletIds?: string[];
  signerIds?: string[];
}) => ({
  type: DELETE_APP_IMAGE_ENTITY,
  payload: {
    walletIds,
    signerIds,
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

export const healthCheckSigner = (signers: Signer[]) => ({
  type: UPADTE_HEALTH_CHECK_SIGNER,
  payload: {
    signers,
  },
});

export const healthCheckStatusUpdate = (signerUpdates: { signerId: string; status: string }[]) => ({
  type: HEALTH_CHECK_STATUS_UPDATE,
  payload: {
    signerUpdates,
  },
});

export const backupBsmsOnCloud = (password?: string) => ({
  type: BACKUP_BSMS_ON_CLOUD,
  payload: {
    password,
  },
});

export const bsmsCloudHealthCheck = () => ({
  type: BSMS_CLOUD_HEALTH_CHECK,
});
