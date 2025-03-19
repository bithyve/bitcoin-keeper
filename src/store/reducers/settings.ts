import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import LoginMethod from 'src/models/enums/LoginMethod';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import ThemeMode from 'src/models/enums/ThemeMode';

const initialState: {
  loginMethod: LoginMethod;
  themeMode: ThemeMode;
  currencyKind: CurrencyKind;
  currencyCode: string;
  language: string;
  torEnbled: boolean;
  satsEnabled: boolean;
  enableAnalyticsLogin: boolean;
  oneTimeBackupStatus: {
    signingServer: boolean;
  };
  backupModal: boolean;
  subscription: string;
} = {
  loginMethod: LoginMethod.PIN,
  themeMode: ThemeMode.LIGHT,
  currencyKind: CurrencyKind.BITCOIN,
  currencyCode: 'USD',
  language: 'en',
  torEnbled: false,
  satsEnabled: true,
  enableAnalyticsLogin: true,
  oneTimeBackupStatus: {
    signingServer: false,
  },
  backupModal: true,
  subscription: SubscriptionTier.L1,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLoginMethod: (state, action: PayloadAction<LoginMethod>) => {
      state.loginMethod = action.payload;
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
    setCurrencyKind: (state, action: PayloadAction<CurrencyKind>) => {
      state.currencyKind = action.payload;
    },
    setCurrencyCode: (state, action: PayloadAction<string>) => {
      state.currencyCode = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setTorEnabled: (state, action: PayloadAction<boolean>) => {
      state.torEnbled = action.payload;
    },
    setSatsEnabled: (state, action: PayloadAction<boolean>) => {
      state.satsEnabled = action.payload;
    },
    setEnableAnalyticsLogin: (state, action: PayloadAction<boolean>) => {
      state.enableAnalyticsLogin = action.payload;
    },
    setOTBStatusSS: (state, action: PayloadAction<boolean>) => {
      state.oneTimeBackupStatus.signingServer = action.payload;
    },
    setBackupModal: (state, action: PayloadAction<boolean>) => {
      state.backupModal = action.payload;
    },
    setSubscription(state, action: PayloadAction<string>) {
      state.subscription = action.payload;
    },
  },
});

export const {
  setLoginMethod,
  setThemeMode,
  setCurrencyKind,
  setCurrencyCode,
  setLanguage,
  setTorEnabled,
  setSatsEnabled,
  setEnableAnalyticsLogin,
  setOTBStatusSS,
  setBackupModal,
  setSubscription,
} = settingsSlice.actions;

export default settingsSlice.reducer;
