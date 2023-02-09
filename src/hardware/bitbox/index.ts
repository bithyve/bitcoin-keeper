import { SignerType, XpubTypes } from 'src/core/wallets/enums';
import { Vault, XpubDetailsType } from 'src/core/wallets/interfaces/vault';
import { HWErrorType } from 'src/common/data/enums/Hardware';
import HWError from '../HWErrorState';

export const getBitbox02Details = (data, isMultisig) => {
  try {
    const { multiSigPath, multiSigXpub, singleSigPath, singleSigXpub } = data;
    const xpubDetails: XpubDetailsType = {};
    xpubDetails[XpubTypes.P2WPKH] = { xpub: singleSigXpub, derivationPath: singleSigPath };
    xpubDetails[XpubTypes.P2WSH] = { xpub: multiSigXpub, derivationPath: multiSigPath };
    const xpub = isMultisig ? multiSigXpub : singleSigXpub;
    const derivationPath = isMultisig ? multiSigPath : singleSigPath;
    return { xpub, derivationPath, xfp: data.xfp, xpubDetails };
  } catch (_) {
    throw new HWError(HWErrorType.INCORRECT_HW);
  }
};

export const getWalletConfigForBitBox02 = ({ vault }: { vault: Vault }) => {
  const ourXPubIndex = vault.signers.findIndex((signer) => signer.type === SignerType.BITBOX02);
  const keypathAccountDerivation = vault.signers.find(
    (signer) => signer.type === SignerType.BITBOX02
  ).derivationPath;
  return {
    ourXPubIndex,
    keypathAccountDerivation,
    threshold: vault.scheme.m,
    xpubs: vault.signers.map((signer) => signer.xpub),
  };
};
