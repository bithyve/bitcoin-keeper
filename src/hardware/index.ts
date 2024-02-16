import {
  Signer,
  Vault,
  VaultScheme,
  VaultSigner,
  XpubDetailsType,
  signerXpubs,
} from 'src/core/wallets/interfaces/vault';

import {
  DerivationPurpose,
  EntityKind,
  NetworkType,
  SignerStorage,
  SignerType,
} from 'src/core/wallets/enums';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config, { APP_STAGE } from 'src/core/config';
import { HWErrorType } from 'src/models/enums/Hardware';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import idx from 'idx';
import HWError from './HWErrorState';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';

export const UNVERIFYING_SIGNERS = [
  SignerType.JADE,
  SignerType.TREZOR,
  SignerType.KEEPER,
  SignerType.MOBILE_KEY,
  SignerType.POLICY_SERVER,
  SignerType.SEED_WORDS,
  SignerType.TAPSIGNER,
  SignerType.INHERITANCEKEY,
];
export const generateSignerFromMetaData = ({
  xpub,
  derivationPath,
  masterFingerprint,
  signerType,
  storageType,
  isMultisig,
  xpriv = null,
  isMock = false,
  xpubDetails = null as XpubDetailsType,
  xfp = null,
  signerPolicy = null,
  inheritanceKeyInfo = null,
  isAmf = false,
}): { signer: Signer; key: VaultSigner } => {
  const networkType = WalletUtilities.getNetworkFromPrefix(xpub.slice(0, 4));
  const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
  if (
    networkType !== config.NETWORK_TYPE &&
    config.NETWORK_TYPE === NetworkType.TESTNET &&
    signerType !== SignerType.KEYSTONE &&
    signerType !== SignerType.JADE
  ) {
    throw new HWError(HWErrorType.INCORRECT_NETWORK);
  }
  xpub = WalletUtilities.getXpubFromExtendedKey(xpub, network);

  const signerXpubs: signerXpubs = {};
  if (!xpubDetails) {
    const scriptType = WalletUtilities.getScriptTypeFromDerivationPath(derivationPath);
    signerXpubs[scriptType] = [{ xpub, xpriv, derivationPath }];
  } else {
    Object.entries(xpubDetails).forEach(([key, xpubDetail]) => {
      const { xpub, xpriv, derivationPath } = xpubDetail;
      signerXpubs[key] = signerXpubs[key] || [];
      signerXpubs[key].push({ xpub, xpriv, derivationPath });
    });
  }

  const signer: Signer = {
    type: signerType,
    storageType,
    isMock,
    signerName: getSignerNameFromType(signerType, isMock, isAmf),
    lastHealthCheck: new Date(),
    addedOn: new Date(),
    masterFingerprint,
    signerPolicy,
    inheritanceKeyInfo,
    signerXpubs,
    hidden: false,
  };

  const key: VaultSigner = {
    xfp: xfp || WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
    derivationPath,
    xpub,
    xpriv,
    masterFingerprint,
  };

  return { signer, key };
};

export const getSignerNameFromType = (type: SignerType, isMock = false, isAmf = false) => {
  let name: string;
  switch (type) {
    case SignerType.COLDCARD:
      name = 'Mk4';
      break;
    case SignerType.JADE:
      name = 'Jade';
      break;
    case SignerType.KEEPER:
      name = 'Collaborative Key';
      break;
    case SignerType.KEYSTONE:
      name = 'Keystone';
      break;
    case SignerType.LEDGER:
      name = 'Nano X';
      break;
    case SignerType.MOBILE_KEY:
      name = 'Mobile Key';
      break;
    case SignerType.PASSPORT:
      name = 'Passport';
      break;
    case SignerType.POLICY_SERVER:
      name = 'Signing Server';
      break;
    case SignerType.SEED_WORDS:
      name = 'Seed Key';
      break;
    case SignerType.TAPSIGNER:
      name = 'TAPSIGNER';
      break;
    case SignerType.TREZOR:
      name = 'Trezor';
      break;
    case SignerType.SEEDSIGNER:
      name = 'SeedSigner';
      break;
    case SignerType.SPECTER:
      name = 'Specter';
      break;
    case SignerType.BITBOX02:
      name = 'BitBox02';
      break;
    case SignerType.OTHER_SD:
      name = 'Other signer';
      break;
    case SignerType.UNKOWN_SIGNER:
      name = 'Unknown Signer';
      break;
    case SignerType.INHERITANCEKEY:
      name = 'Inheritance Key';
      break;
    default:
      name = type;
      break;
  }
  if (isMock) {
    return `${name}**`;
  }
  if (isAmf) {
    return `${name}*`;
  }
  return name;
};

