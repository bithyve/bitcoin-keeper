import { Platform, StatusBar, UIManager } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import { customTheme } from './src/theme';
import { LogBox } from 'react-native';
import React, { useEffect } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigator from './src/navigation/Navigator';
import { Provider } from 'react-redux';
import { initRealm } from 'src/storage/realm/realm';
import makeStore from './src/store';
import { AppRelamProvider } from 'src/storage/realm/AppRealmProvider';

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
    <AppRelamProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </AppRelamProvider>
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
          <Navigator />
        </NativeBaseProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};
