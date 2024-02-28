import { Signer, Vault, VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';

export type AppStackParams = {
  Home: undefined;
  Login: undefined;
  SigningDeviceList: undefined;
  AddTapsigner: undefined;
  SignWithTapsigner: undefined;
  AddColdCard: undefined;
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
  BackupWallet: undefined;
  SigningDeviceDetails: undefined;
  WalletBackHistory: undefined;
  SignTransactionScreen: undefined;
  AddSigningDevice: undefined;
  SetupSigningServer: undefined;
  SetupSeedWordSigner: undefined;
  InputSeedWordSigner: undefined;
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
  AddSigner: undefined;
  ManageSigners: {
    vaultId: string;
    vaultKeys: VaultSigner[];
  };
  AppBackupSettings: undefined;
};

// Usage:
// type ScreenProps = NativeStackScreenProps<AppStackParams, 'ScreenName'>;
// const ScreenName = ({ navigation, route }: ScreenProps) => {
