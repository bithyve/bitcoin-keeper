import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import LoginMethod from 'src/common/data/enums/LoginMethod'
import ThemeMode from 'src/common/data/enums/ThemeMode'

const initialState: {
  loginMethod: LoginMethod,
  themeMode: ThemeMode,
  currencyCode: any;
} = {
  loginMethod: LoginMethod.PIN,
  themeMode: ThemeMode.LIGHT,
  currencyCode: []
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
    setCurrencyCode: (state, action) => {
      state.currencyCode = action.payload
    }
  }
})

export const { setLoginMethod, setThemeMode, setCurrencyCode } = settingsSlice.actions

export default settingsSlice.reducer
