import axios, { AxiosInstance, AxiosResponse } from 'axios';
import bip21 from 'bip21';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import bs58check from 'bs58check';
import * as bitcoinJS from 'bitcoinjs-lib';
import ECPairFactory, { ECPairInterface } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
const ECPair = ECPairFactory(ecc);

import config from '../config';
import _ from 'lodash';
import idx from 'idx';
import { WalletType, DerivationPurpose, NetworkType, TransactionType } from './interfaces/enum';
import {
  Wallet,
  ActiveAddresses,
  DonationWallet,
  MultiSigWallet,
  Transaction,
  TransactionToAddressMapping,
} from './interfaces/interface';
import { ScannedAddressKind } from '../trusted_contacts/interfaces/enum';

const { REQUEST_TIMEOUT, RELAY_AXIOS, SIGNING_AXIOS } = config;
const accAxios: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT * 3,
});

export default class WalletUtilities {
  static networkType = (scannedStr: string): NetworkType => {
    scannedStr = scannedStr.replace('BITCOIN', 'bitcoin');
    let address = scannedStr;
    if (scannedStr.slice(0, 8) === 'bitcoin:') {
      address = bip21.decode(scannedStr).address;
    }
    try {
      bitcoinJS.address.toOutputScript(address, bitcoinJS.networks.bitcoin);
      return NetworkType.MAINNET;
    } catch (err) {
      try {
        bitcoinJS.address.toOutputScript(address, bitcoinJS.networks.testnet);
        return NetworkType.TESTNET;
      } catch (err) {
        return null;
      }
    }
  };

  static getNetworkByType = (type: NetworkType) => {
    if (type === NetworkType.TESTNET) return bitcoinJS.networks.testnet;
    else return bitcoinJS.networks.bitcoin;
  };

  // static getDerivationPath = ( type: NetworkType, walletType: WalletType, instanceNumber: number, debug?: boolean, purpose: DerivationPurpose = DerivationPurpose.BIP49 ): string => {
  //   const { series, upperBound } = config.WALLET_INSTANCES[ walletType ]
  //   if( !debug && instanceNumber > ( upperBound - 1 ) ) throw new Error( `Cannot create new instance of type ${walletType}, instace upper bound exceeds ` )
  //   const walletNumber = series + instanceNumber

  //   if( type === NetworkType.TESTNET ) return `m/${purpose}'/1'/${walletNumber}'`
  //   else return `m/${purpose}'/0'/${walletNumber}'`
  // }

  static getDerivationPath = (
    type: NetworkType,
    walletNumber: number = 0,
    purpose: DerivationPurpose = DerivationPurpose.BIP49
  ): string => {
    if (type === NetworkType.TESTNET) return `m/${purpose}'/1'/${walletNumber}'`;
    else return `m/${purpose}'/0'/${walletNumber}'`;
  };

  static getKeyPair = (privateKey: string, network: bitcoinJS.Network): ECPairInterface =>
    ECPair.fromWIF(privateKey, network);

