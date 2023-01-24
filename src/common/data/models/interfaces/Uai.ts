export interface UAI {
  id: string;
  title: string;
  isActioned: boolean;
  isDisplay: boolean;
  displayText?: string;
  displayCount: number;
  timeStamp: Date;
  uaiType: uaiType;
  prirority: number;
  entityId?: string;
}

export enum uaiType {
  VAULT_TRANSFER = 'VAULT_TRANSFER',
  SECURE_VAULT = 'SECURE_VAULT',
  VAULT_MIGRATION = 'VAULT_MIGRATION',
  SIGNING_DEVICES_HEALTH_CHECK = 'SIGNING_DEVICES_HEALTH_CHECK',
  DEFAULT = 'DEFAULT',
  RELEASE_MESSAGE = 'RELEASE_MESSAGE',
}
