import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const VaultShellSchema: ObjectSchema = {
  name: RealmSchema.VaultShell,
  embedded: true,
  properties: {
    shellId: 'string',
    vaultInstanceCount: '{}',
    vaults: 'Vault[]',
    inheritance: 'InheritancePolicy',
  },
  primaryKey: 'shellId',
};
