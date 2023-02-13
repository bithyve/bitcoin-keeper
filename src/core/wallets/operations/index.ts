/* eslint-disable no-continue */
/* eslint-disable camelcase */
/* eslint-disable guard-for-in */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-dupe-else-if */
/* eslint-disable no-empty */
/* eslint-disable prefer-const */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */

import * as bitcoinJS from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

import ECPairFactory from 'ecpair';
import coinselect from 'coinselect';
import coinselectSplit from 'coinselect/split';
import config from 'src/core/config';
import { parseInt } from 'lodash';
import ElectrumClient from 'src/core/services/electrum/client';
import { isSignerAMF } from 'src/hardware';
import {
  AverageTxFees,
  AverageTxFeesByNetwork,
  Balances,
  InputUTXOs,
  SerializedPSBTEnvelop,
  SigningPayload,
  Transaction,
  TransactionPrerequisite,
  TransactionPrerequisiteElements,
} from '../interfaces';
import {
  BIP48ScriptTypes,
  DerivationPurpose,
  EntityKind,
  NetworkType,
  SignerType,
  TransactionType,
  TxPriority,
  XpubTypes,
} from '../enums';
import { Vault, VaultSigner } from '../interfaces/vault';

import { Wallet } from '../interfaces/wallet';
import WalletUtilities from './utils';

const ECPair = ECPairFactory(ecc);

export default class WalletOperations {
  static getNextFreeExternalAddress = (wallet: Wallet | Vault): { receivingAddress: string } => {
    let receivingAddress;
    const network = WalletUtilities.getNetworkByType(wallet.networkType);
    if ((wallet as Vault).isMultiSig) {
      const { xpubs } = (wallet as Vault).specs;
      receivingAddress = WalletUtilities.createMultiSig(
        xpubs,
        (wallet as Vault).scheme.m,
        network,
        wallet.specs.nextFreeAddressIndex,
        false
      ).address;
    } else {
      let xpub = null;
      let purpose = null;
      if (wallet.entityKind === EntityKind.VAULT) {
        xpub = (wallet as Vault).specs.xpubs[0];
        purpose = WalletUtilities.getPurpose((wallet as Vault).signers[0].derivationPath);
      } else {
        xpub = (wallet as Wallet).specs.xpub;
        purpose = WalletUtilities.getPurpose((wallet as Wallet).derivationDetails.xDerivationPath);
      }
      receivingAddress = WalletUtilities.getAddressByIndex(
        xpub,
        false,
        (wallet as Wallet).specs.nextFreeAddressIndex,
        network,
        purpose
      );
    }

    return {
      receivingAddress,
    };
  };

  static transformElectrumTxToTx = (
    tx,
    inputTxs,
    externalAddresses,
    internalAddresses,
    txidToAddress
  ) => {
    // popluate tx-inputs with addresses and values
    const inputs = tx.vin;
    for (let index = 0; index < tx.vin.length; index++) {
      const input = inputs[index];

      const inputTx = inputTxs[input.txid];
      if (inputTx && inputTx.vout[input.vout]) {
        const vout = inputTx.vout[input.vout];
        input.addresses = vout.scriptPubKey.addresses;
        input.value = vout.value;
      }
    }

    // calculate cumulative amount and transaction type
    const outputs = tx.vout;
    let fee = 0; // delta b/w inputs and outputs
    let amount = 0;
    const senderAddresses = [];
    const recipientAddresses = [];

    for (const input of inputs) {
      const inputAddress = input.addresses[0];
      if (
        externalAddresses[inputAddress] !== undefined ||
        internalAddresses[inputAddress] !== undefined
      )
        amount -= input.value;

      senderAddresses.push(inputAddress);
      fee += input.value;
    }

    for (const output of outputs) {
      const outputAddress = output.scriptPubKey.addresses[0];
      if (
        externalAddresses[outputAddress] !== undefined ||
        internalAddresses[outputAddress] !== undefined
      )
        amount += output.value;

      recipientAddresses.push(outputAddress);
      fee -= output.value;
    }

    const transaction: Transaction = {
      txid: tx.txid,
      address: txidToAddress[tx.txid],
      confirmations: tx.confirmations ? tx.confirmations : 0,
      fee: Math.floor(fee * 1e8),
      date: tx.time ? new Date(tx.time * 1000).toUTCString() : new Date(Date.now()).toUTCString(),
      transactionType: amount > 0 ? TransactionType.RECEIVED : TransactionType.SENT,
      amount: Math.floor(Math.abs(amount) * 1e8),
      recipientAddresses,
      senderAddresses,
      blockTime: tx.blocktime,
    };
    return transaction;
  };

