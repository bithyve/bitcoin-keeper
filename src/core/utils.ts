import { Vault, VaultScheme, VaultSigner } from './wallets/interfaces/vault';
import WalletOperations from './wallets/operations';

export const getDerivationPath = (derivationPath: string) =>
  derivationPath.substring(2).split("'").join('h');

export const getMultiKeyExpressions = (signers: VaultSigner[]) => {
  const keyExpressions = signers.map((signer: VaultSigner) =>
    getKeyExpression(signer.masterFingerprint, signer.derivationPath, signer.xpub)
  );
  return keyExpressions.join();
};

export const getKeyExpression = (masterFingerprint: string, derivationPath: string, xpub: string) =>
  `[${masterFingerprint}/${getDerivationPath(derivationPath)}]${xpub}/**`;

export const genrateOutputDescriptors = (
  isMultisig: boolean,
  signers: VaultSigner[],
  scheme: VaultScheme,
  vault: Vault
) => {
  const { receivingAddress } = WalletOperations.getNextFreeExternalAddress(vault);

  if (!isMultisig) {
    const signer: VaultSigner = signers[0];
    // eslint-disable-next-line no-use-before-define
    const des = `wpkh(${getKeyExpression(
      signer.masterFingerprint,
      signer.derivationPath,
      signer.xpub
    )})\nNo path restrictions\n${receivingAddress}`;
    return des;
  }
  return `wsh(sortedmulti(${scheme.m},${getMultiKeyExpressions(
    signers
  )})\nNo path restrictions\n${receivingAddress}`;
};
