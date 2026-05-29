import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import * as Sentry from '@sentry/react-native';

import config from 'src/utils/service-utilities/config';

let isSentryInitialized = false;
let navigationIntegration: ReturnType<typeof Sentry.reactNavigationIntegration> | null = null;

const isSentryEnabled = () => config.isDevMode() && Boolean(config.SENTRY_DNS);

const getSentryConfig = () => ({
  maxBreadcrumbs: 50,
  tracesSampleRate: 1.0,
  dsn: config.SENTRY_DNS,
  environment: config.ENVIRONMENT,
  enabled: isSentryEnabled(),
});

export const initSentrySDK = () => {
  initializeSentry();
};

export const captureError = (error: Error, context?: any) => {
  try {
    if (!isSentryEnabled() || !isSentryInitialized) return null;
    console.log('@captureError: ', error);
    return Sentry.captureException(error, context);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const logMessage = (message: string, captureContext?: any) => {
  if (!isSentryEnabled() || !isSentryInitialized) return null;
  return Sentry.captureMessage(message, captureContext);
};

export const SentryWrapper = (App) => {
  if (isSentryEnabled() && typeof Sentry.wrap === 'function') {
    return Sentry.wrap(App);
  } else return App;
};

export const SentryErrorBoundary = (component) => {
  if (isSentryEnabled() && typeof Sentry.withErrorBoundary === 'function') {
    const wrappedComponent = Sentry.withErrorBoundary(component, errorBourndaryOptions);
    return typeof wrappedComponent === 'function' ? wrappedComponent : component;
  }
  return component;
};

export const initializeSentry = () => {
  if (!isSentryEnabled() || isSentryInitialized) return null;

  navigationIntegration = Sentry.reactNavigationIntegration({
    enableTimeToInitialDisplay: true,
  });

  Sentry.init({
    ...getSentryConfig(),
    integrations: [navigationIntegration],
  });

  isSentryInitialized = true;
  return true;
};

export const getSentryNavigationIntegration = () => {
  if (!isSentryEnabled()) return null;
  return navigationIntegration;
};

export const registerSentryNavigationContainer = (navigationRef) => {
  const integration = getSentryNavigationIntegration();
  if (!integration) return;

  integration.registerNavigationContainer(navigationRef);
  return null;
};

export const getRoutingInstrumentation = () => getSentryNavigationIntegration();
