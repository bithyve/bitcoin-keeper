import { decodeToDataItem, DataItem } from './lib';
import { RegistryItem } from './RegistryItem';
import { RegistryTypes } from './RegistryType';

export class CryptoPSBT extends RegistryItem {
  getRegistryType = () => RegistryTypes.CRYPTO_PSBT;

  constructor(private psbt: Buffer) {
    super();
  }

  public getPSBT = () => this.psbt;

  public toDataItem = () => {
    return new DataItem(this.psbt);
  };

  public static fromDataItem = (dataItem: DataItem) => {
    const psbt = dataItem.getData();
    if (!psbt) {
      throw new Error(
        `#[ur-registry][CryptoPSBT][fn.fromDataItem]: decoded [dataItem][#data] is undefined: ${dataItem}`,
      );
    }
    return new CryptoPSBT(psbt);
  };

  public static fromCBOR = (_cborPayload: Buffer) => {
    const dataItem = decodeToDataItem(_cborPayload);
    return CryptoPSBT.fromDataItem(dataItem);
  };
}
