import { createSlice } from '@reduxjs/toolkit';

const initialState: {
  fcmToken: string;
} = {
  fcmToken: '',
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setFcmToken: (state, action) => {
      state.fcmToken = action.payload;
    },
  },
});

export const { setFcmToken } = notificationsSlice.actions;

export default notificationsSlice.reducer;
