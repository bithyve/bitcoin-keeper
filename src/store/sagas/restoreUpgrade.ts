import { call } from 'redux-saga/effects';
import Relay from 'src/services/backend/Relay';

export function* applyRestoreSequence({
  previousVersion,
  newVersion,
  appImage,
}: {
  previousVersion: string;
  newVersion: string;
  appImage: any;
}) {
  console.log(`applying restore upgarde sequence - from: ${previousVersion} to ${newVersion}`);

  yield call(updateVersion, appImage, newVersion);
}

// while restoring, updating the version on the appImage
// TODO
function* updateVersion(appImage, newVersion) {
  try {
    yield call(Relay.updateAppImage, {
      appId: appImage.appId,
      version: newVersion,
    });
  } catch (err) {
    console.log(err);
  }
}
