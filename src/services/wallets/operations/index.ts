/* eslint-disable no-continue */

/* eslint-disable no-await-in-loop */

/* eslint-disable prefer-const */

/* eslint-disable prefer-destructuring */

import * as bitcoinJS from 'bitcoinjs-lib';

import ECPairFactory from 'ecpair';
import config from 'src/utils/service-utilities/config';
import { parseInt } from 'lodash';
import ElectrumClient from 'src/services/electrum/client';
import { isSignerAMF } from 'src/hardware';
import idx from 'idx';
import RestClient, { TorStatus } from 'src/services/rest/RestClient';
import { hash256 } from 'src/utils/service-utilities/encryption';
import ecc from './taproot-utils/noble_ecc';
import {
  AverageTxFees,
  AverageTxFeesByNetwork,
  Balances,
  InputUTXOs,
  OutputUTXOs,
  SerializedPSBTEnvelop,
  SigningPayload,
  SyncedWallet,
  Transaction,
  TransactionPrerequisite,
  TransactionRecipients,
  UTXO,
} from '../interfaces';
import {
  BIP48ScriptTypes,
  DerivationPurpose,
  EntityKind,
  MiniscriptTypes,
  MultisigScriptType,
  NetworkType,
  ScriptTypes,
  SignerType,
  TransactionType,
  TxPriority,
  VaultType,
} from '../enums';
import {
  MiniscriptScheme,
  MiniscriptTxSelectedSatisfier,
  Signer,
  Vault,
  VaultSigner,
  VaultSpecs,
} from '../interfaces/vault';
import { AddressCache, AddressPubs, Wallet, WalletSpecs } from '../interfaces/wallet';
import WalletUtilities from './utils';
import { generateScriptWitnesses } from './miniscript/miniscript';
import { Path, Phase } from './miniscript/policy-generator';
import { getKeyUID } from 'src/utils/utilities';
import { generateBitcoinScript } from './miniscript/miniscript';
import { coinselect } from './coinselectFixed';

bitcoinJS.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);
const TESTNET_FEE_CUTOFF = 10;

const validator = (pubkey: Buffer, msghash: Buffer, signature: Buffer): boolean =>
  ECPair.fromPublicKey(pubkey).verify(msghash, signature);

const testnetFeeSurcharge = (wallet: Wallet | Vault) =>
  /* !! TESTNET ONLY !!
     as the redeem script for vault is heavy(esp. 3-of-5/3-of-6),
     the nodes reject the tx if the overall fee for the tx is low(which is the case w/ electrum)
     therefore we up the feeRatesPerByte by 1 to handle this case until we find a better sol
    */
  config.NETWORK_TYPE === NetworkType.TESTNET && wallet.entityKind === EntityKind.VAULT ? 0 : 0;

// Helper function for deep cloning
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const fixedCoinselect = (wallet: Wallet | Vault, inputUTXOs, outputUTXOs, feePerByte) => {
  if ([ScriptTypes.P2WPKH, ScriptTypes.P2WSH, ScriptTypes.P2TR].includes(wallet.scriptType)) {
    outputUTXOs[0]['isSegWit'] = true;
  } else {
    outputUTXOs[0]['isSegWit'] = false;
  }
  if (wallet.entityKind == 'VAULT' && (wallet as Vault).isMultiSig) {
    outputUTXOs[0]['isMultisig'] = true;
  } else {
    outputUTXOs[0]['isMultisig'] = false;
  }
  return coinselect(inputUTXOs, outputUTXOs, feePerByte + testnetFeeSurcharge(wallet));
};

const updateInputsForFeeCalculation = (
  wallet: Wallet | Vault,
  inputUTXOs,
  miniscriptSelectedSatisfier
) => {
  const isNativeSegwit =
    wallet.scriptType === ScriptTypes.P2WPKH || wallet.scriptType === ScriptTypes.P2WSH;
  const isWrappedSegwit =
    wallet.scriptType === ScriptTypes['P2SH-P2WPKH'] ||
    wallet.scriptType === ScriptTypes['P2SH-P2WSH'];
  const isTaproot = wallet.scriptType === ScriptTypes.P2TR;

  return inputUTXOs.map((u) => {
    if (wallet.entityKind == 'VAULT' && (wallet as Vault).isMultiSig) {
      let m = (wallet as Vault).scheme.m;
      let n = (wallet as Vault).scheme.n;

      if ((wallet as Vault).type === VaultType.MINISCRIPT) {
        // Get witness data requirements from ASM
        const asm = miniscriptSelectedSatisfier.selectedScriptWitness.asm;

        const sigCount = (asm.match(/<sig\([^)]+\)>/g) || []).length; // Match signatures
        // Match only top-level placeholders that aren't signatures
        let witnessKeyCount = (asm.replace(/<sig\([^)]+\)>/g, '').match(/<[^>]+>/g) || []).length;

        const cleanAsm = asm
          .replace(/<[^>]+>/g, '')
          .replace(/[()>]/g, '')
          .trim();
        const addedElements = cleanAsm.split(' ').filter((x) => x).length;

        if (isTaproot || isNativeSegwit) {
          const miniscript = (wallet as Vault).scheme?.miniscriptScheme.miniscript;
          const { asm } = generateBitcoinScript(miniscript);
          const script = asm.split(' ');

          // Calculate script size for witness
          let scriptSize = 0;
          script.forEach((op) => {
            if (op.startsWith('OP_')) {
              scriptSize += 1; // just the opcode byte
            } else if (op.startsWith('<HASH160')) {
              scriptSize += 21; // push(1) + hash160(20)
            } else if (op.startsWith('<K') || op.startsWith('<IK') || op.startsWith('<EK')) {
              scriptSize += 34; // push(1) + pubkey(33)
            } else if (
              op.startsWith('<') &&
              script[script.indexOf(op) + 1] === 'OP_CHECKLOCKTIMEVERIFY'
            ) {
              scriptSize += 4; // push(1) + timelock(3)
            } else if (op !== '') {
              scriptSize += 2; // push byte(1) + data(1)
            }
          });

          // Needed since from 4 or more the Miniscript generated uses nester ors, with all but the first pubkey as pubkey hashes.
          if (m === 1 && n >= 4 && witnessKeyCount === 0) {
            witnessKeyCount += 1;
          }

          u.script = {
            length: Math.ceil(
              (1 + addedElements * 2 + scriptSize + sigCount * 74 + witnessKeyCount * 34) / 4
            ),
          };
        }
        return u;
      }
      // TODO: Update Taproot when implementing Taproot multisig
      if (isTaproot || isNativeSegwit) {
        const baseSize = 22;
        u.script = {
          length: Math.ceil((baseSize + m * 74 + n * 34 + n * 4) / 4),
        };
      } else if (isWrappedSegwit) {
        const baseSize = 49;
        u.script = {
          length: baseSize + Math.ceil((baseSize + m * 74 + n * 34 + n * 4) / 4),
        };
      } else {
        const baseSize = 23;
        u.script = {
          length: baseSize + m * 74 + n * 34 + n * 4,
        };
      }
    } else {
      if (isTaproot) {
        u.script = { length: 24 }; // P2TR
      } else if (isNativeSegwit) {
        u.script = { length: 27 }; // P2WPKH
      } else if (isWrappedSegwit) {
        u.script = { length: 50 }; // P2SH-P2WPKH
      } else {
        u.script = { length: 107 }; // Legacy P2PKH
      }
    }
    return u;
  });
};

const updateOutputsForFeeCalculation = (outputs, network) => {
  for (const o of outputs) {
    if (o.address && (o.address.startsWith('bc1') || o.address.startsWith('tb1'))) {
      // in case address is non-typical and takes more bytes than coinselect library anticipates by default
      o.script = {
        length: bitcoinJS.address.toOutputScript(
          o.address,
          network === NetworkType.MAINNET ? bitcoinJS.networks.bitcoin : bitcoinJS.networks.testnet
        ).length,
      };
    }
  }
  return outputs;
};

