export const SETUP_KEEPER_APP = 'SETUP_KEEPER_APP';
export const SET_APP_ID = 'SET_APP_ID';

export const setupKeeperApp = (appName?: string) => {
  return {
    type: SETUP_KEEPER_APP,
    payload: {
      appName,
    },
  };
};

export const setAppId = (appId?: string) => {
  return {
    type: SET_APP_ID,
    payload: {
      appId,
    },
  };
};
