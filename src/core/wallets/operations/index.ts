import * as bip32 from 'bip32';
import * as bitcoinJS from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

import {
  ActiveAddressAssignee,
  ActiveAddresses,
  AverageTxFees,
  Balances,
  InputUTXOs,
  OutputUTXOs,
  SerializedPSBTEnvelop,
  SigningPayload,
  Transaction,
  TransactionPrerequisite,
  TransactionPrerequisiteElements,
  TransactionToAddressMapping,
  UTXO,
} from '../interfaces/';
import {
  BIP48ScriptTypes,
  DerivationPurpose,
  EntityKind,
  NetworkType,
  SignerType,
  TxPriority,
  WalletType,
} from '../enums';
import { Vault, VaultSigner } from '../interfaces/vault';

import ECPairFactory from 'ecpair';
import { Wallet } from '../interfaces/wallet';
import WalletUtilities from './utils';
import coinselect from 'coinselect';
import coinselectSplit from 'coinselect/split';
import config from 'src/core/config';
import { parseInt } from 'lodash';

const ECPair = ECPairFactory(ecc);

export default class WalletOperations {
  static getNextFreeExternalAddress = (
    wallet: Wallet | Vault,
    purpose?: DerivationPurpose
  ): { updatedWallet: Wallet | Vault; receivingAddress: string } => {
    // TODO: either remove ActiveAddressAssignee or reintroduce it(realm compatibility issue)
    let receivingAddress;
    const network = WalletUtilities.getNetworkByType(wallet.networkType);
    if ((wallet as Vault).isMultiSig) {
      const xpubs = (wallet as Vault).specs.xpubs;
      receivingAddress = WalletUtilities.createMultiSig(
        xpubs,
        (wallet as Vault).scheme.m,
        network,
        wallet.specs.nextFreeAddressIndex,
        false
      ).address;
    } else {
      receivingAddress = WalletUtilities.getAddressByIndex(
        (wallet as Wallet).specs.xpub,
        false,
        (wallet as Wallet).specs.nextFreeAddressIndex,
        network,
        purpose
      );
    }

    wallet.specs.activeAddresses.external[receivingAddress] = wallet.specs.nextFreeAddressIndex;
    wallet.specs.nextFreeAddressIndex++;
    return {
      updatedWallet: wallet,
      receivingAddress,
    };
  };

  static syncGapLimit = async (wallet: Wallet | Vault) => {
    let tryAgain = false;
    const hardGapLimit = 10;
    const network = WalletUtilities.getNetworkByType(wallet.networkType);

    let externalAddress: string;
    if ((wallet as Vault).isMultiSig) {
      externalAddress = WalletUtilities.createMultiSig(
        (wallet as Vault).specs.xpubs,
        (wallet as Vault).scheme.m,
        network,
        wallet.specs.nextFreeAddressIndex + hardGapLimit - 1,
        false
      ).address;
    } else {
      externalAddress = WalletUtilities.getAddressByIndex(
        (wallet as Wallet).specs.xpub,
        false,
        wallet.specs.nextFreeAddressIndex + hardGapLimit - 1,
        network
      );
    }

    let internalAddress: string;
    if ((wallet as Vault).isMultiSig) {
      internalAddress = WalletUtilities.createMultiSig(
        (wallet as Vault).specs.xpubs,
        (wallet as Vault).scheme.m,
        network,
        wallet.specs.nextFreeChangeAddressIndex + hardGapLimit - 1,
        true
      ).address;
    } else {
      internalAddress = WalletUtilities.getAddressByIndex(
        (wallet as Wallet).specs.xpub,
        true,
        wallet.specs.nextFreeChangeAddressIndex + hardGapLimit - 1,
        network
      );
    }

    const txCounts = await WalletUtilities.getTxCounts([externalAddress, internalAddress], network);

    if (txCounts[externalAddress] > 0) {
      wallet.specs.nextFreeAddressIndex += hardGapLimit;
      tryAgain = true;
    }

    if (txCounts[internalAddress] > 0) {
      wallet.specs.nextFreeChangeAddressIndex += hardGapLimit;
      tryAgain = true;
    }

    if (tryAgain) {
      return WalletOperations.syncGapLimit(wallet);
    }
  };

  static importAddress = async (
    wallet: Wallet | Vault,
    privateKey: string,
    address: string,
    requester: ActiveAddressAssignee
  ) => {
    if (!wallet.specs.importedAddresses) wallet.specs.importedAddresses = {};
    wallet.specs.importedAddresses[address] = {
      address,
      privateKey,
    };
    wallet.specs.activeAddresses.external[address] = -1;
  };

