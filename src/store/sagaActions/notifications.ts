// types and action creators: dispatched by components and sagas
import { notificationTag, notificationType } from 'src/core/services/enums';

export const UPDATE_FCM_TOKENS = 'UPDATE_FCM_TOKENS';
export const SEND_NOTIFICATION = 'SEND_NOTIFICATION';
export const FETCH_NOTIFICATIONS = 'FETCH_NOTIFICATIONS';
export const NOTIFICATION_UPDATED = 'NOTIFICATION_UPDATED';
export const SETUP_NOTIFICATION_LIST = 'SETUP_NOTIFICATION_LIST';
export const UPDATED_NOTIFICATION_LIST = 'UPDATED_NOTIFICATION_LIST';
export const FETCH_NOTIFICATION_STARTED = 'FETCH_NOTIFICATION_STARTED';
export const GET_MESSAGES = 'GET_MESSAGES';
export const STORE_MESSAGE_TIMESTAMP = 'STORE_MESSAGE_TIMESTAMP';
export const MESSAGES_FETCHED = 'MESSAGES_FETCHED';
export const UPDATE_MESSAGES_STATUS_INAPP = 'UPDATE_MESSAGES_STATUS_INAPP';
export const UPDATE_MESSAGES_STATUS = 'UPDATE_MESSAGES_STATUS';

export const updateFCMTokens = (FCMs: string[]) => ({
    type: UPDATE_FCM_TOKENS,
    payload: {
      FCMs,
    },
  });

export const sendNotification = (
  contactName: string,
  notificationType: notificationType,
  title: string,
  body: string,
  data: Object,
  tag: notificationTag
) => ({
    type: SEND_NOTIFICATION,
    payload: {
      contactName,
      notificationType,
      title,
      body,
      data,
      tag,
    },
  });

export const fetchNotifications = () => ({
    type: FETCH_NOTIFICATIONS,
  });
export const setupNotificationList = () => ({
    type: SETUP_NOTIFICATION_LIST,
  });

// types and action creators: dispatched sagas

export const NOTIFICATIONS_FETCHED = 'NOTIFICATIONS_FETCHED';

export const notificationsFetched = (notifications) => {
  console.log('notificationsFetched notifications', notifications);
  return {
    type: NOTIFICATIONS_FETCHED,
    payload: {
      notifications,
    },
  };
};

export const notificationsUpdated = (notifications) => ({
    type: NOTIFICATION_UPDATED,
    payload: {
      notificationListNew: notifications,
    },
  });

export const updateNotificationList = (notifications) => ({
    type: UPDATED_NOTIFICATION_LIST,
    payload: {
      updatedNotificationList: notifications,
    },
  });

export const fetchNotificationStarted = (fetchStarted) => ({
    type: FETCH_NOTIFICATION_STARTED,
    payload: {
      fetchStarted,
    },
  });

export const getMessages = () => ({
    type: GET_MESSAGES,
  });

export const storeMessagesTimeStamp = () => ({
    type: STORE_MESSAGE_TIMESTAMP,
  });

export const messageFetched = (messages) => 
  // console.log( 'messagesFetched messages', messages )
   ({
    type: MESSAGES_FETCHED,
    payload: {
      messages,
    },
  })
;

export const updateMessageStatusInApp = (messageNotificationId) => {
  console.log('updateMessageStatus messages', messageNotificationId);
  return {
    type: UPDATE_MESSAGES_STATUS_INAPP,
    payload: {
      messageNotificationId,
    },
  };
};

export const updateMessageStatus = (data: []) => ({
    type: UPDATE_MESSAGES_STATUS,
    payload: {
      data,
    },
  });
