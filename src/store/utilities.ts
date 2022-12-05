import { take, fork } from 'redux-saga/effects'

export const createWatcher = ( worker: any, type: any ) => function* (): any {
    while ( true ) {
      const action = yield take( type )
      yield fork( worker, action )
    }
  }