  static syncWallets = async (
    wallets: (Wallet | Vault)[],
    network: bitcoinJS.networks.Network,
    hardRefresh?: boolean
  ): Promise<{
    synchedWallets: (Wallet | Vault)[];
    txsFound: Transaction[];
    activeAddressesWithNewTxsMap: {
      [walletId: string]: ActiveAddresses;
    };
  }> => {
    const walletInstances: {
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
    } = {};
    const walletsInternals: {
      [walletId: string]: {
        internalAddresses: { [address: string]: number };
      };
    } = {};
    for (const wallet of wallets) {
      const ownedAddresses = []; // owned address mapping
      // owned addresses are used for apt tx categorization and transfer amount calculation

      const hardGapLimit = 5; // hard refresh gap limit
      const externalAddresses: { [address: string]: number } = {}; // all external addresses(till closingExtIndex)
      for (let itr = 0; itr < wallet.specs.nextFreeAddressIndex + hardGapLimit; itr++) {
        let address: string;
        if ((wallet as Vault).isMultiSig) {
          const xpubs = (wallet as Vault).specs.xpubs;
          address = WalletUtilities.createMultiSig(
            xpubs,
            (wallet as Vault).scheme.m,
            network,
            itr,
            false
          ).address;
        } else {
          address = WalletUtilities.getAddressByIndex(
            (wallet as Wallet).specs.xpub,
            false,
            itr,
            network
          );
        }

        externalAddresses[address] = itr;
        ownedAddresses.push(address);
      }

      // include imported external addresses
      if (!wallet.specs.importedAddresses) wallet.specs.importedAddresses = {};
      Object.keys(wallet.specs.importedAddresses).forEach((address) => {
        externalAddresses[address] = -1;
        ownedAddresses.push(address);
      });

      const internalAddresses: { [address: string]: number } = {}; // all internal addresses(till closingIntIndex)
      for (let itr = 0; itr < wallet.specs.nextFreeChangeAddressIndex + hardGapLimit; itr++) {
        let address: string;
        if ((wallet as Vault).isMultiSig) {
          const xpubs = (wallet as Vault).specs.xpubs;
          address = WalletUtilities.createMultiSig(
            xpubs,
            (wallet as Vault).scheme.m,
            network,
            itr,
            true
          ).address;
        } else {
          address = WalletUtilities.getAddressByIndex(
            (wallet as Wallet).specs.xpub,
            true,
            itr,
            network
          );
        }

        internalAddresses[address] = itr;
        ownedAddresses.push(address);
      }

      // garner cached params for bal-tx sync
      const cachedUTXOs: UTXO[] = hardRefresh
        ? []
        : [...wallet.specs.confirmedUTXOs, ...wallet.specs.unconfirmedUTXOs];
      const txIdCache = hardRefresh ? {} : wallet.specs.txIdCache;
      const cachedTransactionMapping: TransactionToAddressMapping[] = hardRefresh
        ? []
        : wallet.specs.transactionMapping;
      const cachedTxs: Transaction[] = hardRefresh ? [] : wallet.specs.transactions;

      let shouldHardRefresh = hardRefresh;
      if (!shouldHardRefresh) {
        // hard-refresh SWAN wallet(default)
        if (wallet.type === WalletType.SWAN) shouldHardRefresh = true;
      }

      walletInstances[wallet.id] = {
        activeAddresses: wallet.specs.activeAddresses,
        externalAddresses,
        internalAddresses,
        ownedAddresses,
        cachedUTXOs,
        cachedTxs,
        txIdCache,
        cachedTransactionMapping,
        lastUsedAddressIndex: wallet.specs.nextFreeAddressIndex - 1,
        lastUsedChangeAddressIndex: wallet.specs.nextFreeChangeAddressIndex - 1,
        transactionNote: wallet.specs.transactionNote,
        walletType: wallet.type,
        walletName: wallet.presentationData.name,
        hardRefresh: shouldHardRefresh,
      };

      walletsInternals[wallet.id] = {
        internalAddresses,
      };
    }

    const { synchedWallets } = await WalletUtilities.fetchBalanceTransactionsByWallets(
      walletInstances,
      network
    );

    const txsFound: Transaction[] = [];
    const activeAddressesWithNewTxsMap: { [walletId: string]: ActiveAddresses } = {};
    for (const wallet of wallets) {
      const {
        UTXOs,
        transactions,
        txIdCache,
        transactionMapping,
        nextFreeAddressIndex,
        nextFreeChangeAddressIndex,
        activeAddresses,
        activeAddressesWithNewTxs,
        hasNewTxn,
      } = synchedWallets[wallet.id];
      const { internalAddresses } = walletsInternals[wallet.id];

      // update utxo sets and balances
      const balances: Balances = {
        confirmed: 0,
        unconfirmed: 0,
      };
      const confirmedUTXOs = [];
      const unconfirmedUTXOs = [];
      for (const utxo of UTXOs) {
        if (utxo.status.confirmed) {
          confirmedUTXOs.push(utxo);
          balances.confirmed += utxo.value;
        } else {
          if (internalAddresses[utxo.address] !== undefined) {
            // defaulting utxo's on the change branch to confirmed
            confirmedUTXOs.push(utxo);
            balances.confirmed += utxo.value;
          } else {
            unconfirmedUTXOs.push(utxo);
            balances.unconfirmed += utxo.value;
          }
        }
      }

      wallet.specs.unconfirmedUTXOs = unconfirmedUTXOs;
      wallet.specs.confirmedUTXOs = confirmedUTXOs;
      wallet.specs.balances = balances;
      wallet.specs.nextFreeAddressIndex = nextFreeAddressIndex;
      wallet.specs.nextFreeChangeAddressIndex = nextFreeChangeAddressIndex;
      wallet.specs.activeAddresses = activeAddresses;
      wallet.specs.hasNewTxn = hasNewTxn;

      const { newTransactions, lastSynched } = WalletUtilities.setNewTransactions(
        transactions,
        wallet.specs.lastSynched
      );

      wallet.specs.transactions = transactions;
      wallet.specs.txIdCache = txIdCache;
      wallet.specs.transactionMapping = transactionMapping;
      wallet.specs.newTransactions = newTransactions;
      wallet.specs.lastSynched = lastSynched;
      activeAddressesWithNewTxsMap[wallet.id] = activeAddressesWithNewTxs;
      wallet.specs.hasNewTxn = hasNewTxn;
    }
    return {
      synchedWallets: wallets,
      txsFound,
      activeAddressesWithNewTxsMap,
    };
  };

