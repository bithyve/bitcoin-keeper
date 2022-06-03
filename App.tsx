import { Platform, StatusBar, UIManager } from 'react-native';
import React, { useEffect } from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import Navigator from './src/navigation/Navigator';
import { Provider } from 'react-redux';
import { customTheme } from './src/common/themes';
import makeStore from './src/store';
import { RealmProvider } from 'src/storage/realm/RealmProvider';
import { LocalizationProvider } from './src/common/content/LocContext'
//https://github.com/software-mansion/react-native-gesture-handler/issues/1831
LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  /[Require cycle]*/,
]);


export default function AppWrapper() {
  // Creates and holds an instance of the store so only children in the `Provider`'s
  // context can have access to it.
  const store = makeStore();

  return (
    <RealmProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </RealmProvider>
  );
}

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <NativeBaseProvider theme={customTheme}>
          <StatusBar translucent backgroundColor="transparent" barStyle={'light-content'} />
            <LocalizationProvider>
              <Navigator />
            </LocalizationProvider>
        </NativeBaseProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};
