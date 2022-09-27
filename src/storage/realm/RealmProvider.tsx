import React, { createContext, useContext, useMemo } from 'react';

import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmDatabase } from './realm';
import { RealmSchema } from './enum';
import config from 'src/core/config';
import { createRealmContext } from '@realm/react';
import { getJSONFromRealmObject } from './utils';
import schema from './schema';
import { stringToArrayBuffer } from 'src/store/sagas/login';
import { useAppSelector } from 'src/store/hooks';

export const realmConfig = (key) => {
  return {
    path: RealmDatabase.file,
    schema,
    schemaVersion: RealmDatabase.schemaVersion,
    encryptionKey: key,
  };
};

export const RealmWrapperContext = createContext({} as any);

const AppWithNetwork = ({ children }) => {
  const { useQuery } = useContext(RealmWrapperContext);
  const { networkType }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  config.setNetwork(networkType);
  return children;
};

export const RealmProvider = ({ children }) => {
  const key = useAppSelector((state) => state?.login?.key);
  const bufferKey = stringToArrayBuffer(key);
  const RealmContext = useMemo(() => createRealmContext(realmConfig(bufferKey)), [key]);
  if (key) {
    const { useQuery, useRealm, useObject } = RealmContext;
    return (
      <RealmWrapperContext.Provider value={{ useQuery, useRealm, useObject }}>
        <RealmContext.RealmProvider>
          <AppWithNetwork>{children}</AppWithNetwork>
        </RealmContext.RealmProvider>
      </RealmWrapperContext.Provider>
    );
  } else {
    return <>{children}</>;
  }
};
