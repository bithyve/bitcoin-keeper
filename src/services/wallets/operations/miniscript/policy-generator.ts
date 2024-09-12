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
}

// generates a unique identifier based on frequency of the keys
// miniscript policy restriction: no two paths can have the same public key(and therefore the identifiers need to be distinct for successful policy compilation)
function generateUniqueKeyIdentifier(
  key: KeyInfo,
  keyUsageCounts: Record<string, number>,
  keyInfoMap: KeyInfoMap
): string {
  keyUsageCounts[key.identifier] = (keyUsageCounts[key.identifier] || 0) + 1;
  const externalIndex = (keyUsageCounts[key.identifier] - 1) * 2;
  const changeIndex = externalIndex + 1;
  const suffix = `${externalIndex};${changeIndex}`;
  const uniqueIdentifier = `${key.identifier}<${suffix}>`;
  keyInfoMap[uniqueIdentifier] = `${key.descriptor}/<${suffix}>/*`;
  return uniqueIdentifier;
}

// a thresh fragment based, flexible but not optimal, miniscript policy generator
export const generateMiniscriptPolicy = (
  miniscriptPhases: Phase[]
): { miniscriptPhases: Phase[]; policy: string; keyInfoMap: KeyInfoMap } => {
  const keyUsageCounts: Record<string, number> = {};
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

    // add timelock for phases after the initial one
    if (phaseIndex > 0) {
      phasePolicyPart = `thresh(2, after(${phase.timelock}), ${phasePolicyPart})`;
    }

    return phasePolicyPart;
  });

  // combine all phases, starting with the first one
  const policy = policyParts.length > 1 ? `thresh(1, ${policyParts.join(', ')})` : policyParts[0];
  return { miniscriptPhases, policy, keyInfoMap }; // miniscriptPhases w/ unique key identifier
};
