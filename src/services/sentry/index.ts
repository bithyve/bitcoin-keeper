import * as Sentry from '@sentry/react-native';

import { CaptureContext, SeverityLevel } from '@sentry/types';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';

import config, { APP_STAGE } from 'src/utils/service-utilities/config';

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

const sentryConfig: Sentry.ReactNativeOptions = {
  maxBreadcrumbs: 50,
  tracesSampleRate: 1.0,
  dsn: config.SENTRY_DNS,
  environment: APP_STAGE.DEVELOPMENT,
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
    }),
  ],
};


export const captureError = (error: Error, context?: CaptureContext) => {
  try {
    if (!config.isDevMode()) return null;
    console.log('@captureError: ', error);
    return Sentry.captureException(error, context);
  } catch (err) {
    console.log(err);
  }
};

export const logMessage = (message: string, captureContext?: CaptureContext | SeverityLevel) => {
  config.isDevMode() && Sentry.captureMessage(message, captureContext);
};

export const SentryWrapper = (App) => {
  return Sentry.wrap(App);
};

export const SentryErrorBoundary = (component) => {
  return Sentry.withErrorBoundary(component, errorBourndaryOptions);
};

export const initializeSentry = () => {
  config.isDevMode() && Sentry.init({ ...sentryConfig, enabled: true });
};

export const getRoutingInstrumentation = () => new Sentry.ReactNavigationInstrumentation();

export { routingInstrumentation };
