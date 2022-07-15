export const UPDATE_APP_IMAGE = 'UPDATE_APP_IMAGE';

export const updateAppImage = (walletId) => {
  return {
    type: UPDATE_APP_IMAGE,
    payload: {
      walletId,
    },
  };
};
