export const UPDATE_APP_IMAGE = 'UPDATE_APP_IMAGE';
export const GET_APP_IMAGE = 'GET_APP_IMAGE';
export const SEED_BACKEDUP = 'SEED_BACKEDUP';
export const SEED_BACKEDUP_CONFIRMED = 'SEED_BACKEDUP_CONFIRMED';

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

export const seedBackedConfirmed = (confirmed: boolean) => {
  return {
    type: SEED_BACKEDUP_CONFIRMED,
    payload: {
      confirmed,
    },
  };
};
