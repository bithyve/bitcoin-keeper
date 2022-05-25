import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';

export const UPDATE_KEEPER_APP = 'UPDATE_KEEPER_APP';
export const SETUP_KEEPER_APP = 'SETUP_KEEPER_APP';

export const updateKeeperApp = (app: KeeperApp) => {
  return {
    type: UPDATE_KEEPER_APP,
    payload: {
      app,
    },
  };
};

export const setupKeeperApp = (appName?: string) => {
  return {
    type: SETUP_KEEPER_APP,
    payload: {
      appName,
    },
  };
};
