import { VaultShellInstancesShcema, VaultShellSchema } from './vaultShell';
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
import { WalletSchema } from './wallets';

export default [
  KeeperAppSchema,
  WalletSchema,
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
