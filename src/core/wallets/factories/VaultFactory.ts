import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';

import {
  EntityKind,
  NetworkType,
  SignerType,
  VaultType,
  VisibilityType,
  WalletType,
} from '../enums';
import {
  Vault,
  VaultPresentationData,
  VaultScheme,
  VaultSigner,
  VaultSpecs,
} from '../interfaces/vault';
import {
  decrypt,
  encrypt,
  generateEncryptionKey,
  hash256,
} from 'src/core/services/operations/encryption';

import BIP85 from '../operations/BIP85';
import { BIP85Config } from '../interfaces';
import WalletUtilities from '../operations/utils';
import config from './../../config';

const crypto = require('crypto');

export const generateVault = ({
  type,
  vaultShellId,
  vaultName,
  vaultDescription,
  scheme,
  signers,
  networkType,
}: {
  type: VaultType;
  vaultShellId: string;
  vaultName: string;
  vaultDescription: string;
  scheme: VaultScheme;
  signers: VaultSigner[];
  networkType: NetworkType;
}): Vault => {
  const network = WalletUtilities.getNetworkByType(networkType);

  const xpubs = signers.map((signer) => signer.xpub);
  const fingerprints = [];
  xpubs.forEach((xpub) =>
    fingerprints.push(WalletUtilities.getFingerprintFromExtendedKey(xpub, network))
  );

  const hashedFingerprints = hash256(fingerprints.join(''));
  const id = hashedFingerprints.slice(hashedFingerprints.length - fingerprints[0].length);

  const presentationData: VaultPresentationData = {
    name: vaultName,
    description: vaultDescription,
    visibility: VisibilityType.DEFAULT,
  };
  const { vac } = generateVAC();

  const specs: VaultSpecs = {
    xpubs: xpubs,
    activeAddresses: {
      external: {},
      internal: {},
    },
    importedAddresses: {},
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    confirmedUTXOs: [],
    unconfirmedUTXOs: [],
    balances: {
      confirmed: 0,
      unconfirmed: 0,
    },
    transactions: [],
    lastSynched: 0,
    txIdCache: {},
    transactionMapping: [],
    transactionNote: {},
  };

  const vault: Vault = {
    id,
    vaultShellId,
    entityKind: EntityKind.VAULT,
    type,
    networkType,
    isUsable: true,
    isMultiSig: true,
    scheme,
    signers,
    presentationData,
    specs,
    VAC: vac,
    archived: false,
  };

  return vault;
};

export const generateMobileKey = async (
  primaryMnemonic: string,
  networkType: NetworkType
): Promise<{
  bip85Config: BIP85Config;
  xpub: string;
  xpriv: string;
  derivationPath: string;
  masterFingerprint: string;
}> => {
  const DEFAULT_INSTNACE = 0;
  const bip85Config = BIP85.generateBIP85Configuration(WalletType.MOBILE_KEY, DEFAULT_INSTNACE);
  const entropy = await BIP85.bip39MnemonicToEntropy(bip85Config.derivationPath, primaryMnemonic);
  const mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const masterFingerprint = WalletUtilities.getFingerprintFromSeed(seed);

  const DEFAULT_CHILD_PATH = 0;
  let xDerivationPath = WalletUtilities.getDerivationPath(
    EntityKind.WALLET,
    networkType,
    DEFAULT_CHILD_PATH
  );

  const network = WalletUtilities.getNetworkByType(networkType);
  const extendedKeys = WalletUtilities.generateExtendedKeyPairFromSeed(
    seed.toString('hex'),
    network,
    xDerivationPath
  );
  return {
    bip85Config,
    xpub: extendedKeys.xpub,
    xpriv: extendedKeys.xpriv,
    derivationPath: xDerivationPath,
    masterFingerprint,
  };
};

export const generateSeedWordsKey = (
  mnemonic: string,
  networkType: NetworkType
): {
  xpub: string;
  xpriv: string;
  derivationPath: string;
  masterFingerprint: string;
} => {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const masterFingerprint = WalletUtilities.getFingerprintFromSeed(seed);

  const DEFAULT_CHILD_PATH = 0;
  let xDerivationPath = WalletUtilities.getDerivationPath(
    EntityKind.WALLET,
    networkType,
    DEFAULT_CHILD_PATH
  );

  const network = WalletUtilities.getNetworkByType(networkType);
  const extendedKeys = WalletUtilities.generateExtendedKeyPairFromSeed(
    seed.toString('hex'),
    network,
    xDerivationPath
  );
  return {
    xpub: extendedKeys.xpub,
    xpriv: extendedKeys.xpriv,
    derivationPath: xDerivationPath,
    masterFingerprint,
  };
};

