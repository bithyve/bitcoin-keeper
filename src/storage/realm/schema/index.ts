import {
  BIP85ConfigSchema,
  TransactionSchema,
  UTXOSchema,
  WalletDerivationDetailsSchema,
  WalletPresentationDataSchema,
  WalletSchema,
  WalletSpecsSchema,
  LabelSchema,
  UTXOInfoSchema,
  Tags,
  AddressCacheSchema,
  BalancesSchema,
} from './wallet';
import {
  VaultPresentationDataSchema,
  VaultSchema,
  VaultSpecsSchema,
  VaultSignerSchema,
  SignerPolicy,
  VerificationOptionSchema,
  SignerXpubsSchema,
  KeySpecsSchema,
  SignerSchema,
  RegistrationInfoSchema,
  HealthCheckDetails,
  MiniscriptElementsSchema,
  MiniscriptSchemeSchema,
  VaultSchemeSchema,
  MiniscriptKeyInfoSchema,
  MiniscriptPathSchema,
  MiniscriptPhaseSchema,
  SignerPolicyExceptionsSchema,
  SignerPolicyRestrictionsSchema,
  SignerPolicyVerificationSchema,
} from './vault';
import { KeeperAppSchema } from './app';
import { UAIDetailsSchema, UAISchema } from './uai';
import { VersionHistorySchema } from './versionHistory';
import { CloudBackupHistorySchema } from './cloudBackupHistory';
import { BackupHistorySchema } from './backupHistory';
import { StoreSubscriptionSchema } from './subscription';
import { BackupSchema } from './backup';
import { DefualtNodeConnectSchema, NodeConnectSchema } from './nodeConnect';

export default [
  KeeperAppSchema,
  StoreSubscriptionSchema,
  WalletSchema,
  WalletDerivationDetailsSchema,
  WalletPresentationDataSchema,
  BIP85ConfigSchema,
  UTXOSchema,
  UTXOInfoSchema,
  Tags,
  AddressCacheSchema,
  LabelSchema,
  TransactionSchema,
  WalletSpecsSchema,
  VaultSchema,
  SignerXpubsSchema,
  KeySpecsSchema,
  SignerSchema,
  RegistrationInfoSchema,
  VaultPresentationDataSchema,
  SignerPolicy,
  VerificationOptionSchema,
  HealthCheckDetails,
  MiniscriptKeyInfoSchema,
  MiniscriptPathSchema,
  MiniscriptPhaseSchema,
  MiniscriptElementsSchema,
  MiniscriptSchemeSchema,
  VaultSchemeSchema,
  VaultSpecsSchema,
  BackupSchema,
  UAISchema,
  UAIDetailsSchema,
  VaultSignerSchema,
  VersionHistorySchema,
  BackupHistorySchema,
  NodeConnectSchema,
  DefualtNodeConnectSchema,
  CloudBackupHistorySchema,
  BalancesSchema,
  SignerPolicyExceptionsSchema,
  SignerPolicyRestrictionsSchema,
  SignerPolicyVerificationSchema,
];
