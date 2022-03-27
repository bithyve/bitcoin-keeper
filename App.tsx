import React from 'react';
import Navigator from './src/navigation/Navigator';
import makeStore from './src/store';
import { Provider } from 'react-redux';
import { StatusBar } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import { customTheme } from './src/common/themes';
import { LogBox } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
    <Provider store={store}>
      <App />
    </Provider>
  );
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
