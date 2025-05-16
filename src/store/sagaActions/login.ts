import LoginMethod from 'src/models/enums/LoginMethod';

export const STORE_CREDS = 'STORE_CREDS';
export const CREDS_AUTH = 'CREDS_AUTH';

export const CHANGE_AUTH_CRED = 'CHANGE_AUTH_CRED';
export const SET_LOGIN_METHOD = 'SET_LOGIN_METHOD';
export const CHANGE_LOGIN_METHOD = 'CHANGE_LOGIN_METHOD';
export const SWITCH_CREDS_CHANGED = 'SWITCH_CREDS_CHANGED';
export const CREDS_AUTHENTICATED = 'CREDS_AUTHENTICATED';
export const AUTH_CRED_CHANGED = 'AUTH_CRED_CHANGED';
export const PIN_CHANGED_FAILED = 'PIN_CHANGED_FAILED';

export const storeCreds = (passcode, callback = null) => ({
  type: STORE_CREDS,
  payload: {
    passcode,
    callback,
  },
});

export const changeLoginMethod = (method: LoginMethod, pubKey: string = '') => ({
  type: CHANGE_LOGIN_METHOD,
  payload: {
    method,
    pubKey,
  },
});

export const setLoginMethod = (method: LoginMethod) => ({
  type: SET_LOGIN_METHOD,
  payload: {
    method,
  },
});

export const credsAuth = (passcode: string, method: LoginMethod, reLogin?: boolean) => ({
  type: CREDS_AUTH,
  payload: {
    passcode,
    reLogin,
    method,
  },
});

export const changeAuthCred = (oldPasscode, newPasscode) => ({
  type: CHANGE_AUTH_CRED,
  payload: {
    oldPasscode,
    newPasscode,
  },
});

export const switchCredsChanged = () => ({
  type: SWITCH_CREDS_CHANGED,
});

// types and action creators (saga): dispatched by saga workers

export const credsAuthenticated = (isAuthenticated) => ({
  type: CREDS_AUTHENTICATED,
  payload: {
    isAuthenticated,
  },
});

export const credsChanged = (changed) => ({
  type: AUTH_CRED_CHANGED,
  payload: {
    changed,
  },
});

export const pinChangedFailed = (isFailed) => ({
  type: PIN_CHANGED_FAILED,
  payload: {
    isFailed,
  },
});
