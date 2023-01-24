import {
  BIP85ConfigSchema,
  ActiveAddressesSchema,
  TransactionSchema,
  TransactionToAddressMappingSchema,
  UTXOSchema,
  WalletDerivationDetailsSchema,
  WalletPresentationDataSchema,
  WalletSchema,
  WalletSpecsSchema,
} from './wallet';
import {
  VaultPresentationDataSchema,
  VaultSchema,
  VaultSpecsSchema,
  VaultSignerSchema,
  SignerPolicy,
  XpubDetailsSchema,
} from './vault';
import { VaultShellInstancesShcema, VaultShellSchema } from './vaultShell';
import { WalletShellInstancesShcema, WalletShellShcema } from './walletShell';

import { KeeperAppSchema } from './app';
import { TriggerPolicySchema } from './triggerPolicy';
import { SigningServerSetupSchema } from './signingServerSetup';
import { UAISchema } from './uai';
import { NotificationSchema, additionalInfoSchema } from './notitfication';
import { VersionHistorySchema } from './versionHistory';
import { BackupHistorySchema } from './backupHistory';
import { StoreSubscriptionSchema } from './subscription';
import { BackupSchema } from './backup';

export default [
  KeeperAppSchema,
  StoreSubscriptionSchema,
  WalletSchema,
  WalletDerivationDetailsSchema,
  WalletPresentationDataSchema,
  BIP85ConfigSchema,
  ActiveAddressesSchema,
  UTXOSchema,
  TransactionSchema,
  TransactionToAddressMappingSchema,
  WalletSpecsSchema,
  WalletShellShcema,
  WalletShellInstancesShcema,
  TriggerPolicySchema,
  VaultSchema,
  XpubDetailsSchema,
  VaultPresentationDataSchema,
  SignerPolicy,
  VaultSpecsSchema,
  VaultShellSchema,
  VaultShellInstancesShcema,
  SigningServerSetupSchema,
  BackupSchema,
  UAISchema,
  NotificationSchema,
  additionalInfoSchema,
  VaultSignerSchema,
  VersionHistorySchema,
  BackupHistorySchema,
];
