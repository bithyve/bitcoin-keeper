import { put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';

import { RootState } from '../store';
import { loadConciergeTickets, loadConciergeUser } from '../reducers/concierge';
import { LOAD_CONCIERGE_USER_ON_LOGIN } from '../sagaActions/account';
import { addConciergeUserToAccount } from '../reducers/account';

function* loadConciergeUserOnLoginWorker({ payload }) {
  try {
    const { conciergeUsers } = yield select((state: RootState) => state.account);
    if (!Object.keys(conciergeUsers).length) {
      // Only primary account exists | need to save its value
      let { conciergeUser } = yield select((state: RootState) => state.concierge);
      conciergeUser = conciergeUser ? JSON.stringify(conciergeUser) : null;
      yield put(addConciergeUserToAccount({ appId: payload.appId, conciergeUser }));
    } else {
      const existingConciergeUser = conciergeUsers[payload.appId]
        ? JSON.parse(conciergeUsers[payload.appId])
        : null;
      yield put(loadConciergeUser(existingConciergeUser));
      yield put(loadConciergeTickets([]));
    }
  } catch (error) {
    console.log('🚀 ~ function*loadConciergeUserOnLoginWorker ~ error:', error);
  }
}

export const loadConciergeUserOnLoginWatcher = createWatcher(
  loadConciergeUserOnLoginWorker,
  LOAD_CONCIERGE_USER_ON_LOGIN
);
