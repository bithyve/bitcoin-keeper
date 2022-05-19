import { Wallet } from 'src/common/data/models/interfaces/Wallet';
import { UPDATE_WALLET } from '../actions/storage';

const initialState: {
  wallet: Wallet;
} = {
  wallet: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_WALLET:
      return {
        ...state,
        wallet: action.payload.wallet,
      };
  }
  return state;
};
