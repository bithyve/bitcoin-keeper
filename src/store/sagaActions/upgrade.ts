export const RESET_REDUX_STORE = 'RESET_REDUX_STORE';
export const UPDATE_VERSION_HISTORY = 'UPDATE_VERSION_HISTORY';

export const resetReduxStore = () => ({
  type: RESET_REDUX_STORE,
});

export const updateVersionHistory = (previousVersion, newVersion) => ({
  type: UPDATE_VERSION_HISTORY,
  payload: { previousVersion, newVersion },
});
