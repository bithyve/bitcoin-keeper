export class ScriptExpression {
  constructor(private tag: number, private expression: string) {}

  public getTag = () => this.tag;
  public getExpression = () => this.expression;

  public static fromTag = (tag: number) => {
    const se = Object.values(ScriptExpressions).find(
      (se) => se.getTag() === tag,
    );
    return se;
  };
}

export const ScriptExpressions = {
  SCRIPT_HASH: new ScriptExpression(400, 'sh'),
  WITNESS_SCRIPT_HASH: new ScriptExpression(401, 'wsh'),
  PUBLIC_KEY: new ScriptExpression(402, 'pk'),
  PUBLIC_KEY_HASH: new ScriptExpression(403, 'pkh'),
  WITNESS_PUBLIC_KEY_HASH: new ScriptExpression(404, 'wpkh'),
  COMBO: new ScriptExpression(405, 'combo'),
  MULTISIG: new ScriptExpression(406, 'multi'),
  SORTED_MULTISIG: new ScriptExpression(407, 'sortedmulti'),
  ADDRESS: new ScriptExpression(307, 'addr'),
  RAW_SCRIPT: new ScriptExpression(408, 'raw'),
};
