import { call, put } from 'redux-saga/effects';
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
import Relay from 'src/services/backend/Relay';

function* loadCoinDetailsWorker({ callback }) {
  try {
    const res = yield call(Relay.getSwapCoins);
    yield put(setCoinDetails(res));
    if (callback) callback({ status: true });
  } catch (error) {
    console.log('🚀 ~ loadCoinDetailsWorker ~ error:', error);
    if (callback) callback({ status: false, error: error?.message });
  }
}

function* getSwapQuoteWorker({ coinFrom, coinTo, amount, float, callback }) {
  try {
    const body = {
      coinFrom,
      coinTo,
      amount,
      float,
    };
    const quote = yield call(Relay.getSwapQuote, body);
    if (callback)
      callback({
        status: true,
        amount: coinTo.code === 'BTC' ? quote.amount : parseFloat(quote.amount).toFixed(2),
        rateId: quote?.rate_id,
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
      float,
      coinFrom,
      coinTo,
      depositAmount,
      withdrawal,
      refund,
      rateId, // only required for fixed rate tnx
    };
    const tnx = yield call(Relay.createSwapTnx, body);
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
    const tnx = yield call(Relay.getSwapTnxDetails, tnxId);
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
    withdrawal_amount:
      tnx.coin_from === 'BTC'
        ? tnx.withdrawal_amount
        : parseFloat(tnx.withdrawal_amount).toFixed(3),
  };
};
