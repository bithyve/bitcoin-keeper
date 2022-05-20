import Realm from 'realm';
import { realmConfig } from './AppRealmProvider';

// DB Manager
// UI will not talk to DB directly, sagas will do.
// DB manager will made robust covering the use cases on the fly

export const updateRealm = async (schema: string, object: any) => {
  const realm = await Realm.open(realmConfig);
  if (realm) {
    realm.write(() => {
      realm.create(schema, object);
    });
  }
};
