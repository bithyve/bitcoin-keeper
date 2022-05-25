export interface TwoFADetails {
  bithyveXpub?: string;
  twoFAKey?: string;
  twoFAValidated?: boolean;
}

export interface KeeperApp {
  appId: string;
  appName: string;
  userName?: string;
  primaryMnemonic: string;
  primarySeed: string;
  secondaryXpub?: string;
  details2FA?: TwoFADetails;
  wallets: {
    [walletType: string]: string[]; // array of walletIds
  };
  version: string;
}
