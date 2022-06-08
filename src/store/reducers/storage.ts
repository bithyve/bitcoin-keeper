import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: {
  appId: string;
  resetCred: {
    hash: string,
    index: number
  },
  failedAttempts: number,
  lastLoginFailedAt: number,
  key: string
} = {
  appId: '',
  resetCred: {
    hash: '',
    index: null
  },
  failedAttempts: 0,
  lastLoginFailedAt: null,
  key: ''
}

const storageSlice = createSlice({
  name: 'storage',
  initialState,
  reducers: {
    setAppId: (state, action: PayloadAction<string>) => {
      state.appId = action.payload
    },
    increasePinFailAttempts: (state) => {
      state.failedAttempts = state.failedAttempts + 1
      state.lastLoginFailedAt = Date.now()
    },
    setPinResetCreds: (state, action: PayloadAction<{ hash: string, index: number }>) => {
      state.resetCred = {
        hash: action.payload.hash,
        index: action.payload.index
      }
    },
    resetPinFailAttempts: (state) => {
      state.failedAttempts = 0
      state.lastLoginFailedAt = null
    },
    setKey: (state, action: PayloadAction<string>) => {
      state.key = action.payload
    }
  }
})

export const {
  setAppId,
  increasePinFailAttempts,
  setPinResetCreds,
  resetPinFailAttempts,
  setKey
} = storageSlice.actions

export default storageSlice.reducer
