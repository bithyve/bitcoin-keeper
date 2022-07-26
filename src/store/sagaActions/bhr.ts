export const UPDATE_APP_IMAGE = 'UPDATE_APP_IMAGE';
export const GET_APP_IMAGE = 'GET_APP_IMAGE';
export const SEED_BACKEDUP = 'SEED_BACKEDUP';
export const SEED_BACKEDUP_CONFIRMED = 'SEED_BACKEDUP_CONFIRMED';
export const INIT_CLOUD_BACKUP = 'INIT_CLOUD_BACKUP';
export const CLOUD_BACKUP_SKIPPED = 'CLOUD_BACKUP_SKIPPED';
export const CONFIRM_CLOUD_BACKUP = 'CONFIRM_CLOUD_BACKUP';

export const updateAppImage = (walletId) => {
  return {
    type: UPDATE_APP_IMAGE,
    payload: {
      walletId,
    },
  };
};

export const getAppImage = () => {
  return {
    type: GET_APP_IMAGE,
  };
};

export const seedBackedUp = () => {
  return {
    type: SEED_BACKEDUP,
  };
};

export const cloudBackupSkipped = () => {
  return {
    type: CLOUD_BACKUP_SKIPPED,
  };
};

export const confirmCloudBackup = (password: boolean) => {
  return {
    type: CONFIRM_CLOUD_BACKUP,
    payload: {
      password,
    },
  };
};

export const seedBackedConfirmed = (confirmed: boolean) => {
  return {
    type: SEED_BACKEDUP_CONFIRMED,
    payload: {
      confirmed,
    },
  };
};

export const initCloudBackup = (password: string, hint?: string) => {
  return {
    type: INIT_CLOUD_BACKUP,
    payload: {
      password,
      hint,
    },
  };
};
