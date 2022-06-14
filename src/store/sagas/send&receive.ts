import { put, call, select } from 'redux-saga/effects';
import {
  CalculateCustomFeeAction,
  CalculateSendMaxFeeAction,
  CALCULATE_CUSTOM_FEE,
  CALCULATE_SEND_MAX_FEE,
  customFeeCalculated,
  customSendMaxUpdated,
  SendPhaseOneAction,
  SendPhaseTwoAction,
  SEND_PHASE_ONE,
  SEND_PHASE_TWO,
  feeIntelMissing,
  sendMaxFeeCalculated,
  sendStage1Executed,
  sendStage2Executed,
  SEND_TX_NOTIFICATION,
} from '../sagaActions/send&receive';
import RecipientKind from '../../common/data/enums/RecipientKind';
import idx from 'idx';
import dbManager from '../../storage/realm/dbManager';
import WalletOperations from 'src/core/wallets/WalletOperations';
import { createWatcher } from '../utilities';
import WalletUtilities from 'src/core/wallets/WalletUtilities';
import { RealmSchema } from 'src/storage/realm/enum';
import { MultiSigWallet, Wallet } from 'src/core/wallets/interfaces/interface';
import { TxPriority } from 'src/core/wallets/interfaces/enum';

export function getNextFreeAddress(wallet: Wallet | MultiSigWallet) {
  // to be used by react components(w/ dispatch)
  if (!wallet.isUsable) return '';

  const { updatedWallet, receivingAddress } = WalletOperations.getNextFreeExternalAddress(wallet);
  dbManager.updateObjectById(RealmSchema.Wallet, wallet.id, { specs: updatedWallet.specs });
  return receivingAddress;
}

export function* getNextFreeAddressWorker(wallet: Wallet | MultiSigWallet) {
  // to be used by sagas(w/o dispatch)
  if (!wallet.isUsable) return '';

  const { updatedWallet, receivingAddress } = yield call(
    WalletOperations.getNextFreeExternalAddress,
    wallet
  );
  dbManager.updateObjectById(RealmSchema.Wallet, wallet.id, { specs: updatedWallet.specs });
  return receivingAddress;
}

// function* processRecipients(accountShell: AccountShell) {
//   const accountsState: AccountsState = yield select((state) => state.accounts);
//   const accountShells = accountsState.accountShells;
//   const selectedRecipients: Recipient[] = yield select(
//     (state) => state.sending.selectedRecipients
//   );

//   const trustedContacts: Trusted_Contacts = yield select((state) => state.trustedContacts.contacts);

//   const recipients: {
//     id?: string;
//     address: string;
//     amount: number;
//     name?: string;
//   }[] = [];

//   for (const recipient of selectedRecipients) {
//     switch (recipient.kind) {
//       case RecipientKind.ADDRESS:
//         recipients.push({
//           address: recipient.id,
//           amount: recipient.amount,
//         });
//         break;

//       case RecipientKind.ACCOUNT_SHELL:
//         const recipientShell = accountShells.find((shell) => shell.id === recipient.id);
//         const recipientAccount: Account =
//           accountsState.accounts[recipientShell.primarySubAccount.id];
//         const assigneeInfo: ActiveAddressAssignee = {
//           type: accountShell.primarySubAccount.type,
//           id: accountShell.primarySubAccount.id,
//           senderInfo: {
//             name: accountShell.primarySubAccount.customDisplayName,
//           },
//         };
//         const recipientAddress = yield call(
//           getNextFreeAddressWorker,
//           recipientAccount,
//           assigneeInfo
//         );
//         recipients.push({
//           address: recipientAddress,
//           amount: recipient.amount,
//           name: recipientShell.primarySubAccount.customDisplayName,
//         });

//         break;

//       case RecipientKind.CONTACT:
//         const contact = trustedContacts[(recipient as ContactRecipient).channelKey];
//         const paymentAddresses = idx(
//           contact,
//           (_) => _.unencryptedPermanentChannel[contact.streamId].primaryData.paymentAddresses
//         );

