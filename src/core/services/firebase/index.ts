import remoteConfig from '@react-native-firebase/remote-config';
import localConfig from 'src/core/config';

const config = remoteConfig();
const DEFAULTS = {
  TESTNET: JSON.stringify({
    OLD_CHANNEL_URL: 'https://keeper-channel.herokuapp.com/',
    KEEPER_HWI: 'https://connect.bitcoinkeeper.app/',
  }),
  MAINNET: JSON.stringify({
    OLD_CHANNEL_URL: 'https://keeper-channel.herokuapp.com/',
    KEEPER_HWI: 'https://connect.bitcoinkeeper.app/',
  }),
};

const initialiseRemoteConfig = async () => {
  await config.setDefaults(DEFAULTS);
  const remoteConfig = await config.fetchAndActivate();
  if (remoteConfig) {
    console.log('remote config activated');
  } else {
    console.log('empty config');
  }
};

const getConfig = (key) => {
  const networkConfig = config.getValue(localConfig.NETWORK_TYPE).asString();
  const configObject = JSON.parse(networkConfig);
  return configObject[key];
};

export { config, initialiseRemoteConfig, getConfig };
