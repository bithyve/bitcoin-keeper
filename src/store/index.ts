import { applyMiddleware, createStore, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { call, all, spawn } from 'redux-saga/effects'
import { composeWithDevTools } from '@redux-devtools/extension'
import { persistStore, persistReducer } from 'redux-persist'
import accountsReducer from './reducers/accounts'
import storageReducer from './reducers/storage'
import {
  testcoinsWatcher,
  syncAccountsWatcher,
  generateSecondaryXprivWatcher,
  resetTwoFAWatcher,
  addNewAccountShellsWatcher,
  importNewAccountWatcher,
  refreshAccountShellsWatcher,
  feeAndExchangeRatesWatcher,
  autoSyncShellsWatcher,
  validateTwoFAWatcher,
  updateAccountSettingsWatcher,
  restoreAccountShellsWatcher,
} from './sagas/accounts'

import { updateFCMTokensWatcher } from './sagas/notifications'
import notificationReducer from './reducers/notifications' 
import { setupWalletWatcher } from './sagas/storage'
import { reduxStorage  } from 'src/storage'

const config = {
  key: 'root',
  storage: reduxStorage,
}

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
    updateFCMTokensWatcher,
  ]

  yield all(
    sagas.map((saga) =>
      spawn(function* () {
        while (true) {
          try {
            yield call(saga)
            break
          } catch (err) {
            console.log(err)
          }
        }
      })
    )
  )
}

const rootReducer = combineReducers({
  storage: storageReducer,
  accounts: accountsReducer,
  notifications: notificationReducer,
})

export default function makeStore() {
  const sagaMiddleware = createSagaMiddleware()
  const reducers = persistReducer(config, rootReducer)
  const storeMiddleware = composeWithDevTools(
    applyMiddleware(sagaMiddleware)
  )
  const store = createStore(reducers, storeMiddleware)
  persistStore(store)
  sagaMiddleware.run(rootSaga)
  return store
}
