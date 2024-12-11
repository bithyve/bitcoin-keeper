import { call, put, select } from 'redux-saga/effects';
import { createWatcher } from '../utilities';
import {
  ADD_TICKET_STATUS_UAI,
  GO_TO_CONCEIERGE,
  LOAD_CONCIERGE_USER,
  OPEN_CONCEIERGE,
} from '../sagaActions/concierge';
import * as Zendesk from 'react-native-zendesk-messaging';
import { Linking, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import { RootState } from '../store';
import {
  setConciergTags,
  showOnboarding,
  loadConciergeUser,
  conciergeUser,
  setConciergeLoading,
  setConciergeUserSuccess,
  setConciergeUserFailed,
} from '../reducers/concierge';
import { setDontShowConceirgeOnboarding } from '../reducers/storage';
import { hash256 } from 'src/utils/service-utilities/encryption';
import ZendeskClass from 'src/services/backend/Zendesk';
import Relay from 'src/services/backend/Relay';
import { addToUaiStack } from '../sagaActions/uai';
import { uaiType } from 'src/models/interfaces/Uai';

function* goToConceirge({
  payload,
}: {
  payload: {
    tags: string[];
    screenName: string;
  };
}) {
  const { tags, screenName } = payload;
  const { dontShowConceirgeOnboarding } = yield select((state: RootState) => state.storage);
  yield put(setConciergTags([screenName, ...tags].filter((str) => str !== '')));
  if (dontShowConceirgeOnboarding) {
    yield call(openConceirge, { payload: { dontShow: dontShowConceirgeOnboarding } });
  } else {
    yield put(showOnboarding());
  }
}

export const goToConceirgeWatcher = createWatcher(goToConceirge, GO_TO_CONCEIERGE);

function* openConceirge({
  payload,
}: {
  payload: {
    dontShow: boolean;
  };
}) {
  const { dontShow } = payload;
  if (dontShow) yield put(setDontShowConceirgeOnboarding());
  const res = yield call(dbManager.getObjectByIndex, RealmSchema.KeeperApp);
  if (!res?.publicId || !res?.subscription) {
    Linking.openURL('https://help.bitcoinkeeper.app/hc/en-us');
    return;
  }
  const { publicId, subscription }: KeeperApp = res;
  const { tags } = yield select((state: RootState) => state.concierge);
  const versionHistory = yield call(dbManager.getObjectByIndex, RealmSchema.VersionHistory);
  yield call(Zendesk.clearConversationFields);
  yield call(Zendesk.clearConversationTags);
  yield call(Zendesk.setConversationTags, [
    `${Platform.OS}-${DeviceInfo.getSystemVersion()}`,
    DeviceInfo.getVersion(),
    `${DeviceInfo.getBrand()}-${DeviceInfo.getModel()}`,
    ...tags,
  ]);
  yield call(Zendesk.setConversationFields, {
    '18084979872925': publicId,
    '18087575177885': subscription.name.toUpperCase(),
    '18087673246237': DeviceInfo.getVersion(),
    '18088921954333': JSON.stringify(versionHistory),
  });
  yield call(Zendesk.openMessagingView);
}

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

export const openConceirgeWatcher = createWatcher(openConceirge, OPEN_CONCEIERGE);
export const loadConciergeUserWatcher = createWatcher(loadConciergeUserWorker, LOAD_CONCIERGE_USER);
export const addTicketStatusUAIWatcher = createWatcher(
  addTicketStatusUAIWorker,
  ADD_TICKET_STATUS_UAI
);
