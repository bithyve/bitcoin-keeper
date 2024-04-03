import { SignerType } from 'src/services/wallets/enums';

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
