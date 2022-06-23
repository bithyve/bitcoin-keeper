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
} from './wallets';
import { VaultPresentationDataSchema, VaultSchema, VaultSpecsSchema } from './vaults';
import { VaultShellInstancesShcema, VaultShellSchema } from './vaultShell';
import { WalletShellInstancesShcema, WalletShellShcema } from './walletShell';

import { InheritancePolicySchema } from './inheritancePolicy';
import { KeeperAppSchema } from './app';
import { NodeConnectSchema } from './nodeConnect';
import { TriggerPolicySchema } from './triggerPolicy';
import { TwoFADetailsSchema } from './twoFADetails';
import { UAISchema } from './uai';
import { UserTierSchema } from './userTier';
import { VaultSignerSchema } from './vaultSigner';

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
  UserTierSchema,
  UAISchema,
  VaultSignerSchema,
];
