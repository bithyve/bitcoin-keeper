import { compilePolicy, compileMiniscript, satisfier } from '@bitcoinerlab/miniscript';

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
