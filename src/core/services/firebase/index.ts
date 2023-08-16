/* eslint-disable no-unused-vars */
import remoteConfig from '@react-native-firebase/remote-config';
import localConfig from 'src/core/config';
import { captureError } from '../sentry';

export enum REMOTE_CONFIG {
  OLD_CHANNEL_URL = 'OLD_CHANNEL_URL',
  CHANNEL_URL = 'CHANNEL_URL',
  KEEPER_HWI = 'KEEPER_HWI',
}

const config = remoteConfig();
const DEFAULTS = {
  TESTNET: JSON.stringify({
    OLD_CHANNEL_URL: 'https://keeper-channel.herokuapp.com/',
    KEEPER_HWI: 'https://connect.bitcoinkeeper.app/',
    CHANNEL_URL: 'https://bithyve-dev-relay.el.r.appspot.com/',
  }),
  MAINNET: JSON.stringify({
    OLD_CHANNEL_URL: 'https://keeper-channel.herokuapp.com/',
    KEEPER_HWI: 'https://connect.bitcoinkeeper.app/',
    CHANNEL_URL: 'https://keeper-relay.uc.r.appspot.com/',
  }),
};

const initialiseRemoteConfig = async () => {
  await config.setDefaults(DEFAULTS);
  config.setConfigSettings({
    minimumFetchIntervalMillis: 60000 * 30, // 30 minutes
  });
  const remoteConfig = await config.fetchAndActivate();
  if (remoteConfig) {
    console.log('fresh config activated at: ', new Date().toDateString());
  }
};

const getConfig = (key) => {
  try {
    const networkConfig = config.getValue(localConfig.NETWORK_TYPE).asString();
    const configObject = JSON.parse(networkConfig);
    return configObject[key];
  } catch (e) {
    captureError(e);
    return null;
  }
};

export { config, initialiseRemoteConfig, getConfig };