export const getWalletConfig = ({ vault }: { vault: Vault }) => {
  let line = '# Multisig setup file (exported from Keeper)\n';
  line += 'Name: Keeper vault\n';
  line += `Policy: ${vault.scheme.m} of ${vault.scheme.n}\n`;
  line += 'Format: P2WSH\n';
  line += '\n';
  vault.signers.forEach((signer) => {
    line += `Derivation: ${signer.derivationPath}\n`;
    line += `${signer.masterFingerprint}: ${signer.xpub}\n\n`;
  });
  return line;
};

export const getSignerSigTypeInfo = (key: VaultSigner, signer: Signer) => {
  const purpose = WalletUtilities.getSignerPurposeFromPath(key.derivationPath);
  if (
    signer.isMock ||
    (signer.type === SignerType.TAPSIGNER && config.NETWORK_TYPE === NetworkType.TESTNET) // amf flow
  ) {
    return { isSingleSig: true, isMultiSig: true, purpose };
  }
  if (purpose && DerivationPurpose.BIP48.toString() === purpose) {
    return { isSingleSig: false, isMultiSig: true, purpose };
  }
  return { isSingleSig: true, isMultiSig: false, purpose };
};

export const getMockSigner = (signerType: SignerType) => {
  if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
    const networkType = config.NETWORK_TYPE;
    const { xpub, xpriv, derivationPath, masterFingerprint } = generateMockExtendedKeyForSigner(
      EntityKind.VAULT,
      signerType,
      networkType
    );
    const { signer, key } = generateSignerFromMetaData({
      xpub,
      xpriv,
      derivationPath,
      masterFingerprint,
      signerType,
      storageType: SignerStorage.COLD,
      isMock: true,
      isMultisig: true,
    });
    return { signer, key };
  }
  return null;
};

export const isSignerAMF = (signer: Signer) => !!idx(signer, (_) => _.signerName.includes('*'));

const HARDENED = 0x80000000;
export const getKeypathFromString = (keypathString: string): number[] => {
  let levels = keypathString.toLowerCase().split('/');
  if (levels[0] !== 'm') throw new Error('Invalid keypath');
  levels = levels.slice(1);
  return levels.map((level: any) => {
    let hardened = false;
    if (level.substring(level.length - 1) === "'") hardened = true;
    level = parseInt(level, 10);
    if (Number.isNaN(level) || level < 0 || level >= HARDENED) throw new Error('Invalid keypath');
    if (hardened) level += HARDENED;
    return level;
  });
};

export const getDeviceStatus = (
  type: SignerType,
  isNfcSupported: boolean,
  isOnL1: boolean,
  isOnL2: boolean,
  scheme: VaultScheme,
  existingSigners: Signer[],
  addSignerFlow: boolean = false
) => {
  switch (type) {
    case SignerType.COLDCARD:
    case SignerType.TAPSIGNER:
      return {
        message: !isNfcSupported ? 'NFC is not supported in your device' : '',
        disabled: config.ENVIRONMENT !== APP_STAGE.DEVELOPMENT && !isNfcSupported,
      };
    case SignerType.MOBILE_KEY:
      if (existingSigners.find((s) => s.type === SignerType.MOBILE_KEY)) {
        return { message: `${getSignerNameFromType(type)} has been already added`, disabled: true };
      } else {
        return { message: '', disabled: false };
      }
    case SignerType.KEEPER:
      return addSignerFlow || scheme?.n < 2
        ? {
            message: `You can add a ${getSignerNameFromType(
              type
            )} in a multisig configuration only`,
            disabled: true,
          }
        : { message: '', disabled: false };
    case SignerType.TREZOR:
      return addSignerFlow || scheme?.n > 1
        ? { disabled: true, message: 'Multisig with trezor is coming soon!' }
        : { message: '', disabled: false };
    case SignerType.POLICY_SERVER:
      return getPolicyServerStatus(type, isOnL1, scheme, addSignerFlow, existingSigners);
    case SignerType.INHERITANCEKEY:
      return getInheritanceKeyStatus(type, isOnL1, isOnL2, scheme, addSignerFlow, existingSigners);
    default:
      return { message: '', disabled: false };
  }
};

