import { all, call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import {
  UPDATE_FCM_TOKENS,
  FETCH_NOTIFICATIONS,
  GET_MESSAGES,
  UPDATE_MESSAGES_STATUS_INAPP,
  UPDATE_MESSAGES_STATUS,
} from '../sagaActions/notifications';
import {
  notificationsFetched,
  fetchNotificationStarted,
  storeMessagesTimeStamp,
  messageFetched,
  setFcmToken,
} from '../reducers/notifications';
import Relay from 'src/core/services/operations/Relay';
import { RootState } from '../store';
import { useDispatch } from 'react-redux';
import { addToUaiStack } from 'src/store/sagaActions/uai';
import { UAI, uaiType } from 'src/common/data/models/interfaces/Uai';
import { Platform } from 'react-native';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { useUaiStack } from 'src/hooks/useUaiStack';

function* updateFCMTokensWorker({ payload }) {
  try {
    const { FCMs } = payload;
    if (FCMs.length === 0) {
      throw new Error('No FCM token found');
    }
    const appId = yield select((state: RootState) => state.storage.appId);
    const { updated } = yield call(Relay.updateFCMTokens, appId, payload.FCMs);
    if (updated) {
      yield put(setFcmToken(FCMs[0]));
    } else {
      console.log('Failed to update FCMs on the server');
    }
  } catch (err) {
    console.log('err', err);
  }
}

export const updateFCMTokensWatcher = createWatcher(updateFCMTokensWorker, UPDATE_FCM_TOKENS);

export function* fetchNotificationsWorker() {
  yield put(fetchNotificationStarted(true));
  const appId = yield select((state: RootState) => state.storage.appId);
  const { notifications } = yield call(Relay.fetchNotifications, appId);
  yield call(notificationsFetched, notifications);
  //yield call( setupNotificationListWorker )
  yield put(fetchNotificationStarted(false));
}

export const fetchNotificationsWatcher = createWatcher(
  fetchNotificationsWorker,
  FETCH_NOTIFICATIONS
);

export function* getMessageWorker() {
  yield put(fetchNotificationStarted(true));
  const storedMessages = yield select((state) => state.notifications.messages);
  const appId = yield select((state: RootState) => state.storage.appId);
  const timeStamp = yield select((state) => state.notifications.timeStamp);

  const { messages } = yield call(Relay.getMessages, appId, timeStamp);
  if (!storedMessages) return;
  const newMessageArray = storedMessages.concat(
    messages.filter(
      ({ notificationId }) => !storedMessages.find((f) => f.notificationId == notificationId)
    )
  );

  for (let i = 0; i < messages.length; i++) {
    yield call(dbManager.createObject, RealmSchema.Notification, {
      ...messages[i],
      additionalInfo: {
        notes: Platform.select({
          ios: messages[i].additionalInfo.notes.ios,
          android: messages[i].additionalInfo.notes.android,
        }),
      },
    });
  }

  const storedNotifications = yield call(dbManager.getCollection, RealmSchema.Notification);

  for (let i = 0; i < storedNotifications.length; i++) {
    yield put(
      addToUaiStack(
        storedNotifications[i].title,
        false,
        storedNotifications[i].type,
        20,
        storedNotifications[i].additionalInfo.notes
      )
    );
  }

  yield put(messageFetched(newMessageArray));
  yield put(storeMessagesTimeStamp());
  yield put(fetchNotificationStarted(false));
}

export const getMessageWatcher = createWatcher(getMessageWorker, GET_MESSAGES);

export function* updateMessageStatusInAppWorker({ payload }) {
  const { messageNotificationId } = payload;
  const messages = yield select((state) => state.notifications.messages);
  const messageArray = messages.map((message) =>
    message.notificationId === messageNotificationId
      ? {
          ...message,
          status: 'read',
        }
      : message
  );
  yield put(messageFetched(messageArray));
}

export const updateMessageStatusInAppWatcher = createWatcher(
  updateMessageStatusInAppWorker,
  UPDATE_MESSAGES_STATUS_INAPP
);

export function* updateMessageStatusWorker({ payload }) {
  try {
    const { data } = payload;
    if (data.length === 0) {
      throw new Error('No data found');
    }
    const walletId = yield select((state) => state.preferences.walletId);
    const { updated } = yield call(Relay.updateMessageStatus, walletId, data);
    if (!updated) console.log('Failed to update messageStatus on the server');
  } catch (err) {
    console.log('err', err);
  }
}

export const updateMessageStatusWatcher = createWatcher(
  updateMessageStatusWorker,
  UPDATE_MESSAGES_STATUS
);
