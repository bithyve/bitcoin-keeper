import { ObjectSchema } from 'realm';

export const VaultShellSchema: ObjectSchema = {
  name: 'VaultShell',
  embedded: true,
  properties: {
    shellId: 'string',
    vaultInstanceCount: '{}',
    vaults: 'Vault[]',
    inheritance: 'InheritancePolicy',
  },
};
