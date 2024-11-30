import { getDerivationPath } from 'src/utils/service-utilities/utils';
import { MiniscriptElements, VaultScheme, VaultSigner } from '../../../interfaces/vault';
import { KeyInfo, Phase } from '../policy-generator';

// contains the defaults for the Inheritance Vault
export function generateInheritanceVaultElements(
  signers: VaultSigner[],
  inheritanceSigner: VaultSigner,
  scheme: VaultScheme,
  timelocks: number[]
): MiniscriptElements {
  if (signers.length < 2) throw new Error('At least 2 signers are required for the Vault');
  if (scheme.m > signers.length) {
    throw new Error('Threshold (m) cannot be greater than the number of signers (n)');
  }

  const keysInfo: KeyInfo[] = signers.map((signer, index) => ({
    identifier: `K${index + 1}`,
    descriptor: `[${signer.masterFingerprint}/${getDerivationPath(signer.derivationPath)}]${
      signer.xpub
    }`,
  }));

  const inheritanceKeyInfo: KeyInfo = {
    identifier: 'IK1',
    descriptor: `[${inheritanceSigner.masterFingerprint}/${getDerivationPath(
      inheritanceSigner.derivationPath
    )}]${inheritanceSigner.xpub}`,
  };

  if (keysInfo.length !== scheme.n) throw new Error('Invalid inputs; scheme mismatch');

  const signerFingerprints = Object.fromEntries(
    signers.map((signer, index) => [`K${index + 1}`, signer.masterFingerprint])
  );

  const [timelock] = timelocks;

  const phases: Phase[] = [
    {
      id: 1,
      timelock: 0,
      paths: [{ id: 1, threshold: scheme.m, keys: keysInfo }],
      requiredPaths: 1,
    },
    {
      id: 2,
      timelock,
      // paths: [{ id: 1, threshold: scheme.m, keys: [...keysInfo, inheritanceKeyInfo] }],
      paths: [{ id: 1, threshold: scheme.m, keys: [...keysInfo] }],

      requiredPaths: 1,
    },
  ];

  const miniscriptElements = {
    keysInfo: [...keysInfo, inheritanceKeyInfo],
    timelocks,
    phases,
    signerFingerprints,
  };

  return miniscriptElements;
}
