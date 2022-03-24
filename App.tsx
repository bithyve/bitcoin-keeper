import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import { customTheme } from './src/common/themes';
import Navigator from 'src/navigation';

const App = () => {
  return (
    <NativeBaseProvider theme={customTheme}>
      <StatusBar barStyle={'dark-content'} />
      <Navigator />
    </NativeBaseProvider>
  );
};

export default App;
