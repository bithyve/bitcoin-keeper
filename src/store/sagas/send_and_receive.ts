/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
import { AverageTxFeesByNetwork, SerializedPSBTEnvelop } from 'src/core/wallets/interfaces';
import { EntityKind, TxPriority } from 'src/core/wallets/enums';
import { call, put, select } from 'redux-saga/effects';

import { RealmSchema } from 'src/storage/realm/enum';
import Relay from 'src/core/services/operations/Relay';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletOperations from 'src/core/wallets/operations';
import WalletUtilities from 'src/core/wallets/operations/utils';
import _ from 'lodash';
import idx from 'idx';
import { createWatcher } from '../utilities';
import dbManager from '../../storage/realm/dbManager';
import {
  SendPhaseOneExecutedPayload,
  sendPhaseOneExecuted,
  sendPhaseThreeExecuted,
  sendPhaseTwoExecuted,
  setSendMaxFee,
  crossTransferExecuted,
  crossTransferFailed,
  sendPhaseTwoStarted,
} from '../reducers/send_and_receive';
import { setAverageTxFee, setExchangeRates } from '../reducers/network';
import {
  CALCULATE_CUSTOM_FEE,
  CALCULATE_SEND_MAX_FEE,
  CROSS_TRANSFER,
  CalculateCustomFeeAction,
  CalculateSendMaxFeeAction,
  CrossTransferAction,
  FETCH_EXCHANGE_RATES,
  FETCH_FEE_RATES,
  SEND_PHASE_ONE,
  SEND_PHASE_THREE,
  SEND_PHASE_TWO,
  SendPhaseOneAction,
  SendPhaseThreeAction,
  SendPhaseTwoAction,
  customFeeCalculated,
  feeIntelMissing,
} from '../sagaActions/send_and_receive';

export function getNextFreeAddress(wallet: Wallet | Vault) {
  if (!wallet.isUsable) return '';
  const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(wallet);
  return receivingAddress;
}

function* fetchFeeRatesWorker() {
  try {
    const averageTxFeeByNetwork = yield call(WalletOperations.calculateAverageTxFee);
    if (!averageTxFeeByNetwork) console.log('Failed to calculate fee rates');
    else yield put(setAverageTxFee(averageTxFeeByNetwork));
  } catch (err) {
    console.log('Failed to calculate fee rates', { err });
  }
}

export const fetchFeeRatesWatcher = createWatcher(fetchFeeRatesWorker, FETCH_FEE_RATES);

function* fetchExchangeRatesWorker() {
  try {
    const { exchangeRates } = yield call(Relay.fetchFeeAndExchangeRates);
    if (!exchangeRates) console.log('Failed to fetch exchange rates');
    else yield put(setExchangeRates(exchangeRates));
  } catch (err) {
    console.log('Failed to fetch fee and exchange rates', { err });
  }
}

export const fetchExchangeRatesWatcher = createWatcher(
  fetchExchangeRatesWorker,
  FETCH_EXCHANGE_RATES
);

function* sendPhaseOneWorker({ payload }: SendPhaseOneAction) {
  const { wallet, recipients } = payload;
  const averageTxFees: AverageTxFeesByNetwork = yield select(
    (state) => state.network.averageTxFees
  );
  if (!averageTxFees) {
    yield put(
      feeIntelMissing({
        intelMissing: true,
      })
    );
    return;
  }

  const averageTxFeeByNetwork = averageTxFees[wallet.networkType];

  try {
    const { txPrerequisites } = yield call(
      WalletOperations.transferST1,
      wallet,
      recipients,
      averageTxFeeByNetwork
    );

    if (!txPrerequisites) throw new Error('Send failed: unable to generate tx pre-requisite');
    yield put(
      sendPhaseOneExecuted({
        successful: true,
        outputs: {
          txPrerequisites,
          recipients,
        },
      })
    );
  } catch (err) {
    yield put(
      sendPhaseOneExecuted({
        successful: false,
        err: err.message,
      })
    );
  }
}

export const sendPhaseOneWatcher = createWatcher(sendPhaseOneWorker, SEND_PHASE_ONE);

