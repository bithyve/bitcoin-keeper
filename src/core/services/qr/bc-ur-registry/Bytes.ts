import { decodeToDataItem, DataItem } from './lib';
import { RegistryItem } from './RegistryItem';
import { RegistryTypes } from './RegistryType';

export class Bytes extends RegistryItem {
  getRegistryType = () => {
    return RegistryTypes.BYTES;
  };

  constructor(private bytes: Buffer) {
    super();
  }

  getData = () => this.bytes;

  toDataItem = () => {
    return new DataItem(this.bytes);
  };

  public static fromDataItem = (dataItem: DataItem) => {
    const bytes = dataItem.getData();
    if (!bytes) {
      throw new Error(
        `#[ur-registry][Bytes][fn.fromDataItem]: decoded [dataItem][#data] is undefined: ${dataItem}`,
      );
    }
    return new Bytes(bytes);
  };

  public static fromCBOR = (_cborPayload: Buffer) => {
    const dataItem = decodeToDataItem(_cborPayload);
    return Bytes.fromDataItem(dataItem);
  };
}
