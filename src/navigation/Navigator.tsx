import { DefaultTheme, NavigationContainer } from '@react-navigation/native';

import AddTapsigner from 'src/screens/AddTapsigner/AddTapsigner';
import AddWallet from 'src/screens/AddWallet/AddWalletScreen';
import AppSettings from 'src/screens/AppSettings/AppSettings';
import BackupScreen from 'src/screens/BackupScreen/BackupScreen';
import ChangeLanguage from 'src/screens/AppSettings/ChangeLanguage';
import CreatePin from 'src/screens/LoginScreen/CreatePin';
import HomeScreen from 'src/screens/HomeScreen/HomeScreen';
import InheritanceScreen from 'src/screens/Inheritance/InheritanceScreen';
// import TestingScreen from 'src/screens/TestingScreen';
import Login from '../screens/LoginScreen/Login';
import LoginScreen from 'src/screens/LoginScreen/LoginScreen';
// import LoginScreen from 'src/screens/LoginScreen/LoginScreen';
import NewHomeScreen from 'src/screens/NewHomeScreen/NewHomeScreen';
import QRscannerScreen from 'src/screens/QRscannerScreen/QRScannerScreen';
import React from 'react';
import ReceiveScreen from 'src/screens/Recieve/ReceiveScreen';
import ResetPin from 'src/screens/LoginScreen/ResetPin';
import SendScreen from 'src/screens/Send/SendScreen';
import SplashScreen from 'src/screens/Splash/SplashScreen';
import TestingScreen from 'src/screens/TestingScreen';
import WalletDetailScreen from 'src/screens/WalletDetailScreen/WalletDetailScreen';
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
        {/* <Stack.Screen name="Test" component={TestingScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
