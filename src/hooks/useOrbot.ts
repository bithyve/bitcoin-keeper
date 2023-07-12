import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import { TorStatus } from 'src/core/services/rest/RestClient';
import { captureError } from 'src/core/services/sentry';

const SendIntentAndroid = require('react-native-send-intent');

const NOT_CONNECTED = 'Sorry. You are not using Tor.';
const CONNECTED = 'Congratulations. This browser is configured to use Tor.';
const TOR_ENDPOINT = 'https://check.torproject.org/';

const useOrbot = (keepStatusCheck: boolean) => {
  const appState = useRef(AppState.currentState);
  const [globalTorStatus, setGlobalStatus] = useState<TorStatus>(TorStatus.OFF);
  const checkTorConnection = async () => {
    console.log('Checking Tor connection...');
    setGlobalStatus(TorStatus.CHECKING);
    axios
      .get(TOR_ENDPOINT)
      .then((resp) => {
        if (resp.data.includes(NOT_CONNECTED)) {
          setGlobalStatus(TorStatus.OFF);
          console.log('Tor is not connected.');
        } else if (resp.data.includes(CONNECTED)) {
          setGlobalStatus(TorStatus.CONNECTED);
          console.log('Tor is connected.');
        }
      })
      .catch((err) => {
        captureError(err);
        setGlobalStatus(TorStatus.ERROR);
      });
  };

  useEffect(() => {
    checkTorConnection();
    let subscription;
    if (keepStatusCheck) {
      AppState.addEventListener('change', (nextAppState) => {
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
          checkTorConnection();
        }
        appState.current = nextAppState;
      });
    }
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const openOrbotApp = async () => {
    switch (Platform.OS) {
      case 'android':
        SendIntentAndroid.isAppInstalled('org.torproject.android').then((isInstalled) => {
          if (isInstalled) {
            SendIntentAndroid.openApp('org.torproject.android');
          } else {
            Linking.openURL('market://details?id=org.torproject.android');
          }
        });
        break;
      case 'ios':
        Linking.canOpenURL('orbot://').then((supported) => {
          if (!supported) {
            Linking.openURL('itms-apps://apps.apple.com/id/app/orbot/id1609461599?l=id');
          } else {
            Linking.openURL('https://orbot.app/rc/show');
          }
        });
        break;
      default:
        break;
    }
  };

  return { globalTorStatus, openOrbotApp };
};

export default useOrbot;