function* sendPhaseTwoWorker({ payload }: SendPhaseTwoAction) {
  yield put(sendPhaseTwoStarted());
  const sendPhaseOneResults: SendPhaseOneExecutedPayload = yield select(
    (state) => state.sendAndReceive.sendPhaseOne
  );
  const { wallet, txnPriority, note } = payload;
  const txPrerequisites = _.cloneDeep(idx(sendPhaseOneResults, (_) => _.outputs.txPrerequisites)); // cloning object(mutable) as reducer states are immutable
  const recipients = idx(sendPhaseOneResults, (_) => _.outputs.recipients);
  const network = WalletUtilities.getNetworkByType(wallet.networkType);
  try {
    const { txid, serializedPSBTEnvelops } = yield call(
      WalletOperations.transferST2,
      wallet,
      txPrerequisites,
      txnPriority,
      network,
      recipients
      // customTxPrerequisites
    );

    switch (wallet.entityKind) {
      case EntityKind.WALLET:
        if (!txid) throw new Error('Send failed: unable to generate txid');
        if (note) wallet.specs.txNote[txid] = note;
        yield put(
          sendPhaseTwoExecuted({
            successful: true,
            txid,
          })
        );
        yield call(dbManager.updateObjectById, RealmSchema.Wallet, wallet.id, {
          specs: wallet.specs,
        });
        break;

      case EntityKind.VAULT:
        if (!serializedPSBTEnvelops.length)
          throw new Error('Send failed: unable to generate serializedPSBTEnvelop');
        yield put(
          sendPhaseTwoExecuted({
            successful: true,
            serializedPSBTEnvelops,
          })
        );
        break;

      default:
        throw new Error('Invalid Entity: not a Vault/Wallet');
    }
  } catch (err) {
    yield put(
      sendPhaseTwoExecuted({
        successful: false,
        err: err.message,
      })
    );
  }
}

export const sendPhaseTwoWatcher = createWatcher(sendPhaseTwoWorker, SEND_PHASE_TWO);

function* sendPhaseThreeWorker({ payload }: SendPhaseThreeAction) {
  const sendPhaseOneResults: SendPhaseOneExecutedPayload = yield select(
    (state) => state.sendAndReceive.sendPhaseOne
  );
  const serializedPSBTEnvelops: SerializedPSBTEnvelop[] = yield select(
    (state) => state.sendAndReceive.sendPhaseTwo.serializedPSBTEnvelops
  );
  const txPrerequisites = _.cloneDeep(idx(sendPhaseOneResults, (_) => _.outputs.txPrerequisites)); // cloning object(mutable) as reducer states are immutable
  const { wallet, txnPriority } = payload;
  try {
    const threshold = (wallet as Vault).scheme.m;
    let availableSignatures = 0;
    let txHex;
    for (const serializedPSBTEnvelop of serializedPSBTEnvelops) {
      if (serializedPSBTEnvelop.isSigned) {
        availableSignatures++;
      }
      if (serializedPSBTEnvelop.txHex) {
        txHex = serializedPSBTEnvelop.txHex; // txHex is given out by COLDCARD, KEYSTONE and TREZOR post signing
      }
    }
    if (availableSignatures < threshold)
      throw new Error(
        `Insufficient signatures, required:${threshold} provided:${availableSignatures}`
      );

    const { txid } = yield call(
      WalletOperations.transferST3,
      wallet,
      serializedPSBTEnvelops,
      txPrerequisites,
      txnPriority,
      txHex
    );
    if (!txid) throw new Error('Send failed: unable to generate txid using the signed PSBT');
    yield put(
      sendPhaseThreeExecuted({
        successful: true,
        txid,
      })
    );
    yield call(dbManager.updateObjectById, RealmSchema.Vault, wallet.id, {
      specs: wallet.specs,
    });
  } catch (err) {
    yield put(
      sendPhaseThreeExecuted({
        successful: false,
        err: err.message,
      })
    );
  }
}

export const sendPhaseThreeWatcher = createWatcher(sendPhaseThreeWorker, SEND_PHASE_THREE);

