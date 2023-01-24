import { SigningServerSetup } from 'src/core/wallets/interfaces';
import { NetworkType } from 'src/core/wallets/enums';
import SubScription from './Subscription';
import { BackupType } from '../../enums/BHR';

export interface KeeperApp {
  id: string;
  appID: string;
  appName?: string;
  primaryMnemonic: string;
  primarySeed: string;
  imageEncryptionKey: string;
  version: string;
  networkType: NetworkType;
  walletShellInstances: {
    shells: string[];
    activeShell: string;
  };
  vaultShellInstances: {
    shells: string[];
    activeShell?: string;
  };
  backup: {
    method?: BackupType;
    password?: string;
    hint?: string;
  };
  subscription: SubScription;
  signingServerSetup?: SigningServerSetup;
  uai?: any;
  notification?: any;
}
