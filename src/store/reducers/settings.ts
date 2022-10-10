import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import CurrencyKind from "src/common/data/enums/CurrencyKind";
import LoginMethod from "src/common/data/enums/LoginMethod";
import ThemeMode from "src/common/data/enums/ThemeMode";

const initialState: {
  loginMethod: LoginMethod;
  themeMode: ThemeMode;
  currencyKind: CurrencyKind;
  currencyCode: string;
  language: string;
  torEnbled: boolean;
  inheritanceModal: boolean
} = {
  loginMethod: LoginMethod.PIN,
  themeMode: ThemeMode.LIGHT,
  currencyKind: CurrencyKind.BITCOIN,
  currencyCode: 'USD',
  language: 'en',
  torEnbled: false,
  inheritanceModal: true
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
  }
})

export const { setLoginMethod, setThemeMode, setCurrencyKind, setCurrencyCode, setLanguage, setTorEnabled, setInheritance } = settingsSlice.actions

export default settingsSlice.reducer;
