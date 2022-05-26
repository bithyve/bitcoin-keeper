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

export const WalletShellShcema: ObjectSchema = {
  name: 'WalletShell',
  embedded: true,
  properties: {},
};

export const VaultShellSchema: ObjectSchema = {
  name: 'VaultShell',
  embedded: true,
  properties: {},
};

export const NodeConnectSchema: ObjectSchema = {
  name: 'NodeConnect',
  embedded: true,
  properties: {},
};

export const UserTierSchema: ObjectSchema = {
  name: 'UserTier',
  embedded: true,
  properties: {},
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
    uai: 'any?',
    userTier: 'UserTier',
    version: 'string',
  },
  primaryKey: 'appId',
};
