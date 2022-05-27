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
  appName: string;
  primaryMnemonic: string;
  primarySeed: string;
  walletShell: WalletShell;
  vaultShell?: VaultShell;
  details2FA?: TwoFADetails;
  nodeConnect?: NodeConnect;
  uai?: any;
  userTier: UserTier;
  version: string;
}
