import { NativeModules } from 'react-native';

const { Zendesk } = NativeModules;

export const initialize = async (
  channelKey: string,
  onSuccess?: () => void,
  onError?: (err: any) => void
) => {
  try {
    await Zendesk.initialize(channelKey);
    onSuccess && onSuccess();
  } catch (err: any) {
    onError && onError(err);
  }
};

export const showMessaging = (
  appId: string,
  tier: string,
  tags: string,
  appVersion: string,
  versionHistory: string
) => {
  return Zendesk.showMessaging(appId, tier, tags, appVersion, versionHistory);
};
