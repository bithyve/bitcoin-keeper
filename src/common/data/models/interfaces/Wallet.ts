export interface TwoFADetails {
  bithyveXpub?: string;
  twoFAKey?: string;
  twoFAValidated?: boolean;
}

export interface Wallet {
  walletId: string;
  walletName: string;
  userName?: string;
  security: { questionId: string; question: string; answer: string };
  primaryMnemonic: string;
  primarySeed: string;
  secondaryXpub?: string;
  details2FA?: TwoFADetails;
  smShare?: string;
  accounts: {
    [accountType: string]: string[]; // array of accountIds
  };
  version: string;
}
