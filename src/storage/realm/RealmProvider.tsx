import React, { createContext, useMemo } from 'react';

import { createRealmContext } from '@realm/react';
import schema from './schema';
import { useAppSelector } from 'src/store/hooks';
import { RealmDatabase } from './realm';
import { stringToArrayBuffer } from 'src/store/sagas/login';

export const realmConfig = (key) => {
  return {
    path: RealmDatabase.file,
    schema,
    schemaVersion: RealmDatabase.schemaVersion,
    encryptionKey: key,
  };
};

export const RealmWrapperContext = createContext({});

export const RealmProvider = ({ children }) => {
  const key = useAppSelector((state) => state?.login?.key);
  const bufferKey = stringToArrayBuffer(key);
  const RealmContext = useMemo(() => createRealmContext(realmConfig(bufferKey)), [key]);
  if (key) {
    const { useQuery, useRealm, useObject } = RealmContext;
    return (
      <RealmWrapperContext.Provider value={{ useQuery, useRealm, useObject }}>
        <RealmContext.RealmProvider>{children}</RealmContext.RealmProvider>
      </RealmWrapperContext.Provider>
    );
  } else {
    return <>{children}</>;
  }
};
