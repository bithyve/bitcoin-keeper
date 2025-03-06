import { Psbt } from 'bitcoinjs-lib';
import { DerivationPurpose, XpubTypes } from 'src/services/wallets/enums';
import { XpubDetailsType } from 'src/services/wallets/interfaces/vault';
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
    signedPsbt.updateInput(index, unsignedInputs[index]);
  });
  return { signedPsbt: signedPsbt.toBase64() };
};

export const extractSeedSignerExport = (data) => {
  const xpubDetails: XpubDetailsType = {};
  const {
    [DerivationPurpose.BIP84]: singleSig,
    [DerivationPurpose.BIP48]: multisig,
    [DerivationPurpose.BIP86]: taproot,
  } = data;
  const masterFingerprint = Object.values(data).find((item: any) => item.mfp)?.mfp;
  if (singleSig) {
    xpubDetails[XpubTypes.P2WPKH] = {
      xpub: singleSig?.xPub,
      derivationPath: singleSig?.derivationPath,
    };
  }
  if (multisig) {
    xpubDetails[XpubTypes.P2WSH] = {
      xpub: multisig?.xPub,
      derivationPath: multisig?.derivationPath,
    };
  }
  if (taproot) {
    xpubDetails[XpubTypes.P2TR] = { xpub: taproot?.xPub, derivationPath: taproot?.derivationPath };
  }

  const xpub = multisig ? multisig.xPub : taproot ? taproot.xPub : singleSig.xPub;
  const derivationPath = multisig
    ? multisig.derivationPath
    : taproot
    ? taproot.xPub
    : singleSig.derivationPath;
  return { xpub, derivationPath, masterFingerprint, xpubDetails };
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