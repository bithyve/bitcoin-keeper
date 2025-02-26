import { MiniscriptElements, MiniscriptScheme } from '../../interfaces/vault';
import { generateScriptWitnesses } from './miniscript';

export interface KeyInfo {
  identifier: string;
  descriptor: string;
  uniqueKeyIdentifier?: string;
}

export interface KeyInfoMap {
  [uniqueIdentifier: string]: string; // maps unique key identifiers to unique descriptors
}

export interface Path {
  id: number;
  keys: KeyInfo[];
  threshold: number;
}

export interface Phase {
  id: number;
  timelock: number;
  paths: Path[];
  requiredPaths: number; // Number of paths required to satisfy the phase's threshold
  probability?: number; // relative probability of the phase being executed
  // Note: probability difference between phases needs to be of a certain threshold for script optimization by the compiler. For ex(MS-IK): or(4@POL1, 1@POL2) -> optimization while or(3@POL1, 1@POL2) -> no optimization
}

function combinations<T>(array: T[], r: number): T[][] {
  if (r > array.length) return [];
  if (r === array.length) return [array];
  if (r === 1) return array.map((el) => [el]);

  return array.reduce((acc, el, i) => {
    const subarrays = combinations(array.slice(i + 1), r - 1);
    return acc.concat(subarrays.map((subarray) => [el, ...subarray]));
  }, [] as T[][]);
}

function deriveKeyUsageCount(
  existingMiniscriptScheme: MiniscriptScheme,
  miniscriptElements: MiniscriptElements
): Record<string, number> {
  const {
    keyInfoMap: existingKeyInfoMap,
    miniscriptElements: { signerFingerprints: existingSignerFingerprints },
  } = existingMiniscriptScheme;
  const { signerFingerprints } = miniscriptElements;
  const keyUsageCounts: Record<string, number> = {};

  for (const currentIdentifier in signerFingerprints) {
    const fingerprint = signerFingerprints[currentIdentifier];

    for (const identifier in existingSignerFingerprints) {
      if (existingSignerFingerprints[identifier] === fingerprint) {
        const previousIdentifier = identifier;

        for (const key in existingKeyInfoMap) {
          const [parsedKey, multipath] = key.split('<');

          if (parsedKey === previousIdentifier) {
            // extract externalIndex from <externalIndex;internalIndex>
            const externalIndex = parseInt(multipath.split(';')[0], 10);

            // update the keyUsageCounts with the largest count(derived using externalIndex) for each parsedKey equivalent to the previousIdentifier
            const usageCount = externalIndex / 2 + 1;
            if (
              keyUsageCounts[fingerprint] === undefined ||
              usageCount > keyUsageCounts[fingerprint]
            ) {
              keyUsageCounts[fingerprint] = usageCount;
            }
          }
        }
      }
    }
  }

  return keyUsageCounts;
}

// generates a unique identifier based on frequency of the keys
// miniscript policy restriction: no two paths can have the same public key(and therefore the identifiers need to be distinct for successful policy compilation)
function generateUniqueKeyIdentifier(
  key: KeyInfo,
  keyUsageCounts: Record<string, number>,
  keyInfoMap: KeyInfoMap
): string {
  const fingerprint = key.descriptor.substring(1, 9);
  keyUsageCounts[fingerprint] = (keyUsageCounts[fingerprint] || 0) + 1;
  const externalIndex = (keyUsageCounts[fingerprint] - 1) * 2;
  const changeIndex = externalIndex + 1;
  const suffix = `${externalIndex};${changeIndex}`;
  const uniqueIdentifier = `${key.identifier}<${suffix}>`;
  keyInfoMap[uniqueIdentifier] = `${key.descriptor}/<${suffix}>/*`;
  return uniqueIdentifier;
}

