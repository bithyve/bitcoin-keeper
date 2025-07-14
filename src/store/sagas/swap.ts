import { call, put } from 'redux-saga/effects';
import Swap from 'src/services/backend/Swap';
import { setCoinDetails } from '../reducers/swap';
import { createWatcher } from '../utilities';
import {
  CREATE_SWAP_TNX,
  GET_SWAP_QUOTE,
  GET_TNX_DETAILS,
  LOAD_COIN_DETAILS,
} from '../sagaActions/swap';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';

function* loadCoinDetailsWorker({ callback }) {
  try {
    let btc;
    let usdt;
    const res = yield call(Swap.getCoins);
    res.data.forEach((coin) => {
      if (coin.code === 'BTC') btc = coin;
      else if (coin.code === 'USDT-TRC20') usdt = coin;
    });
    yield put(setCoinDetails({ btc, usdt }));
    if (callback) callback({ status: true });
  } catch (error) {
    console.log('🚀 ~ loadCoinDetailsWorker ~ error:', error);
    if (callback) callback({ status: false, error: error?.message });
  }
}

function* getSwapQuoteWorker({ coinFrom, coinTo, amount, float, callback }) {
  try {
    const body = {
      from: coinFrom.code,
      to: coinTo.code,
      network_from: coinFrom.network_code,
      network_to: coinTo.network_code,
      amount: amount,
      float: float,
    };
    const quote = yield call(Swap.getQuote, body);
    if (callback)
      callback({
        status: true,
        amount: parseFloat(quote.data.amount).toFixed(3),
        rateId: quote.data.rate_id,
      });
  } catch (error) {
    console.log('🚀 ~ getSwapQuoteWorker ~ error:', error);
    if (callback)
      callback({
        status: false,
        error: error?.message,
      });
  }
}

function* createSwapTnxWorker({
  float,
  coinFrom,
  coinTo,
  depositAmount,
  withdrawal,
  refund,
  rateId,
  callback,
}) {
  try {
    const body = {
      float: float,
      coin_from: coinFrom.code,
      coin_to: coinTo.code,
      network_from: coinFrom.network_code,
      network_to: coinTo.network_code,
      deposit_amount: depositAmount,
      withdrawal: withdrawal,
      return: refund, // btc sent from(spending wallet address)
      rate_id: rateId, // only required for fixed rate tnx
    };
    const tnx = yield call(Swap.createTnx, body);
    const realmObject = createRealmObjForTnx(tnx);
    yield call(dbManager.createObject, RealmSchema.SwapHistory, realmObject);
    if (callback)
      callback({
        status: true,
        tnx,
      });
  } catch (error) {
    console.log('🚀 ~ createSwapTnxWorker error:', error);
    if (callback)
      callback({
        status: false,
        error: error?.message,
      });
  }
}

function* getTnxDetailsWorker({ tnxId, callback }) {
  try {
    const tnx = yield call(Swap.getTnxDetails, tnxId);
    yield call(dbManager.updateObjectById, RealmSchema.SwapHistory, tnxId, {
      status: tnx.status,
    });

    if (callback)
      callback({
        status: true,
        tnx,
      });
  } catch (error) {
    console.log('🚀 ~ getTnxDetailsWorker ~ error:', error);
    if (callback)
      callback({
        status: false,
        error: error?.message,
      });
  }
}

export const loadCoinDetailsWatcher = createWatcher(loadCoinDetailsWorker, LOAD_COIN_DETAILS);
export const getSwapQuoteWatcher = createWatcher(getSwapQuoteWorker, GET_SWAP_QUOTE);
export const createSwapTnxWatcher = createWatcher(createSwapTnxWorker, CREATE_SWAP_TNX);
export const getTnxDetailsWatcher = createWatcher(getTnxDetailsWorker, GET_TNX_DETAILS);

const createRealmObjForTnx = (tnx) => {
  return {
    coin_from: tnx.coin_from,
    coin_from_name: tnx.coin_from_name,
    coin_from_network: tnx.coin_from_network,
    coin_to: tnx.coin_to,
    coin_to_name: tnx.coin_to_name,
    coin_to_network: tnx.coin_to_network,
    created_at: Date.now(),
    deposit_amount: tnx.deposit_amount,
    expired_at: tnx.expired_at,
    is_float: tnx.is_float,
    status: tnx.status,
    id: tnx.transaction_id,
    withdrawal_amount: tnx.withdrawal_amount,
  };
};
