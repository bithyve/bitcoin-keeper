/* eslint-disable no-await-in-loop */
import { SignerType, XpubTypes } from 'src/services/wallets/enums';
import { Signer, Vault, XpubDetailsType } from 'src/services/wallets/interfaces/vault';
import { HWErrorType } from 'src/models/enums/Hardware';
import HWError from '../HWErrorState';

export const getBitbox02Details = (data, isMultisig) => {
  try {
    const { multiSigPath, multiSigXpub, singleSigPath, singleSigXpub, mfp } = data;
    const xpubDetails: XpubDetailsType = {};
    xpubDetails[XpubTypes.P2WPKH] = { xpub: singleSigXpub, derivationPath: singleSigPath };
    xpubDetails[XpubTypes.P2WSH] = { xpub: multiSigXpub, derivationPath: multiSigPath };
    const xpub = isMultisig ? multiSigXpub : singleSigXpub;
    const derivationPath = isMultisig ? multiSigPath : singleSigPath;
    return {
      xpub,
      derivationPath,
      masterFingerprint: mfp,
      xpubDetails,
    };
  } catch (_) {
    throw new HWError(HWErrorType.INCORRECT_HW);
  }
};

export const getWalletConfigForBitBox02 = ({ vault, signer }: { vault: Vault; signer: Signer }) => {
  const ourXPubIndex = vault.signers.findIndex(
    (vaultKey) =>
      signer.type === SignerType.BITBOX02 && signer.masterFingerprint === vaultKey.masterFingerprint
  );
  const keypathAccountDerivation = vault.signers.find(
    (vaultKey) =>
      signer.type === SignerType.BITBOX02 && signer.masterFingerprint === vaultKey.masterFingerprint
  ).derivationPath;
  return {
    ourXPubIndex,
    keypathAccountDerivation,
    threshold: vault.scheme.m,
    xpubs: vault.signers.map((signer) => signer.xpub),
  };
};
