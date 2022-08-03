import { NodeConnect, TwoFADetails } from 'src/core/wallets/interfaces';
import { AppTierLevel } from '../../enums/AppTierLevel';
import { BackupType } from '../../enums/BHR';

export interface UserTier {
  level: AppTierLevel;
}

export interface KeeperApp {
  id: string;
  appName?: string;
  primaryMnemonic: string;
  primarySeed: string;
  imageEncryptionKey: string;
  walletShellInstances: {
    shells: string[];
    activeShell: string;
  };
  vaultShellInstances: {
    shells: string[];
    activeShell?: string;
  };
  twoFADetails?: TwoFADetails;
  nodeConnect?: NodeConnect;
  uai?: any;
  userTier: UserTier;
  version: string;
  agsp?: string;
  backupMethod?: BackupType;
  backupPasswordHint?: string;
  backupPassword?: string;
}
