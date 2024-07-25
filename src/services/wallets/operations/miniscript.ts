import { compilePolicy, compileMiniscript } from '@bitcoinerlab/miniscript';

export const generateMiniscript = (policy: string) => {
  const { miniscript, issane } = compilePolicy(policy);
  return { miniscript, issane };
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
