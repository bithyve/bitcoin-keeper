import config from 'src/core/config';

export const getReleaseTopic = (appVersion?) => {
  let releaseTopic;
  switch (config.ENVIRONMENT) {
    case 'PRODUCTION':
      releaseTopic = appVersion ? `release${  appVersion}` : 'release';
      break;
    case 'DEVELOPMENT':
      releaseTopic = appVersion ? `${'release' + '_dev'}${  appVersion}` : 'release' + '_dev';
  }
  return releaseTopic;
};
