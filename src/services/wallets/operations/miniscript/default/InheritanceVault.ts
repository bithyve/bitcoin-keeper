import { getDerivationPath } from 'src/utils/service-utilities/utils';
import { MiniscriptElements, VaultScheme, VaultSigner } from '../../../interfaces/vault';
import { KeyInfo, Phase } from '../policy-generator';

export const INHERITANCE_VAULT_TIMELOCKS_TESTNET = {
  MONTHS_3: 3,
  MONTHS_6: 6,
  MONTHS_12: 12,
  MONTHS_18: 18,
  MONTHS_24: 24,
  MONTHS_30: 30,
  MONTHS_36: 36,
};

export const INHERITANCE_VAULT_TIMELOCKS_MAINNET = {
  MONTHS_3: 13140,
  MONTHS_6: 26280,
  MONTHS_12: 52560,
  MONTHS_18: 78840,
  MONTHS_24: 105120,
  MONTHS_30: 131400,
  MONTHS_36: 157680,
};

export const INHERITANCE_KEY1_IDENTIFIER = 'IK1';

/**
 * Generates the miniscript elements for the Inheritance Vault
 *
 * Miniscript Analysis(produced by the policy-lang generator based on the miniscript elements from the function below)
 *
 * or_d
 * * multi(m of n)
 * and_v
 * * v: multi(m of n+1)
 * * after(3493966)
 *
 * Resulting script structure(sample: 2 of 3 multisig w/ Inheritance)
 *
 * 2 <K1<0;1>> <K2<0;1>> <K3<0;1>> 3 OP_CHECKMULTISIG OP_IFDUP OP_NOTIF
 *   2 <K1<2;3>> <K2<2;3>> <K3<2;3>> <IK1<0;1>> 4 OP_CHECKMULTISIGVERIFY <4e5035>
 *   OP_CHECKLOCKTIMEVERIFY
 * OP_ENDIF
 */
export function generateInheritanceVaultElements(
  signers: VaultSigner[],
  inheritanceSigner: VaultSigner,
  scheme: VaultScheme,
  timelocks: number[]
): MiniscriptElements {
  // if (signers.length < 2) throw new Error('At least 2 signers are required for the Vault');
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
    identifier: INHERITANCE_KEY1_IDENTIFIER,
    descriptor: `[${inheritanceSigner.masterFingerprint}/${getDerivationPath(
      inheritanceSigner.derivationPath
    )}]${inheritanceSigner.xpub}`,
  };

  if (keysInfo.length !== scheme.n) throw new Error('Invalid inputs; scheme mismatch');

  const signerFingerprints = Object.fromEntries(
    [...signers, inheritanceSigner].map((signer, index) => [
      index < signers.length ? `K${index + 1}` : INHERITANCE_KEY1_IDENTIFIER,
      signer.masterFingerprint,
    ])
  );

  const [timelock] = timelocks;

  const phases: Phase[] = [
    {
      id: 1,
      timelock: 0,
      paths: [{ id: 1, threshold: scheme.m, keys: keysInfo }],
      requiredPaths: 1,
      probability: 9,
    },
    {
      id: 2,
      timelock,
      paths: [
        {
          id: 1,
          threshold: scheme.m,
          keys: scheme.m === 1 ? [inheritanceKeyInfo] : [...keysInfo, inheritanceKeyInfo],
        },
      ],
      requiredPaths: 1,
      probability: 1,
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