//         if (!paymentAddresses)
//           throw new Error(`Payment addresses missing for: ${recipient.displayedName}`);

//         let paymentAddress;
//         switch (accountShell.primarySubAccount.sourceKind) {
//           case SourceAccountKind.TEST_ACCOUNT:
//             paymentAddress = paymentAddresses[AccountType.TEST_ACCOUNT];
//             break;

//           default:
//             paymentAddress = paymentAddresses[AccountType.CHECKING_ACCOUNT];
//         }
//         if (!paymentAddress)
//           throw new Error(`Payment address missing for: ${recipient.displayedName}`);

//         recipients.push({
//           id: contact.channelKey,
//           address: paymentAddress,
//           amount: recipient.amount,
//           name:
//             contact.contactDetails.contactName ||
//             idx(
//               contact,
//               (_) => _.unencryptedPermanentChannel[contact.streamId].primaryData.walletName
//             ),
//         });
//         break;
//     }
//   }

//   if (!recipients.length) throw new Error('Recipients missing');
//   return recipients;
// }

function* sendPhaseOneWorker({ payload }: SendPhaseOneAction) {
  const { wallet, recipients } = payload;
  // TODO: plug in the average tx fee
  const averageTxFees = null;
  if (!averageTxFees) {
    yield put(
      feeIntelMissing({
        intelMissing: true,
      })
    );
    return;
  }

  const averageTxFeeByNetwork = averageTxFees[wallet.derivationDetails.networkType];

  try {
    // const recipients = yield call(processRecipients);
    const { txPrerequisites } = yield call(
      WalletOperations.transferST1,
      wallet,
      recipients,
      averageTxFeeByNetwork
    );

    if (txPrerequisites) {
      yield put(
        sendStage1Executed({
          successful: true,
          carryOver: {
            txPrerequisites,
            recipients,
          },
        })
      );
    } else {
      yield put(
        sendStage1Executed({
          successful: false,
          err: 'Send failed: unable to generate tx pre-requisite',
        })
      );
    }
  } catch (err) {
    yield put(
      sendStage1Executed({
        successful: false,
        err,
      })
    );
    return;
  }
}

export const sendPhaseOneWatcher = createWatcher(sendPhaseOneWorker, SEND_PHASE_ONE);

function* sendPhaseTwoWorker({ payload }: SendPhaseTwoAction) {
  // const sending: SendingState = yield select((state) => state.sending);
  // TODO: Wire up the send&receive reducer
  const sending: any = {};

  const { wallet, txnPriority, token, note } = payload;

  const txPrerequisites = idx(sending, (_) => _.sendST1.carryOver.txPrerequisites);
  const recipients = idx(sending, (_) => _.sendST1.carryOver.recipients);

  const customTxPrerequisites = idx(
    sending,
    (_) => _.customPriorityST1.carryOver.customTxPrerequisites
  );
  const network = WalletUtilities.getNetworkByType(wallet.derivationDetails.networkType);

  try {
    const { txid } = yield call(
      WalletOperations.transferST2,
      wallet,
      wallet.id,
      txPrerequisites,
      txnPriority,
      network,
      recipients,
      token,
      customTxPrerequisites
    );

    if (txid) {
      yield put(
        sendStage2Executed({
          successful: true,
          txid,
        })
      );

      if (note) wallet.specs.transactionsNote[txid] = note;
      yield call(dbManager.updateObjectById, RealmSchema.Wallet, wallet.id, {
        specs: wallet.specs,
      });
    } else {
      yield put(
        sendStage2Executed({
          successful: false,
          err: 'Send failed: unable to generate txid',
        })
      );
    }
  } catch (err) {
    yield put(
      sendStage2Executed({
        successful: false,
        err: 'Send failed: ' + err.message,
      })
    );
  }
}

export const sendPhaseTwoWatcher = createWatcher(sendPhaseTwoWorker, SEND_PHASE_TWO);

