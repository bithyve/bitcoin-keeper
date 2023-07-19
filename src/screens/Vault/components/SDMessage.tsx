import { SignerType } from 'src/core/wallets/enums';

function getSDMessage({ type }: { type: SignerType }) {
  switch (type) {
    case SignerType.COLDCARD:
    case SignerType.LEDGER:
    case SignerType.PASSPORT:
    case SignerType.BITBOX02:
    case SignerType.KEYSTONE: {
      return 'Register for full verification';
    }
    case SignerType.JADE: {
      return 'Optional registration';
    }
    case SignerType.KEEPER: {
      return 'Hot keys on other device';
    }
    case SignerType.MOBILE_KEY: {
      return 'Hot keys on this device';
    }
    case SignerType.POLICY_SERVER: {
      return 'Hot keys on the server';
    }
    case SignerType.SEEDSIGNER: {
      return 'Register during txn signing';
    }
    case SignerType.SEED_WORDS: {
      return 'Blind signer when sending';
    }
    case SignerType.TAPSIGNER: {
      return 'Blind signer, no verification';
    }
    case SignerType.TREZOR: {
      return 'Manually verify addresses';
    }
    case SignerType.OTHER_SD: {
      return 'Varies with different signer';
    }
    case SignerType.INHERITANCEKEY: {
      return '';
    }
    default:
      return null;
  }
}

export { getSDMessage };
