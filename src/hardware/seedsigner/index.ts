import { Psbt } from 'bitcoinjs-lib';
import { DerivationPurpose } from 'src/core/wallets/enums';
import WalletUtilities from 'src/core/wallets/operations/utils';

export const getSeedSignerDetails = (qrData) => {
  const xpub = qrData.slice(qrData.indexOf(']') + 1);
  const xfp = qrData.slice(1, 9);
  const derivationPath = qrData
    .slice(qrData.indexOf('[') + 1, qrData.indexOf(']'))
    .replace(xfp, 'm');
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
  return { xpub, derivationPath, masterFingerprint: xfp, forMultiSig, forSingleSig };
};

export const updateInputsForSeedSigner = ({ serializedPSBT, signedSerializedPSBT }) => {
  const unsignedPsbt = Psbt.fromBase64(serializedPSBT);
  const unsignedInputs = unsignedPsbt.data.inputs;
  const signedPsbt = Psbt.fromBase64(signedSerializedPSBT);
  signedPsbt.data.inputs.forEach((_, index) => {
    signedPsbt.updateInput(index, unsignedInputs[index]);
  });
  return { signedPsbt: signedPsbt.toBase64() };
};
