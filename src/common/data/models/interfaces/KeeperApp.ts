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
  appId: string;
  appName?: string;
  primaryMnemonic: string;
  primarySeed: string;
  walletShells?: {
    shells: string[];
    activeShell: string;
  };
  vaultShells?: {
    shells: string[];
    activeShell: string;
  };
  twoFADetails?: TwoFADetails;
  nodeConnect?: NodeConnect;
  uai?: any;
  userTier: UserTier;
  version: string;
}
