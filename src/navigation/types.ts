import { Signer, Vault, VaultScheme, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';

export type AppStackParams = {
  Home: undefined;
  Login: undefined;
  SigningDeviceList: undefined;
  TapsignerAction: undefined;
  SignWithTapsigner: undefined;
  AddColdCard: undefined;
  PassportConfigRecovery: undefined;
  AppSettings: undefined;
  AppVersionHistory: undefined;
  TorSettings: undefined;
  ManageWallets: undefined;
  SetupInheritance: undefined;
  PreviewPDF: undefined;
  InheritanceStatus: undefined;
  InheritanceSetupInfo: undefined;
  IKSAddEmailPhone: undefined;
  EnterOTPEmailConfirmation: undefined;
  Send: undefined;
  UTXOLabeling: undefined;
  Receive: undefined;
  VerifyAddressSelectionScreen: undefined;
  ChangeLanguage: undefined;
  ChoosePlan: undefined;
  EnterWalletDetail: undefined;
  UpdateWalletDetails: undefined;
  WalletDetailsSettings: undefined;
  CollaborativeWalletSettings: undefined;
  AddAmount: undefined;
  ExportSeed: undefined;
  ImportWallet: undefined;
  ImportWalletDetails: undefined;
  AddDetailsFinal: undefined;
  AddSendAmount: undefined;
  SendConfirmation: undefined;
  WalletDetails: { autoRefresh?: boolean; walletId: string };
  VaultDetails: {
    vaultId: string;
    vaultTransferSuccessful: boolean;
    autoRefresh: boolean;
  };
  UTXOManagement:
    | {
        data: Wallet | Vault;
        routeName: string;
        accountType?: string;
        vaultId: string;
      }
    | {
        data: Wallet | Vault;
        routeName: string;
        accountType: string;
        vaultId?: string;
      };
  WalletSettings: undefined;
  InheritanceToolsAndTips: undefined;
  DiscountCodes: undefined;
  BackupWallet: undefined;
  SigningDeviceDetails: undefined;
  WalletBackHistory: undefined;
  SignTransactionScreen: undefined;
  AddSigningDevice: undefined;
  SetupSigningServer: undefined;
  SetupSeedWordSigner: undefined;
  ArchivedVault: undefined;
  VaultSettings: undefined;
  SignWithColdCard: undefined;
  ChoosePolicyNew: undefined;
  SigningServerSettings: undefined;
  SigningServer: undefined;
  AddDescription: undefined;
  AllTransactions: undefined;
  TransactionDetails: undefined;
  TimelockScreen: undefined;
  SignerAdvanceSettings: undefined;
  ScanQR: undefined;
  ShowQR: undefined;
  RegisterWithQR: undefined;
  SignWithQR: undefined;
  NodeSettings: undefined;
  PrivacyAndDisplay: undefined;
  NetworkSetting: undefined;
  ConnectChannel: undefined;
  RegisterWithChannel: undefined;
  SetupOtherSDScreen: undefined;
  SignWithChannel: undefined;
  PoolSelection: undefined;
  BroadcastPremix: undefined;
  WhirlpoolConfiguration: undefined;
  CosignerDetails: { signer: Signer };
  GenerateVaultDescriptor: undefined;
  SetupCollaborativeWallet: undefined;
  EnterSeedScreen: undefined;
  UnlockTapsigner: undefined;
  ChangeTapsignerPin: undefined;
  UTXOSelection: { sender: Wallet | Vault; amount: string; address: string };
  VaultCreationOptions: undefined;
  VaultConfigurationCreation: undefined;
  ScanQRFileRecovery: undefined;
  VaultSetup: { isRecreation: Boolean; scheme: VaultScheme; vaultId?: string };
  SigningDeviceConfigRecovery: undefined;
  MixProgress: undefined;
  AssignSignerType: undefined;
  NFCScanner: undefined;
  AddWallet: undefined;
  CanaryWallets: undefined;
  AssistedKeys: undefined;
  SafeKeepingTips: undefined;
  SafeGuardingTips: undefined;
  MasterRecoveryKey: undefined;
  PersonalCloudBackup: undefined;
  WalletConfigurationFiles: undefined;
  BackupAndRecoveryTips: undefined;
  RecoveryInstruction: undefined;
  LetterOfAttorney: undefined;
  PrintableTemplates: undefined;
  InheritanceTips: undefined;
  RecoveryPhraseTemplate: undefined;
  TrustedContactTemplates: undefined;
  AdditionalSignerDetailsTemplate: undefined;
  ManageSigners: {
    vaultId: string;
    vaultKeys: VaultSigner[];
    addedSigner: Signer;
    addSignerFlow: boolean;
    showModal?: boolean;
  };
  AppBackupSettings: undefined;
  BuyBitcoin: undefined;
  SignerSettings: undefined;
  EnterWalletPath: undefined;
  DeleteKeys: undefined;
  HandleFile: undefined;
};

// Usage:
// type ScreenProps = NativeStackScreenProps<AppStackParams, 'ScreenName'>;
// const ScreenName = ({ navigation, route }: ScreenProps) => {
