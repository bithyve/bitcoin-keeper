import { compilePolicy, compileMiniscript, satisfier } from '@bitcoinerlab/miniscript';

export enum ADVISOR_VAULT_ENTITIES {
  USER_KEY = 'UK',
  ADVISOR_KEY1 = 'ADVISOR_KEY1',
  ADVISOR_KEY2 = 'ADVISOR_KEY2',
}

export enum ADVISORY_VAULT_POLICY {
  USER_KEY = 'UK',
  ADVISOR_KEY1_1 = 'AK1_1',
  ADVISOR_KEY2_1 = 'AK2_1',
  ADVISOR_KEY1_2 = 'AK1_2',
  ADVISOR_KEY2_2 = 'AK2_2',
}

export const generateMiniscript = (policy: string) => {
  const { miniscript, asm, issane } = compilePolicy(policy);
  if (!issane) throw new Error('Miniscript is not sane');
  return { miniscript, asm, issane };
};

/*
issane is a boolean that indicates whether the Miniscript is valid and follows the consensus
and standardness rules for Bitcoin scripts. A sane Miniscript should have non-malleable solutions,
not mix different timelock units on a single branch of the script, and not contain duplicate keys.
In other words, it should be a well-formed and standards-compliant script that can be safely used in transactions.
*/
export const generateBitcoinScript = (miniscript: string) => {
  const { asm, issane } = compileMiniscript(miniscript);
  return { asm, issane };
};

export const generateScriptWitnesses = (policy: string) => {
  const { miniscript } = compilePolicy(policy);
  const { nonMalleableSats } = satisfier(miniscript);
  return { scriptWitnesses: nonMalleableSats };
};
