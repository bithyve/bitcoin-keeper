import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigator from './src/navigation';
import { NativeBaseProvider } from 'native-base';

import { customTheme } from './src/common/themes';

const App = () => {
  return (
    <NativeBaseProvider theme={customTheme}>
      <SafeAreaProvider>
        <Navigator />
      </SafeAreaProvider>
    </NativeBaseProvider>);
};

export default App;
