import { encode } from 'bs58check';
import { CryptoCoinInfo } from './CryptoCoinInfo';
import { CryptoKeypath } from './CryptoKeypath';
import { decodeToDataItem, DataItem } from './lib';
import { RegistryItem } from './RegistryItem';
import { RegistryTypes } from './RegistryType';
import { DataItemMap, ICryptoKey } from './types';
import { PathComponent } from './PathComponent';

enum Keys {
  is_master = 1,
  is_private,
  key_data,
  chain_code,
  use_info,
  origin,
  children,
  parent_fingerprint,
  name,
  note,
}

type MasterKeyProps = {
  isMaster: true;
  key: Buffer;
  chainCode: Buffer;
};

type DeriveKeyProps = {
  isMaster: false;
  isPrivateKey?: boolean;
  key: Buffer;
  chainCode?: Buffer;
  useInfo?: CryptoCoinInfo;
  origin?: CryptoKeypath;
  children?: CryptoKeypath;
  parentFingerprint?: Buffer;
  name?: string;
  note?: string;
};

export class CryptoHDKey extends RegistryItem implements ICryptoKey {
  private master?: boolean;
  private privateKey?: boolean;
  private key?: Buffer;
  private chainCode?: Buffer;
  private useInfo?: CryptoCoinInfo;
  private origin?: CryptoKeypath;
  private children?: CryptoKeypath;
  private parentFingerprint?: Buffer;
  private name?: string;
  private note?: string;

  isECKey = () => {
    return false;
  };

  public getKey = () => this.key;
  public getChainCode = () => this.chainCode;
  public isMaster = () => this.master;
  public isPrivateKey = () => !!this.privateKey;
  public getUseInfo = () => this.useInfo;
  public getOrigin = () => this.origin;
  public getChildren = () => this.children;
  public getParentFingerprint = () => this.parentFingerprint;
  public getName = () => this.name;
  public getNote = () => this.note;
  public getBip32Key = () => {
    let version: Buffer;
    let depth: number;
    let index = 0;
    let parentFingerprint: Buffer = Buffer.alloc(4).fill(0);
    if (this.isMaster()) {
      // version bytes defined on https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#serialization-format
      version = Buffer.from('0488ADE4', 'hex');
      depth = 0;
      index = 0;
    } else {
      depth = this.getOrigin()?.getComponents().length || this.getOrigin()?.getDepth() as number;
      const paths = this.getOrigin()?.getComponents() as PathComponent[];
      const lastPath = paths[paths.length - 1];
      if (lastPath) {
        index = lastPath.isHardened() ? lastPath.getIndex()! + 0x80000000 : lastPath.getIndex()!;
        if (this.getParentFingerprint()) {
          parentFingerprint = this.getParentFingerprint() as Buffer;
        }
      }
      if (this.isPrivateKey()) {
        version = Buffer.from('0488ADE4', 'hex');
      } else {
        version = Buffer.from('0488B21E', 'hex');
      }
    }
    const depthBuffer = Buffer.alloc(1);
    depthBuffer.writeUInt8(depth, 0);
    const indexBuffer = Buffer.alloc(4);
    indexBuffer.writeUInt32BE(index, 0);
    const chainCode = this.getChainCode();
    const key = this.getKey();
    return encode(Buffer.concat([version, depthBuffer, parentFingerprint, indexBuffer, chainCode as Buffer, key as Buffer]));
  };

  public getRegistryType = () => {
    return RegistryTypes.CRYPTO_HDKEY;
  };

  public getOutputDescriptorContent = () => {
    let result = '';
    if (this.getOrigin()) {
      if (this.getOrigin()?.getSourceFingerprint() && this.getOrigin()?.getPath()) {
        result += `${this.getOrigin()?.getSourceFingerprint()?.toString('hex')}/${this.getOrigin()?.getPath()}`;
      }
    }
    result += this.getBip32Key();
    if (this.getChildren()) {
      if (this.getChildren()?.getPath()) {
        result += `/${this.getChildren()?.getPath()}`;
      }
    }
    return result;
  };

  constructor(args: DeriveKeyProps | MasterKeyProps) {
    super();
    if (args.isMaster) {
      this.setupMasterKey(args);
    } else {
      this.setupDeriveKey(args as DeriveKeyProps);
    }
  }

  private setupMasterKey = (args: MasterKeyProps) => {
    this.master = true;
    this.key = args.key;
    this.chainCode = args.chainCode;
  };

  private setupDeriveKey = (args: DeriveKeyProps) => {
    this.master = false;
    this.privateKey = args.isPrivateKey;
    this.key = args.key;
    this.chainCode = args.chainCode;
    this.useInfo = args.useInfo;
    this.origin = args.origin;
    this.children = args.children;
    this.parentFingerprint = args.parentFingerprint;
    this.name = args.name;
    this.note = args.note;
  };

  public toDataItem = () => {
    const map: DataItemMap = {};
    if (this.master) {
      map[Keys.is_master] = true;
      map[Keys.key_data] = this.key;
      map[Keys.chain_code] = this.chainCode;
    } else {
      if (this.privateKey !== undefined) {
        map[Keys.is_private] = this.privateKey;
      }
      map[Keys.key_data] = this.key;
      if (this.chainCode) {
        map[Keys.chain_code] = this.chainCode;
      }
      if (this.useInfo) {
        const useInfo = this.useInfo.toDataItem();
        useInfo.setTag(this.useInfo.getRegistryType().getTag());
        map[Keys.use_info] = useInfo;
      }
      if (this.origin) {
        const origin = this.origin.toDataItem();
        origin.setTag(this.origin.getRegistryType().getTag());
        map[Keys.origin] = origin;
      }
      if (this.children) {
        const children = this.children.toDataItem();
        children.setTag(this.children.getRegistryType().getTag());
        map[Keys.children] = children;
      }
      if (this.parentFingerprint) {
        map[Keys.parent_fingerprint] = this.parentFingerprint.readUInt32BE(0);
      }
      if (this.name !== undefined) {
        map[Keys.name] = this.name;
      }
      if (this.note !== undefined) {
        map[Keys.note] = this.note;
      }
    }
    return new DataItem(map);
  };

  public static fromDataItem = (dataItem: DataItem) => {
    const map = dataItem.getData();
    const isMaster = !!map[Keys.is_master];
    const isPrivateKey = map[Keys.is_private];
    const key = map[Keys.key_data];
    const chainCode = map[Keys.chain_code];
    const useInfo = map[Keys.use_info]
      ? CryptoCoinInfo.fromDataItem(map[Keys.use_info])
      : undefined;
    const origin = map[Keys.origin]
      ? CryptoKeypath.fromDataItem(map[Keys.origin])
      : undefined;
    const children = map[Keys.children]
      ? CryptoKeypath.fromDataItem(map[Keys.children])
      : undefined;
    const _parentFingerprint = map[Keys.parent_fingerprint];
    let parentFingerprint: Buffer | undefined = undefined;
    if (_parentFingerprint) {
      parentFingerprint = Buffer.alloc(4);
      parentFingerprint.writeUInt32BE(_parentFingerprint, 0);
    }
    const name = map[Keys.name];
    const note = map[Keys.note];

    return new CryptoHDKey({
      isMaster,
      isPrivateKey,
      key,
      chainCode,
      useInfo,
      origin,
      children,
      parentFingerprint,
      name,
      note,
    });
  };

  public static fromCBOR = (_cborPayload: Buffer) => {
    const dataItem = decodeToDataItem(_cborPayload);
    return CryptoHDKey.fromDataItem(dataItem);
  };
}
