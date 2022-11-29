import { decodeToDataItem, DataItem } from './lib';
import { RegistryItem } from './RegistryItem';
import { RegistryTypes } from './RegistryType';
import { DataItemMap } from './types';

enum Keys {
  type = '1',
  network = '2',
}

export enum Type {
  bitcoin = 0,
}

export enum Network {
  mainnet,
  testnet,
}

export class CryptoCoinInfo extends RegistryItem {
  getRegistryType = () => {
    return RegistryTypes.CRYPTO_COIN_INFO;
  };

  constructor(private type?: Type, private network?: Network) {
    super();
  }

  public getType = () => {
    return this.type || Type.bitcoin;
  };

  public getNetwork = () => {
    return this.network || Network.mainnet;
  };

  public toDataItem = () => {
    const map: DataItemMap = {};
    if (this.type) {
      map[Keys.type] = this.type;
    }
    if (this.network) {
      map[Keys.network] = this.network;
    }
    return new DataItem(map);
  };

  public static fromDataItem = (dataItem: DataItem) => {
    const map = dataItem.getData();
    const type = map[Keys.type];
    const network = map[Keys.network];
    return new CryptoCoinInfo(type, network);
  };

  public static fromCBOR = (_cborPayload: Buffer) => {
    const dataItem = decodeToDataItem(_cborPayload);
    return CryptoCoinInfo.fromDataItem(dataItem);
  };
}
