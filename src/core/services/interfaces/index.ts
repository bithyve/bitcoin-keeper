import { notificationTag, notificationType } from '../enums';

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

export interface InheritanceNotification {
  targets: string[];
}

export interface InheritanceAlert {
  emails: string[];
}

export interface InheritanceConfiguration {
  m: number;
  n: number;
  identifiers: string[];
  bsms?: string;
}

export interface InheritancePolicy {
  notification: InheritanceNotification;
  alert: InheritanceAlert;
}

export interface InheritanceKey {
  vaultId: string;
  xIndex: number;
  configuration: InheritanceConfiguration;
  policy: InheritancePolicy;
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
