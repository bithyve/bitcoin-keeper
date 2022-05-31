import { ObjectSchema } from 'realm';
import { RealmSchema } from './enum';

export const VaultShcema: ObjectSchema = {
  name: RealmSchema.Vault,
  embedded: true,
  properties: {},
};
