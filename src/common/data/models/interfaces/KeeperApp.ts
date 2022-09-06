import { NodeConnect, TwoFADetails } from 'src/core/wallets/interfaces';
import { BackupType } from '../../enums/BHR';
import SubScription from './Subscription';

export interface KeeperApp {
  id: string;
  appID: string;
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
  version: string;
  agsp?: string;
  backupMethod?: BackupType;
  backupPasswordHint?: string;
  backupPassword?: string;
  subscription: SubScription;
}
