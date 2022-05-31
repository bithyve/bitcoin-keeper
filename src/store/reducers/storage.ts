import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { UPDATE_KEEPER_APP } from '../actions/storage';

const initialState: {
  app: KeeperApp;
} = {
  app: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_KEEPER_APP:
      return {
        ...state,
        app: action.payload.app,
      };
  }
  return state;
};
