import React from 'react';
import { captureError } from 'src/services/sentry';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import dbManager from 'src/storage/realm/dbManager';

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
