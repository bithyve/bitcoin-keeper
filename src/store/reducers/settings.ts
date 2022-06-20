import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import LoginMethod from 'src/common/data/enums/LoginMethod'
import ThemeMode from 'src/common/data/enums/ThemeMode'

const initialState: {
  loginMethod: LoginMethod,
  themeMode: ThemeMode,
  currencyCode: string;
  language : string;
} = {
  loginMethod: LoginMethod.PIN,
  themeMode: ThemeMode.LIGHT,
  currencyCode: 'USD',
  language : 'en',
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLoginMethod: (state, action: PayloadAction<LoginMethod>) => {
      state.loginMethod = action.payload
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload
    },
    setCurrencyCode: (state, action: PayloadAction<string>) => {
      state.currencyCode = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    }
  }
})

export const { setLoginMethod, setThemeMode, setCurrencyCode, setLanguage, setCountry } = settingsSlice.actions

export default settingsSlice.reducer
