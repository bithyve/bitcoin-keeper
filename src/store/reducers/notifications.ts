import { createSlice } from '@reduxjs/toolkit';

const initialState: {
  notifications: any;
  fetchStarted: boolean;
  timeStamp: any;
  messages: [];
  fcmToken: string
} = {
  notifications: [],
  fetchStarted: false,
  timeStamp: null,
  messages: [],
  fcmToken: ''
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notificationsFetched: (state, action) => {
      state.notifications = action.payload
    },
    fetchNotificationStarted: (state, action) => {
      state.fetchStarted = action.payload
    },
    storeMessagesTimeStamp: (state) => {
      state.timeStamp = Date.now()
    },
    messageFetched: (state, action) => {
      state.messages = action.payload
    },
    setFcmToken: (state, action) => {
      state.fcmToken = action.payload
    }
  }
})

export const {
  notificationsFetched,
  fetchNotificationStarted,
  storeMessagesTimeStamp,
  messageFetched,
  setFcmToken
} = notificationsSlice.actions

export default notificationsSlice.reducer
