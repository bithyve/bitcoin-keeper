//schema for wallet

import { ObjectSchema } from 'realm';

export const SecuritySchema: ObjectSchema = {
  embedded: true,
  name: 'Security',
  properties: {
    questionId: 'string',
    question: 'string',
    answer: 'string',
  },
};

export const WalletSchema: ObjectSchema = {
  name: 'Wallet',
  properties: {
    walletId: 'string',
    walletName: 'string?',
    userName: 'string?',
    security: 'Security?',
    primaryMnemonic: 'string',
    primarySeed: 'string',
    secondaryXpub: 'string?',
    details2FA: 'Details2FA?',
    smShare: 'string?',
    // accounts: { type: 'list', objectType: 'Account' },
    version: 'string',
  },
  primaryKey: 'walletId',
};

export const Details2faSchema: ObjectSchema = {
  name: 'Details2FA',
  embedded: true,
  properties: {
    bithyveXpub: 'string?',
    twoFAKey: 'string?',
    twoFAValidated: 'bool?',
  },
};

export const AccountShcema: ObjectSchema = {
  name: 'Account',
  embedded: true,
  properties: {
    accountType: 'string',
  },
};
