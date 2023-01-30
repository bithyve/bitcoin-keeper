import { SigningServerSetup } from 'src/core/wallets/interfaces';
import { NetworkType } from 'src/core/wallets/enums';
import SubScription from './Subscription';
import { BackupType } from '../../enums/BHR';

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
  signingServerSetup?: SigningServerSetup;
}
