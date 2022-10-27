import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React, { useContext, useRef } from 'react';

import AddAmountScreen from 'src/screens/Recieve/AddAmountScreen';
import AddDescription from 'src/screens/Vault/AddDescription';
import AddSendAmount from 'src/screens/Send/AddSendAmount';
import AddSigningDevice from 'src/screens/Vault/AddSigningDevice';
import { AppContext } from 'src/common/content/AppContext';
import AppSettings from 'src/screens/AppSettings/AppSettings';
import AppVersionHistory from 'src/screens/AppSettings/AppVersionHistoty';
import ArchivedVault from 'src/screens/Vault/ArchivedVault';
import BackupWallet from 'src/screens/BackupWallet/BackupWallet';
import ChangeLanguage from 'src/screens/AppSettings/ChangeLanguage';
import ChoosePlan from 'src/screens/ChoosePlanScreen/ChoosePlan';
import ChoosePolicyNew from 'src/screens/Vault/ChoosePolicyNew';
import ColdCardReocvery from 'src/screens/VaultRecovery/ColdCardRecovery';
import CreatePin from 'src/screens/LoginScreen/CreatePin';
import EditWalletScreen from 'src/screens/EnterWalletDetailScreen/EditWalletScreen';
import EnterSeedScreen from 'src/screens/EnterWalletDetailScreen/EnterSeedScreen';
import EnterWalletDetailScreen from 'src/screens/EnterWalletDetailScreen/EnterWalletDetailScreen';
import ExportSeedScreen from 'src/screens/ExportSeedScreen/ExportSeedScreen';
import HomeScreen from 'src/screens/NewHomeScreen/HomeScreen';
import InputSeedWordSigner from 'src/screens/AddSeedWordSigner/InputSeedWordSigner';
import KeeperLoader from 'src/components/KeeperLoader';
import Login from '../screens/LoginScreen/Login';
import NewKeeperApp from 'src/screens/NewKeeperAppScreen/NewKeeperAppScreen';
import OnBoardingSlides from 'src/screens/Splash/OnBoardingSlides';
import QRscannerScreen from 'src/screens/QRscannerScreen/QRScannerScreen';
import { RealmProvider } from 'src/storage/realm/RealmProvider';
import ReceiveScreen from 'src/screens/Recieve/ReceiveScreen';
import RecoveryFromSeed from 'src/screens/RecoveryFromSeed/RecoveryFromSeed';
import ResetPin from 'src/screens/LoginScreen/ResetPin';
import { RigisterToSD } from 'src/screens/Vault/RigisterToSD';
import SendConfirmation from 'src/screens/Send/SendConfirmation';
import SendScreen from 'src/screens/Send/SendScreen';
import SetupColdCard from 'src/screens/AddColdCard/SetupColdCard';
import SetupInheritance from 'src/screens/Inheritance/SetupInheritance';
import SetupLedger from 'src/screens/AddLedger/SetupLedger';
import SetupSeedWordSigner from 'src/screens/AddSeedWordSigner/SetupSeedWordSigner';
import SetupSigningServer from 'src/screens/Vault/SetupSigningServer';
import SetupTapsigner from 'src/screens/AddTapsigner/SetupTapsigner';
import SignTransactionScreen from 'src/screens/SignTransaction/SignTransactionScreen';
import SignWithColdCard from 'src/screens/SignTransaction/SignWithColdCard';
import SignWithTapsigner from 'src/screens/SignTransaction/SignWithTapsigner';
import SignerAdvanceSettings from 'src/screens/Vault/SignerAdvanceSettings';
import SignersList from 'src/screens/VaultRecovery/SignersList';
import SigningDeviceDetails from 'src/screens/Vault/SigningDeviceDetails';
import SigningDeviceList from 'src/screens/Vault/SigningDeviceList';
import SigningServer from 'src/screens/Vault/SigningServer';
import SigningServerSettings from 'src/screens/Vault/SigningServerSettings';
import SplashScreen from 'src/screens/Splash/SplashScreen';
import TapSignerRecovery from 'src/screens/VaultRecovery/TapsignerRecovery';
import TimelockScreen from 'src/screens/Vault/TimelockScreen';
import TorSettings from 'src/screens/AppSettings/TorSettings';
import TransactionDetails from 'src/screens/ViewTransactions/TransactionDetails';
import VaultDetails from 'src/screens/HomeScreen/VaultDetails';
import VaultRecovery from 'src/screens/VaultRecovery/VaultRecovery';
import VaultSettings from 'src/screens/Vault/VaultSettings';
import VaultTransactions from 'src/screens/Vault/VaultTransactions';
import ViewAllTransactions from 'src/screens/ViewTransactions/ViewAllTransactions';
import WalletBackHistoryScreen from 'src/screens/BackupWallet/WalletBackHistoryScreen';
import WalletDetails from 'src/screens/WalletDetailScreen/WalletDetails';
import WalletSettings from 'src/screens/WalletDetailScreen/WalletSettings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { routingInstrumentation } from 'src/core/services/sentry';

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
        name="VaultRecoveryAddSigner"
        component={VaultRecovery}
      />
      <Stack.Screen
        options={{ gestureEnabled: false }}
        name="ColdCardReocvery"
        component={ColdCardReocvery}
      />

      <Stack.Screen
        options={{ gestureEnabled: false }}
        name="SignersList"
        component={SignersList}
      />
      <Stack.Screen
        options={{ gestureEnabled: false }}
        name="TapSignerRecovery"
        component={TapSignerRecovery}
      />
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
        <Stack.Screen name="SigningDeviceList" component={SigningDeviceList} />
        <Stack.Screen name="AddTapsigner" component={SetupTapsigner} />
        <Stack.Screen name="SignWithTapsigner" component={SignWithTapsigner} />
        <Stack.Screen name="AddColdCard" component={SetupColdCard} />
        <Stack.Screen name="AddLedger" component={SetupLedger} />
        <Stack.Screen name="QRscanner" component={QRscannerScreen} />
        <Stack.Screen name="AppSettings" component={AppSettings} />
        <Stack.Screen name="AppVersionHistory" component={AppVersionHistory} />
        <Stack.Screen name="TorSettings" component={TorSettings} />
        <Stack.Screen name="SetupInheritance" component={SetupInheritance} />
        <Stack.Screen name="Send" component={SendScreen} />
        <Stack.Screen name="Receive" component={ReceiveScreen} />
        <Stack.Screen name="ChangeLanguage" component={ChangeLanguage} />
        <Stack.Screen name="ViewAllTransactions" component={ViewAllTransactions} />
        <Stack.Screen name="ChoosePlan" component={ChoosePlan} />
        <Stack.Screen name="EnterWalletDetail" component={EnterWalletDetailScreen} />
        <Stack.Screen name="AddAmount" component={AddAmountScreen} />
        <Stack.Screen name="ExportSeed" component={ExportSeedScreen} />
        <Stack.Screen name="AddSendAmount" component={AddSendAmount} />
        <Stack.Screen name="SendConfirmation" component={SendConfirmation} />
        <Stack.Screen name="WalletDetails" component={WalletDetails} />
        <Stack.Screen name="VaultDetails" component={VaultDetails} />
        <Stack.Screen name="WalletSettings" component={WalletSettings} />
        <Stack.Screen name="EditWalletScreen" component={EditWalletScreen} />
        <Stack.Screen name="BackupWallet" component={BackupWallet} />
        <Stack.Screen name="SigningDeviceDetails" component={SigningDeviceDetails} />
        <Stack.Screen name="WalletBackHistory" component={WalletBackHistoryScreen} />
        <Stack.Screen name="SignTransactionScreen" component={SignTransactionScreen} />
        <Stack.Screen name="AddSigningDevice" component={AddSigningDevice} />
        <Stack.Screen name="SetupSigningServer" component={SetupSigningServer} />
        <Stack.Screen name="SetupSeedWordSigner" component={SetupSeedWordSigner} />
        <Stack.Screen name="InputSeedWordSigner" component={InputSeedWordSigner} />
        <Stack.Screen name="ArchivedVault" component={ArchivedVault} />
        <Stack.Screen name="VaultSettings" component={VaultSettings} />
        <Stack.Screen name="RigisterToSD" component={RigisterToSD} />
        <Stack.Screen name="SignWithColdCard" component={SignWithColdCard} />
        <Stack.Screen name="ChoosePolicyNew" component={ChoosePolicyNew} />
        <Stack.Screen name="SigningServerSettings" component={SigningServerSettings} />
        <Stack.Screen name="SigningServer" component={SigningServer} />
        <Stack.Screen name="AddDescription" component={AddDescription} />
        <Stack.Screen name="VaultTransactions" component={VaultTransactions} />
        <Stack.Screen name="TransactionDetails" component={TransactionDetails} />
        <Stack.Screen name="TimelockScreen" component={TimelockScreen} />
        <Stack.Screen name="SignerAdvanceSettings" component={SignerAdvanceSettings} />
      </Stack.Navigator>
    </RealmProvider>
  );
};
const Navigator = () => {
  const Stack = createNativeStackNavigator();
  const navigation = useRef();
  const { appLoading, loadingContent } = useContext(AppContext);

  // Register the navigation container with the instrumentation
  const onReady = () => {
    routingInstrumentation.registerNavigationContainer(navigation);
  };
  return (
    <NavigationContainer theme={defaultTheme} ref={navigation} onReady={onReady}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginStack" component={LoginStack} />
        <Stack.Screen name="App" component={AppStack} />
      </Stack.Navigator>
      <KeeperLoader
        visible={appLoading}
        loadingContent={loadingContent}
        close={() => {}}
        title={'please wait'}
        subTitle={'loading'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        textColor={'#000'}
      />
    </NavigationContainer>
  );
};

export default Navigator;
