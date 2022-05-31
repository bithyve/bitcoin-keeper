import { ObjectSchema } from 'realm';

export const WalletShellShcema: ObjectSchema = {
  name: 'WalletShell',
  embedded: true,
  properties: {
    shellId: 'string',
    walletInstanceCount: '{}',
    wallets: 'Wallet[]',
    trigger: 'TriggerPolicy?',
  },
};
