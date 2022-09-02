import * as Sentry from '@sentry/react-native';

import { CaptureContext, SeverityLevel } from '@sentry/types';

import config from 'src/core/config';

export const sentryConfig = {
  maxBreadcrumbs: 50,
  tracesSampleRate: 1.0,
  dsn: config.SENTRY_DNS,
  environment: config.APP_STAGE,
};

export const captureError = (error: Error, context?: CaptureContext) => {
  Sentry.captureException(error, context);
};

export const logMessage = (message: string, captureContext?: CaptureContext | SeverityLevel) => {
  Sentry.captureMessage(message, captureContext);
};
