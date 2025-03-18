export const enum BackupType {
  SEED = 'SEED',
}

export interface BackupHistory extends Array<BackupHistoryItem> {}

export interface BackupHistoryItem {
  title: string;
  date: number;
  confirmed: boolean;
  subtitle?: string;
}

export const enum BackupAction {
  SEED_BACKUP_CREATED = 'SEED_BACKUP_CREATED',
  SEED_BACKUP_CONFIRMED = 'SEED_BACKUP_CONFIRMED',
  SEED_BACKUP_CONFIRMATION_SKIPPED = 'SEED_BACKUP_CONFIRMATION_SKIPPED',
}

export const enum CloudBackupAction {
  CLOUD_BACKUP_CREATED = 'CLOUD_BACKUP_CREATED',
  CLOUD_BACKUP_FAILED = 'CLOUD_BACKUP_FAILED',
  CLOUD_BACKUP_HEALTH = 'CLOUD_BACKUP_HEALTH',
  CLOUD_BACKUP_HEALTH_FAILED = 'CLOUD_BACKUP_HEALTH_FAILED',
}

export type homeToastMessageType = { message: string | null; isError: boolean };
