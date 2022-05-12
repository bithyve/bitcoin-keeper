import {
  addNewAccountShellsWatcher,
  autoSyncShellsWatcher,
  feeAndExchangeRatesWatcher,
  generateSecondaryXprivWatcher,
  importNewAccountWatcher,
  refreshAccountShellsWatcher,
  resetTwoFAWatcher,
  restoreAccountShellsWatcher,
  syncAccountsWatcher,
  testcoinsWatcher,
  updateAccountSettingsWatcher,
  validateTwoFAWatcher,
} from './sagas/accounts';
import { all, call, spawn } from 'redux-saga/effects';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';

import accountsReducer from './reducers/accounts';
import { composeWithDevTools } from '@redux-devtools/extension';
import createSagaMiddleware from 'redux-saga';
import { reduxStorage } from 'src/storage';
import { setupWalletWatcher } from './sagas/storage';
import storageReducer from './reducers/storage';

const config = {
  key: 'root',
  storage: reduxStorage,
};

const rootSaga = function* () {
  const sagas = [
    // storage watchers
    setupWalletWatcher,

    // accounts watchers
    syncAccountsWatcher,
    testcoinsWatcher,
    generateSecondaryXprivWatcher,
    resetTwoFAWatcher,
    feeAndExchangeRatesWatcher,
    refreshAccountShellsWatcher,
    addNewAccountShellsWatcher,
    importNewAccountWatcher,
    restoreAccountShellsWatcher,
    autoSyncShellsWatcher,
    validateTwoFAWatcher,
    updateAccountSettingsWatcher,
  ];

  yield all(
    sagas.map((saga) =>
      spawn(function* () {
        while (true) {
          try {
            yield call(saga);
            break;
          } catch (err) {
            console.log(err);
          }
        }
      })
    )
  );
};

const rootReducer = combineReducers({
  storage: storageReducer,
  accounts: accountsReducer,
});

export default function makeStore() {
  const sagaMiddleware = createSagaMiddleware();
  const reducers = persistReducer(config, rootReducer);
  const middlewars = [sagaMiddleware];
  if (__DEV__) {
    const createDebugger = require('redux-flipper').default;
    middlewars.push(createDebugger());
  }
  const storeMiddleware = composeWithDevTools(applyMiddleware(...middlewars));
  const store = createStore(reducers, storeMiddleware);
  persistStore(store);
  sagaMiddleware.run(rootSaga);
  return store;
}
