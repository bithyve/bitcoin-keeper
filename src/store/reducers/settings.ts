import LoginMethod from 'src/common/data/enums/LoginMethod'
import ThemeMode from 'src/common/data/enums/ThemeMode'
import { SET_LOGIN_METHOD } from '../actions/settings'

const initialState: {
  loginMethod: LoginMethod,
  themeMode: ThemeMode
} = {
  loginMethod: LoginMethod.PIN,
  themeMode: ThemeMode.LIGHT
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_LOGIN_METHOD:
      return {
        ...state,
        loginMethod: action.payload.method,
      }
  }

  return state
}
