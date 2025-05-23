export const SETUP_KEEPER_APP = 'SETUP_KEEPER_APP';
export const SET_APP_ID = 'SET_APP_ID';
export const INCREASE_PIN_FAIL_ATTEMTS = 'INCREASE_PIN_FAIL_ATTEMTS';
export const FETCH_SIGNED_DELAYED_TRANSACTION = 'FETCH_SIGNED_DELAYED_TRANSACTION';
export const FETCH_DELAYED_POLICY_UPDATE = 'FETCH_DELAYED_POLICY_UPDATE';

export const setupKeeperApp = (fcmToken: string = '', appName: string = '') => ({
  type: SETUP_KEEPER_APP,
  payload: {
    appName,
    fcmToken,
  },
});

export const setAppId = (appId?: string) => ({
  type: SET_APP_ID,
  payload: {
    appId,
  },
});

export const increasePinFailAttempts = () => ({
  type: INCREASE_PIN_FAIL_ATTEMTS,
  payload: {},
});

export const fetchSignedDelayedTransaction = () => ({
  type: FETCH_SIGNED_DELAYED_TRANSACTION,
});

export const fetchDelayedPolicyUpdate = () => ({
  type: FETCH_DELAYED_POLICY_UPDATE,
});