function* corssTransferWorker({ payload }: CrossTransferAction) {
  const { sender, recipient, amount } = payload;
  const averageTxFees: AverageTxFeesByNetwork = yield select(
    (state) => state.network.averageTxFees
  );
  if (!averageTxFees) {
    yield put(
      feeIntelMissing({
        intelMissing: true,
      })
    );
    return;
  }

  const averageTxFeeByNetwork = averageTxFees[sender.networkType];
  try {
    // const recipients = yield call(processRecipients);
    const recipients = [
      {
        address: yield call(getNextFreeAddress, recipient),
        amount,
      },
    ];
    const { txPrerequisites } = yield call(
      WalletOperations.transferST1,
      sender,
      recipients,
      averageTxFeeByNetwork
    );

    if (txPrerequisites) {
      const network = WalletUtilities.getNetworkByType(sender.networkType);
      const { txid } = yield call(
        WalletOperations.transferST2,
        sender,
        txPrerequisites,
        TxPriority.LOW,
        network,
        recipients
      );

      if (txid) {
        yield call(dbManager.updateObjectById, RealmSchema.Wallet, sender.id, {
          specs: sender.specs,
        });
        yield put(crossTransferExecuted());
      } else {
        yield put(crossTransferFailed());
        throw new Error('Failed to execute cross transfer; txid missing');
      }
    } else throw new Error('Failed to generate txPrerequisites for cross transfer');
  } catch (err) {
    yield put(crossTransferFailed());
    console.log({ err });
  }
}

export const corssTransferWatcher = createWatcher(corssTransferWorker, CROSS_TRANSFER);

function* calculateSendMaxFee({ payload }: CalculateSendMaxFeeAction) {
  const { numberOfRecipients, wallet } = payload;
  const averageTxFees: AverageTxFeesByNetwork = yield select(
    (state) => state.network.averageTxFees
  );
  const averageTxFeeByNetwork = averageTxFees[wallet.networkType];
  const { feePerByte } = averageTxFeeByNetwork[TxPriority.LOW];
  const network = WalletUtilities.getNetworkByType(wallet.networkType);

  const { fee } = WalletOperations.calculateSendMaxFee(
    wallet,
    numberOfRecipients,
    feePerByte,
    network
  );

  yield put(setSendMaxFee(fee));
}

export const calculateSendMaxFeeWatcher = createWatcher(
  calculateSendMaxFee,
  CALCULATE_SEND_MAX_FEE
);

function* calculateCustomFee({ payload }: CalculateCustomFeeAction) {
  // feerate should be > minimum relay feerate(default: 1000 satoshis per kB or 1 sat/byte).
  if (parseInt(payload.feePerByte, 10) < 1) {
    yield put(
      customFeeCalculated({
        successful: false,
        carryOver: {
          customTxPrerequisites: null,
        },
        err: 'Custom fee minimum: 1 sat/byte',
      })
    );
    return;
  }

  const { wallet, recipients, feePerByte, customEstimatedBlocks } = payload;
  const sending: any = {};
  const txPrerequisites = idx(sending, (_) => _.sendST1.carryOver.txPrerequisites);

  let outputs;
  if (sending.feeIntelMissing) {
    // process recipients & generate outputs(normally handled by transfer ST1 saga)
    const outputsArray = [];
    for (const recipient of recipients) {
      outputsArray.push({
        address: recipient.address,
        value: Math.round(recipient.amount),
      });
    }
    outputs = outputsArray;
  } else {
    if (!txPrerequisites) throw new Error('ST1 carry-over missing');
    outputs = txPrerequisites[TxPriority.LOW].outputs.filter((output) => output.address);
  }

  const customTxPrerequisites = WalletOperations.prepareCustomTransactionPrerequisites(
    wallet,
    outputs,
    parseInt(feePerByte, 10)
  );

  if (customTxPrerequisites.inputs) {
    customTxPrerequisites.estimatedBlocks = parseInt(customEstimatedBlocks, 10);
    yield put(
      customFeeCalculated({
        successful: true,
        carryOver: {
          customTxPrerequisites,
        },
        err: null,
      })
    );
  } else {
    let totalAmount = 0;
    outputs.forEach((output) => {
      totalAmount += output.value;
    });
    yield put(
      customFeeCalculated({
        successful: false,
        carryOver: {
          customTxPrerequisites: null,
        },
        err: `Insufficient balance to pay: amount ${totalAmount} + fee(${customTxPrerequisites.fee}) at ${feePerByte} sats/byte`,
      })
    );
  }
}

export const calculateCustomFeeWatcher = createWatcher(calculateCustomFee, CALCULATE_CUSTOM_FEE);
