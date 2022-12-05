import { persistReducer, persistStore } from 'redux-persist';

import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { reduxStorage } from 'src/storage';
import loginReducer from './reducers/login';
import notificationsReducer from './reducers/notifications';
import bhrReducer from './reducers/bhr';
import { rootSaga } from './sagas';
import sendAndReceiveReducer from './reducers/send_and_receive';
import settingsReducer from './reducers/settings';
import storageReducer from './reducers/storage';
import vaultReducer from './reducers/vaults';
import walletReducer from './reducers/wallets';

export const rootReducer = combineReducers({
  settings: settingsReducer,
  login: loginReducer,
  storage: storageReducer,
  wallet: walletReducer,
  sendAndReceive: sendAndReceiveReducer,
  notifications: notificationsReducer,
  bhr: bhrReducer,
  vault: vaultReducer,
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
