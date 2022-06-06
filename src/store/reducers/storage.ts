import { SET_APP_ID } from '../actions/storage'

const initialState: {
  appId: string;
} = {
  appId: '',
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_APP_ID:
      return {
        ...state,
        appId: action.payload.appId,
      }
  }

  return state
}
