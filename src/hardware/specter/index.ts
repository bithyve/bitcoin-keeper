import { DerivationPurpose } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';

export const getSpecterDetails = (qrData) => {
  const xpub = qrData.slice(qrData.indexOf(']') + 1);
  const masterFingerprint = qrData.slice(1, 9).toUpperCase();
  const derivationPath = qrData
    .slice(qrData.indexOf('[') + 1, qrData.indexOf(']'))
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

export const manipulateSpecterData = (data: string) => {
  const match = data.match(/\[([a-f0-9]+)\/(.+?)\](\w+)/);
  if (!match) return null;
  const [, mfp, derivationPath, xPub] = match;
  return {
    mfp,
    derivationPath: 'm/' + derivationPath,
    xPub,
  };
};