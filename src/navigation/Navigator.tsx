import {
  CommonActions,
  DefaultTheme,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import React, { useContext, useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getRoutingInstrumentation } from 'src/services/sentry';
import AddDescription from 'src/screens/Vault/AddDescription';
import AddSendAmount from 'src/screens/Send/AddSendAmount';
import AddSigningDevice from 'src/screens/Vault/AddSigningDevice';
import AppVersionHistory from 'src/screens/AppSettings/AppVersionHistoty';
import ArchivedVault from 'src/screens/Vault/ArchivedVault';
import BackupWallet from 'src/screens/BackupWallet/BackupWallet';
import ChangeLanguage from 'src/screens/AppSettings/ChangeLanguage';
import ChoosePlan from 'src/screens/ChoosePlanScreen/ChoosePlan';
import ChoosePolicyNew from 'src/screens/Vault/ChoosePolicyNew';
import CreatePin from 'src/screens/LoginScreen/CreatePin';
import EnterSeedScreen from 'src/screens/Recovery/EnterSeedScreen';
import ExportSeedScreen from 'src/screens/SeedScreens/ExportSeedScreen';
import SeedDetailsScreen from 'src/screens/SeedScreens/SeedDetailsScreen';
import KeeperLoader from 'src/components/KeeperLoader';
import NewKeeperApp from 'src/screens/NewKeeperAppScreen/NewKeeperAppScreen';
import OnBoardingSlides from 'src/screens/Splash/OnBoardingSlides';
import { RealmProvider } from 'src/storage/realm/RealmProvider';
import ReceiveScreen from 'src/screens/Recieve/ReceiveScreen';
import RegisterWithQR from 'src/screens/QRScreens/RegisterWithQR';
import ResetPin from 'src/screens/LoginScreen/ResetPin';
import ScanQR from 'src/screens/QRScreens/ScanQR';
import ShowPSBT from 'src/screens/QRScreens/ShowPSBT';
import SendConfirmation from 'src/screens/Send/SendConfirmation';
import SendScreen from 'src/screens/Send/SendScreen';
import SetupColdCard from 'src/screens/SigningDevices/SetupColdCard';
import SetupInheritance from 'src/screens/Inheritance/SetupInheritance';
import PreviewPDF from 'src/screens/Inheritance/components/PreviewPDF';
import InheritanceStatus from 'src/screens/Inheritance/InheritanceStatus';
import InheritanceSetupInfo from 'src/screens/Inheritance/InheritanceSetupInfo';
import IKSAddEmailPhone from 'src/screens/Inheritance/IKSAddEmailPhone';
import EnterOTPEmailConfirmation from 'src/screens/Inheritance/EnterOTPEmailConfirmation';
import SignTransactionScreen from 'src/screens/SignTransaction/SignTransactionScreen';
import SignWithColdCard from 'src/screens/SignTransaction/SignWithColdCard';
import SignWithQR from 'src/screens/SignTransaction/SignWithQR';
import SignerAdvanceSettings from 'src/screens/Vault/SignerAdvanceSettings';
import SigningDeviceDetails from 'src/screens/Vault/SigningDeviceDetails';
import SignerCategoryList from 'src/screens/Vault/SignerCategoryList';
import SigningDeviceList from 'src/screens/Vault/SigningDeviceList';
import SplashScreen from 'src/screens/Splash/SplashScreen';
import TimelockScreen from 'src/screens/Vault/TimelockScreen';
import TorSettings from 'src/screens/AppSettings/TorSettings';
import ManageWallets from 'src/screens/AppSettings/ManageWallets';
import TransactionDetails from 'src/screens/ViewTransactions/TransactionDetails';
import TransactionAdvancedDetails from 'src/screens/ViewTransactions/TransactionAdvancedDetails';
import TransactionHistory from 'src/screens/ViewTransactions/TransactionHistory';
import VaultDetails from 'src/screens/Vault/VaultDetails';
import VaultSettings from 'src/screens/Vault/VaultSettings';
import AllTransactions from 'src/screens/Vault/AllTransactions';
import WalletBackHistoryScreen from 'src/screens/BackupWallet/WalletBackHistoryScreen';
import WalletDetails from 'src/screens/WalletDetails/WalletDetails';
import WalletSettings from 'src/screens/WalletDetails/WalletSettings';
import Colors from 'src/theme/Colors';
import NodeSettings from 'src/screens/AppSettings/Node/NodeSettings';
import ConnectChannel from 'src/screens/Channel/ConnectChannel';
import RegisterWithChannel from 'src/screens/QRScreens/RegisterWithChannel';
import SignWithChannel from 'src/screens/QRScreens/SignWithChannel';
import SigningDeviceConfigRecovery from 'src/screens/Recovery/SigningDeviceConfigRecovery';
import ScanQRFileRecovery from 'src/screens/Recovery/ScanQRFileRecovery';
import PoolSelection from 'src/screens/Mix/PoolSelection';
import BroadcastPremix from 'src/screens/Mix/BroadcastPremix';
import WhirlpoolConfiguration from 'src/screens/Mix/WhirlpoolConfiguration';
import UTXOLabeling from 'src/screens/UTXOManagement/UTXOLabeling';
import UTXOManagement from 'src/screens/UTXOManagement/UTXOManagement';
import MixProgress from 'src/screens/Mix/MixProgress';
import ImportWalletDetailsScreen from 'src/screens/ImportWalletDetailsScreen/ImportWalletDetailsScreen';
import AddDetailsFinalScreen from 'src/screens/ImportWalletDetailsScreen/AddDetailsFinalScreen';
import UpdateWalletDetails from 'src/screens/WalletDetails/UpdateWalletDetails';
import AssignSignerType from 'src/screens/Vault/AssignSignerType';
import CosignerDetails from 'src/screens/WalletDetails/CosignerDetails';
import WalletDetailsSettings from 'src/screens/WalletDetails/WalletDetailsSettings';
import GenerateVaultDescriptor from 'src/screens/Vault/GenerateVaultDescriptor';
import { AppContext } from 'src/context/AppContext';
import SetupTapsigner from 'src/screens/SigningDevices/SetupTapsigner';
import SetupSeedWordSigner from 'src/screens/SigningDevices/SetupSeedWordSigner';
import SetupOtherSDScreen from 'src/screens/SigningDevices/SetupOtherSDScreen';
import SetupCollaborativeWallet from 'src/screens/SigningDevices/SetupCollaborativeWallet';
import SetupSigningServer from 'src/screens/SigningDevices/SetupSigningServer';
import UnlockTapsigner from 'src/screens/SigningDevices/UnlockTapsigner';
import ChangeTapsignerPin from 'src/screens/SigningDevices/ChangeTapsignerPin';
import UTXOSelection from 'src/screens/Send/UTXOSelection';
import PrivacyAndDisplay from 'src/screens/AppSettings/PrivacyAndDisplay';
import NetworkSetting from 'src/screens/AppSettings/NetworkSetting';
import VaultConfigurationCreation from 'src/screens/Vault/VaultConfigurationRecreation';
import AddNewWallet from 'src/screens/AddWalletScreen/AddNewWallet';
import ConfirmWalletDetails from 'src/screens/AddWalletScreen/ConfirmWalletDetails';
import HomeScreen from 'src/screens/Home/HomeScreen';
import ManageSigners from 'src/screens/SigningDevices/ManageSigners';
import AppBackupSettings from 'src/screens/AppSettings/AppBackupSettings';
import WalletPathScreen from 'src/screens/EnterWalletDetailScreen/WalletPathScreen';
import InheritanceToolsAndTips from 'src/screens/InheritanceToolsAndTips/InheritanceToolsAndTips';
import DiscountCodes from 'src/screens/DiscountCodes/DiscountCodes';
import BuyBitcoinScreen from 'src/screens/BuyBitcoin/BuyBitcoinScreen';
import CloudBackupScreen from 'src/screens/CloudBackup/CloudBackupScreen';
import DeleteKeys from 'src/screens/SigningDevices/DeleteKeys';

import CanaryWallets from 'src/screens/InheritanceToolsAndTips/components/Canary';
import AssistedKeys from 'src/screens/InheritanceToolsAndTips/components/AssistedKeys';
import SafeKeepingTips from 'src/screens/InheritanceToolsAndTips/components/SafeKeepingTips';
import SafeGuardingTips from 'src/screens/InheritanceToolsAndTips/components/SafeGuardingTips';
import MasterRecoveryKey from 'src/screens/InheritanceToolsAndTips/components/MasterRecoveryKey';
import PersonalCloudBackup from 'src/screens/InheritanceToolsAndTips/components/PersonalCloudBackup';
import WalletConfigurationFiles from 'src/screens/InheritanceToolsAndTips/components/WalletConfigurationFiles';
import BackupAndRecoveryTips from 'src/screens/InheritanceToolsAndTips/components/BackupAndRecoveryTips';
import LetterOfAttorney from 'src/screens/InheritanceToolsAndTips/components/LetterOfAttorney';
import RecoveryInstruction from 'src/screens/InheritanceToolsAndTips/components/RecoveryInstruction';
import PrintableTemplates from 'src/screens/InheritanceToolsAndTips/components/PrintableTemplates';
import InheritanceTips from 'src/screens/InheritanceToolsAndTips/components/InheritanceTips';
import RecoveryPhraseTemplate from 'src/screens/InheritanceToolsAndTips/components/RecoveryPhraseTemplate';
import TrustedContactTemplates from 'src/screens/InheritanceToolsAndTips/components/TrustedContactsTemplate';
import AdditionalSignerDetailsTemplate from 'src/screens/InheritanceToolsAndTips/components/AdditionalSignerDetailsTemplate';
import HandleFileScreen from 'src/screens/SigningDevices/HandleFileScreen';
import ZendeskOnboardingModal from 'src/components/Modal/ConciergeOnboardingModal';
import PassportConfigRecovery from 'src/screens/SigningDevices/PassportConfigRecovery';
import { useAppSelector } from 'src/store/hooks';
import RemoteSharing from 'src/screens/SigningDevices/RemoteSharing';
import AssistedWalletTimeline from 'src/screens/AssistedVault/AssistedWalletTimeline';
import SetupAssistedVault from 'src/screens/SigningDevices/SetupAssistedVault';
import SignerSelectionListScreen from 'src/screens/Recieve/SignerSelectionListScreen';
import AssociateContact from 'src/screens/Contact/AssociateContact';
import AddContact from 'src/screens/Contact/AddContact';
import ContactProfile from 'src/screens/Contact/ContactProfile';
import EditContact from 'src/screens/Contact/EditContact';
import ManageTapsignerSettings from 'src/screens/Vault/ManageTapsignerSettings';
import SetupPortal from 'src/screens/SigningDevices/SetupPortal';
import SelectWalletScreen from 'src/screens/Send/SelectWallet';
import PSBTSendConfirmation from 'src/screens/Send/PSBTSendConfirmation';
import ResetInheritanceKey from 'src/screens/Vault/ResetInheritanceKey';
import AdditionalDetails from 'src/screens/Vault/AdditionalDetails';
import AddReserveKey from 'src/screens/Vault/AddReserveKey';
import { useColorMode } from 'native-base';
import Login from '../screens/LoginScreen/Login';
import { AppStackParams } from './types';
import config from 'src/utils/service-utilities/config';
import KeyHistory from 'src/screens/Vault/KeyHistory';
import NodeSelection from 'src/screens/AppSettings/Node/NodeSelection';
import KeeperConcierge from 'src/screens/KeeperConcierge/KeeperConcierge';
import TechnicalSupport from 'src/screens/KeeperConcierge/TechnicalSupport';
import TicketDetails from 'src/screens/KeeperConcierge/TicketDetails';
import CreateTicket from 'src/screens/KeeperConcierge/CreateTicket';
import ImportContactFile from 'src/screens/SigningDevices/ImportContactFile';
import ContactDetails from 'src/screens/SigningDevices/ContactDetails';
import ShareQR from 'src/screens/SigningDevices/ShareQR';
import ScanNode from 'src/screens/AppSettings/Node/ScanNode';
import NotificationsCenter from 'src/screens/Home/Notifications/NotificationsCenter';
import SettingsApp from 'src/screens/Home/components/Settings/AppSettings';
import InheritanceDocumentScreen from 'src/screens/Home/components/Settings/InheritanceDocumentScreen';
import KeeperModal from 'src/components/KeeperModal';
import { Box } from 'native-base';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import ErrorIllustration from 'src/assets/images/invalid-seed-illustration.svg';

function LoginStack() {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        options={{ gestureEnabled: false }}
        name="Splash"
        component={withErrorBoundary(SplashScreen)}
      />
      <Stack.Screen
        options={{ gestureEnabled: false }}
        name="Login"
        component={withErrorBoundary(Login)}
      />
      <Stack.Screen
        options={{ gestureEnabled: false }}
        name="CreatePin"
        component={withErrorBoundary(CreatePin)}
      />
      <Stack.Screen
        options={{ gestureEnabled: false }}
        name="ResetPin"
        component={withErrorBoundary(ResetPin)}
      />
      <Stack.Screen name="NodeSettings" component={withErrorBoundary(NodeSettings)} />
      <Stack.Screen name="NodeSelection" component={withErrorBoundary(NodeSelection)} />
      <Stack.Screen name="ScanNode" component={withErrorBoundary(ScanNode)} />
      <Stack.Screen
        options={{ gestureEnabled: false }}
        name="OnBoardingSlides"
        component={withErrorBoundary(OnBoardingSlides)}
      />
      <Stack.Screen
        name="NewKeeperApp"
        options={{ gestureEnabled: false }}
        component={withErrorBoundary(NewKeeperApp)}
      />
      {/* Cold Card */}
      <Stack.Screen name="AddColdCardRecovery" component={withErrorBoundary(SetupColdCard)} />
      {/* Tap Signer  */}
      <Stack.Screen name="AddTapsignerRecovery" component={withErrorBoundary(SetupTapsigner)} />
      {/* QR Based SDs */}
      <Stack.Screen
        options={{ gestureEnabled: false }}
        name="ScanQR"
        component={withErrorBoundary(ScanQR)}
      />
      {/* Channel Based SDs */}
      <Stack.Screen name="ConnectChannel" component={withErrorBoundary(ConnectChannel)} />
      {/* Mobile Key, Seed Key */}
      <Stack.Screen name="EnterSeedScreen" component={withErrorBoundary(EnterSeedScreen)} />
      <Stack.Screen name="UnlockTapsigner" component={withErrorBoundary(UnlockTapsigner)} />
      {/* Other SD */}
      <Stack.Screen name="SetupOtherSDScreen" component={withErrorBoundary(SetupOtherSDScreen)} />
    </Stack.Navigator>
  );
}

