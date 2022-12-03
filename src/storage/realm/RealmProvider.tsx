import React, { createContext, useContext, useMemo } from 'react';

import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import config from 'src/core/config';
import { createRealmContext } from '@realm/react';
import { stringToArrayBuffer } from 'src/store/sagas/login';
import { useAppSelector } from 'src/store/hooks';
import { RealmDatabase } from './realm';
import { RealmSchema } from './enum';
import { getJSONFromRealmObject } from './utils';
import schema from './schema';

export const realmConfig = (key) => ({
    path: RealmDatabase.file,
    schema,
    schemaVersion: RealmDatabase.schemaVersion,
    encryptionKey: key,
  });

export const RealmWrapperContext = createContext({} as any);

const AppWithNetwork = ({ children }) => {
  const { useQuery } = useContext(RealmWrapperContext);
  const { networkType }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  config.setNetwork(networkType);
  return children;
};

export function RealmProvider({ children }) {
  const key = useAppSelector((state) => state?.login?.key);
  if (key) {
    const bufferKey = stringToArrayBuffer(key);
    const RealmContext = useMemo(() => createRealmContext(realmConfig(bufferKey)), [key]);
    const { useQuery, useRealm, useObject } = RealmContext;
    return (
      <RealmWrapperContext.Provider value={{ useQuery, useRealm, useObject }}>
        <RealmContext.RealmProvider>
          <AppWithNetwork>{children}</AppWithNetwork>
        </RealmContext.RealmProvider>
      </RealmWrapperContext.Provider>
    );
  } 
    return <>{children}</>;
  
}