  static fetchTransactions = async (
    wallet: Wallet | Vault,
    addresses: string[],
    externalAddresses: { [address: string]: number },
    internalAddresses: { [address: string]: number },
    network: bitcoinJS.Network
  ) => {
    const transactions = wallet.specs.transactions;
    let lastUsedAddressIndex = wallet.specs.nextFreeAddressIndex - 1;
    let lastUsedChangeAddressIndex = wallet.specs.nextFreeChangeAddressIndex - 1;

    const txidToIndex = {}; // transaction-id to index mapping(assists transaction updation)
    for (let index = 0; index < transactions.length; index++) {
      const transaction = transactions[index];
      txidToIndex[transaction.txid] = index;
    }

    const { historyByAddress, txids, txidToAddress } = await ElectrumClient.syncHistoryByAddress(
      addresses,
      network
    );
    const txs = await ElectrumClient.getTransactionsById(txids);

    // fetch input transactions(for new ones), in order to construct the inputs
    const inputTxIds = [];
    for (const txid in txs) {
      if (txidToIndex[txid] !== undefined) continue; // transaction is already present(don't need to reconstruct using inputTxids)
      for (const vin of txs[txid].vin) inputTxIds.push(vin.txid);
    }
    const inputTxs = await ElectrumClient.getTransactionsById(inputTxIds);

    let hasNewUpdates = false;
    const newTransactions: Transaction[] = [];
    // construct a new or update an existing transaction
    for (const txid in txs) {
      let existingTx: Transaction;
      if (txidToIndex[txid] !== undefined) existingTx = transactions[txidToIndex[txid]];

      const tx = txs[txid];

      if (existingTx) {
        // transaction already exists in the database, should update till transaction has 3+ confs
        if (!tx.confirmations) continue; // unconfirmed transaction
        if (existingTx.confirmations > 3) continue; // 3+ confs
        if (existingTx.confirmations !== tx.confirmations) {
          // update transaction confirmations
          existingTx.confirmations = tx.confirmations;
          hasNewUpdates = true;
        }
      } else {
        // new transaction construction
        const transaction = WalletOperations.transformElectrumTxToTx(
          tx,
          inputTxs,
          externalAddresses,
          internalAddresses,
          txidToAddress
        );
        hasNewUpdates = true;
        newTransactions.push(transaction);

        // update the last used address/change-address index
        const address = txidToAddress[tx.txid];
        if (externalAddresses[address] !== undefined) {
          lastUsedAddressIndex = Math.max(externalAddresses[address], lastUsedAddressIndex);
        } else if (internalAddresses[address] !== undefined) {
          lastUsedChangeAddressIndex = Math.max(
            internalAddresses[address],
            lastUsedChangeAddressIndex
          );
        }
      }
    }

    newTransactions.sort((tx1, tx2) => (tx1.confirmations > tx2.confirmations ? 1 : -1));
    return {
      transactions: newTransactions.concat(transactions),
      hasNewUpdates,
      lastUsedAddressIndex,
      lastUsedChangeAddressIndex,
    };
  };

