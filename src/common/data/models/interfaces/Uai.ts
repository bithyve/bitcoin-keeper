export interface UAI {
  id: string;
  title: string;
  notificationId?: string;
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
  RELEASE_MESSAGE = 'RELEASE_MESSAGE',
  ALERT = 'ALERT',
  WARNING = 'WARNING',
  REMINDER = 'REMINDER',
  VAULT_TRANSFER = 'VAULT_TRANSFER',
  SECURE_VAULT = 'SECURE_VAULT',
  RELEASE = 'RELEASE',
  SIGNING_DEVICES_HEALTH_CHECK = 'SIGNING_DEVICES_HEALTH_CHECK',
}
