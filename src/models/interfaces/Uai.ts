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

export enum uaiType {
  VAULT_TRANSFER = 'VAULT_TRANSFER',
  SECURE_VAULT = 'SECURE_VAULT',
  SIGNING_DEVICES_HEALTH_CHECK = 'SIGNING_DEVICES_HEALTH_CHECK',
  RECOVERY_PHRASE_HEALTH_CHECK = 'RECOVERY_PHRASE_HEALTH CHECK',
  IKS_REQUEST = 'IKS_REQUEST',
  FEE_INISGHT = 'FEE_INISGHT',
  //No UAI support yet for these types
  DEFAULT = 'DEFAULT',
  RELEASE_MESSAGE = 'RELEASE_MESSAGE',
}
