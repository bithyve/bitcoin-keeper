import React from 'react';
import { createRealmContext } from '@realm/react';
import { KeeperAppSchema } from './schema/app';

export const realmConfig = {
  schema: [KeeperAppSchema],
  schemaVersion: 1,
};

export const RealmContext = createRealmContext(realmConfig);

export const AppRelamProvider = ({ children }) => {
  return <RealmContext.RealmProvider>{children}</RealmContext.RealmProvider>;
};
