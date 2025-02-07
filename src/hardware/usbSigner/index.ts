import { XpubTypes } from 'src/services/wallets/enums';
import { XpubDetailsType } from 'src/services/wallets/interfaces/vault';
import { HWErrorType } from 'src/models/enums/Hardware';
import HWError from '../HWErrorState';
export const getUSBSignerDetails = (data, isMultisig) => {
  try {
    const {
      multiSigPath,
      multiSigXpub,
      singleSigPath,
      singleSigXpub,
      taprootPath,
      taprootXpub,
      mfp,
    } = data;
    const xpubDetails: XpubDetailsType = {};
    xpubDetails[XpubTypes.P2WPKH] = { xpub: singleSigXpub, derivationPath: singleSigPath };
    xpubDetails[XpubTypes.P2WSH] = { xpub: multiSigXpub, derivationPath: multiSigPath };
    xpubDetails[XpubTypes.P2TR] = { xpub: taprootXpub, derivationPath: taprootPath };
    const xpub = isMultisig ? multiSigXpub : singleSigXpub;
    // TODO: Not actually used for USB signer, should eventually remove
    const derivationPath = isMultisig ? multiSigPath : singleSigPath;
    return {
      xpub,
      derivationPath,
      masterFingerprint: mfp?.toUpperCase(),
      xpubDetails,
    };
  } catch (_) {
    throw new HWError(HWErrorType.INCORRECT_HW);
  }
};
