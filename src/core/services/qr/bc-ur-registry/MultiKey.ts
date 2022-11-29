import { CryptoECKey } from './CryptoECKey';
import { CryptoHDKey } from './CryptoHDKey';
import { DataItem } from './lib/DataItem';
import { RegistryItem } from './RegistryItem';
import { RegistryType, RegistryTypes } from './RegistryType';
import { DataItemMap } from './types';

enum Keys {
  threshold = 1,
  keys,
}

export class MultiKey extends RegistryItem {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  getRegistryType: () => RegistryType;

  constructor(
    private threshold: number,
    private keys: (CryptoECKey | CryptoHDKey)[],
  ) {
    super();
  }

  getThreshold = () => this.threshold;
  getKeys = () => this.keys;

  toDataItem = () => {
    const map: DataItemMap = {};
    map[Keys.threshold] = this.threshold;
    const keys: DataItem[] = this.keys.map((k) => {
      const dataItem = k.toDataItem();
      dataItem.setTag(k.getRegistryType().getTag());
      return dataItem;
    });
    map[Keys.keys] = keys;
    return new DataItem(map);
  };

  getOutputDescriptorContent = () => {
    return [this.getThreshold(),
      this.keys.map(k => k.getOutputDescriptorContent()).join(','),
    ].join(',');
  };

  static fromDataItem = (dataItem: DataItem) => {
    const map = dataItem.getData();
    const threshold = map[Keys.threshold];
    const _keys = map[Keys.keys] as DataItem[];
    const keys: (CryptoECKey | CryptoHDKey)[] = [];
    _keys.forEach((k) => {
      if (k.getTag() === RegistryTypes.CRYPTO_HDKEY.getTag()) {
        keys.push(CryptoHDKey.fromDataItem(k));
      } else if (k.getTag() === RegistryTypes.CRYPTO_ECKEY.getTag()) {
        keys.push(CryptoECKey.fromDataItem(k));
      }
    });
    return new MultiKey(threshold, keys);
  };
}
