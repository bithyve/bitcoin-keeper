import WalletUtilities from 'src/services/wallets/operations/utils';
import { DerivationPurpose, XpubTypes } from 'src/services/wallets/enums';
import { XpubDetailsType } from 'src/services/wallets/interfaces/vault';

export const getJadeDetails = (qrData) => {
  const { derivationPath, xPub: xpub, mfp } = qrData;
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
  return { xpub, derivationPath, masterFingerprint: mfp?.toUpperCase(), forMultiSig, forSingleSig };
};

export const extractJadeExport = (data) => {
  const xpubDetails: XpubDetailsType = {};
  const { [DerivationPurpose.BIP84]: singleSig, [DerivationPurpose.BIP48]: multisig } = data;
  const masterFingerprint = Object.values(data).find((item: any) => item.mfp)?.mfp;
  if (singleSig) {
    xpubDetails[XpubTypes.P2WPKH] = {
      xpub: singleSig.xPub,
      derivationPath: singleSig.derivationPath,
    };
  }
  if (multisig) {
    xpubDetails[XpubTypes.P2WSH] = { xpub: multisig.xPub, derivationPath: multisig.derivationPath };
  }
  const xpub = multisig ? multisig.xPub : singleSig.xPub;
  const derivationPath = multisig ? multisig.derivationPath : singleSig.derivationPath;
  return { xpub, derivationPath, masterFingerprint, xpubDetails };
};
