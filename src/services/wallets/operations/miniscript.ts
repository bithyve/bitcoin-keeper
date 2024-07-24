import { compilePolicy } from '@bitcoinerlab/miniscript';

export const generateMiniscript = (policy: string) => {
  const { miniscript, asm, issane } = compilePolicy(policy);
  return { miniscript, asm, issane };
};
