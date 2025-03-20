// types and action creators: dispatched by components and sagas
export const UPDATE_FCM_TOKENS = 'UPDATE_FCM_TOKENS';

export const updateFCMTokens = (FCMs: string[]) => ({
  type: UPDATE_FCM_TOKENS,
  payload: {
    FCMs,
  },
});
