import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import {
  ADD_TICKET_STATUS_UAI,
  LOAD_CONCIERGE_USER,
  SCHEDULE_ONBOARDING_CALL,
} from '../sagaActions/concierge';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import { RootState } from '../store';
import {
  loadConciergeUser,
  conciergeUser,
  setConciergeLoading,
  setConciergeUserSuccess,
  setConciergeUserFailed,
  setOnboardCallFailed,
  setOnboardCallSuccess,
  setOnboardCallScheduled,
} from '../reducers/concierge';
import { hash256 } from 'src/utils/service-utilities/encryption';
import ZendeskClass from 'src/services/backend/Zendesk';
import Relay from 'src/services/backend/Relay';
import { addToUaiStack } from '../sagaActions/uai';
import { uaiType } from 'src/models/interfaces/Uai';

function* loadConciergeUserWorker() {
  try {
    const { primaryMnemonic, id }: KeeperApp = yield call(
      dbManager.getObjectByIndex,
      RealmSchema.KeeperApp
    );
    const { fcmToken } = yield select((state: RootState) => state.notifications);
    let userExternalId = yield call(hash256, primaryMnemonic);
    userExternalId = userExternalId.toString().substring(0, 24);
    yield put(setConciergeLoading(true));

    let res = yield call(ZendeskClass.fetchZendeskUser, userExternalId);
    if (res?.data?.users?.length == 0) {
      // User not found | create user
      res = yield call(ZendeskClass.createZendeskUser, userExternalId);
    }
    if (res.status === 201 || res.status === 200) {
      // success
      const user = res.data?.users ? res.data.users[0] : res.data.user;
      const data: conciergeUser = {
        id: user.id,
        name: user.name,
        userExternalId: user.external_id,
      };
      const relayData = {
        appID: id,
        FCM: fcmToken,
        externalId: data.id, // userId to be utilized here
      };
      yield put(loadConciergeUser(data));
      yield call(Relay.updateZendeskExternalId, relayData);
      yield put(setConciergeLoading(false));
      yield put(setConciergeUserSuccess(true));
    } else {
      // failure
      yield put(setConciergeLoading(false));
      yield put(setConciergeUserFailed(true));
    }
  } catch (error) {
    console.log('🚀 ~ function*loadConciergeUserWorker ~ error:', error);
    yield put(setConciergeUserFailed(true));
    yield put(setConciergeLoading(false));
  }
}

function* addTicketStatusUAIWorker({
  payload,
}: {
  payload: { ticketId: string; title: string; body: string };
}) {
  const { ticketId, title, body } = payload;
  try {
    yield put(
      addToUaiStack({
        uaiType: uaiType.ZENDESK_TICKET,
        entityId: ticketId,
        uaiDetails: { heading: title, body },
      })
    );
  } catch (error) {
    console.log('🚀 ~ function*addTicketStatusUAIWorker ~ error:', error);
  }
}

function* scheduleOnboardingCallWorker({ payload }) {
  try {
    yield put(setConciergeLoading(true));
    let res = yield call(ZendeskClass.createZendeskTicket, { onboardEmail: payload });
    if (res.status === 201) {
      yield put(setOnboardCallSuccess(true));
      yield put(setOnboardCallScheduled(true));
    }
  } catch (error) {
    yield put(setOnboardCallFailed(true));
  } finally {
    yield put(setConciergeLoading(false));
  }
}

export const loadConciergeUserWatcher = createWatcher(loadConciergeUserWorker, LOAD_CONCIERGE_USER);
export const addTicketStatusUAIWatcher = createWatcher(
  addTicketStatusUAIWorker,
  ADD_TICKET_STATUS_UAI
);
export const scheduleOnboardingCallWatcher = createWatcher(
  scheduleOnboardingCallWorker,
  SCHEDULE_ONBOARDING_CALL
);

