import {
  Signer,
  Vault,
  VaultScheme,
  VaultSigner,
  XpubDetailsType,
  signerXpubs,
} from 'src/services/wallets/interfaces/vault';

import {
  DerivationPurpose,
  EntityKind,
  NetworkType,
  SignerStorage,
  SignerType,
  XpubTypes,
} from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config, { APP_STAGE } from 'src/utils/service-utilities/config';
import { HWErrorType } from 'src/models/enums/Hardware';
import { generateMockExtendedKeyForSigner } from 'src/services/wallets/factories/VaultFactory';
import idx from 'idx';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { numberToOrdinal } from 'src/utils/utilities';
import moment from 'moment';
import reverse from 'buffer-reverse';
import * as bitcoinJS from 'bitcoinjs-lib';
import ElectrumClient from 'src/services/electrum/client';
import { captureError } from 'src/services/sentry';
const base58check = require('base58check');
import HWError from './HWErrorState';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';

export const UNVERIFYING_SIGNERS = [
  SignerType.JADE,
  SignerType.TREZOR,
  SignerType.KEEPER,
  SignerType.MY_KEEPER,
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
  isBIP85 = false,
  signerPolicy = null,
  inheritanceKeyInfo = null,
  isAmf = false,
}): { signer: Signer; key: VaultSigner } => {
  const networkType = WalletUtilities.getNetworkFromPrefix(xpub.slice(0, 4));
  const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
  if (
    networkType !== config.NETWORK_TYPE &&
    signerType !== SignerType.KEYSTONE &&
    signerType !== SignerType.JADE
  ) {
    throw new HWError(HWErrorType.INCORRECT_NETWORK);
  }
  xpub = WalletUtilities.getXpubFromExtendedKey(xpub, network);

  const signerXpubs: signerXpubs = {};
  if (!xpubDetails) {
    const scriptType = WalletUtilities.getScriptTypeFromDerivationPath(derivationPath);
    signerXpubs[scriptType] = [
      { xpub, xpriv, derivationPath: derivationPath.replaceAll('h', "'") },
    ];
  } else {
    Object.entries(xpubDetails).forEach(([key, xpubDetail]) => {
      const { xpub, xpriv, derivationPath } = xpubDetail;
      signerXpubs[key] = signerXpubs[key] || [];
      signerXpubs[key].push({ xpub, xpriv, derivationPath: derivationPath.replaceAll('h', "'") });
    });
  }

  const signer: Signer = {
    type: signerType,
    storageType,
    isMock,
    signerName: getSignerNameFromType(signerType, isMock, isAmf),
    lastHealthCheck: new Date(),
    healthCheckDetails: [
      {
        type: hcStatusType.HEALTH_CHECK_SD_ADDITION,
        actionDate: new Date(),
      },
    ],
    addedOn: new Date(),
    masterFingerprint,
    isBIP85,
    signerPolicy,
    inheritanceKeyInfo,
    signerXpubs,
    hidden: false,
  };

  const key: VaultSigner = {
    xfp: xfp || WalletUtilities.getFingerprintFromExtendedKey(xpub, network),
    derivationPath: derivationPath.replaceAll('h', "'"),
    xpub,
    xpriv,
    masterFingerprint,
  };

  return { signer, key };
};


export const getSignerDescription = (signer?: Signer) => {
  const fullName = `${signer?.extraData?.givenName || ''} ${
    signer?.extraData?.familyName || ''
  }`.trim();

  if (fullName) {
    return fullName;
  }

  if (signer?.signerDescription) {
    return signer.signerDescription;
  }

  if (signer?.type === SignerType.MY_KEEPER && signer?.extraData?.instanceNumber !== undefined) {
    return numberToOrdinal(signer.extraData.instanceNumber);
  }

  return signer?.addedOn ? `Added ${moment(signer.addedOn).calendar().toLowerCase()}` : '';
};