  static syncWalletsViaElectrumClient = async (
    wallets: (Wallet | Vault)[],
    network: bitcoinJS.networks.Network
  ): Promise<{
    synchedWallets: (Wallet | Vault)[];
  }> => {
    for (const wallet of wallets) {
      const hardGapLimit = 10; // hard refresh gap limit
      const addresses = [];

      let purpose;
      if (wallet.entityKind === EntityKind.WALLET)
        purpose = WalletUtilities.getPurpose((wallet as Wallet).derivationDetails.xDerivationPath);

      // collect external(receive) chain addresses
      const externalAddresses: { [address: string]: number } = {}; // all external addresses(till closingExtIndex)
      for (let itr = 0; itr < wallet.specs.nextFreeAddressIndex + hardGapLimit; itr++) {
        let address: string;
        if ((wallet as Vault).isMultiSig) {
          const { xpubs } = (wallet as Vault).specs;
          address = WalletUtilities.createMultiSig(
            xpubs,
            (wallet as Vault).scheme.m,
            network,
            itr,
            false
          ).address;
        } else {
          let xpub = null;
          if (wallet.entityKind === EntityKind.VAULT) xpub = (wallet as Vault).specs.xpubs[0];
          else xpub = (wallet as Wallet).specs.xpub;

          address = WalletUtilities.getAddressByIndex(xpub, false, itr, network, purpose);
        }

        externalAddresses[address] = itr;
        addresses.push(address);
      }

      // collect internal(change) chain addresses
      const internalAddresses: { [address: string]: number } = {}; // all internal addresses(till closingIntIndex)
      for (let itr = 0; itr < wallet.specs.nextFreeChangeAddressIndex + hardGapLimit; itr++) {
        let address: string;
        if ((wallet as Vault).isMultiSig) {
          const { xpubs } = (wallet as Vault).specs;
          address = WalletUtilities.createMultiSig(
            xpubs,
            (wallet as Vault).scheme.m,
            network,
            itr,
            true
          ).address;
        } else {
          let xpub = null;
          if (wallet.entityKind === EntityKind.VAULT) xpub = (wallet as Vault).specs.xpubs[0];
          else xpub = (wallet as Wallet).specs.xpub;

          address = WalletUtilities.getAddressByIndex(xpub, true, itr, network, purpose);
        }

        internalAddresses[address] = itr;
        addresses.push(address);
      }

      // sync utxos & balances
      const utxosByAddress = await ElectrumClient.syncUTXOByAddress(addresses, network);

      const balances: Balances = {
        confirmed: 0,
        unconfirmed: 0,
      };
      const confirmedUTXOs: InputUTXOs[] = [];
      const unconfirmedUTXOs: InputUTXOs[] = [];
      for (const address in utxosByAddress) {
        const utxos = utxosByAddress[address];
        for (const utxo of utxos) {
          if (utxo.height > 0) {
            confirmedUTXOs.push(utxo);
            balances.confirmed += utxo.value;
          } else if (internalAddresses[utxo.address] !== undefined) {
            // defaulting utxo's on the change branch to confirmed
            confirmedUTXOs.push(utxo);
            balances.confirmed += utxo.value;
          } else {
            unconfirmedUTXOs.push(utxo);
            balances.unconfirmed += utxo.value;
          }
        }
      }

      // sync & populate transactionsInfo
      const { transactions, lastUsedAddressIndex, lastUsedChangeAddressIndex, hasNewUpdates } =
        await WalletOperations.fetchTransactions(
          wallet,
          addresses,
          externalAddresses,
          internalAddresses,
          network
        );

      // update wallet w/ latest utxos, balances and transactions
      wallet.specs.nextFreeAddressIndex = lastUsedAddressIndex + 1;
      wallet.specs.nextFreeChangeAddressIndex = lastUsedChangeAddressIndex + 1;
      wallet.specs.unconfirmedUTXOs = unconfirmedUTXOs;
      wallet.specs.confirmedUTXOs = confirmedUTXOs;
      wallet.specs.balances = balances;
      wallet.specs.transactions = transactions;
      wallet.specs.hasNewUpdates = hasNewUpdates;
      wallet.specs.lastSynched = Date.now();
    }

    return {
      synchedWallets: wallets,
    };
  };

  static removeConsumedUTXOs = (wallet: Wallet | Vault, inputs: InputUTXOs[]) => {
    const consumedUTXOs: { [txid: string]: InputUTXOs } = {};
    inputs.forEach((input) => {
      consumedUTXOs[input.txId] = input;
    });

    // update primary utxo set and balance
    const updatedUTXOSet = [];

    wallet.specs.confirmedUTXOs.forEach((confirmedUTXO) => {
      if (!consumedUTXOs[confirmedUTXO.txId]) updatedUTXOSet.push(confirmedUTXO);
    });

    wallet.specs.confirmedUTXOs = updatedUTXOSet;
  };

  static fetchFeeRatesByPriority = async () => {
    // high fee: 30 minutes
    const highFeeBlockEstimate = 3;
    const high = {
      feePerByte: Math.round(await ElectrumClient.estimateFee(highFeeBlockEstimate)),
      estimatedBlocks: highFeeBlockEstimate,
    }; // high: within 3 blocks

    // medium fee: 2 hours
    const mediumFeeBlockEstimate = 12;
    const medium = {
      feePerByte: Math.round(await ElectrumClient.estimateFee(mediumFeeBlockEstimate)),
      estimatedBlocks: mediumFeeBlockEstimate,
    }; // medium: within 12 blocks

    // low fee: 6 hours
    const lowFeeBlockEstimate = 36;
    const low = {
      feePerByte: Math.round(await ElectrumClient.estimateFee(lowFeeBlockEstimate)),
      estimatedBlocks: lowFeeBlockEstimate,
    }; // low: within 36 blocks

    const feeRatesByPriority = { high, medium, low };
    return feeRatesByPriority;
  };

  static calculateAverageTxFee = async () => {
    const feeRatesByPriority = await WalletOperations.fetchFeeRatesByPriority();
    const averageTxSize = 226; // the average Bitcoin transaction is about 226 bytes in size (1 Inp (148); 2 Out)
    const averageTxFees: AverageTxFees = {
      high: {
        averageTxFee: Math.round(averageTxSize * feeRatesByPriority.high.feePerByte),
        feePerByte: feeRatesByPriority.high.feePerByte,
        estimatedBlocks: feeRatesByPriority.high.estimatedBlocks,
      },
      medium: {
        averageTxFee: Math.round(averageTxSize * feeRatesByPriority.medium.feePerByte),
        feePerByte: feeRatesByPriority.medium.feePerByte,
        estimatedBlocks: feeRatesByPriority.medium.estimatedBlocks,
      },
      low: {
        averageTxFee: Math.round(averageTxSize * feeRatesByPriority.low.feePerByte),
        feePerByte: feeRatesByPriority.low.feePerByte,
        estimatedBlocks: feeRatesByPriority.low.estimatedBlocks,
      },
    };

    // TODO: configure to procure fee by network type
    const averageTxFeeByNetwork: AverageTxFeesByNetwork = {
      [NetworkType.TESTNET]: averageTxFees,
      [NetworkType.MAINNET]: averageTxFees,
    };
    return averageTxFeeByNetwork;
  };

