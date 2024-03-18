import { EntityKind, SignerStorage, SignerType, XpubTypes } from 'src/core/wallets/enums';
import { HWErrorType } from 'src/models/enums/Hardware';
import { crossInteractionHandler } from 'src/utils/utilities';
import { XpubDetailsType } from 'src/core/wallets/interfaces/vault';
import { generateMobileKey, generateSeedWordsKey } from 'src/core/wallets/factories/VaultFactory';
import config from 'src/core/config';
import { extractKeyFromDescriptor, generateSignerFromMetaData } from './index';
import { getSeedSignerDetails } from './seedsigner';
import HWError from './HWErrorState';
import { getSpecterDetails } from './specter';
import { getKeystoneDetails } from './keystone';
import { getJadeDetails } from './jade';
import { getPassportDetails } from './passport';

const setupPassport = (qrData, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
    getPassportDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const { signer: passport, key } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.PASSPORT,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return { signer: passport, key };
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const setupSeedSigner = (qrData, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
    getSeedSignerDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const { signer: seedSigner, key } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.SEEDSIGNER,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return { signer: seedSigner, key };
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const setupSpecter = (qrData, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
    getSpecterDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const { signer, key } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.SPECTER,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return { signer, key };
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const setupKeystone = (qrData, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
    getKeystoneDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const { signer: keystone, key } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.KEYSTONE,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return { signer: keystone, key };
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const setupJade = (qrData, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, forMultiSig, forSingleSig } =
    getJadeDetails(qrData);
  if ((isMultisig && forMultiSig) || (!isMultisig && forSingleSig)) {
    const { signer: jade, key } = generateSignerFromMetaData({
      xpub,
      derivationPath,
      masterFingerprint,
      signerType: SignerType.JADE,
      storageType: SignerStorage.COLD,
      isMultisig,
    });
    return { signer: jade, key };
  }
  throw new HWError(HWErrorType.INVALID_SIG);
};

const setupKeeperSigner = (qrData) => {
  try {
    let xpub, derivationPath, masterFingerprint, xpubDetails, xpriv;
    let signerType = SignerType.KEEPER;
    try {
      const data = extractKeyFromDescriptor(qrData);
      xpub = data.xpub;
      derivationPath = data.derivationPath;
      masterFingerprint = data.masterFingerprint;
      if (!data.forMultiSig) {
        throw new HWError(HWErrorType.INVALID_SIG);
      }
    } catch (err) {
      // support crypto-account
      if (qrData.xPub) {
        xpub = qrData.xPub;
        derivationPath = qrData.derivationPath;
        masterFingerprint = qrData.mfp;
      } else if (qrData.xpubDetails) {
        xpub = qrData.xpubDetails[XpubTypes.P2WSH].xpub;
        xpriv = qrData.xpubDetails[XpubTypes.P2WSH].xpriv;
        derivationPath = qrData.xpubDetails[XpubTypes.P2WSH].derivationPath;
        masterFingerprint = qrData.mfp;
        signerType = SignerType.MY_KEEPER;
      } else {
        throw err;
      }
    }
    const { signer: ksd, key } = generateSignerFromMetaData({
      xpub,
      xpriv,
      derivationPath,
      masterFingerprint,
      signerType,
      storageType: SignerStorage.WARM,
      isMultisig: true,
      xpubDetails,
    });
    return { signer: ksd, key };
  } catch (err) {
    if (err instanceof HWError) {
      throw err;
    }
    const message = crossInteractionHandler(err);
    throw new Error(message);
  }
};

const setupMobileKey = async ({ primaryMnemonic, isMultisig }) => {
  const networkType = config.NETWORK_TYPE;

  // fetched multi-sig mobile key
  const {
    xpub: multiSigXpub,
    xpriv: multiSigXpriv,
    derivationPath: multiSigPath,
    masterFingerprint,
  } = await generateMobileKey(primaryMnemonic, networkType);
  // fetched single-sig mobile key
  const {
    xpub: singleSigXpub,
    xpriv: singleSigXpriv,
    derivationPath: singleSigPath,
  } = await generateMobileKey(primaryMnemonic, networkType, EntityKind.WALLET);

  const xpubDetails: XpubDetailsType = {};
  xpubDetails[XpubTypes.P2WPKH] = {
    xpub: singleSigXpub,
    derivationPath: singleSigPath,
    xpriv: singleSigXpriv,
  };
  xpubDetails[XpubTypes.P2WSH] = {
    xpub: multiSigXpub,
    derivationPath: multiSigPath,
    xpriv: multiSigXpriv,
  };

  const { signer: mobileKey, key } = generateSignerFromMetaData({
    xpub: isMultisig ? multiSigXpub : singleSigXpub,
    derivationPath: isMultisig ? multiSigPath : singleSigPath,
    masterFingerprint,
    signerType: SignerType.MOBILE_KEY,
    storageType: SignerStorage.WARM,
    isMultisig: true,
    xpriv: isMultisig ? multiSigXpriv : singleSigXpriv,
    xpubDetails,
  });
  return { signer: mobileKey, key };
};

const setupSeedWordsBasedKey = (mnemonic: string, isMultisig: boolean) => {
  const networkType = config.NETWORK_TYPE;
  // fetched multi-sig seed words based key
  const {
    xpub: multiSigXpub,
    derivationPath: multiSigPath,
    masterFingerprint,
  } = generateSeedWordsKey(mnemonic, networkType, EntityKind.VAULT);
  // fetched single-sig seed words based key
  const { xpub: singleSigXpub, derivationPath: singleSigPath } = generateSeedWordsKey(
    mnemonic,
    networkType,
    EntityKind.WALLET
  );

  const xpubDetails: XpubDetailsType = {};
  xpubDetails[XpubTypes.P2WPKH] = { xpub: singleSigXpub, derivationPath: singleSigPath };
  xpubDetails[XpubTypes.P2WSH] = { xpub: multiSigXpub, derivationPath: multiSigPath };

  const { signer: softSigner, key } = generateSignerFromMetaData({
    xpub: isMultisig ? multiSigXpub : singleSigXpub,
    derivationPath: isMultisig ? multiSigPath : singleSigPath,
    masterFingerprint,
    signerType: SignerType.SEED_WORDS,
    storageType: SignerStorage.WARM,
    isMultisig,
    xpubDetails,
  });

  return { signer: softSigner, key };
};

export {
  setupPassport,
  setupSeedSigner,
  setupSpecter,
  setupKeystone,
  setupJade,
  setupKeeperSigner,
  setupMobileKey,
  setupSeedWordsBasedKey,
};
