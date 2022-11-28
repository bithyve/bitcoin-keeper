import { patchTags } from './utils';
import { RegistryTypes } from './RegistryType';
import { ScriptExpressions } from './ScriptExpression';

const registryTags = Object.values(RegistryTypes)
  .filter((r) => !!r.getTag())
  .map((r) => r.getTag());
const scriptExpressionTags = Object.values(ScriptExpressions).map((se) =>
  se.getTag(),
);
patchTags(registryTags.concat(scriptExpressionTags) as number[]);
