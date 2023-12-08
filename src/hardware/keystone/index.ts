import WalletUtilities from 'src/core/wallets/operations/utils';
import { DerivationPurpose } from 'src/core/wallets/enums';
import * as bitcoin from 'bitcoinjs-lib';

const getKeystoneDetails = (qrData) => {
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
  return { xpub, derivationPath, xfp: mfp, forMultiSig, forSingleSig };
};

const getKeystoneDetailsFromFile = (data) => {
  const { path: derivationPath, xpub, xfp } = data;
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
  return { xpub, derivationPath, xfp, forMultiSig, forSingleSig };
};

const getTxHexFromKeystonePSBT = (psbt, signedPsbt): bitcoin.Transaction => {
  const finalized = bitcoin.Psbt.fromBase64(psbt).combine(bitcoin.Psbt.fromBase64(signedPsbt));
  let extractedTransaction;
  try {
    extractedTransaction = finalized.finalizeAllInputs().extractTransaction();
  } catch (_) {
    extractedTransaction = finalized.extractTransaction();
  }
  return extractedTransaction;
};

export { getKeystoneDetails, getTxHexFromKeystonePSBT, getKeystoneDetailsFromFile };