  static updateActiveAddresses = (
    wallet: Wallet | Vault,
    consumedUTXOs: { [txid: string]: InputUTXOs },
    txid: string,
    recipients: {
      id?: string;
      address: string;
      amount: number;
      name?: string;
    }[]
  ) => {
    const network = WalletUtilities.getNetworkByType(wallet.networkType);

    const activeExternalAddresses = wallet.specs.activeAddresses.external;
    const activeInternalAddresses = wallet.specs.activeAddresses.internal;

    const recipientInfo = {
      [txid]: recipients.map((recipient) => {
        return {
          id: recipient.id,
          name: recipient.name,
          amount: recipient.amount,
        };
      }),
    };

    for (const consumedUTXO of Object.values(consumedUTXOs)) {
      let found = false;
      // is out of bound external address?
      for (let itr = 0; itr < wallet.specs.nextFreeAddressIndex; itr++) {
        let address: string;
        if ((wallet as Vault).isMultiSig) {
          address = WalletUtilities.createMultiSig(
            (wallet as Vault).specs.xpubs,
            (wallet as Vault).scheme.m,
            network,
            itr,
            false
          ).address;
        } else {
          address = WalletUtilities.getAddressByIndex(
            (wallet as Wallet).specs.xpub,
            false,
            itr,
            network
          );
        }

        if (consumedUTXO.address === address) {
          // include out of bound ext address
          if (activeExternalAddresses[address] === undefined)
            activeExternalAddresses[address] = itr;
          found = true;
          break;
        }
      }

      // is out of bound internal address?
      if (!found)
        for (let itr = 0; itr < wallet.specs.nextFreeChangeAddressIndex; itr++) {
          let address: string;
          if ((wallet as Vault).isMultiSig) {
            address = WalletUtilities.createMultiSig(
              (wallet as Vault).specs.xpubs,
              (wallet as Vault).scheme.m,
              network,
              itr,
              true
            ).address;
          } else {
            address = WalletUtilities.getAddressByIndex(
              (wallet as Wallet).specs.xpub,
              true,
              itr,
              network
            );
          }

          if (consumedUTXO.address === address) {
            // include out of bound(soft-refresh range) int address
            if (activeInternalAddresses[address] === undefined)
              activeInternalAddresses[address] = itr;
            found = true;
            break;
          }
        }
    }

    // add internal address used for change utxo to activeAddresses.internal
    let changeAddress: string;

    if ((wallet as Vault).isMultiSig) {
      changeAddress = WalletUtilities.createMultiSig(
        (wallet as Vault).specs.xpubs,
        (wallet as Vault).scheme.m,
        network,
        wallet.specs.nextFreeChangeAddressIndex,
        true
      ).address;
    } else {
      changeAddress = WalletUtilities.getAddressByIndex(
        (wallet as Wallet).specs.xpub,
        true,
        wallet.specs.nextFreeChangeAddressIndex,
        network
      );
    }

    activeInternalAddresses[changeAddress] = wallet.specs.nextFreeChangeAddressIndex;
    wallet.specs.nextFreeChangeAddressIndex++;
  };

