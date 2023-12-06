import { URDecoder } from '@ngraveio/bc-ur';
import {
  Bytes,
  CryptoAccount,
  CryptoCoinInfo,
  CryptoECKey,
  CryptoHDKey,
  CryptoKeypath,
  CryptoOutput,
  CryptoPSBT,
} from '..';
import { RegistryTypes } from '../RegistryType';
import { UnknownURTypeError } from '../errors';

export class URRegistryDecoder extends URDecoder {
  public resultRegistryType = () => {
    const ur = this.resultUR();
    switch (ur.type) {
      case RegistryTypes.BYTES.getType():
        return Bytes.fromCBOR(ur.cbor);
      case RegistryTypes.CRYPTO_HDKEY.getType():
        return CryptoHDKey.fromCBOR(ur.cbor);
      case RegistryTypes.CRYPTO_KEYPATH.getType():
        return CryptoKeypath.fromCBOR(ur.cbor);
      case RegistryTypes.CRYPTO_COIN_INFO.getType():
        return CryptoCoinInfo.fromCBOR(ur.cbor);
      case RegistryTypes.CRYPTO_ECKEY.getType():
        return CryptoECKey.fromCBOR(ur.cbor);
      case RegistryTypes.CRYPTO_OUTPUT.getType():
        return CryptoOutput.fromCBOR(ur.cbor);
      case RegistryTypes.CRYPTO_PSBT.getType():
        return CryptoPSBT.fromCBOR(ur.cbor);
      case RegistryTypes.CRYPTO_ACCOUNT.getType():
        return CryptoAccount.fromCBOR(ur.cbor);
      default:
        throw new UnknownURTypeError(
          `#[ur-registry][Decoder][fn.resultRegistryType]: registry type ${ur.type} is not supported now`,
        );
    }
  };
}
