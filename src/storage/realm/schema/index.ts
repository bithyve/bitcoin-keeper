import { KeeperAppSchema } from './app';
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
import { TriggerPolicySchema } from './triggerPolicy';
import { VaultShcema } from './vaults';
import { InheritancePolicySchema } from './inheritancePolicy';
import { TwoFADetailsSchema } from './twoFADetails';
import { NodeConnectSchema } from './nodeConnect';
import { UserTierSchema } from './userTier';
import { UAISchema } from './uai';
import { WalletShellInstancesShcema, WalletShellShcema } from './walletShell';
import { VaultShellInstancesShcema, VaultShellSchema } from './vaultShell';

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
];
