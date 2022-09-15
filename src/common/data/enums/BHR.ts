import { SignerType } from 'src/core/wallets/enums';

export const enum BackupType {
  CLOUD = 'CLOUD',
  SEED = 'SEED',
}

export interface BackupHistory extends Array<BackupHistoryItem> {}

export interface BackupHistoryItem {
  title: string;
  date: number;
  confirmed: boolean;
  subtitle?: string;
}

export interface SigningDeviceRecovery {
  signerId: string;
  type: SignerType;
  xpub: string;
}

export const enum BackupAction {
  SEED_BACKUP_CREATED = 'SEED_BACKUP_CREATED',
  SEED_BACKUP_CONFIRMED = 'SEED_BACKUP_CONFIRMED',
  SEED_BACKUP_CONFIRMATION_SKIPPED = 'SEED_BACKUP_CONFIRMATION_SKIPPED',
  CLOUD_BACKUP_CREATED = 'CLOUD_BACKUP_CREATED',
  CLOUD_BACKUP_FAILED = 'CLOUD_BACKUP_FAILED',
  CLOUD_BACKUP_CONFIRMATION_SKIPPED = 'CLOUD_BACKUP_CONFIRMATION_SKIPPED',
  CLOUD_BACKUP_CONFIRMATION_FAILED = 'CLOUD_BACKUP_CONFIRMATION_FAILED',
  CLOUD_BACKUP_CONFIRMED = 'CLOUD_BACKUP_CONFIRMED',
}
