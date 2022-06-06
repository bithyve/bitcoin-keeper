import LoginMethod from "src/common/data/enums/LoginMethod"

export const SET_LOGIN_METHOD = 'SET_LOGIN_METHOD'

export const setLoginMethod = (method: LoginMethod) => {
  return {
    type: SET_LOGIN_METHOD, payload: {
      method
    }
  }
}