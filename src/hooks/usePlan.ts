import React, { useContext } from 'react';

import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { VaultScheme } from 'src/core/wallets/interfaces/vault';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';

const SUBSCRIPTION_SCHEME_MAP = {
  PLEB: {
    m: 1,
    n: 1,
  },
  HODLER: {
    m: 2,
    n: 3,
  },
  'DIAMOND HANDS': {
    m: 3,
    n: 5,
  },
};

const usePlan = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const plan = keeper.subscription.name.toUpperCase();
  const subscriptionScheme: VaultScheme = SUBSCRIPTION_SCHEME_MAP[plan];
  return { plan, subscriptionScheme };
};

export default usePlan;
