export interface UAI {
  id: string;
  title: string;
  notificationId?: string;
  isActioned: boolean;
  timeStamp: Date;
  uaiType: uaiType;
  prirority: number;
}

export enum uaiType {
  DISPLAY_MESSAGE = 'DISPLAY_MESSAGE',
  NAVIGATE_TO_ADD_WALLET = 'NAVIGATE_TO_ADD_WALLET',
}
