// cbor registry types: https://github.com/BlockchainCommons/Research/blob/master/papers/bcr-2020-006-urtypes.md
// Map<name, tag>

export class RegistryType {
  constructor(private type: string, private tag?: number) {}
  getTag = () => this.tag;
  getType = () => this.type;
}

export const RegistryTypes = {
  UUID: new RegistryType('uuid', 37),
  BYTES: new RegistryType('bytes', undefined),
  CRYPTO_HDKEY: new RegistryType('crypto-hdkey', 303),
  CRYPTO_KEYPATH: new RegistryType('crypto-keypath', 304),
  CRYPTO_COIN_INFO: new RegistryType('crypto-coin-info', 305),
  CRYPTO_ECKEY: new RegistryType('crypto-eckey', 306),
  CRYPTO_OUTPUT: new RegistryType('crypto-output', 308),
  CRYPTO_PSBT: new RegistryType('crypto-psbt', 310),
  CRYPTO_ACCOUNT: new RegistryType('crypto-account', 311),
  CRYPTO_MULTI_ACCOUNTS: new RegistryType("crypto-multi-accounts", 1103),
};
