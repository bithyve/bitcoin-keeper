import {combineReducers} from 'redux';
import {persistReducer} from 'redux-persist';
import {reduxStorage} from '../../storage/index';

const persistConfig = {
  key: 'root',
  storage: reduxStorage,
};

//update reducers when created
const rootReducer = persistReducer(persistConfig, () => {});

export default rootReducer;
