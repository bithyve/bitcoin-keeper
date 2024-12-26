import { NetworkType } from 'src/services/wallets/enums';
import SubScription from './Subscription';
import { BackupType } from '../enums/BHR';

export interface AppBackup {
  method?: BackupType;
  password?: string;
  hint?: string;
}

export interface KeeperApp {
  id: string;
  publicId: string;
  appName?: string;
  primaryMnemonic: string;
  primarySeed: string;
  imageEncryptionKey: string;
  version: string;
  networkType: NetworkType;
  backup: AppBackup;
  subscription: SubScription;
  collabKeys?: { [key: string]: string }; // stores RSA-key for collab-sessions(currently persisted, can be cleaned up after every session if required)
  enableAnalytics: boolean;
}
