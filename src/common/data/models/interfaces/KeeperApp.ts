import {
  NodeConnect,
  TwoFADetails,
  VaultShell,
  WalletShell,
} from 'src/core/wallets/interfaces/interface';
import { AppTierLevel } from '../../enums/AppTierLevel';

export interface UserTier {
  level: AppTierLevel;
}

export interface KeeperApp {
  id: string;
  appName?: string;
  primaryMnemonic: string;
  primarySeed: string;
  walletShellInstances: {
    shells: string[];
    activeShell: string;
  };
  vaultShellInstances?: {
    shells: string[];
    activeShell: string;
  };
  twoFADetails?: TwoFADetails;
  nodeConnect?: NodeConnect;
  uai?: any;
  userTier: UserTier;
  version: string;
}
