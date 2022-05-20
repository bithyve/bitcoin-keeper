export interface UAI {
  id: string;
  title: string;
  notificationId?: string;
  isActioned: boolean;
  timeStamp: Date;
  actionType: ActionType;
  prirority: number;
}

enum ActionType {
  DISPLAY_MESSAGE = 'DISPLAY_MESSAGE',
  NAVIGATE_TO_ADD_WALLET = 'NAVIGATE_TO_ADD_WALLET',
}
