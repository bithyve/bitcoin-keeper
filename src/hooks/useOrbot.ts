import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import { captureError } from 'src/core/services/sentry';

const SendIntentAndroid = require('react-native-send-intent');

const TOR_ENDPOINT = 'https://check.torproject.org/api/ip';
const ORBOT_PACKAGE_NAME = 'org.torproject.android';
const ORBOT_PLAYSTORE_URL = `market://details?id=${ORBOT_PACKAGE_NAME}`;
const ORBOT_APPSTORE_URL = 'itms-apps://apps.apple.com/id/app/orbot/id1609461599?l=id';

const useOrbot = (keepStatusCheck: boolean) => {
  const appState = useRef(AppState.currentState);
  const [globalTorStatus, setGlobalStatus] = useState<TorStatus>(TorStatus.OFF);
  const checkTorConnection = async () => {
    console.log('Checking Tor connection...');
    setGlobalStatus(TorStatus.CHECKING);
    RestClient.get(TOR_ENDPOINT, { timeout: 20000 })
      .then((resp) => {
        if (!resp.data.IsTor) {
          setGlobalStatus(TorStatus.OFF);
          console.log('Tor is not connected.');
        } else {
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

  const openOrbotApp = async (start = true) => {
    switch (Platform.OS) {
      case 'android':
        SendIntentAndroid.isAppInstalled(ORBOT_PACKAGE_NAME).then((isInstalled) => {
          if (isInstalled) {
            SendIntentAndroid.openApp(ORBOT_PACKAGE_NAME);
          } else {
            Linking.openURL(ORBOT_PLAYSTORE_URL);
          }
        });
        break;
      case 'ios':
        Linking.canOpenURL('orbot://')
          .then((supported) => {
            if (!supported) {
              Linking.openURL(ORBOT_APPSTORE_URL);
            } else {
              if (start) {
                Linking.openURL('https://orbot.app/rc/start');
              } else {
                Linking.openURL('https://orbot.app/rc/stop');
              }
            }
          })
          .catch((_) => {
            Linking.openURL(ORBOT_APPSTORE_URL);
          });
        break;
      default:
        break;
    }
  };

  return { globalTorStatus, openOrbotApp };
};

export default useOrbot;
