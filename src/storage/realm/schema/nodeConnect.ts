import { ObjectSchema } from 'realm';
import { RealmSchema } from '../enum';

// hosts own/private/user-provided nodes
export const NodeConnectSchema: ObjectSchema = {
  name: RealmSchema.NodeConnect,
  properties: {
    id: 'int',
    host: 'string',
    port: 'string',
    useKeeperNode: 'bool',
    isConnected: 'bool',
    useSSL: 'bool',
    isDefault: 'bool?',
  },
};

// hosts default nodes
export const DefaultNodeConnectSchema: ObjectSchema = {
  name: RealmSchema.DefaultNodeConnect,
  properties: {
    id: 'int',
    host: 'string',
    port: 'string',
    useKeeperNode: 'bool',
    isConnected: 'bool',
    useSSL: 'bool',
    isDefault: 'bool',
  },
};
