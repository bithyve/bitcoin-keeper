import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const WalletShellShcema: ObjectSchema = {
  name: RealmSchema.WalletShell,
  properties: {
    shellId: 'string',
    walletInstances: '{}',
    triggerPolicyId: 'string?',
  },
  primaryKey: 'shellId',
};

export const WalletShellInstancesShcema: ObjectSchema = {
  name: RealmSchema.WalletShellInstances,
  embedded: true,
  properties: {
    shells: 'string[]',
    activeShell: 'string',
  },
};
