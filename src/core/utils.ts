import { VaultScheme, VaultSigner } from './wallets/interfaces/vault';

export const getDerivationPath = (derivationPath: string) => {
  return derivationPath.substring(2).split("'").join('h');
};

export const getMultiKeyExpressions = (signers: VaultSigner[]) => {
  let keyExpressions = signers.map((signer: VaultSigner) => {
    return getKeyExpression(
      signer.xpubInfo.xfp,
      signer.xpubInfo.derivationPath,
      signer.xpub,
      signer.type,
      signer.signerDescription
    );
  });
  return keyExpressions.join();
};

export const getKeyExpression = (
  masterFingerprint: string,
  derivationPath: string,
  xpub: string,
  type: string,
  description: string
) => {
  return `{${type}${description ? `-${description}` : ''}}[${masterFingerprint}/${getDerivationPath(
    derivationPath
  )}]${xpub}/<0;1>/*`;
};

export const genrateOutputDescriptors = (
  isMultisig: boolean,
  signers: VaultSigner[],
  scheme: VaultScheme
) => {
  if (!isMultisig) {
    const signer: VaultSigner = signers[0];
    return `wpkh(${getKeyExpression(
      signer.xpubInfo.xfp,
      signer.xpubInfo.derivationPath,
      signer.xpub,
      signer.type,
      signer.signerDescription
    )})`;
  } else {
    return `sh(wsh(sortedmulti(${scheme.m},${getMultiKeyExpressions(signers)})))`;
  }
};