  static removeConsumedUTXOs = (
    wallet: Wallet | Vault,
    inputs: InputUTXOs[],
    txid: string,
    recipients: {
      id?: string;
      address: string;
      amount: number;
      name?: string;
    }[]
  ) => {
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
    WalletOperations.updateActiveAddresses(wallet, consumedUTXOs, txid, recipients);
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
        txPrerequisites?: undefined;
      }
    | {
        txPrerequisites: TransactionPrerequisite;
        fee?: undefined;
        balance?: undefined;
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
    console.log({
      inputUTXOs,
      outputUTXOs,
      customTxFeePerByte,
    });
    const { inputs, outputs, fee } = coinselect(inputUTXOs, outputUTXOs, customTxFeePerByte);
    console.log({
      inputs,
      outputs,
      fee,
    });
    if (!inputs)
      return {
        fee,
      };

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
    if (wallet.entityKind === EntityKind.WALLET) {
      const { publicKey, subPath } = WalletUtilities.addressToKey(
        input.address,
        wallet as Wallet,
        true
      ) as { publicKey: Buffer; subPath: number[] };
      const p2wpkh = bitcoinJS.payments.p2wpkh({
        pubkey: publicKey,
        network,
      });

      let p2sh;
      if (derivationPurpose === DerivationPurpose.BIP49)
        p2sh = bitcoinJS.payments.p2sh({
          redeem: p2wpkh,
        });

      const path = (wallet as Wallet).derivationDetails.xDerivationPath + `/${subPath.join('/')}`;
      const masterFingerprint = WalletUtilities.getFingerprintFromMnemonic(
        (wallet as Wallet).derivationDetails.mnemonic
      );

      const bip32Derivation = [
        {
          masterFingerprint: Buffer.from(masterFingerprint, 'hex'),
          path: path,
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
    } else if (wallet.entityKind === EntityKind.VAULT) {
      const { p2ms, p2wsh, p2sh, subPath, signerPubkeyMap } = WalletUtilities.addressToMultiSig(
        input.address,
        wallet as Vault
      );

      const bip32Derivation = [];
      for (let i = 0; i < (wallet as Vault).signers.length; i++) {
        const signer = (wallet as Vault).signers[i];
        if (signer.type === SignerType.COLDCARD) {
          const derivationPath = signer.xpubInfo?.derivationPath;
          const masterFingerprint = Buffer.from(signer.xpubInfo?.xfp, 'hex');
          const path = derivationPath + `/${subPath.join('/')}`;
          bip32Derivation.push({
            masterFingerprint,
            path,
            pubkey: signerPubkeyMap.get(signer.xpub),
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
    for (let i = 0; i < (wallet as Vault).signers.length; i++) {
      const signer = (wallet as Vault).signers[i];
      if (signer.type === SignerType.COLDCARD) {
        const derivationPath = signer.xpubInfo?.derivationPath;
        const masterFingerprint = Buffer.from(signer.xpubInfo?.xfp, 'hex');
        const path = derivationPath + `/${subPath.join('/')}`;
        bip32Derivation.push({
          masterFingerprint,
          path,
          pubkey: signerPubkeyMap.get(signer.xpub),
        });
      }
    }

    return { bip32Derivation, redeemScript: p2wsh.output, witnessScript: p2ms.output };
  };

  static createTransaction = async (
    wallet: Wallet | Vault,
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: TransactionPrerequisiteElements,
    scriptType?: BIP48ScriptTypes
  ): Promise<{
    PSBT: bitcoinJS.Psbt;
  }> => {
    try {
      let inputs, outputs;
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

      for (const input of inputs) this.addInputToPSBT(PSBT, wallet, input, network, scriptType);

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

      for (let output of outputsWithChange) {
        if (wallet.entityKind === EntityKind.VAULT && output.address === changeMultisig.address) {
          const { bip32Derivation, witnessScript, redeemScript } =
            WalletOperations.getPSBTDataForChangeOutput(wallet as Vault, changeMultisig);
          PSBT.addOutput({ ...output, bip32Derivation, witnessScript, redeemScript });
        } else {
          PSBT.addOutput(output);
        }
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

  static signVaultPSBT = (
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
        let keyPair, internal, index;
        if (input.subPath) {
          const [i, j, k] = input.subPath.split('/');
          internal = parseInt(j);
          index = parseInt(k);
        } else {
          const { subPath } = WalletUtilities.addressToMultiSig(input.address, wallet);
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
        serializedPSBTEnvelop?: undefined;
      }
    | {
        signedPSBT?: undefined;
        serializedPSBTEnvelop: SerializedPSBTEnvelop;
      } => {
    let signingPayload: SigningPayload[] = [];
    let isSigned = false;
    if (signer.isMock && signer.xpriv) {
      // case: if the signer is mock and has an xpriv attached to it, we'll sign the PSBT right away
      const { signedSerializedPSBT } = WalletOperations.signVaultPSBT(
        wallet,
        inputs,
        PSBT.toBase64(),
        signer.xpriv
      );
      PSBT = bitcoinJS.Psbt.fromBase64(signedSerializedPSBT);
      isSigned = true;
    } else {
      if (signer.type === SignerType.TAPSIGNER) {
        const inputsToSign = [];
        for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
          const { subPath, signerPubkeyMap } = WalletUtilities.addressToMultiSig(
            inputs[inputIndex].address,
            wallet as Vault
          );
          const publicKey = signerPubkeyMap.get(signer.xpub);
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
        for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
          const { subPath } = WalletUtilities.addressToMultiSig(
            inputs[inputIndex].address,
            wallet as Vault
          );
          childIndexArray.push({
            subPath,
            inputIdentifier: {
              txId: inputs[inputIndex].txId,
              vout: inputs[inputIndex].vout,
              value: inputs[inputIndex].value,
            },
          });
        }
        signingPayload.push({ payloadTarget: SignerType.POLICY_SERVER, childIndexArray, outgoing });
      }
    }
    if (signer.amfData && signer.amfData.xpub) {
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
    signedPSBT: bitcoinJS.Psbt,
    inputs: InputUTXOs[],
    recipients: {
      address: string;
      amount: number;
    }[],
    network
  ) => {
    const areSignaturesValid = signedPSBT.validateSignaturesOfAllInputs();
    if (!areSignaturesValid) throw new Error('Failed to broadcast: invalid signatures');

    const txHex = signedPSBT.finalizeAllInputs().extractTransaction().toHex();
    const { txid } = await WalletUtilities.broadcastTransaction(txHex, network);
    if (!txid) throw new Error('Failed to broadcast transaction, txid missing');
    if (txid.includes('sendrawtransaction RPC error')) {
      let err;
      try {
        err = txid.split(':')[3].split('"')[1];
      } catch (err) {
        console.log({
          err,
        });
      }
      throw new Error(err);
    }
    WalletOperations.removeConsumedUTXOs(wallet, inputs, txid, recipients); // chip consumed utxos
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
    } else {
      throw new Error('Unable to create transaction: inputs failed at coinselect');
    }
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
        txid?: undefined;
      }
    | {
        serializedPSBTEnvelop?: undefined;
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
      const signers = (wallet as Vault).signers;
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
    } else {
      const { signedPSBT } = WalletOperations.signTransaction(wallet as Wallet, inputs, PSBT);
      const txid = await this.broadcastTransaction(wallet, signedPSBT, inputs, recipients, network);
      return {
        txid,
      };
    }
  };

  static transferST3 = async (
    wallet: Wallet | Vault,
    serializedPSBTEnvelops: SerializedPSBTEnvelop[],
    txPrerequisites: TransactionPrerequisite,
    txnPriority: TxPriority,
    recipients: {
      address: string;
      amount: number;
    }[]
  ): Promise<{
    txid: string;
  }> => {
    const inputs = txPrerequisites[txnPriority].inputs;
    let combinedPSBT: bitcoinJS.Psbt = null;

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
    const network = WalletUtilities.getNetworkByType(wallet.networkType);
    const txid = await this.broadcastTransaction(wallet, combinedPSBT, inputs, recipients, network);
    return {
      txid,
    };
  };
}
