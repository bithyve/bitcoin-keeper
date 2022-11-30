import './patchCBOR';
import { Buffer } from 'buffer/';
import { CryptoHDKey } from './CryptoHDKey';
import { CryptoKeypath } from './CryptoKeypath';
import {
  CryptoCoinInfo,
  Type as CryptoCoinInfoType,
  Network as CryptoCoinInfoNetwork,
} from './CryptoCoinInfo';
import { CryptoECKey } from './CryptoECKey';
import { Bytes } from './Bytes';
import { CryptoOutput } from './CryptoOutput';
import { CryptoPSBT } from './CryptoPSBT';
import { CryptoAccount } from './CryptoAccount';
import { URRegistryDecoder } from './Decoder';

import { MultiKey } from './MultiKey';

import { ScriptExpressions } from './ScriptExpression';
import { PathComponent } from './PathComponent';

import { RegistryItem } from './RegistryItem';
import { RegistryTypes, RegistryType } from './RegistryType';

import {
  addReader,
  addSemanticDecode,
  addSemanticEncode,
  addWriter,
  decodeToDataItem,
  encodeDataItem,
} from './lib';

export { DataItem } from './lib';

import { patchTags } from './utils';
import {CryptoMultiAccounts} from "./extended/CryptoMultiAccounts";

const URlib = {
  URRegistryDecoder,
  Bytes,
  CryptoAccount,
  CryptoHDKey,
  CryptoMultiAccounts,
  CryptoKeypath,
  CryptoCoinInfo,
  CryptoCoinInfoType,
  CryptoCoinInfoNetwork,
  CryptoECKey,
  CryptoOutput,
  CryptoPSBT,
  MultiKey,
  ScriptExpressions,
  PathComponent,
};

const cbor = {
  addReader,
  addSemanticDecode,
  addSemanticEncode,
  addWriter,
  patchTags,
};

const extend = {
  RegistryTypes,
  RegistryItem,
  RegistryType,

  decodeToDataItem,
  encodeDataItem,

  cbor,
};

export {
  URRegistryDecoder,
  Bytes,
  CryptoAccount,
  CryptoHDKey,
  CryptoMultiAccounts,
  CryptoKeypath,
  CryptoCoinInfo,
  CryptoCoinInfoType,
  CryptoCoinInfoNetwork,
  CryptoECKey,
  CryptoOutput,
  CryptoPSBT,
  MultiKey,
  ScriptExpressions,
  PathComponent,
  extend,
  Buffer
};

export * from './errors';
export * from './Decoder';
export * from './lib';
export * from './CryptoAccount'
export * from './CryptoPSBT'
export * from './CryptoHDKey'
export * from './extended/CryptoMultiAccounts'
export * from './CryptoOutput'
export * from './CryptoCoinInfo'
export * from './CryptoECKey'
export * from './MultiKey'
export * from './CryptoKeypath'
export * from './patchCBOR'
export * from './PathComponent'
export * from './RegistryItem'
export * from './RegistryType'
export * from './types'
export * from './utils'

export default URlib;