export default class WalletOperations {
  public static getExternalInternalAddressAtIdx = (
    wallet: Wallet | Vault,
    index: number,
    isInternal: boolean = false
  ): string => {
    let receivingAddress;
    const { entityKind, specs, networkType } = wallet;
    const network = WalletUtilities.getNetworkByType(networkType);

    const cached = isInternal
      ? idx(specs, (_) => _.addresses.internal[index])
      : idx(specs, (_) => _.addresses.external[index]); // address cache hit
    if (cached) return cached;

    if ((wallet as Vault).isMultiSig) {
      // case: multi-sig vault
      receivingAddress = WalletUtilities.createMultiSig(wallet as Vault, index, isInternal).address;
    } else {
      // case: single-sig vault/wallet
      const xpub =
        entityKind === EntityKind.VAULT
          ? (specs as VaultSpecs).xpubs[0]
          : (specs as WalletSpecs).xpub;
      const derivationPath = (wallet as Wallet)?.derivationDetails?.xDerivationPath;

      let purpose;
      if (entityKind === EntityKind.WALLET) purpose = WalletUtilities.getPurpose(derivationPath);
      else if (entityKind === EntityKind.VAULT) {
        if (wallet.scriptType === ScriptTypes.P2WPKH) purpose = DerivationPurpose.BIP84;
        else if (wallet.scriptType === ScriptTypes.P2WSH) purpose = DerivationPurpose.BIP48;
      }

      receivingAddress = WalletUtilities.getAddressByIndex(
        xpub,
        isInternal,
        index,
        network,
        purpose
      );
    }

    return receivingAddress;
  };

  public static getNextFreeExternalAddress = (
    wallet: Wallet | Vault
  ): { receivingAddress: string } => {
    return {
      receivingAddress: WalletOperations.getExternalInternalAddressAtIdx(
        wallet,
        wallet.specs.nextFreeAddressIndex
      ),
    };
  };

  static getNextFreeAddress = (wallet: Wallet | Vault) => {
    if (wallet.specs.receivingAddress) return wallet.specs.receivingAddress;
    const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(wallet);
    return receivingAddress;
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
      ) {
        amount -= input.value;
      }

