import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddTapsigner from 'src/screens/NewHomeScreen/AddTapsigner';
import AddWallet from 'src/screens/AddWallet/AddWalletScreen';
import BackupScreen from 'src/screens/BackupScreen/BackupScreen';
import HomeScreen from 'src/screens/HomeScreen/HomeScreen';
import InheritanceScreen from 'src/screens/Inheritance/InheritanceScreen';
// import LoginScreen from 'src/screens/LoginScreen/LoginScreen';
import NewHomeScreen from 'src/screens/NewHomeScreen/NewHomeScreen';
import QRscannerScreen from 'src/screens/QRscannerScreen/QRScannerScreen';
import AppSettings from 'src/screens/AppSettings/AppSettings';
import ReceiveScreen from 'src/screens/Recieve/ReceiveScreen';
import SendScreen from 'src/screens/Send/SendScreen';
import WalletDetailScreen from 'src/screens/WalletDetailScreen/WalletDetailScreen';
import SplashScreen from 'src/screens/Splash/SplashScreen';
import ChangeLanguage from 'src/screens/AppSettings/ChangeLanguage';
// import TestingScreen from 'src/screens/TestingScreen';
import Login from '../screens/LoginScreen/Login';
import CreatePin from 'src/screens/LoginScreen/CreatePin';
import EnterWalletDetailScreen from 'src/screens/EnterWalletDetailScreen/EnterWalletDetailScreen';
import AddAmountScreen from 'src/screens/Recieve/AddAmountScreen';

import TestingScreen from 'src/screens/TestingScreen';
import ResetPin from 'src/screens/LoginScreen/ResetPin';
import LoginScreen from 'src/screens/LoginScreen/LoginScreen';
import ExportSeedScreen from 'src/screens/ExportSeedScreen/ExportSeedScreen';

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
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="CreatePin" component={CreatePin} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ResetPin" component={ResetPin} />
        <Stack.Screen name="NewHome" component={NewHomeScreen} />
        <Stack.Screen name="AddTapsigner" component={AddTapsigner} />
        <Stack.Screen name="Lock Screen" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Backup" component={BackupScreen} />
        <Stack.Screen name="Inheritance" component={InheritanceScreen} />
        <Stack.Screen name="QRscanner" component={QRscannerScreen} />
        <Stack.Screen name="AddWallet Screen" component={AddWallet} />
        <Stack.Screen name="AppSettings" component={AppSettings} />
        <Stack.Screen name="WalletDetailScreen" component={WalletDetailScreen} />
        <Stack.Screen name="Send" component={SendScreen} />
        <Stack.Screen name="Receive" component={ReceiveScreen} />
        <Stack.Screen name="ChangeLanguage" component={ChangeLanguage} />
        <Stack.Screen name="EnterWalletDetail" component={EnterWalletDetailScreen} />
        <Stack.Screen name="AddAmount" component={AddAmountScreen} />
        <Stack.Screen name="ExportSeed" component={ExportSeedScreen} />
        {/* <Stack.Screen name="Test" component={TestingScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
