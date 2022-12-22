/* eslint-disable no-return-assign */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

import { CryptoAccount, CryptoHDKey } from 'src/core/services/qr/bc-ur-registry';
import ECPairFactory, { ECPairInterface } from 'ecpair';

import RestClient from 'src/core/services/rest/RestClient';
import _ from 'lodash';
import bip21 from 'bip21';
import bs58check from 'bs58check';
import { Wallet } from '../interfaces/wallet';
import { Vault } from '../interfaces/vault';
import {
  BIP48ScriptTypes,
  DerivationPurpose,
  EntityKind,
  NetworkType,
  PaymentInfoKind,
  TransactionType,
} from '../enums';
import {
  ActiveAddresses,
  OutputUTXOs,
  Transaction,
  TransactionToAddressMapping,
} from '../interfaces';
import config from '../../config';

const ECPair = ECPairFactory(ecc);

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
    return bitcoinJS.networks.bitcoin;
  };

  static getFingerprintFromNode = (node: bip32.BIP32Interface) => {
    let fingerprintHex = node.fingerprint.toString('hex');
    while (fingerprintHex.length < 8) fingerprintHex = `0${fingerprintHex}`;
    return fingerprintHex.toUpperCase();
  };

  static getFingerprintFromSeed = (seed: Buffer) => {
    const root = bip32.fromSeed(seed);
    return WalletUtilities.getFingerprintFromNode(root);
  };

  static getFingerprintFromMnemonic(mnemonic: string, passphrase?: string) {
    const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
    return WalletUtilities.getFingerprintFromSeed(seed);
  }

  static getFingerprintFromExtendedKey = (
    extendedKey: string,
    network: bitcoinJS.networks.Network
  ) => {
    const node = bip32.fromBase58(extendedKey, network);
    return WalletUtilities.getFingerprintFromNode(node);
  };

  static getDerivationPath = (
    entity: EntityKind,
    type: NetworkType,
    accountNumber: number = 0,
    purpose: DerivationPurpose = DerivationPurpose.BIP84,
    scriptType: BIP48ScriptTypes = BIP48ScriptTypes.NATIVE_SEGWIT
  ): string => {
    const isTestnet = type === NetworkType.TESTNET ? 1 : 0;
    if (entity === EntityKind.VAULT) {
      const scriptNum = scriptType === BIP48ScriptTypes.NATIVE_SEGWIT ? 2 : 1;
      return `m/${DerivationPurpose.BIP48}'/${isTestnet}'/${accountNumber}'/${scriptNum}'`;
    }
    return `m/${purpose}'/${isTestnet}'/${accountNumber}'`;
  };

  static getKeyPair = (privateKey: string, network: bitcoinJS.Network): ECPairInterface =>
    ECPair.fromWIF(privateKey, network);

  static deriveAddressFromKeyPair = (
    keyPair: bip32.BIP32Interface | ECPairInterface,
    network: bitcoinJS.Network,
    purpose: DerivationPurpose = DerivationPurpose.BIP84
  ): string => {
    if (purpose === DerivationPurpose.BIP84) {
      return bitcoinJS.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network,
      }).address;
    }
    if (purpose === DerivationPurpose.BIP49) {
      return bitcoinJS.payments.p2sh({
        redeem: bitcoinJS.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network,
        }),
        network,
      }).address;
    }
    if (purpose === DerivationPurpose.BIP44) {
      return bitcoinJS.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network,
      }).address;
    }
  };

  static deriveMultiSig = (
    required: number,
    pubkeys: Buffer[],
    network: bitcoinJS.Network,
    scriptType: BIP48ScriptTypes = BIP48ScriptTypes.NATIVE_SEGWIT
  ): {
    p2ms: bitcoinJS.payments.Payment;
    p2wsh: bitcoinJS.payments.Payment;
    p2sh: bitcoinJS.payments.Payment | undefined;
  } => {
    const p2ms = bitcoinJS.payments.p2ms({
      m: required,
      pubkeys,
      network,
    });
    const p2wsh = bitcoinJS.payments.p2wsh({
      redeem: p2ms,
      network,
    });

    let p2sh;
    if (scriptType === BIP48ScriptTypes.WRAPPED_SEGWIT) {
      // wrap native segwit
      p2sh = bitcoinJS.payments.p2sh({
        redeem: p2wsh,
        network,
      });
    }

    return { p2ms, p2wsh, p2sh };
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
  ): {
    privateKey: string;
    subPath: number[];
  } => {
    const node = bip32.fromBase58(xpriv, network);
    const chain = internal ? 1 : 0;
    const privateKey = node.derive(chain).derive(index).toWIF();
    return { privateKey, subPath: [chain, index] };
  };

  static getPublicKeyByIndex = (
    xpub: string,
    internal: boolean,
    index: number,
    network: bitcoinJS.networks.Network
  ): { publicKey: Buffer; subPath: number[] } => {
    const node = bip32.fromBase58(xpub, network);
    const chain = internal ? 1 : 0;
    const keyPair = node.derive(chain).derive(index);
    const { publicKey } = keyPair;
    return { publicKey, subPath: [chain, index] };
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

  static getNetworkFromXpub = (xpub: string) => {
    if (xpub) {
      return xpub.startsWith('xpub') || xpub.startsWith('ypub') || xpub.startsWith('zpub')
        ? NetworkType.MAINNET
        : NetworkType.TESTNET;
    }
  };

  static generateYpub = (xpub: string, network: bitcoinJS.Network): string => {
    // generates ypub corresponding to supplied xpub || upub corresponding to tpub
    let data = bs58check.decode(xpub);
    const versionBytes = bitcoinJS.networks.bitcoin === network ? '049d7cb2' : '044a5262';
    data = Buffer.concat([Buffer.from(versionBytes, 'hex'), data.slice(4)]);
    return bs58check.encode(data);
  };

  static generateXpubFromYpub = (ypub: string, network: bitcoinJS.Network): string => {
    // generates xpub corresponding to supplied ypub || tpub corresponding to upub
    let data = bs58check.decode(ypub);
    const versionBytes = bitcoinJS.networks.bitcoin === network ? '0488b21e' : '043587cf';
    data = Buffer.concat([Buffer.from(versionBytes, 'hex'), data.slice(4)]);
    return bs58check.encode(data);
  };

  static addressToKey = (
    address: string,
    wallet: Wallet | Vault,
    publicKey: boolean = false
  ):
    | {
        publicKey: Buffer;
        subPath: number[];
      }
    | {
        privateKey: string;
        subPath: number[];
      } => {
    const { networkType } = wallet;
    const { nextFreeAddressIndex, nextFreeChangeAddressIndex } = wallet.specs;
    let xpub = null;
    let xpriv = null;

    if (wallet.entityKind === EntityKind.VAULT) {
      if (!publicKey) throw new Error('internal xpriv not supported in case of Vault');
      if ((wallet as Vault).isMultiSig) throw new Error('MultiSig should use: addressToMultiSig');

      xpub = (wallet as Vault).specs.xpubs[0];
    } else {
      xpub = (wallet as Wallet).specs.xpub;
      xpriv = (wallet as Wallet).specs.xpriv;
    }

    const network = WalletUtilities.getNetworkByType(networkType);

    const closingExtIndex = nextFreeAddressIndex + config.GAP_LIMIT;
    for (let itr = 0; itr <= nextFreeAddressIndex + closingExtIndex; itr++) {
      if (WalletUtilities.getAddressByIndex(xpub, false, itr, network) === address)
        return publicKey
          ? WalletUtilities.getPublicKeyByIndex(xpub, false, itr, network)
          : WalletUtilities.getPrivateKeyByIndex(xpriv, false, itr, network);
    }

    const closingIntIndex = nextFreeChangeAddressIndex + config.GAP_LIMIT;
    for (let itr = 0; itr <= closingIntIndex; itr++) {
      if (WalletUtilities.getAddressByIndex(xpub, true, itr, network) === address)
        return publicKey
          ? WalletUtilities.getPublicKeyByIndex(xpub, true, itr, network)
          : WalletUtilities.getPrivateKeyByIndex(xpriv, true, itr, network);
    }

    if (!publicKey)
      for (const importedAddress in wallet.specs.importedAddresses) {
        if (address === importedAddress)
          return {
            privateKey: wallet.specs.importedAddresses[importedAddress].privateKey,
            subPath: [],
          };
      }

    throw new Error(`Could not find ${publicKey ? 'public' : 'private'} key for: ${address}`);
  };

  static createMultiSig = (
    xpubs: string[],
    required: number,
    network: bitcoinJS.Network,
    childIndex: number,
    internal: boolean,
    scriptType?: BIP48ScriptTypes
  ): {
    p2ms: bitcoinJS.payments.Payment;
    p2wsh: bitcoinJS.payments.Payment;
    p2sh: bitcoinJS.payments.Payment;
    pubkeys: Buffer[];
    address: string;
    subPath: number[];
    signerPubkeyMap: Map<string, Buffer>;
  } => {
    const subPath = [internal ? 1 : 0, childIndex];
    let pubkeys = xpubs.map((xpub) => {
      const childExtendedKey = WalletUtilities.generateChildFromExtendedKey(
        xpub,
        network,
        childIndex,
        internal
      );
      const xKey = bip32.fromBase58(childExtendedKey, network);
      return xKey.publicKey;
    });
    const signerPubkeyMap = new Map<string, Buffer>();
    xpubs.forEach((xpub, i) => {
      signerPubkeyMap.set(xpub, pubkeys[i]);
    });

    pubkeys = pubkeys.sort((a, b) => (a.toString('hex') > b.toString('hex') ? 1 : -1)); // bip-67 compatible

    const { p2ms, p2wsh, p2sh } = WalletUtilities.deriveMultiSig(
      required,
      pubkeys,
      network,
      scriptType
    );
    const address = p2sh ? p2sh.address : p2wsh.address;
    return {
      p2ms,
      p2wsh,
      p2sh,
      pubkeys,
      address,
      subPath,
      signerPubkeyMap,
    };
  };

  static addressToMultiSig = (
    address: string,
    wallet: Vault
  ): {
    p2ms: bitcoinJS.payments.Payment;
    p2wsh: bitcoinJS.payments.Payment;
    p2sh: bitcoinJS.payments.Payment;
    pubkeys: Buffer[];
    address: string;
    subPath: number[];
    signerPubkeyMap: Map<string, Buffer>;
  } => {
    const { networkType } = wallet;
    const { nextFreeAddressIndex, nextFreeChangeAddressIndex, xpubs } = wallet.specs;
    const network = WalletUtilities.getNetworkByType(networkType);

    const closingExtIndex = nextFreeAddressIndex + config.GAP_LIMIT;
    for (let itr = 0; itr <= nextFreeAddressIndex + closingExtIndex; itr++) {
      const multiSig = WalletUtilities.createMultiSig(xpubs, wallet.scheme.m, network, itr, false);

      if (multiSig.address === address) return multiSig;
    }

    const closingIntIndex = nextFreeChangeAddressIndex + config.GAP_LIMIT;
    for (let itr = 0; itr <= closingIntIndex; itr++) {
      const multiSig = WalletUtilities.createMultiSig(xpubs, wallet.scheme.m, network, itr, true);
      if (multiSig.address === address) return multiSig;
    }

    throw new Error(`Could not find multisig for: ${address}`);
  };

  static generatePaymentURI = (
    address: string,
    options?: { amount: number; label?: string; message?: string }
  ): { paymentURI: string } => {
    if (options) {
      return {
        paymentURI: bip21.encode(address, options),
      };
    }
    return {
      paymentURI: bip21.encode(address),
    };
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

  static addressDiff = (scannedStr: string, network: bitcoinJS.Network) => {
    scannedStr = scannedStr.replace('BITCOIN', 'bitcoin');
    if (WalletUtilities.isPaymentURI(scannedStr)) {
      const { address, options } = WalletUtilities.decodePaymentURI(scannedStr);
      if (WalletUtilities.isValidAddress(address, network)) {
        return {
          type: PaymentInfoKind.PAYMENT_URI,
          address: scannedStr,
          amount: options.amount,
          message: options.message,
        };
      }
    } else if (WalletUtilities.isValidAddress(scannedStr, network)) {
      return {
        type: PaymentInfoKind.ADDRESS,
        address: scannedStr,
      };
    }

    return {
      type: null,
    };
  };

  static generateChange = (
    wallet: Wallet | Vault,
    outputs: Array<OutputUTXOs>,
    nextFreeChangeAddressIndex: number,
    network: bitcoinJS.networks.Network
  ):
    | {
        outputs: OutputUTXOs[];
        changeMultisig: {
          p2ms: bitcoinJS.payments.Payment;
          p2wsh: bitcoinJS.payments.Payment;
          p2sh: bitcoinJS.payments.Payment;
          pubkeys: Buffer[];
          address: string;
          subPath: number[];
          signerPubkeyMap: Map<string, Buffer>;
        };
        changeAddress?: undefined;
      }
    | {
        outputs: OutputUTXOs[];
        changeAddress: string;
        changeMultisig?: undefined;
      } => {
    const changeAddress: string = '';
    let changeMultisig: {
      p2ms: bitcoinJS.payments.Payment;
      p2wsh: bitcoinJS.payments.Payment;
      p2sh: bitcoinJS.payments.Payment;
      pubkeys: Buffer[];
      address: string;
      subPath: number[];
      signerPubkeyMap: Map<string, Buffer>;
    };
    if ((wallet as Vault).isMultiSig) {
      const { xpubs } = (wallet as Vault).specs;
      changeMultisig = WalletUtilities.createMultiSig(
        xpubs,
        (wallet as Vault).scheme.m,
        network,
        nextFreeChangeAddressIndex,
        true
      );
    }

    for (const output of outputs) {
      if (!output.address) {
        if ((wallet as Vault).isMultiSig) {
          output.address = changeMultisig.address;
          return { outputs, changeMultisig };
        }
        let xpub = null;
        if (wallet.entityKind === EntityKind.VAULT) xpub = (wallet as Vault).specs.xpubs[0];
        else xpub = (wallet as Wallet).specs.xpub;

        output.address = WalletUtilities.getAddressByIndex(
          xpub,
          true,
          nextFreeChangeAddressIndex,
          network
        );
        return { outputs, changeAddress: output.address };
      }
    }
    // when there's no change
    if ((wallet as Vault).isMultiSig) {
      return { outputs, changeMultisig };
    }
    return { outputs, changeAddress };
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
        transactionNote: {
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
    let res;
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

      try {
        if (network === bitcoinJS.networks.testnet) {
          res = await RestClient.post(
            config.ESPLORA_API_ENDPOINTS.TESTNET.NEWMULTIUTXOTXN,
            walletToAddressMapping
          );
        } else {
          res = await RestClient.post(
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
          throw new Error(err.message);
        }
        console.log('using Hexa node as fallback(fetch-balTx)');

        if (network === bitcoinJS.networks.testnet) {
          res = await RestClient.post(
            config.BITHYVE_ESPLORA_API_ENDPOINTS.TESTNET.NEWMULTIUTXOTXN,
            walletToAddressMapping
          );
        } else {
          res = await RestClient.post(
            config.BITHYVE_ESPLORA_API_ENDPOINTS.MAINNET.NEWMULTIUTXOTXN,
            walletToAddressMapping
          );
        }
      }

      const walletToResponseMapping = res.data || res.json;
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
          transactionNote,
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
                  addresses: [addressInfo.Address],
                });

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
                  walletName: walletName || walletType,
                  recipientAddresses: tx.RecipientAddresses ? tx.RecipientAddresses : [],
                  senderAddresses: tx.SenderAddresses ? tx.SenderAddresses : [],
                  blockTime: tx.Status.block_time ? tx.Status.block_time : Date.now(), // only available when tx is confirmed; otherwise set to the current timestamp
                  address: addressInfo.Address,
                  isNew: true,
                  notes: transactionNote[tx.txid],
                };

                newTxs.push(transaction);
              } else {
                // Resolve the quadratic complexity(introduced due to data storage restrictions by Realm)
                for (const map of transactionMapping) {
                  if (map.txid === tx.txId) {
                    if (!map.addresses.includes(addressInfo.Address))
                      map.addresses.push(addressInfo.Address);
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

        // pop addresses from the activeAddresses if tx-conf > 6
        txsToUpdate.forEach((tx) => {
          if (tx.confirmations > 6) {
            let addresses;
            // find a better way to reduce complexity(currently: quadratic)
            for (const map of transactionMapping) {
              if (map.txid === tx.txid) {
                addresses = map.addresses;
                break;
              }
            }

            addresses.forEach((address) => {
              if (activeAddresses.external[address] !== undefined)
                delete activeAddresses.external[address];
              else if (activeAddresses.internal[address] !== undefined)
                delete activeAddresses.internal[address];
            });
          }
        });

        // sort transactions(lastest first)
        transactions.sort((tx1, tx2) => tx2.blockTime - tx1.blockTime);

        synchedWallets[walletId] = {
          UTXOs,
          txIdCache,
          transactionMapping,
          transactions,
          nextFreeAddressIndex: lastUsedAddressIndex + 1,
          nextFreeChangeAddressIndex: lastUsedChangeAddressIndex + 1,
          activeAddresses,
          activeAddressesWithNewTxs,
          hasNewTxn: newTxs.length > 0,
        };
      }

      return {
        synchedWallets,
      };
    } catch (err) {
      throw new Error('Fetching balance-txn by addresses failed');
    }
  };

  static getTxCounts = async (addresses: string[], network: bitcoinJS.Network) => {
    const txCounts = {};
    try {
      let res;
      try {
        if (network === bitcoinJS.networks.testnet) {
          res = await RestClient.post(config.ESPLORA_API_ENDPOINTS.TESTNET.MULTITXN, {
            addresses,
          });
        } else {
          res = await RestClient.post(config.ESPLORA_API_ENDPOINTS.MAINNET.MULTITXN, {
            addresses,
          });
        }
      } catch (err) {
        throw new Error(err.response.data.err);
      }

      const addressesInfo = res.data || res.json;
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
    txHex,
    network: bitcoinJS.Network
  ): Promise<{
    txid: string;
  }> => {
    let res;
    try {
      if (network === bitcoinJS.networks.testnet) {
        res = await RestClient.post('https://blockstream.info/testnet/api/tx', txHex, {
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      } else {
        res = await RestClient.post(config.ESPLORA_API_ENDPOINTS.MAINNET.BROADCAST_TX, txHex, {
          headers: {
            'Content-Type': 'text/plain',
          },
        });
      }
      return {
        txid: res.data || res.json,
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
            res = await RestClient.post(
              config.BITHYVE_ESPLORA_API_ENDPOINTS.TESTNET.BROADCAST_TX,
              txHex,
              {
                headers: {
                  'Content-Type': 'text/plain',
                },
              }
            );
          } else {
            res = await RestClient.post(
              config.BITHYVE_ESPLORA_API_ENDPOINTS.MAINNET.BROADCAST_TX,
              txHex,
              {
                headers: {
                  'Content-Type': 'text/plain',
                },
              }
            );
          }

          return {
            txid: res.data || res.json,
          };
        } catch (err) {
          throw new Error('Transaction broadcasting failed');
        }
      } else {
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
      const res = await RestClient.post(`${config.RELAY}/testnetFaucet`, {
        AUTH_ID: config.AUTH_ID,
        recipientAddress,
        amount,
      });
      const { txid, funded } = res.data || res.json;
      return {
        txid,
        funded,
      };
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
  };

  static generateXpubFromMetaData = (cryptoAccount: CryptoAccount) => {
    const version = Buffer.from('02aa7ed3', 'hex');
    const hdKey = cryptoAccount.getOutputDescriptors()[0].getCryptoKey() as CryptoHDKey;
    const depth = hdKey.getOrigin().getDepth();
    const depthBuf = Buffer.alloc(1);
    depthBuf.writeUInt8(depth);
    const parentFingerprint = hdKey.getParentFingerprint();
    const components = hdKey.getOrigin().getComponents();
    const lastComponents = components[components.length - 1];
    const index = lastComponents.isHardened()
      ? lastComponents.getIndex() + 0x80000000
      : lastComponents.getIndex();
    const indexBuf = Buffer.alloc(4);
    indexBuf.writeUInt32BE(index);
    const chainCode = hdKey.getChainCode();
    const key = hdKey.getKey();
    const derivationPath = `m/${hdKey.getOrigin().getPath()}`;
    const xPubBuf = Buffer.concat([version, depthBuf, parentFingerprint, indexBuf, chainCode, key]);
    const xPub = bs58check.encode(xPubBuf);
    const mfp = cryptoAccount.getMasterFingerprint().toString('hex');
    return { xPub, derivationPath, mfp };
  };

  static getSignerPurposeFromPath = (path: string) => {
    const branches = path.split('/');
    const purpose = branches.length > 1 ? branches[1].match(/(\d+)/) : null;
    if (purpose) {
      return purpose[0];
    }
    return null;
  };
}