      senderAddresses.push(inputAddress);
      fee += input.value;
    }

    for (const output of outputs) {
      if (!output.scriptPubKey.addresses) continue; // OP_RETURN w/ no value(tx0)

      const outputAddress = output.scriptPubKey.addresses[0];
      if (
        externalAddresses[outputAddress] !== undefined ||
        internalAddresses[outputAddress] !== undefined
      ) {
        amount += output.value;
      }

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
    let transactions = wallet.specs.transactions;
    let lastUsedAddressIndex = wallet.specs.nextFreeAddressIndex - 1;
    let lastUsedChangeAddressIndex = wallet.specs.nextFreeChangeAddressIndex - 1;
    let totalExternalAddresses = wallet.specs.totalExternalAddresses;

    const txidToIndex = {}; // transaction-id to index mapping(assists transaction updation)
    for (let index = 0; index < transactions.length; index++) {
      const transaction = transactions[index];
      txidToIndex[transaction.txid] = index;
    }

    const { txids, txidToAddress } = await ElectrumClient.syncHistoryByAddress(addresses, network);

    let newTxids = txids.filter((txid) => {
      const tx = wallet.specs.transactions.find((tx) => tx.txid === txid);
      return !tx || tx.confirmations < 6;
    });
    transactions = transactions.filter(
      (tx) =>
        txids.includes(tx.txid) ||
        [...tx.senderAddresses, ...tx.recipientAddresses].some(
          (address) => !addresses.includes(address)
        )
    );

    const txs = await ElectrumClient.getTransactionsById(newTxids);

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

      // update the last used address/change-address index
      const address = txidToAddress[tx.txid];
      if (externalAddresses[address] !== undefined) {
        if (externalAddresses[address] > lastUsedAddressIndex) {
          if (externalAddresses[address] >= wallet.specs.totalExternalAddresses - 1) {
            totalExternalAddresses = externalAddresses[address] + 2;
          }
          lastUsedAddressIndex = externalAddresses[address];
          hasNewUpdates = true;
        }
      } else if (internalAddresses[address] !== undefined) {
        if (internalAddresses[address] > lastUsedChangeAddressIndex) {
          lastUsedChangeAddressIndex = internalAddresses[address];
          hasNewUpdates = true;
        }
      }

      if (existingTx) {
        // transaction already exists in the database, should update till transaction has 3+ confs
        if (!tx.confirmations) continue; // unconfirmed transaction
        if (existingTx.confirmations > 6) continue; // 6+ confs
        if (existingTx.confirmations !== tx.confirmations) {
          // update transaction confirmations
          existingTx.confirmations = tx.confirmations;
          existingTx.blockTime = tx.blocktime;
          existingTx.date = tx.time ? new Date(tx.time * 1000).toUTCString() : existingTx.date;
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
      }
    }

    newTransactions.sort((tx1, tx2) => (tx1.confirmations > tx2.confirmations ? 1 : -1));
    return {
      transactions: newTransactions.concat(transactions),
      hasNewUpdates,
      lastUsedAddressIndex,
      lastUsedChangeAddressIndex,
      totalExternalAddresses,
    };
  };

  static syncWalletsViaElectrumClient = async (
    wallets: (Wallet | Vault)[],
    network: bitcoinJS.networks.Network,
    hardRefresh?: boolean
  ): Promise<{
    synchedWallets: SyncedWallet[];
  }> => {
    const synchedWallets = [];
    const gapLimit = hardRefresh ? config.GAP_LIMIT : config.GAP_LIMIT / 2;
    for (const wallet of wallets) {
      let needsRecheck = true;

      // Using nextFreeAddressIndex instead of totalExternalAddresses as the beginning point here in case many usused addreses were generated
      let currentRecheckExternal =
        hardRefresh || wallet.specs.nextFreeAddressIndex < gapLimit
          ? 0
          : wallet.specs.nextFreeAddressIndex - gapLimit;
      let currentRecheckInternal =
        hardRefresh || wallet.specs.nextFreeChangeAddressIndex < gapLimit
          ? 0
          : wallet.specs.nextFreeChangeAddressIndex - gapLimit;

      const addressCache: AddressCache = wallet.specs.addresses || { external: {}, internal: {} };
      const addressPubs: AddressPubs = wallet.specs.addressPubs || {};
      let balances: Balances = {
        confirmed: 0,
        unconfirmed: 0,
      };
      const newUTXOs = [];
      let confirmedUTXOs: InputUTXOs[] = [];
      let unconfirmedUTXOs: InputUTXOs[] = [];

      if (!hardRefresh) {
        unconfirmedUTXOs = [...wallet.specs.unconfirmedUTXOs];
        confirmedUTXOs = [...wallet.specs.confirmedUTXOs];
        balances = wallet.specs.balances;
      }

      let purpose;
      if (wallet.entityKind === EntityKind.WALLET) {
        purpose = WalletUtilities.getPurpose((wallet as Wallet).derivationDetails.xDerivationPath);
      }

      while (needsRecheck) {
        let addresses = [];

        // collect external(receive) chain addresses
        const externalAddresses: { [address: string]: number } = {}; // all external addresses(till closingExtIndex)
        for (
          let itr = currentRecheckExternal;
          itr < wallet.specs.totalExternalAddresses - 1 + gapLimit;
          itr++
        ) {
          let address: string;
          let pubsToCache: string[];
          if (addressCache.external[itr]) address = addressCache.external[itr]; // cache hit
          else {
            // cache miss
            if ((wallet as Vault).isMultiSig) {
              const multisig = WalletUtilities.createMultiSig(wallet as Vault, itr, false);
              address = multisig.address;
              pubsToCache = multisig.orderPreservedPubkeys; // optional(currently not available for miniscript based vaults)
            } else {
              let xpub = null;
              if (wallet.entityKind === EntityKind.VAULT) xpub = (wallet as Vault).specs.xpubs[0];
              else xpub = (wallet as Wallet).specs.xpub;

              const singlesig = WalletUtilities.getAddressAndPubByIndex(
                xpub,
                false,
                itr,
                network,
                purpose
              );
              address = singlesig.address;
              pubsToCache = [singlesig.pub];
            }

            addressCache.external[itr] = address;
            if (pubsToCache) addressPubs[address] = pubsToCache.join('/');
          }

          externalAddresses[address] = itr;
          addresses.push(address);
        }

        // collect internal(change) chain addresses
        const internalAddresses: { [address: string]: number } = {}; // all internal addresses(till closingIntIndex)
        for (
          let itr = currentRecheckInternal;
          itr < wallet.specs.nextFreeChangeAddressIndex + gapLimit;
          itr++
        ) {
          let address: string;
          let pubsToCache: string[];

          if (addressCache.internal[itr]) address = addressCache.internal[itr]; // cache hit
          else {
            // cache miss
            if ((wallet as Vault).isMultiSig) {
              const multisig = WalletUtilities.createMultiSig(wallet as Vault, itr, true);
              address = multisig.address;
              pubsToCache = multisig.orderPreservedPubkeys; // optional(currently not available for miniscript based vaults)
            } else {
              let xpub = null;
              if (wallet.entityKind === EntityKind.VAULT) xpub = (wallet as Vault).specs.xpubs[0];
              else xpub = (wallet as Wallet).specs.xpub;

              const singlesig = WalletUtilities.getAddressAndPubByIndex(
                xpub,
                true,
                itr,
                network,
                purpose
              );
              address = singlesig.address;
              pubsToCache = [singlesig.pub];
            }

            addressCache.internal[itr] = address;
            if (pubsToCache) addressPubs[address] = pubsToCache.join('/');
          }

          internalAddresses[address] = itr;
          addresses.push(address);
        }

        currentRecheckExternal = wallet.specs.totalExternalAddresses - 1 + gapLimit;
        currentRecheckInternal = wallet.specs.nextFreeChangeAddressIndex + gapLimit;

        // sync utxos & balances
        const utxosByAddress = await ElectrumClient.syncUTXOByAddress(addresses, network);

        for (const address in utxosByAddress) {
          const utxos = utxosByAddress[address];
          for (const utxo of utxos) {
            const existsInConfirmed = confirmedUTXOs.some(
              (confirmedUTXO) =>
                confirmedUTXO.txId === utxo.txId && confirmedUTXO.vout === utxo.vout
            );

            const existsInUnconfirmed = unconfirmedUTXOs.some(
              (unconfirmedUTXO) =>
                unconfirmedUTXO.txId === utxo.txId && unconfirmedUTXO.vout === utxo.vout
            );

            if (utxo.height > 0) {
              if (existsInConfirmed) {
                continue;
              }
              if (existsInUnconfirmed) {
                unconfirmedUTXOs = unconfirmedUTXOs.filter(
                  (unconfirmedUTXO) =>
                    !(unconfirmedUTXO.txId === utxo.txId && unconfirmedUTXO.vout === utxo.vout)
                );
                balances.unconfirmed -= utxo.value;
              }

              confirmedUTXOs.push(utxo);
              balances.confirmed += utxo.value;
            } else {
              if (existsInUnconfirmed) {
                continue;
              }
              // Should not happen unless it was in a block that was confirmed then a fork removed that block without adding that transaction
              if (existsInConfirmed) {
                confirmedUTXOs = confirmedUTXOs.filter(
                  (confirmedUTXO) =>
                    !(confirmedUTXO.txId === utxo.txId && confirmedUTXO.vout === utxo.vout)
                );
                balances.confirmed -= utxo.value;
              }
              unconfirmedUTXOs.push(utxo);
              balances.unconfirmed += utxo.value;
            }
          }
        }

        // Check if a UTXO is new in the wallet
        for (const utxo of [...confirmedUTXOs, ...unconfirmedUTXOs]) {
          const existsInConfirmed = wallet.specs.confirmedUTXOs.some(
            (confirmedUTXO) => confirmedUTXO.txId === utxo.txId && confirmedUTXO.vout === utxo.vout
          );

          const existsInUnconfirmed = wallet.specs.unconfirmedUTXOs.some(
            (unconfirmedUTXO) =>
              unconfirmedUTXO.txId === utxo.txId && unconfirmedUTXO.vout === utxo.vout
          );

          if (!existsInConfirmed && !existsInUnconfirmed) {
            newUTXOs.push(utxo);
          }
        }

        if (!hardRefresh) {
          addresses = addresses.filter((address) =>
            newUTXOs.some((utxo) => utxo.address === address)
          );
        }

        const {
          transactions,
          lastUsedAddressIndex,
          lastUsedChangeAddressIndex,
          totalExternalAddresses,
          hasNewUpdates,
        } = await WalletOperations.fetchTransactions(
          wallet,
          addresses,
          externalAddresses,
          internalAddresses,
          network
        );

        needsRecheck =
          totalExternalAddresses > wallet.specs.totalExternalAddresses ||
          lastUsedChangeAddressIndex + 1 > wallet.specs.nextFreeChangeAddressIndex;

        // update wallet w/ latest utxos, balances and transactions
        wallet.specs.nextFreeAddressIndex = lastUsedAddressIndex + 1;
        wallet.specs.nextFreeChangeAddressIndex = lastUsedChangeAddressIndex + 1;
        wallet.specs.totalExternalAddresses = totalExternalAddresses;
        wallet.specs.addresses = addressCache;
        wallet.specs.addressPubs = addressPubs;
        wallet.specs.receivingAddress =
          WalletOperations.getNextFreeExternalAddress(wallet).receivingAddress;
        wallet.specs.unconfirmedUTXOs = unconfirmedUTXOs;
        wallet.specs.confirmedUTXOs = confirmedUTXOs;
        wallet.specs.balances = balances;
        wallet.specs.transactions = transactions;
        wallet.specs.hasNewUpdates = hasNewUpdates || newUTXOs.length !== 0;
        wallet.specs.lastSynched = Date.now();
      }

      synchedWallets.push({
        synchedWallet: wallet,
        newUTXOs,
      });
    }

    return {
      synchedWallets,
    };
  };

  static removeConsumedUTXOs = (wallet: Wallet | Vault, inputs: InputUTXOs[]) => {
    const consumedUTXOs: { [txid: string]: InputUTXOs } = {};
    inputs.forEach((input) => {
      consumedUTXOs[input.txId] = input;
    });

    // update primary utxo set and balance
    const updatedConfirmedUTXOSet = [];
    wallet.specs.confirmedUTXOs.forEach((confirmedUTXO) => {
      if (consumedUTXOs[confirmedUTXO.txId]) {
        if (consumedUTXOs[confirmedUTXO.txId].vout === confirmedUTXO.vout) {
          wallet.specs.balances.confirmed -= consumedUTXOs[confirmedUTXO.txId].value;
          return;
        }
      }

      updatedConfirmedUTXOSet.push(confirmedUTXO);
    });
    wallet.specs.confirmedUTXOs = updatedConfirmedUTXOSet;

    // uncofirmed balance spend on testnet is activated
    const updatedUnconfirmedUTXOSet = [];
    wallet.specs.unconfirmedUTXOs.forEach((unconfirmedUTXO) => {
      if (consumedUTXOs[unconfirmedUTXO.txId]) {
        if (consumedUTXOs[unconfirmedUTXO.txId].vout === unconfirmedUTXO.vout) {
          wallet.specs.balances.unconfirmed -= consumedUTXOs[unconfirmedUTXO.txId].value;
          return;
        }
      }

      updatedUnconfirmedUTXOSet.push(unconfirmedUTXO);
    });
    wallet.specs.unconfirmedUTXOs = updatedUnconfirmedUTXOSet;
  };

  static mockFeeRates = () => {
    // final safety net, enables send flow and consequently the usability of custom fee during fee-info failure scenarios

    // high fee: 10 minutes
    const highFeeBlockEstimate = 1;
    const high = {
      feePerByte: 5,
      estimatedBlocks: highFeeBlockEstimate,
    };

    // medium fee: 30 mins
    const mediumFeeBlockEstimate = 3;
    const medium = {
      feePerByte: 3,
      estimatedBlocks: mediumFeeBlockEstimate,
    };

    // low fee: 60 mins
    const lowFeeBlockEstimate = 6;
    const low = {
      feePerByte: 1,
      estimatedBlocks: lowFeeBlockEstimate,
    };
    const feeRatesByPriority = { high, medium, low };
    return feeRatesByPriority;
  };

  static estimateFeeRatesViaElectrum = async () => {
    try {
      // high fee: 10 minutes
      const highFeeBlockEstimate = 1;
      const high = {
        feePerByte: Math.round(await ElectrumClient.estimateFee(highFeeBlockEstimate)),
        estimatedBlocks: highFeeBlockEstimate,
      };

      // medium fee: 30 mins
      const mediumFeeBlockEstimate = 3;
      const medium = {
        feePerByte: Math.round(await ElectrumClient.estimateFee(mediumFeeBlockEstimate)),
        estimatedBlocks: mediumFeeBlockEstimate,
      };

      // low fee: 60 mins
      const lowFeeBlockEstimate = 6;
      const low = {
        feePerByte: Math.round(await ElectrumClient.estimateFee(lowFeeBlockEstimate)),
        estimatedBlocks: lowFeeBlockEstimate,
      };

      if (config.NETWORK_TYPE === NetworkType.TESTNET) {
        // working around testnet fee spikes
        return WalletOperations.mockFeeRates();
      }

      const feeRatesByPriority = { high, medium, low };
      return feeRatesByPriority;
    } catch (err) {
      console.log('Failed to fetch fee via Fulcrum', { err });
      throw new Error('Failed to fetch fee via Fulcrum');
    }
  };

  static fetchFeeRatesByPriority = async () => {
    // main: mempool.space, fallback: fulcrum target block based fee estimator
    try {
      let endpoint;
      if (config.NETWORK_TYPE === NetworkType.TESTNET) {
        endpoint = 'https://mempool.space/testnet/api/v1/fees/recommended';
      } else {
        endpoint =
          RestClient.getTorStatus() === TorStatus.CONNECTED
            ? 'http://mempoolhqx4isw62xs7abwphsq7ldayuidyx2v2oethdhhj6mlo2r6ad.onion/api/v1/fees/recommended'
            : 'https://mempool.space/api/v1/fees/recommended';
      }

      const res = await RestClient.get(endpoint);
      const mempoolFee: {
        economyFee: number;
        fastestFee: number;
        halfHourFee: number;
        hourFee: number;
        minimumFee: number;
      } = res.data;

      // high fee: 10 minutes
      const highFeeBlockEstimate = 1;
      const high = {
        feePerByte: mempoolFee.fastestFee,
        estimatedBlocks: highFeeBlockEstimate,
      };

      // medium fee: 30 minutes
      const mediumFeeBlockEstimate = 3;
      const medium = {
        feePerByte: mempoolFee.halfHourFee,
        estimatedBlocks: mediumFeeBlockEstimate,
      };

      // low fee: 60 minutes
      const lowFeeBlockEstimate = 6;
      const low = {
        feePerByte: mempoolFee.hourFee,
        estimatedBlocks: lowFeeBlockEstimate,
      };

      if (config.NETWORK_TYPE === NetworkType.TESTNET) {
        // working around testnet fee spikes
        return WalletOperations.mockFeeRates();
      }

      const feeRatesByPriority = { high, medium, low };
      return feeRatesByPriority;
    } catch (err) {
      console.log('Failed to fetch fee via mempool.space', { err });
      try {
        if (config.NETWORK_TYPE === NetworkType.TESTNET) {
          throw new Error('Take mock fee, testnet3 fee via electrum is unstable');
        }
        return WalletOperations.estimateFeeRatesViaElectrum();
      } catch (err) {
        console.log({ err });
        return WalletOperations.mockFeeRates();
      }
    }
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

    // configure to procure fee by network type
    const averageTxFeeByNetwork: AverageTxFeesByNetwork = {
      [NetworkType.TESTNET]: averageTxFees,
      [NetworkType.MAINNET]: averageTxFees,
    };
    return averageTxFeeByNetwork;
  };

  static calculateSendMaxFee = (
    wallet: Wallet | Vault,
    recipients: {
      address: string;
      amount: number;
    }[],
    feePerByte: number,
    selectedUTXOs?: UTXO[],
    miniscriptSelectedSatisfier?: MiniscriptTxSelectedSatisfier
  ): { fee: number } => {
    let inputUTXOs;
    if (selectedUTXOs && selectedUTXOs.length) {
      inputUTXOs = selectedUTXOs;
    } else {
      inputUTXOs = [...wallet.specs.confirmedUTXOs, ...wallet.specs.unconfirmedUTXOs];
    }

    inputUTXOs = updateInputsForFeeCalculation(wallet, inputUTXOs, miniscriptSelectedSatisfier);

    let availableBalance = 0;
    inputUTXOs.forEach((utxo) => {
      availableBalance += utxo.value;
    });

    let outputUTXOs = [];

    let remainingBalance = availableBalance;
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      if (i === recipients.length - 1) {
        outputUTXOs.push({
          address: recipient.address,
          value: remainingBalance,
        });
      } else {
        outputUTXOs.push({
          address: recipient.address,
          value: recipient.amount,
        });
        remainingBalance -= recipient.amount;
      }
    }
    outputUTXOs = updateOutputsForFeeCalculation(outputUTXOs, wallet.networkType);

    let { inputs, outputs, fee } = fixedCoinselect(wallet, inputUTXOs, outputUTXOs, feePerByte);

    let i = 0;
    const MAX_RETRIES = 10000; // Could raise to allow more retries in case of many uneconomic UTXOs in a wallet
    while ((!inputs || !outputs) && i < MAX_RETRIES) {
      let netAmount = 0;
      recipients.forEach((recipient) => {
        netAmount += recipient.amount;
      });
      if (outputUTXOs && outputUTXOs.length) {
        outputUTXOs[outputUTXOs.length - 1].value = remainingBalance - fee - i;
      }

      ({ inputs, outputs, fee } = fixedCoinselect(
        wallet,
        deepClone(inputUTXOs),
        deepClone(outputUTXOs),
        feePerByte
      ));
      i++;
    }

    fee = remainingBalance - outputs[outputs.length - 1].value;

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
    averageTxFees: AverageTxFees,
    selectedUTXOs?: UTXO[],
    miniscriptSelectedSatisfier?: MiniscriptTxSelectedSatisfier
  ):
    | {
        fee: number;
        balance: number;
        txPrerequisites?;
        txRecipients?;
      }
    | {
        txPrerequisites: TransactionPrerequisite;
        txRecipients: TransactionRecipients;
        fee?;
        balance?;
      } => {
    let inputUTXOs;
    if (selectedUTXOs && selectedUTXOs.length) {
      inputUTXOs = selectedUTXOs;
    } else {
      inputUTXOs = [...wallet.specs.confirmedUTXOs, ...wallet.specs.unconfirmedUTXOs];
    }

    inputUTXOs = updateInputsForFeeCalculation(wallet, inputUTXOs, miniscriptSelectedSatisfier);

    let availableBalance = 0;
    inputUTXOs.forEach((utxo) => {
      availableBalance += utxo.value;
    });

    let outputUTXOs = [];
    for (const recipient of recipients) {
      outputUTXOs.push({
        address: recipient.address,
        value: recipient.amount,
      });
    }

    outputUTXOs = updateOutputsForFeeCalculation(outputUTXOs, wallet.networkType);

    const defaultTxPriority = TxPriority.LOW; // doing base calculation with low fee (helps in sending the tx even if higher priority fee isn't possible)
    const defaultFeePerByte = averageTxFees[defaultTxPriority].feePerByte;
    const defaultEstimatedBlocks = averageTxFees[defaultTxPriority].estimatedBlocks;
    const assets = fixedCoinselect(
      wallet,
      deepClone(inputUTXOs),
      deepClone(outputUTXOs),
      defaultFeePerByte
    );
    let defaultPriorityInputs = assets.inputs;
    let defaultPriorityOutputs = assets.outputs;
    let defaultPriorityFee = assets.fee;
    let netAmount = 0;
    recipients.forEach((recipient) => {
      netAmount += recipient.amount;
    });

    if (!defaultPriorityInputs || !defaultPriorityOutputs) {
      const defaultDebitedAmount = netAmount + defaultPriorityFee;
      if (outputUTXOs && outputUTXOs.length && defaultDebitedAmount > availableBalance) {
        const otherOutputsTotal = outputUTXOs
          .slice(0, -1)
          .reduce((sum, output) => sum + output.value, 0);
        outputUTXOs[outputUTXOs.length - 1].value =
          availableBalance - defaultPriorityFee - otherOutputsTotal;
      }

      const assets = fixedCoinselect(
        wallet,
        deepClone(inputUTXOs),
        deepClone(outputUTXOs),
        defaultFeePerByte
      );

      if (!assets.inputs || !assets.outputs) {
        return {
          fee: defaultPriorityFee,
          balance: availableBalance,
        };
      }

      defaultPriorityInputs = deepClone(assets.inputs);
      defaultPriorityOutputs = deepClone(assets.outputs);
      defaultPriorityFee = assets.fee;
    }

    const txPrerequisites: TransactionPrerequisite = {};
    for (const priority of [TxPriority.LOW, TxPriority.MEDIUM, TxPriority.HIGH]) {
      if (priority === defaultTxPriority) {
        txPrerequisites[priority] = {
          inputs: deepClone(defaultPriorityInputs),
          outputs: deepClone(defaultPriorityOutputs),
          fee: defaultPriorityFee,
          estimatedBlocks: defaultEstimatedBlocks,
        };
      } else {
        // re-computing inputs with a non-default priority fee
        let { inputs, outputs, fee } = fixedCoinselect(
          wallet,
          deepClone(inputUTXOs),
          deepClone(outputUTXOs),
          averageTxFees[priority].feePerByte
        );

        if (!inputs || !outputs) {
          let netAmount = 0;
          recipients.forEach((recipient) => {
            netAmount += recipient.amount;
          });
          const debitedAmount = netAmount + fee;
          if (outputUTXOs && outputUTXOs.length && debitedAmount > availableBalance) {
            const otherOutputsTotal = outputUTXOs
              .slice(0, -1)
              .reduce((sum, output) => sum + output.value, 0);
            outputUTXOs[outputUTXOs.length - 1].value = availableBalance - fee - otherOutputsTotal;
          }

          ({ inputs, outputs, fee } = fixedCoinselect(
            wallet,
            deepClone(inputUTXOs),
            deepClone(outputUTXOs),
            averageTxFees[priority].feePerByte
          ));
        }

        if (!inputs || !outputs) {
          // to previous priority assets
          if (priority === TxPriority.MEDIUM) {
            txPrerequisites[priority] = txPrerequisites[TxPriority.LOW];
          }
          if (priority === TxPriority.HIGH) {
            txPrerequisites[priority] = txPrerequisites[TxPriority.MEDIUM];
          }
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

    const recipientsOptions = {};
    for (const priority in txPrerequisites) {
      const outputs = txPrerequisites[priority].outputs;
      if (!outputs) continue;

      recipientsOptions[priority] = outputs
        .map((output) => {
          // Find matching recipient from original list to avoid including change outputs
          const matchingRecipient = recipients.find(
            (recipient) => recipient.address === output.address
          );
          if (matchingRecipient) {
            return {
              address: output.address,
              amount: output.value,
            };
          }
          return null;
        })
        .filter(Boolean);
    }

    return {
      txPrerequisites,
      txRecipients: recipientsOptions,
    };
  };

  static prepareCustomTransactionPrerequisites = (
    wallet: Wallet | Vault,
    outputUTXOs: {
      address: string;
      value: number;
    }[],
    customTxFeePerByte: number,
    selectedUTXOs?: UTXO[],
    miniscriptSelectedSatisfier?: MiniscriptTxSelectedSatisfier
  ): {
    txPrerequisites: TransactionPrerequisite;
    txRecipients: TransactionRecipients;
  } => {
    let inputUTXOs;
    if (selectedUTXOs && selectedUTXOs.length) {
      inputUTXOs = selectedUTXOs;
    } else {
      inputUTXOs = [...wallet.specs.confirmedUTXOs, ...wallet.specs.unconfirmedUTXOs];
    }

    inputUTXOs = updateInputsForFeeCalculation(wallet, inputUTXOs, miniscriptSelectedSatisfier);
    outputUTXOs = updateOutputsForFeeCalculation(outputUTXOs, wallet.networkType);

    let { inputs, outputs, fee } = fixedCoinselect(
      wallet,
      deepClone(inputUTXOs),
      deepClone(outputUTXOs),
      customTxFeePerByte
    );

    if (!inputs) {
      let availableBalance = 0;
      inputUTXOs.forEach((utxo) => {
        availableBalance += utxo.value;
      });

      let netAmount = 0;
      outputUTXOs.forEach((recipient) => {
        netAmount += recipient.value;
      });

      const debitedAmount = netAmount + fee;

      if (outputUTXOs && outputUTXOs.length && debitedAmount > availableBalance) {
        const otherOutputsTotal = outputUTXOs
          .slice(0, -1)
          .reduce((sum, output) => sum + output.value, 0);
        outputUTXOs[outputUTXOs.length - 1].value = availableBalance - fee - otherOutputsTotal;
      }

      ({ inputs, outputs, fee } = fixedCoinselect(
        wallet,
        deepClone(inputUTXOs),
        deepClone(outputUTXOs),
        customTxFeePerByte
      ));
    }

    if (!inputs) return { txPrerequisites: { fee }, txRecipients: {} };

    return {
      txPrerequisites: {
        [TxPriority.CUSTOM]: {
          inputs: deepClone(inputs),
          outputs: deepClone(outputs),
          fee,
        },
      },
      txRecipients: {
        [TxPriority.CUSTOM]: outputs
          .map((output) => {
            // Find matching recipient from original list to avoid including change outputs
            const matchingRecipient = outputUTXOs.find(
              (recipient) => recipient.address === output.address
            );
            if (matchingRecipient) {
              return {
                address: output.address,
                amount: output.value,
              };
            }
            return null;
          })
          .filter(Boolean),
      },
    };
  };

  static getSelectedSatisfier = (
    miniscriptScheme: MiniscriptScheme,
    miniscriptTxElements: {
      selectedPhase: number;
      selectedPaths: number[];
    }
  ): MiniscriptTxSelectedSatisfier => {
    const { selectedPhase: selectedPhaseId, selectedPaths: selectedPathsId } = miniscriptTxElements;

    let selectedPhase: Phase;
    for (let phase of miniscriptScheme.miniscriptElements.phases) {
      if (phase.id === selectedPhaseId) {
        selectedPhase = phase;
        break;
      }
    }
    if (selectedPathsId.length < selectedPhase.requiredPaths) {
      throw new Error('Insufficient paths selected for the given phase');
    }

    const { scriptWitnesses } = generateScriptWitnesses(miniscriptScheme.miniscriptPolicy);

    const hasTimelock = !!selectedPhase.timelock;
    let witnessesInSelectedPhase: {
      asm: string;
      nLockTime?: number;
      nSequence?: number;
    }[] = [];
    for (let scriptWitness of scriptWitnesses) {
      if (hasTimelock) {
        if (scriptWitness.nLockTime === selectedPhase.timelock) {
          witnessesInSelectedPhase.push(scriptWitness);
        }
      } else {
        if (!scriptWitness.nLockTime) {
          witnessesInSelectedPhase.push(scriptWitness);
        }
      }
    }

    // Generate selectedPaths array based on selectedPathsId
    const selectedPaths = selectedPathsId
      .map((pathId) => selectedPhase.paths.find((path) => path.id === pathId))
      .filter((path) => path !== undefined);

    // Generate the script witness based on selected paths
    const selectedScriptWitness = witnessesInSelectedPhase.find((witness) => {
      return selectedPaths.every((path) => {
        const presentKeys = path.keys.filter((key) =>
          witness.asm.includes(key.uniqueKeyIdentifier)
        );
        return presentKeys.length >= path.threshold;
      });
    });

    if (!selectedScriptWitness) {
      throw new Error('No matching script witness found for the selected paths');
    }

    return { selectedPhase, selectedPaths, selectedScriptWitness };
  };

  static addInputToPSBT = (
    PSBT: bitcoinJS.Psbt,
    wallet: Wallet | Vault,
    input: InputUTXOs,
    network: bitcoinJS.networks.Network,
    miniscriptSelectedSatisfier?: MiniscriptTxSelectedSatisfier,
    derivationPurpose: DerivationPurpose = DerivationPurpose.BIP84,
    scriptType: BIP48ScriptTypes = BIP48ScriptTypes.NATIVE_SEGWIT
  ) => {
    const { isMultiSig } = wallet as Vault;
    if (!isMultiSig) {
      const { publicKey, subPath } = WalletUtilities.addressToPublicKey(input.address, wallet);

      if (derivationPurpose === DerivationPurpose.BIP86) {
        const p2tr = bitcoinJS.payments.p2tr({
          internalPubkey: WalletUtilities.toXOnly(publicKey),
          network,
        });
        PSBT.addInput({
          hash: input.txId,
          index: input.vout,
          witnessUtxo: {
            script: p2tr.output,
            value: input.value,
          },
          tapInternalKey: WalletUtilities.toXOnly(publicKey),
        });
      } else {
        let path;
        let masterFingerprint;
        if (wallet.entityKind === EntityKind.VAULT) {
          const signer = (wallet as Vault).signers[0];
          const { derivationPath, masterFingerprint: mfp } = signer;
          path = `${derivationPath}/${subPath.join('/')}`;
          masterFingerprint = mfp;
        } else {
          path = `${(wallet as Wallet).derivationDetails.xDerivationPath}/${subPath.join('/')}`;
          masterFingerprint = WalletUtilities.getMasterFingerprintForWallet(wallet as Wallet);
        }
        const bip32Derivation = [
          {
            masterFingerprint: Buffer.from(masterFingerprint, 'hex'),
            path: path.replaceAll('h', "'"),
            pubkey: publicKey,
          },
        ];

        const p2wpkh = bitcoinJS.payments.p2wpkh({
          pubkey: publicKey,
          network,
        });

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
          const p2sh = bitcoinJS.payments.p2sh({
            redeem: p2wpkh,
          });

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
      }
    } else {
      const { p2wsh, p2sh, subPaths, signerPubkeyMap } = WalletUtilities.addressToMultiSig(
        input.address,
        wallet as Vault
      );

      let hasTimelock = false;
      const bip32Derivation = [];
      const multisigScriptType =
        (wallet as Vault).scheme.multisigScriptType || MultisigScriptType.DEFAULT_MULTISIG;

      if (multisigScriptType === MultisigScriptType.DEFAULT_MULTISIG) {
        for (const signer of (wallet as Vault).signers) {
          const masterFingerprint = Buffer.from(signer.masterFingerprint, 'hex');
          const path = `${signer.derivationPath}/${subPaths[signer.xpub].join('/')}`;
          bip32Derivation.push({
            masterFingerprint,
            path: path.replaceAll('h', "'"),
            pubkey: signerPubkeyMap.get(signer.xpub),
          });
        }
      } else if (multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG) {
        const { miniscriptScheme } = (wallet as Vault).scheme;
        if (!miniscriptScheme) throw new Error('Miniscript scheme is missing');
        if (!miniscriptSelectedSatisfier) throw new Error('Miniscript satisfier missing');

        const { keyInfoMap } = miniscriptScheme;
        const { selectedPhase } = miniscriptSelectedSatisfier;
        hasTimelock = !!selectedPhase;

        for (let keyIdentifier in keyInfoMap) {
          const keyDescriptor = keyInfoMap[keyIdentifier];
          const fragments = keyDescriptor.split('/');
          const masterFingerprint = fragments[0].slice(1);
          const multipathIndex = fragments[5];
          const [script_type, xpub] = fragments[4].split(']');

          const xpubPath = `m/${fragments[1]}/${fragments[2]}/${fragments[3]}/${script_type}`;
          const path = `${xpubPath}/${subPaths[xpub + multipathIndex].join('/')}`;
          bip32Derivation.push({
            masterFingerprint: Buffer.from(masterFingerprint, 'hex'),
            path: path.replaceAll('h', "'"),
            pubkey: signerPubkeyMap.get(xpub + multipathIndex),
          });
        }
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
          witnessScript: p2wsh.redeem.output,
          sequence: hasTimelock ? 4294967294 : null, // to enable nLockTime the value should be less than 4294967295
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
          witnessScript: p2wsh.redeem.output,
          sequence: hasTimelock ? 4294967294 : null, // to enable nLockTime the value should be less than 4294967295
        });
      }
    }
  };

  static getPSBTDataForChangeOutput = (
    wallet: Vault,
    changeMultiSig: {
      p2wsh: bitcoinJS.payments.Payment;
      p2sh: bitcoinJS.payments.Payment;
      pubkeys: Buffer[];
      address: string;
      subPaths: { [xpub: string]: number[] };
      signerPubkeyMap: Map<string, Buffer>;
    }
  ): {
    bip32Derivation: any[];
    redeemScript: Buffer;
    witnessScript: Buffer;
  } => {
    const bip32Derivation = []; // array per each pubkey thats gona be used
    const { subPaths, p2wsh, signerPubkeyMap } = changeMultiSig;

    const multisigScriptType =
      (wallet as Vault).scheme.multisigScriptType || MultisigScriptType.DEFAULT_MULTISIG;
    if (multisigScriptType === MultisigScriptType.DEFAULT_MULTISIG) {
      for (const signer of (wallet as Vault).signers) {
        const masterFingerprint = Buffer.from(signer.masterFingerprint, 'hex');
        const path = `${signer.derivationPath}/${subPaths[signer.xpub].join('/')}`;
        bip32Derivation.push({
          masterFingerprint,
          path: path.replaceAll('h', "'"),
          pubkey: signerPubkeyMap.get(signer.xpub),
        });
      }
    } else if (multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG) {
      const { miniscriptScheme } = (wallet as Vault).scheme;
      if (!miniscriptScheme) throw new Error('Miniscript scheme is missing');

      const { keyInfoMap } = miniscriptScheme;

      for (let keyIdentifier in keyInfoMap) {
        const fragments = keyInfoMap[keyIdentifier].split('/');
        const masterFingerprint = fragments[0].slice(1);
        const multipathIndex = fragments[5];
        const [script_type, xpub] = fragments[4].split(']');

        const xpubPath = `m/${fragments[1]}/${fragments[2]}/${fragments[3]}/${script_type}`;
        const path = `${xpubPath}/${subPaths[xpub + multipathIndex].join('/')}`;
        bip32Derivation.push({
          masterFingerprint: Buffer.from(masterFingerprint, 'hex'),
          path: path.replaceAll('h', "'"),
          pubkey: signerPubkeyMap.get(xpub + multipathIndex),
        });
      }
    }

    return { bip32Derivation, redeemScript: p2wsh.output, witnessScript: p2wsh.redeem.output };
  };

  static createTransaction = async (
    wallet: Wallet | Vault,
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: TransactionPrerequisite,
    miniscriptTxElements?: {
      selectedPhase: number;
      selectedPaths: number[];
    }
  ): Promise<{
    PSBT: bitcoinJS.Psbt;
    inputs: InputUTXOs[];
    outputs: OutputUTXOs[];
    change: string;
    miniscriptSelectedSatisfier?: MiniscriptTxSelectedSatisfier;
  }> => {
    try {
      let inputs;
      let outputs;
      if (txnPriority === TxPriority.CUSTOM) {
        if (!customTxPrerequisites) throw new Error('Tx-prerequisites missing for custom fee');
        inputs = customTxPrerequisites[txnPriority].inputs;
        outputs = customTxPrerequisites[txnPriority].outputs;
      } else {
        inputs = txPrerequisites[txnPriority].inputs;
        outputs = txPrerequisites[txnPriority].outputs;
      }

      const network = WalletUtilities.getNetworkByType(wallet.networkType);
      const PSBT: bitcoinJS.Psbt = new bitcoinJS.Psbt({
        network,
      });

      let derivationPurpose;
      if (wallet.entityKind === EntityKind.WALLET) {
        derivationPurpose = WalletUtilities.getPurpose(
          (wallet as Wallet).derivationDetails.xDerivationPath
        );
      }

      let miniscriptSelectedSatisfier: MiniscriptTxSelectedSatisfier;
      if (wallet.entityKind === EntityKind.VAULT) {
        const { miniscriptScheme } = (wallet as Vault).scheme;
        if (miniscriptScheme) {
          miniscriptSelectedSatisfier = WalletOperations.getSelectedSatisfier(
            // note: for Timelocked vault the selectedScriptWitness(which defaults to first) remains irrelevant and the witness script selection happens during input finalisation
            miniscriptScheme,
            miniscriptTxElements
          );
        }
      }

      for (const input of inputs) {
        this.addInputToPSBT(
          PSBT,
          wallet,
          input,
          network,
          miniscriptSelectedSatisfier,
          derivationPurpose
        );
      }

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

      const change = changeAddress || changeMultisig?.address;
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
          const { publicKey, subPath } = WalletUtilities.addressToPublicKey(changeAddress, wallet);
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

      // set locktime
      if (wallet.entityKind === EntityKind.VAULT && miniscriptSelectedSatisfier) {
        const { selectedScriptWitness } = miniscriptSelectedSatisfier;
        if (selectedScriptWitness.nLockTime) {
          PSBT.setLocktime(selectedScriptWitness.nLockTime);
        }
      }

      return {
        PSBT,
        inputs,
        outputs,
        change,
        miniscriptSelectedSatisfier,
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

      for (const input of inputs) {
        let { keyPair } = WalletUtilities.addressToKeyPair(input.address, wallet);
        const purpose = WalletUtilities.getPurpose(wallet.derivationDetails.xDerivationPath);

        if (purpose === DerivationPurpose.BIP86) {
          // create a tweaked signer to sign P2TR tweaked key
          const tweakedSigner = keyPair.tweak(
            bitcoinJS.crypto.taggedHash('TapTweak', WalletUtilities.toXOnly(keyPair.publicKey))
          );

          PSBT.signTaprootInput(vin, tweakedSigner);
        } else PSBT.signInput(vin, keyPair);

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
    serializedPSBT: string,
    signer: VaultSigner
  ): { signedSerializedPSBT: string } => {
    try {
      const network = WalletUtilities.getNetworkByType(wallet.networkType);
      const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT, { network: config.NETWORK });

      let vin = 0;
      for (const { bip32Derivation } of PSBT.data.inputs) {
        if (!bip32Derivation) {
          throw new Error('Failed to sign internally - missing bip32 derivation');
        }

        let subPaths = [];

        for (let { masterFingerprint, path } of bip32Derivation) {
          if (masterFingerprint.toString('hex').toUpperCase() === signer.masterFingerprint) {
            const pathFragments = path.split('/');
            const chainIndex = parseInt(pathFragments[pathFragments.length - 2], 10); // multipath external/internal chain index
            const childIndex = parseInt(pathFragments[pathFragments.length - 1], 10);
            subPaths.push([chainIndex, childIndex]);
          }
        }
        if (subPaths.length === 0) throw new Error('Failed to sign internally - missing subpath');

        subPaths.forEach((subPath) => {
          const keyPair = WalletUtilities.getKeyPairByIndex(
            signer.xpriv,
            subPath[0],
            subPath[1],
            network
          );
          PSBT.signInput(vin, keyPair);
        });
        vin++;
      }

      return { signedSerializedPSBT: PSBT.toBase64() };
    } catch (err) {
      console.log(err);
    }
  };

  static signVaultTransaction = (
    wallet: Vault,
    inputs: InputUTXOs[],
    PSBT: bitcoinJS.Psbt,
    vaultKey: VaultSigner,
    outgoing: number,
    outputs: OutputUTXOs[],
    change: string,
    signerMap?: { [key: string]: Signer },
    miniscriptSelectedSatisfier?: MiniscriptTxSelectedSatisfier
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
    const signer = signerMap[getKeyUID(vaultKey)];
    const payloadTarget = signer.type;
    let isSigned = false;

    if (
      miniscriptSelectedSatisfier &&
      (signer.type === SignerType.BITBOX02 || signer.type === SignerType.KEEPER)
    ) {
      const subPaths = inputs.reduce((acc, input) => {
        const { subPaths: inputSubPaths } = WalletUtilities.addressToMultiSig(
          input.address,
          wallet as Vault
        );
        return { ...acc, ...inputSubPaths };
      }, {});

      // Update bip32Derivation for each input to only include keys in selected path
      for (let i = 0; i < PSBT.data.inputs.length; i++) {
        const input = PSBT.data.inputs[i];
        if (!input.bip32Derivation) continue;

        const { selectedPaths } = miniscriptSelectedSatisfier;
        const { miniscriptScheme } = wallet.scheme;
        const { keyInfoMap } = miniscriptScheme;

        const paths = [];
        for (const path of selectedPaths) {
          for (const key of path.keys) {
            const keyDescriptor = keyInfoMap[key.uniqueKeyIdentifier];

            const fragments = keyDescriptor.split('/');
            const masterFingerprint = fragments[0].slice(1);
            const multipathIndex = fragments[5];
            const [script_type, xpub] = fragments[4].split(']');

            const xpubPath = `m/${fragments[1]}/${fragments[2]}/${fragments[3]}/${script_type}`;
            const path = `${xpubPath}/${subPaths[xpub + multipathIndex].join('/')}`;
            paths.push({
              masterFingerprint: Buffer.from(masterFingerprint, 'hex'),
              path: path.replaceAll('h', "'"),
            });
          }
        }
        const newBip32Derivation = input.bip32Derivation.filter((bip32Deriv) => {
          return paths.some(
            (path) =>
              bip32Deriv.path === path.path &&
              bip32Deriv.masterFingerprint.toString() === path.masterFingerprint.toString()
          );
        });
        if (signer.type === SignerType.BITBOX02) {
          input.bip32Derivation = newBip32Derivation;
        } else {
          input.unknownKeyVals = [
            {
              key: Buffer.from('SELECTED_MINISCRIPT_BIP32_DERIVATIONS'),
              value: Buffer.from(JSON.stringify(newBip32Derivation)),
            },
          ];
        }
      }
    }

    if (signer.isMock && vaultKey.xpriv) {
      // case: if the signer is mock and has an xpriv attached to it, we'll sign the PSBT right away
      const { signedSerializedPSBT } = WalletOperations.internallySignVaultPSBT(
        wallet,
        PSBT.toBase64(),
        vaultKey
      );
      PSBT = bitcoinJS.Psbt.fromBase64(signedSerializedPSBT, { network: config.NETWORK });
      isSigned = true;
    } else if (
      signer.type === SignerType.TAPSIGNER ||
      signer.type === SignerType.LEDGER ||
      signer.type === SignerType.TREZOR ||
      signer.type === SignerType.BITBOX02 ||
      signer.type === SignerType.KEEPER // for external key since it can be of any signer type
    ) {
      const inputsToSign = [];
      for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
        let publicKey;
        let subPath;

        const multisigScriptType =
          (wallet as Vault).scheme.multisigScriptType || MultisigScriptType.DEFAULT_MULTISIG;

        if (multisigScriptType === MultisigScriptType.DEFAULT_MULTISIG) {
          if (wallet.isMultiSig) {
            const multisigAddress = WalletUtilities.addressToMultiSig(
              inputs[inputIndex].address,
              wallet
            );

            publicKey = multisigAddress.signerPubkeyMap.get(vaultKey.xpub);
            subPath = multisigAddress.subPaths[vaultKey.xpub];
          } else {
            const singlesigAddress = WalletUtilities.addressToPublicKey(
              inputs[inputIndex].address,
              wallet
            );
            publicKey = singlesigAddress.publicKey;
            subPath = singlesigAddress.subPath;
          }
        } else if (multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG) {
          const { miniscriptScheme } = (wallet as Vault).scheme;
          if (!miniscriptScheme) throw new Error('Miniscript scheme is missing');

          const psbtInputIndex = PSBT.txInputs.findIndex((psbtInput) => {
            // Reverse the bytes of the hash to match txId format
            const psbtHash = Buffer.from(psbtInput.hash).reverse().toString('hex');
            return (
              psbtHash === inputs[inputIndex].txId && psbtInput.index === inputs[inputIndex].vout
            );
          });

          if (psbtInputIndex === -1) {
            console.log('No match found!');
            throw new Error('Could not find matching PSBT input');
          }

          // PSBT.data.inputs and PSBT.txInputs are expected to be parallel arrays that maintain the same order
          const { bip32Derivation } = PSBT.data.inputs[psbtInputIndex];

          for (let { masterFingerprint, path, pubkey } of bip32Derivation) {
            if (masterFingerprint.toString('hex').toUpperCase() === signer.masterFingerprint) {
              const pathFragments = path.split('/');
              const chainIndex = parseInt(pathFragments[pathFragments.length - 2], 10); // multipath external/internal chain index
              const childIndex = parseInt(pathFragments[pathFragments.length - 1], 10);
              subPath = [chainIndex, childIndex];
              publicKey = pubkey;
              break;
            }
          }
        }

        if (!publicKey) throw new Error('Failed to generate payload, missing pubkey');

        const { hash, sighashType } = PSBT.getDigestToSign(inputIndex, publicKey);
        inputsToSign.push({
          digest: hash.toString('hex'),
          subPath: `/${subPath.join('/')}`,
          inputIndex,
          sighashType,
          publicKey: publicKey.toString('hex'),
        });
      }
      signingPayload.push({
        payloadTarget,
        inputsToSign,
        inputs,
        outputs,
        change,
      });
    } else if (signer.type === SignerType.MOBILE_KEY || signer.type === SignerType.SEED_WORDS) {
      signingPayload.push({ payloadTarget, inputs });
    } else if (
      signer.type === SignerType.POLICY_SERVER ||
      signer.type === SignerType.INHERITANCEKEY
    ) {
      const childIndexArray = [];
      for (const input of inputs) {
        const { subPath } = WalletUtilities.getSubPathForAddress(input.address, wallet);
        childIndexArray.push({
          subPath,
          inputIdentifier: {
            txId: input.txId,
            vout: input.vout,
            value: input.value,
          },
        });
      }
      signingPayload.push({ payloadTarget, childIndexArray, outgoing });
    }

    if (isSignerAMF(signer)) signingPayload.push({ payloadTarget, inputs });

    const serializedPSBT = PSBT.toBase64();
    const serializedPSBTEnvelop: SerializedPSBTEnvelop = {
      mfp: vaultKey.masterFingerprint,
      xfp: vaultKey.xfp,
      signerType: signer.type,
      serializedPSBT,
      signingPayload,
      isSigned,
      isMockSigner: signer.isMock,
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
    averageTxFees: AverageTxFees,
    selectedUTXOs?: UTXO[],
    miniscriptSelectedSatisfier?: MiniscriptTxSelectedSatisfier
  ): Promise<{
    txPrerequisites: TransactionPrerequisite;
    txRecipients: TransactionRecipients;
  }> => {
    let outgoingAmount = 0;
    recipients = recipients.map((recipient) => {
      recipient.amount = Math.round(recipient.amount);
      outgoingAmount += recipient.amount;
      return recipient;
    });

    let { fee, balance, txRecipients, txPrerequisites } =
      WalletOperations.prepareTransactionPrerequisites(
        wallet,
        recipients,
        averageTxFees,
        selectedUTXOs,
        miniscriptSelectedSatisfier
      );

    if (balance < outgoingAmount + fee) throw new Error('Insufficient balance');
    if (txPrerequisites && Object.keys(txPrerequisites).length) {
      return { txRecipients, txPrerequisites };
    }

    throw new Error('Unable to create transaction: inputs failed at coinselect');
  };

  static transferST2 = async (
    wallet: Wallet | Vault,
    txPrerequisites: TransactionPrerequisite,
    txnPriority: TxPriority,
    recipients: {
      address: string;
      amount: number;
    }[],
    customTxPrerequisites?: TransactionPrerequisite,
    signerMap?: { [key: string]: Signer },
    miniscriptTxElements?: {
      selectedPhase: number;
      selectedPaths: number[];
    }
  ): Promise<
    | {
        serializedPSBTEnvelops: SerializedPSBTEnvelop[];
        cachedTxid: string;
        txid?;
        finalOutputs?: bitcoinJS.TxOutput[];
      }
    | {
        serializedPSBTEnvelop?;
        cachedTxid?;
        txid: string;
        finalOutputs: bitcoinJS.TxOutput[];
      }
  > => {
    const { PSBT, inputs, outputs, change, miniscriptSelectedSatisfier } =
      await WalletOperations.createTransaction(
        wallet,
        txPrerequisites,
        txnPriority,
        customTxPrerequisites,
        miniscriptTxElements
      );

    if (wallet.entityKind === EntityKind.VAULT) {
      // case: vault(single/multi-sig)
      const { signers: vaultKeys } = wallet as Vault;
      const serializedPSBTEnvelops: SerializedPSBTEnvelop[] = [];
      let outgoing = 0;
      recipients.forEach((recipient) => {
        outgoing += recipient.amount;
      });

      for (const vaultKey of vaultKeys) {
        // generate signing payload

        if (
          (wallet as Vault).scheme.multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG &&
          miniscriptSelectedSatisfier
        ) {
          // only generate signing payload for the signers in the selected path
          const { selectedPaths } = miniscriptSelectedSatisfier;
          const { miniscriptElements } = (wallet as Vault).scheme.miniscriptScheme;
          const { signerFingerprints } = miniscriptElements;

          let pathSigner = false;
          for (let path of selectedPaths) {
            for (let key of path.keys) {
              if (vaultKey.masterFingerprint === signerFingerprints[key.identifier]) {
                pathSigner = true;
                break;
              }
            }
            if (pathSigner) break;
          }

          if (!pathSigner) continue; // skip generating payload for this signer
        }

        const { serializedPSBTEnvelop } = WalletOperations.signVaultTransaction(
          wallet as Vault,
          inputs,
          PSBT,
          vaultKey,
          outgoing,
          outputs,
          change,
          signerMap,
          miniscriptSelectedSatisfier
        );
        serializedPSBTEnvelops.push(serializedPSBTEnvelop);
      }

      return {
        serializedPSBTEnvelops,
        cachedTxid: hash256(PSBT.toBase64()),
      };
    } else {
      // case: wallet(single-sig)
      const { signedPSBT } = WalletOperations.signTransaction(wallet as Wallet, inputs, PSBT);

      // validating signatures; contributes significantly to the transaction time(enable only if necessary)
      // const areSignaturesValid = signedPSBT.validateSignaturesOfAllInputs(validator);
      // if (!areSignaturesValid) throw new Error('Failed to broadcast: invalid signatures');

      // finalise and construct the txHex
      const tx = signedPSBT.finalizeAllInputs();
      const txHex = tx.extractTransaction().toHex();
      const finalOutputs = tx.txOutputs;

      const txid = await this.broadcastTransaction(wallet, txHex, inputs);

      return {
        txid,
        finalOutputs,
      };
    }
  };

  static transferST3 = async (
    wallet: Wallet | Vault,
    serializedPSBTEnvelops: SerializedPSBTEnvelop[],
    txPrerequisites: TransactionPrerequisite,
    txnPriority: TxPriority,
    customTxPrerequisites?: TransactionPrerequisite,
    txHex?: string,
    miniscriptTxElements?: {
      selectedPhase: number;
      selectedPaths: number[];
    }
  ): Promise<{
    txid: string;
    finalOutputs: bitcoinJS.TxOutput[];
  }> => {
    let inputs;
    if (txnPriority === TxPriority.CUSTOM) {
      if (!customTxPrerequisites) throw new Error('Tx-prerequisites missing for custom fee');
      inputs = customTxPrerequisites[txnPriority].inputs;
    } else inputs = txPrerequisites[txnPriority].inputs;

    let combinedPSBT: bitcoinJS.Psbt = null;
    let finalOutputs: bitcoinJS.TxOutput[];

    if (!txHex) {
      // construct the txHex by combining the signed PSBTs
      for (const serializedPSBTEnvelop of serializedPSBTEnvelops) {
        const { signerType, serializedPSBT, signingPayload, isMockSigner } = serializedPSBTEnvelop;
        const PSBT = bitcoinJS.Psbt.fromBase64(serializedPSBT, { network: config.NETWORK });
        if (signerType === SignerType.TAPSIGNER && !isMockSigner) {
          for (const { inputsToSign } of signingPayload) {
            for (const { inputIndex, publicKey, signature, sighashType } of inputsToSign) {
              if (signature) {
                PSBT.addSignedDigest(
                  inputIndex,
                  Buffer.from(publicKey, 'hex'),
                  Buffer.from(signature, 'hex'),
                  sighashType
                );
              }
            }
          }
        }

        if (!combinedPSBT) combinedPSBT = PSBT;
        else combinedPSBT.combine(PSBT);
      }

      // validating signatures; contributes significantly to the transaction time(enable only if necessary)
      // const areSignaturesValid = combinedPSBT.validateSignaturesOfAllInputs(validator);
      // if (!areSignaturesValid) throw new Error('Failed to broadcast: invalid signatures');

      // finalise and construct the txHex
      let tx;
      if (wallet.entityKind === EntityKind.VAULT) {
        const { multisigScriptType, miniscriptScheme } = (wallet as Vault).scheme;
        if (multisigScriptType === MultisigScriptType.MINISCRIPT_MULTISIG) {
          if (!miniscriptScheme) throw new Error('miniscriptScheme missing for vault');

          const { scriptWitnesses } = generateScriptWitnesses(miniscriptScheme.miniscriptPolicy);
          let selectedScriptWitness: {
            asm: string;
            nLockTime?: number;
            nSequence?: number;
          };

          // Check for timelock using miniscript types
          const hasTimelock =
            (wallet as Vault).scheme.miniscriptScheme?.usedMiniscriptTypes.includes(
              MiniscriptTypes.TIMELOCKED
            ) ||
            (wallet as Vault).scheme.miniscriptScheme?.usedMiniscriptTypes.includes(
              MiniscriptTypes.INHERITANCE
            );

          if (!hasTimelock) {
            // scriptwitness selection for TIMELOCKED/INHERITANCE vault is done using the available partial signatures(simplifies UX)
            const miniscriptSelectedSatisfier = WalletOperations.getSelectedSatisfier(
              miniscriptScheme,
              miniscriptTxElements
            );
            selectedScriptWitness = miniscriptSelectedSatisfier.selectedScriptWitness;
          }

          for (let index = 0; index < combinedPSBT.txInputs.length; index++) {
            combinedPSBT.finalizeInput(
              index,
              WalletUtilities.getFinalScriptsForMyCustomScript(
                scriptWitnesses,
                selectedScriptWitness,
                miniscriptScheme.keyInfoMap
              )
            );
          }
          tx = combinedPSBT;
        } else tx = combinedPSBT.finalizeAllInputs();
      } else tx = combinedPSBT.finalizeAllInputs();

      finalOutputs = tx.txOutputs;
      txHex = tx.extractTransaction().toHex();
    }

    const txid = await this.broadcastTransaction(wallet, txHex, inputs);
    return {
      txid,
      finalOutputs,
    };
  };
}
