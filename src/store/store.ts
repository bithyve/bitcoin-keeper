import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './reducers/settings';
import loginReducer from './reducers/login';
import storageReducer from './reducers/storage';
import walletReducer from './reducers/wallets';
import notificationsReducer from './reducers/notifications';
import bhrReducer from './reducers/bhr';
import sendAndReceiveReducer from './reducers/send_and_receive';
import { combineReducers } from 'redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { reduxStorage } from 'src/storage';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './sagas';

const rootReducer = combineReducers({
  settings: settingsReducer,
  login: loginReducer,
  storage: storageReducer,
  wallet: walletReducer,
  sendAndReceive: sendAndReceiveReducer,
  notifications: notificationsReducer,
  bhr: bhrReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  blacklist: ['login', 'bhr'],
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const sagaMiddleware = createSagaMiddleware();
const middlewars = [sagaMiddleware];

if (__DEV__) {
  const createDebugger = require('redux-flipper').default;
  middlewars.push(createDebugger());
}

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(middlewars),
});

sagaMiddleware.run(rootSaga);
export const persistor = persistStore(store);
