import React, { createContext, useEffect, useState } from 'react';
import { createRealmContext } from '@realm/react';
import schema from './schema';
import { useAppSelector } from 'src/store/hooks';

export const realmConfig = (key) => {
  return {
    path: 'keeper.realm',
    schema,
    schemaVersion: 6,
    // encryptionKey: key,
  };
};
export const RealmWrapperContext = createContext();

export const RealmProvider = ({ children }) => {
  const key = useAppSelector((state) => state.login.key);
  const [isKeyAvailable, setisKeyAvailable] = useState(false);
  useEffect(() => {
    if (key) {
      setisKeyAvailable(true);
    }
  }, [key]);

  if (isKeyAvailable) {
    console.log('available');
    const RealmContext = createRealmContext(realmConfig('asdf'));
    const { useQuery, useRealm } = RealmContext;
    return (
      <RealmWrapperContext.Provider value={{ isKeyAvailable, useQuery, useRealm }}>
        <RealmContext.RealmProvider>{children}</RealmContext.RealmProvider>
      </RealmWrapperContext.Provider>
    );
  } else {
    console.log('not available');
    return <>{children}</>;
  }
};
