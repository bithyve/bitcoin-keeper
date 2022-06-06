import {
    CREDS_STORED,
    CREDS_AUTHENTICATED,
    COMPLETED_WALLET_SETUP,
    SETUP_LOADING,
    RE_LOGIN,
    AUTH_CRED_CHANGED,
    SWITCH_CREDS_CHANGED,
    PIN_CHANGED_FAILED,
    INIT_RECOVERY_COMPLETED,
    WALLET_SETUP_FAILED,
    COMPLETED_PASSWORD_RESET
} from '../actions/login'

const initialState: {
    hasCreds: Boolean;
    isAuthenticated: Boolean;
    authenticationFailed: Boolean;
    walletSetupCompleted: Boolean;
    walletSetupFailed: Boolean;
    reLogin: Boolean;
    loading: {
        initializing: Boolean;
        storingCreds: Boolean;
        authenticating: Boolean;
    };
    credsChanged: string;
    pinChangedFailed: Boolean;
    initializeRecoveryCompleted: boolean;
} = {
    hasCreds: false,
    isAuthenticated: false,
    authenticationFailed: false,
    walletSetupCompleted: false,
    walletSetupFailed: false,
    reLogin: false,
    loading: {
        initializing: false,
        storingCreds: false,
        authenticating: false,
    },
    credsChanged: '',
    pinChangedFailed: false,
    initializeRecoveryCompleted: false,
}

export default (state = initialState, action) => {
    switch (action.type) {
        case CREDS_STORED:
            return {
                ...state,
                hasCreds: true,
                loading: false,
                storingCreds: false,
            }
        case CREDS_AUTHENTICATED:
            return {
                ...state,
                isAuthenticated: action.payload.isAuthenticated,
                authenticationFailed: !action.payload.isAuthenticated,
                loading: false,
                authenticating: false
            }
        case SETUP_LOADING:
            const authenticationFailed = action.payload.beingLoaded === 'authenticating' &&
                !state.loading[action.payload.beingLoaded] === true
                ? false
                : state.authenticationFailed
            return {
                ...state,
                authenticationFailed: authenticationFailed,
                loading: action.payload.beingLoaded
            }
        case RE_LOGIN:
            return {
                ...state,
                reLogin: action.payload.loggedIn,
                authenticationFailed: action.payload.reset
                    ? false
                    : !action.payload.loggedIn,
                loading: false,
                authenticating: false
            }

        case AUTH_CRED_CHANGED:
            return {
                ...state,
                credsChanged: action.payload.changed
            }

        case SWITCH_CREDS_CHANGED:
            return {
                ...state,
            }

        case PIN_CHANGED_FAILED:
            return {
                ...state,
                pinChangedFailed: action.payload.isFailed
            }

        case INIT_RECOVERY_COMPLETED:
            return {
                ...state,
                initializeRecoveryCompleted: action.payload.initializeRecoveryCompleted,
            }
    }

    return state
}
