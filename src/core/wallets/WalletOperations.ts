import * as bitcoinJS from 'bitcoinjs-lib';
import * as bip32 from 'bip32';
import crypto from 'crypto';
import coinselect from 'coinselect';
import coinselectSplit from 'coinselect/split';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
const ECPair = ECPairFactory(ecc);
import WalletUtilities from './WalletUtilities';
import config from '../config';
import idx from 'idx';
import {
  Wallet,
  ActiveAddressAssignee,
  ActiveAddresses,
  AverageTxFees,
  Balances,
  DonationWallet,
  Gift,
  InputUTXOs,
  MultiSigWallet,
  Transaction,
  TransactionPrerequisite,
  TransactionPrerequisiteElements,
  UTXO,
  TransactionToAddressMapping,
} from './interfaces/interface';
import {
  WalletType,
  DerivationPurpose,
  GiftStatus,
  GiftThemeId,
  GiftType,
  TxPriority,
} from './interfaces/enum';
export default class WalletOperations {
  static getNextFreeExternalAddress = (
    wallet: Wallet | MultiSigWallet
  ): { updatedWallet: Wallet | MultiSigWallet; receivingAddress: string } => {
    // TODO: either remove ActiveAddressAssignee or reintroduce it(realm compatibility issue)
    let receivingAddress;
    const network = WalletUtilities.getNetworkByType(wallet.derivationDetails.networkType);
    if ((wallet as MultiSigWallet).specs.is2FA)
      receivingAddress = WalletUtilities.createMultiSig(
        {
          primary: wallet.specs.xpub,
          secondary: (wallet as MultiSigWallet).specs.xpubs.secondary,
          bithyve: (wallet as MultiSigWallet).specs.xpubs.bithyve,
        },
        2,
        network,
        wallet.specs.nextFreeAddressIndex,
        false
      ).address;
    else {
      const purpose = [WalletType.SWAN, WalletType.IMPORTED].includes(wallet.type)
        ? DerivationPurpose.BIP84
        : DerivationPurpose.BIP49;
      receivingAddress = WalletUtilities.getAddressByIndex(
        wallet.specs.xpub,
        false,
        wallet.specs.nextFreeAddressIndex,
        network,
        purpose
      );
    }

    wallet.specs.activeAddresses.external[receivingAddress] = wallet.specs.nextFreeAddressIndex;
    wallet.specs.nextFreeAddressIndex++;
    wallet.specs.receivingAddress = receivingAddress;
    return {
      updatedWallet: wallet,
      receivingAddress,
    };
  };

