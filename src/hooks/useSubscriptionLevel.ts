import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';
import { AppSubscriptionLevel } from 'src/models/enums/SubscriptionTier';

const useSubscriptionLevel = () => {
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const level: AppSubscriptionLevel = keeper.subscription.level;
  return { level };
};

export default useSubscriptionLevel;
