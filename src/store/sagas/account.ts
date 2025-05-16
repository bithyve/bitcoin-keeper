import { put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';

import { RootState } from '../store';
import { loadConciergeTickets, loadConciergeUser } from '../reducers/concierge';
import { LOAD_CONCIERGE_USER_ON_LOGIN } from '../sagaActions/account';

function* loadConciergeUserOnLoginWorker({ payload }) {
  try {
    const { conciergeUsers } = yield select((state: RootState) => state.account);
    if (Object.keys(conciergeUsers).length) {
      // at least primary account is created
      const existingConciergeUser = conciergeUsers[payload.appId]
        ? JSON.parse(conciergeUsers[payload.appId])
        : null;
      yield put(loadConciergeUser(existingConciergeUser));
      yield put(loadConciergeTickets([]));
    } else {
      // TODO: if concierge user exists | set save it to accounts
      console.log('ELSE ELSE');
    }
  } catch (error) {
    console.log('🚀 ~ function*loadConciergeUserOnLoginWorker ~ error:', error);
  }
}

export const loadConciergeUserOnLoginWatcher = createWatcher(
  loadConciergeUserOnLoginWorker,
  LOAD_CONCIERGE_USER_ON_LOGIN
);
