import * as Sentry from '@sentry/react-native';

import { CaptureContext, SeverityLevel, User } from '@sentry/types';

import config from 'src/core/config';

export const sentryConfig = {
  maxBreadcrumbs: 50,
  tracesSampleRate: 1.0,
  dsn: config.SENTRY_DNS,
  environment: config.APP_STAGE,
};

export const identifyUser = (id: string) => {
  const user: User = { id };
  return Sentry.setUser(user);
};

export const captureError = (error: Error, context?: CaptureContext) => {
  return Sentry.captureException(error, context);
};

export const logMessage = (message: string, captureContext?: CaptureContext | SeverityLevel) => {
  return Sentry.captureMessage(message, captureContext);
};
