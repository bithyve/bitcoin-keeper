import { Psbt } from 'bitcoinjs-lib';
import config from 'src/core/config';
import WalletUtilities from 'src/core/wallets/operations/utils';

export const getSeedSignerDetails = (qrData) => {
  let xpub = qrData.slice(qrData.indexOf(']') + 1);
  const xfp = qrData.slice(1, 9);
  const derivationPath = qrData
    .slice(qrData.indexOf('[') + 1, qrData.indexOf(']'))
    .replace(xfp, 'm');

  const network = WalletUtilities.getNetworkByType(config.NETWORK_TYPE);
  xpub = WalletUtilities.generateXpubFromYpub(xpub, network);
  return { xpub, derivationPath, xfp };
};

export const updateInputsForSeedSigner = ({ serializedPSBT, signedSerializedPSBT }) => {
  const unsignedPsbt = Psbt.fromBase64(serializedPSBT);
  const unsignedInputs = unsignedPsbt.data.inputs;
  const signedPsbt = Psbt.fromBase64(signedSerializedPSBT);
  signedPsbt.data.inputs.forEach((input, index) => {
    signedPsbt.updateInput(index, unsignedInputs[index]);
  });
  return { signedPsbt: signedPsbt.toBase64() };
};
