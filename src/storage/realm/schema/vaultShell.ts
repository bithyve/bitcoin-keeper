import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const VaultShellSchema: ObjectSchema = {
  name: RealmSchema.VaultShell,
  properties: {
    id: 'string',
    vaultInstances: '{}',
    inheritancePolicyId: 'string',
  },
  primaryKey: 'id',
};

export const VaultShellInstancesShcema: ObjectSchema = {
  name: RealmSchema.VaultShellInstances,
  embedded: true,
  properties: {
    shells: 'string[]',
    activeShell: 'string',
  },
};
