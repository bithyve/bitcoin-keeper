/* eslint-disable no-unused-vars */
import { InheritanceKeyInfo, SignerPolicy } from 'src/services/interfaces';
import { BIP85Config, Balances, Transaction, UTXO } from '.';
import {
  EntityKind,
  NetworkType,
  ScriptTypes,
  SignerStorage,
  SignerType,
  VaultType,
  XpubTypes,
} from '../enums';

import { AddressCache, AddressPubs, WalletPresentationData } from './wallet';

export interface VaultPresentationData extends WalletPresentationData {}

export interface VaultSpecs {
  xpubs: string[]; // signers' xpubs
  nextFreeAddressIndex: number; // external-chain free address marker
  nextFreeChangeAddressIndex: number; // internal-chain free address marker
  receivingAddress?: string; // current receiving address(external chain)
  addresses?: AddressCache; // cached addresses
  addressPubs?: AddressPubs; // cached pubs
  confirmedUTXOs: UTXO[]; // utxo set available for use
  unconfirmedUTXOs: UTXO[]; // utxos to arrive
  balances: Balances; // confirmed/unconfirmed balances
  transactions: Transaction[]; // transactions belonging to this wallet
  txNote: { [txId: string]: string }; // transaction note
  hasNewUpdates: boolean; // spec vars have a new update?
  lastSynched: number; // vault's last sync timestamp
}

export interface VaultScheme {
  m: number; // threshold number of signatures required
  n: number; // total number of xpubs
}

export type XpubDetailsType = {
  [key in XpubTypes as string]: { xpub: string; derivationPath: string; xpriv?: string };
};

export type signerXpubs = {
  [key in XpubTypes as string]: { xpub: string; derivationPath: string; xpriv?: string }[];
};

export type DeviceInfo = {
  registeredWallet?: string;
};
export interface Signer {
  type: SignerType;
  storageType: SignerStorage;
  isMock?: boolean;
  masterFingerprint: string;
  signerXpubs: signerXpubs;
  signerName?: string;
  signerDescription?: string;
  lastHealthCheck: Date;
  addedOn: Date;
  bip85Config?: BIP85Config;
  signerPolicy?: SignerPolicy;
  inheritanceKeyInfo?: InheritanceKeyInfo;
  hidden: boolean;
}

export type RegisteredVaultInfo = {
  [vaultId: string]: { registered: boolean; registrationInfo?: string };
};

export interface VaultSigner {
  masterFingerprint: string;
  xpub: string;
  xpriv?: string;
  xfp: string;
  derivationPath: string;
  vaultInfo?: RegisteredVaultInfo;
}

export interface Vault {
  id: string; // vault identifier(derived from xpub)
  shellId: string;
  entityKind: EntityKind; // Vault vs Wallet identifier
  type: VaultType; // type of vault
  networkType: NetworkType; // testnet/mainnet
  isUsable: boolean; // true if vault is usable
  isMultiSig: boolean; // true
  scheme: VaultScheme; // scheme of vault(m of n)
  signers: VaultSigner[]; // signers of the vault
  presentationData: VaultPresentationData;
  specs: VaultSpecs;
  archived: boolean;
  scriptType: ScriptTypes;
  collaborativeWalletId?: string; // collaborative wallet id (wallet cosigners (KSDs))
}
