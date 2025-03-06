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
