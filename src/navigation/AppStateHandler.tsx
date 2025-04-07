import { useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AppStateHandler = () => {
  const navigation = useNavigation();
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastBackgroundTime, setLastBackgroundTime] = useState(null);

  useEffect(() => {
    let avoidLogin = false;
    const deepLinkHandler = Linking.addEventListener('url', (event) => {
      if (event.url) avoidLogin = true;
    });

    const handleAppStateChange = (nextAppState) => {
      if (appState === 'active' && nextAppState.match(/inactive|background/)) {
        setLastBackgroundTime(Date.now());
      } else if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App is coming to the foreground, check elapsed time
        const state = navigation.getState();
        const notLoginStack = state?.routes[state.index]?.name !== 'LoginStack';

        if (
          !avoidLogin &&
          notLoginStack &&
          lastBackgroundTime &&
          Date.now() - lastBackgroundTime > 1 * 1000
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
      avoidLogin = false;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
      deepLinkHandler.remove();
    };
  }, [appState, lastBackgroundTime, navigation]);

  return null;
};

export default AppStateHandler;
