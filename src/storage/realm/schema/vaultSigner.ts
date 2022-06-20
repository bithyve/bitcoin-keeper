import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

export const VaultSignerSchema: ObjectSchema = {
  name: RealmSchema.VaultSigner,
  primaryKey: 'signerId',
  properties: {
    signerId: 'string',
    signerName: 'string',
    type: 'string',
    xpub: 'string',
    derivation: 'string',
  },
};
