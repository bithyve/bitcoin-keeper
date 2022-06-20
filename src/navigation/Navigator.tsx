import { DefaultTheme, NavigationContainer } from '@react-navigation/native';

import AddAmountScreen from 'src/screens/Recieve/AddAmountScreen';
import AddSendAmount from 'src/screens/Send/AddSendAmount';
import AddTapsigner from 'src/screens/AddTapsigner/AddTapsigner';
import AddWallet from 'src/screens/AddWallet/AddWalletScreen';
import AppSettings from 'src/screens/AppSettings/AppSettings';
import BackupScreen from 'src/screens/BackupScreen/BackupScreen';
import ChangeLanguage from 'src/screens/AppSettings/ChangeLanguage';
import ChoosePlan from 'src/screens/ChoosePlanScreen/ChoosePlan';
import CreatePin from 'src/screens/LoginScreen/CreatePin';
import EnterWalletDetailScreen from 'src/screens/EnterWalletDetailScreen/EnterWalletDetailScreen';
import ExportSeedScreen from 'src/screens/ExportSeedScreen/ExportSeedScreen';
import HomeScreen from 'src/screens/NewHomeScreen/HomeScreen';
import InheritanceScreen from 'src/screens/Inheritance/InheritanceScreen';
import Login from '../screens/LoginScreen/Login';
import LoginScreen from 'src/screens/LoginScreen/LoginScreen';
// import NewHomeScreen from 'src/screens/NewHomeScreen/NewHomeScreen';
import QRscannerScreen from 'src/screens/QRscannerScreen/QRScannerScreen';
import React from 'react';
import ReceiveScreen from 'src/screens/Recieve/ReceiveScreen';
import ResetPin from 'src/screens/LoginScreen/ResetPin';
import SendConfirmation from 'src/screens/Send/SendConfirmation';
import SendScreen from 'src/screens/Send/SendScreen';
import SplashScreen from 'src/screens/Splash/SplashScreen';
import HardwareWalletSetup from 'src/screens/HardwareWalletSetUp/HardwareWalletSetup';
// import TestingScreen from 'src/screens/TestingScreen';
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
        {/* <Stack.Screen name="NewHome" component={NewHomeScreen} /> */}
        <Stack.Screen name="AddTapsigner" component={AddTapsigner} />
        <Stack.Screen name="Lock Screen" component={LoginScreen} />
        <Stack.Screen name="NewHome" component={HomeScreen} />
        <Stack.Screen name="Backup" component={BackupScreen} />
        <Stack.Screen name="Inheritance" component={InheritanceScreen} />
        <Stack.Screen name="QRscanner" component={QRscannerScreen} />
        <Stack.Screen name="AddWallet Screen" component={AddWallet} />
        <Stack.Screen name="AppSettings" component={AppSettings} />
        <Stack.Screen name="WalletDetailScreen" component={WalletDetailScreen} />
        <Stack.Screen name="Send" component={SendScreen} />
        <Stack.Screen name="Receive" component={ReceiveScreen} />
        <Stack.Screen name="ChangeLanguage" component={ChangeLanguage} />
        <Stack.Screen name="ChoosePlan" component={ChoosePlan} />
        <Stack.Screen name="EnterWalletDetail" component={EnterWalletDetailScreen} />
        <Stack.Screen name="AddAmount" component={AddAmountScreen} />
        <Stack.Screen name="ExportSeed" component={ExportSeedScreen} />
        <Stack.Screen name="AddSendAmount" component={AddSendAmount} />
        <Stack.Screen name="SendConfirmation" component={SendConfirmation} />
        <Stack.Screen name="HardwareSetup" component={HardwareWalletSetup} />
        {/* <Stack.Screen name="Test" component={TestingScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
