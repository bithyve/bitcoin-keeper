import { DefaultTheme, NavigationContainer } from '@react-navigation/native';

import AddWallet from 'src/screens/AddWallet/AddWalletScreen';
import BackupScreen from 'src/screens/BackupScreen/BackupScreen';
import HomeScreen from 'src/screens/HomeScreen/HomeScreen';
import InheritanceScreen from 'src/screens/Inheritance/InheritanceScreen';
import LoginScreen from 'src/screens/LoginScreen/LoginScreen';
import NewHomeScreen from 'src/screens/NewHomeScreen/NewHomeScreen';
import QRscannerScreen from 'src/screens/QRscannerScreen/QRScannerScreen';
import ReceiveScreen from 'src/screens/Recieve/ReceiveScreen';
import SendScreen from 'src/screens/Send/SendScreen';

import React from 'react';
import TestingScreen from 'src/screens/TestingScreen';
import WalletDetailScreen from 'src/screens/WalletDetailScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const defaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FDF7F0',
  },
};
const Navigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer theme={defaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Lock Screen" component={LoginScreen} />
        <Stack.Screen name="NewHome" component={NewHomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Backup" component={BackupScreen} />
        <Stack.Screen name="Inheritance" component={InheritanceScreen} />
        <Stack.Screen name="QRscanner" component={QRscannerScreen} />
        <Stack.Screen name="AddWallet Screen" component={AddWallet} />
        <Stack.Screen name="WalletDetailScreen" component={WalletDetailScreen} />
        <Stack.Screen name="Send" component={SendScreen} />
        <Stack.Screen name="Receive" component={ReceiveScreen} />
        <Stack.Screen name="NewHome" component={NewHomeScreen} />
        {/* <Stack.Screen name="Test" component={TestingScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
