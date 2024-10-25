/* eslint-disable no-await-in-loop */
import * as bip39 from 'bip39';
import * as bitcoinJS from 'bitcoinjs-lib';

import {
  cryptoRandom,
  generateEncryptionKey,
  generateKey,
  hash256,
} from 'src/utils/service-utilities/encryption';
import config from 'src/utils/service-utilities/config';
import {
  CosignersMapUpdate,
  CosignersMapUpdateAction,
  IKSCosignersMapUpdate,
  IKSCosignersMapUpdateAction,
} from 'src/models/interfaces/AssistedKeys';
import SigningServer from 'src/services/backend/SigningServer';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
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
import WalletOperations from '../operations';

const crypto = require('crypto');

const STANDARD_VAULT_SCHEME = [
  { m: 1, n: 1 },
  { m: 2, n: 3 },
  { m: 3, n: 5 },
];

export const generateVaultId = (signers: VaultSigner[], scheme) => {
  const xpubs = signers.map((signer) => signer.xpub).sort();
  const xpubMap = {};
  signers.forEach((signer) => {
    xpubMap[signer.xpub] = signer;
  });
  const fingerprints = xpubs.map((xpub) => {
    const signer = xpubMap[xpub];
    return signer.xfp;
  });
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
  signerMap,
}: {
  type: VaultType;
  vaultName: string;
  vaultDescription: string;
  scheme: VaultScheme;
  signers: VaultSigner[];
  networkType: NetworkType;
  vaultShellId?: string;
  signerMap: { [key: string]: Signer };
}): Promise<Vault> => {
  const id = generateVaultId(signers, scheme);
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

  const isMultiSig = scheme.n !== 1; // single key Vault is BIP-84 P2WPKH single-sig and not 1-of-1 BIP-48 P2WSH multi-sig
  const scriptType = isMultiSig ? ScriptTypes.P2WSH : ScriptTypes.P2WPKH;

  const specs: VaultSpecs = {
    xpubs,
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    totalExternalAddresses: 1,
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
  };
  vault.specs.receivingAddress = WalletOperations.getNextFreeAddress(vault);

  // update cosigners map(if one of the signers is an assisted key)
  await updateCosignersMapForAssistedKeys(signers, signerMap);

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
  const isValid = bip39.validateMnemonic(mnemonic);
  if (!isValid) throw new Error('Invalid Mnemonic');

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
  const randomWalletNumber = Math.floor(cryptoRandom() * 10e5);
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

export const generateCosignerMapIds = (
  signerMap: { [key: string]: Signer },
  keys: VaultSigner[],
  except: SignerType
) => {
  // generates cosigners map ids using sorted and hashed cosigner ids
  const cosignerIds = [];
  keys.forEach((signer) => {
    if (signerMap[signer.masterFingerprint].type !== except) cosignerIds.push(signer.xfp);
  });

  cosignerIds.sort();

  const hashedCosignerIds = cosignerIds.map((id) => hash256(id));

  const cosignersMapIds = [];
  for (let i = 0; i < hashedCosignerIds.length; i++) {
    for (let j = i + 1; j < hashedCosignerIds.length; j++) {
      cosignersMapIds.push(`${hashedCosignerIds[i]}-${hashedCosignerIds[j]}`);
    }
  }

  return cosignersMapIds;
};

export const generateCosignerMapUpdates = (
  signerMap: { [key: string]: Signer },
  keys: VaultSigner[],
  assistedKey: VaultSigner
): IKSCosignersMapUpdate[] | CosignersMapUpdate[] => {
  const assistedKeyType = signerMap[assistedKey.masterFingerprint].type;
  const cosignersMapIds = generateCosignerMapIds(signerMap, keys, assistedKeyType);

  if (assistedKeyType === SignerType.POLICY_SERVER) {
    const cosignersMapUpdates: CosignersMapUpdate[] = [];
    for (const id of cosignersMapIds) {
      cosignersMapUpdates.push({
        cosignersId: id,
        signerId: assistedKey.xfp,
        action: CosignersMapUpdateAction.ADD,
      });
    }

    return cosignersMapUpdates;
  } else if (assistedKeyType === SignerType.INHERITANCEKEY) {
    const cosignersMapUpdates: IKSCosignersMapUpdate[] = [];
    for (const id of cosignersMapIds) {
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
  for (const key of keys) {
    const assistedKeyType = signerMap[key.masterFingerprint]?.type;
    if (
      assistedKeyType === SignerType.POLICY_SERVER ||
      assistedKeyType === SignerType.INHERITANCEKEY
    ) {
      // creates maps per signer type
      const cosignersMapUpdates = generateCosignerMapUpdates(signerMap, keys, key);

      // updates our backend with the cosigners map
      if (assistedKeyType === SignerType.POLICY_SERVER) {
        const { updated } = await SigningServer.updateCosignersToSignerMap(
          key.xfp,
          cosignersMapUpdates as CosignersMapUpdate[]
        );
        if (!updated) throw new Error('Failed to update cosigners-map for SS Assisted Keys');
      } else if (assistedKeyType === SignerType.INHERITANCEKEY) {
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
  [SignerType.SPECTER]:
    'journey invite inquiry day among poverty inquiry affair keen pave nasty position',
};

export const generateMockExtendedKeyForSigner = (
  entity: EntityKind,
  signer: SignerType,
  networkType = NetworkType.TESTNET
) => {
  const mockMnemonic = MOCK_SD_MNEMONIC_MAP[signer];
  if (!mockMnemonic) {
    throw new Error("We don't support mock flow for soft keys");
  }
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
