import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import LoginMethod from 'src/models/enums/LoginMethod';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import ThemeMode from 'src/models/enums/ThemeMode';
import { NetworkType } from 'src/services/wallets/enums';
import * as bitcoinJS from 'bitcoinjs-lib';

const initialState: {
  loginMethod: LoginMethod;
  themeMode: ThemeMode;
  currencyKind: CurrencyKind;
  currencyCode: string;
  language: string;
  torEnbled: boolean;
  satsEnabled: boolean;
  oneTimeBackupStatus: {
    signingServer: boolean; // to be removed later, moved to accounts reducer & mapped with appId
  };
  backupModal: boolean;
  subscription: string;
  bitcoinNetwork: bitcoinJS.Network;
  bitcoinNetworkType: NetworkType;
  appWideLoading: boolean;
} = {
  loginMethod: LoginMethod.PIN,
  themeMode: ThemeMode.LIGHT,
  currencyKind: CurrencyKind.BITCOIN,
  currencyCode: 'USD',
  language: 'en',
  torEnbled: false,
  satsEnabled: true,
  oneTimeBackupStatus: {
    signingServer: false,
  },
  backupModal: true,
  subscription: SubscriptionTier.L1,
  bitcoinNetwork: null,
  bitcoinNetworkType: null,
  appWideLoading: false,
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
    setOTBStatusSS: (state, action: PayloadAction<boolean>) => {
      state.oneTimeBackupStatus.signingServer = action.payload;
    },
    setBackupModal: (state, action: PayloadAction<boolean>) => {
      state.backupModal = action.payload;
    },
    setSubscription(state, action: PayloadAction<string>) {
      state.subscription = action.payload;
    },
    setBitcoinNetwork(state, action: PayloadAction<NetworkType>) {
      state.bitcoinNetworkType = action.payload;
      state.bitcoinNetwork =
        action.payload === NetworkType.MAINNET
          ? bitcoinJS.networks.bitcoin
          : bitcoinJS.networks.testnet;
    },
    setAppWideLoading(state, action: PayloadAction<boolean>) {
      state.appWideLoading = action.payload;
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
  setOTBStatusSS,
  setBackupModal,
  setSubscription,
  setBitcoinNetwork,
  setAppWideLoading,
} = settingsSlice.actions;

export default settingsSlice.reducer;
