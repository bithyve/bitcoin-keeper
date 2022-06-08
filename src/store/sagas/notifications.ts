import { call, put, select } from 'redux-saga/effects'
import { createWatcher } from '../utilities'
import {
  UPDATE_FCM_TOKENS,
  FETCH_NOTIFICATIONS,
  GET_MESSAGES,
  UPDATE_MESSAGES_STATUS_INAPP,
  UPDATE_MESSAGES_STATUS
} from '../actions/notifications'
import {
  notificationsFetched,
  fetchNotificationStarted,
  storeMessagesTimeStamp,
  messageFetched
} from '../reducers/notifications'
import Relay from 'src/core/services/Relay'

function* updateFCMTokensWorker({ payload }) {
  try {
    const { FCMs } = payload
    if (FCMs.length === 0) {
      throw new Error('No FCM token found')
    }
    const { walletId } = yield select(
      (state) => state.storage.wallet,
    )
    const { updated } = yield call(
      Relay.updateFCMTokens,
      walletId,
      payload.FCMs,
    )
    if (!updated) console.log('Failed to update FCMs on the server')
  } catch (err) {
    console.log('err', err)
  }
}

export const updateFCMTokensWatcher = createWatcher(
  updateFCMTokensWorker,
  UPDATE_FCM_TOKENS,
)

export function* fetchNotificationsWorker() {
  yield put(fetchNotificationStarted(true))
  const { walletId } = yield select(
    (state) => state.storage.wallet,
  )
  const { notifications } = yield call(Relay.fetchNotifications, walletId)
  yield call(notificationsFetched, notifications)
  //yield call( setupNotificationListWorker )
  yield put(fetchNotificationStarted(false))
}

export const fetchNotificationsWatcher = createWatcher(
  fetchNotificationsWorker,
  FETCH_NOTIFICATIONS,
)


export function* getMessageWorker() {
  yield put(fetchNotificationStarted(true))
  const storedMessages = yield select(
    (state) => state.notifications.messages,
  )
  const walletId = yield select((state) => state.preferences.walletId,)
  const timeStamp = yield select(
    (state) => state.notifications.timeStamp,
  )
  console.log('messages timeStamp', timeStamp)

  const { messages } = yield call(Relay.getMessages, walletId, timeStamp)
  if (!storedMessages) return
  const newMessageArray = storedMessages.concat(messages.filter(({ notificationId }) => !storedMessages.find(f => f.notificationId == notificationId)))
  console.log('newMessageArray', newMessageArray)

  yield put(messageFetched(newMessageArray))
  yield put(storeMessagesTimeStamp())

  yield put(fetchNotificationStarted(false))
}

export const getMessageWatcher = createWatcher(
  getMessageWorker,
  GET_MESSAGES,
)


export function* updateMessageStatusInAppWorker({ payload }) {
  const { messageNotificationId } = payload
  const messages = yield select(
    (state) => state.notifications.messages,
  )
  const messageArray = messages.map(message => (
    message.notificationId === messageNotificationId ? {
      ...message, 'status': 'read',
    } : message
  ))
  console.log('messageArray', messageArray)
  yield put(messageFetched(messageArray))
}

export const updateMessageStatusInAppWatcher = createWatcher(
  updateMessageStatusInAppWorker,
  UPDATE_MESSAGES_STATUS_INAPP,
)


export function* updateMessageStatusWorker({ payload }) {
  try {
    const { data } = payload
    if (data.length === 0) {
      throw new Error('No data found')
    }
    const walletId = yield select((state) => state.preferences.walletId,)
    const { updated } = yield call(
      Relay.updateMessageStatus,
      walletId,
      data,
    )
    if (!updated) console.log('Failed to update messageStatus on the server')

  } catch (err) {
    console.log('err', err)
  }
}

export const updateMessageStatusWatcher = createWatcher(
  updateMessageStatusWorker,
  UPDATE_MESSAGES_STATUS,
)
