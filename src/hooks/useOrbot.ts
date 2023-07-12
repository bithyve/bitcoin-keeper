import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';

const SendIntentAndroid = require('react-native-send-intent');

export enum OrbotStatus {
  DISCONNECTED = 'DISCONNECTED',
  CHECKING = 'CHECKING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

const useOrbot = (keepStatusCheck: boolean) => {
  const appState = useRef(AppState.currentState);
  const [status, setStatus] = useState<OrbotStatus>(OrbotStatus.DISCONNECTED);
  const checkTorConnection = async () => {
    console.log('Checking Tor connection...');
    setStatus(OrbotStatus.CHECKING);
    axios
      .get('https://check.torproject.org/')
      .then((resp) => {
        if (resp.data.includes('Sorry. You are not using Tor.')) {
          setStatus(OrbotStatus.DISCONNECTED);
          console.log('Tor is not connected.');
        } else if (resp.data.includes('Congratulations. This browser is configured to use Tor.')) {
          setStatus(OrbotStatus.CONNECTED);
          console.log('Tor is connected.');
        }
      })
      .catch((err) => {
        console.log(err);
        setStatus(OrbotStatus.ERROR);
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

  return { status, openOrbotApp };
};

export default useOrbot;
