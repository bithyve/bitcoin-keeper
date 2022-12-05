import * as Sentry from '@sentry/react-native';

import { LogBox, Platform, StatusBar, UIManager } from 'react-native';
import React, { useEffect } from 'react';

import { AppContextProvider } from 'src/common/content/AppContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { NativeBaseProvider } from 'native-base';
import { Ndef } from 'react-native-nfc-manager';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { sentryConfig } from 'src/core/services/sentry';
import { withIAPContext } from 'react-native-iap';
import { customTheme } from './src/common/themes';
import Navigator from './src/navigation/Navigator';
import { LocalizationProvider } from './src/common/content/LocContext';
import { persistor, store } from './src/store/store';

LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  /\b{$Require cycle}\b/gi,
  'Warning: ...',
  /.+/s,
]);

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

function App() {
  useEffect(() => {
    Sentry.init(sentryConfig);
  }, []);

  // linear-gradient configs for NativeBase
  const config = {
    dependencies: {
      'linear-gradient': LinearGradient,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NativeBaseProvider theme={customTheme} config={config}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LocalizationProvider>
          <AppContextProvider>
            <Navigator />
          </AppContextProvider>
        </LocalizationProvider>
      </NativeBaseProvider>
    </GestureHandlerRootView>
  );
}

function AppWrapper() {
  return <PersistGate persistor={persistor} loading={null}>
    <Provider store={store}>
      <App />
    </Provider>
  </PersistGate>
}

const SentryApp = Sentry.wrap(AppWrapper);

export default withIAPContext(SentryApp);
