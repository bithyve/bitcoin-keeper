import React, { useEffect } from 'react';
import { RealmProvider as Provider } from '@realm/react';
import { stringToArrayBuffer } from 'src/store/sagas/login';
import { useAppSelector } from 'src/store/hooks';
import { initializeSentry } from 'src/services/sentry';
import { RealmDatabase } from './realm';
import schema from './schema';

export const realmConfig = (key) => ({
  path: RealmDatabase.file,
  schema,
  schemaVersion: RealmDatabase.schemaVersion,
  encryptionKey: key,
});

const AppWithNetwork = ({ children }) => {
  useEffect(() => {
    initializeSentry();
  }, []);

  return children;
};

export function RealmProvider({ children }) {
  const key = useAppSelector((state) => state?.login?.key);
  const encKey = stringToArrayBuffer(key);
  if (!encKey) {
    return null;
  }
  return (
    <Provider
      path={RealmDatabase.file}
      schema={schema}
      schemaVersion={RealmDatabase.schemaVersion}
      encryptionKey={encKey}
    >
      <AppWithNetwork>{children}</AppWithNetwork>
    </Provider>
  );
}
