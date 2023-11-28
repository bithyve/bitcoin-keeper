import {
  Vault,
  VaultScheme,
  VaultSigner,
  XpubDetailsType,
} from 'src/core/wallets/interfaces/vault';

import {
  DerivationPurpose,
  EntityKind,
  NetworkType,
  SignerStorage,
  SignerType,
  XpubTypes,
} from 'src/core/wallets/enums';
import WalletUtilities from 'src/core/wallets/operations/utils';
import config, { APP_STAGE } from 'src/core/config';
import { HWErrorType } from 'src/models/enums/Hardware';
import { generateMockExtendedKeyForSigner } from 'src/core/wallets/factories/VaultFactory';
import idx from 'idx';
import HWError from './HWErrorState';

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
  xfp,
  signerType,
  storageType,
  isMultisig,
  xpriv = null,
  isMock = false,
  xpubDetails = {} as XpubDetailsType,
  signerPolicy = null,
  inheritanceKeyInfo = null,
}): VaultSigner => {
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
  xpub = WalletUtilities.generateXpubFromYpub(xpub, network);
  xpubDetails = Object.keys(xpubDetails).length
    ? xpubDetails
    : { [isMultisig ? XpubTypes.P2WSH : XpubTypes.P2WPKH]: { xpub, derivationPath } };
  const signerId = WalletUtilities.getFingerprintFromExtendedKey(xpub, network);
  const signer: VaultSigner = {
    signerId,
    type: signerType,
    signerName: getSignerNameFromType(signerType, isMock, !!xpubDetails[XpubTypes.AMF]),
    xpub,
    xpriv,
    derivationPath,
    masterFingerprint: xfp,
    isMock,
    lastHealthCheck: new Date(),
    addedOn: new Date(),
    storageType,
    registered: UNVERIFYING_SIGNERS.includes(signerType) || isMock,
    xpubDetails,
    signerPolicy,
    inheritanceKeyInfo,
  };
  return signer;
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
      name = 'Keeper Signing Device';
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
    case SignerType.BITBOX02:
      name = 'BitBox02';
      break;
    case SignerType.OTHER_SD:
      name = 'Other Signing Device';
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
  line += `Name: Keeper Vault\n`;
  line += `Policy: ${vault.scheme.m} of ${vault.scheme.n}\n`;
  line += `Format: P2WSH\n`;
  line += `\n`;
  vault.signers.forEach((signer) => {
    line += `Derivation: ${signer.derivationPath}\n`;
    line += `${signer.masterFingerprint}: ${signer.xpub}\n\n`;
  });
  return line;
};

export const getSignerSigTypeInfo = (signer: VaultSigner) => {
  const purpose = WalletUtilities.getSignerPurposeFromPath(signer.derivationPath);
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
    const signer: VaultSigner = generateSignerFromMetaData({
      xpub,
      xpriv,
      derivationPath,
      xfp: masterFingerprint,
      signerType,
      storageType: SignerStorage.COLD,
      isMock: true,
      isMultisig: true,
    });
    return signer;
  }
  return null;
};

export const isSignerAMF = (signer: VaultSigner) =>
  !!idx(signer, (_) => _.xpubDetails[XpubTypes.AMF].xpub);

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

const SIGNLE_ALLOWED_SIGNERS = [SignerType.POLICY_SERVER, SignerType.MOBILE_KEY];

const allowSingleKey = (type, vaultSigners) => {
  if (vaultSigners.find((s) => s.type === type)) {
    if (SIGNLE_ALLOWED_SIGNERS.includes(type)) {
      return true;
    }
    return false;
  }
  return false;
};

const getDisabled = (type: SignerType, isOnL1, vaultSigners, scheme) => {
  // Keys Incase of level 1 we have level 1
  if (isOnL1) {
    return { disabled: true, message: 'Upgrade tier to use as key' };
  }

  if (type === SignerType.POLICY_SERVER && (scheme.n < 3 || scheme.m < 2)) {
    return {
      disabled: true,
      message: 'Please create a vault with a minimum of 3 signers and 2 required signers',
    };
  }
  // Keys Incase of already added
  if (allowSingleKey(type, vaultSigners)) {
    return { disabled: true, message: 'Key already added to the Vault' };
  }

  return { disabled: false, message: '' };
};

export const getDeviceStatus = (
  type: SignerType,
  isNfcSupported,
  vaultSigners,
  isOnL1,
  scheme: VaultScheme
) => {
  switch (type) {
    case SignerType.COLDCARD:
    case SignerType.TAPSIGNER:
      return {
        message: !isNfcSupported ? 'NFC is not supported in your device' : '',
        disabled: config.ENVIRONMENT !== APP_STAGE.DEVELOPMENT && !isNfcSupported,
      };
    case SignerType.MOBILE_KEY:
      return allowSingleKey(type, vaultSigners)
        ? { disabled: true, message: 'Key already added to the Vault' }
        : {
            message: '',
            disabled: false,
          };
    case SignerType.POLICY_SERVER:
      return {
        message: getDisabled(type, isOnL1, vaultSigners, scheme).message,
        disabled: getDisabled(type, isOnL1, vaultSigners, scheme).disabled,
      };
    case SignerType.TREZOR:
      return scheme.n > 1
        ? { disabled: true, message: 'Multisig with trezor is coming soon!' }
        : {
            message: '',
            disabled: false,
          };
    case SignerType.KEEPER:
    case SignerType.SEED_WORDS:
    case SignerType.JADE:
    case SignerType.BITBOX02:
    case SignerType.PASSPORT:
    case SignerType.SEEDSIGNER:
    case SignerType.LEDGER:
    case SignerType.KEYSTONE:
    default:
      return {
        message: '',
        disabled: false,
      };
  }
};

export const getSDMessage = ({ type }: { type: SignerType }) => {
  switch (type) {
    case SignerType.COLDCARD:
    case SignerType.LEDGER:
    case SignerType.PASSPORT:
    case SignerType.BITBOX02:
    case SignerType.KEYSTONE: {
      return 'Register for full verification';
    }
    case SignerType.JADE: {
      return 'Optional registration';
    }
    case SignerType.KEEPER: {
      return 'Hot keys on other device';
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
