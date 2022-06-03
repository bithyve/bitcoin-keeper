import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const WalletShellShcema: ObjectSchema = {
  name: RealmSchema.WalletShell,
  properties: {
    id: 'string',
    walletInstances: '{}',
    triggerPolicyId: 'string?',
  },
  primaryKey: 'id',
};

export const WalletShellInstancesShcema: ObjectSchema = {
  name: RealmSchema.WalletShellInstances,
  embedded: true,
  properties: {
    shells: 'string[]',
    activeShell: 'string',
  },
};
