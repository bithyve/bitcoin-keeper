import { call, put, select } from 'redux-saga/effects';
import Relay from 'src/services/backend/Relay';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { UAI, uaiType } from 'src/models/interfaces/Uai';
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
      if (
        message.additionalInfo.type === uaiType.IKS_REQUEST &&
        message.additionalInfo.reqId !== null
      ) {
        const uais = dbManager.getObjectByField(
          RealmSchema.UAI,
          message.additionalInfo.reqId,
          'entityId'
        );
        if (!uais.length) {
          yield put(
            addToUaiStack({
              title: 'There is a request for your Inheritance Key. Please review',
              isDisplay: true,
              uaiType: uaiType.IKS_REQUEST,
              prirority: 100,
              entityId: message.additionalInfo.reqId,
              displayText:
                'There is a request by someone for accessing the Inheritance Key you have set up using this app',
            })
          );
        } else {
          const uai = uais[0];
          let updatedUai: UAI = JSON.parse(JSON.stringify(uai)); // Need to get a better way
          updatedUai = {
            ...updatedUai,
            isActioned: false,
          };
          yield call(dbManager.updateObjectById, RealmSchema.UAI, updatedUai.id, updatedUai);
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
  // TO--DO: NOTIFICATION_UAI_BINDING without the notifaction schema
  // for (let i = 0; i < messages.length; i++) {
  //   yield call(dbManager.createObject, RealmSchema.Notification, {
  //     ...messages[i],
  //     additionalInfo: {
  //       notes: Platform.select({
  //         ios: messages[i].additionalInfo.notes.ios,
  //         android: messages[i].additionalInfo.notes.android,
  //       }),
  //     },
  //   });
  // }

  // for (let i = 0; i < storedNotifications.length; i++) {
  //   yield put(
  //     addToUaiStack({
  //       title: storedNotifications[i].title,
  //       isDisplay: true,
  //       uaiType: storedNotifications[i].type,
  //       prirority: 20,
  //       displayText: storedNotifications[i].additionalInfo.notes,
  //     })
  //   );
  // }
  yield call(notficationsToUAI, messages);
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
