import { applyMiddleware, createStore, combineReducers } from 'redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import createSagaMiddleware from 'redux-saga'
import { call, all, spawn } from 'redux-saga/effects'
import { composeWithDevTools } from '@redux-devtools/extension'
import { persistStore, persistReducer } from 'redux-persist'
import accountsReducer from './reducers/accounts'
import storageReducer from './reducers/storage'
import { addNewAccountShellsWatcher, importNewAccountWatcher, syncAccountsWatcher } from './sagas/accounts'
import { setupWalletWatcher } from './sagas/storage'
console.log({ syncAccountsWatcher })

const config = {
  key: 'root',
  storage: AsyncStorage,
}

const rootSaga = function* () {
  const sagas = [
    // storage watchers
    setupWalletWatcher,

    // account watchers
    addNewAccountShellsWatcher,
    syncAccountsWatcher,
    importNewAccountWatcher
  ]

  yield all(
    sagas.map( ( saga ) =>
      spawn( function* () {
        while ( true ) {
          try {
            yield call( saga )
            break
          } catch ( err ) {
            console.log( err )
          }
        }
      } )
    )
  )
}

const rootReducer = combineReducers( {
  storage: storageReducer,
  accounts: accountsReducer,
} )

export default function makeStore() {
  const sagaMiddleware = createSagaMiddleware()
  const reducers = persistReducer( config, rootReducer )
  const storeMiddleware = composeWithDevTools(
    applyMiddleware( sagaMiddleware )
  )
  const store = createStore( reducers, storeMiddleware )
  persistStore( store )
  sagaMiddleware.run( rootSaga )
  return store
}
