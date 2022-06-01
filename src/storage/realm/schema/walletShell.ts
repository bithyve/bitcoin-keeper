import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const WalletShellShcema: ObjectSchema = {
  name: RealmSchema.WalletShell,
  embedded: true,
  properties: {
    shellId: 'string',
    walletInstanceCount: '{}',
    wallets: 'Wallet[]',
    trigger: 'TriggerPolicy?',
  },
  primaryKey: 'shellId',
};
