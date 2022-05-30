import { ObjectSchema } from 'realm';

export const WalletsShcema: ObjectSchema = {
  name: 'Wallets',
  embedded: true,
  properties: {},
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
