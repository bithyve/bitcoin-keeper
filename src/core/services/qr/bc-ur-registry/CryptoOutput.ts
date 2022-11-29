import { CryptoECKey } from './CryptoECKey';
import { CryptoHDKey } from './CryptoHDKey';
import { decodeToDataItem, DataItem } from './lib';
import { MultiKey } from './MultiKey';
import { RegistryItem } from './RegistryItem';
import { RegistryTypes } from './RegistryType';
import { ScriptExpression, ScriptExpressions } from './ScriptExpression';

export class CryptoOutput extends RegistryItem {
  public getRegistryType = () => {
    return RegistryTypes.CRYPTO_OUTPUT;
  };

  constructor(
    private scriptExpressions: ScriptExpression[],
    private cryptoKey: CryptoHDKey | CryptoECKey | MultiKey,
  ) {
    super();
  }

  public getCryptoKey = () => this.cryptoKey;
  public getHDKey = () => {
    if (this.cryptoKey instanceof CryptoHDKey) {
      return this.cryptoKey as CryptoHDKey;
    } else {
      return undefined;
    }
  };
  public getECKey = () => {
    if (this.cryptoKey instanceof CryptoECKey) {
      return this.cryptoKey as CryptoECKey;
    } else {
      return undefined;
    }
  };

  public getMultiKey = () => {
    if (this.cryptoKey instanceof MultiKey) {
      return this.cryptoKey as MultiKey;
    } else {
      return undefined;
    }
  };

  public getScriptExpressions = () => this.scriptExpressions;

  private _toOutputDescriptor = (seIndex: number): string => {
    if (seIndex >= this.scriptExpressions.length) {
      return this.cryptoKey.getOutputDescriptorContent();
    } else {
      return `${this.scriptExpressions[seIndex].getExpression()}(${this._toOutputDescriptor(seIndex + 1)})`;
    }
  };

  public override toString = () => {
    return this._toOutputDescriptor(0);
  };

  toDataItem = () => {
    let dataItem = this.cryptoKey.toDataItem();
    if (
      this.cryptoKey instanceof CryptoECKey ||
      this.cryptoKey instanceof CryptoHDKey
    ) {
      dataItem.setTag(this.cryptoKey.getRegistryType().getTag());
    }

    const clonedSe = [...this.scriptExpressions];

    clonedSe.reverse().forEach((se) => {
      const tagValue = se.getTag();
      if (dataItem.getTag() === undefined) {
        dataItem.setTag(tagValue);
      } else {
        dataItem = new DataItem(dataItem, tagValue);
      }
    });

    return dataItem;
  };

  public static fromDataItem = (dataItem: DataItem) => {
    const scriptExpressions: ScriptExpression[] = [];
    let _dataItem = dataItem;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let _tag = _dataItem.getTag();
      const se = ScriptExpression.fromTag(_tag as number);
      if (se) {
        scriptExpressions.push(se);
        if (_dataItem.getData() instanceof DataItem) {
          _dataItem = _dataItem.getData();
          _tag = _dataItem.getTag();
        } else {
          break;
        }
      } else {
        break;
      }
    }
    const seLength = scriptExpressions.length;
    const isMultiKey =
      seLength > 0 &&
      (scriptExpressions[seLength - 1].getExpression() ===
        ScriptExpressions.MULTISIG.getExpression() ||
        scriptExpressions[seLength - 1].getExpression() ===
        ScriptExpressions.SORTED_MULTISIG.getExpression());
    //TODO: judge is multi key by scriptExpressions
    if (isMultiKey) {
      const multiKey = MultiKey.fromDataItem(_dataItem);
      return new CryptoOutput(scriptExpressions, multiKey);
    }

    if (_dataItem.getTag() === RegistryTypes.CRYPTO_HDKEY.getTag()) {
      const cryptoHDKey = CryptoHDKey.fromDataItem(_dataItem);
      return new CryptoOutput(scriptExpressions, cryptoHDKey);
    } else {
      const cryptoECKey = CryptoECKey.fromDataItem(_dataItem);
      return new CryptoOutput(scriptExpressions, cryptoECKey);
    }
  };

  public static fromCBOR = (_cborPayload: Buffer) => {
    const dataItem = decodeToDataItem(_cborPayload);
    return CryptoOutput.fromDataItem(dataItem);
  };
}
