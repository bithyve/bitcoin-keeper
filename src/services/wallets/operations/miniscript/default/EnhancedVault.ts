import { getDerivationPath } from 'src/utils/service-utilities/utils';
import { MiniscriptElements, VaultScheme, VaultSigner } from '../../../interfaces/vault';
import { KeyInfo, Phase } from '../policy-generator';
import { getKeyUID } from 'src/utils/utilities';

export const ENHANCED_VAULT_TIMELOCKS_TESTNET = {
  MONTHS_3: 3,
  MONTHS_6: 6,
  MONTHS_12: 12,
  MONTHS_18: 18,
  MONTHS_24: 24,
  MONTHS_30: 30,
  MONTHS_36: 36,
  MONTHS_42: 42,
  MONTHS_48: 48,
  MONTHS_54: 54,
  MONTHS_60: 60,
};

export const ENHANCED_VAULT_TIMELOCKS_MAINNET = {
  MONTHS_3: 13140,
  MONTHS_6: 26280,
  MONTHS_12: 52560,
  MONTHS_18: 78840,
  MONTHS_24: 105120,
  MONTHS_30: 131400,
  MONTHS_36: 157680,
  MONTHS_42: 183960,
  MONTHS_48: 210240,
  MONTHS_54: 236520,
  MONTHS_60: 262800,
};

export const INHERITANCE_KEY_IDENTIFIER = 'IK';
export const EMERGENCY_KEY_IDENTIFIER = 'EK';

/**
 * Generates the miniscript elements for Enhanced Vaults
 *
 * Miniscript Analysis(produced by the policy-lang generator based on the miniscript elements from the function below)
 *
 * or_d
 * * multi(m of n)
 * and_v
 * * v: pkh(EK)
 * * after(3493966)
 *
 * Resulting script structure(sample: 2 of 3 multisig w/ Emergency Key)
 *
 * 2 <K1<0;1>> <K2<0;1>> <K3<0;1>> 3 OP_CHECKMULTISIG OP_IFDUP OP_NOTIF
 *   OP_DUP OP_HASH160 <HASH160(<EK1<0;1>>)> OP_EQUALVERIFY OP_CHECKSIGVERIFY <4e5035>
 *   OP_CHECKLOCKTIMEVERIFY
 * OP_ENDIF
 */
