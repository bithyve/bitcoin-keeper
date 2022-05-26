import Realm from 'realm';
import { realmConfig } from './AppRealmProvider';

// DB Manager
// UI will not talk to DB directly, sagas will do via database manager
// DB manager will make robust covering moost of the use cases

export const updateRealm = async (schema: string, object: any) => {
  const realm = await Realm.open(realmConfig);
  if (realm) {
    realm.write(() => {
      realm.create(schema, object);
    });
  }
};
