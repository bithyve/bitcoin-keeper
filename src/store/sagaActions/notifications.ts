// types and action creators: dispatched by components and sagas
export const UPDATE_FCM_TOKENS = 'UPDATE_FCM_TOKENS';
export const FETCH_NOTIFICATIONS = 'FETCH_NOTIFICATIONS';
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

export const fetchNotifications = () => ({
  type: FETCH_NOTIFICATIONS,
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

export const messageFetched = (messages) => ({
  type: MESSAGES_FETCHED,
  payload: {
    messages,
  },
});

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
