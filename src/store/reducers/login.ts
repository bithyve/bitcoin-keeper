import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const initialState: {
  hasCreds: boolean;
  isAuthenticated: boolean;
  authenticationFailed: boolean;
  walletSetupCompleted: boolean;
  walletSetupFailed: boolean;
  reLogin: boolean;
  loading: {
    initializing: boolean;
    storingCreds: boolean;
    authenticating: boolean;
  };
  credsChanged: string;
  pinChangedFailed: boolean;
  initializeRecoveryCompleted: boolean;
  key: string | null;
  appCreationError: boolean;
  recepitVerificationError: boolean;
  recepitVerificationFailed: boolean;
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
  key: null,
  appCreationError: false,
  recepitVerificationError: false,
  recepitVerificationFailed: false,
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setCredStored: (state) => {
      state.hasCreds = true;
      state.loading = {
        initializing: false,
        storingCreds: false,
        authenticating: false,
      };
    },
    credsAuthenticated: (state, action: PayloadAction<boolean>) => {
      (state.isAuthenticated = action.payload),
        (state.authenticationFailed = !action.payload),
        (state.loading = {
          initializing: false,
          storingCreds: false,
          authenticating: false,
        });
    },
    credsChanged: (state, action: PayloadAction<string>) => {
      state.credsChanged = action.payload;
    },
    pinChangedFailed: (state, action: PayloadAction<boolean>) => {
      state.pinChangedFailed = action.payload;
    },
    setupLoading: (state, action: PayloadAction<string>) => {
      const isFailed =
        action.payload === 'authenticating' && !state.loading[action.payload] === true
          ? false
          : state.authenticationFailed;
      state.authenticationFailed = isFailed;
    },
    setKey: (state, action: PayloadAction<string>) => {
      state.key = action.payload;
    },
    setAppCreationError: (state, action: PayloadAction<boolean>) => {
      state.appCreationError = action.payload;
    },
    setRecepitVerificationError: (state, action: PayloadAction<boolean>) => {
      state.recepitVerificationError = action.payload;
    },
    setRecepitVerificationFailed: (state, action: PayloadAction<boolean>) => {
      state.recepitVerificationFailed = action.payload;
    },
  },
});

export const {
  credsAuthenticated,
  credsChanged,
  pinChangedFailed,
  setCredStored,
  setupLoading,
  setKey,
  setAppCreationError,
  setRecepitVerificationError,
  setRecepitVerificationFailed,
} = loginSlice.actions;
export default loginSlice.reducer;