  static calculateSendMaxFee = (
    wallet: Wallet | Vault,
    numberOfRecipients: number,
    feePerByte: number,
    network: bitcoinJS.networks.Network
  ): { fee: number } => {
    const inputUTXOs = wallet.specs.confirmedUTXOs;
    let confirmedBalance = 0;
    inputUTXOs.forEach((utxo) => {
      confirmedBalance += utxo.value;
    });

    const outputUTXOs = [];
    for (let index = 0; index < numberOfRecipients; index++) {
      // using random outputs for send all fee calculation
      outputUTXOs.push({
        address: bitcoinJS.payments.p2sh({
          redeem: bitcoinJS.payments.p2wpkh({
            pubkey: ECPair.makeRandom().publicKey,
            network,
          }),
          network,
        }).address,
      });
    }
    const { fee } = coinselectSplit(inputUTXOs, outputUTXOs, feePerByte);

    return {
      fee,
    };
  };

  static prepareTransactionPrerequisites = (
    wallet: Wallet | Vault,
    recipients: {
      address: string;
      amount: number;
    }[],
    averageTxFees: AverageTxFees
  ):
    | {
        fee: number;
        balance: number;
        txPrerequisites?;
      }
    | {
        txPrerequisites: TransactionPrerequisite;
        fee?;
        balance?;
      } => {
    const inputUTXOs = wallet.specs.confirmedUTXOs;
    let confirmedBalance = 0;
    inputUTXOs.forEach((utxo) => {
      confirmedBalance += utxo.value;
    });

    const outputUTXOs = [];
    for (const recipient of recipients) {
      outputUTXOs.push({
        address: recipient.address,
        value: recipient.amount,
      });
    }

    const defaultTxPriority = TxPriority.LOW; // doing base calculation with low fee (helps in sending the tx even if higher priority fee isn't possible)
    const defaultFeePerByte = averageTxFees[defaultTxPriority].feePerByte;
    const defaultEstimatedBlocks = averageTxFees[defaultTxPriority].estimatedBlocks;

    const assets = coinselect(inputUTXOs, outputUTXOs, defaultFeePerByte);
    const defaultPriorityInputs = assets.inputs;
    const defaultPriorityOutputs = assets.outputs;
    const defaultPriorityFee = assets.fee;

    let netAmount = 0;
    recipients.forEach((recipient) => {
      netAmount += recipient.amount;
    });
    const defaultDebitedAmount = netAmount + defaultPriorityFee;
    if (!defaultPriorityInputs || defaultDebitedAmount > confirmedBalance) {
      // insufficient input utxos to compensate for output utxos + lowest priority fee
      return {
        fee: defaultPriorityFee,
        balance: confirmedBalance,
      };
    }

    const txPrerequisites: TransactionPrerequisite = {};

    for (const priority of [TxPriority.LOW, TxPriority.MEDIUM, TxPriority.HIGH]) {
      if (priority === defaultTxPriority || defaultDebitedAmount === confirmedBalance) {
        txPrerequisites[priority] = {
          inputs: defaultPriorityInputs,
          outputs: defaultPriorityOutputs,
          fee: defaultPriorityFee,
          estimatedBlocks: defaultEstimatedBlocks,
        };
      } else {
        // re-computing inputs with a non-default priority fee
        const { inputs, outputs, fee } = coinselect(
          inputUTXOs,
          outputUTXOs,
          averageTxFees[priority].feePerByte
        );
        const debitedAmount = netAmount + fee;
        if (!inputs || debitedAmount > confirmedBalance) {
          // to previous priority assets
          if (priority === TxPriority.MEDIUM)
            txPrerequisites[priority] = txPrerequisites[TxPriority.LOW];
          if (priority === TxPriority.HIGH)
            txPrerequisites[priority] = txPrerequisites[TxPriority.MEDIUM];
        } else {
          txPrerequisites[priority] = {
            inputs,
            outputs,
            fee,
            estimatedBlocks: averageTxFees[priority].estimatedBlocks,
          };
        }
      }
    }

    return {
      txPrerequisites,
    };
  };

