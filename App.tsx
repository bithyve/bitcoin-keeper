import * as Sentry from '@sentry/react-native';

import { LogBox, Platform, StatusBar, UIManager } from 'react-native';
import React, { useEffect } from 'react';
import { persistor, store } from './src/store/store';

import { AppContextProvider } from 'src/common/content/AppContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { LocalizationProvider } from './src/common/content/LocContext';
import { NativeBaseProvider } from 'native-base';
import Navigator from './src/navigation/Navigator';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { customTheme } from './src/common/themes';
import { sentryConfig } from 'src/core/services/sentry';
import { withIAPContext } from 'react-native-iap';

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

const App = () => {
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
      <BottomSheetModalProvider>
        <NativeBaseProvider theme={customTheme} config={config}>
          <StatusBar translucent backgroundColor="transparent" barStyle={'light-content'} />
          <LocalizationProvider>
            <AppContextProvider>
              <Navigator />
            </AppContextProvider>
          </LocalizationProvider>
        </NativeBaseProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const AppWrapper = () => (
  <PersistGate persistor={persistor} loading={null}>
    <Provider store={store}>
      <App />
    </Provider>
  </PersistGate>
);

const SentryApp = Sentry.wrap(AppWrapper);

export default withIAPContext(SentryApp);
