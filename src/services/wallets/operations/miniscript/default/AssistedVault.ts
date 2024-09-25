import { getDerivationPath } from 'src/utils/service-utilities/utils';
import { MiniscriptElements, VaultSigner } from '../../../interfaces/vault';
import { KeyInfo, Phase } from '../policy-generator';

export const ASSISTED_VAULT_TIMELOCKS_TESTNET = {
  T1: 15,
  T2: 15 + 10,
};

export const ASSISTED_VAULT_TIMELOCKS = {
  T1: 118080,
  T2: 118080 + 4320,
};

// contains the defaults for the Assisted Vault
// these elements are to be provided by the generic user-interface for the miniscript based vaults
export function generateAssistedVaultElements(
  signers: VaultSigner[],
  timelocks: number[]
): MiniscriptElements {
  if (signers.length !== 3) throw new Error('Invalid singer count for the Advisor Vault(default)');

  enum Identifiers { // these key identifiers/alias should be provided by the user via the interface
    UK = 'UK',
    AK1 = 'AK1',
    AK2 = 'AK2',
  }
  const [user, advisor1, advisor2] = signers;

  const keysInfo: KeyInfo[] = [
    {
      identifier: Identifiers.UK,
      descriptor: `[${user.masterFingerprint}/${getDerivationPath(user.derivationPath)}]${
        user.xpub
      }`,
    },
    {
      identifier: Identifiers.AK1,
      descriptor: `[${advisor1.masterFingerprint}/${getDerivationPath(advisor1.derivationPath)}]${
        advisor1.xpub
      }`,
    },
    {
      identifier: Identifiers.AK2,
      descriptor: `[${advisor2.masterFingerprint}/${getDerivationPath(advisor2.derivationPath)}]${
        advisor2.xpub
      }`,
    },
  ];

  const signerFingerprints = {
    [Identifiers.UK]: user.masterFingerprint,
    [Identifiers.AK1]: advisor1.masterFingerprint,
    [Identifiers.AK2]: advisor2.masterFingerprint,
  };

  const [timelock1, timelock2] = timelocks;
  const { userKey, advisorKey1, advisorKey2 } = keysInfo.reduce(
    (acc: Record<string, KeyInfo>, key) => {
      switch (key.identifier) {
        case Identifiers.UK:
          acc.userKey = key;
          break;
        case Identifiers.AK1:
          acc.advisorKey1 = key;
          break;
        case Identifiers.AK2:
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
      id: 1,
      timelock: 0,
      paths: [
        { id: 1, threshold: 2, keys: [userKey, advisorKey1] },
        { id: 2, threshold: 2, keys: [userKey, advisorKey2] },
      ],
      requiredPaths: 1,
    },
    // {
    //   id: 1,                     // phase1: alternate(optimized) arrangement, to be tested post generalized flow
    //   timelock: 0,
    //   paths: [
    //     { id: 1, threshold: 1, keys: [userKey] },
    //     { id: 2, threshold: 1, keys: [advisorKey1, advisorKey2] },
    //   ],
    //   requiredPaths: 2,
    // },
    {
      id: 2,
      timelock: timelock1,
      paths: [{ id: 1, threshold: 1, keys: [userKey] }],
      requiredPaths: 1,
    },
    {
      id: 3,
      timelock: timelock2,
      paths: [{ id: 1, threshold: 2, keys: [advisorKey1, advisorKey2] }],
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
