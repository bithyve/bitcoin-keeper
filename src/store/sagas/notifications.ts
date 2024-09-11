import { call, put, select } from 'redux-saga/effects';
import Relay from 'src/services/backend/Relay';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { IKSType, UAI, uaiType } from 'src/models/interfaces/Uai';
import { RootState } from '../store';
import {
  notificationsFetched,
  fetchNotificationStarted,
  storeMessagesTimeStamp,
  messageFetched,
  setFcmToken,
} from '../reducers/notifications';
import {
  UPDATE_FCM_TOKENS,
  FETCH_NOTIFICATIONS,
  GET_MESSAGES,
  UPDATE_MESSAGES_STATUS_INAPP,
  UPDATE_MESSAGES_STATUS,
} from '../sagaActions/notifications';
import { createWatcher } from '../utilities';
import { addToUaiStack } from '../sagaActions/uai';
import { setRefreshUai } from '../reducers/uai';

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
  // yield call( setupNotificationListWorker )
  yield put(fetchNotificationStarted(false));
}

export const fetchNotificationsWatcher = createWatcher(
  fetchNotificationsWorker,
  FETCH_NOTIFICATIONS
);

export function* notficationsToUAI(messages) {
  for (const message of messages) {
    if (message.additionalInfo !== null && typeof message.additionalInfo === 'object') {
      const { reqId, type } = message.additionalInfo;
      const { info, title } = message;

      console.log(reqId, type, info, title);
      if (
        reqId !== null &&
        [IKSType.IKS_REQUEST, IKSType.SIGN_TRANSACTION, IKSType.ONE_TIME_BACKUP].includes(type)
      ) {
        const uais = dbManager.getObjectByField(RealmSchema.UAI, reqId, 'entityId');

        if (!uais.length) {
          yield put(
            addToUaiStack({
              uaiType: type,
              entityId: reqId,
              uaiDetails: { heading: title, body: info },
            })
          );
        }
        yield put(setRefreshUai());
      }
    }
  }
}

export function* getMessageWorker() {
  yield put(fetchNotificationStarted(true));
  const storedMessages = yield select((state) => state.notifications.messages);
  const appId = yield select((state: RootState) => state.storage.appId);
  const timeStamp = yield select((state) => state.notifications.timeStamp);
  const { messages } = yield call(Relay.getMessages, appId, timeStamp);

  if (!storedMessages) return;
  const newMessageArray = storedMessages.concat(
    messages.filter(
      ({ notificationId }) => !storedMessages.find((f) => f.notificationId === notificationId)
    )
  );
  yield call(notficationsToUAI, newMessageArray);
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