  static prepareCustomTransactionPrerequisites = (
    wallet: Wallet | Vault,
    outputUTXOs: {
      address: string;
      value: number;
    }[],
    customTxFeePerByte: number
  ): TransactionPrerequisiteElements => {
    const inputUTXOs = wallet.specs.confirmedUTXOs;
    const { inputs, outputs, fee } = coinselect(inputUTXOs, outputUTXOs, customTxFeePerByte);

    if (!inputs) return { fee };

    return {
      inputs,
      outputs,
      fee,
    };
  };

  static addInputToPSBT = (
    PSBT: bitcoinJS.Psbt,
    wallet: Wallet | Vault,
    input: InputUTXOs,
    network: bitcoinJS.networks.Network,
    derivationPurpose: DerivationPurpose = DerivationPurpose.BIP84,
    scriptType: BIP48ScriptTypes = BIP48ScriptTypes.NATIVE_SEGWIT
  ) => {
    const { isMultiSig } = wallet as Vault;
    if (!isMultiSig) {
      const { publicKey, subPath } = WalletUtilities.addressToKey(input.address, wallet, true) as {
        publicKey: Buffer;
        subPath: number[];
      };
      const p2wpkh = bitcoinJS.payments.p2wpkh({
        pubkey: publicKey,
        network,
      });

      let p2sh;
      if (derivationPurpose === DerivationPurpose.BIP49)
        p2sh = bitcoinJS.payments.p2sh({
          redeem: p2wpkh,
        });

      let path;
      let masterFingerprint;
      if (wallet.entityKind === EntityKind.VAULT) {
        const signer = (wallet as Vault).signers[0];
        const { derivationPath, masterFingerprint: mfp } = signer;
        path = `${derivationPath}/${subPath.join('/')}`;
        masterFingerprint = mfp;
      } else {
        path = `${(wallet as Wallet).derivationDetails.xDerivationPath}/${subPath.join('/')}`;
        masterFingerprint = WalletUtilities.getFingerprintFromMnemonic(
          (wallet as Wallet).derivationDetails.mnemonic
        );
      }

      const bip32Derivation = [
        {
          masterFingerprint: Buffer.from(masterFingerprint, 'hex'),
          path,
          pubkey: publicKey,
        },
      ];

      if (derivationPurpose === DerivationPurpose.BIP84) {
        PSBT.addInput({
          hash: input.txId,
          index: input.vout,
          bip32Derivation,
          witnessUtxo: {
            script: p2wpkh.output,
            value: input.value,
          },
        });
      } else if (derivationPurpose === DerivationPurpose.BIP49) {
        PSBT.addInput({
          hash: input.txId,
          index: input.vout,
          bip32Derivation,
          witnessUtxo: {
            script: p2sh.output,
            value: input.value,
          },
          redeemScript: p2wpkh.output,
        });
      }
    } else {
      const { p2ms, p2wsh, p2sh, subPath, signerPubkeyMap } = WalletUtilities.addressToMultiSig(
        input.address,
        wallet as Vault
      );

      const bip32Derivation = [];
      for (const signer of (wallet as Vault).signers) {
        const masterFingerprint = Buffer.from(signer.masterFingerprint, 'hex');
        const path = `${signer.derivationPath}/${subPath.join('/')}`;
        bip32Derivation.push({
          masterFingerprint,
          path,
          pubkey: signerPubkeyMap.get(signer.xpub),
        });
      }

      if (scriptType === BIP48ScriptTypes.NATIVE_SEGWIT) {
        PSBT.addInput({
          hash: input.txId,
          index: input.vout,
          bip32Derivation,
          witnessUtxo: {
            script: p2wsh.output,
            value: input.value,
          },
          witnessScript: p2ms.output,
        });
      } else if (scriptType === BIP48ScriptTypes.WRAPPED_SEGWIT) {
        PSBT.addInput({
          hash: input.txId,
          index: input.vout,
          bip32Derivation,
          witnessUtxo: {
            script: p2sh.output,
            value: input.value,
          },
          redeemScript: p2wsh.output,
          witnessScript: p2ms.output,
        });
      }
    }
  };

  static getPSBTDataForChangeOutput = (
    wallet: Vault,
    changeMultiSig: {
      p2ms: bitcoinJS.payments.Payment;
      p2wsh: bitcoinJS.payments.Payment;
      p2sh: bitcoinJS.payments.Payment;
      pubkeys: Buffer[];
      address: string;
      subPath: number[];
      signerPubkeyMap: Map<string, Buffer>;
    }
  ): {
    bip32Derivation: any[];
    redeemScript: Buffer;
    witnessScript: Buffer;
  } => {
    const bip32Derivation = []; // array per each pubkey thats gona be used
    const { subPath, p2wsh, p2ms, signerPubkeyMap } = changeMultiSig;
    for (const signer of wallet.signers) {
      const masterFingerprint = Buffer.from(signer.masterFingerprint, 'hex');
      const path = `${signer.derivationPath}/${subPath.join('/')}`;
      bip32Derivation.push({
        masterFingerprint,
        path,
        pubkey: signerPubkeyMap.get(signer.xpub),
      });
    }
    return { bip32Derivation, redeemScript: p2wsh.output, witnessScript: p2ms.output };
  };

