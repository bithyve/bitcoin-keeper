export const SETUP_KEEPER_APP = 'SETUP_KEEPER_APP';
export const SETUP_KEEPER_APP_VAULT_RECOVERY = 'SETUP_KEEPER_APP_VAULT_RECOVERY';
export const SET_APP_ID = 'SET_APP_ID';
export const SET_PIN_RESET_CREDS = 'SET_PIN_RESET_CREDS';
export const INCREASE_PIN_FAIL_ATTEMTS = 'INCREASE_PIN_FAIL_ATTEMTS';
export const RESET_PIN_FAIL_ATTEMTS = 'RESET_PIN_FAIL_ATTEMTS';
export const KEY_FETCHED = 'KEY_FETCHED';

export const setupKeeperApp = (appName?: string) => {
  return {
    type: SETUP_KEEPER_APP,
    payload: {
      appName,
    },
  };
};

export const setupKeeperAppVaultReovery = (vaultShellInstances, subscription, appName?) => {
  return {
    type: SETUP_KEEPER_APP_VAULT_RECOVERY,
    payload: {
      vaultShellInstances,
      subscription,
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

export const setPinResetCreds = (hash: string, index: number) => {
  return {
    type: SET_PIN_RESET_CREDS,
    payload: {
      hash,
      index,
    },
  };
};

export const increasePinFailAttempts = () => {
  return {
    type: INCREASE_PIN_FAIL_ATTEMTS,
    payload: {},
  };
};

export const resetPinFailAttempts = () => {
  return {
    type: RESET_PIN_FAIL_ATTEMTS,
    payload: {},
  };
};

export const keyFetched = (key) => {
  return {
    type: KEY_FETCHED,
    payload: {
      key,
    },
  };
};
