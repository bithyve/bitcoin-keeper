import { notificationTag, notificationType } from '../enums/Notifications';

export interface INotification {
  notificationType: notificationType;
  title: string;
  body: string;
  data: any;
  tag: notificationTag;
  status?: string;
  date?: Date;
} // corresponds to the notification schema

export enum VerificationType {
  TWO_FA = 'TWO_FA',
  SECRET_PHRASE = 'SECRET_PHRASE',
}

export interface SingerVerification {
  method: VerificationType;
  verifier?: string;
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
  childIndexArray: any[];
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

export enum CosignersMapUpdateAction {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}
export interface CosignersMapUpdate {
  cosignersId: string;
  signerId: string;
  action: CosignersMapUpdateAction;
}

export interface InheritanceNotification {
  targets: string[];
}

export interface InheritanceAlert {
  emails: string[];
}

export interface InheritanceConfiguration {
  id: string;
  m: number;
  n: number;
  descriptors: string[];
  bsms?: string;
}

export interface InheritancePolicy {
  notification: InheritanceNotification;
  alert?: InheritanceAlert;
}

export interface EncryptedInheritancePolicy {
  notification: InheritanceNotification;
  alert?: string;
}

export interface InheritanceKeyInfo {
  configurations: InheritanceConfiguration[];
  policy?: InheritancePolicy;
}

export interface InheritanceKeyRequest {
  requestId: string;
  vaultId: string;
  arrivedAt: number;
  status: {
    isDeclined: boolean;
    isApproved: boolean;
  };
}

export enum IKSCosignersMapUpdateAction {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}
export interface IKSCosignersMapUpdate {
  cosignersId: string;
  inheritanceKeyId: string;
  action: IKSCosignersMapUpdateAction;
}
