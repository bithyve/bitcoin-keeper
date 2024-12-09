import { getDerivationPath } from 'src/utils/service-utilities/utils';
import { MiniscriptElements, VaultScheme, VaultSigner } from '../../../interfaces/vault';
import { KeyInfo, Phase } from '../policy-generator';

export const TIMELOCKED_VAULT_TIMELOCKS_TESTNET = {
  MONTHS_3: 3,
  MONTHS_6: 6,
  MONTHS_12: 12,
};

export const TIMELOCKED_VAULT_TIMELOCKS_MAINNET = {
  MONTHS_3: 13140,
  MONTHS_6: 26280,
  MONTHS_12: 52560,
};

// contains the defaults for the Timelocked Vault
// these elements are to be provided by the generic user-interface for the miniscript based vaults
export function generateTimelockedVaultElements(
  signers: VaultSigner[],
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

  if (keysInfo.length !== scheme.n) throw new Error('Invalid inputs; scheme mismatch');

  const signerFingerprints = Object.fromEntries(
    signers.map((signer, index) => [`K${index + 1}`, signer.masterFingerprint])
  );

  const [timelock] = timelocks;

  const phases: Phase[] = [
    {
      id: 1,
      timelock,
      paths: [{ id: 1, threshold: scheme.m, keys: keysInfo }],
      requiredPaths: 1,
    },
  ];

  const miniscriptElements = {
    keysInfo,
    timelocks,
    phases,
    signerFingerprints,
  };

  return miniscriptElements;
}
