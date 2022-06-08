import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './reducers/settings'
import loginReducer from './reducers/login'
import storageReducer from './reducers/storage'
import walletReducer from './reducers/wallets'
import notificationsReducer from './reducers/notifications'
import { combineReducers } from 'redux'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, } from 'redux-persist'
import { reduxStorage } from 'src/storage';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from './sagas'

const rootReducer = combineReducers({
  settings: settingsReducer,
  login: loginReducer,
  storage: storageReducer,
  wallet: walletReducer,
  notifications: notificationsReducer
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  blacklist: ['login'],
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer)
const sagaMiddleware = createSagaMiddleware()
const middlewars = [sagaMiddleware]

if (__DEV__) {
  const createDebugger = require('redux-flipper').default;
  middlewars.push(createDebugger());
}

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(middlewars),
})

sagaMiddleware.run(rootSaga)
export const persistor = persistStore(store);
