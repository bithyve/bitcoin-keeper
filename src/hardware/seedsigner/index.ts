import { Psbt } from 'bitcoinjs-lib';
import { DerivationPurpose } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';

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
  return { xpub, derivationPath, masterFingerprint: xfp?.toUpperCase(), forMultiSig, forSingleSig };
};

export const updateInputsForSeedSigner = ({ serializedPSBT, signedSerializedPSBT }) => {
  const unsignedPsbt = Psbt.fromBase64(serializedPSBT);
  const unsignedInputs = unsignedPsbt.data.inputs;
  const signedPsbt = Psbt.fromBase64(signedSerializedPSBT);
  signedPsbt.data.inputs.forEach((_, index) => {
    try {
      signedPsbt.updateInput(index, unsignedInputs[index]);
    } catch (error) {
      console.error(`Error updating input at index ${index}:`, error);
    }
  });
  return { signedPsbt: signedPsbt.toBase64() };
};

export const manipulateSeedSignerData = (data: string) => {
  const match = data.match(/\[([a-f0-9]+)\/(.+?)\](\w+)/);
  if (!match) return null;
  const [, mfp, derivationPath, xPub] = match;
  return {
    mfp,
    derivationPath: 'm/' + derivationPath,
    xPub,
  };
};
