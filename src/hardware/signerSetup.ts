import { EntityKind, SignerStorage, SignerType, XpubTypes } from 'src/services/wallets/enums';
import { HWErrorType } from 'src/models/enums/Hardware';
import { crossInteractionHandler } from 'src/utils/utilities';
import { XpubDetailsType } from 'src/services/wallets/interfaces/vault';
import {
  generateMobileKey,
  generateSeedWordsKey,
} from 'src/services/wallets/factories/VaultFactory';
import { createXpubDetails, extractKeyFromDescriptor, generateSignerFromMetaData } from './index';
import HWError from './HWErrorState';
import { getSpecterDetails } from './specter';
import { getKeystoneDetails } from './keystone';
import config from 'src/utils/service-utilities/config';
import { extractColdCardExport } from './coldcard';
import { RECOVERY_KEY_SIGNER_NAME } from 'src/constants/defaultData';
import { getUSBSignerDetails } from './usbSigner';

const setupPassport = (qrData, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, xpubDetails } = createXpubDetails(qrData);
  const { signer: passport, key } = generateSignerFromMetaData({
    xpub,
    derivationPath,
    masterFingerprint,
    signerType: SignerType.PASSPORT,
    storageType: SignerStorage.COLD,
    isMultisig,
    xpubDetails,
  });
  return { signer: passport, key };
};

const setupSeedSigner = (qrData, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, xpubDetails } = createXpubDetails(qrData);
  const { signer: seedSigner, key } = generateSignerFromMetaData({
    xpub,
    derivationPath,
    masterFingerprint,
    signerType: SignerType.SEEDSIGNER,
    storageType: SignerStorage.COLD,
    isMultisig,
    xpubDetails,
  });
  return { signer: seedSigner, key };
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

const setupJade = (qrData) => {
  const { xpub, derivationPath, masterFingerprint, xpubDetails } = createXpubDetails(qrData);
  const { signer: jade, key } = generateSignerFromMetaData({
    xpub,
    derivationPath,
    masterFingerprint,
    isMultisig: xpubDetails.hasOwnProperty(XpubTypes.P2WSH),
    signerType: SignerType.JADE,
    storageType: SignerStorage.COLD,
    xpubDetails,
  });
  return { signer: jade, key };
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
  } = await generateMobileKey(primaryMnemonic, networkType, true);
  // fetched single-sig mobile key
  const {
    xpub: singleSigXpub,
    xpriv: singleSigXpriv,
    derivationPath: singleSigPath,
  } = await generateMobileKey(primaryMnemonic, networkType, false);

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
  } = generateSeedWordsKey(mnemonic, networkType, true);
  // fetched single-sig seed words based key
  const { xpub: singleSigXpub, derivationPath: singleSigPath } = generateSeedWordsKey(
    mnemonic,
    networkType,
    false
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

const setupRecoveryKeySigningKey = (primaryMnemonic: string) => {
  const { signer: recoveryKeySigner } = setupSeedWordsBasedKey(primaryMnemonic, true);
  recoveryKeySigner.hidden = true;
  recoveryKeySigner.signerName = RECOVERY_KEY_SIGNER_NAME;
  return recoveryKeySigner;
};

const setupColdcard = (data, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, xpubDetails } = extractColdCardExport(
    data,
    isMultisig
  );
  const { signer, key } = generateSignerFromMetaData({
    xpub,
    derivationPath,
    masterFingerprint,
    isMultisig,
    signerType: SignerType.COLDCARD,
    storageType: SignerStorage.COLD,
    xpubDetails,
  });
  return { signer, key };
};

const setupUSBSigner = (signerType, data, isMultisig) => {
  const { xpub, derivationPath, masterFingerprint, xpubDetails } = getUSBSignerDetails(
    data,
    isMultisig
  );
  const { signer, key } = generateSignerFromMetaData({
    xpub,
    derivationPath,
    masterFingerprint,
    isMultisig,
    signerType,
    storageType: SignerStorage.COLD,
    xpubDetails,
  });
  return { signer, key };
};

export {
  setupPassport,
  setupSeedSigner,
  setupJade,
  setupKeystone,
  setupSpecter,
  setupKeeperSigner,
  setupColdcard,
  setupMobileKey,
  setupSeedWordsBasedKey,
  setupUSBSigner,
  setupRecoveryKeySigningKey,
};
