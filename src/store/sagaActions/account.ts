export const LOAD_CONCIERGE_USER_ON_LOGIN = 'LOAD_CONCIERGE_USER_ON_LOGIN';

export const loadConciergeUserOnLogin = ({ appId, conciergeUser = null }) => ({
  type: LOAD_CONCIERGE_USER_ON_LOGIN,
  payload: {
    appId,
    conciergeUser,
  },
});