const isGeneratedPolicyValid = (policy: string, miniscriptPhases: Phase[]): boolean => {
  const { scriptWitnesses } = generateScriptWitnesses(policy);

  for (const phase of miniscriptPhases) {
    if (phase.paths.length < phase.requiredPaths) {
      throw new Error('Invalid path to threshold ratio');
    }

    const witnessesInPhase = scriptWitnesses.filter((witness) =>
      phase.timelock ? witness.nLockTime === phase.timelock : !witness.nLockTime
    );

    const pathCombinations = combinations(phase.paths, phase.requiredPaths);

    const allCombinationsValid = pathCombinations.every((pathCombination) => {
      return witnessesInPhase.some((witness) =>
        pathCombination.every((path) => {
          const presentKeys = path.keys.filter((key) =>
            witness.asm.includes(key.uniqueKeyIdentifier)
          );
          return presentKeys.length >= path.threshold;
        })
      );
    });

    if (!allCombinationsValid) return false;
  }
  return true;
};

function nestOrFragments(policies: string[], probabilities: number[]): string {
  if (policies.length === 1) return policies[0];
  if (policies.length === 2) {
    return `or(${probabilities[0]}@${policies[0]}, ${probabilities[1]}@${policies[1]})`;
  }

  const [firstPolicy, ...restPolicies] = policies;
  const [firstProbability, ...restProbabilities] = probabilities;

  return `or(${firstProbability}@${firstPolicy}, ${nestOrFragments(
    restPolicies,
    restProbabilities
  )})`;
}

export const generateMiniscriptPolicy = (
  miniscriptElements: MiniscriptElements,
  existingMiniscriptScheme?: MiniscriptScheme,
  importedKeyUsageCounts?: Record<string, number>
): { miniscriptPhases: Phase[]; policy: string; keyInfoMap: KeyInfoMap } => {
  const { phases: miniscriptPhases } = miniscriptElements;

  const keyUsageCounts: Record<string, number> = importedKeyUsageCounts
    ? Object.entries(miniscriptElements.signerFingerprints).reduce(
        (acc, [identifier, fingerprint]) => {
          if (importedKeyUsageCounts[fingerprint] !== undefined) {
            acc[identifier] = importedKeyUsageCounts[fingerprint];
          }
          return acc;
        },
        {} as Record<string, number>
      )
    : existingMiniscriptScheme
    ? deriveKeyUsageCount(existingMiniscriptScheme, miniscriptElements)
    : {};

  const keyInfoMap: KeyInfoMap = {};

  const policyParts: string[] = miniscriptPhases.map((phase, phaseIndex) => {
    const pathPolicies: string[] = phase.paths.map((path) => {
      const uniqueKeys = path.keys.map((key) =>
        generateUniqueKeyIdentifier(key, keyUsageCounts, keyInfoMap)
      );

      for (let index = 0; index < path.keys.length; index++) {
        path.keys[index] = {
          ...path.keys[index],
          uniqueKeyIdentifier: uniqueKeys[index],
        };
      }
      return path.keys.length > 1
        ? `thresh(${path.threshold}, ${uniqueKeys.map((key) => `pk(${key})`).join(', ')})`
        : `pk(${uniqueKeys[0]})`;
    });

    // combine paths within the phase using the phase's requiredPaths threshold
    let phasePolicyPart =
      pathPolicies.length > 1
        ? `thresh(${phase.requiredPaths}, ${pathPolicies.join(', ')})`
        : pathPolicies[0];

    if (phase.timelock) {
      phasePolicyPart = `thresh(2, after(${phase.timelock}), ${phasePolicyPart})`;
    }

    return phasePolicyPart;
  });

  // combine all phases, starting with the first one
  let policy;
  const hasProbability = miniscriptPhases.some((phase) => phase.probability !== undefined);
  if (hasProbability) {
    const probabilities = miniscriptPhases.map((phase) => phase.probability || 1);
    policy = nestOrFragments(policyParts, probabilities);
  } else {
    policy = policyParts.length > 1 ? `thresh(1, ${policyParts.join(', ')})` : policyParts[0];
  }

  console.log('Policy!!!!');
  console.log(policy);
  console.log(JSON.stringify(miniscriptPhases, null, 2));
  if (!isGeneratedPolicyValid(policy, miniscriptPhases)) {
    throw new Error('All paths of the generated policy are not valid');
  }

  return { miniscriptPhases, policy, keyInfoMap }; // miniscriptPhases w/ unique key identifier
};
