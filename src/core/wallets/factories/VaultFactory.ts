import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';

import { generateEncryptionKey, generateKey, hash256 } from 'src/services/operations/encryption';
import {
  EntityKind,
  NetworkType,
  ScriptTypes,
  SignerType,
  VaultType,
  VisibilityType,
} from '../enums';
import {
  Signer,
  Vault,
  VaultPresentationData,
  VaultScheme,
  VaultSigner,
  VaultSpecs,
} from '../interfaces/vault';

import WalletUtilities from '../operations/utils';
import config from 'src/core/config';
import WalletOperations from '../operations';
import {
  CosignersMapUpdate,
  CosignersMapUpdateAction,
  IKSCosignersMapUpdate,
  IKSCosignersMapUpdateAction,
} from 'src/services/interfaces';
import SigningServer from 'src/services/operations/SigningServer';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';

const crypto = require('crypto');

const STANDARD_VAULT_SCHEME = [
  { m: 1, n: 1 },
  { m: 2, n: 3 },
  { m: 3, n: 5 },
];

export const generateVaultId = (signers, networkType, scheme) => {
  const network = WalletUtilities.getNetworkByType(networkType);
  const xpubs = signers.map((signer) => signer.xpub).sort();
  const fingerprints = [];
  xpubs.forEach((xpub) =>
    fingerprints.push(WalletUtilities.getFingerprintFromExtendedKey(xpub, network))
  );
  STANDARD_VAULT_SCHEME.forEach((s) => {
    if (s.m !== scheme.m || s.n !== scheme.n) {
      fingerprints.push(JSON.stringify(scheme));
    }
  });
  const hashedFingerprints = hash256(fingerprints.join(''));
  const id = hashedFingerprints.slice(hashedFingerprints.length - fingerprints[0].length);
  return id;
};

export const generateVault = async ({
  type,
  vaultName,
  vaultDescription,
  scheme,
  signers,
  networkType,
  vaultShellId,
  collaborativeWalletId,
  signerMap,
}: {
  type: VaultType;
  vaultName: string;
  vaultDescription: string;
  scheme: VaultScheme;
  signers: VaultSigner[];
  networkType: NetworkType;
  vaultShellId?: string;
  collaborativeWalletId?: string;
  signerMap: { [key: string]: Signer };
}): Promise<Vault> => {
  const id = generateVaultId(signers, networkType, scheme);
  const xpubs = signers.map((signer) => signer.xpub);
  const shellId = vaultShellId || generateKey(12);
  const defaultShell = 1;
  const presentationData: VaultPresentationData = {
    name: vaultName,
    description: vaultDescription,
    visibility: VisibilityType.DEFAULT,
    shell: defaultShell,
  };

  if (scheme.m > scheme.n) throw new Error(`scheme error: m:${scheme.m} > n:${scheme.n}`);

  const isMultiSig = scheme.n !== 1; // single xpub vaults are treated as single-sig wallet
  const scriptType = isMultiSig ? ScriptTypes.P2WPKH : ScriptTypes.P2WSH;

  const specs: VaultSpecs = {
    xpubs,
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    confirmedUTXOs: [],
    unconfirmedUTXOs: [],
    balances: {
      confirmed: 0,
      unconfirmed: 0,
    },
    transactions: [],
    txNote: {},
    hasNewUpdates: false,
    lastSynched: 0,
  };

  const vault: Vault = {
    id,
    shellId,
    entityKind: EntityKind.VAULT,
    type,
    networkType,
    isUsable: true,
    isMultiSig,
    scheme,
    signers,
    presentationData,
    specs,
    archived: false,
    scriptType,
    collaborativeWalletId,
  };
  vault.specs.receivingAddress = WalletOperations.getNextFreeAddress(vault);

  // update cosigners map(if one of the signers is an assisted key)
  await updateCosignersMapForAssistedKeys(signers, signerMap); // disabling temporarily

  return vault;
};