  static deriveAddressFromKeyPair = (
    keyPair: bip32.BIP32Interface | ECPairInterface,
    network: bitcoinJS.Network,
    purpose: DerivationPurpose = DerivationPurpose.BIP49
  ): string => {
    if (purpose === DerivationPurpose.BIP44) {
      return bitcoinJS.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network,
      }).address;
    } else if (purpose === DerivationPurpose.BIP49) {
      return bitcoinJS.payments.p2sh({
        redeem: bitcoinJS.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network,
        }),
        network,
      }).address;
    } else if (purpose === DerivationPurpose.BIP84) {
      return bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network,
      }).address;
    }
  };

  static isValidAddress = (address: string, network: bitcoinJS.Network): boolean => {
    try {
      bitcoinJS.address.toOutputScript(address, network);
      return true;
    } catch (err) {
      return false;
    }
  };

  static getPrivateKeyByIndex = (
    xpriv: string,
    internal: boolean,
    index: number,
    network: bitcoinJS.networks.Network
  ) => {
    const node = bip32.fromBase58(xpriv, network);
    return node
      .derive(internal ? 1 : 0)
      .derive(index)
      .toWIF();
  };

  static getAddressByIndex = (
    xpub: string,
    internal: boolean,
    index: number,
    network: bitcoinJS.networks.Network,
    purpose?: DerivationPurpose
  ): string => {
    const node = bip32.fromBase58(xpub, network);
    const keyPair = node.derive(internal ? 1 : 0).derive(index);
    return WalletUtilities.deriveAddressFromKeyPair(keyPair, network, purpose);
  };

  static getP2SH = (keyPair: bip32.BIP32Interface, network: bitcoinJS.Network): bitcoinJS.Payment =>
    bitcoinJS.payments.p2sh({
      redeem: bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network,
      }),
      network,
    });

  static generateExtendedKey = (
    mnemonic: string,
    privateKey: boolean,
    network: bitcoinJS.networks.Network,
    derivationPath: string,
    passphrase?: string
  ) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
    const root = bip32.fromSeed(seed, network);
    const child = privateKey
      ? root.derivePath(derivationPath)
      : root.derivePath(derivationPath).neutered();
    const xKey = child.toBase58();
    return xKey;
  };

  static generateExtendedKeyPairFromSeed = (
    seed: string,
    network: bitcoinJS.networks.Network,
    derivationPath: string
  ) => {
    const root = bip32.fromSeed(Buffer.from(seed, 'hex'), network);
    const raw_xPriv = root.derivePath(derivationPath);
    const raw_xPub = raw_xPriv.neutered();

    const xpriv = raw_xPriv.toBase58();
    const xpub = raw_xPub.toBase58();
    return {
      xpriv,
      xpub,
    };
  };

  static generateChildFromExtendedKey = (
    extendedKey: string,
    network: bitcoinJS.networks.Network,
    childIndex: number,
    internal: boolean,
    shouldNotDerive?: boolean
  ) => {
    const xKey = bip32.fromBase58(extendedKey, network);
    let childXKey;
    if (shouldNotDerive) childXKey = xKey.derive(childIndex);
    else childXKey = xKey.derive(internal ? 1 : 0).derive(childIndex);
    return childXKey.toBase58();
  };

  static generateYpub = (xpub: string, network: bitcoinJS.Network): string => {
    let data = bs58check.decode(xpub);
    data = data.slice(4);
    let versionBytes;
    if (network == bitcoinJS.networks.bitcoin) {
      versionBytes = xpub ? '049d7cb2' : '049d7878';
    } else {
      versionBytes = xpub ? '044a5262' : '044a4e28';
    }
    data = Buffer.concat([Buffer.from(versionBytes, 'hex'), data]);
    return bs58check.encode(data);
  };

  static addressToPrivateKey = (address: string, wallet: Wallet): string => {
    const { networkType } = wallet.derivationDetails;
    const { nextFreeAddressIndex, nextFreeChangeAddressIndex, xpub, xpriv } = wallet.specs;
    const network = WalletUtilities.getNetworkByType(networkType);

    const purpose =
      wallet.type === WalletType.SWAN ? DerivationPurpose.BIP84 : DerivationPurpose.BIP49;
    const closingExtIndex =
      nextFreeAddressIndex +
      (wallet.type === WalletType.DONATION ? config.DONATION_GAP_LIMIT : config.GAP_LIMIT);
    for (let itr = 0; itr <= nextFreeAddressIndex + closingExtIndex; itr++) {
      if (WalletUtilities.getAddressByIndex(xpub, false, itr, network, purpose) === address)
        return WalletUtilities.getPrivateKeyByIndex(xpriv, false, itr, network);
    }

    const closingIntIndex =
      nextFreeChangeAddressIndex +
      (wallet.type === WalletType.DONATION ? config.DONATION_GAP_LIMIT_INTERNAL : config.GAP_LIMIT);
    for (let itr = 0; itr <= closingIntIndex; itr++) {
      if (WalletUtilities.getAddressByIndex(xpub, true, itr, network, purpose) === address)
        return WalletUtilities.getPrivateKeyByIndex(xpriv, true, itr, network);
    }

    for (const importedAddress in wallet.specs.importedAddresses) {
      if (address === importedAddress)
        return wallet.specs.importedAddresses[importedAddress].privateKey;
    }

    throw new Error('Could not find private key for: ' + address);
  };

  static createMultiSig = (
    xpubs: {
      primary: string;
      secondary: string;
      bithyve: string;
    },
    required: number,
    network: bitcoinJS.Network,
    childIndex: number,
    internal: boolean
  ): {
    scripts: {
      redeem: string;
      witness: string;
    };
    address: string;
  } => {
    const pubkeys = Object.keys(xpubs).map((xpubKey) => {
      const childExtendedKey = WalletUtilities.generateChildFromExtendedKey(
        xpubs[xpubKey],
        network,
        childIndex,
        internal,
        xpubKey !== 'primary'
      );
      const xKey = bip32.fromBase58(childExtendedKey, network);
      const pub = xKey.publicKey.toString('hex');
      return Buffer.from(pub, 'hex');
    });

    const p2ms = bitcoinJS.payments.p2ms({
      m: required,
      pubkeys,
      network,
    });
    const p2wsh = bitcoinJS.payments.p2wsh({
      redeem: p2ms,
      network,
    });
    const p2sh = bitcoinJS.payments.p2sh({
      redeem: p2wsh,
      network,
    });

    return {
      scripts: {
        redeem: p2sh.redeem.output.toString('hex'),
        witness: p2wsh.redeem.output.toString('hex'),
      },
      address: p2sh.address,
    };
  };

  static signingEssentialsForMultiSig = (wallet: MultiSigWallet, address: string) => {
    const { networkType } = wallet.derivationDetails;
    const network = WalletUtilities.getNetworkByType(networkType);

    const closingExtIndex =
      wallet.specs.nextFreeAddressIndex +
      (wallet.type === WalletType.DONATION ? config.DONATION_GAP_LIMIT : config.GAP_LIMIT);
    for (let itr = 0; itr <= closingExtIndex; itr++) {
      const multiSig = WalletUtilities.createMultiSig(
        {
          primary: wallet.specs.xpub,
          secondary: (wallet as MultiSigWallet).specs.xpubs.secondary,
          bithyve: (wallet as MultiSigWallet).specs.xpubs.bithyve,
        },
        2,
        network,
        itr,
        false
      );
      if (multiSig.address === address) {
        return {
          multiSig,
          primaryPriv: WalletUtilities.generateChildFromExtendedKey(
            wallet.specs.xpriv,
            network,
            itr,
            false
          ),
          secondaryPriv: wallet.specs.xprivs.secondary
            ? WalletUtilities.generateChildFromExtendedKey(
                wallet.specs.xprivs.secondary,
                network,
                itr,
                false,
                true
              )
            : null,
          childIndex: itr,
        };
      }
    }

    const closingIntIndex =
      wallet.specs.nextFreeChangeAddressIndex +
      (wallet.type === WalletType.DONATION ? config.DONATION_GAP_LIMIT_INTERNAL : config.GAP_LIMIT);
    for (let itr = 0; itr <= closingIntIndex; itr++) {
      const multiSig = WalletUtilities.createMultiSig(
        {
          primary: wallet.specs.xpub,
          secondary: (wallet as MultiSigWallet).specs.xpubs.secondary,
          bithyve: (wallet as MultiSigWallet).specs.xpubs.bithyve,
        },
        2,
        network,
        itr,
        true
      );
      if (multiSig.address === address) {
        return {
          multiSig,
          primaryPriv: WalletUtilities.generateChildFromExtendedKey(
            wallet.specs.xpriv,
            network,
            itr,
            true
          ),
          secondaryPriv: wallet.specs.xprivs.secondary
            ? WalletUtilities.generateChildFromExtendedKey(
                wallet.specs.xprivs.secondary,
                network,
                itr,
                true,
                true
              )
            : null,
          childIndex: itr,
          internal: true,
        };
      }
    }

    throw new Error('Could not find signing essentials for ' + address);
  };

  static generatePaymentURI = (
    address: string,
    options?: { amount: number; label?: string; message?: string }
  ): { paymentURI: string } => {
    if (options) {
      return {
        paymentURI: bip21.encode(address, options),
      };
    } else {
      return {
        paymentURI: bip21.encode(address),
      };
    }
  };

  static decodePaymentURI = (
    paymentURI: string
  ): {
    address: string;
    options: {
      amount?: number;
      label?: string;
      message?: string;
    };
  } => bip21.decode(paymentURI);

  static isPaymentURI = (paymentURI: string): boolean => paymentURI.slice(0, 8) === 'bitcoin:';

  static addressDiff = (
    scannedStr: string,
    network: bitcoinJS.Network
  ): { type: ScannedAddressKind | null } => {
    scannedStr = scannedStr.replace('BITCOIN', 'bitcoin');
    if (WalletUtilities.isPaymentURI(scannedStr)) {
      const { address } = WalletUtilities.decodePaymentURI(scannedStr);
      if (WalletUtilities.isValidAddress(address, network)) {
        return {
          type: ScannedAddressKind.PAYMENT_URI,
        };
      }
    } else if (WalletUtilities.isValidAddress(scannedStr, network)) {
      return {
        type: ScannedAddressKind.ADDRESS,
      };
    }

    return {
      type: null,
    };
  };

  static sortOutputs = async (
    wallet: Wallet | MultiSigWallet,
    outputs: Array<{
      address: string;
      value: number;
    }>,
    nextFreeChangeAddressIndex: number,
    network: bitcoinJS.networks.Network
  ): Promise<
    Array<{
      address: string;
      value: number;
    }>
  > => {
    const purpose =
      wallet.type === WalletType.SWAN ? DerivationPurpose.BIP84 : DerivationPurpose.BIP49;
    for (const output of outputs) {
      if (!output.address) {
        let changeAddress: string;

        if ((wallet as MultiSigWallet).specs.is2FA)
          changeAddress = WalletUtilities.createMultiSig(
            {
              primary: wallet.specs.xpub,
              secondary: (wallet as MultiSigWallet).specs.xpubs.secondary,
              bithyve: (wallet as MultiSigWallet).specs.xpubs.bithyve,
            },
            2,
            network,
            nextFreeChangeAddressIndex,
            true
          ).address;
        else
          changeAddress = WalletUtilities.getAddressByIndex(
            wallet.specs.xpub,
            true,
            nextFreeChangeAddressIndex,
            network,
            purpose
          );

        output.address = changeAddress;
        // console.log(`adding the change address: ${output.address}`);
      }
    }

    outputs.sort((out1, out2) => {
      if (out1.address < out2.address) {
        return -1;
      }
      if (out1.address > out2.address) {
        return 1;
      }
      return 0;
    });

    return outputs;
  };

  static fetchBalanceTransactionsByWallets = async (
    wallets: {
      [id: string]: {
        activeAddresses: ActiveAddresses;
        externalAddresses: { [address: string]: number }; // all external addresses(till nextFreeAddressIndex)
        internalAddresses: { [address: string]: number }; // all internal addresses(till nextFreeChangeAddressIndex)
        ownedAddresses: string[];
        cachedUTXOs: Array<{
          txId: string;
          vout: number;
          value: number;
          address: string;
          status?: any;
        }>;
        cachedTxs: Transaction[];
        txIdCache: { [txid: string]: boolean };
        cachedTransactionMapping: TransactionToAddressMapping[];
        lastUsedAddressIndex: number;
        lastUsedChangeAddressIndex: number;
        walletType: string;
        transactionsNote: {
          [txId: string]: string;
        };
        contactName?: string;
        walletName?: string;
        hardRefresh?: boolean;
      };
    },
    network: bitcoinJS.Network
  ): Promise<{
    synchedWallets: {
      [id: string]: {
        UTXOs: Array<{
          txId: string;
          vout: number;
          value: number;
          address: string;
          status?: any;
        }>;
        txIdCache: { [txid: string]: boolean };
        transactionMapping: TransactionToAddressMapping[];
        transactions: Transaction[];
        nextFreeAddressIndex: number;
        nextFreeChangeAddressIndex: number;
        activeAddresses: ActiveAddresses;
        activeAddressesWithNewTxs: ActiveAddresses;
        hasNewTxn: boolean;
      };
    };
  }> => {
    let res: AxiosResponse;
    try {
      const walletToAddressMapping = {};
      const walletsTemp: {
        [walletId: string]: {
          upToDateTxs?: Transaction[];
          txsToUpdate?: Transaction[];
          newTxs?: Transaction[];
        };
      } = {};
      for (const walletId of Object.keys(wallets)) {
        const {
          activeAddresses,
          externalAddresses,
          internalAddresses,
          ownedAddresses,
          cachedTxs,
          hardRefresh,
        } = wallets[walletId];
        const upToDateTxs: Transaction[] = [];
        const txsToUpdate: Transaction[] = [];
        const newTxs: Transaction[] = [];

        cachedTxs.forEach((tx) => {
          if (tx.confirmations <= 6) {
            txsToUpdate.push(tx);
          } else upToDateTxs.push(tx);
        });

        walletsTemp[walletId] = {
          upToDateTxs,
          txsToUpdate,
          newTxs,
        };

        const externalArray = Object.keys(
          hardRefresh ? externalAddresses : activeAddresses.external
        );
        const internalArray = Object.keys(
          hardRefresh ? internalAddresses : activeAddresses.internal
        );
        const ownedArray = ownedAddresses;

        walletToAddressMapping[walletId] = {
          External: externalArray,
          Internal: internalArray,
          Owned: ownedArray,
        };
      }

      let usedFallBack = false;
      try {
        if (network === bitcoinJS.networks.testnet) {
          res = await accAxios.post(
            config.ESPLORA_API_ENDPOINTS.TESTNET.NEWMULTIUTXOTXN,
            walletToAddressMapping
          );
        } else {
          res = await accAxios.post(
            config.ESPLORA_API_ENDPOINTS.MAINNET.NEWMULTIUTXOTXN,
            walletToAddressMapping
          );
        }
      } catch (err) {
        if (
          config.ESPLORA_API_ENDPOINTS.MAINNET.NEWMULTIUTXOTXN ===
          config.BITHYVE_ESPLORA_API_ENDPOINTS.MAINNET.NEWMULTIUTXOTXN
        )
          throw new Error(err.message); // not using own-node

        if (!config.USE_ESPLORA_FALLBACK) {
          // Toast( 'We could not connect to your node.\nTry connecting to the BitHyve node- Go to settings ....' )
          throw new Error(err.message);
        }
        console.log('using Hexa node as fallback(fetch-balTx)');

        usedFallBack = true;
        if (network === bitcoinJS.networks.testnet) {
          res = await accAxios.post(
            config.BITHYVE_ESPLORA_API_ENDPOINTS.TESTNET.NEWMULTIUTXOTXN,
            walletToAddressMapping
          );
        } else {
          res = await accAxios.post(
            config.BITHYVE_ESPLORA_API_ENDPOINTS.MAINNET.NEWMULTIUTXOTXN,
            walletToAddressMapping
          );
        }
      }

      const walletToResponseMapping = res.data;
      const synchedWallets = {};

      for (const walletId of Object.keys(walletToResponseMapping)) {
        const {
          cachedUTXOs,
          externalAddresses,
          activeAddresses,
          internalAddresses,
          txIdCache,
          cachedTransactionMapping,
          walletType,
          walletName,
          transactionsNote,
        } = wallets[walletId];
        const { Utxos, Txs } = walletToResponseMapping[walletId];
        const UTXOs = cachedUTXOs;
        // (re)categorise UTXOs
        if (Utxos)
          for (const addressSpecificUTXOs of Utxos) {
            for (const utxo of addressSpecificUTXOs) {
              const { value, Address, status, vout, txid } = utxo;
              let include = true;
              UTXOs.forEach((cachedUTXO) => {
                if (cachedUTXO.txId === txid && cachedUTXO.address === Address) {
                  if (status.confirmed && !cachedUTXO.status.confirmed) cachedUTXO.status = status;
                  include = false;
                }
              });

              if (include)
                UTXOs.push({
                  txId: txid,
                  vout,
                  value,
                  address: Address,
                  status,
                });
            }
          }

        // process txs
        const addressesInfo = Txs;
        const transactionMapping = cachedTransactionMapping;
        let { lastUsedAddressIndex, lastUsedChangeAddressIndex } = wallets[walletId];
        const { upToDateTxs, txsToUpdate, newTxs } = walletsTemp[walletId];

        if (addressesInfo)
          for (const addressInfo of addressesInfo) {
            addressInfo.Transactions.forEach((tx) => {
              if (!txIdCache[tx.txid]) {
                // check for duplicate tx (fetched against sending and  then again for change address)
                txIdCache[tx.txid] = true;
                transactionMapping.push({
                  txid: tx.txid,
                  addresses: new Set([addressInfo.Address]),
                });

                if (tx.transactionType === 'Self') {
                  const outgoingTx: Transaction = {
                    txid: tx.txid,
                    confirmations: tx.NumberofConfirmations,
                    status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
                    fee: tx.fee,
                    date: tx.Status.block_time
                      ? new Date(tx.Status.block_time * 1000).toUTCString()
                      : new Date(Date.now()).toUTCString(),
                    transactionType: TransactionType.SENT,
                    amount: tx.SentAmount,
                    walletType: walletType,
                    recipientAddresses: tx.RecipientAddresses,
                    blockTime: tx.Status.block_time ? tx.Status.block_time : Date.now(),
                    address: addressInfo.Address,
                    isNew: true,
                    notes: transactionsNote[tx.txid],
                  };

                  const incomingTx: Transaction = {
                    txid: tx.txid,
                    confirmations: tx.NumberofConfirmations,
                    status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
                    fee: tx.fee,
                    date: tx.Status.block_time
                      ? new Date(tx.Status.block_time * 1000).toUTCString()
                      : new Date(Date.now()).toUTCString(),
                    transactionType: TransactionType.RECEIVED,
                    amount: tx.ReceivedAmount,
                    walletType: walletType,
                    senderAddresses: tx.SenderAddresses,
                    blockTime: tx.Status.block_time ? tx.Status.block_time : Date.now(),
                    isNew: true,
                    notes: transactionsNote[tx.txid],
                  };

                  newTxs.push(...[outgoingTx, incomingTx]);
                } else {
                  const transaction: Transaction = {
                    txid: tx.txid,
                    confirmations: tx.NumberofConfirmations,
                    status: tx.Status.confirmed ? 'Confirmed' : 'Unconfirmed',
                    fee: tx.fee,
                    date: tx.Status.block_time
                      ? new Date(tx.Status.block_time * 1000).toUTCString()
                      : new Date(Date.now()).toUTCString(),
                    transactionType: tx.TransactionType,
                    amount: tx.Amount,
                    walletType,
                    walletName: walletName ? walletName : walletType,
                    recipientAddresses: tx.RecipientAddresses,
                    senderAddresses: tx.SenderAddresses,
                    blockTime: tx.Status.block_time ? tx.Status.block_time : Date.now(), // only available when tx is confirmed; otherwise set to the current timestamp
                    address: addressInfo.Address,
                    isNew: true,
                    notes: transactionsNote[tx.txid],
                  };

                  newTxs.push(transaction);
                }
              } else {
                for (const map of transactionMapping) {
                  if (map.txid === tx.txId) {
                    map.addresses.add(addressInfo.Address);
                    break;
                  }
                }

                txsToUpdate.forEach((txToUpdate) => {
                  if (txToUpdate.txid === tx.txid)
                    txToUpdate.confirmations = tx.NumberofConfirmations;
                });
              }
            });

            const addressIndex = externalAddresses[addressInfo.Address];
            if (addressIndex !== undefined) {
              lastUsedAddressIndex =
                addressIndex > lastUsedAddressIndex ? addressIndex : lastUsedAddressIndex;
            } else {
              const changeAddressIndex = internalAddresses[addressInfo.Address];
              if (changeAddressIndex !== undefined) {
                lastUsedChangeAddressIndex =
                  changeAddressIndex > lastUsedChangeAddressIndex
                    ? changeAddressIndex
                    : lastUsedChangeAddressIndex;
              }
            }
          }
        const transactions: Transaction[] = [...newTxs, ...txsToUpdate, ...upToDateTxs];

        const activeAddressesWithNewTxs: ActiveAddresses = {
          external: {},
          internal: {},
        };

        // receiver and sender's info mapping(from active address list) halted; not compatible w/ realm
        // newTxs.forEach((tx) => {
        //   let addresses: Set<string>;

        //   // TODO: find a better way to reduce complexity(currently: quadratic)
        //   for (const map of transactionMapping) {
        //     if (map.txid === tx.txid) {
        //       addresses = map.addresses;
        //       break;
        //     }
        //   }

        //   addresses.forEach((address) => {
        //     if (activeAddresses.external[address]) {
        //       activeAddressesWithNewTxs.external[address] = activeAddresses.external[address];
        //       if (tx.transactionType === TransactionType.RECEIVED) {
        //         tx.sender = idx(
        //           activeAddresses.external[address],
        //           (_) => _.assignee.senderInfo.name
        //         );
        //         (tx as any).senderId = idx(
        //           activeAddresses.external[address],
        //           (_) => _.assignee.senderInfo.id
        //         );
        //       } else if (tx.transactionType === TransactionType.SENT) {
        //         const recipientInfo = idx(
        //           activeAddresses.external[address],
        //           (_) => _.assignee.recipientInfo
        //         );
        //         if (recipientInfo) tx.receivers = recipientInfo[tx.txid];
        //       }
        //     } else if (activeAddresses.internal[address]) {
        //       activeAddressesWithNewTxs.internal[address] = activeAddresses.internal[address];
        //       if (tx.transactionType === TransactionType.RECEIVED)
        //         tx.sender = idx(
        //           activeAddresses.internal[address],
        //           (_) => _.assignee.senderInfo.name
        //         );
        //       else if (tx.transactionType === TransactionType.SENT) {
        //         const recipientInfo = idx(
        //           activeAddresses.internal[address],
        //           (_) => _.assignee.recipientInfo
        //         );
        //         if (recipientInfo) tx.receivers = recipientInfo[tx.txid];
        //       }
        //     }
        //   });
        // });

        // pop addresses from the activeAddresses if tx-conf > 6
        txsToUpdate.forEach((tx) => {
          if (tx.confirmations > 6) {
            let addresses;
            // TODO: find a better way to reduce complexity(currently: quadratic)
            for (const map of transactionMapping) {
              if (map.txid === tx.txid) {
                addresses = map.addresses;
                break;
              }
            }

            addresses.forEach((address) => {
              if (activeAddresses.external[address]) delete activeAddresses.external[address];
              else if (activeAddresses.internal[address]) delete activeAddresses.internal[address];
            });
          }
        });

        // sort transactions(lastest first)
        transactions.sort((tx1, tx2) => {
          return tx2.blockTime - tx1.blockTime;
        });

        synchedWallets[walletId] = {
          UTXOs,
          transactionMapping,
          transactions,
          nextFreeAddressIndex: lastUsedAddressIndex + 1,
          nextFreeChangeAddressIndex: lastUsedChangeAddressIndex + 1,
          activeAddresses,
          activeAddressesWithNewTxs,
          hasNewTxn: newTxs.length > 0,
        };
      }

      if (usedFallBack)
        // Toast( 'We could not connect to your own node.\nRefreshed using the BitHyve node....' )
        return {
          synchedWallets,
        };
    } catch (err) {
      console.log({
        err,
      });
      throw new Error('Fetching balance-txn by addresses failed');
    }
  };

  static getTxCounts = async (addresses: string[], network: bitcoinJS.Network) => {
    const txCounts = {};
    try {
      let res: AxiosResponse;
      try {
        if (network === bitcoinJS.networks.testnet) {
          res = await accAxios.post(config.ESPLORA_API_ENDPOINTS.TESTNET.MULTITXN, {
            addresses,
          });
        } else {
          res = await accAxios.post(config.ESPLORA_API_ENDPOINTS.MAINNET.MULTITXN, {
            addresses,
          });
        }
      } catch (err) {
        throw new Error(err.response.data.err);
      }

      const addressesInfo = res.data;
      for (const addressInfo of addressesInfo) {
        txCounts[addressInfo.Address] = addressInfo.TotalTransactions;
      }

      return txCounts;
    } catch (err) {
      throw new Error('Transaction count fetching failed');
    }
  };

  static findTxDelta = (previousTxidMap, currentTxIdMap, transactions) => {
    // return new/found transactions(delta b/w hard and soft refresh)
    const txsFound: Transaction[] = [];
    const newTxIds: string[] = _.difference(
      Object.keys(currentTxIdMap),
      Object.keys(previousTxidMap)
    );
    const newTxIdMap = {};
    newTxIds.forEach((txId) => (newTxIdMap[txId] = true));

    if (newTxIds.length) {
      transactions.forEach((tx) => {
        if (newTxIdMap[tx.txid]) txsFound.push(tx);
      });
    }

    return txsFound;
  };

  static setNewTransactions = (transactions: Transaction[], lastSynched: number) => {
    const lastSynced = lastSynched;
    let latestSync = lastSynced;
    const newTransactions: Transaction[] = []; // delta transactions
    for (const tx of transactions) {
      if (tx.status === 'Confirmed' && tx.transactionType === TransactionType.RECEIVED) {
        if (tx.blockTime > lastSynced) newTransactions.push(tx);
        if (tx.blockTime > latestSync) latestSync = tx.blockTime;
      }
    }

    return {
      newTransactions,
      lastSynched: latestSync,
    };
  };

  static broadcastTransaction = async (
    txHex: string,
    network: bitcoinJS.Network
  ): Promise<{
    txid: string;
  }> => {
    let res: AxiosResponse;
    try {
      if (network === bitcoinJS.networks.testnet) {
        res = await accAxios.post(config.ESPLORA_API_ENDPOINTS.TESTNET.BROADCAST_TX, txHex, {
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      } else {
        res = await accAxios.post(config.ESPLORA_API_ENDPOINTS.MAINNET.BROADCAST_TX, txHex, {
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }
      return {
        txid: res.data,
      };
    } catch (err) {
      console.log(`An error occurred while broadcasting via current node. ${err}`);
      if (
        config.ESPLORA_API_ENDPOINTS.MAINNET.BROADCAST_TX ===
        config.BITHYVE_ESPLORA_API_ENDPOINTS.MAINNET.BROADCAST_TX
      )
        throw new Error(err.message); // not using own-node
      if (config.USE_ESPLORA_FALLBACK) {
        console.log('using Hexa node as fallback(tx-broadcast)');
        try {
          if (network === bitcoinJS.networks.testnet) {
            res = await accAxios.post(
              config.BITHYVE_ESPLORA_API_ENDPOINTS.TESTNET.BROADCAST_TX,
              txHex,
              {
                headers: {
                  'Content-Type': 'text/plain',
                },
              }
            );
          } else {
            res = await accAxios.post(
              config.BITHYVE_ESPLORA_API_ENDPOINTS.MAINNET.BROADCAST_TX,
              txHex,
              {
                headers: {
                  'Content-Type': 'text/plain',
                },
              }
            );
          }
          // Toast( 'We could not connect to your own node.\nSent using the BitHyve node....' )
          return {
            txid: res.data,
          };
        } catch (err) {
          throw new Error('Transaction broadcasting failed');
        }
      } else {
        // Toast( 'We could not connect to your node.\nTry connecting to the BitHyve node- Go to settings ....' )
        throw new Error('Transaction broadcasting failed');
      }
    }
  };

  // test-wallet specific utilities
  static getTestcoins = async (
    recipientAddress: string,
    network: bitcoinJS.networks.Network
  ): Promise<{
    txid: any;
    funded: any;
  }> => {
    if (network === bitcoinJS.networks.bitcoin) {
      throw new Error('Invalid network: failed to fund via testnet');
    }

    const SATOSHIS_IN_BTC = 1e8;
    const amount = 10000 / SATOSHIS_IN_BTC;
    try {
      const res = await accAxios.post(`${config.RELAY}/testnetFaucet`, {
        HEXA_ID: config.HEXA_ID,
        recipientAddress,
        amount,
      });
      const { txid, funded } = res.data;
      return {
        txid,
        funded,
      };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
  };

  // 2FA-wallet specific utilities
  // TODO: walletID <> appID switch
  static setupTwoFA = async (
    appId: string
  ): Promise<{
    setupData: {
      secret: string;
      bhXpub: string;
    };
  }> => {
    let res: AxiosResponse;
    try {
      res = await SIGNING_AXIOS.post('setup2FA', {
        HEXA_ID: config.HEXA_ID,
        appId,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { setupSuccessful, setupData } = res.data;
    if (!setupSuccessful) throw new Error('2FA setup failed');
    return {
      setupData,
    };
  };

  static validateTwoFA = async (
    appId: string,
    token: number
  ): Promise<{
    valid: Boolean;
  }> => {
    let res: AxiosResponse;
    try {
      res = await SIGNING_AXIOS.post('validate2FASetup', {
        HEXA_ID: config.HEXA_ID,
        appId,
        token,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { valid } = res.data;
    if (!valid) throw new Error('2FA validation failed');

    return {
      valid,
    };
  };

  static resetTwoFA = async (
    appId: string,
    secondaryMnemonic: string,
    secondaryXpub: string,
    network: bitcoinJS.networks.Network
  ): Promise<{
    secret: any;
  }> => {
    const derivedSecondaryXpub = WalletUtilities.generateExtendedKey(
      secondaryMnemonic,
      false,
      network,
      WalletUtilities.getDerivationPath(NetworkType.MAINNET, 0)
    );
    if (derivedSecondaryXpub !== secondaryXpub) throw new Error('Invaild secondary mnemonic');

    let res: AxiosResponse;
    try {
      res = await SIGNING_AXIOS.post('resetTwoFAv2', {
        HEXA_ID: config.HEXA_ID,
        appId: appId,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
    const { secret } = res.data;
    return {
      secret,
    };
  };

  static generateSecondaryXpriv = (
    secondaryMnemonic: string,
    secondaryXpub: string,
    network: bitcoinJS.networks.Network
  ): {
    secondaryXpriv: string;
  } => {
    const derivationPath = WalletUtilities.getDerivationPath(NetworkType.MAINNET, 0);
    const derivedSecondaryXpub = WalletUtilities.generateExtendedKey(
      secondaryMnemonic,
      false,
      network,
      derivationPath
    );
    if (derivedSecondaryXpub !== secondaryXpub) throw new Error('Invaild secondary mnemonic');

    const secondaryXpriv = WalletUtilities.generateExtendedKey(
      secondaryMnemonic,
      true,
      network,
      derivationPath
    );
    return {
      secondaryXpriv,
    };
  };

  static getSecondSignature = async (
    walletId: string,
    token: number,
    serializedPSBT: string,
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }>
  ): Promise<{
    signedTxHex: string;
  }> => {
    let res: AxiosResponse;

    try {
      res = await SIGNING_AXIOS.post('securePSBTTransaction', {
        HEXA_ID: config.HEXA_ID,
        walletID: walletId,
        token,
        serializedPSBT,
        childIndexArray,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const signedTxHex = res.data.txHex;
    return {
      signedTxHex,
    };
  };

  // donation-wallet specific utilities
  static setupDonationWallet = async (
    wallet: DonationWallet,
    walletId: string
  ): Promise<{
    setupSuccessful: boolean;
  }> => {
    const xpubs = [wallet.specs.xpub];
    if ((wallet as MultiSigWallet).specs.is2FA) {
      xpubs.push((wallet as MultiSigWallet).specs.xpubs.secondary);
      xpubs.push((wallet as MultiSigWallet).specs.xpubs.bithyve);
    }

    let res: AxiosResponse;
    try {
      res = await RELAY_AXIOS.post('setupDonationWallet', {
        HEXA_ID: config.HEXA_ID,
        donationId: wallet.id.slice(0, 15),
        walletID: walletId,
        details: {
          donee: wallet.presentationData.donee,
          subject: wallet.presentationData.donationName,
          description: wallet.presentationData.donationDescription,
          xpubId: wallet.id,
          xpubs,
          configuration: wallet.presentationData.configuration,
        },
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { setupSuccessful } = res.data;
    return {
      setupSuccessful,
    };
  };

  static updateDonationPreferences = async (
    wallet: DonationWallet,
    walletId: string,
    preferences: {
      disableWallet?: boolean;
      configuration?: {
        displayBalance: boolean;
        displayIncomingTxs: boolean;
        displayOutgoingTxs: boolean;
      };
      walletDetails?: {
        donee: string;
        subject: string;
        description: string;
      };
    }
  ): Promise<{ updated: boolean; updatedWallet: DonationWallet }> => {
    let res: AxiosResponse;
    try {
      res = await RELAY_AXIOS.post('updatePreferences', {
        HEXA_ID: config.HEXA_ID,
        donationId: wallet.id.slice(0, 15),
        walletID: walletId,
        preferences,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const { updated } = res.data;
    if (updated) {
      if (
        preferences.disableWallet !== undefined &&
        preferences.disableWallet !== wallet.presentationData.disableWallet
      )
        wallet.presentationData.disableWallet = preferences.disableWallet;

      if (preferences.configuration)
        wallet.presentationData.configuration = preferences.configuration;

      if (preferences.walletDetails) {
        wallet.presentationData.donationName = preferences.walletDetails.subject;
        wallet.presentationData.walletDescription = preferences.walletDetails.subject;
        wallet.presentationData.donationDescription = preferences.walletDetails.description;
        wallet.presentationData.donee = preferences.walletDetails.donee;
      }
    }

    return {
      updated,
      updatedWallet: wallet,
    };
  };

  static syncViaXpubAgent = async (
    xpubId: string,
    donationId: string
  ): Promise<{
    usedAddresses: string[];
    nextFreeAddressIndex: number;
    nextFreeChangeAddressIndex: number;
    utxos: Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
      status?: any;
    }>;
    balances: { confirmed: number; unconfirmed: number };
    transactions: Transaction[];
  }> => {
    // syncs wallet via xpub-agent(relay)

    let res: AxiosResponse;
    try {
      res = await RELAY_AXIOS.post('fetchXpubInfo', {
        HEXA_ID: config.HEXA_ID,
        xpubId,
        walletType: 'DONATION',
        walletDetails: {
          donationId,
        },
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }

    const {
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      utxos,
      balances,
      transactions,
    } = res.data;

    return {
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      utxos,
      balances: {
        confirmed: balances.balance,
        unconfirmed: balances.unconfirmedBalance,
      },
      transactions: transactions.transactionDetails,
    };
  };
}
