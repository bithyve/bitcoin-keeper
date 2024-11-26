import LoginMethod from 'src/models/enums/LoginMethod';

export const STORE_CREDS = 'STORE_CREDS';
export const CREDS_AUTH = 'CREDS_AUTH';
export const SETUP_WALLET = 'SETUP_WALLET';

export const WALLET_SETUP_COMPLETION = 'WALLET_SETUP_COMPLETION';
export const SET_DISPLAY_PICTURE = 'SET_DISPLAY_PICTURE';
export const INIT_RECOVERY = 'INIT_RECOVERY';
export const RE_LOGIN = 'RE_LOGIN';
export const CHANGE_AUTH_CRED = 'CHANGE_AUTH_CRED';
export const RESET_PIN = 'RESET_PIN';
export const SET_LOGIN_METHOD = 'SET_LOGIN_METHOD';
export const GENERATE_SEED_HASH = 'GENERATE_SEED_HASH';
export const CHANGE_LOGIN_METHOD = 'CHANGE_LOGIN_METHOD';
export const UPDATE_WALLET_NAME = 'UPDATE_WALLET_NAME';
export const SWITCH_CREDS_CHANGED = 'SWITCH_CREDS_CHANGED';
export const SWITCH_APP_STATUS = 'SWITCH_APP_STATUS';
export const INIT_RECOVERY_COMPLETED = 'INIT_RECOVERY_COMPLETED';

export const storeCreds = (passcode) => ({
  type: STORE_CREDS,
  payload: {
    passcode,
  },
});

export const generateSeedHash = () => ({
  type: GENERATE_SEED_HASH,
});

export const changeLoginMethod = (method: LoginMethod, pubKey: string = '') => ({
  type: CHANGE_LOGIN_METHOD,
  payload: {
    method,
    pubKey,
  },
});

export const setLoginMethod = (method: LoginMethod) => ({
  type: SET_LOGIN_METHOD,
  payload: {
    method,
  },
});

export const credsAuth = (passcode: string, method: LoginMethod, reLogin?: boolean) => ({
  type: CREDS_AUTH,
  payload: {
    passcode,
    reLogin,
    method,
  },
});

export const setupWallet = (
  walletName: string,
  security: { questionId: string; question: string; answer: string },
  displayPicture?: string
) => ({
  type: SETUP_WALLET,
  payload: {
    walletName,
    security,
    displayPicture,
  },
});

export const setupDisplayPicture = (uri: string) => ({
  type: SET_DISPLAY_PICTURE,
  payload: {
    uri,
  },
});

export const updateWalletNameAndPicture = (newName: string, newUri = '') => ({
  type: UPDATE_WALLET_NAME,
  payload: {
    newName,
    newUri,
  },
});

export const walletSetupCompletion = (security) => ({
  type: WALLET_SETUP_COMPLETION,
  payload: {
    security,
  },
});

export const initializeRecovery = (walletName, security) => ({
  type: INIT_RECOVERY,
  payload: {
    walletName,
    security,
  },
});

export const initializeRecoveryCompleted = (initializeRecoveryCompleted) => ({
  type: INIT_RECOVERY_COMPLETED,
  payload: {
    initializeRecoveryCompleted,
  },
});

export const switchReLogin = (loggedIn, reset?) => ({
  type: RE_LOGIN,
  payload: {
    loggedIn,
    reset,
  },
});

export const changeAuthCred = (oldPasscode, newPasscode) => ({
  type: CHANGE_AUTH_CRED,
  payload: {
    oldPasscode,
    newPasscode,
  },
});

export const resetPin = (newPasscode) => ({
  type: RESET_PIN,
  payload: {
    newPasscode,
  },
});

export const switchCredsChanged = () => ({
  type: SWITCH_CREDS_CHANGED,
});

// types and action creators (saga): dispatched by saga workers

export const CREDS_STORED = 'CREDS_STORED';
export const CREDS_AUTHENTICATED = 'CREDS_AUTHENTICATED';
export const COMPLETED_WALLET_SETUP = 'COMPLETED_WALLET_SETUP';
export const WALLET_SETUP_FAILED = 'WALLET_SETUP_FAILED';
export const SETUP_LOADING = 'SETUP_LOADING';
export const AUTH_CRED_CHANGED = 'AUTH_CRED_CHANGED';
export const PIN_CHANGED_FAILED = 'PIN_CHANGED_FAILED';

export const credsStored = () => ({
  type: CREDS_STORED,
});

export const credsAuthenticated = (isAuthenticated) => ({
  type: CREDS_AUTHENTICATED,
  payload: {
    isAuthenticated,
  },
});

export const switchAppStatus = () => ({
  type: SWITCH_APP_STATUS,
});

export const completedWalletSetup = () => ({
  type: COMPLETED_WALLET_SETUP,
});

export const walletSetupFailed = () => ({
  type: WALLET_SETUP_FAILED,
});

export const switchSetupLoader = (beingLoaded) => ({
  type: SETUP_LOADING,
  payload: {
    beingLoaded,
  },
});

export const credsChanged = (changed) => ({
  type: AUTH_CRED_CHANGED,
  payload: {
    changed,
  },
});

export const pinChangedFailed = (isFailed) => ({
  type: PIN_CHANGED_FAILED,
  payload: {
    isFailed,
  },
});

export const validatePin = (passcode) => async (dispatch) => {
  let key;
  let error;
  try {
    dispatch(credsAuthenticated(true));
  } catch (error) {
    console.log(error);
    dispatch(credsAuthenticated(false));
  }
  return {
    error,
    key,
  };
};
