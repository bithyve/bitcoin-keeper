import Realm from 'realm';
import { UserPreferenceTable } from './UserPreferences';

const schema = [UserPreferenceTable];

export const initRealm = async (key: ArrayBuffer | ArrayBufferView | Int8Array) => {
  await Realm.open({
    path: 'keeper.realm',
    schema,
    schemaVersion: 1,
    encryptionKey: key,
    migration: (oldRealm, newRealm) => {},
  });
};