const getPolicyServerStatus = (
  type: SignerType,
  isOnL1: boolean,
  scheme: VaultScheme,
  addSignerFlow: boolean,
  existingSigners
) => {
  if (addSignerFlow) {
    return {
      message: `Please add ${getSignerNameFromType(type)} from the vault creation flow`,
      disabled: true,
    };
  } else if (isOnL1) {
    return { disabled: true, message: 'Upgrade tier to use as key' };
  } else if (existingSigners.find((s) => s.type === SignerType.POLICY_SERVER)) {
    return { message: `${getSignerNameFromType(type)} has been already added`, disabled: true };
  } else if (type === SignerType.POLICY_SERVER && (scheme.n < 3 || scheme.m < 2)) {
    return {
      disabled: true,
      message: 'Please create a vault with a minimum of 3 signers and 2 required signers',
    };
  } else {
    return { disabled: false, message: '' };
  }
};

const getInheritanceKeyStatus = (
  type: SignerType,
  isOnL1: boolean,
  isOnL2: boolean,
  scheme: VaultScheme,
  addSignerFlow: boolean,
  existingSigners
) => {
  if (addSignerFlow) {
    return {
      disabled: true,
      message: `Please add ${getSignerNameFromType(type)} from the vault creation flow`,
    };
  } else if (isOnL1 || isOnL2) {
    return {
      disabled: true,
      message: `Please upgrade to ${SubscriptionTier.L3} to add an ${getSignerNameFromType(type)}`,
    };
  } else if (existingSigners.find((s) => s.type === SignerType.INHERITANCEKEY)) {
    return { message: `${getSignerNameFromType(type)} has been already added`, disabled: true };
  } else if (type === SignerType.INHERITANCEKEY && (scheme.n < 5 || scheme.m < 3)) {
    return {
      disabled: true,
      message: 'Please create a vault with a minimum of 5 signers and 3 required signers',
    };
  } else {
    return { message: '', disabled: false };
  }
};

export const getSDMessage = ({ type }: { type: SignerType }) => {
  switch (type) {
    case SignerType.COLDCARD:
    case SignerType.LEDGER:
    case SignerType.PASSPORT:
    case SignerType.BITBOX02:
    case SignerType.SPECTER:
    case SignerType.KEYSTONE: {
      return 'Register for full verification';
    }
    case SignerType.JADE: {
      return 'Optional registration';
    }
    case SignerType.KEEPER: {
      return 'Use Collaborative Key as signer';
    }
    case SignerType.MOBILE_KEY: {
      return 'Hot keys on this device';
    }
    case SignerType.POLICY_SERVER: {
      return 'Hot keys on the server';
    }
    case SignerType.SEEDSIGNER: {
      return 'Register during txn signing';
    }
    case SignerType.SEED_WORDS: {
      return 'Blind signer when sending';
    }
    case SignerType.TAPSIGNER: {
      return 'Blind signer, no verification';
    }
    case SignerType.TREZOR: {
      return 'Manually verify addresses';
    }
    case SignerType.OTHER_SD: {
      return 'Varies with different signer';
    }
    case SignerType.INHERITANCEKEY: {
      return '';
    }
    default:
      return null;
  }
};

export const extractKeyFromDescriptor = (data) => {
  const xpub = data.slice(data.indexOf(']') + 1);
  const masterFingerprint = data.slice(1, 9);
  const derivationPath = data
    .slice(data.indexOf('[') + 1, data.indexOf(']'))
    .replace(masterFingerprint, 'm');
  const purpose = WalletUtilities.getSignerPurposeFromPath(derivationPath);
  let forMultiSig: boolean;
  let forSingleSig: boolean;
  if (purpose && DerivationPurpose.BIP48.toString() === purpose) {
    forMultiSig = true;
    forSingleSig = false;
  } else {
    forMultiSig = false;
    forSingleSig = true;
  }
  return { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig };
};