  static createTransaction = async (
    wallet: Wallet | Vault,
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: TransactionPrerequisiteElements,
    derivationPurpose?: DerivationPurpose,
    scriptType?: BIP48ScriptTypes
  ): Promise<{
    PSBT: bitcoinJS.Psbt;
  }> => {
    try {
      let inputs;
      let outputs;
      if (txnPriority === TxPriority.CUSTOM && customTxPrerequisites) {
        inputs = customTxPrerequisites.inputs;
        outputs = customTxPrerequisites.outputs;
      } else {
        inputs = txPrerequisites[txnPriority].inputs;
        outputs = txPrerequisites[txnPriority].outputs;
      }

      const network = WalletUtilities.getNetworkByType(wallet.networkType);
      const PSBT: bitcoinJS.Psbt = new bitcoinJS.Psbt({
        network,
      });

      for (const input of inputs)
        this.addInputToPSBT(PSBT, wallet, input, network, derivationPurpose, scriptType);

      const {
        outputs: outputsWithChange,
        changeAddress,
        changeMultisig,
      } = WalletUtilities.generateChange(
        wallet,
        outputs,
        wallet.specs.nextFreeChangeAddressIndex,
        network
      );

      outputsWithChange.sort((out1, out2) => {
        if (out1.address < out2.address) return -1;
        if (out1.address > out2.address) return 1;
        return 0;
      });

      for (const output of outputsWithChange) {
        if (
          wallet.entityKind === EntityKind.VAULT &&
          (wallet as Vault).isMultiSig &&
          output.address === changeMultisig?.address
        ) {
          // case: change output for multisig Vault
          const { bip32Derivation, witnessScript, redeemScript } =
            WalletOperations.getPSBTDataForChangeOutput(wallet as Vault, changeMultisig);
          PSBT.addOutput({ ...output, bip32Derivation, witnessScript, redeemScript });
        } else if (
          wallet.entityKind === EntityKind.VAULT &&
          !(wallet as Vault).isMultiSig &&
          output.address === changeAddress
        ) {
          // case: change output for single-sig Vault(p2wpkh)
          const { publicKey, subPath } = WalletUtilities.addressToKey(
            changeAddress,
            wallet,
            true
          ) as {
            publicKey: Buffer;
            subPath: number[];
          };
          const signer = (wallet as Vault).signers[0];
          const masterFingerprint = Buffer.from(signer.masterFingerprint, 'hex');
          const path = `${signer.derivationPath}/${subPath.join('/')}`;
          const bip32Derivation = [
            {
              masterFingerprint,
              path,
              pubkey: publicKey,
            },
          ];

          PSBT.addOutput({ ...output, bip32Derivation });
        } else PSBT.addOutput(output);
      }
      return {
        PSBT,
      };
    } catch (err) {
      throw new Error(`Transaction creation failed: ${err.message}`);
    }
  };

  static signTransaction = (
    wallet: Wallet,
    inputs: any,
    PSBT: bitcoinJS.Psbt
  ): {
    signedPSBT: bitcoinJS.Psbt;
  } => {
    try {
      let vin = 0;
      const network = WalletUtilities.getNetworkByType(wallet.networkType);

      for (const input of inputs) {
        let keyPair;
        const { privateKey } = WalletUtilities.addressToKey(input.address, wallet) as {
          privateKey: string;
          subPath: number[];
        };
        keyPair = WalletUtilities.getKeyPair(privateKey, network);

        PSBT.signInput(vin, keyPair);
        vin++;
      }

      return {
        signedPSBT: PSBT,
      };
    } catch (err) {
      throw new Error(`Transaction signing failed: ${err.message}`);
    }
  };

