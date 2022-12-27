import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';
import { DerivationPurpose } from 'src/core/wallets/enums';

const getKeystoneDetails = (qrData) => {
  const { derivationPath, xPub, mfp } = qrData;
  const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
  const xpub = WalletUtilities.generateXpubFromYpub(xPub, network);
  const purpose = WalletUtilities.getSignerPurposeFromPath(derivationPath);
  let forMultiSig = false;
  let forSingleSig = false;
  if (purpose && DerivationPurpose.BIP48.toString() === purpose) {
    forMultiSig = true;
    forSingleSig = false;
  } else {
    forMultiSig = false;
    forSingleSig = true;
  }
  return { xpub, derivationPath, xfp: mfp, forMultiSig, forSingleSig };
};

export { getKeystoneDetails };
