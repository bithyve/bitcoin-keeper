/* eslint-disable no-await-in-loop */
import { SignerType } from 'src/services/wallets/enums';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import { getKeyUID } from 'src/utils/utilities';

export const getWalletConfigForBitBox02 = ({ vault, signer }: { vault: Vault; signer: Signer }) => {
  const ourXPubIndex = vault.signers.findIndex(
    (vaultKey) => signer.type === SignerType.BITBOX02 && getKeyUID(signer) === getKeyUID(vaultKey)
  );
  const keypathAccountDerivation = vault.signers.find(
    (vaultKey) => signer.type === SignerType.BITBOX02 && getKeyUID(signer) === getKeyUID(vaultKey)
  ).derivationPath;
  return {
    ourXPubIndex,
    keypathAccountDerivation,
    threshold: vault.scheme.m,
    xpubs: vault.signers.map((signer) => signer.xpub),
  };
};