  static internallySignVaultPSBT = (
    wallet: Vault,
    inputs: any,
    serializedPSBT: string,
    xpriv: string
  ): { signedSerializedPSBT: string } => {
    try {
      const network = WalletUtilities.getNetworkByType(wallet.networkType);
      const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT);

      let vin = 0;
      for (const input of inputs) {
        let keyPair;
        let internal;
        let index;
        if (input.subPath) {
          const [, j, k] = input.subPath.split('/');
          internal = parseInt(j);
          index = parseInt(k);
        } else if (wallet.isMultiSig) {
          const { subPath } = WalletUtilities.addressToMultiSig(input.address, wallet);
          [internal, index] = subPath;
        } else {
          const { subPath } = WalletUtilities.addressToKey(input.address, wallet, true);
          [internal, index] = subPath;
        }
        const { privateKey } = WalletUtilities.getPrivateKeyByIndex(
          xpriv,
          !!internal,
          index,
          network
        );
        keyPair = WalletUtilities.getKeyPair(privateKey, network);
        PSBT.signInput(vin, keyPair);
        vin++;
      }

      return { signedSerializedPSBT: PSBT.toBase64() };
    } catch (err) {
      console.log(err);
    }
  };

  static signVaultTransaction = (
    wallet: Vault,
    inputs: any,
    PSBT: bitcoinJS.Psbt,
    signer: VaultSigner,
    outgoing: number
  ):
    | {
        signedPSBT: bitcoinJS.Psbt;
        serializedPSBTEnvelop?;
      }
    | {
        signedPSBT?;
        serializedPSBTEnvelop: SerializedPSBTEnvelop;
      } => {
    const signingPayload: SigningPayload[] = [];
    let isSigned = false;
    if (signer.isMock && signer.xpriv) {
      // case: if the signer is mock and has an xpriv attached to it, we'll sign the PSBT right away
      const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
        wallet,
        inputs,
        PSBT.toBase64(),
        signer.xpriv
      );
      PSBT = bitcoinJS.Psbt.fromBase64(signedSerializedPSBT);
      isSigned = true;
    } else if (
      (signer.type === SignerType.TAPSIGNER && !isSignerAMF(signer)) ||
      signer.type === SignerType.LEDGER
    ) {
      const inputsToSign = [];
      for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
        let publicKey;
        let subPath;
        if (wallet.isMultiSig) {
          const multisigAddress = WalletUtilities.addressToMultiSig(
            inputs[inputIndex].address,
            wallet
          );
          publicKey = multisigAddress.signerPubkeyMap.get(signer.xpub);
          subPath = multisigAddress.subPath;
        } else {
          const singlesigAddress = WalletUtilities.addressToKey(
            inputs[inputIndex].address,
            wallet,
            true
          ) as {
            publicKey: Buffer;
            subPath: number[];
          };
          publicKey = singlesigAddress.publicKey;
          subPath = singlesigAddress.subPath;
        }
        const { hash, sighashType } = PSBT.getDigestToSign(inputIndex, publicKey);
        inputsToSign.push({
          digest: hash.toString('hex'),
          subPath: `/${subPath.join('/')}`,
          inputIndex,
          sighashType,
          publicKey: publicKey.toString('hex'),
        });
      }
      signingPayload.push({ payloadTarget: SignerType.TAPSIGNER, inputsToSign });
    } else if (signer.type === SignerType.MOBILE_KEY || signer.type === SignerType.SEED_WORDS) {
      signingPayload.push({ payloadTarget: signer.type, inputs });
    } else if (signer.type === SignerType.POLICY_SERVER) {
      const childIndexArray = [];
      for (const input of inputs) {
        let subPath;
        if (wallet.isMultiSig) {
          subPath = WalletUtilities.addressToMultiSig(input.address, wallet as Vault).subPath;
        } else {
          subPath = WalletUtilities.addressToKey(input.address, wallet, true).subPath;
        }
        childIndexArray.push({
          subPath,
          inputIdentifier: {
            txId: input.txId,
            vout: input.vout,
            value: input.value,
          },
        });
      }
      signingPayload.push({ payloadTarget: SignerType.POLICY_SERVER, childIndexArray, outgoing });
    }

    if (isSignerAMF(signer)) {
      signingPayload.push({ payloadTarget: signer.type, inputs });
    }
    const serializedPSBT = PSBT.toBase64();
    const serializedPSBTEnvelop: SerializedPSBTEnvelop = {
      signerId: signer.signerId,
      signerType: signer.type,
      serializedPSBT,
      signingPayload,
      isSigned,
    };
    return { serializedPSBTEnvelop };
  };

  static broadcastTransaction = async (
    wallet: Wallet | Vault,
    txHex: string,
    inputs: InputUTXOs[]
  ) => {
    const txid = await ElectrumClient.broadcast(txHex);

    if (!txid) throw new Error('Failed to broadcast transaction, txid missing');
    if (txid.includes('sendrawtransaction RPC error')) {
      let err;
      try {
        err = txid.split(':')[3].split('"')[1];
      } catch (err) {}
      throw new Error(err || txid);
    }

    WalletOperations.removeConsumedUTXOs(wallet, inputs); // chip consumed utxos
    return txid;
  };

  static transferST1 = async (
    wallet: Wallet | Vault,
    recipients: {
      address: string;
      amount: number;
    }[],
    averageTxFees: AverageTxFees
  ): Promise<{
    txPrerequisites: TransactionPrerequisite;
  }> => {
    recipients = recipients.map((recipient) => {
      recipient.amount = Math.round(recipient.amount);
      return recipient;
    });

    let { fee, balance, txPrerequisites } = WalletOperations.prepareTransactionPrerequisites(
      wallet,
      recipients,
      averageTxFees
    );

    let netAmount = 0;
    recipients.forEach((recipient) => {
      netAmount += recipient.amount;
    });

    if (balance < netAmount + fee) {
      // check w/ the lowest fee possible for this transaction
      const minTxFeePerByte = 1; // default minimum relay fee
      const minAvgTxFee = {
        ...averageTxFees,
      };
      minAvgTxFee[TxPriority.LOW].feePerByte = minTxFeePerByte;

      const minTxPrerequisites = WalletOperations.prepareTransactionPrerequisites(
        wallet,
        recipients,
        minAvgTxFee
      );

      if (minTxPrerequisites.balance < netAmount + minTxPrerequisites.fee)
        throw new Error('Insufficient balance');
      else txPrerequisites = minTxPrerequisites.txPrerequisites;
    }

    if (Object.keys(txPrerequisites).length) {
      return {
        txPrerequisites,
      };
    }
    throw new Error('Unable to create transaction: inputs failed at coinselect');
  };

  static transferST2 = async (
    wallet: Wallet | Vault,
    txPrerequisites: TransactionPrerequisite,
    txnPriority: TxPriority,
    network: bitcoinJS.networks.Network,
    recipients: {
      address: string;
      amount: number;
    }[],
    customTxPrerequisites?: TransactionPrerequisiteElements
  ): Promise<
    | {
        serializedPSBTEnvelops: SerializedPSBTEnvelop[];
        txid?;
      }
    | {
        serializedPSBTEnvelop?;
        txid: string;
      }
  > => {
    const { PSBT } = await WalletOperations.createTransaction(
      wallet,
      txPrerequisites,
      txnPriority,
      customTxPrerequisites
    );

    let inputs;
    if (txnPriority === TxPriority.CUSTOM) inputs = customTxPrerequisites.inputs;
    else inputs = txPrerequisites[txnPriority].inputs;

    if (wallet.entityKind === EntityKind.VAULT) {
      const { signers } = wallet as Vault;
      const serializedPSBTEnvelops: SerializedPSBTEnvelop[] = [];
      let outgoing = 0;
      recipients.forEach((recipient) => {
        outgoing += recipient.amount;
      });
      for (const signer of signers) {
        const { serializedPSBTEnvelop } = WalletOperations.signVaultTransaction(
          wallet as Vault,
          inputs,
          PSBT,
          signer,
          outgoing
        );
        serializedPSBTEnvelops.push(serializedPSBTEnvelop);
      }
      return { serializedPSBTEnvelops };
    }
    const { signedPSBT } = WalletOperations.signTransaction(wallet as Wallet, inputs, PSBT);
    const areSignaturesValid = signedPSBT.validateSignaturesOfAllInputs();
    if (!areSignaturesValid) throw new Error('Failed to broadcast: invalid signatures');
    const txHex = signedPSBT.finalizeAllInputs().extractTransaction().toHex();
    const txid = await this.broadcastTransaction(wallet, txHex, inputs);
    return {
      txid,
    };
  };

  static transferST3 = async (
    wallet: Wallet | Vault,
    serializedPSBTEnvelops: SerializedPSBTEnvelop[],
    txPrerequisites: TransactionPrerequisite,
    txnPriority: TxPriority,
    recipients: {
      address: string;
      amount: number;
    }[],
    txHex?: string
  ): Promise<{
    txid: string;
  }> => {
    const { inputs } = txPrerequisites[txnPriority];
    let combinedPSBT: bitcoinJS.Psbt = null;

    if (!txHex) {
      // construct the txHex by combining the signed PSBTs
      for (const serializedPSBTEnvelop of serializedPSBTEnvelops) {
        const { signerType, serializedPSBT, signingPayload } = serializedPSBTEnvelop;
        const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT);
        if (signerType === SignerType.TAPSIGNER && config.NETWORK_TYPE === NetworkType.MAINNET) {
          for (const { inputsToSign } of signingPayload) {
            for (const { inputIndex, publicKey, signature, sighashType } of inputsToSign) {
              PSBT.addSignedDisgest(
                inputIndex,
                Buffer.from(publicKey, 'hex'),
                Buffer.from(signature, 'hex'),
                sighashType
              );
            }
          }
        }

        if (!combinedPSBT) combinedPSBT = PSBT;
        else combinedPSBT.combine(PSBT);
      }

      // validating signatures
      const areSignaturesValid = combinedPSBT.validateSignaturesOfAllInputs();
      if (!areSignaturesValid) throw new Error('Failed to broadcast: invalid signatures');

      // finalise and construct the txHex
      txHex = combinedPSBT.finalizeAllInputs().extractTransaction().toHex();
    }

    const txid = await this.broadcastTransaction(wallet, txHex, inputs);
    return {
      txid,
    };
  };
}
