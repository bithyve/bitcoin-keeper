import {
  ActiveAddresses,
  Balances,
  BIP85Config,
  TransactionToAddressMapping,
  UTXO,
  WalletImportedAddresses,
  Transaction,
} from '.';
import { NetworkType, WalletType, WalletVisibility } from '../enums';

export interface WalletDerivationDetails {
  instanceNum: number; // instance number of this particular walletType
  mnemonic: string; // mnemonic of the wallet
  bip85Config?: BIP85Config; // bip85 configuration leading to the derivation path for the corresponding entropy
  xDerivationPath: string; // derivation path of the extended keys belonging to this wallet
}

export interface WalletPresentationData {
  walletName: string; // name of the wallet
  walletDescription: string; // description of the wallet
  walletVisibility: WalletVisibility; // visibility of the wallet
}

export interface WalletSpecs {
  xpub: string | null; // wallet's xpub (primary for multi-sig wallets)
  xpriv?: string | null; // wallet's xpriv (primary for multi-sig wallets)
  receivingAddress: string; // current external address
  nextFreeAddressIndex: number; // external-chain free address marker
  nextFreeChangeAddressIndex: number; // internal-chain free address marker
  activeAddresses: ActiveAddresses; // addresses being actively used by this wallet
  importedAddresses: WalletImportedAddresses;
  confirmedUTXOs: UTXO[]; // utxo set available for use
  unconfirmedUTXOs: UTXO[]; // utxos to arrive
  balances: Balances; // confirmed/unconfirmed balances
  transactions: Transaction[]; // transactions belonging to this wallet
  newTransactions?: Transaction[]; // new transactions arrived during the current sync
  lastSynched: number; // wallet's last sync timestamp
  hasNewTxn?: boolean; // indicates new txns
  txIdCache: { [txid: string]: boolean };
  transactionMapping: TransactionToAddressMapping[];
  transactionsNote: {
    [txId: string]: string;
  };
  // transactionsMeta?: TransactionMetaData[];
}

export interface MultiSigWalletSpecs extends WalletSpecs {
  is2FA: boolean; // is2FA enabled
  xpubs: {
    // additional xpubs for multi-sig
    secondary: string;
    bithyve: string;
  };
  xprivs: {
    // additional xpirvs for multi-sig
    secondary?: string;
  };
}

export interface Wallet {
  id: string; // wallet identifier(derived from xpub)
  walletShellId: string; // identifier of the wallet shell that the wallet belongs
  type: WalletType; // type of wallet
  networkType: NetworkType; // testnet/mainnet
  isUsable: boolean; // true if wallet is usable
  derivationDetails?: WalletDerivationDetails;
  presentationData: WalletPresentationData;
  specs: WalletSpecs;
}

export interface MultiSigWallet extends Wallet {
  specs: MultiSigWalletSpecs;
}

export interface TriggerPolicy {
  id: string;
  date: string;
  specifications: {};
  version: string;
}

export interface WalletShell {
  id: string;
  walletInstances: { [walletType: string]: number }; // various wallet types mapped to corresponding number of instances
  triggerPolicyId?: string;
}
