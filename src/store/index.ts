import {
  addNewWalletsWatcher,
  autoWalletsSyncWatcher,
  feeAndExchangeRatesWatcher,
  generateSecondaryXprivWatcher,
  importNewWalletWatcher,
  refreshWalletsWatcher,
  resetTwoFAWatcher,
  syncWalletsWatcher,
  testcoinsWatcher,
  updateWalletSettingsWatcher,
  validateTwoFAWatcher,
} from './sagas/wallets';
import { all, call, spawn } from 'redux-saga/effects';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';

import walletsReducer from './reducers/wallets';
import { composeWithDevTools } from '@redux-devtools/extension';
import createSagaMiddleware from 'redux-saga';
import { reduxStorage } from 'src/storage';
import { setupKeeperAppWatcher } from './sagas/storage';

const config = {
  key: 'root',
  storage: reduxStorage,
};

const rootSaga = function* () {
  const sagas = [
    // storage watchers
    setupKeeperAppWatcher,

    // wallet watchers
    syncWalletsWatcher,
    testcoinsWatcher,
    generateSecondaryXprivWatcher,
    resetTwoFAWatcher,
    feeAndExchangeRatesWatcher,
    refreshWalletsWatcher,
    addNewWalletsWatcher,
    importNewWalletWatcher,
    autoWalletsSyncWatcher,
    validateTwoFAWatcher,
    updateWalletSettingsWatcher,
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
  wallet: walletsReducer,
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
