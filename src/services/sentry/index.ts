import * as Sentry from '@sentry/react-native';

import { CaptureContext, SeverityLevel, User } from '@sentry/types';

import config from 'src/core/config';

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

export const sentryConfig: Sentry.ReactNativeOptions = {
  maxBreadcrumbs: 50,
  tracesSampleRate: 1.0,
  dsn: config.SENTRY_DNS,
  environment: __DEV__ ? 'LOCAL' : config.ENVIRONMENT,
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
    }),
  ],
};

export const identifyUser = (id: string) => {
  const user: User = { id };
  return Sentry.setUser(user);
};

export const captureError = (error: Error, context?: CaptureContext) => {
  try {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('@captureError: ', error);
    }
    return Sentry.captureException(error, context);
  } catch (err) {
    console.log(err);
  }
};

export const logMessage = (message: string, captureContext?: CaptureContext | SeverityLevel) =>
  Sentry.captureMessage(message, captureContext);

export { routingInstrumentation };
