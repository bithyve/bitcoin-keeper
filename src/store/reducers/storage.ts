import {
  SET_APP_ID,
  SET_PIN_RESET_CREDS,
  RESET_PIN_FAIL_ATTEMTS,
  INCREASE_PIN_FAIL_ATTEMTS,
  KEY_FETCHED
} from '../actions/storage'

const initialState: {
  appId: string;
  resetCred: {
    hash: string,
    index: number
  },
  failedAttempts: number,
  lastLoginFailedAt: number,
  key: string
} = {
  appId: '',
  resetCred: {
    hash: '',
    index: null
  },
  failedAttempts: 0,
  lastLoginFailedAt: null,
  key: ''
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_APP_ID:
      return {
        ...state,
        appId: action.payload.appId,
      }
    case SET_PIN_RESET_CREDS:
      return {
        ...state,
        resetCred: {
          hash: action.payload.hash,
          index: action.payload.index
        }
      }
    case INCREASE_PIN_FAIL_ATTEMTS:
      return {
        ...state,
        failedAttempts: state.failedAttempts + 1,
        lastLoginFailedAt: Date.now()
      }
    case RESET_PIN_FAIL_ATTEMTS:
      return {
        ...state,
        failedAttempts: 0,
        lastLoginFailedAt: null
      }
    case KEY_FETCHED:
      return {
        ...state,
        key: action.payload.key,
      }
  }

  return state
}
