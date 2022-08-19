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
} from './vault';
import { VaultShellInstancesShcema, VaultShellSchema } from './vaultShell';
import { WalletShellInstancesShcema, WalletShellShcema } from './walletShell';

import { InheritancePolicySchema } from './inheritancePolicy';
import { KeeperAppSchema } from './app';
import { NodeConnectSchema } from './nodeConnect';
import { TriggerPolicySchema } from './triggerPolicy';
import { TwoFADetailsSchema } from './twoFADetails';
import { UAISchema } from './uai';
import { VersionHistorySchema } from './versionHistory';
import { BackupHistorySchema } from './backupHistory';

export default [
  KeeperAppSchema,
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
  VaultPresentationDataSchema,
  VaultSpecsSchema,
  VaultShellSchema,
  VaultShellInstancesShcema,
  InheritancePolicySchema,
  TwoFADetailsSchema,
  NodeConnectSchema,
  UAISchema,
  VaultSignerSchema,
  VersionHistorySchema,
  BackupHistorySchema,
];
