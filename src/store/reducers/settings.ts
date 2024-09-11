import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import LoginMethod from 'src/models/enums/LoginMethod';
import ThemeMode from 'src/models/enums/ThemeMode';

const initialState: {
  loginMethod: LoginMethod;
  themeMode: ThemeMode;
  currencyKind: CurrencyKind;
  currencyCode: string;
  language: string;
  torEnbled: boolean;
  inheritanceModal: boolean;
  satsEnabled: boolean;
  whirlpoolSwiperModal: boolean;
  keySecurityTips: string;
  letterToAttorny: string;
  enableAnalyticsLogin: boolean;
  recoveryInstruction: string;
  oneTimeBackupStatus: {
    signingServer: boolean;
    inheritanceKey: boolean;
  };
  backupModal: boolean;
} = {
  loginMethod: LoginMethod.PIN,
  themeMode: ThemeMode.LIGHT,
  currencyKind: CurrencyKind.BITCOIN,
  currencyCode: 'USD',
  language: 'en',
  torEnbled: false,
  inheritanceModal: true,
  satsEnabled: true,
  whirlpoolSwiperModal: true,
  keySecurityTips: '',
  letterToAttorny: '',
  enableAnalyticsLogin: true,
  recoveryInstruction: '',
  oneTimeBackupStatus: {
    signingServer: false,
    inheritanceKey: false,
  },
  backupModal: true,
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
    setInheritance: (state, action: PayloadAction<boolean>) => {
      state.inheritanceModal = action.payload;
    },
    setSatsEnabled: (state, action: PayloadAction<boolean>) => {
      state.satsEnabled = action.payload;
    },
    setWhirlpoolSwiperModal: (state, action: PayloadAction<boolean>) => {
      state.whirlpoolSwiperModal = action.payload;
    },
    setKeySecurityTipsPath: (state, action: PayloadAction<string>) => {
      state.keySecurityTips = action.payload;
    },
    setLetterToAttornyPath: (state, action: PayloadAction<string>) => {
      state.letterToAttorny = action.payload;
    },
    setEnableAnalyticsLogin: (state, action: PayloadAction<boolean>) => {
      state.enableAnalyticsLogin = action.payload;
    },
    // setRecoveryInstructionPath: (state, action: PayloadAction<string>) => {
    //   state.recoveryInstruction = action.payload;
    // },
    setOTBStatusSS: (state, action: PayloadAction<boolean>) => {
      state.oneTimeBackupStatus.signingServer = action.payload;
    },
    setOTBStatusIKS: (state, action: PayloadAction<boolean>) => {
      state.oneTimeBackupStatus.inheritanceKey = action.payload;
    },
    setBackupModal: (state, action: PayloadAction<boolean>) => {
      state.backupModal = action.payload;
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
  setInheritance,
  setSatsEnabled,
  setWhirlpoolSwiperModal,
  setKeySecurityTipsPath,
  setLetterToAttornyPath,
  setEnableAnalyticsLogin,
  // setRecoveryInstructionPath,
  setOTBStatusSS,
  setOTBStatusIKS,
  setBackupModal,
} = settingsSlice.actions;

export default settingsSlice.reducer;