export const getSignerNameFromType = (type: SignerType, isMock = false, isAmf = false) => {
  let name: string;
  switch (type) {
    case SignerType.COLDCARD:
      name = 'COLDCARD';
      break;
    case SignerType.JADE:
      name = 'Jade';
      break;
    case SignerType.MY_KEEPER:
      name = 'Mobile Key';
      break;
    case SignerType.KEEPER:
      name = 'External Key';
      break;
    case SignerType.KEYSTONE:
      name = 'Keystone';
      break;
    case SignerType.LEDGER:
      name = 'Ledger';
      break;
    case SignerType.MOBILE_KEY:
      name = 'Recovery Key';
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
      name = 'Other Signer';
      break;
    case SignerType.UNKOWN_SIGNER:
      name = 'Unknown Signer';
      break;
    case SignerType.INHERITANCEKEY:
      name = 'Inheritance Key';
      break;
    case SignerType.PORTAL:
      name = 'Portal';
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

export const getWalletConfig = ({ vault, signerType }: { vault: Vault; signerType?: string }) => {
  const isKeystone = signerType === SignerType.KEYSTONE;
  let line = '';
  if (isKeystone) line += 'Y q';
  line += `#${isKeystone ? ' Keystone' : ''} Multisig setup file (exported from Keeper)\n`;
  if (isKeystone) line += '#\n';
  line += `Name: ${vault.presentationData.name}\n`;
  line += `Policy: ${vault.scheme.m} of ${vault.scheme.n}\n`;
  if (isKeystone) line += `Derivation: ${vault.signers[0].derivationPath.replaceAll('h', "'")}\n`;
  line += 'Format: P2WSH\n';
  line += '\n';
  vault.signers.forEach((signer) => {
    if (isKeystone) {
      line += `${signer.masterFingerprint}: `;
      line += `${signer.xpub}\n`;
    } else {
      line += `Derivation:${signer.derivationPath.replaceAll('h', "'")}\n`;
      line += `${signer.masterFingerprint}:`;
      line += `${signer.xpub}\n`;
    }
  });
  return line;
};

export const getSignerSigTypeInfo = (key: VaultSigner, signer: Signer) => {
  const purpose = WalletUtilities.getSignerPurposeFromPath(key.derivationPath);
  if (signer.isMock) {
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
    // fetched multi-sig key
    const {
      xpub: multiSigXpub,
      xpriv: multiSigXpriv,
      derivationPath: multiSigPath,
      masterFingerprint,
    } = generateMockExtendedKeyForSigner(EntityKind.VAULT, signerType, networkType);
    // fetched single-sig key
    const {
      xpub: singleSigXpub,
      xpriv: singleSigXpriv,
      derivationPath: singleSigPath,
    } = generateMockExtendedKeyForSigner(EntityKind.WALLET, signerType, networkType);

    const xpubDetails: XpubDetailsType = {};

    xpubDetails[XpubTypes.P2WPKH] = {
      xpub: singleSigXpub,
      xpriv: singleSigXpriv,
      derivationPath: singleSigPath,
    };

    xpubDetails[XpubTypes.P2WSH] = {
      xpub: multiSigXpub,
      xpriv: multiSigXpriv,
      derivationPath: multiSigPath,
    };

    const { signer, key } = generateSignerFromMetaData({
      xpub: multiSigXpub,
      xpriv: multiSigXpriv,
      derivationPath: multiSigPath,
      masterFingerprint,
      signerType,
      storageType: SignerStorage.COLD,
      isMock: true,
      isMultisig: true,
      xpubDetails,
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
    case SignerType.MY_KEEPER:
    case SignerType.KEEPER:
      return !addSignerFlow && scheme?.n < 2
        ? {
            message: `You can add an ${getSignerNameFromType(
              type
            )} in a multisig configuration only`,
            disabled: true,
          }
        : { message: '', disabled: false };
    case SignerType.POLICY_SERVER:
      return getPolicyServerStatus(type, isOnL1, scheme, addSignerFlow, existingSigners);
    case SignerType.INHERITANCEKEY:
      return getInheritanceKeyStatus(type, isOnL1, isOnL2, scheme, addSignerFlow, existingSigners);
    case SignerType.PORTAL:
      return {
        message: !isNfcSupported ? 'NFC is not supported in your device' : '',
        disabled: config.ENVIRONMENT !== APP_STAGE.DEVELOPMENT && !isNfcSupported,
      };
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
      message: isOnL1
        ? 'Upgrade to Hodler/Diamond Hands to use the key'
        : 'The key is already added to your Manage Keys section',
      disabled: true,
    };
  } else if (isOnL1) {
    return {
      disabled: true,
      message: `Please upgrade to atleast ${SubscriptionTier.L2} to add an ${getSignerNameFromType(
        type
      )}`,
    };
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
      message:
        isOnL1 || isOnL2
          ? 'Upgrade to Diamond Hands to use the key'
          : 'The key is already added to your Manage Keys section',
    };
  } else if (isOnL1 || isOnL2) {
    return {
      disabled: true,
      message: `Please upgrade to ${SubscriptionTier.L3} to add an ${getSignerNameFromType(type)}`,
    };
  } else if (existingSigners.find((s) => s.type === SignerType.INHERITANCEKEY)) {
    return { message: `${getSignerNameFromType(type)} has been already added`, disabled: true };
  } else if (type === SignerType.INHERITANCEKEY && (scheme.n < 3 || scheme.m < 2)) {
    return {
      disabled: true,
      message: 'Please create a vault with a minimum of 3 signers and 2 required signers',
    };
  } else {
    return { message: '', disabled: false };
  }
};

export const getSDMessage = ({ type }: { type: SignerType }) => {
  switch (type) {
    case SignerType.COLDCARD: {
      return 'Secure signers from Coinkite';
    }
    case SignerType.LEDGER: {
      return 'Ledger signers like Nano S, Nano X, Stax, and Flex';
    }
    case SignerType.PASSPORT: {
      return 'Passport signers from Foundation Devices';
    }
    case SignerType.BITBOX02: {
      return 'Swiss made signer from BitBox';
    }
    case SignerType.SPECTER: {
      return 'A DIY signer from Spector Solutions';
    }
    case SignerType.KEYSTONE: {
      return 'Open Source signer from keyst.one';
    }
    case SignerType.JADE: {
      return 'Simple and open source bitcoin wallet';
    }
    case SignerType.MY_KEEPER: {
      return 'Use Mobile Key as signer';
    }
    case SignerType.KEEPER: {
      return `From a friend or advisor's Keeper app`;
    }
    case SignerType.MOBILE_KEY: {
      return 'Hot key on this app';
    }
    case SignerType.POLICY_SERVER: {
      return 'Hot keys on the server';
    }
    case SignerType.SEEDSIGNER: {
      return 'A DIY stateless signer';
    }
    case SignerType.SEED_WORDS: {
      return '12, 18 or 24 words phrase';
    }
    case SignerType.TAPSIGNER: {
      return 'Easy-to-use signer from Coinkite';
    }
    case SignerType.TREZOR: {
      return 'Trusted signers from SatoshiLabs';
    }
    case SignerType.OTHER_SD: {
      return 'Varies with different signer';
    }
    case SignerType.INHERITANCEKEY: {
      return '';
    }
    case SignerType.PORTAL: {
      return 'Mobile-specific signer from TwentyTwo';
    }
    default:
      return null;
  }
};

export const extractKeyFromDescriptor = (data) => {
  let xpub = '';
  let derivationPath = '';
  let masterFingerprint = '';

  if (typeof data === 'object' && data.hasOwnProperty('xPub')) {
    xpub = data.xPub;
    derivationPath = data.derivationPath;
    masterFingerprint = data.mfp;
  } else {
    // scanning first key of bsms
    if (data.startsWith('BSMS')) {
      const keys = WalletUtilities.extractKeysFromBsms(data);
      xpub = keys[0].xpub;
      derivationPath = keys[0].derivationPath;
      masterFingerprint = keys[0].masterFingerprint;
    }
    // scanning keeper's mobile key
    xpub = data.slice(data.indexOf(']') + 1);
    masterFingerprint = data.slice(1, 9);
    derivationPath = data
      .slice(data.indexOf('[') + 1, data.indexOf(']'))
      .replace(masterFingerprint, 'm');
  }
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

export const getPsbtForHwi = async (serializedPSBT: string, vault: Vault) => {
  try {
    const psbt = bitcoinJS.Psbt.fromBase64(serializedPSBT, {
      network: WalletUtilities.getNetworkByType(config.NETWORK_TYPE),
    });
    const txids = psbt.txInputs.map((input) => {
      const item = reverse(input.hash).toString('hex');
      return item;
    });
    const prevTxs = await ElectrumClient.getTransactionsById(txids, true, 40, true);
    psbt.txInputs.forEach((input, index) => {
      psbt.updateInput(index, {
        nonWitnessUtxo: Buffer.from(prevTxs[reverse(input.hash).toString('hex')].hex, 'hex'),
      });
    });

    psbt.updateGlobal({
      globalXpub: vault.signers.map((signer) => {
        const extendedPubkey = base58check.decode(signer.xpub);
        return {
          extendedPubkey: Buffer.concat([extendedPubkey.prefix, extendedPubkey.data]),
          masterFingerprint: Buffer.from(signer.masterFingerprint, 'hex'),
          path: signer.derivationPath,
        };
      }),
    });
    return { serializedPSBT: psbt.toBase64() };
  } catch (_) {
    captureError(_);
    return { serializedPSBT };
  }
};

import * as b58 from 'bs58check';

const prefixes = new Map([
  ['xpub', '0488b21e'],
  ['ypub', '049d7cb2'],
  ['Ypub', '0295b43f'],
  ['zpub', '04b24746'],
  ['Zpub', '02aa7ed3'],
  ['tpub', '043587cf'],
  ['upub', '044a5262'],
  ['Upub', '024289ef'],
  ['vpub', '045f1cf6'],
  ['Vpub', '02575483'],
  ['xprv', '0488ade4'],
  ['yprv', '049d7878'],
  ['Yprv', '0295b005'],
  ['zprv', '04b2430c'],
  ['Zprv', '02aa7a99'],
  ['tprv', '04358394'],
  ['uprv', '044a4e28'],
  ['Uprv', '024285b5'],
  ['vprv', '045f18bc'],
  ['Vprv', '02575048'],
]);

export const xpubToTpub = (xpub: string): string => {
  const targetFormat = 'tpub';
  xpub = xpub.trim();

  try {
    const inType = xpub.substring(0, 4);
    const outType = targetFormat.substring(0, 4);

    if (inType.charAt(3) !== outType.charAt(3)) {
      throw new Error(
        `Input and Output extended key type must match... Found Input Key Type: ${inType}, Output Key Type: ${outType}`
      );
    }

    const data = b58.decode(xpub);
    const slicedData = data.slice(4);
    const newData = Buffer.concat([Buffer.from(prefixes.get(targetFormat)!, 'hex'), slicedData]);
    const result = b58.encode(newData);

    return result;
  } catch (err) {
    console.error('Error details:', err);
    throw new Error('Invalid extended public key! Please check your input.');
  }
};
