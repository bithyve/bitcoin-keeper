import { useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setHasDeepLink } from 'src/store/reducers/login';

const PASSCODE_TIMEOUT = 5 * 60 * 1000;

const AppStateHandler = () => {
  const navigation = useNavigation();
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastBackgroundTime, setLastBackgroundTime] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    Linking.addEventListener('url', (event) => {
      if (event.url) dispatch(setHasDeepLink(event.url));
    });
    // cleanup is performed in initialAppController for all url events at once.

    const handleAppStateChange = (nextAppState) => {
      if (appState === 'active' && nextAppState.match(/inactive|background/)) {
        setLastBackgroundTime(Date.now());
      } else if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App is coming to the foreground, check elapsed time
        const state = navigation.getState();
        const notLoginStack = state?.routes[state.index]?.name !== 'LoginStack';

        if (
          notLoginStack &&
          lastBackgroundTime &&
          Date.now() - lastBackgroundTime > PASSCODE_TIMEOUT
        ) {
          // 60 seconds
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'LoginStack',
                state: {
                  routes: [{ name: 'Login', params: { fromBackground: true } }],
                },
              },
            ],
          });
        }
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [appState, lastBackgroundTime, navigation]);

  return null;
};

export default AppStateHandler;
