import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import Relay from 'src/services/backend/Relay';
import { TorStatus } from 'src/services/rest/RestClient';

const SendIntentAndroid = require('react-native-send-intent');

const ORBOT_PACKAGE_NAME = 'org.torproject.android';
const ORBOT_PLAYSTORE_URL = `market://details?id=${ORBOT_PACKAGE_NAME}`;
const ORBOT_APPSTORE_URL = 'itms-apps://apps.apple.com/id/app/orbot/id1609461599?l=id';

const useOrbot = () => {
  const appState = useRef(AppState.currentState);
  const [globalTorStatus, setGlobalStatus] = useState<TorStatus>(TorStatus.OFF);
  const checkTorConnection = async () => {
    setGlobalStatus(TorStatus.CHECKING);
    Relay.checkTorStatus()
      .then((connected) => {
        if (connected) {
          setGlobalStatus(TorStatus.CONNECTED);
          console.log('Tor is connected.');
        } else {
          setGlobalStatus(TorStatus.OFF);
          console.log('Tor is not connected.');
        }
      })
      .catch((_) => {
        setGlobalStatus(TorStatus.ERROR);
      });
  };

  useEffect(() => {
    checkTorConnection();
    let subscription;
    // disable automatic foreground check temporarily
    if (false) {
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
              Linking.openURL('https://orbot.app/rc/show');
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

  return { globalTorStatus, openOrbotApp, checkTorConnection };
};

export default useOrbot;
