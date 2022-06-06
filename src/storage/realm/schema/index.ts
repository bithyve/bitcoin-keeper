import { VaultShellInstancesShcema, VaultShellSchema } from './vaultShell';
import {
  ActiveAddressesSchema,
  TransactionSchema,
  TransactionToAddressMappingSchema,
  UTXOSchema,
  WalletDerivationDetailsSchema,
  WalletPresentationDataSchema,
  WalletSchema,
  WalletSpecsSchema,
} from './wallets';
import { WalletShellInstancesShcema, WalletShellShcema } from './walletShell';

import { InheritancePolicySchema } from './inheritancePolicy';
import { KeeperAppSchema } from './app';
import { NodeConnectSchema } from './nodeConnect';
import { TriggerPolicySchema } from './triggerPolicy';
import { TwoFADetailsSchema } from './twoFADetails';
import { UAISchema } from './uai';
import { UserTierSchema } from './userTier';
import { VaultShcema } from './vaults';
import { VaultSignerSchema } from './vaultSigner';

export default [
  KeeperAppSchema,
  WalletSchema,
  WalletDerivationDetailsSchema,
  WalletPresentationDataSchema,
  ActiveAddressesSchema,
  UTXOSchema,
  TransactionSchema,
  TransactionToAddressMappingSchema,
  WalletSpecsSchema,
  WalletShellShcema,
  WalletShellInstancesShcema,
  TriggerPolicySchema,
  VaultShcema,
  VaultShellSchema,
  VaultShellInstancesShcema,
  InheritancePolicySchema,
  TwoFADetailsSchema,
  NodeConnectSchema,
  UserTierSchema,
  UAISchema,
  VaultSignerSchema,
];
