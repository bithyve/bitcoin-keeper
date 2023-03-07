import {
  BIP85ConfigSchema,
  TransactionSchema,
  TransactionToAddressMappingSchema,
  UTXOSchema,
  WalletDerivationDetailsSchema,
  WalletPresentationDataSchema,
  WalletSchema,
  WalletSpecsSchema,
  TransferPolicySchema,
  LabelSchema,
} from './wallet';
import {
  VaultPresentationDataSchema,
  VaultSchema,
  VaultSpecsSchema,
  VaultSignerSchema,
  SignerPolicy,
  XpubDetailsSchema,
} from './vault';
import { KeeperAppSchema } from './app';
import { UAISchema } from './uai';
import { VersionHistorySchema } from './versionHistory';
import { BackupHistorySchema } from './backupHistory';
import { StoreSubscriptionSchema } from './subscription';
import { BackupSchema } from './backup';
import { NodeConnectSchema } from './nodeConnect';

export default [
  KeeperAppSchema,
  StoreSubscriptionSchema,
  WalletSchema,
  WalletDerivationDetailsSchema,
  WalletPresentationDataSchema,
  BIP85ConfigSchema,
  UTXOSchema,
  LabelSchema,
  TransactionSchema,
  TransactionToAddressMappingSchema,
  WalletSpecsSchema,
  TransferPolicySchema,
  VaultSchema,
  XpubDetailsSchema,
  VaultPresentationDataSchema,
  SignerPolicy,
  VaultSpecsSchema,
  BackupSchema,
  UAISchema,
  VaultSignerSchema,
  VersionHistorySchema,
  BackupHistorySchema,
  NodeConnectSchema,
];
