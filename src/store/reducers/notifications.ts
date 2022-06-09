import { createSlice } from '@reduxjs/toolkit';

const initialState: {
  notifications: any;
  fetchStarted: boolean;
  timeStamp: any;
  messages: [];
} = {
  notifications: [],
  fetchStarted: false,
  timeStamp: null,
  messages: []
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
    }
  }
})

export const {
  notificationsFetched,
  fetchNotificationStarted,
  storeMessagesTimeStamp,
  messageFetched
} = notificationsSlice.actions

export default notificationsSlice.reducer
