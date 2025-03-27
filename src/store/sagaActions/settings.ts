import LoginMethod from 'src/models/enums/LoginMethod';
import { NetworkType } from 'src/services/wallets/enums';

export const SET_LOGIN_METHOD = 'SET_LOGIN_METHOD';
export const CHANGE_BITCOIN_NETWORK = 'CHANGE_BITCOIN_NETWORK';

export const setLoginMethod = (method: LoginMethod) => ({
  type: SET_LOGIN_METHOD,
  payload: {
    method,
  },
});

export const changeBitcoinNetwork = (network: NetworkType) => ({
  type: CHANGE_BITCOIN_NETWORK,
  payload: { network },
});