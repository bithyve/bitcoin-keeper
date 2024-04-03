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
  none: boolean;
  maxTransactionAmount?: number; // max amount for an outgoing transaction
}

export interface SignerException {
  none: boolean;
  transactionAmount?: number; // max tx amount till no verification is needed
}

export interface SignerPolicy {
  verification: SingerVerification;
  restrictions: SignerRestriction;
  exceptions: SignerException;
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
