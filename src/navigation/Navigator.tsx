import { DefaultTheme, NavigationContainer } from '@react-navigation/native';

import AddAmountScreen from 'src/screens/Recieve/AddAmountScreen';
import AddSendAmount from 'src/screens/Send/AddSendAmount';
import AppSettings from 'src/screens/AppSettings/AppSettings';
import AppVersionHistory from 'src/screens/AppSettings/AppVersionHistoty';
import TorSettings from 'src/screens/AppSettings/TorSettings';
import BackupWallet from 'src/screens/BackupWallet/BackupWallet';
import ChangeLanguage from 'src/screens/AppSettings/ChangeLanguage';
import ChoosePlan from 'src/screens/ChoosePlanScreen/ChoosePlan';
import CreatePin from 'src/screens/LoginScreen/CreatePin';
import EditWalletScreen from 'src/screens/EnterWalletDetailScreen/EditWalletScreen';
import EnterSeedScreen from 'src/screens/EnterWalletDetailScreen/EnterSeedScreen';
import EnterWalletDetailScreen from 'src/screens/EnterWalletDetailScreen/EnterWalletDetailScreen';
import ExportSeedScreen from 'src/screens/ExportSeedScreen/ExportSeedScreen';
import HardwareWalletSetup from 'src/screens/HardwareWalletSetUp/HardwareWalletSetup';
import HomeScreen from 'src/screens/NewHomeScreen/HomeScreen';
import InheritanceSetup from 'src/screens/Inheritance/InheritanceSetup';
import Login from '../screens/LoginScreen/Login';
import WalletBackHistoryScreen from 'src/screens/BackupWallet/WalletBackHistoryScreen';
import OnBoardingSlides from 'src/screens/Splash/OnBoardingSlides';
import QRscannerScreen from 'src/screens/QRscannerScreen/QRScannerScreen';
import React from 'react';
import { RealmProvider } from 'src/storage/realm/RealmProvider';
import ReceiveScreen from 'src/screens/Recieve/ReceiveScreen';
import ResetPin from 'src/screens/LoginScreen/ResetPin';
import SendConfirmation from 'src/screens/Send/SendConfirmation';
import SendScreen from 'src/screens/Send/SendScreen';
import SetupColdCard from 'src/screens/AddColdCard/SetupColdCard';
import SetupInheritance from 'src/screens/Inheritance/SetupInheritance';
import SetupTapsigner from 'src/screens/AddTapsigner/SetupTapsigner';
import SignTransactionScreen from 'src/screens/SignTransaction/SignTransactionScreen';
import SplashScreen from 'src/screens/Splash/SplashScreen';
import VaultDetails from 'src/screens/HomeScreen/VaultDetails';
import WalletDetails from 'src/screens/WalletDetailScreen/WalletDetails';
import WalletSettings from 'src/screens/WalletDetailScreen/WalletSettings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NewKeeperApp from 'src/screens/NewKeeperAppScreen/NewKeeperAppScreen';
import RecoveryFromSeed from 'src/screens/RecoveryFromSeed/RecoveryFromSeed';

const defaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F7F2EC',
  },
};

const LoginStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen options={{ gestureEnabled: false }} name="Splash" component={SplashScreen} />
      <Stack.Screen options={{ gestureEnabled: false }} name="Login" component={Login} />
      <Stack.Screen options={{ gestureEnabled: false }} name="CreatePin" component={CreatePin} />
      <Stack.Screen options={{ gestureEnabled: false }} name="ResetPin" component={ResetPin} />
      <Stack.Screen
        options={{ gestureEnabled: false }}
        name="OnBoardingSlides"
        component={OnBoardingSlides}
      />
      <Stack.Screen
        name="NewKeeperApp"
        options={{ gestureEnabled: false }}
        component={NewKeeperApp}
      />
      <Stack.Screen name="EnterSeedScreen" component={EnterSeedScreen} />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  const Stack = createNativeStackNavigator();
  return (
    <RealmProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="NewHome" component={HomeScreen} />
        <Stack.Screen name="HardwareWallet" component={HardwareWalletSetup} />
        <Stack.Screen name="AddTapsigner" component={SetupTapsigner} />
        <Stack.Screen name="AddColdCard" component={SetupColdCard} />
        <Stack.Screen name="QRscanner" component={QRscannerScreen} />
        <Stack.Screen name="AppSettings" component={AppSettings} />
        <Stack.Screen name="AppVersionHistory" component={AppVersionHistory} />
        <Stack.Screen name="TorSettings" component={TorSettings} />
        <Stack.Screen name="InheritanceSetup" component={InheritanceSetup} />
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
        <Stack.Screen name="WalletDetails" component={WalletDetails} />
        <Stack.Screen name="VaultDetails" component={VaultDetails} />
        <Stack.Screen name="WalletSettings" component={WalletSettings} />
        <Stack.Screen name="EditWalletScreen" component={EditWalletScreen} />
        <Stack.Screen name="SetupInheritance" component={NewKeeperApp} />
        <Stack.Screen name="BackupWallet" component={BackupWallet} />
        <Stack.Screen name="WalletBackHistory" component={WalletBackHistoryScreen} />
        <Stack.Screen name="SignTransactionScreen" component={SignTransactionScreen} />
      </Stack.Navigator>
    </RealmProvider>
  );
};
const Navigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer theme={defaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginStack" component={LoginStack} />
        <Stack.Screen name="App" component={AppStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