export const generateMockExtendedKey = (
  entity: EntityKind,
  networkType = NetworkType.TESTNET
): {
  xpriv: string;
  xpub: string;
  derivationPath: string;
  masterFingerprint: string;
} => {
  const randomBytes = crypto.randomBytes(16);
  const mockMnemonic = bip39.entropyToMnemonic(randomBytes.toString('hex'));
  const seed = bip39.mnemonicToSeedSync(mockMnemonic);
  const masterFingerprint = WalletUtilities.getFingerprintFromSeed(seed);
  const randomWalletNumber = Math.floor(Math.random() * 10e5);
  let xDerivationPath = WalletUtilities.getDerivationPath(entity, networkType, randomWalletNumber);
  const network = WalletUtilities.getNetworkByType(networkType);
  const extendedKeys = WalletUtilities.generateExtendedKeyPairFromSeed(
    seed.toString('hex'),
    network,
    xDerivationPath
  );
  return { ...extendedKeys, derivationPath: xDerivationPath, masterFingerprint };
};

export const MOCK_SD_MNEMONIC_MAP = {
  TAPSIGNER: 'result pink oyster iron journey social winter pattern cricket core leader behave',
  COLDCARD: 'keen credit hold warfare nasty address poverty roast novel ranch system nasty',
  LEDGER: 'hold address journey ranch result poverty cricket keen system core iron winter',
};

export const generateMockExtendedKeyForSigner = (
  entity: EntityKind,
  signer: SignerType,
  networkType = NetworkType.TESTNET
) => {
  const mockMnemonic = MOCK_SD_MNEMONIC_MAP[signer];
  const seed = bip39.mnemonicToSeedSync(mockMnemonic);
  const masterFingerprint = WalletUtilities.getFingerprintFromSeed(seed);
  const xDerivationPath = WalletUtilities.getDerivationPath(entity, networkType, 123);
  const network = WalletUtilities.getNetworkByType(networkType);
  const extendedKeys = WalletUtilities.generateExtendedKeyPairFromSeed(
    seed.toString('hex'),
    network,
    xDerivationPath
  );
  return { ...extendedKeys, derivationPath: xDerivationPath, masterFingerprint };
};

export const generateIDForVAC = (str: string) => {
  return hash256(str);
};

export const generateVAC = (entropy?: string): { vac: string; vacId: string } => {
  const vac = generateEncryptionKey(entropy);
  const vacId = generateIDForVAC(vac);
  return { vac, vacId };
};

export const generateKeyFromXpub = (
  xpub: string,
  network: bitcoinJS.networks.Network = bitcoinJS.networks.bitcoin
) => {
  const child = WalletUtilities.generateChildFromExtendedKey(
    xpub,
    network,
    config.VAC_CHILD_INDEX,
    true
  );
  return generateEncryptionKey(child);
};

export const encryptVAC = (vac: string, xpubs: string[]) => {
  let encrytedVac = vac;
  xpubs = xpubs.sort();
  xpubs.forEach((xpub) => {
    const networkType = WalletUtilities.getNetworkFromXpub(xpub);
    const network = WalletUtilities.getNetworkByType(networkType);
    const key = generateKeyFromXpub(xpub, network);
    encrytedVac = encrypt(key, encrytedVac);
  });
  return encrytedVac;
};

export const decryptVAC = (encryptedVac: string, xpubs: string[]) => {
  let decryptedVAC = encryptedVac;
  xpubs = xpubs.sort().reverse();
  xpubs.forEach((xpub) => {
    const networkType = WalletUtilities.getNetworkFromXpub(xpub);
    const network = WalletUtilities.getNetworkByType(networkType);
    const key = generateKeyFromXpub(xpub, network);
    decryptedVAC = decrypt(key, decryptedVAC);
  });
  return decryptedVAC;
};
