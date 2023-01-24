import { SignerPolicy } from 'src/core/services/interfaces';
import {
  ActiveAddresses,
  BIP85Config,
  Balances,
  Transaction,
  TransactionToAddressMapping,
  UTXO,
  WalletImportedAddresses,
} from '.';
import {
  EntityKind,
  NetworkType,
  ScriptTypes,
  SignerStorage,
  SignerType,
  VaultType,
  XpubTypes,
} from '../enums';

import { WalletPresentationData } from './wallet';

export interface VaultPresentationData extends WalletPresentationData {}

export interface VaultSpecs {
  xpubs: string[]; // signers' xpubs
  nextFreeAddressIndex: number; // external-chain free address marker
  nextFreeChangeAddressIndex: number; // internal-chain free address marker
  activeAddresses: ActiveAddresses; // addresses being actively used by this vault
  importedAddresses: WalletImportedAddresses;
  confirmedUTXOs: UTXO[]; // utxo set available for use
  unconfirmedUTXOs: UTXO[]; // utxos to arrive
  balances: Balances; // confirmed/unconfirmed balances
  transactions: Transaction[]; // transactions belonging to this vault
  newTransactions?: Transaction[]; // new transactions arrived during the current sync
  lastSynched: number; // vault's last sync timestamp
  hasNewTxn?: boolean; // indicates new txns
  txIdCache: { [txid: string]: boolean };
  transactionMapping: TransactionToAddressMapping[];
  transactionNote: {
    [txId: string]: string;
  };
  // transactionsMeta?: TransactionMetaData[];
}

export interface VaultScheme {
  m: number; // threshold number of signatures required
  n: number; // total number of xpubs
}

export type XpubDetailsType = {
  [key in XpubTypes as string]: { xpub: string; derivationPath: string };
};
export interface VaultSigner {
  signerId: string;
  type: SignerType;
  storageType: SignerStorage;
  isMock?: boolean;
  xpub: string;
  xpriv?: string;
  signerName?: string;
  signerDescription?: string;
  bip85Config?: BIP85Config;
  lastHealthCheck: Date;
  addedOn: Date;
  registered: boolean;
  signerPolicy?: SignerPolicy;
  masterFingerprint: string;
  derivationPath: string;
  xpubDetails: XpubDetailsType;
}

export interface Vault {
  id: string; // vault identifier(derived from xpub)
  entityKind: EntityKind; // Vault vs Wallet identifier
  type: VaultType; // type of vault
  networkType: NetworkType; // testnet/mainnet
  isUsable: boolean; // true if vault is usable
  isMultiSig: boolean; // true
  scheme: VaultScheme; // scheme of vault(m of n)
  signers: VaultSigner[];
  presentationData: VaultPresentationData;
  specs: VaultSpecs;
  archived: boolean;
  scriptType: ScriptTypes;
}