function AppStack() {
  const Stack = createNativeStackNavigator<AppStackParams>();
  return (
    <RealmProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={withErrorBoundary(HomeScreen)} />
        <Stack.Screen
          name="NotificationsCenter"
          component={withErrorBoundary(NotificationsCenter)}
        />
        <Stack.Screen name="Login" component={withErrorBoundary(Login)} />
        <Stack.Screen name="SignerCategoryList" component={withErrorBoundary(SignerCategoryList)} />
        <Stack.Screen name="SigningDeviceList" component={withErrorBoundary(SigningDeviceList)} />
        <Stack.Screen name="TapsignerAction" component={withErrorBoundary(SetupTapsigner)} />
        <Stack.Screen name="SetupPortal" component={withErrorBoundary(SetupPortal)} />
        <Stack.Screen name="AddColdCard" component={withErrorBoundary(SetupColdCard)} />
        <Stack.Screen
          name="PassportConfigRecovery"
          component={withErrorBoundary(PassportConfigRecovery)}
        />
        <Stack.Screen name="AppVersionHistory" component={withErrorBoundary(AppVersionHistory)} />
        <Stack.Screen name="TorSettings" component={withErrorBoundary(TorSettings)} />
        <Stack.Screen name="ManageWallets" component={withErrorBoundary(ManageWallets)} />
        <Stack.Screen name="SetupInheritance" component={withErrorBoundary(SetupInheritance)} />
        <Stack.Screen name="PreviewPDF" component={withErrorBoundary(PreviewPDF)} />
        <Stack.Screen name="InheritanceStatus" component={withErrorBoundary(InheritanceStatus)} />
        <Stack.Screen
          name="InheritanceSetupInfo"
          component={withErrorBoundary(InheritanceSetupInfo)}
        />
        <Stack.Screen name="IKSAddEmailPhone" component={withErrorBoundary(IKSAddEmailPhone)} />
        <Stack.Screen
          name="EnterOTPEmailConfirmation"
          component={withErrorBoundary(EnterOTPEmailConfirmation)}
        />
        <Stack.Screen name="Send" component={withErrorBoundary(SendScreen)} />
        <Stack.Screen name="SelectWallet" component={withErrorBoundary(SelectWalletScreen)} />
        <Stack.Screen name="UTXOLabeling" component={withErrorBoundary(UTXOLabeling)} />
        <Stack.Screen name="Receive" component={withErrorBoundary(ReceiveScreen)} />
        <Stack.Screen
          name="SignerSelectionListScreen"
          component={withErrorBoundary(SignerSelectionListScreen)}
        />
        <Stack.Screen name="ChangeLanguage" component={withErrorBoundary(ChangeLanguage)} />
        <Stack.Screen name="ChoosePlan" component={withErrorBoundary(ChoosePlan)} />
        <Stack.Screen
          name="ConfirmWalletDetails"
          component={withErrorBoundary(ConfirmWalletDetails)}
        />
        <Stack.Screen name="EnterWalletPath" component={withErrorBoundary(WalletPathScreen)} />
        <Stack.Screen
          name="UpdateWalletDetails"
          component={withErrorBoundary(UpdateWalletDetails)}
        />
        <Stack.Screen
          name="WalletDetailsSettings"
          component={withErrorBoundary(WalletDetailsSettings)}
        />
        <Stack.Screen name="ExportSeed" component={withErrorBoundary(ExportSeedScreen)} />
        <Stack.Screen name="SeedDetails" component={withErrorBoundary(SeedDetailsScreen)} />
        <Stack.Screen
          name="ImportWalletDetails"
          component={withErrorBoundary(ImportWalletDetailsScreen)}
        />
        <Stack.Screen name="AddDetailsFinal" component={withErrorBoundary(AddDetailsFinalScreen)} />
        <Stack.Screen name="AddSendAmount" component={withErrorBoundary(AddSendAmount)} />
        <Stack.Screen name="SendConfirmation" component={withErrorBoundary(SendConfirmation)} />
        <Stack.Screen
          name="PSBTSendConfirmation"
          component={withErrorBoundary(PSBTSendConfirmation)}
        />
        <Stack.Screen name="WalletDetails" component={withErrorBoundary(WalletDetails)} />
        <Stack.Screen name="VaultDetails" component={withErrorBoundary(VaultDetails)} />
        <Stack.Screen name="UTXOManagement" component={withErrorBoundary(UTXOManagement)} />
        <Stack.Screen name="WalletSettings" component={withErrorBoundary(WalletSettings)} />
        <Stack.Screen name="BackupWallet" component={withErrorBoundary(BackupWallet)} />
        <Stack.Screen
          name="SigningDeviceDetails"
          component={withErrorBoundary(SigningDeviceDetails)}
        />
        <Stack.Screen
          name="WalletBackHistory"
          component={withErrorBoundary(WalletBackHistoryScreen)}
        />
        <Stack.Screen name="AppBackupSettings" component={withErrorBoundary(AppBackupSettings)} />
        <Stack.Screen
          name="SignTransactionScreen"
          component={withErrorBoundary(SignTransactionScreen)}
        />
        <Stack.Screen name="AddSigningDevice" component={withErrorBoundary(AddSigningDevice)} />
        <Stack.Screen
          name="InheritanceToolsAndTips"
          component={withErrorBoundary(InheritanceToolsAndTips)}
        />
        <Stack.Screen name="DiscountCodes" component={withErrorBoundary(DiscountCodes)} />
        <Stack.Screen name="CanaryWallets" component={withErrorBoundary(CanaryWallets)} />
        <Stack.Screen name="AssistedKeys" component={withErrorBoundary(AssistedKeys)} />
        <Stack.Screen name="SafeKeepingTips" component={withErrorBoundary(SafeKeepingTips)} />
        <Stack.Screen name="SafeGuardingTips" component={withErrorBoundary(SafeGuardingTips)} />
        <Stack.Screen name="MasterRecoveryKey" component={withErrorBoundary(MasterRecoveryKey)} />
        <Stack.Screen
          name="PersonalCloudBackup"
          component={withErrorBoundary(PersonalCloudBackup)}
        />
        <Stack.Screen
          name="WalletConfigurationFiles"
          component={withErrorBoundary(WalletConfigurationFiles)}
        />
        <Stack.Screen
          name="BackupAndRecoveryTips"
          component={withErrorBoundary(BackupAndRecoveryTips)}
        />
        <Stack.Screen name="LetterOfAttorney" component={withErrorBoundary(LetterOfAttorney)} />
        <Stack.Screen
          name="RecoveryInstruction"
          component={withErrorBoundary(RecoveryInstruction)}
        />
        <Stack.Screen name="PrintableTemplates" component={withErrorBoundary(PrintableTemplates)} />
        <Stack.Screen name="InheritanceTips" component={withErrorBoundary(InheritanceTips)} />
        <Stack.Screen
          name="RecoveryPhraseTemplate"
          component={withErrorBoundary(RecoveryPhraseTemplate)}
        />
        <Stack.Screen
          name="TrustedContactTemplates"
          component={withErrorBoundary(TrustedContactTemplates)}
        />
        <Stack.Screen
          name="AdditionalSignerDetailsTemplate"
          component={withErrorBoundary(AdditionalSignerDetailsTemplate)}
        />

        <Stack.Screen name="SetupSigningServer" component={withErrorBoundary(SetupSigningServer)} />
        <Stack.Screen
          name="SetupSeedWordSigner"
          component={withErrorBoundary(SetupSeedWordSigner)}
        />
        <Stack.Screen name="ArchivedVault" component={withErrorBoundary(ArchivedVault)} />
        <Stack.Screen name="VaultSettings" component={withErrorBoundary(VaultSettings)} />
        <Stack.Screen name="SignWithColdCard" component={withErrorBoundary(SignWithColdCard)} />
        <Stack.Screen name="ChoosePolicyNew" component={withErrorBoundary(ChoosePolicyNew)} />
        <Stack.Screen name="AddDescription" component={withErrorBoundary(AddDescription)} />
        <Stack.Screen name="AllTransactions" component={withErrorBoundary(AllTransactions)} />
        <Stack.Screen name="TransactionDetails" component={withErrorBoundary(TransactionDetails)} />
        <Stack.Screen name="TransactionHistory" component={withErrorBoundary(TransactionHistory)} />
        <Stack.Screen
          name="TransactionAdvancedDetails"
          component={withErrorBoundary(TransactionAdvancedDetails)}
        />
        <Stack.Screen name="TimelockScreen" component={withErrorBoundary(TimelockScreen)} />
        <Stack.Screen
          name="SignerAdvanceSettings"
          component={withErrorBoundary(SignerAdvanceSettings)}
        />
        <Stack.Screen name="ScanQR" component={withErrorBoundary(ScanQR)} />
        <Stack.Screen name="ShowPSBT" component={withErrorBoundary(ShowPSBT)} />
        <Stack.Screen name="RegisterWithQR" component={withErrorBoundary(RegisterWithQR)} />
        <Stack.Screen name="SignWithQR" component={withErrorBoundary(SignWithQR)} />
        <Stack.Screen name="NodeSettings" component={withErrorBoundary(NodeSettings)} />
        <Stack.Screen name="NodeSelection" component={withErrorBoundary(NodeSelection)} />
        <Stack.Screen name="ScanNode" component={withErrorBoundary(ScanNode)} />
        <Stack.Screen name="PrivacyAndDisplay" component={withErrorBoundary(PrivacyAndDisplay)} />
        <Stack.Screen name="NetworkSetting" component={withErrorBoundary(NetworkSetting)} />
        <Stack.Screen name="ConnectChannel" component={withErrorBoundary(ConnectChannel)} />
        <Stack.Screen
          name="RegisterWithChannel"
          component={withErrorBoundary(RegisterWithChannel)}
        />
        <Stack.Screen name="SetupOtherSDScreen" component={withErrorBoundary(SetupOtherSDScreen)} />
        <Stack.Screen name="SignWithChannel" component={withErrorBoundary(SignWithChannel)} />
        <Stack.Screen name="PoolSelection" component={withErrorBoundary(PoolSelection)} />
        <Stack.Screen name="BroadcastPremix" component={withErrorBoundary(BroadcastPremix)} />
        <Stack.Screen
          name="WhirlpoolConfiguration"
          component={withErrorBoundary(WhirlpoolConfiguration)}
        />
        <Stack.Screen name="CosignerDetails" component={withErrorBoundary(CosignerDetails)} />
        <Stack.Screen name="AdditionalDetails" component={withErrorBoundary(AdditionalDetails)} />
        <Stack.Screen name="KeyHistory" component={withErrorBoundary(KeyHistory)} />
        <Stack.Screen name="RemoteSharing" component={withErrorBoundary(RemoteSharing)} />
        <Stack.Screen
          name="GenerateVaultDescriptor"
          component={withErrorBoundary(GenerateVaultDescriptor)}
        />
        <Stack.Screen
          name="SetupCollaborativeWallet"
          component={withErrorBoundary(SetupCollaborativeWallet)}
        />
        <Stack.Screen name="EnterSeedScreen" component={withErrorBoundary(EnterSeedScreen)} />
        <Stack.Screen name="UnlockTapsigner" component={withErrorBoundary(UnlockTapsigner)} />
        <Stack.Screen name="ChangeTapsignerPin" component={withErrorBoundary(ChangeTapsignerPin)} />
        <Stack.Screen name="UTXOSelection" component={withErrorBoundary(UTXOSelection)} />
        <Stack.Screen
          name="VaultConfigurationCreation"
          component={withErrorBoundary(VaultConfigurationCreation)}
        />
        <Stack.Screen name="ScanQRFileRecovery" component={withErrorBoundary(ScanQRFileRecovery)} />
        <Stack.Screen
          name="SigningDeviceConfigRecovery"
          component={withErrorBoundary(SigningDeviceConfigRecovery)}
        />
        <Stack.Screen
          name="MixProgress"
          component={withErrorBoundary(MixProgress)}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="AssignSignerType" component={withErrorBoundary(AssignSignerType)} />
        <Stack.Screen name="AddNewWallet" component={withErrorBoundary(AddNewWallet)} />
        <Stack.Screen name="SettingApp" component={withErrorBoundary(SettingsApp)} />
        <Stack.Screen
          name="InheritanceDocumentScreen"
          component={withErrorBoundary(InheritanceDocumentScreen)}
        />
        <Stack.Screen name="ManageSigners" component={withErrorBoundary(ManageSigners)} />
        <Stack.Screen name="BuyBitcoin" component={withErrorBoundary(BuyBitcoinScreen)} />
        <Stack.Screen name="CloudBackup" component={withErrorBoundary(CloudBackupScreen)} />
        <Stack.Screen name="DeleteKeys" component={withErrorBoundary(DeleteKeys)} />
        <Stack.Screen name="HandleFile" component={withErrorBoundary(HandleFileScreen)} />
        <Stack.Screen
          name="AssistedWalletTimeline"
          component={withErrorBoundary(AssistedWalletTimeline)}
        />
        <Stack.Screen name="SetupAssistedVault" component={withErrorBoundary(SetupAssistedVault)} />
        <Stack.Screen name="AssociateContact" component={withErrorBoundary(AssociateContact)} />
        <Stack.Screen name="AddContact" component={withErrorBoundary(AddContact)} />
        <Stack.Screen name="ContactProfile" component={withErrorBoundary(ContactProfile)} />
        <Stack.Screen name="EditContact" component={withErrorBoundary(EditContact)} />
        <Stack.Screen
          name="ManageTapsignerSettings"
          component={withErrorBoundary(ManageTapsignerSettings)}
        />
        <Stack.Screen name="AddReserveKey" component={withErrorBoundary(AddReserveKey)} />
        <Stack.Screen
          name="ResetInheritanceKey"
          component={withErrorBoundary(ResetInheritanceKey)}
        />
        <Stack.Screen name="KeeperConcierge" component={withErrorBoundary(KeeperConcierge)} />
        <Stack.Screen name="TechnicalSupport" component={withErrorBoundary(TechnicalSupport)} />
        <Stack.Screen name="TicketDetails" component={withErrorBoundary(TicketDetails)} />
        <Stack.Screen name="CreateTicket" component={withErrorBoundary(CreateTicket)} />
        <Stack.Screen name="ImportContactFile" component={withErrorBoundary(ImportContactFile)} />
        <Stack.Screen name="ContactDetails" component={withErrorBoundary(ContactDetails)} />
        <Stack.Screen name="ShareQR" component={withErrorBoundary(ShareQR)} />
      </Stack.Navigator>
    </RealmProvider>
  );
}

