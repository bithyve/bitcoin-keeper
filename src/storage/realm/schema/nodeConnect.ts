import { ObjectSchema } from 'realm';
import { RealmSchema } from './enum';

export const NodeConnectSchema: ObjectSchema = {
  name: RealmSchema.NodeConnect,
  embedded: true,
  properties: {},
};
