import { KeeperAppSchema } from './app';
import { WalletSchema } from './wallets';
import { TriggerPolicySchema } from './triggerPolicy';
import { VaultShcema } from './vaults';
import { InheritancePolicySchema } from './inheritancePolicy';
import { TwoFADetailsSchema } from './twoFADetails';
import { NodeConnectSchema } from './nodeConnect';
import { UserTierSchema } from './userTier';
import { UAISchema } from './uai';
import { WalletShellShcema } from './walletShell';
import { VaultShellSchema } from './vaultShell';

export default [
  KeeperAppSchema,
  WalletShellShcema,
  WalletSchema,
  TriggerPolicySchema,
  VaultShellSchema,
  VaultShcema,
  InheritancePolicySchema,
  TwoFADetailsSchema,
  NodeConnectSchema,
  UserTierSchema,
  UAISchema,
];
