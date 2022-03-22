import React from 'react';
import Navigator from './src/navigation';
import makeStore from './src/store'
import { Provider } from 'react-redux'
import { StyleSheet,SafeAreaView, StatusBar } from 'react-native';
import { NativeBaseProvider } from 'native-base';

import { customTheme } from './src/common/themes';

export default function AppWrapper() {
  // Creates and holds an instance of the store so only children in the `Provider`'s
  // context can have access to it.
  const store = makeStore()
  return (
    <Provider store={store}>
      <App/>
    </Provider>
  )
}

const App = () => {
  return (
    <NativeBaseProvider theme={customTheme}>
      <SafeAreaView/>
      <StatusBar barStyle={'dark-content'} />
      <Navigator/>
    </NativeBaseProvider>);
};

