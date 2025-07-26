export const LOAD_COIN_DETAILS = 'LOAD_COIN_DETAILS';
export const GET_SWAP_QUOTE = 'GET_SWAP_QUOTE';
export const CREATE_SWAP_TNX = 'CREATE_SWAP_TNX';
export const GET_TNX_DETAILS = 'GET_TNX_DETAILS';

export const loadCoinDetails = (callback = null) => ({
  type: LOAD_COIN_DETAILS,
  callback,
});

export const getSwapQuote = ({ coinFrom, coinTo, amount, float, callback = null }) => ({
  type: GET_SWAP_QUOTE,
  coinFrom,
  coinTo,
  amount,
  float,
  callback,
});

export const createSwapTnx = ({
  float,
  coinFrom,
  coinTo,
  depositAmount,
  withdrawal,
  refund,
  rateId,
  callback = null,
}) => ({
  type: CREATE_SWAP_TNX,
  float,
  coinFrom,
  coinTo,
  depositAmount,
  withdrawal,
  refund,
  rateId,
  callback,
});

export const getTnxDetails = ({ tnxId, callback = null }) => ({
  type: GET_TNX_DETAILS,
  tnxId,
  callback,
});
