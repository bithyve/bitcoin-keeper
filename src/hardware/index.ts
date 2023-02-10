import { Vault, VaultSigner, XpubDetailsType } from 'src/core/wallets/interfaces/vault';

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
import { HWErrorType } from 'src/common/data/enums/Hardware';
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
}): VaultSigner => {
  const networkType = WalletUtilities.getNetworkFromPrefix(xpub.slice(0, 4));
  const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
  if (networkType !== config.NETWORK_TYPE) {
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