// Create a functional component for the error UI
function ErrorFallback({ resetError, error }: { resetError: () => void; error: any }) {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(true);
  const { colorMode } = useColorMode();

  const handleGoBack = () => {
    setModalVisible(false);
    if (navigation.canGoBack()) {
      navigation.goBack();
      resetError();
    }
  };

  const handleReportIssue = () => {
    setModalVisible(false);
    resetError();
    const navigationState = {
      index: 1,
      routes: [
        { name: 'Home' },
        {
          name: 'CreateTicket',
          params: {
            tags: [ConciergeTag.ERROR_REPORT],
            screenName: navigation
              .getState()
              .routes.map((route) => route.name)
              .join(' -> '),
            errorDetails: error.toString(),
          },
        },
      ],
    };
    navigation.dispatch(CommonActions.reset(navigationState));
  };

  return (
    <Box style={{ flex: 1 }}>
      <KeeperModal
        visible={modalVisible}
        title="Keeper Encountered an Error"
        subTitle="Keeper has encountered an error, please send the issue report to our concierge team and we will help you resolve the issue."
        close={handleGoBack}
        showCloseIcon
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalWhiteContent`}
        buttonText="Report Issue"
        buttonCallback={handleReportIssue}
        secondaryButtonText="Go Back"
        secondaryCallback={handleGoBack}
        Content={() => (
          <Box style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <ErrorIllustration />
          </Box>
        )}
      />
    </Box>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorEncountered: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorEncountered: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorEncountered: error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log('Error caught:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, errorEncountered: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback resetError={this.resetError} error={this.state.errorEncountered} />;
    }
    return this.props.children;
  }
}

// Create ErrorBoundary wrapper component
function withErrorBoundary(WrappedComponent: React.ComponentType<any>) {
  return function WithErrorBoundaryComponent(props: any) {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

function Navigator() {
  const Stack = createNativeStackNavigator();
  const navigation = useRef();
  const { appLoading, loadingContent } = useContext(AppContext);
  const { colorMode } = useColorMode();
  const defaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colorMode === 'light' ? Colors.LightYellow : Colors.PrimaryBlack,
    },
  };

  // Register the navigation container with the instrumentation
  const onReady = () => {
    if (config.isDevMode()) {
      getRoutingInstrumentation().registerNavigationContainer(navigation);
    }
  };

  const { onboardingModal } = useAppSelector((state) => state.concierge);

  return (
    <NavigationContainer theme={defaultTheme} ref={navigation} onReady={onReady}>
      <ZendeskOnboardingModal visible={onboardingModal} />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginStack" component={LoginStack} />
        <Stack.Screen name="App" component={AppStack} />
      </Stack.Navigator>
      <KeeperLoader
        visible={appLoading}
        loadingContent={loadingContent}
        close={() => {}}
        title="please wait"
        subTitle="loading"
      />
    </NavigationContainer>
  );
}

export default Navigator;
