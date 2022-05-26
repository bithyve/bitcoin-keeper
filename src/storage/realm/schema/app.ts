//schema for Keeper App
import { ObjectSchema } from 'realm';

export const Details2FASchema: ObjectSchema = {
  name: 'Details2FA',
  embedded: true,
  properties: {
    bithyveXpub: 'string?',
    twoFAKey: 'string?',
    twoFAValidated: 'bool?',
  },
};

export const WalletsShcema: ObjectSchema = {
  name: 'Wallets',
  embedded: true,
  properties: {},
};

export const TriggerPolicySchema: ObjectSchema = {
  name: 'TriggerPolicy',
  embedded: true,
  properties: {
    policyId: 'string',
    date: 'string',
    specifications: '{}',
    version: 'string',
  },
};

export const WalletShellShcema: ObjectSchema = {
  name: 'WalletShell',
  embedded: true,
  properties: {
    shellId: 'string',
    walletInstanceCount: '{}',
    wallets: 'Wallets',
    trigger: 'TriggerPolicy?',
  },
};

export const VaultsShcema: ObjectSchema = {
  name: 'Vaults',
  embedded: true,
  properties: {},
};

export const InheritancePolicySchema: ObjectSchema = {
  name: 'InheritancePolicy',
  embedded: true,
  properties: {
    policyId: 'string',
    date: 'string',
    heir: {
      type: '{}',
      properties: {
        firstName: 'string',
        lastName: 'string',
        address: 'string',
        email: 'string',
      },
    },
    user: {
      type: '{}',
      properties: {
        email: 'string',
      },
    },
    version: 'string',
  },
};

export const VaultShellSchema: ObjectSchema = {
  name: 'VaultShell',
  embedded: true,
  properties: {
    shellId: 'string',
    vaultInstanceCount: '{}',
    vaults: 'Vaults',
    inheritance: 'InheritancePolicy',
  },
};

export const NodeConnectSchema: ObjectSchema = {
  name: 'NodeConnect',
  embedded: true,
  properties: {},
};

export const UserTierSchema: ObjectSchema = {
  name: 'UserTier',
  embedded: true,
  properties: {
    level: 'string',
  },
};

export const KeeperAppSchema: ObjectSchema = {
  name: 'KeeperApp',
  properties: {
    appId: 'string',
    appName: 'string',
    primaryMnemonic: 'string',
    primarySeed: 'string',
    walletShell: 'WalletShell',
    vaultShell: 'VaultShell?',
    details2FA: 'Details2FA?',
    nodeConnect: 'NodeConnect?',
    uai: '{}?',
    userTier: 'UserTier',
    version: 'string',
  },
  primaryKey: 'appId',
};
