import LoginMethod from 'src/models/enums/LoginMethod';

export const SET_LOGIN_METHOD = 'SET_LOGIN_METHOD';

export const setLoginMethod = (method: LoginMethod) => ({
  type: SET_LOGIN_METHOD,
  payload: {
    method,
  },
});
