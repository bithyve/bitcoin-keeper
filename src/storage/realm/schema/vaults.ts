import { ObjectSchema } from 'realm';

export const VaultsShcema: ObjectSchema = {
  name: 'Vaults',
  embedded: true,
  properties: {},
};

export const VaultShellSchema: ObjectSchema = {
  name: 'VaultShell',
  embedded: true,
  properties: {
    shellId: 'string',
    vaultInstanceCount: '{}',
    vaults: 'Vaults',
    inheritance: 'InheritancePolicy',
  },
};
