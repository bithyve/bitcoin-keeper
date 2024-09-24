import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ElectrumClientConnectionStatusPayload {
  successful: boolean;
  connectedTo?: string;
  error?: string;
}

export const initialState: {
  hasCreds: boolean;
  isAuthenticated: boolean;
  authenticationFailed: boolean;
  walletSetupCompleted: boolean;
  walletSetupFailed: boolean;
  isInitialLogin: boolean;
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
  electrumClientConnectionStatus: {
    inProgress: boolean;
    success: boolean;
    connectedTo: string;
    failed: boolean;
    error: string;
    setElectrumNotConnectedErr: string;
  };
} = {
  hasCreds: false,
  isAuthenticated: false,
  authenticationFailed: false,
  walletSetupCompleted: false,
  walletSetupFailed: false,
  isInitialLogin: false,
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
  electrumClientConnectionStatus: {
    inProgress: false,
    success: false,
    connectedTo: null,
    failed: false,
    error: null,
    setElectrumNotConnectedErr: '',
  },
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
    resetCredsChanged: (state) => {
      state.credsChanged = '';
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

    electrumClientConnectionInitiated: (state) => {
      state.electrumClientConnectionStatus = {
        ...initialState.electrumClientConnectionStatus,
        inProgress: true,
      };
    },
    electrumClientConnectionExecuted: (
      state,
      action: PayloadAction<ElectrumClientConnectionStatusPayload>
    ) => {
      state.electrumClientConnectionStatus = {
        inProgress: false,
        success: action.payload.successful,
        connectedTo: action.payload.connectedTo,
        failed: !action.payload.successful,
        error: action.payload.error,
        setElectrumNotConnectedErr: '',
      };
    },
    setElectrumNotConnectedErr: (state, action: PayloadAction<string>) => {
      state.electrumClientConnectionStatus.setElectrumNotConnectedErr = action.payload;
    },
    resetElectrumNotConnectedErr: (state) => {
      state.electrumClientConnectionStatus.setElectrumNotConnectedErr =
        initialState.electrumClientConnectionStatus.setElectrumNotConnectedErr;
    },
    setIsInitialLogin: (state, action: PayloadAction<boolean>) => {
      state.isInitialLogin = action.payload;
    },
  },
});

export const {
  credsAuthenticated,
  credsChanged,
  resetCredsChanged,
  pinChangedFailed,
  setCredStored,
  setupLoading,
  setKey,
  setAppCreationError,
  setRecepitVerificationError,
  setRecepitVerificationFailed,
  electrumClientConnectionInitiated,
  electrumClientConnectionExecuted,
  setElectrumNotConnectedErr,
  resetElectrumNotConnectedErr,
  setIsInitialLogin,
} = loginSlice.actions;
export default loginSlice.reducer;