export const generateMobileKey = async (
  primaryMnemonic: string,
  networkType: NetworkType,
  entityKind: EntityKind = EntityKind.VAULT
): Promise<{
  xpub: string;
  xpriv: string;
  derivationPath: string;
  masterFingerprint: string;
}> => {
  const seed = bip39.mnemonicToSeedSync(primaryMnemonic);
  const masterFingerprint = WalletUtilities.getFingerprintFromSeed(seed);

  const DEFAULT_CHILD_PATH = 0;
  const xDerivationPath = WalletUtilities.getDerivationPath(
    entityKind,
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

export const generateSeedWordsKey = (
  mnemonic: string,
  networkType: NetworkType,
  entity: EntityKind = EntityKind.VAULT
): {
  xpub: string;
  xpriv: string;
  derivationPath: string;
  masterFingerprint: string;
} => {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const masterFingerprint = WalletUtilities.getFingerprintFromSeed(seed);

  const DEFAULT_CHILD_PATH = 0;
  const xDerivationPath = WalletUtilities.getDerivationPath(
    entity,
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
  const xDerivationPath = WalletUtilities.getDerivationPath(
    entity,
    networkType,
    randomWalletNumber
  );
  const network = WalletUtilities.getNetworkByType(networkType);
  const extendedKeys = WalletUtilities.generateExtendedKeyPairFromSeed(
    seed.toString('hex'),
    network,
    xDerivationPath
  );
  return { ...extendedKeys, derivationPath: xDerivationPath, masterFingerprint };
};

export const generateCosignerMapXfps = (
  keys: VaultSigner[],
  signerMap: { [key: string]: Signer },
  except: SignerType
) => {
  const cosignerXfps = [];
  keys.forEach((signer) => {
    if (signerMap[signer.masterFingerprint].type !== except) cosignerXfps.push(signer.xfp);
  });

  cosignerXfps.sort();

  const cosignersMapXfps = [];
  for (let i = 0; i < cosignerXfps.length; i++) {
    for (let j = i + 1; j < cosignerXfps.length; j++) {
      cosignersMapXfps.push(cosignerXfps[i] + '-' + cosignerXfps[j]);
    }
  }
  return cosignersMapXfps;
};

export const generateCosignerMapUpdates = (
  signerMap: { [key: string]: Signer },
  assistedKey: VaultSigner,
  keys: VaultSigner[]
): IKSCosignersMapUpdate[] | CosignersMapUpdate[] => {
  const cosignersMapIds = generateCosignerMapXfps(
    keys,
    signerMap,
    signerMap[assistedKey.masterFingerprint].type
  );

  if (signerMap[assistedKey.masterFingerprint].type === SignerType.POLICY_SERVER) {
    const cosignersMapUpdates: CosignersMapUpdate[] = [];
    for (let id of cosignersMapIds) {
      cosignersMapUpdates.push({
        cosignersId: id,
        signerId: assistedKey.xfp,
        action: CosignersMapUpdateAction.ADD,
      });
    }

    return cosignersMapUpdates;
  } else if (signerMap[assistedKey.masterFingerprint].type === SignerType.INHERITANCEKEY) {
    const cosignersMapUpdates: IKSCosignersMapUpdate[] = [];
    for (let id of cosignersMapIds) {
      cosignersMapUpdates.push({
        cosignersId: id,
        inheritanceKeyId: assistedKey.xfp,
        action: IKSCosignersMapUpdateAction.ADD,
      });
    }

    return cosignersMapUpdates;
  } else throw new Error('Non-supported signer type');
};

const updateCosignersMapForAssistedKeys = async (keys: VaultSigner[], signerMap) => {
  for (let key of keys) {
    if (
      signerMap[key.masterFingerprint].type === SignerType.POLICY_SERVER ||
      signerMap[key.masterFingerprint].type === SignerType.INHERITANCEKEY
    ) {
      // creates maps per signer type
      const cosignersMapUpdates = generateCosignerMapUpdates(signerMap, key, keys);

      // updates our backend with the cosigners map
      if (signerMap[key.masterFingerprint].type === SignerType.POLICY_SERVER) {
        const { updated } = await SigningServer.updateCosignersToSignerMap(
          key.xfp,
          cosignersMapUpdates as CosignersMapUpdate[]
        );
        if (!updated) throw new Error('Failed to update cosigners-map for SS Assisted Keys');
      } else if (signerMap[key.masterFingerprint].type === SignerType.INHERITANCEKEY) {
        const { updated } = await InheritanceKeyServer.updateCosignersToSignerMapIKS(
          key.xfp,
          cosignersMapUpdates as IKSCosignersMapUpdate[]
        );
        if (!updated) throw new Error('Failed to update cosigners-map for IKS Assisted Keys');
      }
    }
  }
};

export const MOCK_SD_MNEMONIC_MAP = {
  [SignerType.TAPSIGNER]:
    'result pink oyster iron journey social winter pattern cricket core leader behave',
  [SignerType.COLDCARD]:
    'keen credit hold warfare nasty address poverty roast novel ranch system nasty',
  [SignerType.LEDGER]:
    'hold address journey ranch result poverty cricket keen system core iron winter',
  [SignerType.JADE]:
    'galaxy wealth badge cloud educate inquiry member timber shaft promote symptom sting',
  [SignerType.KEYSTONE]:
    'congress judge talent affair client lift dash canal utility among spin tube',
  [SignerType.SEEDSIGNER]:
    'rug shrug rebuild name normal way scrub permit keen enable sorry episode',
  [SignerType.PASSPORT]:
    'grass journey few toilet rhythm day provide decline position weapon pave monitor',
  [SignerType.TREZOR]:
    'equal gospel mirror humor early liberty finger breeze super celery invite proof',
  [SignerType.BITBOX02]:
    'journey gospel position invite winter pattern inquiry scrub sorry early enable badge',
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
