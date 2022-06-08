import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: {
  hasCreds: Boolean;
  isAuthenticated: Boolean;
  authenticationFailed: Boolean;
  walletSetupCompleted: Boolean;
  walletSetupFailed: Boolean;
  reLogin: Boolean;
  loading: {
    initializing: Boolean;
    storingCreds: Boolean;
    authenticating: Boolean;
  };
  credsChanged: string;
  pinChangedFailed: Boolean;
  initializeRecoveryCompleted: boolean;
} = {
  hasCreds: false,
  isAuthenticated: false,
  authenticationFailed: false,
  walletSetupCompleted: false,
  walletSetupFailed: false,
  reLogin: false,
  loading: {
    initializing: false,
    storingCreds: false,
    authenticating: false,
  },
  credsChanged: '',
  pinChangedFailed: false,
  initializeRecoveryCompleted: false,
}

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setCredStored: (state) => {
      state.hasCreds = true
      state.loading = {
        initializing: false,
        storingCreds: false,
        authenticating: false,
      }
    },
    credsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload,
        state.authenticationFailed = !action.payload,
        state.loading = {
          initializing: false,
          storingCreds: false,
          authenticating: false,
        }
    },
    credsChanged: (state, action: PayloadAction<string>) => {
      state.credsChanged = action.payload
    },
    pinChangedFailed: (state, action: PayloadAction<boolean>) => {
      state.pinChangedFailed = action.payload
    },
    setupLoading: (state, action: PayloadAction<string>) => {
      const isFailed = action.payload === 'authenticating' &&
        !state.loading[action.payload] === true
        ? false
        : state.authenticationFailed
      state.authenticationFailed = isFailed
    }
  },
})

export const {
  credsAuthenticated,
  credsChanged,
  pinChangedFailed,
  setCredStored,
  setupLoading,
} = loginSlice.actions
export default loginSlice.reducer