function* calculateSendMaxFee({ payload }: CalculateSendMaxFeeAction) {
  const { numberOfRecipients, wallet } = payload;
  const averageTxFees = {}; // TODO: plugin average tx fee
  const averageTxFeeByNetwork = averageTxFees[wallet.derivationDetails.networkType];
  const feePerByte = averageTxFeeByNetwork[TxPriority.LOW].feePerByte;
  const network = WalletUtilities.getNetworkByType(wallet.derivationDetails.networkType);

  const { fee } = WalletOperations.calculateSendMaxFee(
    wallet,
    numberOfRecipients,
    feePerByte,
    network
  );

  yield put(sendMaxFeeCalculated(fee));
}

export const calculateSendMaxFeeWatcher = createWatcher(
  calculateSendMaxFee,
  CALCULATE_SEND_MAX_FEE
);

function* calculateCustomFee({ payload }: CalculateCustomFeeAction) {
  // feerate should be > minimum relay feerate(default: 1000 satoshis per kB or 1 sat/byte).
  if (parseInt(payload.feePerByte) < 1) {
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
  // const network = WalletUtilities.getNetworkByType(wallet.derivationDetails.networkType);

  // const sendingState: SendingState = yield select((state) => state.sending);
  // const selectedRecipients: Recipient[] = [...sendingState.selectedRecipients];
  // TODO: Wire up the send&receive reducer
  const sending: any = {};

  // const numberOfRecipients = selectedRecipients.length;
  const txPrerequisites = idx(sending, (_) => _.sendST1.carryOver.txPrerequisites);

  let outputs;
  if (sending.feeIntelMissing) {
    // process recipients & generate outputs(normally handled by transfer ST1 saga)
    // const recipients = yield call(processRecipients, accountShell);
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

  // if (!sending.feeIntelMissing && sending.sendMaxFee) {
  //   // custom fee w/ send max
  //   const { fee } = WalletOperations.calculateSendMaxFee(
  //     wallet,
  //     numberOfRecipients,
  //     parseInt(feePerByte),
  //     network
  //   );

  //   // upper bound: default low
  //   if (fee > txPrerequisites[TxPriority.LOW].fee) {
  //     yield put(
  //       customFeeCalculated({
  //         successful: false,
  //         carryOver: {
  //           customTxPrerequisites: null,
  //         },
  //         err: 'Custom fee cannot be greater than the default low priority fee',
  //       })
  //     );
  //     return;
  //   }

  //   const recipients: [
  //     {
  //       address: string;
  //       amount: number;
  //     }
  //   ] = yield call(processRecipients, accountShell);
  //   const recipientToBeModified = recipients[recipients.length - 1];

  //   // deduct the previous(default low) fee and add the custom fee
  //   const customFee = idx(
  //     sendingState,
  //     (_) => _.customPriorityST1.carryOver.customTxPrerequisites.fee
  //   );
  //   if (customFee) recipientToBeModified.amount += customFee; // reusing custom-fee feature
  //   else recipientToBeModified.amount += txPrerequisites[TxPriority.LOW].fee;
  //   recipientToBeModified.amount -= fee;
  //   recipients[recipients.length - 1] = recipientToBeModified;

  //   outputs.forEach((output) => {
  //     if (output.address === recipientToBeModified.address)
  //       output.value = recipientToBeModified.amount;
  //   });

  //   selectedRecipients[selectedRecipients.length - 1].amount = recipientToBeModified.amount;
  //   yield put(
  //     customSendMaxUpdated({
  //       recipients: selectedRecipients,
  //     })
  //   );
  // }

  const customTxPrerequisites = WalletOperations.prepareCustomTransactionPrerequisites(
    wallet,
    outputs,
    parseInt(feePerByte)
  );

  if (customTxPrerequisites.inputs) {
    customTxPrerequisites.estimatedBlocks = parseInt(customEstimatedBlocks);
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
