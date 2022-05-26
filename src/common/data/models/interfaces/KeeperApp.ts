import { VaultShell, WalletShell } from 'src/core/wallets/interfaces/interface';
import { AppTierLevel } from '../../enums/AppTierLevel';

export interface UserTier {
  level: AppTierLevel;
}

export interface TwoFADetails {
  bithyveXpub?: string;
  twoFAKey?: string;
  twoFAValidated?: boolean;
}

export interface KeeperApp {
  appId: string;
  appName: string;
  primaryMnemonic: string;
  primarySeed: string;
  walletShell: WalletShell;
  vaultShell: VaultShell;
  details2FA: TwoFADetails;
  nodeConnect: any;
  uai: any;
  userTier: UserTier;
  version: string;
}
