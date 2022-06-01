import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const VaultShellSchema: ObjectSchema = {
  name: RealmSchema.VaultShell,
  properties: {
    shellId: 'string',
    vaultInstances: '{}',
    inheritancePolicyId: 'string',
  },
  primaryKey: 'shellId',
};

export const VaultShellInstancesShcema: ObjectSchema = {
  name: RealmSchema.VaultShellInstances,
  embedded: true,
  properties: {
    shells: 'string[]',
    activeShell: 'string',
  },
};
