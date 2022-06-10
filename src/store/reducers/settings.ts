import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import CurrencyKind from "src/common/data/enums/CurrencyKind";
import LoginMethod from "src/common/data/enums/LoginMethod";
import ThemeMode from "src/common/data/enums/ThemeMode";

const initialState: {
  loginMethod: LoginMethod;
  themeMode: ThemeMode;
  currencyKind: CurrencyKind;
} = {
  loginMethod: LoginMethod.PIN,
  themeMode: ThemeMode.LIGHT,
  currencyKind: CurrencyKind.BITCOIN,
};

const settingsSlice = createSlice({
  name: "settings",
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
  },
});

export const { setLoginMethod, setThemeMode, setCurrencyKind } =
  settingsSlice.actions;

export default settingsSlice.reducer;
