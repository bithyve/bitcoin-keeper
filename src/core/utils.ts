import { VaultScheme, VaultSigner } from './wallets/interfaces/vault';

export const getDerivationPath = (derivationPath: string) =>
  derivationPath.substring(2).split("'").join('h');

export const getMultiKeyExpressions = (signers: VaultSigner[]) => {
  const keyExpressions = signers.map((signer: VaultSigner) =>
    getKeyExpression(
      signer.masterFingerprint,
      signer.derivationPath,
      signer.xpub,
      signer.type,
      signer.signerDescription
    )
  );
  return keyExpressions.join();
};

export const getKeyExpression = (
  masterFingerprint: string,
  derivationPath: string,
  xpub: string,
  type: string,
  description: string
) =>
  `{${type}${description ? `-${description}` : ''}}[${masterFingerprint}/${getDerivationPath(
    derivationPath
  )}]${xpub}/<0;1>/*`;

export const genrateOutputDescriptors = (
  isMultisig: boolean,
  signers: VaultSigner[],
  scheme: VaultScheme
) => {
  if (!isMultisig) {
    const signer: VaultSigner = signers[0];
    return `wpkh(${getKeyExpression(
      signer.masterFingerprint,
      signer.derivationPath,
      signer.xpub,
      signer.type,
      signer.signerDescription
    )})`;
  }
  return `wsh(sortedmulti(${scheme.m},${getMultiKeyExpressions(signers)}))`;
};
