import React from 'react';
import * as Sentry from '@sentry/react-native';
import { captureError } from 'src/services/sentry';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import dbManager from 'src/storage/realm/dbManager';

const ErrorHandler = ({ children }) => {
  const versionHistory = useQuery(RealmSchema.VersionHistory).map(getJSONFromRealmObject);

  const onScreenCrash = (error) => {
    captureError(error);
  };
  const beforeCapture = (scope) => {
    scope.addBreadcrumb({
      level: 'debug',
      data: { versionHistory },
    });
  };

  return (
    <Sentry.ErrorBoundary onError={onScreenCrash} beforeCapture={beforeCapture}>
      {children}
    </Sentry.ErrorBoundary>
  );
};

export const errorBourndaryOptions = {
  onError: (error) => {
    captureError(error);
  },
  beforeCapture: (scope) => {
    scope.addBreadcrumb({
      level: 'debug',
      data: {
        versionHistory: dbManager.getCollection(RealmSchema.VersionHistory),
      },
    });
  },
};

export default ErrorHandler;
