import {
  ActiveAddresses,
  Balances,
  BIP85Config,
  TransactionToAddressMapping,
  UTXO,
  WalletImportedAddresses,
  Transaction,
} from '.';
import { NetworkType, WalletType, VisibilityType, EntityKind, ScriptTypes } from '../enums';

export interface WalletDerivationDetails {
  instanceNum: number; // instance number of this particular walletType
  mnemonic: string; // mnemonic of the wallet
  bip85Config?: BIP85Config; // bip85 configuration leading to the derivation path for the corresponding entropy
  xDerivationPath: string; // derivation path of the extended keys belonging to this wallet
}

export interface WalletPresentationData {
  name: string; // name of the wallet
  description: string; // description of the wallet
  visibility: VisibilityType; // visibility of the wallet
  shell: number; // shell id
}

export interface TransferPolicy {
  id: string;
  threshold: number;
}

export interface WalletSpecs {
  xpub: string | null; // wallet's xpub
  xpriv?: string | null; // wallet's xpriv(not available for read-only wallets)
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
  transactionNote: {
    [txId: string]: string;
  };

  // transactionsMeta?: TransactionMetaData[];
}

export interface Wallet {
  id: string; // wallet identifier(derived from xpub)
  entityKind: EntityKind; // Wallet vs Vault identifier
  type: WalletType; // type of wallet
  networkType: NetworkType; // testnet/mainnet
  isUsable: boolean; // true if wallet is usable
  derivationDetails?: WalletDerivationDetails;
  presentationData: WalletPresentationData;
  specs: WalletSpecs;
  scriptType: ScriptTypes;
  transferPolicy: TransferPolicy;
}

export interface TriggerPolicy {
  id: string;
  date: string;
  specifications: {};
  version: string;
}
