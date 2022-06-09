export const STORE_CREDS = 'STORE_CREDS'
export const CREDS_AUTH = 'CREDS_AUTH'
export const SETUP_WALLET = 'SETUP_WALLET'

export const WALLET_SETUP_COMPLETION = 'WALLET_SETUP_COMPLETION'
export const SET_DISPLAY_PICTURE = 'SET_DISPLAY_PICTURE'
export const INIT_RECOVERY = 'INIT_RECOVERY'
export const RE_LOGIN = 'RE_LOGIN'
export const CHANGE_AUTH_CRED = 'CHANGE_AUTH_CRED'
export const RESET_PIN = 'RESET_PIN'
export const SET_LOGIN_METHOD = 'SET_LOGIN_METHOD'
export const CHANGE_LOGIN_METHOD = 'CHANGE_LOGIN_METHOD'
export const UPDATE_WALLET_NAME = 'UPDATE_WALLET_NAME'
export const SWITCH_CREDS_CHANGED = 'SWITCH_CREDS_CHANGED'
export const INIT_RECOVERY_COMPLETED = 'INIT_RECOVERY_COMPLETED'
import LoginMethod from 'src/common/data/enums/LoginMethod'


export const storeCreds = passcode => {
  return {
    type: STORE_CREDS, payload: {
      passcode
    }
  }
}

export const changeLoginMethod = (method: LoginMethod, pubKey: string = '') => {
  return {
    type: CHANGE_LOGIN_METHOD, payload: {
      method, pubKey
    }
  }
}

export const setLoginMethod = (method: LoginMethod) => {
  return {
    type: SET_LOGIN_METHOD, payload: {
      method
    }
  }
}

export const credsAuth = (passcode: string, method: LoginMethod, reLogin?: boolean) => {
  return {
    type: CREDS_AUTH, payload: {
      passcode, reLogin, method
    }
  }
}


export const setupWallet = (walletName: string, security: { questionId: string, question: string, answer: string }, displayPicture?: string) => {
  return {
    type: SETUP_WALLET, payload: {
      walletName, security, displayPicture
    }
  }
}

export const setupDisplayPicture = (uri: string) => {
  return {
    type: SET_DISPLAY_PICTURE,
    payload: {
      uri
    }
  }
}

export const updateWalletNameAndPicture = (newName: string, newUri = '') => {
  return {
    type: UPDATE_WALLET_NAME,
    payload: {
      newName, newUri
    }
  }
}

export const walletSetupCompletion = (security) => {
  return {
    type: WALLET_SETUP_COMPLETION,
    payload: {
      security
    }
  }
}

export const initializeRecovery = (walletName, security) => {
  return {
    type: INIT_RECOVERY, payload: {
      walletName, security
    }
  }
}

export const initializeRecoveryCompleted = (initializeRecoveryCompleted) => {
  return {
    type: INIT_RECOVERY_COMPLETED, payload: {
      initializeRecoveryCompleted
    }
  }
}

export const switchReLogin = (loggedIn, reset?) => {
  return {
    type: RE_LOGIN, payload: {
      loggedIn, reset
    }
  }
}

export const changeAuthCred = (oldPasscode, newPasscode) => {
  return {
    type: CHANGE_AUTH_CRED, payload: {
      oldPasscode, newPasscode
    }
  }
}

export const resetPin = (newPasscode) => {
  return {
    type: RESET_PIN, payload: {
      newPasscode
    }
  }
}

export const switchCredsChanged = () => {
  return {
    type: SWITCH_CREDS_CHANGED
  }
}

// types and action creators (saga): dispatched by saga workers

export const CREDS_STORED = 'CREDS_STORED'
export const CREDS_AUTHENTICATED = 'CREDS_AUTHENTICATED'
export const COMPLETED_WALLET_SETUP = 'COMPLETED_WALLET_SETUP'
export const WALLET_SETUP_FAILED = 'WALLET_SETUP_FAILED'
export const SETUP_LOADING = 'SETUP_LOADING'
export const AUTH_CRED_CHANGED = 'AUTH_CRED_CHANGED'
export const PIN_CHANGED_FAILED = 'PIN_CHANGED_FAILED'
export const UPDATE_APPLICATION = 'UPDATE_APPLICATION'

export const credsStored = () => {
  return {
    type: CREDS_STORED
  }
}

export const credsAuthenticated = isAuthenticated => {
  return {
    type: CREDS_AUTHENTICATED, payload: {
      isAuthenticated
    }
  }
}

export const completedWalletSetup = () => {
  return {
    type: COMPLETED_WALLET_SETUP,
  }
}

export const walletSetupFailed = () => {
  return {
    type: WALLET_SETUP_FAILED,
  }
}

export const switchSetupLoader = beingLoaded => {
  return {
    type: SETUP_LOADING, payload: {
      beingLoaded
    }
  }
}

export const credsChanged = changed => {
  return {
    type: AUTH_CRED_CHANGED, payload: {
      changed
    }
  }
}

export const pinChangedFailed = isFailed => {
  return {
    type: PIN_CHANGED_FAILED, payload: {
      isFailed
    }
  }
}

export const validatePin = (passcode) => {
  return async (dispatch) => {
    let key
    let error
    try {
      dispatch(credsAuthenticated(true))

    } catch (error) {
      console.log(error)
      dispatch(credsAuthenticated(false))
    }
    return {
      error, key
    }
  }
}

export const updateApplication = (newVersion: string, previousVersion: string) => {
  return {
    type: UPDATE_APPLICATION,
    payload: {
      newVersion, previousVersion
    }
  }
}
