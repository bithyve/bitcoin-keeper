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
}

export enum uaiType {
  RELEASE_MESSAGE = 'RELEASE_MESSAGE',
  ALERT = 'ALERT',
  WARNING = 'WARNING',
  REMINDER = 'REMINDER',
  VAULT_TRANSFER = 'VAULT_TRANSFER',
}
