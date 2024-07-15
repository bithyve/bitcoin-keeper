export interface UAI {
  id: string;
  uaiType: uaiType;
  entityId?: string;
  lastActioned?: Date;
  uaiDetails?: {
    heading?: string;
    body?: string;
  };
}

export enum IKSType {
  IKS_SETUP = 'IKS_SETUP',
  IKS_REQUEST = 'IKS_REQUEST',
  ONE_TIME_BACKUP = 'ONE_TIME_BACKUP',
  SIGN_TRANSACTION = 'SIGN_TRANSACTION',
}

export enum uaiType {
  //Locally Generated
  VAULT_TRANSFER = 'VAULT_TRANSFER',
  SECURE_VAULT = 'SECURE_VAULT',
  SIGNING_DEVICES_HEALTH_CHECK = 'SIGNING_DEVICES_HEALTH_CHECK',
  RECOVERY_PHRASE_HEALTH_CHECK = 'RECOVERY_PHRASE_HEALTH CHECK',
  FEE_INISGHT = 'FEE_INISGHT',
  CANARAY_WALLET = 'CANARY_WALLET',

  //Notifcation UAIs
  IKS_REQUEST = IKSType.IKS_REQUEST,
  ONE_TIME_BACKUP = IKSType.ONE_TIME_BACKUP,
  SIGN_TRANSACTION = IKSType.SIGN_TRANSACTION,

  //No UAI support yet for these types
  DEFAULT = 'DEFAULT',
  RELEASE_MESSAGE = 'RELEASE_MESSAGE',
}
