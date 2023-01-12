import { call, put, select } from 'redux-saga/effects';
import semver from 'semver';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { Platform } from 'react-native';
import Relay from 'src/core/services/operations/Relay';
import DeviceInfo from 'react-native-device-info';
import { getReleaseTopic } from 'src/utils/releaseTopic';
import messaging from '@react-native-firebase/messaging';
import { setAppVersion } from '../reducers/storage';
import { resetReduxStore, setupKeeperApp } from '../sagaActions/storage';
import { stringToArrayBuffer } from './login';

export function* applyUpgradeSequence({
  storedVersion,
  newVersion,
}: {
  storedVersion: string;
  newVersion: string;
}) {
  console.log(`applying upgrade sequence - from: ${storedVersion} to ${newVersion}`);
  if (semver.lt(storedVersion, '1.1.1')) yield call(switchToMainnet);
  yield put(setAppVersion(newVersion));
  yield call(updateVersionHistory, { newVersion, previousVersion: storedVersion });
}

function* switchToMainnet() {
  // remove existing realm database
  const deleted = yield call(dbManager.deleteRealm);
  if (!deleted) throw new Error('failed to switch to mainnet');
  yield put(resetReduxStore());

  // re-initialise a fresh instance of realm
  const AES_KEY = yield select((state) => state.login.key);
  const uint8array = yield call(stringToArrayBuffer, AES_KEY);
  yield call(dbManager.initializeRealm, uint8array);
  yield put(setupKeeperApp());
}

function* updateVersionHistory({ newVersion, previousVersion }) {
  try {
    yield call(dbManager.createObject, RealmSchema.VersionHistory, {
      version: `${newVersion}(${DeviceInfo.getBuildNumber()})`,
      releaseNote: '',
      date: new Date().toString(),
      title: `Upgraded from ${previousVersion}`,
    });
    messaging().unsubscribeFromTopic(getReleaseTopic(previousVersion));
    messaging().subscribeToTopic(getReleaseTopic(newVersion));

    const res = yield call(Relay.fetchReleaseNotes, newVersion);

    let notes = '';
    // eslint-disable-next-line no-nested-ternary
    notes = res.release
      ? Platform.OS === 'ios'
        ? res.release.releaseNotes.ios
        : res.release.releaseNotes.android
      : '';
    yield call(dbManager.createObject, RealmSchema.VersionHistory, {
      version: `${newVersion}(${DeviceInfo.getBuildNumber()})`,
      releaseNote: notes,
      date: new Date().toString(),
      title: `Upgraded from ${previousVersion}`,
    });
  } catch (error) {
    console.log({ error });
  }
}
