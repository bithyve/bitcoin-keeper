import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import CurrencyKind from "src/common/data/enums/CurrencyKind";
import LoginMethod from "src/common/data/enums/LoginMethod";
import ThemeMode from "src/common/data/enums/ThemeMode";
import { NodeDetail } from "src/core/wallets/interfaces";

const initialState: {
  loginMethod: LoginMethod;
  themeMode: ThemeMode;
  currencyKind: CurrencyKind;
  currencyCode: string;
  language: string;
  torEnbled: boolean;
  inheritanceModal: boolean,
  connectToMyNodeEnabled: boolean,
  nodeDetails: NodeDetail[]
} = {
  loginMethod: LoginMethod.PIN,
  themeMode: ThemeMode.LIGHT,
  currencyKind: CurrencyKind.BITCOIN,
  currencyCode: 'USD',
  language: 'en',
  torEnbled: false,
  inheritanceModal: true,
  connectToMyNodeEnabled: false,
  nodeDetails: []
}

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLoginMethod: (state, action: PayloadAction<LoginMethod>) => {
      state.loginMethod = action.payload;
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload
    },
    setCurrencyKind: (state, action: PayloadAction<CurrencyKind>) => {
      state.currencyKind = action.payload;
    },
    setCurrencyCode: (state, action: PayloadAction<string>) => {
      state.currencyCode = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
    setTorEnabled: (state, action: PayloadAction<boolean>) => {
      state.torEnbled = action.payload
    },
    setInheritance: (state, action: PayloadAction<boolean>) => {
      state.inheritanceModal = action.payload
    },
    setConnectToMyNode: (state, action: PayloadAction<boolean>) => {
      state.connectToMyNodeEnabled = action.payload
    },
    setNodeDetails: (state, action: PayloadAction<NodeDetail[]>) => {
      state.nodeDetails = action.payload
    }
  }
})

export const { 
  setLoginMethod, 
  setThemeMode, 
  setCurrencyKind, 
  setCurrencyCode, 
  setLanguage, 
  setTorEnabled, 
  setInheritance, 
  setConnectToMyNode,
  setNodeDetails 
} = settingsSlice.actions

export default settingsSlice.reducer;
