export const CURRENCY_CODE = 'CURRENCY_CODE';
export const FCM_TOKEN_VALUE = 'FCM_TOKEN_VALUE';

export const setCurrencyCode = (data) => ({
  type: CURRENCY_CODE,
  payload: {
    currencyCode: data,
  },
});

export const setFCMToken = (data) => ({
  type: FCM_TOKEN_VALUE,
  payload: {
    fcmTokenValue: data,
  },
});
