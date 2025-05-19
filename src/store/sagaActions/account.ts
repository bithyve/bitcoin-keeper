export const LOAD_CONCIERGE_USER_ON_LOGIN = 'LOAD_CONCIERGE_USER_ON_LOGIN';
export const SAVE_BACKUP_METHOD_BY_APP_ID = 'SAVE_BACKUP_METHOD_BY_APP_ID';

export const loadConciergeUserOnLogin = ({ appId, conciergeUser = null }) => ({
  type: LOAD_CONCIERGE_USER_ON_LOGIN,
  payload: {
    appId,
    conciergeUser,
  },
});
export const saveBackupMethodByAppId = () => ({
  type: SAVE_BACKUP_METHOD_BY_APP_ID,
});
