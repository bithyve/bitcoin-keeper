import React from 'react';
import { StyleSheet,SafeAreaView, StatusBar } from 'react-native';
import Navigator from './src/navigation';
import { NativeBaseProvider } from 'native-base';

import { customTheme } from './src/common/themes';

const App = () => {
  return (
    <NativeBaseProvider theme={customTheme}>
      <SafeAreaView/>
      <StatusBar barStyle={'dark-content'} />
      <Navigator/>
    </NativeBaseProvider>);
};

export default App;
