export const SETUP_KEEPER_APP = 'SETUP_KEEPER_APP';
export const SETUP_KEEPER_APP_VAULT_RECOVERY = 'SETUP_KEEPER_APP_VAULT_RECOVERY';
export const SET_APP_ID = 'SET_APP_ID';
export const SET_PIN_RESET_CREDS = 'SET_PIN_RESET_CREDS';
export const INCREASE_PIN_FAIL_ATTEMTS = 'INCREASE_PIN_FAIL_ATTEMTS';
export const RESET_PIN_FAIL_ATTEMTS = 'RESET_PIN_FAIL_ATTEMTS';
export const KEY_FETCHED = 'KEY_FETCHED';
export const FETCH_SIGNED_DELAYED_TRANSACTION = 'FETCH_SIGNED_DELAYED_TRANSACTION';

export const setupKeeperApp = (fcmToken: string = '', appName: string = '') => ({
  type: SETUP_KEEPER_APP,
  payload: {
    appName,
    fcmToken,
  },
});

export const setupKeeperAppVaultReovery = (subscription, appName?) => ({
  type: SETUP_KEEPER_APP_VAULT_RECOVERY,
  payload: {
    subscription,
    appName,
  },
});

export const setAppId = (appId?: string) => ({
  type: SET_APP_ID,
  payload: {
    appId,
  },
});

export const setPinResetCreds = (hash: string, index: number) => ({
  type: SET_PIN_RESET_CREDS,
  payload: {
    hash,
    index,
  },
});

export const increasePinFailAttempts = () => ({
  type: INCREASE_PIN_FAIL_ATTEMTS,
  payload: {},
});

export const resetPinFailAttempts = () => ({
  type: RESET_PIN_FAIL_ATTEMTS,
  payload: {},
});

export const keyFetched = (key) => ({
  type: KEY_FETCHED,
  payload: {
    key,
  },
});

export const fetchSignedDelayedTransaction = () => ({
  type: FETCH_SIGNED_DELAYED_TRANSACTION,
});
