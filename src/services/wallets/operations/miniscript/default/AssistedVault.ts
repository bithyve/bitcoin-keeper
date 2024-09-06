import { getDerivationPath } from 'src/utils/service-utilities/utils';
import { MiniscriptElements } from '../../../interfaces/vault';
import { KeyInfo, Phase } from '../policy-generator';

export const ASSISTED_VAULT_TIMELOCKS = {
  T1: 118080,
  T2: 4230,
};

// contains the defaults for the Assisted Vault
// these elements are to be provided by the generic user-interface for the miniscript based vaults
export function generateAssistedVaultElements(signers, timelocks: number[]): MiniscriptElements {
  if (signers.length !== 3) throw new Error('Invalid singer count for the Advisor Vault(default)');

  enum Identifiers { // these key identifiers/alias should be provided by the user via the interface
    user = 'UK',
    advisor1 = 'AK1',
    advisor2 = 'AK2',
  }
  const [user, advisor1, advisor2] = signers;

  const keysInfo: KeyInfo[] = [
    {
      identifier: Identifiers.user,
      descriptor: `[${user.masterFingerprint}/${getDerivationPath(user.derivationPath)}]${
        user.xpub
      }`,
    },
    {
      identifier: Identifiers.advisor1,
      descriptor: `[${advisor1.masterFingerprint}/${getDerivationPath(advisor1.derivationPath)}]${
        advisor1.xpub
      }`,
    },
    {
      identifier: Identifiers.advisor2,
      descriptor: `[${advisor2.masterFingerprint}/${getDerivationPath(advisor2.derivationPath)}]${
        advisor2.xpub
      }`,
    },
  ];

  const signerFingerprints = {
    [Identifiers.user]: user.masterFingerprint,
    [Identifiers.advisor1]: advisor1.masterFingerprint,
    [Identifiers.advisor2]: advisor2.masterFingerprint,
  };

  const [timelock1, timelock2] = timelocks;
  const { userKey, advisorKey1, advisorKey2 } = keysInfo.reduce(
    (acc: Record<string, KeyInfo>, key) => {
      switch (key.identifier) {
        case 'UK':
          acc.userKey = key;
          break;
        case 'AK1':
          acc.advisorKey1 = key;
          break;
        case 'AK2':
          acc.advisorKey2 = key;
          break;
        default:
          throw new Error(`Unknown key identifier: ${key.identifier}`);
      }
      return acc;
    },
    {}
  );

  const phases: Phase[] = [
    {
      timelock: 0,
      paths: [
        { threshold: 2, keys: [userKey, advisorKey1] },
        { threshold: 2, keys: [userKey, advisorKey2] },
      ],
      requiredPaths: 1,
    },
    {
      timelock: timelock1,
      paths: [{ threshold: 1, keys: [userKey] }],
      requiredPaths: 1,
    },
    {
      timelock: timelock2,
      paths: [{ threshold: 2, keys: [advisorKey1, advisorKey2] }],
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
