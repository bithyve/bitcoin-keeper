import { all, call, delay, put, select } from 'redux-saga/effects'
import { GET_ALL_ACCOUNTS_DATA } from '../actions/accounts'
import { createWatcher } from '../utilities'

export function* getAllAccountsDataWorker( { payload } : {payload: { amounts: number[], accountId?: string, includeFee?: boolean, exclusiveGifts?: boolean, validity?: number }} ) {
}

export const getAllAccountsDataWatcher = createWatcher(
  getAllAccountsDataWorker,
  GET_ALL_ACCOUNTS_DATA,
)
