import React from 'react';
import { createRealmContext } from '@realm/react';
import schema from './schema';

export const realmConfig = {
  path: 'keeper.realm',
  schema,
  schemaVersion: 9,
  // encryptionKey: key,
};

export const RealmContext = createRealmContext(realmConfig);

export const RealmProvider = ({ children }) => {
  return <RealmContext.RealmProvider>{children}</RealmContext.RealmProvider>;
};