  static syncGapLimit = async (wallet: Wallet | MultiSigWallet) => {
    let tryAgain = false;
    const hardGapLimit = 10;
    const network = WalletUtilities.getNetworkByType(wallet.derivationDetails.networkType);

    const purpose = [WalletType.SWAN, WalletType.IMPORTED].includes(wallet.type)
      ? DerivationPurpose.BIP84
      : DerivationPurpose.BIP49;
    let externalAddress: string;
    if ((wallet as MultiSigWallet).specs.is2FA)
      externalAddress = WalletUtilities.createMultiSig(
        {
          primary: wallet.specs.xpub,
          secondary: (wallet as MultiSigWallet).specs.xpubs.secondary,
          bithyve: (wallet as MultiSigWallet).specs.xpubs.bithyve,
        },
        2,
        network,
        wallet.specs.nextFreeAddressIndex + hardGapLimit - 1,
        false
      ).address;
    else
      externalAddress = WalletUtilities.getAddressByIndex(
        wallet.specs.xpub,
        false,
        wallet.specs.nextFreeAddressIndex + hardGapLimit - 1,
        network,
        purpose
      );

    let internalAddress: string;
    if ((wallet as MultiSigWallet).specs.is2FA)
      internalAddress = WalletUtilities.createMultiSig(
        {
          primary: wallet.specs.xpub,
          secondary: (wallet as MultiSigWallet).specs.xpubs.secondary,
          bithyve: (wallet as MultiSigWallet).specs.xpubs.bithyve,
        },
        2,
        network,
        wallet.specs.nextFreeChangeAddressIndex + hardGapLimit - 1,
        true
      ).address;
    else
      internalAddress = WalletUtilities.getAddressByIndex(
        wallet.specs.xpub,
        true,
        wallet.specs.nextFreeChangeAddressIndex + hardGapLimit - 1,
        network,
        purpose
      );

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
    wallet: Wallet | MultiSigWallet,
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
    wallets: (Wallet | MultiSigWallet | DonationWallet)[],
    network: bitcoinJS.networks.Network,
    hardRefresh?: boolean
  ): Promise<{
    synchedWallets: (Wallet | MultiSigWallet | DonationWallet)[];
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
        transactionsNote: {
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
      const purpose = [WalletType.SWAN, WalletType.IMPORTED].includes(wallet.type)
        ? DerivationPurpose.BIP84
        : DerivationPurpose.BIP49;
      const ownedAddresses = []; // owned address mapping
      // owned addresses are used for apt tx categorization and transfer amount calculation

      const hardGapLimit = 5; // hard refresh gap limit
      const externalAddresses: { [address: string]: number } = {}; // all external addresses(till closingExtIndex)
      for (let itr = 0; itr < wallet.specs.nextFreeAddressIndex + hardGapLimit; itr++) {
        let address: string;
        if ((wallet as MultiSigWallet).specs.is2FA)
          address = WalletUtilities.createMultiSig(
            {
              primary: wallet.specs.xpub,
              secondary: (wallet as MultiSigWallet).specs.xpubs.secondary,
              bithyve: (wallet as MultiSigWallet).specs.xpubs.bithyve,
            },
            2,
            network,
            itr,
            false
          ).address;
        else
          address = WalletUtilities.getAddressByIndex(
            wallet.specs.xpub,
            false,
            itr,
            network,
            purpose
          );
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
        if ((wallet as MultiSigWallet).specs.is2FA)
          address = WalletUtilities.createMultiSig(
            {
              primary: wallet.specs.xpub,
              secondary: (wallet as MultiSigWallet).specs.xpubs.secondary,
              bithyve: (wallet as MultiSigWallet).specs.xpubs.bithyve,
            },
            2,
            network,
            itr,
            true
          ).address;
        else
          address = WalletUtilities.getAddressByIndex(
            wallet.specs.xpub,
            true,
            itr,
            network,
            purpose
          );
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
        transactionsNote: wallet.specs.transactionsNote,
        walletType: wallet.type,
        walletName: wallet.presentationData.walletName,
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

      const purpose = [WalletType.SWAN, WalletType.IMPORTED].includes(wallet.type)
        ? DerivationPurpose.BIP84
        : DerivationPurpose.BIP49;

      // update utxo sets and balances
      const balances: Balances = {
        confirmed: 0,
        unconfirmed: 0,
      };
      const confirmedUTXOs = [];
      const unconfirmedUTXOs = [];
      for (const utxo of UTXOs) {
        if (wallet.type === WalletType.TEST) {
          if (
            utxo.address ===
            WalletUtilities.getAddressByIndex(wallet.specs.xpub, false, 0, network, purpose)
          ) {
            confirmedUTXOs.push(utxo); // testnet-utxo from BH-testnet-faucet is treated as an spendable exception
            balances.confirmed += utxo.value;
            continue;
          }
        }

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

      if ((wallet as MultiSigWallet).specs.is2FA)
        wallet.specs.receivingAddress = WalletUtilities.createMultiSig(
          {
            primary: wallet.specs.xpub,
            secondary: (wallet as MultiSigWallet).specs.xpubs.secondary,
            bithyve: (wallet as MultiSigWallet).specs.xpubs.bithyve,
          },
          2,
          network,
          wallet.specs.nextFreeAddressIndex,
          false
        ).address;
      else
        wallet.specs.receivingAddress = WalletUtilities.getAddressByIndex(
          wallet.specs.xpub,
          false,
          wallet.specs.nextFreeAddressIndex,
          network,
          purpose
        );

      // find tx delta(missing txs): hard vs soft refresh
      // if( hardRefresh ){
      //   if( wallet.transactionMapping && transactionMapping ){
      //     const deltaTxs = WalletUtilities.findTxDelta( wallet.transactionMapping, transactionMapping, transactions )
      //     if( deltaTxs.length ) txsFound.push( ...deltaTxs )
      //   } else txsFound.push( ...transactions )
      // }
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
    wallet: Wallet,
    consumedUTXOs: { [txid: string]: InputUTXOs },
    txid: string,
    recipients: {
      id?: string;
      address: string;
      amount: number;
      name?: string;
    }[]
  ) => {
    const network = WalletUtilities.getNetworkByType(wallet.derivationDetails.networkType);

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

    const purpose = [WalletType.SWAN, WalletType.IMPORTED].includes(wallet.type)
      ? DerivationPurpose.BIP84
      : DerivationPurpose.BIP49;
    for (const consumedUTXO of Object.values(consumedUTXOs)) {
      let found = false;
      // is out of bound external address?
      for (let itr = 0; itr < wallet.specs.nextFreeAddressIndex; itr++) {
        let address: string;
        if ((wallet as MultiSigWallet).specs.is2FA)
          address = WalletUtilities.createMultiSig(
            {
              primary: wallet.specs.xpub,
              secondary: (wallet as MultiSigWallet).specs.xpubs.secondary,
              bithyve: (wallet as MultiSigWallet).specs.xpubs.bithyve,
            },
            2,
            network,
            itr,
            false
          ).address;
        else
          address = WalletUtilities.getAddressByIndex(
            wallet.specs.xpub,
            false,
            itr,
            network,
            purpose
          );

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
          if ((wallet as MultiSigWallet).specs.is2FA)
            address = WalletUtilities.createMultiSig(
              {
                primary: wallet.specs.xpub,
                secondary: (wallet as MultiSigWallet).specs.xpubs.secondary,
                bithyve: (wallet as MultiSigWallet).specs.xpubs.bithyve,
              },
              2,
              network,
              itr,
              true
            ).address;
          else
            address = WalletUtilities.getAddressByIndex(
              wallet.specs.xpub,
              true,
              itr,
              network,
              purpose
            );

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

    if ((wallet as MultiSigWallet).specs.is2FA)
      changeAddress = WalletUtilities.createMultiSig(
        {
          primary: wallet.specs.xpub,
          secondary: (wallet as MultiSigWallet).specs.xpubs.secondary,
          bithyve: (wallet as MultiSigWallet).specs.xpubs.bithyve,
        },
        2,
        network,
        wallet.specs.nextFreeChangeAddressIndex,
        true
      ).address;
    else
      changeAddress = WalletUtilities.getAddressByIndex(
        wallet.specs.xpub,
        true,
        wallet.specs.nextFreeChangeAddressIndex,
        network,
        purpose
      );

    activeInternalAddresses[changeAddress] = wallet.specs.nextFreeChangeAddressIndex;
    wallet.specs.nextFreeChangeAddressIndex++;
  };

  static removeConsumedUTXOs = (
    wallet: Wallet | MultiSigWallet,
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
    wallet: Wallet,
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
    wallet: Wallet | MultiSigWallet,
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
    wallet: Wallet | MultiSigWallet,
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

  static createTransaction = async (
    wallet: Wallet | MultiSigWallet,
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: TransactionPrerequisiteElements,
    nSequence?: number
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

      const network = WalletUtilities.getNetworkByType(wallet.derivationDetails.networkType);

      // console.log({ inputs, outputs });
      const PSBT: bitcoinJS.Psbt = new bitcoinJS.Psbt({
        network,
      });

      for (const input of inputs) {
        const privateKey = WalletUtilities.addressToPrivateKey(input.address, wallet);
        const keyPair = WalletUtilities.getKeyPair(privateKey, network);
        const p2wpkh = bitcoinJS.payments.p2wpkh({
          pubkey: keyPair.publicKey,
          network,
        });
        const p2sh = bitcoinJS.payments.p2sh({
          redeem: p2wpkh,
        });

        PSBT.addInput({
          hash: input.txId,
          index: input.vout,
          sequence: nSequence,
          witnessUtxo: {
            script: p2sh.output,
            value: input.value,
          },
          redeemScript: p2wpkh.output,
        });
      }

      const sortedOuts = await WalletUtilities.sortOutputs(
        wallet,
        outputs,
        wallet.specs.nextFreeChangeAddressIndex,
        network
      );

      for (const output of sortedOuts)
        PSBT.addOutput({
          address: output.address,
          value: output.value,
        });

      return {
        PSBT,
      };
    } catch (err) {
      throw new Error(`Transaction creation failed: ${err.message}`);
    }
  };

  static signTransaction = (
    wallet: Wallet | MultiSigWallet,
    inputs: any,
    PSBT: bitcoinJS.Psbt,
    witnessScript?: any
  ): {
    signedPSBT: bitcoinJS.Psbt;
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }> | null;
  } => {
    try {
      let vin = 0;
      const childIndexArray = [];
      const network = WalletUtilities.getNetworkByType(wallet.derivationDetails.networkType);

      for (const input of inputs) {
        let keyPair, redeemScript;
        if ((wallet as MultiSigWallet).specs.is2FA) {
          const { multiSig, primaryPriv, childIndex } =
            WalletUtilities.signingEssentialsForMultiSig(wallet as MultiSigWallet, input.address);

          keyPair = bip32.fromBase58(primaryPriv, network);
          // redeemScript = Buffer.from( multiSig.scripts.redeem, 'hex' )
          // witnessScript = Buffer.from( multiSig.scripts.witness, 'hex' )
          childIndexArray.push({
            childIndex,
            inputIdentifier: {
              txId: input.txId,
              vout: input.vout,
              value: input.value,
            },
          });
        } else {
          const privateKey = WalletUtilities.addressToPrivateKey(input.address, wallet);

          keyPair = WalletUtilities.getKeyPair(privateKey, network);
          // redeemScript = WalletUtilities.getP2SH( keyPair, network ).redeem.output
        }

        PSBT.signInput(vin, keyPair);
        vin++;
      }

      return {
        signedPSBT: PSBT,
        childIndexArray: childIndexArray.length ? childIndexArray : null,
      };
    } catch (err) {
      throw new Error(`Transaction signing failed: ${err.message}`);
    }
  };

  static multiSignTransaction = (
    wallet: MultiSigWallet,
    inputs: any,
    PSBT: bitcoinJS.Psbt
  ): {
    signedPSBT: bitcoinJS.Psbt;
  } => {
    let vin = 0;

    if (!wallet.specs.xprivs.secondary)
      throw new Error('Multi-sign transaction failed: secondary xpriv missing');
    const network = WalletUtilities.getNetworkByType(wallet.derivationDetails.networkType);

    inputs.forEach((input) => {
      const { secondaryPriv } = WalletUtilities.signingEssentialsForMultiSig(wallet, input.address);

      const keyPair = bip32.fromBase58(secondaryPriv, network);
      // const redeemScript = Buffer.from( multiSig.scripts.redeem, 'hex' )
      // const witnessScript = Buffer.from( multiSig.scripts.witness, 'hex' )

      PSBT.signInput(vin, keyPair);
      vin += 1;
    });

    return {
      signedPSBT: PSBT,
    };
  };

  static transferST1 = async (
    wallet: Wallet | MultiSigWallet,
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
    wallet: Wallet | MultiSigWallet,
    walletId: string,
    txPrerequisites: TransactionPrerequisite,
    txnPriority: TxPriority,
    network: bitcoinJS.networks.Network,
    recipients: {
      id?: string;
      address: string;
      amount: number;
      name?: string;
    }[],
    token?: number,
    customTxPrerequisites?: TransactionPrerequisiteElements,
    nSequence?: number
  ): Promise<{
    txid: string;
  }> => {
    const { PSBT } = await WalletOperations.createTransaction(
      wallet,
      txPrerequisites,
      txnPriority,
      customTxPrerequisites,
      nSequence
    );

    let inputs;
    if (txnPriority === TxPriority.CUSTOM && customTxPrerequisites)
      inputs = customTxPrerequisites.inputs;
    else inputs = txPrerequisites[txnPriority].inputs;

    const { signedPSBT, childIndexArray } = WalletOperations.signTransaction(wallet, inputs, PSBT);
    let txHex;

    if ((wallet as MultiSigWallet).specs.is2FA) {
      if (token) {
        const serializedPSBT = PSBT.toBase64();
        const { signedTxHex } = await WalletUtilities.getSecondSignature(
          walletId,
          token,
          serializedPSBT,
          childIndexArray
        );
        txHex = signedTxHex;
      } else if ((wallet as MultiSigWallet).specs.xprivs.secondary) {
        const { signedPSBT } = WalletOperations.multiSignTransaction(
          wallet as MultiSigWallet,
          inputs,
          PSBT
        );
        txHex = signedPSBT.finalizeAllInputs().extractTransaction().toHex();
        delete (wallet as MultiSigWallet).specs.xprivs.secondary;
      } else throw new Error('Multi-sig transaction failed: token/secondary-key missing');
    } else {
      txHex = signedPSBT.finalizeAllInputs().extractTransaction().toHex();
    }

    const { txid } = await WalletUtilities.broadcastTransaction(txHex, network);
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

    if (txid) {
      WalletOperations.removeConsumedUTXOs(wallet, inputs, txid, recipients); // chip consumed utxos
    } else throw new Error('Failed to broadcast transaction, txid missing');
    return {
      txid,
    };
  };
}
