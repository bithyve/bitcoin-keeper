export enum VerificationType {
  TWO_FA = 'TWO_FA',
}

export enum PermittedAction {
  UPDATE_POLICY = 'UPDATE_POLICY',
  FETCH_BACKUP = 'FETCH_BACKUP',
  SIGN_TRANSACTION = 'SIGN_TRANSACTION',
  CANCEL_TRANSACTION = 'CANCEL_TRANSACTION',
}

export interface VerificationOption {
  id: string;
  method: VerificationType;
  verifier?: string;
  permittedActions: PermittedAction[];
}

export interface SingerVerification {
  method: VerificationType;
  verifier?: string;
  secondary?: VerificationOption[]; // secondary verification options
}

export interface SignerRestriction {
  // aka Signer's SpendingLimit
  none: Boolean;
  maxTransactionAmount?: number; // max amount for an outgoing transaction
  timeWindow?: number; // time period in milliseconds (e.g., 7 days = 7 * 24 * 60 * 60 * 1000)
  // note: if timeWindow is present, maxTransactionAmount turns into the aggregate maximum amount allowed in that time period
}

export interface SignerException {
  none: boolean;
  transactionAmount?: number; // max tx amount till no verification is needed
}

export interface SignerPolicy {
  verification: SingerVerification;
  restrictions: SignerRestriction;
  exceptions: SignerException;
  signingDelay?: number; // delay in milliseconds
  backupDisabled?: boolean;
}

export interface DelayedTransaction {
  txid: string;
  serializedPSBT: string;
  signerId: string;
  outgoing: number;
  verificationToken: string;
  timestamp: number;
  delayUntil: number;
  FCM: string;
  signedPSBT?: string;
}

export interface DelayedPolicyUpdate {
  policyId: string;
  signerId: string;
  policyUpdates: {
    restrictions: SignerRestriction;
    exceptions: SignerException;
    signingDelay: number;
  };
  verificationToken: string;
  timestamp: number;
  delayUntil: number;
  FCM?: string;
  isApplied?: boolean;
}
