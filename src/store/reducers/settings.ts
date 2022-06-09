import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import LoginMethod from 'src/common/data/enums/LoginMethod'
import ThemeMode from 'src/common/data/enums/ThemeMode'

const initialState: {
  loginMethod: LoginMethod,
  themeMode: ThemeMode
} = {
  loginMethod: LoginMethod.PIN,
  themeMode: ThemeMode.LIGHT
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
    }
  }
})

export const { setLoginMethod, setThemeMode } = settingsSlice.actions

export default settingsSlice.reducer
