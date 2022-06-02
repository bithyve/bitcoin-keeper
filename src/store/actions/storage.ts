export const SETUP_KEEPER_APP = 'SETUP_KEEPER_APP';

export const setupKeeperApp = (appName?: string) => {
  return {
    type: SETUP_KEEPER_APP,
    payload: {
      appName,
    },
  };
};
