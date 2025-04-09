import { Balances, BIP85Config, UTXO, Transaction } from '.';
import {
  NetworkType,
  WalletType,
  VisibilityType,
  EntityKind,
  ScriptTypes,
  ImportedKeyType,
} from '../enums';

export interface WalletImportDetails {
  importedKey: string;
  importedKeyType: ImportedKeyType;
  derivationPath: string;
}

export interface WalletDerivationDetails {
  instanceNum: number; // instance number of this particular walletType
  mnemonic?: string; // mnemonic of the wallet
  bip85Config?: BIP85Config; // bip85 configuration leading to the derivation path for the corresponding entropy
  xDerivationPath: string; // derivation path of the extended keys belonging to this wallet
}

export interface WalletPresentationData {
  name: string; // name of the wallet
  description: string; // description of the wallet
  visibility: VisibilityType; // visibility of the wallet
}

export interface AddressCache {
  external: {}; // maps index to external address
  internal: {}; // maps index to internal address
}

export interface AddressPubs {
  [address: string]: string; // address to pub matching
}

export interface WalletSpecs {
  xpub: string | null; // wallet's xpub
  xpriv?: string | null; // wallet's xpriv(not available for read-only wallets)
  nextFreeAddressIndex: number; // external-chain free address marker
  nextFreeChangeAddressIndex: number; // internal-chain free address marker
  totalExternalAddresses: number; // total number of external addresses the user generated (starts at 1)
  receivingAddress?: string; // current receiving address(external chain)
  addresses?: AddressCache; // cached addresses
  addressPubs?: AddressPubs; // cached pubs
  confirmedUTXOs: UTXO[]; // utxo set available for use
  unconfirmedUTXOs: UTXO[]; // utxos to arrive
  balances: Balances; // confirmed/unconfirmed balances
  transactions: Transaction[]; // transactions belonging to this wallet
  hasNewUpdates: boolean; // spec vars have a new update?
  lastSynched: number; // wallet's last sync timestamp
}

export interface Wallet {
  id: string; // wallet identifier(derived from xpub)
  entityKind: EntityKind; // Wallet vs Vault identifier
  type: WalletType; // type of wallet
  networkType: NetworkType; // testnet/mainnet
  derivationDetails?: WalletDerivationDetails;
  presentationData: WalletPresentationData;
  specs: WalletSpecs;
  scriptType: ScriptTypes;
  receivingAddress?: string;
}