export function generateEnhancedVaultElements(
  signers: VaultSigner[],
  inheritanceSigners: { signer: VaultSigner; timelock: number }[],
  emergencySigners: { signer: VaultSigner; timelock: number }[],
  scheme: VaultScheme
): MiniscriptElements {
  if (scheme.m > signers.length) {
    throw new Error('Threshold (m) cannot be greater than the number of signers (n)');
  }

  const keysInfo: KeyInfo[] = signers.map((signer, index) => ({
    identifier: `K${index + 1}`,
    descriptor: `[${signer.masterFingerprint}/${getDerivationPath(signer.derivationPath)}]${
      signer.xpub
    }`,
  }));

  const inheritanceKeysInfo: KeyInfo[] = inheritanceSigners.map((signerInfo, index) => ({
    identifier: `${INHERITANCE_KEY_IDENTIFIER}${index + 1}`,
    descriptor: `[${signerInfo.signer.masterFingerprint}/${getDerivationPath(
      signerInfo.signer.derivationPath
    )}]${signerInfo.signer.xpub}`,
  }));

  const emergencyKeysInfo: KeyInfo[] = emergencySigners.map((signerInfo, index) => ({
    identifier: `${EMERGENCY_KEY_IDENTIFIER}${index + 1}`,
    descriptor: `[${signerInfo.signer.masterFingerprint}/${getDerivationPath(
      signerInfo.signer.derivationPath
    )}]${signerInfo.signer.xpub}`,
  }));

  if (keysInfo.length !== scheme.n) throw new Error('Invalid inputs; scheme mismatch');

  const signerFingerprints = Object.fromEntries(
    [...keysInfo, ...inheritanceKeysInfo, ...emergencyKeysInfo].map((signer) => [
      signer.identifier,
      signer.descriptor.substring(1, 9),
    ])
  );

  // Ensure keys are not used twice with different accounts
  const fingerprintKeyUIDs = new Map<string, string>();

  [
    ...signers,
    ...inheritanceSigners.map((s) => s.signer),
    ...emergencySigners.map((s) => s.signer),
  ].forEach((signer) => {
    const existingKeyUID = fingerprintKeyUIDs.get(signer.masterFingerprint);
    if (existingKeyUID && existingKeyUID !== getKeyUID(signer)) {
      throw new Error('Cannot setup vault with multiple accounts from the same signer.');
    }
    fingerprintKeyUIDs.set(signer.masterFingerprint, getKeyUID(signer));
  });

  const timelocks = [...inheritanceSigners, ...emergencySigners]
    .map((s) => s.timelock)
    .sort((a, b) => a - b);

  // Combine inheritance and emergency signers and sort by timelock
  const timelockSigners = [
    ...inheritanceSigners.map((signer, idx) => ({
      timelock: signer.timelock,
      keyInfo: inheritanceKeysInfo[idx],
    })),
    ...emergencySigners.map((signer, idx) => ({
      timelock: signer.timelock,
      keyInfo: emergencyKeysInfo[idx],
    })),
  ].sort((a, b) => a.timelock - b.timelock);

  // Group signers by timelock
  const signersByTimelock = timelockSigners.reduce((acc, signer) => {
    const timelock = signer.timelock;
    if (!acc[timelock]) {
      acc[timelock] = [];
    }
    acc[timelock].push(signer);
    return acc;
  }, {} as Record<number, typeof timelockSigners>);

  const currentQuorum = keysInfo;
  const currentThreshold = scheme.m;

  const probabilities =
    timelocks.length === 0
      ? [1]
      : [
          Number('9'.repeat(timelocks.length)),
          ...Array(timelocks.length)
            .fill(0)
            .map((_, i) => Number('9'.repeat(timelocks.length - 1 - i))),
          1,
        ];

  // Create phases for each unique timelock
  const timelockPhases: Phase[] = Object.entries(signersByTimelock).map(
    ([timelock, signers], phaseIndex) => {
      // Separate inheritance and emergency signers
      const inheritanceSigners = signers.filter((s) =>
        s.keyInfo.identifier.startsWith(INHERITANCE_KEY_IDENTIFIER)
      );
      const emergencySigners = signers.filter((s) =>
        s.keyInfo.identifier.startsWith(EMERGENCY_KEY_IDENTIFIER)
      );

      if (inheritanceSigners.length) {
        currentQuorum.push(...inheritanceSigners.map((s) => s.keyInfo));
      }

      const paths = [
        // Only add inheritance path if there are inheritance signers
        ...(inheritanceSigners.length > 0
          ? [
              {
                id: 1,
                threshold: currentThreshold,
                keys: currentQuorum,
              },
            ]
          : []),

        ...emergencySigners.map((signer, idx) => ({
          id: inheritanceSigners.length ? idx + 2 : idx + 1,
          threshold: 1,
          keys: [signer.keyInfo],
        })),
      ].filter(Boolean);

      return {
        id: phaseIndex + 2,
        timelock: parseInt(timelock),
        paths,
        requiredPaths: 1,
        probability: probabilities[phaseIndex + 1],
      };
    }
  );

  const phases: Phase[] = [
    {
      id: 1,
      timelock: 0,
      paths: [{ id: 1, threshold: scheme.m, keys: keysInfo }],
      requiredPaths: 1,
      probability: probabilities[0],
    },
    ...timelockPhases,
  ];

  const miniscriptElements = {
    keysInfo: [...keysInfo, ...inheritanceKeysInfo, ...emergencyKeysInfo],
    timelocks,
    phases,
    signerFingerprints,
  };

  console.log('Generated Miniscript elements:');
  console.log(JSON.stringify(miniscriptElements, null, 2));

  return miniscriptElements;
}

export function getKeyTimelock(
  keyIdentifier: string,
  miniscriptElements: MiniscriptElements
): number {
  // Check all phases in order
  for (const phase of miniscriptElements.phases) {
    // Check all paths in the phase
    for (const path of phase.paths) {
      // Check if the key is used in this path
      if (path.keys.some((key) => key.identifier === keyIdentifier)) {
        return phase.timelock;
      }
    }
  }

  // If key is not found in any phase, return -1 or throw error
  return -1;
}
