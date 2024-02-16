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

export interface Signer {
  // Represents a h/w or s/w wallet(Signer)
  // Rel: Signer hosts multiple VaultSigners(key), diff derivation paths
  // Note: Assisted Keys(IKS and SS) can only have one key(VaultSigner) per Signer
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
  signerPolicy?: SignerPolicy; // Signing Server's Signer Policy
  inheritanceKeyInfo?: InheritanceKeyInfo; // IKS config and policy
  hidden: boolean;
}

export type RegisteredVaultInfo = {
  vaultId: string;
  registered: boolean;
  registrationInfo?: string;
};

export interface VaultSigner {
  // Represents xpub(Extended Key) belonging to one of the Signers,
  // Rel: VaultSigner(Extended Key) could only belong to one Signer, and is an active part of a Vault(s)
  masterFingerprint: string;
  xpub: string;
  xpriv?: string;
  xfp: string;
  derivationPath: string;
  registeredVaults?: RegisteredVaultInfo[];
}

export interface Vault {
  // Represents a Vault
  // Rel: Created using multiple VaultSigners(Extended Keys)
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
